<template>

  <div class="container" :class="isMobile ? 'create-pool-mobile' : 'create-pool'">
    <CoinSelect v-if="coinSelectShow" @onClose="() => (coinSelectShow = false)" @onSelect="onCoinSelect" />
    <div class="page-head fs-container">
      <span class="title">Create a farm</span>
    </div>
    <div class="card">
      <div class="card-body" style="grid-row-gap: 0; row-gap: 0; padding-bottom: 15px">
        <Steps :current="current" size="small" direction="vertical" style="width: auto" :status="stepsStatus">
          
          <Step>
            <p slot="title">
              {{ stepTitleInputMarket }}
              <Tooltip placement="right">
                <div slot="title">
                  For details on creating a Serum Market, see
                  <a href="https://raydium.gitbook.io/raydium/permissionless/creating-a-pool" target="_blank"
                    >this guide.</a
                  >
                </div>
                <Icon type="info-circle" />
              </Tooltip>
            </p>
          </Step>
          <Step
            ><template slot="title">
              <div v-if="current > 1 || (current === 1 && stepsStatus !== 'error')">{{ stepTitleMarketInfo }}</div>
              <div v-else-if="current === 1 && stepsStatus === 'error'" style="color: red">
                {{ stepTitleMarketInfo }}
              </div>
              <div v-else style="color: rgb(87, 117, 147)">{{ stepTitleMarketInfo }}</div>
            </template></Step
          >
          <Step
            ><template slot="title">
              <div v-if="current > 2 || (current === 2 && stepsStatus !== 'error')">{{ stepTitleInit }}</div>
              <div v-else-if="current === 2 && stepsStatus === 'error'" style="color: red">{{ stepTitleInit }}</div>
              <div v-else style="color: rgb(87, 117, 147)">{{ stepTitleInit }}</div>
            </template></Step
          >
          
          <Step
            ><template slot="title">
              <div v-if="current > 3 && stepsStatus !== 'error'">Pool & Farm Created</div>
              <div v-else-if="current === 3 && stepsStatus === 'error'" style="color: red">Pool & Farm Created</div>
              <div v-else slot="title" style="color: rgb(87, 117, 147)">Pool Created</div>
            </template></Step
          >
          <Step
            ><template slot="title">
              <div v-if="current > 4 || (current === 4 && stepsStatus !== 'error')">Farm Informations</div>
              <div v-else-if="current === 4 && stepsStatus === 'error'" style="color: red">Farm Informations</div>
              <div v-else style="color: rgb(87, 117, 147)">Farm Informations</div>
            </template></Step
          >
          <Step
            ><template slot="title">
              <div v-if="current > 5 || (current === 5 && stepsStatus !== 'error')">Farm Created</div>
              <div v-else-if="current === 5 && stepsStatus === 'error'" style="color: red">Farm Created</div>
              <div v-else style="color: rgb(87, 117, 147)">Farm Created</div>
            </template></Step
          >
        </Steps>

        
        <Row v-if="current === 0" style="align-items: baseline; line-height: 40px; padding-bottom: 20px">
          <Col style="line-height: 20px" :span="24" :class="isMobile ? 'item-title-mobile' : 'item-title'"
            ><div style="padding-bottom: 10px; word-break: break-word">
              $$This tool is for advanced users. Before attempting to create a new liquidity pool, we suggest going
              through this
              <a href="#" target="_blank">
                detailed guide.</a
              >$$
            </div>
            <div>Input Serum Market ID:</div>
          </Col>
          <Col style="line-height: 20px" :span="24"><input v-model="inputMarket" :disabled="!marketInputFlag" /></Col>

          <Col :span="isMobile ? 24 : 24" style="padding-bottom: 20px; padding-top: 10px; text-align:center">
            <div class="btncontainer">
              <Button v-if="!wallet.connected" size="large" ghost style="width: 100%" @click="$accessor.wallet.openModal">
                Connect
              </Button>
              <Button
                v-else
                size="large"
                ghost
                class="button_div"
                :disabled="!wallet.connected"
                style=" z-index: 999; width: 100%"
                :loading="getMarketLoading"
                @click="marketInputFlag ? getMarketMsg() : rewriteMarket()"
              >
                {{ !wallet.connected ? 'Connect' : getMarketLoading ? '' : marketInputFlag ? 'Confirm' : 'Cancel' }}
              </Button>
            </div>
          </Col>
        </Row>
        <div v-if="current >= 1 && current < 4" style="margin-top: 10px" class="msgClass">
          <Row>
            <Col :span="isMobile ? 24 : 24" :class="isMobile ? 'item-title-mobile' : 'item-title'">Market Info:</Col>
            <Col :span="isMobile ? 24 : 24">
              <div style="padding-left: 10px">
                <div style="width: 100%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Base Token Mint Address:
                </div>
                <div
                  style="width: 100%; display: inline-block; text-align: right"
                  :class="isMobile ? 'item-msg-mobile' : ''"
                >
                  {{ getNameForMint(marketMsg.baseMintAddress.toBase58()) }}
                </div>
                <div style="width: 100%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Quote Token Mint Address:
                </div>
                <div
                  style="width: 100%; display: inline-block; text-align: right"
                  :class="isMobile ? 'item-msg-mobile' : ''"
                >
                  {{ getNameForMint(marketMsg.quoteMintAddress.toBase58()) }}
                </div>
                <div style="width: 100%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Expected AMM ID
                </div>
                <div
                  style="width: 100%; display: inline-block; text-align: right"
                  :class="isMobile ? 'item-msg-mobile' : ''"
                >
                  {{ expectAmmId }}
                </div>

                <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Tick Size:
                </div>
                <div style="width: 30%; display: inline-block" :class="isMobile ? 'item-msg-mobile' : ''">
                  {{ marketTickSize }}
                </div>
                <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Min Order Size:
                </div>
                <div style="width: 30%; display: inline-block" :class="isMobile ? 'item-msg-mobile' : ''">
                  {{ marketMsg.minOrderSize }}
                </div>
                <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
                  Current Price:
                </div>
                <div style="width: 30%; display: inline-block" :class="isMobile ? 'item-msg-mobile' : ''">
                  {{
                    marketMsg.tickSize.toString().split('.').length === 2
                      ? marketPrice.toFixed(marketMsg.tickSize.toString().split('.')[1].length)
                      : parseInt((marketPrice / marketMsg.tickSize).toFixed(0)) * marketMsg.tickSize
                  }}
                </div>
              </div>
            </Col>
            <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
              Set Base Token Starting Price:
            </div>
            <div style="width: 30%; display: inline-block">
              <input
                v-model="inputPrice"
                type="number"
                :disabled="createAmmFlag"
                :step="1"
                accuracy="2"
                style="width: 100%"
              />
            </div>
            <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
              Base Token Initial Liquidity:
            </div>
            <div style="width: 30%; display: inline-block">
              <input
                v-model="inputBaseValue"
                type="number"
                :disabled="createAmmFlag"
                :step="1"
                accuracy="2"
                style="width: 100%"
              />
            </div>
            <div style="width: 60%; display: inline-block" :class="isMobile ? 'item-title-mobile' : 'item-title'">
              Quote Token Initial Liquidity:
            </div>
            <div style="width: 30%; display: inline-block">
              <input
                v-model="inputQuoteValue"
                type="number"
                :disabled="createAmmFlag"
                :step="1"
                accuracy="2"
                style="width: 100%"
              />
            </div>
            <Col :span="24" style="padding-top: 10px">
              <Button
                v-if="!wallet.connected"
                style="position: absolute; z-index: 999; width: 100%"
                size="large"
                ghost
                @click="$accessor.wallet.openModal"
              >
                Connect
              </Button>
              <Row v-else-if="current == 3">
                <Col span="24" style="text-align: center; margin-top: 10px"
                  ><strong>Pool has been successfully created!</strong></Col
                >
                <Col span="24" style="word-break: break-word; line-height: 20px"
                  >Save the AMM ID below to easily search for this pool on the Swap and Liquidity page.</Col
                >
                <Col
                  style="margin-top: 10px"
                  :span="isMobile ? 24 : 6"
                  :class="isMobile ? 'item-title-mobile' : 'item-title'"
                  >New AMM ID:</Col
                >
                <Col style="margin-top: 10px" :span="isMobile ? 24 : 18">
                  <NuxtLink :to="`/liquidity/?ammId=${userCreateAmmId}`">{{ userCreateAmmId }}</NuxtLink>
                </Col>
              </Row>
              <div v-else style="text-align: center; padding-top: 20px">
                <Button
                  size="large"
                  ghost
                  class="button_div"
                  :disabled="!wallet.connected"
                  style="z-index: 999; width: 20%"
                  :loading="getMarketLoading"
                  @click="marketInputFlag ? getMarketMsg() : rewriteMarket()"
                >
                  {{ !wallet.connected ? 'Connect' : getMarketLoading ? '' : marketInputFlag ? 'OK' : 'Cancel' }}
                </Button>
                <Button
                  size="large"
                  ghost
                  class="button_div"
                  style="z-index: 999; width: 70%"
                  :loading="createAmmFlag"
                  :disabled="
                    createAmmFlag || !(inputPrice !== null && inputBaseValue !== null && inputQuoteValue !== null)
                  "
                  @click="createKey"
                >
                  {{ createAmmFlag ? '' : 'Confirm and Initialize Liquidity Pool' }}
                </Button>

                <p style="padding-top: 20px; word-break: break-word; line-height: 20px; margin: 0">
                  After clicking 'Confirm' you will need to approve three transactions in your wallet to initialize the
                  pool, create the AMM account, and add liquidity.
                </p>
              </div>
            </Col>
          </Row>
        </div>

        <!-- Create Farm -->
        <Row v-if="current === 4" style="align-items: baseline; line-height: 40px; padding-bottom: 20px">
          <Col v-if="!isCRPTokenPair" style="line-height: 20px" :span="24" :class="isMobile ? 'item-title-mobile' : 'item-title'">
            <div>If not YourToken-CRP token pair, you have to pay 500 CRP when your farm is created</div>
          </Col>
          <Col style="line-height: 20px" :span="24">
            <CoinInput
              v-model="fromCoinAmount"
              label="Initial Reward Token Amount"
              :balance-offset="rewardCoin && rewardCoin.symbol === 'SOL' ? -0.05 : 0"
              :mint-address="rewardCoin ? rewardCoin.mintAddress : ''"
              :coin-name="rewardCoin ? rewardCoin.symbol : ''"
              :balance="rewardCoin ? rewardCoin.balance : null"
              :show-half="true"
              @onInput="(amount) => (fromCoinAmount = amount)"
              @onFocus="
                () => {
                  fixedFromCoin = true
                }
              "
              @onMax="
                () => {
                  fixedFromCoin = true
                  fromCoinAmount = rewardCoin && rewardCoin.balance ? rewardCoin.balance.fixed() : '0'
                }
              "
              @onSelect="openFromCoinSelect"
            />
          </Col>
          
          <Col style="line-height: 20px" :span="isMobile ? 24:12" :class="isMobile ? 'item-title-mobile' : 'item-title'">
            <DatePicker
              v-model="startTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="Start"
              @openChange="handleStartOpenChange"
            />
          </Col>
          
          <Col style="line-height: 20px" :span="isMobile ? 24:12" :class="isMobile ? 'item-title-mobile' : 'item-title'">
            <DatePicker
              v-model="endTime"
              show-time
              format="YYYY-MM-DD HH:mm:ss"
              placeholder="End"
              @openChange="handleEndOpenChange"
            />
          </Col>
          <Col style="line-height: 20px;" :span="24" :class="isMobile ? 'item-title-mobile' : 'item-title'">
            <div>Reward Per Second:&nbsp;{{rewardPerSecond}} &nbsp;{{rewardCoin != null?rewardCoin.symbol : ""}}</div>
          </Col>

          <Col :span="isMobile ? 24 : 24" style="padding-bottom: 20px; padding-top: 10px; text-align:center">
            <div class="btncontainer">
              <Button v-if="!wallet.connected" size="large" ghost style="width: 100%" @click="$accessor.wallet.openModal">
                Connect
              </Button>
              <Button v-else size="large" :disabled="!wallet.connected" ghost style="z-index: 999; width: 100%" @click="confirmFarmInfo">
                Confirm
              </Button>
            </div>
          </Col>
        </Row>
        <Row v-if="current === 5" style="align-items: baseline; line-height: 40px; padding-bottom: 20px">
          <Col v-if="!isCRPTokenPair" style="line-height: 20px" :span="24" :class="isMobile ? 'item-title-mobile' : 'item-title'">
            <div>Farm has been successfully created!</div>
          </Col>
          <Col :span="isMobile ? 24 : 24" style="padding-bottom: 20px; padding-top: 10px; text-align:center">
            <div class="btncontainer">
              <Button v-if="!wallet.connected" size="large" ghost style="width: 100%" @click="$accessor.wallet.openModal">
                Connect
              </Button>
              <Button v-else size="large" :disabled="!wallet.connected" ghost style="z-index: 999; width: 100%" @click="gotoFarms">
                View Farms
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
    <div v-if="userLocalAmmIdList.length > 0" class="card" style="margin-top: 20px">
      <div class="card-body" style="grid-row-gap: 0; row-gap: 0; padding-bottom: 15px; padding-top: 12px">
        <div style="font-size: 30px; font-weight: 700">Your Created Pools</div>
        <template v-for="item in userLocalAmmIdList">
          <div v-if="item.split('---').length === 5" :key="item" style="margin: 10px 0">
            <div>AMM ID: {{ item.split('---')[1] }}</div>
            <div style="text-indent: 1em; font-size: 13px">Serum Market ID: {{ item.split('---')[2] }}</div>
            <div style="text-indent: 1em; font-size: 13px">Base Token: {{ item.split('---')[3] }}</div>
            <div style="text-indent: 1em; font-size: 13px">Quote Token: {{ item.split('---')[4] }}</div>
            <div style="text-indent: 1em; font-size: 13px">
              Created on: {{ $dayjs(parseInt(item.split('---')[0])).toString() }}
            </div>
          </div>
        </template>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { Steps, Row, Col, Button, Tooltip, Icon, DatePicker } from 'ant-design-vue'
