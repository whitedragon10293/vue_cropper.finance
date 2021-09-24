<template>
  <div class="container" :class="isMobile ? 'create-pool-mobile' : 'create-pool'">
    <CoinSelect
      v-if="coinSelectShow && wallet.connected"
      :farmTokenASelect="selectTokenA"
      :farmTokenBSelect="selectTokenB"
      :allowedAllFarm="$wallet.publicKey.toBase58() === allowedFarmCreator"
      @onClose="() => ((coinSelectShow = false), (selectTokenB = false), (selectTokenA = false))"
      @onSelect="onCoinSelect"
    />
    <AmmIdSelect
      :show="ammIdSelectShow"
      :liquidity-list="ammIdSelectList"
      :user-close="true"
      @onClose="() => (ammIdSelectShow = false)"
      @onSelect="onAmmIdSelect"
    />
    <div class="card">
      <div class="card-body" style="grid-row-gap: 0; row-gap: 0; padding-bottom: 15px">
        <div class="page-head fs-container">
          <span class="title">Project Details</span>
        </div>

        <Row class="full-border">
          <Col :span="24" class="notstep">
            <div style="position:absolute">
                <h1 style="padding-left:20px;">43</h1>
            </div>
            <div>
              <img width="100%" src="../../assets/pfo-banners/default.png"/>
            </div>
          </Col>
        </Row>
        <Row class="full-border pf-margin-top pf-padding-top">
          <Col :span="isMobile ? 24 : 12" class="notstep">
            <Row
              style="align-items: baseline; line-height: 40px; padding-bottom: 20px"
            >
              <Col style="line-height: 20px" :span="isMobile ? 24 : 12" :class="isMobile ? 'item-title-mobile' : 'item-title'"
                ><div style="padding-bottom: 10px; word-break: break-word">
                  project description
                </div>
              </Col>
              <Col style="line-height: 20px" :span="isMobile ? 24 : 12" :class="isMobile ? 'item-title-mobile' : 'item-title'"
                ><div><b>XX followers</b></div>
              </Col>
            </Row>
            <Row
              style="align-items: baseline; line-height: 40px; padding-bottom: 20px"
            >
              <Col style="line-height: 20px" :span="isMobile ? 24 : 12" :class="isMobile ? 'item-title-mobile' : 'item-title'"
                ><div style="padding-bottom: 10px; word-break: break-word">
                  Total farm reward amount
                </div>
              </Col>
              <Col style="line-height: 20px" :span="isMobile ? 24 : 12" :class="isMobile ? 'item-title-mobile' : 'item-title'"
                ><div>50,000,000.00 CRP</div>
              </Col>
            </Row>
            <Row
              style="align-items: baseline; line-height: 40px; padding-bottom: 20px"
            >
              <Col style="line-height: 20px" :span="isMobile ? 24 : 12" :class="isMobile ? 'item-title-mobile' : 'item-title'"
                ><div style="padding-bottom: 10px; word-break: break-word">
                  Total airdrop amount
                </div>
              </Col>
              <Col style="line-height: 20px" :span="isMobile ? 24 : 12" :class="isMobile ? 'item-title-mobile' : 'item-title'"
                ><div>50,000.00 CRP</div>
              </Col>
            </Row>
            <Row style="align-items: baseline; line-height: 40px; padding-bottom: 20px"
            >
              <Col
                v-if="userCreateAmmId === ''"
                :span="24"
                style="padding-bottom: 20px; padding-top: 10px; text-align: center"
              >
                <div v-if="!wallet.connected" class="btncontainer">
                  <Button
                    size="large"
                    ghost
                    class="button_div"
                    style="z-index: 999; width: 100%"
                    @click="$accessor.wallet.openModal"
                  >
                    Connect wallet
                  </Button>
                </div>
                <div v-else-if="current === 1" class="btncontainer">
                  <Button
                    size="large"
                    ghost
                    class="button_div"
                    style="z-index: 999; width: 100%"
                  >
                    Register to whitelist
                  </Button>
                </div>
                <div v-else-if="current === 2">
                  <h1>
                    You have 1 ticket <br/>
                    Lottery in progress ...
                  </h1>
                </div>
                <div v-else-if="current === 3">
                  <h1>
                    You can use below farm now.
                  </h1>
                </div>
              </Col>
            </Row>
          </Col>
          <Col :span="isMobile ? 24 : 12" :class="isMobile ? '' : 'steps'">
            <Steps :current="current" size="small" direction="vertical" style="width: auto" :status="stepsStatus">
              <Step
                ><template slot="title">
                  <div>Preparation - This project is in preparation phase. Stay turned.</div>
                </template></Step
              >
              <Step>
                <p slot="title" :style="current > 0 ? '' : 'color: rgb(87, 117, 147)'">
                  Whitelist - You can now whitelist yourself for the lottery.<br/>
                  Start 09-10-2021 @ 12:00 UTC
                </p>
              </Step>
              <Step>
                <p slot="title" :style="current > 1 ? '' : 'color: rgb(87, 117, 147)'">
                  Airdrop Lottery - See if you have any winning lottery tickets.<br/>
                  Start 11-10-2021 @ 12:00 UTC
                </p>
              </Step>
              <Step>
                <p slot="title" :style="current > 2 ? '' : 'color: rgb(87, 117, 147)'">
                  Private Farm opening - You can now use Farm CRP-USDC.<br/>
                  Start 13-10-2021 @ 12:00 UTC
                </p>
              </Step>
              <Step>
                <p slot="title" :style="current > 3 ? '' : 'color: rgb(87, 117, 147)'">
                  The farm goes public - 15-10-2021 @ 12:00 UTC
                </p>
              </Step>
            </Steps>
          </Col>
        </Row>
        <Row v-if="current === 3" class="full-border pf-margin-top">
          <Col class="lp-icons" :span="isMobile ? 12 : 12">
            <div class="icons">
              <CoinIcon :mint-address="'ECe1Hak68wLS44NEwBVNtZDMxap1bX3jPCoAnDLFWDHz'" />
              <CoinIcon :mint-address="'6MBRfPbzejwVpADXq3LCotZetje3N16m5Yn7LCs2ffU4'" />
            </div>
            {{ "LIQ-USDC" }}
          </Col>
          <Col class="pf-farm-stake" :span="isMobile ? 12 : 12">
            <div class="btncontainer">
              <Button
                size="large" 
                ghost 
                >
                  Stake LP
              </Button>
            </div>
          </Col>
        </Row>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { Steps, Row, Col, Button, Tooltip, Icon, DatePicker } from 'ant-design-vue'
