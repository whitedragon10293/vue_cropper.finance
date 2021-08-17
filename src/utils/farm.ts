import assert from 'assert';
import BN from 'bn.js';
import {Buffer} from 'buffer';
import { bool, publicKey, u32,  u64, u8} from '@project-serum/borsh'
// @ts-ignore
import * as BufferLayout from 'buffer-layout';
import {Connection, SYSVAR_CLOCK_PUBKEY, TransactionSignature} from '@solana/web3.js';
import {
  Keypair,
  AccountInfo,
  PublicKey,
  SystemProgram,
  Transaction,
  TransactionInstruction,
} from '@solana/web3.js';

//import * as Layout from './layout';
import {sendAndConfirmTransaction} from './send-and-confirm-transaction';
import {loadAccount} from './account';

enum StakeInstruction
{
  Initialize = 0,
  Deposit,
  Withdraw,
}

export const STAKE_PROGRAM_ID: PublicKey = new PublicKey(
  '5ANWst26N8qmdLr4wGGTkUoxPKEDoh4DuRixJNu74dPa',
);

/**
 * Some amount of tokens
 */
export class Numberu64 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 8) {
      return b;
    }
    assert(b.length < 8, 'Numberu64 too large');

    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a Numberu64 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): Numberu64 {
    assert(buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
    return new Numberu64(
      [...buffer]
        .reverse()
        .map(i => `00${i.toString(16)}`.slice(-2))
        .join(''),
      16,
    );
  }
}
export const StakeAccountLayout = BufferLayout.struct([
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
export const UserInfoAccountLayout = BufferLayout.struct([
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
    public depositBalance:Numberu64,
    public rewardDebt:Numberu64,
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
    public state: Numberu64,
    public nonce: number,
    public rewardPerShareNet: number,
    public lastBlock: Numberu64,
    public rewardPerBlock: Numberu64,
    public startTimestamp: Numberu64,
    public endTimestamp: Numberu64,
    public staker: Keypair,
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
    stakeAccount: Keypair, // pool account 
    authority: PublicKey, //pool authority
    staker: Keypair,
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
    const commandDataLayout = BufferLayout.struct([
      u8('instruction'),
      u8('nonce'),
      u64("start_timestamp"),
      u64("end_timestamp"),
    ]); 
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: StakeInstruction.Initialize, // Initialize instruction
          nonce,
          start_timestamp: new Numberu64(startTimestamp).toBuffer(),
          end_timestamp: new Numberu64(endTimestamp).toBuffer(),
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
      
      const wallet = new PublicKey(userStakeInfo.wallet);
      const poolId = new PublicKey(userStakeInfo.pool_id).toBase58();
      const depositBalance = new Numberu64(userStakeInfo.deposit_balance);
      const rewardDebt = new Numberu64(userStakeInfo.reward_debt)

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
    owner: Keypair,
  ):Promise<UserInfo> {
    let userInfo = await StakePool.findUserInfoAccount(connection,stakeProgramId,pool_id,owner.publicKey);
    if(userInfo != undefined){
      return userInfo;
    }

    // Allocate memory for the account
    const balanceNeeded = await StakePool.getMinBalanceRentForExemptStakePool(
      connection,
    );
    const newAccount = new Keypair();
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
      new Numberu64(0),
      new Numberu64(0),
    );
  }
  static async loadStakePool(
    connection: Connection,
    address: PublicKey,
    programId: PublicKey,
    staker: Keypair,
  ): Promise<StakePool> {
    const data = await loadAccount(connection, address, programId);
    const stakeData = StakeAccountLayout.decode(data);
    

    const [authority] = await PublicKey.findProgramAddress(
      [address.toBuffer()],
      programId,
    );
    const state = Numberu64.fromBuffer(
      stakeData.state,
    );
    const nonce: number = stakeData.nonce;
    const poolLpTokenAccount = new PublicKey(stakeData.pool_lp_token_account);
    const poolRewardTokenAccount = new PublicKey(stakeData.pool_reward_token_account);
    const lpTokenPoolMint = new PublicKey(stakeData.pool_mint_address);
    const rewardTokenPoolMint = new PublicKey(stakeData.reward_mint_address);
    const tokenProgramId = new PublicKey(stakeData.token_program_id);
    const owner = new PublicKey(stakeData.owner);
    const feeOwnerAccount = new PublicKey(stakeData.fee_owner);
    const rewardPerShareNet:number = stakeData.reward_per_share_net;
    const lastBlock = Numberu64.fromBuffer(
      stakeData.last_block,
    );
    const rewardPerBlock = Numberu64.fromBuffer(
      stakeData.reward_per_block,
    );
    const startTimestamp = Numberu64.fromBuffer(
      stakeData.start_timestamp,
    );
    const endTimestamp = Numberu64.fromBuffer(
      stakeData.end_timestamp,
    );

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

  static async createStakePool(
    connection: Connection,
    stakeAccount: Keypair,
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
    staker: Keypair,
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
      new Numberu64(state), 
      nonce, 
      rewardPerShareNet, 
      new Numberu64(lastBlock), 
      new Numberu64(rewardPerBlock), 
      new Numberu64(startTimestamp),
      new Numberu64(endTimestamp),
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

    
    await sendAndConfirmTransaction(
      'createAccount',
      connection,
      transaction,
      staker,
      stakeAccount,
    );

    return stake;
  }
  
  public async deposit( 
    owner: Keypair,
    userTransferAuthority: Keypair,
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
    owner: Keypair,
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
    const commandDataLayout = BufferLayout.struct([
      u8('instruction'),
      u64('amount'),
    ]); 
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: StakeInstruction.Deposit, // Initialize instruction
          amount:new Numberu64(amount).toBuffer(),
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
    owner:Keypair,
    userTransferAuthority: Keypair,
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
    owner: Keypair,
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
    const commandDataLayout = BufferLayout.struct([
      u8('instruction'),
      u64('amount'),
    ]); 
    let data = Buffer.alloc(1024);
    {
      const encodeLength = commandDataLayout.encode(
        {
          instruction: StakeInstruction.Withdraw, // Initialize instruction
          amount:new Numberu64(amount).toBuffer(),
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