import { getMarket, createAmm, clearLocal } from '@/utils/market'
import BigNumber from '@/../node_modules/bignumber.js/bignumber'
import { TokenInfo, TOKENS } from '@/utils/tokens'
import { createAssociatedId, createAssociatedTokenAccountIfNotExist, sendTransaction } from '@/utils/web3'
import { Account, PublicKey, Transaction, TransactionInstruction } from '@solana/web3.js'
import { AMM_ASSOCIATED_SEED, FARM_PROGRAM_ID, LIQUIDITY_POOL_PROGRAM_ID_V4, LIQUIDITY_POOL_PROGRAM_ID_V5 } from '@/utils/ids'
import { getBigNumber } from '@/utils/layouts'
import { cloneDeep, get } from 'lodash-es'
import moment from 'moment'
import {YieldFarm} from '@/utils/farm'
import { AccountLayout, MintLayout, Token, TOKEN_PROGRAM_ID } from '@solana/spl-token'
import { LIQUIDITY_POOLS } from '@/utils/pools'
import { createSplAccount } from '@/utils/new_fcn'
const Step = Steps.Step

@Component({
  head: {
    title: 'CropperFinance Create Pool'
  },
  components: {
    Steps,
    Row,
    Col,
    Button,
    Step,
    Tooltip,
    Icon,
    DatePicker,
  }
})
export default class CreatePool extends Vue {
  rewardCoin:TokenInfo | null = null
  fromCoinAmount: string = '0.00'
  fixedFromCoin: boolean = true
  selectFromCoin:boolean = true
  coinSelectShow: boolean = false
  startTime: any = moment()
  endTime:  any = moment()
  endOpen: any = false
  isCRPTokenPair:boolean = false
  