import { getMarket, createAmm, clearLocal } from '@/utils/market'
import BigNumber from '@/../node_modules/bignumber.js/bignumber'
import { NATIVE_SOL, TokenInfo, TOKENS } from '@/utils/tokens'
import { createAssociatedId } from '@/utils/web3'
import { PublicKey } from '@solana/web3.js'
import { AMM_ASSOCIATED_SEED, FARM_PROGRAM_ID, LIQUIDITY_POOL_PROGRAM_ID_V4, SITE_ALLOWED_CREATOR } from '@/utils/ids'
import { getBigNumber } from '@/utils/layouts'
import { cloneDeep, get } from 'lodash-es'
import moment from 'moment'
import { YieldFarm } from '@/utils/farm'
import { getPoolListByTokenMintAddresses, LIQUIDITY_POOLS, LiquidityPoolInfo } from '@/utils/pools'
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
    DatePicker
  }
})
export default class CreatePool extends Vue {
  rewardCoin: TokenInfo | null = null
  tokenA: TokenInfo | null = null
  tokenB: TokenInfo | null = null
  fromCoinAmount: string = ''
  fixedFromCoin: boolean = true
  selectFromCoin: boolean = false
  selectTokenA: boolean = false
  selectTokenB: boolean = false
  allowedFarmCreator: string = SITE_ALLOWED_CREATOR
  coinSelectShow: boolean = false
  startTime: any = moment()
  endTime: any = moment()
  endOpen: any = false
  isCRPTokenPair: boolean = false
  ammIdSelectShow: boolean = false
  ammIdSelectList: any = []

