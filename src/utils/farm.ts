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
import { createAssociatedTokenAccountIfNotExist, createProgramAccountIfNotExist, findAssociatedTokenAddress, sendTransaction } from './web3';
import { FARM_PROGRAM_ID } from './ids';
import { FarmInfo } from './farms';
import { getBigNumber } from './layouts';
import { TokenAmount } from './safe-math';


export const PAY_FARM_FEE = 5000;

export const LOCKED_TOKENA_LIST = [
  "CRP",
  "USDC",
  "USDT",
  "SOL",
  "ETH"
]
export const ALLOWED_TOKENB_LIST = [
  "CRP",
  "USDC",
]
enum FarmInstruction
{
  Initialize = 0,
  Deposit,
  Withdraw,
  AddReward,
  PayFarmFee,
}

export const FarmAccountLayout = struct([
  u8('is_allowed'),
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
  public isAllowed:boolean = false;
  public rewardPerTimestamp: nu64 = 0;
  public rewardPerShareNet: nu64 = 0;
  public lastTimestamp: nu64 = 0;
  public feeOwner:PublicKey | any;

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
    ammPubkey: PublicKey,
    tokenProgramId: PublicKey,
    nonce: number,
    farmProgramId: PublicKey,
    startTimestamp: number,
    endTimestamp: number,
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmAccount.publicKey, isSigner: true, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: creator.publicKey, isSigner: false, isWritable: false},
      {pubkey: poolLpTokenAccount, isSigner: true, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: true, isWritable: true},
      {pubkey: poolMintAddress, isSigner: false, isWritable: false},
      {pubkey: rewardMintAddress, isSigner: false, isWritable: false},
      {pubkey: ammPubkey, isSigner: false, isWritable: false},
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
    const isAllowed = farmData.is_allowed;
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
    const feeOwner = farmData.fee_owner;

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
    farm.feeOwner = feeOwner;
    
    if(isAllowed > 0)
    {
      farm.isAllowed = true;
    }
    else{
      farm.isAllowed = false;
    }
    return farm;
  }
  static async createSPLTokenAccount(
    instructions:TransactionInstruction[],
    connection:Connection,
    payer:Account,
    owner:PublicKey,
    mint: PublicKey
  ){
    
    let accountRentExempt = await connection.getMinimumBalanceForRentExemption(
        MintLayout.span
      );
    let newTokenAccount = await createSplAccount(
      instructions,
      payer.publicKey,
      accountRentExempt,
      mint,
      owner,
      AccountLayout.span
    );
    return newTokenAccount;
  }
  static async createFarmWithParams(
    connection:Connection,
    wallet:any,
    rewardMintPubkey:PublicKey,
    lpMintPubkey:PublicKey,
    ammPubkey:PublicKey,
    startTimestamp:number,
    endTimestamp:number,
  ){
    const farmAccount = new Account();
    const farmProgramId = new PublicKey(FARM_PROGRAM_ID);

    let [authority, nonce] = await PublicKey.findProgramAddress(
      [farmAccount.publicKey.toBuffer()],
      farmProgramId,
    );
    return await YieldFarm.createFarm(
      connection,
      farmAccount,
      farmProgramId,
      TOKEN_PROGRAM_ID,
      lpMintPubkey,
      rewardMintPubkey,
      ammPubkey,
      authority,
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
    ammPubkey: PublicKey,
    authority: PublicKey,
    nonce: number,
    startTimestamp:number,
    endTimestamp:number,
    creator: Account,
  ): Promise<YieldFarm> {
    let instructions: TransactionInstruction[] = [];
    
    const accountRentExempt = await connection.getMinimumBalanceForRentExemption(
      AccountLayout.span
    );
    let poolRewardTokenAccount = await createSplAccount(
      instructions,
      creator.publicKey,
      accountRentExempt,
      rewardTokenPoolMint,
      authority,
      AccountLayout.span
    );

    let poolLpTokenAccount = await createSplAccount(
      instructions,
      creator.publicKey,
      accountRentExempt,
      lpTokenPoolMint,
      authority,
      AccountLayout.span
    );

    // Allocate memory for the account
    const balanceNeeded = await YieldFarm.getMinBalanceRentForExemptStakePool(
      connection,
    );
    instructions.push(
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
      poolLpTokenAccount.publicKey,  
      poolRewardTokenAccount.publicKey, 
      lpTokenPoolMint, 
      rewardTokenPoolMint, 
      ammPubkey, 
      tokenProgramId,
      nonce, 
      farmProgramId,
      startTimestamp,
      endTimestamp,
    );
    instructions.push(instruction);

    let transaction = new Transaction()
    instructions.forEach((inst)=>{
      transaction.add(inst)
    });

    let tx = await sendTransaction(connection, creator, transaction, [
      poolRewardTokenAccount,
      poolLpTokenAccount,
      farmAccount,
    ]);

    //check transation

    const farm = new YieldFarm(
      connection,
      farmAccount.publicKey,
      farmProgramId,
      tokenProgramId,
      lpTokenPoolMint, 
      rewardTokenPoolMint, 
      authority, 
      poolRewardTokenAccount.publicKey, 
      poolLpTokenAccount.publicKey, 
      nonce, 
      startTimestamp,
      endTimestamp,
      creator
    );
    return farm;
  }
  public async addReward( 
    owner: Account,
    userRewardTokenAccount: PublicKey,
    amount: number,
  ) {
    let transaction;
    transaction = new Transaction();
    const instruction = YieldFarm.createAddRewardInstruction(
      this.farmId,
      this.authority,
      owner,
      owner.publicKey,
      userRewardTokenAccount,
      this.poolRewardTokenAccount,
      this.lpTokenPoolMint,
      this.tokenProgramId,
      this.farmProgramId,
      amount,
    );
    transaction.add(instruction);
    
      
    let tx = await sendTransaction(this.connection, owner, transaction, [
      
    ]);
    return tx;
    //check transation

    /*
    await sendAndConfirmTransaction(
      'deposit',
      this.connection,
      transaction,
      owner,
      owner
    );
    */
  }
  static createAddRewardInstruction(
    farmId: PublicKey, // farm account 
    authority: PublicKey, //farm authority
    depositor: Account,
    userTransferAuthority: PublicKey,
    userRewardTokenAccount: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolMint: PublicKey,
    tokenProgramId: PublicKey,
    farmProgramId: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmId, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: depositor.publicKey, isSigner: false, isWritable: false},
      {pubkey: userTransferAuthority, isSigner: false, isWritable: false},
      {pubkey: userRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolMint, isSigner: false, isWritable: true},
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
          instruction: FarmInstruction.AddReward, // Initialize instruction
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
  public async payFarmFee(
    owner: Account,
    userUSDCTokenAccount: PublicKey,
    amount: number,
  ) {
    let transaction;
    transaction = new Transaction();
    const instruction = YieldFarm.createPayFarmFeeInstruction(
      this.farmId,
      this.authority,
      owner,
      owner.publicKey,
      userUSDCTokenAccount,
      this.feeOwner,
      this.tokenProgramId,
      this.farmProgramId,
      amount,
    );
    transaction.add(instruction);

    
    let tx = await sendTransaction(this.connection, owner, transaction, [
      
    ]);
    return tx;
    //check transation
  }
  static createPayFarmFeeInstruction(
    farmId: PublicKey, // farm account 
    authority: PublicKey, //farm authority
    depositor: Account,
    userTransferAuthority: PublicKey,
    userUSDCTokenAccount: PublicKey,
    ownerFeeAccount: PublicKey,
    tokenProgramId: PublicKey,
    farmProgramId: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmId, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: depositor.publicKey, isSigner: false, isWritable: false},
      {pubkey: userTransferAuthority, isSigner: false, isWritable: false},
      {pubkey: userUSDCTokenAccount, isSigner: false, isWritable: true},
      {pubkey: ownerFeeAccount, isSigner: false, isWritable: true},
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
          instruction: FarmInstruction.PayFarmFee, // Initialize instruction
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
  public static async  deposit( 
    connection: Connection,
    wallet: any ,
    farmInfo: FarmInfo,
    lpAccount: string | undefined | null,
    rewardAccount: string | undefined | null,
    infoAccount: string | undefined | null,
    amount: string | number
  ) {
    const value = getBigNumber(new TokenAmount(amount, farmInfo.lp.decimals, false).wei)
    const transaction = new Transaction()
    const signers: any = []
    const owner = wallet.publicKey
    const atas: string[] = []
    const programId = new PublicKey(farmInfo.programId)
    const farmId = new PublicKey(farmInfo.poolId)
    const userLpAccount = await createAssociatedTokenAccountIfNotExist(
      lpAccount,
      owner,
      farmInfo.lp.mintAddress,
      transaction,
      atas
    )

    // if no account, create new one
    const userRewardTokenAccount = await createAssociatedTokenAccountIfNotExist(
      rewardAccount,
      owner,
      farmInfo.reward.mintAddress,
      transaction,
      atas
    )

    // if no userinfo account, create new one
    
    const userInfoAccount = await createProgramAccountIfNotExist(
      connection,
      infoAccount,
      owner,
      programId,
      null,
      UserInfoAccountLayout,
      transaction,
      signers
    )
    let [authority, nonce] = await PublicKey.findProgramAddress(
      [farmId.toBuffer()],
      programId,
    );

    const fetchFarm = await YieldFarm.loadFarm(
      connection,
      farmId,
      programId
    )
    const rewardFeeATA = await findAssociatedTokenAddress(fetchFarm.feeOwner, new PublicKey(farmInfo.reward.mintAddress))
    console.log("rewareFeeATA",rewardFeeATA.toBase58())
    const instruction = YieldFarm.createDepositInstruction(
      farmId,
      authority,
      owner,
      userInfoAccount,
      owner,
      userLpAccount,
      userRewardTokenAccount,
      new PublicKey(farmInfo.poolLpTokenAccount),
      new PublicKey(farmInfo.poolRewardTokenAccount),
      new PublicKey(farmInfo.lp.mintAddress),
      rewardFeeATA,
      TOKEN_PROGRAM_ID,
      programId,
      value,
    );
    transaction.add(instruction);

    
    return await sendTransaction(connection, wallet, transaction, signers);
  }
  
  
  public static async withdraw( 
    connection: Connection,
    wallet: any ,
    farmInfo: FarmInfo,
    lpAccount: string | undefined | null,
    rewardAccount: string | undefined | null,
    infoAccount: string | undefined | null,
    amount: string
  ) {
    const value = getBigNumber(new TokenAmount(amount, farmInfo.lp.decimals, false).wei)
    const transaction = new Transaction()
    const signers: any = []
    const owner = wallet.publicKey
    const atas: string[] = []
    const programId = new PublicKey(farmInfo.programId)
    const farmId = new PublicKey(farmInfo.poolId)

    const userLpAccount = await createAssociatedTokenAccountIfNotExist(
      lpAccount,
      owner,
      farmInfo.lp.mintAddress,
      transaction,
      atas
    )

    // if no account, create new one
    const userRewardTokenAccount = await createAssociatedTokenAccountIfNotExist(
      rewardAccount,
      owner,
      farmInfo.reward.mintAddress,
      transaction,
      atas
    )

    // if no userinfo account, create new one
    
    const userInfoAccount = await createProgramAccountIfNotExist(
      connection,
      infoAccount,
      owner,
      programId,
      null,
      UserInfoAccountLayout,
      transaction,
      signers
    )
    let [authority, nonce] = await PublicKey.findProgramAddress(
      [farmId.toBuffer()],
      programId,
    );

    const fetchFarm = await YieldFarm.loadFarm(
      connection,
      farmId,
      programId
    )
    const rewardFeeATA = await findAssociatedTokenAddress(fetchFarm.feeOwner, new PublicKey(farmInfo.reward.mintAddress))
    
    const instruction = YieldFarm.createWithdrawInstruction(
      farmId,
      authority,
      owner,
      userInfoAccount,
      authority,
      userLpAccount,
      userRewardTokenAccount,
      new PublicKey(farmInfo.poolLpTokenAccount),
      new PublicKey(farmInfo.poolRewardTokenAccount),
      new PublicKey(farmInfo.lp.mintAddress),
      rewardFeeATA,
      TOKEN_PROGRAM_ID,
      programId,
      value,
    );
    transaction.add(instruction);
    return await sendTransaction(connection, wallet, transaction, signers);
  }
  static createDepositInstruction(
    farmId: PublicKey, // farm account 
    authority: PublicKey, //farm authority
    depositor: PublicKey,
    userInfoAccount:PublicKey,
    userTransferAuthority: PublicKey,
    userLpTokenAccount: PublicKey,
    userRewardTokenAccount: PublicKey,
    poolLpTokenAccount: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolLpTokenMint: PublicKey,
    feeOwner: PublicKey,
    tokenProgramId: PublicKey,
    farmProgramId: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmId, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: depositor, isSigner: true, isWritable: false},
      {pubkey: userInfoAccount, isSigner: false, isWritable: true},
      {pubkey: userTransferAuthority, isSigner: true, isWritable: false},
      {pubkey: userLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: userRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenMint, isSigner: false, isWritable: true},
      {pubkey: feeOwner, isSigner: false, isWritable: true},
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
  static createWithdrawInstruction(
    farmId: PublicKey, // farm account 
    authority: PublicKey, //farm authority
    owner: PublicKey,
    userInfoAccount: PublicKey,
    userTransferAuthority: PublicKey,
    userLpTokenAccount: PublicKey,
    userRewardTokenAccount: PublicKey,
    poolLpTokenAccount: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolLpTokenMint: PublicKey,
    feeOwner: PublicKey,
    tokenProgramId: PublicKey,
    farmProgramId: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: farmId, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: owner, isSigner: true, isWritable: false},
      {pubkey: userInfoAccount, isSigner: false, isWritable: true},
      {pubkey: userTransferAuthority, isSigner: false, isWritable: false},
      {pubkey: userLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: userRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenMint, isSigner: false, isWritable: true},
      {pubkey: feeOwner, isSigner: false, isWritable: true},
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