  current: number = 0
  
  marketInputFlag: boolean = true
  marketFlag: boolean = false
  inputMarket: string = ''
  inputQuoteValue: number | null = null
  inputBaseValue: number | null = null
  inputPrice: number | null = null
  marketMsg: any | null = null
  getMarketLoading: boolean = false
  marketError: null | string = null
  stepsStatus: string = 'process'
  marketStr: string | null = null
  marketPrice: number | null = null
  baseMintDecimals: number | null = null
  quoteMintDecimals: number | null = null

  createAmmFlag: boolean = false

  stepTitleInputMarket: string = 'Import Serum Market ID'
  stepTitleMarketInfo: string = 'Price & Initial Liquidity'
  stepTitleInit: string = 'Initialize'

  marketTickSize: number = 1

  userCreateAmmId: string = ''

  liquidityValueChangeFlag: boolean = true

  userLocalAmmIdList: string[] = []

  expectAmmId: undefined | string

  get rewardPerSecond(){
    let result = 0;
    let initialAmount = Number.parseFloat(this.fromCoinAmount);
    let duration = this.endTime.unix() - this.startTime.unix();
    if(duration > 0){
      result = initialAmount / duration;
    }
    return result;
  }
  get isMobile() {
    return this.$accessor.isMobile
  }

