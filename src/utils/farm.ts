import {Buffer} from 'buffer';
import { bool, publicKey, u32,struct,  u64, u8} from '@project-serum/borsh'
// @ts-ignore
import { nu64 } from 'buffer-layout'
import {Connection, SYSVAR_CLOCK_PUBKEY} from '@solana/web3.js';
import {
  Account,
  AccountInfo,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

import {sendAndConfirmTransaction} from './send-and-confirm-transaction';
import {loadAccount} from './account';
import { AccountLayout, MintLayout, TOKEN_PROGRAM_ID } from '@solana/spl-token';
import { createSplAccount } from './new_fcn';
import { sendTransaction } from './web3';
import { FARM_PROGRAM_ID } from './ids';

enum FarmInstruction
{
  Initialize = 0,
  Deposit,
  Withdraw,
}

export const FarmAccountLayout = struct([
  u8('nonce'),
  publicKey('pool_lp_token_account'),
  publicKey('pool_reward_token_account'),
  publicKey('pool_mint_address'),
  publicKey('reward_mint_address'),
  publicKey('token_program_id'),
  publicKey('owner'),
  publicKey('fee_owner'),
  u64('reward_per_share_net'),
  u64('last_timestamp'),
  u64('reward_per_timestamp'),
  u64('start_timestamp'),
  u64('end_timestamp'),
]);
export const UserInfoAccountLayout = struct([
  publicKey('wallet'),
  publicKey('farm_id'),
  u64('deposit_balance'),
  u64('reward_debt'),
]);
export class UserInfo {
  constructor(
    public userInfoId:PublicKey,
    public wallet: PublicKey,
    public farmId: PublicKey,
    public depositBalance:nu64,
    public rewardDebt:nu64,
  ){
    this.wallet = wallet;
    this.farmId = farmId;
    this.depositBalance = depositBalance;
    this.rewardDebt = rewardDebt;
  }
  /**
   * Get the minimum balance for the user info account to be rent exempt
   *
   * @return Number of lamports required
   */
   static async getMinBalanceRentForExemptUserInfo(
    connection: Connection,
  ): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(
      UserInfoAccountLayout.span,
    );
  }
}
/**
 * A program for farm
 */
export class YieldFarm {
  public paidAdditionalFee:boolean = false;
  public rewardPerTimestamp: nu64 = 0;
  public rewardPerShareNet: nu64 = 0;
  public lastTimestamp: nu64 = 0;
  constructor(
    private connection: Connection,
    public farmId: PublicKey,
    public farmProgramId: PublicKey,
    public tokenProgramId: PublicKey,
    public lpTokenPoolMint: PublicKey,
    public rewardTokenPoolMint: PublicKey,
    public authority: PublicKey,
    public poolRewardTokenAccount: PublicKey,
    public poolLpTokenAccount: PublicKey,
    public nonce: number,
    public startTimestamp: nu64,
    public endTimestamp: nu64,
    public creator: Account,
  ) {
    this.connection = connection;
    this.farmId = farmId;
    this.farmProgramId = farmProgramId;
    this.tokenProgramId = tokenProgramId;
    this.lpTokenPoolMint = lpTokenPoolMint;
    this.rewardTokenPoolMint = rewardTokenPoolMint;
    this.authority = authority;
    this.poolRewardTokenAccount = poolRewardTokenAccount;
    this.poolLpTokenAccount = poolLpTokenAccount;
    this.nonce = nonce;
    this.startTimestamp = startTimestamp;
    this.endTimestamp = endTimestamp;
    this.creator = creator;
  }

