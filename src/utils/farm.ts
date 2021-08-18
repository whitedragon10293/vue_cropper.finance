import assert from 'assert';
import BN from 'bn.js';
import {Buffer} from 'buffer';
import { bool, publicKey, u32,struct,  u64, u8} from '@project-serum/borsh'
// @ts-ignore
import { nu64, blob } from 'buffer-layout'
import {Connection, SYSVAR_CLOCK_PUBKEY, TransactionSignature} from '@solana/web3.js';
import {
  Account,
  AccountInfo,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

//import * as Layout from './layout';
import {sendAndConfirmTransaction} from './send-and-confirm-transaction';
import {loadAccount} from './account';
import { AccountLayout, MintLayout } from '@solana/spl-token';
import { createSplAccount } from './new_fcn';
import { sendTransaction } from './web3';

enum StakeInstruction
{
  Initialize = 0,
  Deposit,
  Withdraw,
}

export const StakeAccountLayout = struct([
  u64('state'),
  u8('nonce'),
  publicKey('pool_lp_token_account'),
  publicKey('pool_reward_token_account'),
  publicKey('pool_mint_address'),
  publicKey('reward_mint_address'),
  publicKey('token_program_id'),
  publicKey('owner'),
  publicKey('fee_owner'),
  u64('reward_per_share_net'),
  u64('last_block'),
  u64('reward_per_block'),
  u64('start_timestamp'),
  u64('end_timestamp'),
]);
export const UserInfoAccountLayout = struct([
  publicKey('wallet'),
  publicKey('pool_id'),
  u64('deposit_balance'),
  u64('reward_debt'),
]);
export class UserInfo {
  constructor(
    public userInfoAccount:PublicKey,
    public wallet: PublicKey,
    public poolId: PublicKey,
    public depositBalance:nu64,
    public rewardDebt:nu64,
  ){
    this.wallet = wallet;
    this.poolId = poolId;
    this.depositBalance = depositBalance;
    this.rewardDebt = rewardDebt;
  }
  /**
   * Get the minimum balance for the stake pool account to be rent exempt
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
 * A program for stake pool
 */
export class StakePool {
  constructor(
    private connection: Connection,
    public stake: PublicKey,
    public stakeProgramId: PublicKey,
    public tokenProgramId: PublicKey,
    public lpTokenPoolMint: PublicKey,
    public rewardTokenPoolMint: PublicKey,
    public feeOwnerAccount: PublicKey,
    public owner: PublicKey,
    public authority: PublicKey,
    public poolRewardTokenAccount: PublicKey,
    public poolLpTokenAccount: PublicKey,
    public state: nu64,
    public nonce: number,
    public rewardPerShareNet: number,
    public lastBlock: nu64,
    public rewardPerBlock: nu64,
    public startTimestamp: nu64,
    public endTimestamp: nu64,
    public staker: Account,
  ) {
    this.connection = connection;
    this.stake = stake;
    this.stakeProgramId = stakeProgramId;
    this.tokenProgramId = tokenProgramId;
    this.lpTokenPoolMint = lpTokenPoolMint;
    this.feeOwnerAccount = feeOwnerAccount;
    this.owner = owner;
    this.authority = authority;
    this.poolRewardTokenAccount = poolRewardTokenAccount;
    this.poolLpTokenAccount = poolLpTokenAccount;
    this.state = state;
    this.nonce = nonce;
    this.rewardPerBlock = rewardPerBlock;
    this.lastBlock = lastBlock;
    this.rewardPerBlock = rewardPerBlock;
    this.startTimestamp = startTimestamp;
    this.endTimestamp = endTimestamp;
    this.staker = staker;
  }

  /**
   * Get the minimum balance for the stake pool account to be rent exempt
   *
   * @return Number of lamports required
   */
  static async getMinBalanceRentForExemptStakePool(
    connection: Connection,
  ): Promise<number> {
    return await connection.getMinimumBalanceForRentExemption(
      StakeAccountLayout.span,
    );
  }

  static createInitStakeInstruction(
    stakeAccount: Account, // pool account 
    authority: PublicKey, //pool authority
    staker: Account,
    fee_owner: PublicKey,
    poolLpTokenAccount: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolMintAddress: PublicKey,
    rewardMintAddress: PublicKey,
    tokenProgramId: PublicKey,
    nonce: number,
    stakeProgramId: PublicKey,
    startTimestamp: number,
    endTimestamp: number,
  ): TransactionInstruction {
    const keys = [
      {pubkey: stakeAccount.publicKey, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: staker.publicKey, isSigner: true, isWritable: false},
      {pubkey: fee_owner, isSigner: false, isWritable: false},
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
          instruction: StakeInstruction.Initialize, // Initialize instruction
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
      programId: stakeProgramId,
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
    stakeProgramId:PublicKey,
    pool_id:PublicKey,
    owner:PublicKey,
  ):Promise<UserInfo>{
    // stake user info account
    const stakeFilters = [
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
    let stakeAccountInfos = await StakePool.getFilteredProgramAccounts(connection, stakeProgramId, stakeFilters)
    let userInfo:any;
    stakeAccountInfos.forEach((stakeAccountInfo) => {
      
      const { data} = stakeAccountInfo.accountInfo
      
      const userStakeInfo = UserInfoAccountLayout.decode(data)
      
      const wallet = userStakeInfo.wallet;
      const poolId = userStakeInfo.pool_id.toBase58();
      const depositBalance = userStakeInfo.deposit_balance;
      const rewardDebt = userStakeInfo.reward_debt

      if(poolId == pool_id.toBase58())
      {
        userInfo = new UserInfo(stakeAccountInfo.publicKey,wallet,pool_id,depositBalance,rewardDebt);
      }
    })
    return userInfo;
    
  }
  static async findOrCreateUserInfoAccount(
    connection:Connection,
    stakeProgramId:PublicKey,
    pool_id:PublicKey,
    owner: Account,
  ):Promise<UserInfo> {
    let userInfo = await StakePool.findUserInfoAccount(connection,stakeProgramId,pool_id,owner.publicKey);
    if(userInfo != undefined){
      return userInfo;
    }

    // Allocate memory for the account
    const balanceNeeded = await StakePool.getMinBalanceRentForExemptStakePool(
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
        programId: stakeProgramId,
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
      pool_id,
      0,
      0,
    );
  }
  static async loadStakePool(
    connection: Connection,
    address: PublicKey,
    programId: PublicKey,
    staker: Account,
  ): Promise<StakePool> {
    const data = await loadAccount(connection, address, programId);
    const stakeData = StakeAccountLayout.decode(data);
    const [authority] = await PublicKey.findProgramAddress(
      [address.toBuffer()],
      programId,
    );
    console.log("here1")
    const state = stakeData.state;
    console.log("here2")
    const nonce: number = stakeData.nonce;
    console.log(stakeData.pool_lp_token_account)
    const poolLpTokenAccount = stakeData.pool_lp_token_account;
    console.log("here4")
    const poolRewardTokenAccount = stakeData.pool_reward_token_account;
    console.log("here5")
    const lpTokenPoolMint = stakeData.pool_mint_address;
    const rewardTokenPoolMint = stakeData.reward_mint_address;
    const tokenProgramId = stakeData.token_program_id;
    const owner = stakeData.owner;
    const feeOwnerAccount = stakeData.fee_owner;
    console.log("here6")
    const rewardPerShareNet:number = stakeData.reward_per_share_net;
    const lastBlock = stakeData.last_block;
    const rewardPerBlock = stakeData.reward_per_block;
    const startTimestamp = stakeData.start_timestamp;
    console.log("here7")
    const endTimestamp = stakeData.end_timestamp;
    console.log("here8")

    return new StakePool(
      connection,
      address,
      programId,
      tokenProgramId,
      lpTokenPoolMint, 
      rewardTokenPoolMint,
      feeOwnerAccount, 
      owner, 
      authority, 
      poolRewardTokenAccount, 
      poolLpTokenAccount, 
      state, 
      nonce, 
      rewardPerShareNet, 
      lastBlock, 
      rewardPerBlock, 
      startTimestamp,
      endTimestamp,
      staker
    );
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
    /*
      await sendAndConfirmTransaction(
      'createSplAccount',
      connection,
      transaction,
      payer,
      poolRewardTokenAccount,
    );
    */
    let tx = await sendTransaction(connection, payer, transaction, [
      poolRewardTokenAccount,
    ]);

    return poolRewardTokenAccount;
  }
  static async createStakePool(
    connection: Connection,
    stakeAccount: Account,
    stakeProgramId: PublicKey,
    tokenProgramId: PublicKey,
    lpTokenPoolMint: PublicKey,
    rewardTokenPoolMint: PublicKey,
    feeOwnerAccount: PublicKey,
    owner: PublicKey,
    authority: PublicKey,
    poolRewardTokenAccount: PublicKey,
    poolLpTokenAccount: PublicKey,
    state: number,
    nonce: number,
    rewardPerShareNet: number,
    lastBlock: number,
    rewardPerBlock: number,
    startTimestamp:number,
    endTimestamp:number,
    staker: Account,
  ): Promise<StakePool> {
    let transaction;
    const stake = new StakePool(
      connection,
      stakeAccount.publicKey,
      stakeProgramId,
      tokenProgramId,
      lpTokenPoolMint, 
      rewardTokenPoolMint, 
      feeOwnerAccount, 
      owner, 
      authority, 
      poolRewardTokenAccount, 
      poolLpTokenAccount, 
      state, 
      nonce, 
      rewardPerShareNet, 
      lastBlock, 
      rewardPerBlock, 
      startTimestamp,
      endTimestamp,
      staker
    );

    // Allocate memory for the account
    const balanceNeeded = await StakePool.getMinBalanceRentForExemptStakePool(
      connection,
    );
    transaction = new Transaction();
    transaction.add(
      SystemProgram.createAccount({ 
        fromPubkey: staker.publicKey,
        newAccountPubkey: stakeAccount.publicKey,
        lamports: balanceNeeded,
        space: StakeAccountLayout.span,
        programId: stakeProgramId,
      }),
    );

    const instruction = StakePool.createInitStakeInstruction(
      stakeAccount,
      authority, 
      staker, 
      feeOwnerAccount, 
      poolLpTokenAccount,  
      poolRewardTokenAccount, 
      lpTokenPoolMint, 
      rewardTokenPoolMint, 
      tokenProgramId,
      nonce, 
      stakeProgramId,
      startTimestamp,
      endTimestamp,
    );
    transaction.add(instruction);

    /*
    await sendAndConfirmTransaction(
      'createAccount',
      connection,
      transaction,
      staker,
      stakeAccount,
    );
    */

    let tx = await sendTransaction(connection, staker, transaction, [
      stakeAccount,
    ]);
    console.log(tx)

    return stake;
  }
  
  public async deposit( 
    owner: Account,
    userTransferAuthority: Account,
    userRewardTokenAccount: PublicKey,
    userLpTokenAccount: PublicKey, 
    harvestFeeAccount: PublicKey, 
    amount: number,
  ) {

    let userInfo = await StakePool.findOrCreateUserInfoAccount(this.connection,this.stakeProgramId,this.stake, owner)

    let transaction;
    transaction = new Transaction();
    const instruction = StakePool.createDepositInstruction(
      this.stake,
      this.authority,
      owner,
      userInfo.userInfoAccount,
      userTransferAuthority.publicKey,
      userLpTokenAccount,
      userRewardTokenAccount,
      this.poolLpTokenAccount,
      this.poolRewardTokenAccount,
      this.lpTokenPoolMint,
      this.rewardTokenPoolMint,
      this.tokenProgramId,
      this.stakeProgramId,
      harvestFeeAccount,
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
    stakeAddress: PublicKey, // pool account 
    authority: PublicKey, //pool authority
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
    stakeProgramId: PublicKey,
    harvestFeeAccount: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: stakeAddress, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: owner.publicKey, isSigner: true, isWritable: false},
      {pubkey: userInfoAccount, isSigner: false, isWritable: true},
      {pubkey: userTransferAuthority, isSigner: true, isWritable: false},
      {pubkey: userLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: userRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: harvestFeeAccount, isSigner: false, isWritable: true},
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
          instruction: StakeInstruction.Deposit, // Initialize instruction
          amount:amount,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: stakeProgramId,
      data,
    });
  }
  public async withdraw( 
    owner:Account,
    userTransferAuthority: Account,
    userRewardTokenAccount: PublicKey,
    userLpTokenAccount: PublicKey,
    harvestFeeAccount: PublicKey, 
    amount: number,
  ) {
    let userInfo = await StakePool.findOrCreateUserInfoAccount(this.connection,this.stakeProgramId,this.stake, owner)

    let transaction;
    transaction = new Transaction();

    const instruction = StakePool.createWithdrawInstruction(
      this.stake,
      this.authority,
      owner,
      userInfo.userInfoAccount,
      userTransferAuthority.publicKey,
      userLpTokenAccount,
      userRewardTokenAccount,
      this.poolLpTokenAccount,
      this.poolRewardTokenAccount,
      this.lpTokenPoolMint,
      this.rewardTokenPoolMint,
      this.tokenProgramId,
      this.stakeProgramId,
      harvestFeeAccount,
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
    stakeAddress: PublicKey, // pool account 
    authority: PublicKey, //pool authority
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
    stakeProgramId: PublicKey,
    harvestFeeAccount: PublicKey,
    amount: number
  ): TransactionInstruction {
    const keys = [
      {pubkey: stakeAddress, isSigner: false, isWritable: true},
      {pubkey: authority, isSigner: false, isWritable: false},
      {pubkey: owner.publicKey, isSigner: true, isWritable: false},
      {pubkey: userInfoAccount, isSigner: false, isWritable: true},
      {pubkey: userTransferAuthority, isSigner: true, isWritable: false},
      {pubkey: userLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolLpTokenAccount, isSigner: false, isWritable: true},
      {pubkey: userRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: poolRewardTokenAccount, isSigner: false, isWritable: true},
      {pubkey: harvestFeeAccount, isSigner: false, isWritable: true},
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
          instruction: StakeInstruction.Withdraw, // Initialize instruction
          amount:amount,
        },
        data,
      );
      data = data.slice(0, encodeLength);
    }
    return new TransactionInstruction({
      keys,
      programId: stakeProgramId,
      data,
    });
  }
}