  get wallet() {
    return this.$accessor.wallet
  }

  @Watch('startTime')
  onStartTimeChanged(val: any) {
    console.log("start time changed !")
  }


  @Watch('inputQuoteValue')
  oniIputQuoteValueChanged(val: string) {
    if (
      this.inputPrice !== null &&
      this.baseMintDecimals !== null &&
      this.quoteMintDecimals !== null &&
      this.liquidityValueChangeFlag
    ) {
      this.liquidityValueChangeFlag = false
      if (val.toString().split('.').length > 1 && val.toString().split('.')[1].length > this.quoteMintDecimals) {
        this.inputQuoteValue = parseFloat(parseFloat(val).toFixed(this.quoteMintDecimals))
      }
      this.inputBaseValue =
        Math.floor(((this.inputQuoteValue ?? parseFloat(val)) / this.inputPrice) * 10 ** this.baseMintDecimals) /
        10 ** this.baseMintDecimals
    }
    setTimeout(() => {
      this.liquidityValueChangeFlag = true
    }, 1)
  }

  @Watch('inputBaseValue')
  onInputBaseValueChanged(val: string) {
    if (
      this.inputPrice !== null &&
      this.baseMintDecimals !== null &&
      this.quoteMintDecimals !== null &&
      this.liquidityValueChangeFlag
    ) {
      this.liquidityValueChangeFlag = false
      if (val.toString().split('.').length > 1 && val.toString().split('.')[1].length > this.baseMintDecimals) {
        this.inputBaseValue = parseFloat(parseFloat(val).toFixed(this.baseMintDecimals))
      }
      this.inputQuoteValue =
        Math.floor((this.inputBaseValue ?? parseFloat(val)) * this.inputPrice * 10 ** this.quoteMintDecimals) /
        10 ** this.quoteMintDecimals
    }
    setTimeout(() => {
      this.liquidityValueChangeFlag = true
    }, 1)
  }