  farmId: any = null
  current: number = 3

  marketInputFlag: boolean = true
  marketFlag: boolean = false
  inputMarket: string = ''
  isAmountValid: boolean = false
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

  get rewardPerWeek() {
    let result = 0
    let initialAmount = Number.parseFloat(this.fromCoinAmount)

    let duration = 0
    if (this.startTime != null && this.endTime != null) {
      duration = this.endTime.unix() - this.startTime.unix()
    }
    if (duration > 0) {
      result = (initialAmount * 7 * 24 * 3600) / duration
    }
    return result
  }
  get isMobile() {
    return this.$accessor.isMobile
  }

  get wallet() {
    return this.$accessor.wallet
  }

  @Watch('startTime')
  onStartTimeChanged(val: any) {
    console.log('start time changed !')
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
      this.validateAmount()
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
      this.validateAmount()
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
      this.validateAmount()
    }
  }

  async validateAmount() {
    this.isAmountValid = false
    if (this.inputBaseValue && this.inputQuoteValue && this.baseMintDecimals && this.quoteMintDecimals) {
      const walletBaseAmount = parseFloat(
        get(this.wallet.tokenAccounts, `${this.marketMsg.baseMintAddress.toBase58()}.balance`).fixed()
      )
      const walletQuoteAmount = parseFloat(
        get(this.wallet.tokenAccounts, `${this.marketMsg.quoteMintAddress.toBase58()}.balance`).fixed()
      )

      if (
        this.inputBaseValue > 0 &&
        this.inputBaseValue < walletBaseAmount &&
        this.inputQuoteValue > 0 &&
        this.inputQuoteValue < walletQuoteAmount
      ) {
        this.isAmountValid = true
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
  async confirmFarmInfo() {
    //EgaHTGJeDbytze85LqMStxgTJgq22yjTvYSfqoiZevSK
    const connection = this.$web3
    const wallet: any = this.$wallet

    await this.$accessor.liquidity.requestInfos()

    //get liquidity pool info
    let liquidityPoolInfo: any = LIQUIDITY_POOLS.find((item) => item.ammId === this.userCreateAmmId)

    //check liquidity pool
    if (liquidityPoolInfo == undefined) {
      this.$notify.error({
        key: 'Liquidity',
        message: 'Finding liquidity pool',
        description: "Can't find liquidity pool"
      })
      return
    }

    //check reward coin
    if (this.rewardCoin === null) {
      this.$notify.error({
        key: 'reward',
        message: 'Checking reward coin',
        description: 'Select reward coin, please'
      })
      return
    }

    let rewardMintPubkey = new PublicKey(this.rewardCoin?.mintAddress as string)
    let rewardDecimals: number = this.rewardCoin?.decimals as any
    let lpMintPubkey = new PublicKey(liquidityPoolInfo.lp.mintAddress)
    let ammPubkey = new PublicKey(this.userCreateAmmId)

    let startTimestamp: any = this.startTime.unix()
    let endTimestamp: any = this.endTime.unix()

    let initialRewardAmount: number = Number.parseFloat(this.fromCoinAmount)
    let userRewardTokenPubkey = new PublicKey(
      get(this.wallet.tokenAccounts, `${rewardMintPubkey.toBase58()}.tokenAccountAddress`)
    )
    let userRewardTokenBalance = get(this.wallet.tokenAccounts, `${rewardMintPubkey.toBase58()}.balance`)

    //check if creator has some reward
    if (userRewardTokenBalance <= 0 || userRewardTokenBalance < initialRewardAmount) {
      this.$notify.error({
        key: 'Initial Balance',
        message: 'Checking Inital Reward',
        description: 'Not enough Initial Reward token balance'
      })
      return
    }

    //check start and end
    if (startTimestamp >= endTimestamp) {
      this.$notify.error({
        key: 'Period',
        message: 'Checking period',
        description: 'end time must be late than start time'
      })
      return
    }
    try {
      let createdFarm = await YieldFarm.createFarmWithParams(
        connection,
        wallet,
        rewardMintPubkey,
        lpMintPubkey,
        ammPubkey,
        startTimestamp,
        endTimestamp
      )
      await this.delay(500)

      // wait for the synchronization
      let loopCount = 0
      while ((await connection.getAccountInfo(createdFarm.farmId)) === null) {
        if (loopCount > 5) {
          // allow loop for 5 times
          break
        }
        loopCount++
      }

      this.farmId = createdFarm.farmId
      let fetchedFarm = await YieldFarm.loadFarm(connection, createdFarm.farmId, new PublicKey(FARM_PROGRAM_ID))
      if (fetchedFarm) {
        await fetchedFarm.addReward(wallet, userRewardTokenPubkey, initialRewardAmount * Math.pow(10, rewardDecimals))
        this.current += 1
      }
    } catch {
      console.log('creating farm failed')
    }
  }
  async delay(ms: number) {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }

  gotoFarms() {
    this.$accessor.farm.requestInfos()
    this.$accessor.wallet.getTokenAccounts()
    this.$router.push({ path: `/farms/#${this.farmId}` })
  }
  goToFarmInfo() {
    this.current++
  }
  useExistingAMMID() {
    if (this.userCreateAmmId === '') {
      this.$notify.error({
        key: 'AMMID',
        message: 'Using Existing Amm Id',
        description: 'Input valid AMM ID'
      })
      return
    }
    this.current = 5
  }
  createNewAMMID() {
    this.userCreateAmmId = ''
    this.current++
  }
  onAmmIdSelect(liquidityInfo: LiquidityPoolInfo | undefined) {
    this.ammIdSelectShow = false
    if (liquidityInfo) {
      this.userCreateAmmId = liquidityInfo.ammId
    } else {
      this.userCreateAmmId = ''
      this.current++
    }
  }
  openFromCoinSelect() {
    this.selectFromCoin = true
    this.closeAllModal('coinSelectShow')
    setTimeout(() => {
      this.coinSelectShow = true
    }, 1)
  }
  openTokenASelect() {
    this.selectTokenA = true
    this.closeAllModal('coinSelectShow')
    setTimeout(() => {
      this.coinSelectShow = true
    }, 1)
  }
  openTokenBSelect() {
    this.selectTokenB = true
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
      } else if (this.selectTokenA || this.selectTokenB) {
        if (this.selectTokenA) {
          this.tokenA = cloneDeep(tokenInfo)
          this.rewardCoin = cloneDeep(tokenInfo)
          if (this.tokenB && this.tokenA.mintAddress === this.tokenB.mintAddress) {
            this.tokenB = null
          }
        } else if (this.selectTokenB) {
          this.tokenB = cloneDeep(tokenInfo)
          if (this.tokenA && this.tokenB.mintAddress === this.tokenA.mintAddress) {
            this.tokenA = null
          }
        }
        if (this.tokenA && this.tokenB) {
          const liquidityListV5 = getPoolListByTokenMintAddresses(
            this.tokenA.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.tokenA.mintAddress,
            this.tokenB.mintAddress === TOKENS.WSOL.mintAddress ? NATIVE_SOL.mintAddress : this.tokenB.mintAddress,
            undefined
          )
          if (liquidityListV5.length === 1) {
            this.userCreateAmmId = liquidityListV5[0].ammId
          } else if (liquidityListV5.length > 1) {
            // user select amm id
            this.coinSelectShow = false
            setTimeout(() => {
              this.ammIdSelectShow = true

              // @ts-ignore
              this.ammIdSelectList = Object.values(this.$accessor.liquidity.infos).filter((item: LiquidityPoolInfo) =>
                liquidityListV5.find((liquidityItem) => liquidityItem.ammId === item.ammId)
              )
            }, 1)
            return
          }
        } else {
          this.userCreateAmmId = ''
        }
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
    this.selectFromCoin = false
    this.selectTokenA = false
    this.selectTokenB = false
  }

  disabledStartDate(startTime: any) {
    const endTime = this.endTime
    if (!startTime || !endTime) {
      return false
    }
    if (startTime < moment().endOf('day')) {
      return true
    }
    return startTime.valueOf() > endTime.valueOf()
  }
  disabledEndDate(endTime: any) {
    const startTime = this.startTime
    if (!endTime || !startTime) {
      return false
    }
    return startTime.valueOf() >= endTime.valueOf()
  }
  handleStartOpenChange(open: any) {
    if (!open) {
      this.endOpen = true
    }
  }
  handleEndOpenChange(open: any) {
    this.endOpen = open
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

  getSymbolForMint(mint: string) {
    const mintToken = Object.values(TOKENS).find((item) => item.mintAddress === mint)
    if (mintToken) {
      return `${mintToken.symbol}`
    }
    return mint
  }

  async getMarketMsg() {
    //@zhaohui
    // this.getMarketLoading = true

    // let market_t = {
    //   address: new PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
    //   baseMintAddress: new PublicKey(TOKENS.B2B.mintAddress),
    //   quoteMintAddress: new PublicKey(TOKENS.CRP.mintAddress),
    //   tickSize: 5,
    //   minOrderSize: 10
    // }

    // this.expectAmmId = (
    //     await createAssociatedId(
    //       new PublicKey(LIQUIDITY_POOL_PROGRAM_ID_V4),
    //       new PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
    //       AMM_ASSOCIATED_SEED
    //     )
    //   ).toString()

    // let price_t = 3.5, baseMintDecimals_t = 9, quoteMintDecimals_t = 9
    // this.stepsStatus = 'process'
    // this.stepTitleInputMarket = 'Import Serum Market ID'
    // this.current = 2
    // this.marketMsg = market_t
    // this.marketPrice = price_t
    // this.marketTickSize = getBigNumber(new BigNumber(market_t.tickSize))
    // this.baseMintDecimals = baseMintDecimals_t
    // this.quoteMintDecimals = quoteMintDecimals_t
    // this.marketStr = this.inputMarket
    // this.getMarketLoading = false

    // // let market_info = {
    // //   address: new PublicKey('9wFFyRfZBsuAha4YcuxcXLKwMxJR43S7fPfQLusDBzvT'),
    // //   baseMintAddress: new PublicKey(TOKENS.USDT.mintAddress),
    // //   quoteMintAddress: new PublicKey(TOKENS.CRP.mintAddress),
    // //   ammId: new PublicKey('3gSjs6MqyHFsp8DXvaKvVUJjV7qg5itf9qmUGuhnSaWH')
    // // }

    // // createAmm(this.$web3, this.$wallet, market_info, 0.5, 1)
    // return;

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
      this.current = 2
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
        this.current = 5
      })
      .catch((error) => {
        this.stepsStatus = 'error'
        this.current = 3
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

  button {
    background: #000 !important;
    position: relative;
    border-radius: 30px;
    border-color: transparent;
  }
}

main {
  background-color: #000;
  background-image: unset;
  background-size: cover;
  background-position: center bottom;
}

.notstep {
  vertical-align: middle;
  padding: 10px 40px;
}

.create-pool {
  max-width: 90%;

  .card-body {
    padding: 10px 60px 15px;
  }
}
.create-pool-mobile {
  width: 100%;
}
.coin-select .coin-input button:hover {
  background-color: rgba(0, 0, 0, 0.9471) !important;
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
.ant-layout {
  background: #000 !important;
}

.ant-col {
  margin-bottom: 10px;
}
.msgClass div {
  line-height: 30px;
}
.steps{
  border-left: 1px solid #444A58;
  padding-top:20px;
  padding-left:20px;
}
.full-border{
  border: 1px solid #444A58;
}
.pf-margin-top{
  margin-top: 10px;
}

.pf-padding-top{
  padding-top: 20px;
}
.lp-icons {
  padding-top: 32px;
  padding-left: 36px;
  .icons {
    margin-right: 8px;
  }
}
.pf-farm-stake {
  padding-top: 10px;
  text-align: center;
}
</style>