  /**
   * Get the minimum balance for the farm account to be rent exempt
   *
   * @return Number of lamports required
   */
  static async getMinBalanceRentForExemptStakePool(
    connection: Connection,
  ): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(
      FarmAccountLayout.span,
    );
  }

  static createInitFarmInstruction(
    farmAccount: Account, // farm account 
    authority: PublicKey, //farm authority
    creator: Account,
    poolLpTokenAccount: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolMintAddress: PublicKey,
    rewardMintAddress: PublicKey,
    tokenProgramId: PublicKey,
    nonce: number,
    farmProgramId: PublicKey,
    startTimestamp: number,
    endTimestamp: number,
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmAccount.publicKey, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: creator.publicKey, isSigner: true, isWritable: false},
      {pubkey: poolLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolMintAddress, isSigner: false, isWritable: false},
      {pubkey: rewardMintAddress, isSigner: false, isWritable: false},
      {pubkey: tokenProgramId, isSigner: false, isWritable: false},
      
    ];
    const commandDataLayout = struct([
      u8('instruction'),
      u8('nonce'),
      nu64("start_timestamp"),
      nu64("end_timestamp"),
    ]); 
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: FarmInstruction.Initialize, // Initialize instruction
          nonce,
          start_timestamp: startTimestamp,
          end_timestamp: endTimestamp,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: farmProgramId,
      data,
    });
  }
  static async getFilteredProgramAccounts(
    connection: Connection,
    programId: PublicKey,
    filters: any
  ): Promise<{ publicKey: PublicKey; accountInfo: AccountInfo<Buffer> }[]> {
    // @ts-ignore
    const resp = await connection._rpcRequest('getProgramAccounts', [
      programId.toBase58(),
      {
        commitment: connection.commitment,
        filters,
        encoding: 'base64'
      }
    ])
    if (resp.error) {
      throw new Error(resp.error.message)
    }
    // @ts-ignore
    return resp.result.map(({ pubkey, account: { data, executable, owner, lamports } }) => ({
      publicKey: new PublicKey(pubkey),
      accountInfo: {
        data: Buffer.from(data[0], 'base64'),
        executable,
        owner: new PublicKey(owner),
        lamports
      }
    }))
  }
  static async findUserInfoAccount(
    connection:Connection,
    farmProgramId:PublicKey,
    farmId:PublicKey,
    owner:PublicKey,
  ):Promise<UserInfo>{
    // stake user info account
    const filters = [
      {
        memcmp: {
          offset: 0,
          bytes: owner.toBase58()
        }
      },
      {
        dataSize: UserInfoAccountLayout.span
      }
    ]
    let farmUserAccountInfos = await YieldFarm.getFilteredProgramAccounts(connection, farmProgramId, filters)
    let userInfo:any;
    farmUserAccountInfos.forEach((farmUserAccountInfo) => {
      
      const { data} = farmUserAccountInfo.accountInfo
      
      const userInfoData = UserInfoAccountLayout.decode(data)
      
      const wallet = userInfoData.wallet;
      const _farmId = userInfoData.farmId.toBase58();
      const depositBalance = userInfoData.deposit_balance;
      const rewardDebt = userInfoData.reward_debt

      if(_farmId == farmId.toBase58())
      {
        userInfo = new UserInfo(farmUserAccountInfo.publicKey,wallet,farmId,depositBalance,rewardDebt);
      }
    })
    return userInfo;
    
  }
  static async findOrCreateUserInfoAccount(
    connection:Connection,
    farmProgramId:PublicKey,
    farmId:PublicKey,
    owner: Account,
  ):Promise<UserInfo> {
    let userInfo = await YieldFarm.findUserInfoAccount(connection,farmProgramId,farmId,owner.publicKey);
    if(userInfo != undefined){
      return userInfo;
    }

    // Allocate memory for the account
    const balanceNeeded = await YieldFarm.getMinBalanceRentForExemptStakePool(
      connection,
    );
    const newAccount = new Account();
    let transaction = new Transaction();
    
    transaction.add(
      SystemProgram.createAccount({ 
        fromPubkey: owner.publicKey,
        newAccountPubkey: newAccount.publicKey,
        lamports: balanceNeeded,
        space: UserInfoAccountLayout.span,
        programId: farmProgramId,
      }),
    );

    await sendAndConfirmTransaction(
      'create UserInfo Account',
      connection,
      transaction,
      owner,
      newAccount,
    );
    return new UserInfo(
      newAccount.publicKey,
      owner.publicKey,
      farmId,
      0,
      0,
    );
  }
  static async loadFarm(
    connection: Connection,
    farmId: PublicKey,
    farmProgramId: PublicKey,
  ): Promise<YieldFarm> {
    const data = await loadAccount(connection, farmId, farmProgramId);
    const farmData = FarmAccountLayout.decode(data);
    const [authority] = await PublicKey.findProgramAddress(
      [farmId.toBuffer()],
      farmProgramId,
    );
    const nonce: number = farmData.nonce;
    const poolLpTokenAccount = farmData.pool_lp_token_account;
    const poolRewardTokenAccount = farmData.pool_reward_token_account;
    const lpTokenPoolMint = farmData.pool_mint_address;
    const rewardTokenPoolMint = farmData.reward_mint_address;
    const tokenProgramId = farmData.token_program_id;
    const owner = farmData.owner;
    const rewardPerShareNet:number = farmData.reward_per_share_net;
    const lastTimestamp = farmData.last_timestamp;
    const rewardPerTimestamp = farmData.reward_per_timestamp;
    const startTimestamp = farmData.start_timestamp;
    const endTimestamp = farmData.end_timestamp;

    let farm = new YieldFarm(
      connection,
      farmId,
      farmProgramId,
      tokenProgramId,
      lpTokenPoolMint, 
      rewardTokenPoolMint,
      authority, 
      poolRewardTokenAccount, 
      poolLpTokenAccount, 
      nonce, 
      startTimestamp,
      endTimestamp,
      owner
    );
    farm.rewardPerShareNet = rewardPerShareNet;
    farm.lastTimestamp = lastTimestamp;
    farm.rewardPerTimestamp = rewardPerTimestamp;
    return farm;
  }
  static async createSPLTokenAccount(
    connection:Connection,
    payer:Account,
    owner:PublicKey,
    mint: PublicKey
  ){
    let instructions: TransactionInstruction[] = [];
    let accountRentExempt = await connection.getMinimumBalanceForRentExemption(
        MintLayout.span
      );
    let poolRewardTokenAccount = await createSplAccount(
      instructions,
      payer.publicKey,
      accountRentExempt,
      mint,
      owner,
      AccountLayout.span
    );
    let transaction = new Transaction()
      instructions.forEach((instruction)=>{
        transaction.add(instruction)
      });
    let tx = await sendTransaction(connection, payer, transaction, [
      poolRewardTokenAccount,
    ]);

    return poolRewardTokenAccount;
  }
  static async createFarmWithParams(
    connection:Connection,
    wallet:any,
    rewardMintPubkey:PublicKey,
    lpMintPubkey:PublicKey,
    startTimestamp:number,
    endTimestamp:number,
  ){
    const farmAccount = new Account();
    const farmProgramId = new PublicKey(FARM_PROGRAM_ID);

    let [authority, nonce] = await PublicKey.findProgramAddress(
      [farmAccount.publicKey.toBuffer()],
      farmProgramId,
    );

    
    let poolRewardTokenAccount = await YieldFarm.createSPLTokenAccount(
      connection,
      wallet,
      authority,
      rewardMintPubkey
    );
    
    let poolLpTokenAccount = await YieldFarm.createSPLTokenAccount(
      connection,
      wallet,
      authority,
      lpMintPubkey
    );
    

    return await YieldFarm.createFarm(
      connection,
      farmAccount,
      farmProgramId,
      TOKEN_PROGRAM_ID,
      lpMintPubkey,
      rewardMintPubkey,
      authority,
      poolRewardTokenAccount.publicKey,
      poolLpTokenAccount.publicKey,
      nonce,
      startTimestamp,
      endTimestamp,
      wallet
    );
  }
  static async createFarm(
    connection: Connection,
    farmAccount: Account,
    farmProgramId: PublicKey,
    tokenProgramId: PublicKey,
    lpTokenPoolMint: PublicKey,
    rewardTokenPoolMint: PublicKey,
    authority: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolLpTokenAccount: PublicKey,
    nonce: number,
    startTimestamp:number,
    endTimestamp:number,
    creator: Account,
  ): Promise<YieldFarm> {
    let transaction;
    const farm = new YieldFarm(
      connection,
      farmAccount.publicKey,
      farmProgramId,
      tokenProgramId,
      lpTokenPoolMint, 
      rewardTokenPoolMint, 
      authority, 
      poolRewardTokenAccount, 
      poolLpTokenAccount, 
      nonce, 
      startTimestamp,
      endTimestamp,
      creator
    );

    // Allocate memory for the account
    const balanceNeeded = await YieldFarm.getMinBalanceRentForExemptStakePool(
      connection,
    );
    transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({ 
        fromPubkey: creator.publicKey,
        newAccountPubkey: farmAccount.publicKey,
        lamports: balanceNeeded,
        space: FarmAccountLayout.span,
        programId: farmProgramId,
      }),
    );

    const instruction = YieldFarm.createInitFarmInstruction(
      farmAccount,
      authority, 
      creator, 
      poolLpTokenAccount,  
      poolRewardTokenAccount, 
      lpTokenPoolMint, 
      rewardTokenPoolMint, 
      tokenProgramId,
      nonce, 
      farmProgramId,
      startTimestamp,
      endTimestamp,
    );
    transaction.add(instruction);

    let tx = await sendTransaction(connection, creator, transaction, [
      farmAccount,
    ]);

    //check transaction

    return farm;
  }
  
  public async deposit( 
    owner: Account,
    userTransferAuthority: Account,
    userRewardTokenAccount: PublicKey,
    userLpTokenAccount: PublicKey, 
    amount: number,
  ) {

    let userInfo = await YieldFarm.findOrCreateUserInfoAccount(this.connection,this.farmProgramId,this.farmId, owner)

    let transaction;
    transaction = new Transaction();
    const instruction = YieldFarm.createDepositInstruction(
      this.farmId,
      this.authority,
      owner,
      userInfo.userInfoId,
      userTransferAuthority.publicKey,
      userLpTokenAccount,
      userRewardTokenAccount,
      this.poolLpTokenAccount,
      this.poolRewardTokenAccount,
      this.lpTokenPoolMint,
      this.rewardTokenPoolMint,
      this.tokenProgramId,
      this.farmProgramId,
      amount,
    );
    transaction.add(instruction);

    
    await sendAndConfirmTransaction(
      'deposit',
      this.connection,
      transaction,
      owner,
      userTransferAuthority,
    );
  }
  static createDepositInstruction(
    farmId: PublicKey, // farm account 
    authority: PublicKey, //farm authority
    owner: Account,
    userInfoAccount:PublicKey,
    userTransferAuthority: PublicKey,
    userLpTokenAccount: PublicKey,
    userRewardTokenAccount: PublicKey,
    poolLpTokenAccount: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolLpTokenMint: PublicKey,
    poolRewardTokenMint: PublicKey,
    tokenProgramId: PublicKey,
    farmProgramId: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmId, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: owner.publicKey, isSigner: true, isWritable: false},
      {pubkey: userInfoAccount, isSigner: false, isWritable: true},
      {pubkey: userTransferAuthority, isSigner: true, isWritable: false},
      {pubkey: userLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: userRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenMint, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenMint, isSigner: false, isWritable: true},
      {pubkey: tokenProgramId, isSigner: false, isWritable: false},
      {pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false},
    ];
    const commandDataLayout = struct([
      u8('instruction'),
      nu64('amount'),
    ]); 
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: FarmInstruction.Deposit, // Initialize instruction
          amount:amount,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: farmProgramId,
      data,
    });
  }
  public async withdraw( 
    owner:Account,
    userTransferAuthority: Account,
    userRewardTokenAccount: PublicKey,
    userLpTokenAccount: PublicKey,
    amount: number,
  ) {
    let userInfo = await YieldFarm.findOrCreateUserInfoAccount(this.connection,this.farmProgramId,this.farmId, owner)

    let transaction;
    transaction = new Transaction();

    const instruction = YieldFarm.createWithdrawInstruction(
      this.farmId,
      this.authority,
      owner,
      userInfo.userInfoId,
      userTransferAuthority.publicKey,
      userLpTokenAccount,
      userRewardTokenAccount,
      this.poolLpTokenAccount,
      this.poolRewardTokenAccount,
      this.lpTokenPoolMint,
      this.rewardTokenPoolMint,
      this.tokenProgramId,
      this.farmProgramId,
      amount,
    );
    transaction.add(instruction);

    
    await sendAndConfirmTransaction(
      'withdraw',
      this.connection,
      transaction,
      owner,
      userTransferAuthority,
    );
  }
  static createWithdrawInstruction(
    farmId: PublicKey, // farm account 
    authority: PublicKey, //farm authority
    owner: Account,
    userInfoAccount: PublicKey,
    userTransferAuthority: PublicKey,
    userLpTokenAccount: PublicKey,
    userRewardTokenAccount: PublicKey,
    poolLpTokenAccount: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolLpTokenMint: PublicKey,
    poolRewardTokenMint: PublicKey,
    tokenProgramId: PublicKey,
    farmProgramId: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmId, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: owner.publicKey, isSigner: true, isWritable: false},
      {pubkey: userInfoAccount, isSigner: false, isWritable: true},
      {pubkey: userTransferAuthority, isSigner: true, isWritable: false},
      {pubkey: userLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: userRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenMint, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenMint, isSigner: false, isWritable: true},
      {pubkey: tokenProgramId, isSigner: false, isWritable: false},
      {pubkey: SYSVAR_CLOCK_PUBKEY, isSigner: false, isWritable: false},
    ];
    const commandDataLayout = struct([
      u8('instruction'),
      nu64('amount'),
    ]); 
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: FarmInstruction.Withdraw, // Initialize instruction
          amount:amount,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: farmProgramId,
      data,
    });
  }
}