  @Watch('inputPrice')
  onInputPriceValueChanged(val: number) {
    if (this.inputPrice) {
      if (this.inputBaseValue && this.quoteMintDecimals) {
        this.inputQuoteValue =
          Math.floor(val * this.inputPrice * 10 ** this.quoteMintDecimals) / 10 ** this.quoteMintDecimals
      } else if (this.inputQuoteValue && this.baseMintDecimals) {
        this.inputBaseValue =
          Math.floor((val / this.inputPrice) * 10 ** this.baseMintDecimals) / 10 ** this.baseMintDecimals
      }
    }
  }

  @Watch('inputMarket')
  onInputMarketChanged(val: string) {
    this.inputMarket = val.replace(/(^\s*)|(\s*$)/g, '')
  }

  mounted() {
    const localMarket = localStorage.getItem('createMarket')
    if (localMarket !== null && localMarket.length > 30) {
      this.inputMarket = localMarket
      this.getMarketMsg()
    } else {
      clearLocal()
    }
    this.updateLocalData()
  }
  async confirmFarmInfo(){
    
    //dummy data to test
    //this.userCreateAmmId = "7h3HwQzhzNhfKZpdacVEKPwgZx8x1TsB8b2enoF4HHKx";

    //check Initial reward token amount

    //check if user paid Farm fee (500 CRP)

    //check start time and end time

    //check wallet connection

    const connection = this.$web3;
    if(connection != undefined)
    {
        console.log("wallet connected!");
    }
    else{
        console.log("wallet is not connected!");
        return;
    }
    const wallet:any = this.$wallet;
    
    //get liquidity pool info
    let liquidityPoolInfo:any = LIQUIDITY_POOLS.find((item) => item.ammId === this.userCreateAmmId);

    //check liquidity pool
    if(liquidityPoolInfo == undefined){
      console.log("find liquidity pool error");
      return;
    }

    let rewardMintPubkey = new PublicKey(this.rewardCoin?.mintAddress as string);
    let rewardDecimals:number = this.rewardCoin?.decimals as any;
    let lpMintPubkey = new PublicKey(liquidityPoolInfo.lp.mintAddress);
    
    let startTimestamp:any = this.startTime.unix();
    let endTimestamp:any = this.endTime.unix();
    
    let createdFarm = await YieldFarm.createFarmWithParams(
      connection,
      wallet,
      rewardMintPubkey,
      lpMintPubkey,
      startTimestamp,
      endTimestamp
    );
    
    await this.delay(500);
    
    // wait for the synchronization
    let loopCount = 0;
    while(await connection.getAccountInfo(createdFarm.farmId) === null){
      if(loopCount > 5){ // allow loop for 5 times
        break;
      }
      loopCount++;
    }
    
    let fetchedFarm = await YieldFarm.loadFarm(
      connection,
      createdFarm.farmId,
      new PublicKey(FARM_PROGRAM_ID)
    )
    
    if(fetchedFarm){
      //transfer initial reward amount
      let initialRewardAmount:number = Number.parseFloat(this.fromCoinAmount);
      let userRwardTokenPubkey = new PublicKey(get(this.wallet.tokenAccounts, `${rewardMintPubkey.toBase58()}.tokenAccountAddress`));

      await fetchedFarm.addReward(
        wallet,
        userRwardTokenPubkey,
        initialRewardAmount * Math.pow(10,rewardDecimals)
      );

      this.current += 1;
    }
    
    
  }
  async delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  gotoFarms(){
    this.$router.push({ path: `/farms` })
  }

  openFromCoinSelect() {
    this.selectFromCoin = true
    this.closeAllModal('coinSelectShow')
    setTimeout(() => {
      this.coinSelectShow = true
    }, 1)
  }
  closeAllModal(showName: string) {
    if (showName !== 'coinSelectShow') {
      this.coinSelectShow = false
    }
  }
  onCoinSelect(tokenInfo: TokenInfo) {
    if (tokenInfo !== null) {
      if (this.selectFromCoin) {
        this.rewardCoin = cloneDeep(tokenInfo)
      }
    } else {
      // check coin
      if (this.rewardCoin !== null) {
        const newFromCoin = Object.values(TOKENS).find((item) => item.mintAddress === this.rewardCoin?.mintAddress)
        if (newFromCoin === null || newFromCoin === undefined) {
          this.rewardCoin = null
        }
      }
    }
    this.coinSelectShow = false
  }

  disabledStartDate(startTime:any) {
    const endTime = this.endTime;
    if (!startTime || !endTime) {
      return false;
    }
    if(startTime < moment().endOf('day'))
    {
      return true
    }
    return startTime.valueOf() > endTime.valueOf();
  }
  disabledEndDate(endTime:any) {
    const startTime = this.startTime;
    if (!endTime || !startTime) {
      return false;
    }
    return startTime.valueOf() >= endTime.valueOf();
  }
  handleStartOpenChange(open:any) {
    if (!open) {
      this.endOpen = true;
    }
  }
  handleEndOpenChange(open:any) {
    this.endOpen = open;
  }

  updateLocalData() {
    if (localStorage.getItem('userCreateAMMID') !== null) {
      // @ts-ignore
      this.userLocalAmmIdList = localStorage.getItem('userCreateAMMID').split('+++')
    } else {
      this.userLocalAmmIdList = []
    }
  }

  getNameForMint(mint: string) {
    const mintToken = Object.values(TOKENS).find((item) => item.mintAddress === mint)
    if (mintToken) {
      return `${mintToken.symbol}: ${mint}`
    }
    return mint
  }

  async getMarketMsg() {

    //@zhaohui
    this.getMarketLoading = true

    let market_t = {
      address: new PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
      baseMintAddress: new PublicKey(TOKENS.MYTEST.mintAddress),
      quoteMintAddress: new PublicKey(TOKENS.CROPTEST.mintAddress),
      tickSize: 5,
      minOrderSize: 10
    }

    this.expectAmmId = (
        await createAssociatedId(
          new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
          new PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
          AMM_ASSOCIATED_SEED
        )
      ).toString()

    let price_t = 3.5, baseMintDecimals_t = 9, quoteMintDecimals_t = 9
    this.stepsStatus = 'process'
    this.stepTitleInputMarket = 'Import Serum Market ID'
    this.current = 1
    this.marketMsg = market_t
    this.marketPrice = price_t
    this.marketTickSize = getBigNumber(new BigNumber(market_t.tickSize))
    this.baseMintDecimals = baseMintDecimals_t
    this.quoteMintDecimals = quoteMintDecimals_t
    this.marketStr = this.inputMarket
    this.getMarketLoading = false

    // let market_info = {
    //   address: new PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
    //   baseMintAddress: new PublicKey(TOKENS.MYTEST.mintAddress),
    //   quoteMintAddress: new PublicKey(TOKENS.CROPTEST.mintAddress),
    //   ammId: new PublicKey('3gSjs6MqyHFsp8DXvaKvVUJjV7qg5itf9qmUGuhnSaWH')
    // }

    // createAmm(this.$web3, this.$wallet, market_info, 0.5, 1)
    return;

    this.getMarketLoading = true
    this.marketInputFlag = !this.marketInputFlag
    const { market, price, msg, baseMintDecimals, quoteMintDecimals } = await getMarket(this.$web3, this.inputMarket)

    if (this.inputMarket && market !== null) {
      this.expectAmmId = (
        await createAssociatedId(
          new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
          new PublicKey(this.inputMarket),
          AMM_ASSOCIATED_SEED
        )
      ).toString()
    }
    if (market === null) {
      this.marketInputFlag = !this.marketInputFlag
      this.stepsStatus = 'error'
      this.stepTitleInputMarket = msg
    } else {
      this.stepsStatus = 'process'
      this.stepTitleInputMarket = 'Import Serum Market ID'
      this.current = 1
      this.marketMsg = market
      this.marketPrice = price
      this.marketTickSize = getBigNumber(new BigNumber(market.tickSize))
      this.baseMintDecimals = baseMintDecimals
      this.quoteMintDecimals = quoteMintDecimals
      this.marketStr = this.inputMarket
    }
    this.getMarketLoading = false
  }

  rewriteMarket() {
    this.marketInputFlag = !this.marketInputFlag
    this.current = 0
    this.marketMsg = null
    this.inputMarket = ''
    this.inputQuoteValue = 0
    this.inputBaseValue = 0
    this.inputPrice = 0
    this.marketError = null
    this.createAmmFlag = false
    this.userCreateAmmId = ''
    this.stepTitleMarketInfo = 'Price & Initial Liquidity'
    this.stepTitleInit = 'Initialize'
    clearLocal()
  }

  createKey() {
    this.stepTitleMarketInfo = 'Price & Initial Liquidity'
    this.stepTitleInit = 'Initialize'
    if (
      this.marketMsg == null ||
      this.inputQuoteValue === null ||
      this.inputBaseValue === null ||
      this.inputPrice === null ||
      this.inputQuoteValue <= 0 ||
      this.inputBaseValue <= 0 ||
      this.inputPrice <= 0
    ) {
      this.stepTitleMarketInfo = 'Please input coin value'
      this.stepsStatus = 'error'
      return
    } else {
      this.stepTitleMarketInfo = 'Price & Initial Liquidity'
      this.stepsStatus = 'process'
    }

    this.createAmmFlag = true

    createAmm(this.$web3, this.$wallet, this.marketMsg, this.inputBaseValue, this.inputQuoteValue)
      .then(async (data) => {
        this.current = 3
        this.stepsStatus = 'process'
        this.userCreateAmmId = data
        if (localStorage.getItem('userCreateAMMID') !== null) {
          localStorage.setItem('userCreateAMMID', localStorage.getItem('userCreateAMMID') + '+++')
        } else {
          localStorage.setItem('userCreateAMMID', '')
        }
        localStorage.setItem(
          'userCreateAMMID',
          localStorage.getItem('userCreateAMMID') +
            `${new Date().getTime()}---${data}---${
              this.marketMsg.address
            }---${this.marketMsg.baseMintAddress.toString()}---${this.marketMsg.quoteMintAddress.toString()}`
        )
        this.updateLocalData()
        this.createAmmFlag = true
        await this.$accessor.liquidity.requestInfos()
      })
      .catch((error) => {
        this.stepsStatus = 'error'
        this.current = 2
        this.createAmmFlag = false
        this.stepTitleInit = error.message
        throw error
      })
  }
}
</script>
<style lang="less" scoped>

  .btncontainer {
    background: linear-gradient(91.9deg, rgba(19, 236, 171, 0.8) -8.51%, rgba(200, 52, 247, 0.8) 110.83%);
    display: inline-block;
    width: unset;
    text-align: center;
    position: relative;
    max-width: 400px;
    margin: 10px auto;
    padding: 2px;
    border-radius: 30px;
    max-height: 50px;

    button{
      background:#000 !important;
      position: relative;
      border-radius: 30px;
      border-color: transparent;
    }

  }


main{
  background-color:#000;
  background-image:unset;
  background-size:cover;
  background-position:center bottom;
}


.create-pool {
  max-width: 570px;

  .card-body{
      padding: 60px 60px 15px;
  }
}
.create-pool-mobile {
  width: 100%;
}
input {
  background: transparent;
  outline: none;
  border: none;
  border-bottom: 1px #ccc solid;
  width: 90%;
  margin: 0 5%;
}
.item-title {
  text-align: left;
  padding-right: 5%;
}
.item-title-mobile {
  text-align: left;
  padding-right: 5%;
}
div {
  word-break: break-all;
  word-wrap: break-word;
}
.item-msg-mobile {
  padding-left: 10px;
}

.ant-col {
  margin-bottom: 10px;
}
.msgClass div {
  line-height: 30px;
}
</style>
