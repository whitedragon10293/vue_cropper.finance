<template>
  <div>

    <div  class="fertilizeruniq cont">

      <div v-for="farm in showFarms" :key="farm.farmInfo.poolId" slot="header" class="pf-record" :class="isMobile ? 'is-mobile card' : ' card'" :gutter="0">
       
       <TwitterRetweetReg
        :farm="farm"
        :show="registerTwitterRetweet"
        @onClose="() => {
          registerTwitterRetweet = false;
          updateFarms();
          }"
      />

       <div class="card-body" style="grid-row-gap: 0; row-gap: 0; padding-bottom: 15px">

          <Row class="full-border">
            <Col :span="24" class="">
              <div>
                <img width="100%" :src="farm.labelized.links.banner" />
              </div>
            </Col>
          </Row>

          <Row class="full-border ">
            <Col :span="24" class="">
              <div class="text-center">
                  <h1>{{farm.labelized.name}} 
                  <span class="icons">
                    <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                    <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                  </span></h1>
              </div>
            </Col>
          </Row>

          <Row class="full-border pf-margin-top pf-padding-top"  :span="isMobile ? 24 : 12">
            <Col :span="isMobile ? 24 : 12" class="notstep">

              <div class="desc"></div>

              <div class="followerscount">{{followerCount}} followers</div>

              <div class="rewardAmount">Total Airdrop allocated : <b>{{farm.labelized.airdrop.amount}} {{farm.labelized.airdrop.symbol}}</b></div>

              <div class="airdropInfo">{{farm.labelized.airdrop.info}}</div>


              <div class="text-center largepdding">

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

                  <div v-else-if="farm.labelized.pla_end_ts > currentTimestamp && isRegistered">
                    <div class="info">You have {{registeredDatas.submit}} ticket{{registeredDatas.submit > 1 ? 's' : ''}} !</div>
                    <div class="share">
                    Share your Referral link and earn more tickets
                    <input type="text" class="link" :value="shareWalletAddress" />
                    </div>
                  </div>

                  <div v-else-if="farm.labelized.pla_end_ts > currentTimestamp" class="btncontainer">
                    <Button
                      size="large"
                      ghost
                      class="button_div"
                      style="z-index: 999; width: 100%"
                      @click="startRegistering()"
                    >
                      Register to whitelist
                    </Button>
                  </div>
                  <div v-else-if="farm.labelized.pla_end_ts < currentTimestamp">
                    <h1>
                      <span v-if="farm.labelized.airdrop.status == 'lottery'" >
                        You have {{registeredDatas.submit}} ticket{{registeredDatas.submit > 1 ? 's' : ''}}<br/>
                        Lottery in progress...
                      </span>
                      <span v-else-if="farm.labelized.airdrop.status == 'in progress'" >
                        You have {{registeredDatas.won}}/{{registeredDatas.submit}} winning ticket{{registeredDatas.won > 1 ? 's' : ''}}<br/>
                        Airdrop in progress...
                      </span>
                      <span v-else-if="farm.labelized.airdrop.status == 'done'" >
                        You have {{registeredDatas.won}}/{{registeredDatas.submit}} winning ticket{{registeredDatas.won > 1 ? 's' : ''}}<br/>
                        Airdrop done
                      </span>
                    </h1>
                  </div>
                  <div v-else-if="farm.labelized.pfrom_ts < currentTimestamp">
                    <h1>
                      You can use below farm now.
                    </h1>
                  </div>
              </div>


            </Col>
            <Col :span="isMobile ? 24 : 12" :class="isMobile ? ' steps' : 'steps'">
                <div :class="farm.labelized.pla_ts < currentTimestamp ? 'done' : 'notdone' " >
                    Whitelist - You can register to the whitelist and earn lottery tickets.<br />
                    <div class="date">{{farm.labelized.pla}}</div>
                </div>
                <div :class="farm.labelized.pla_end_ts < currentTimestamp ? 'done' : 'notdone' ">
                    Airdrop Lottery - See if you have any winning lottery tickets.<br/>
                    <div class="date">{{farm.labelized.pla_end}}</div>
                </div>
                <div :class="farm.labelized.pfrom_ts < currentTimestamp ? 'done' : 'notdone' ">
                    Private Farm opened - You can now use Farm {{farm.farmInfo.lp.coin.symbol}}-{{farm.farmInfo.lp.pc.symbol}}.<br/>
                    <div class="date">{{farm.labelized.pfrom}}</div>
                </div>
                <div :class="farm.labelized.pto_ts < currentTimestamp ? 'done' : 'notdone' ">
                    The farm goes public<br/>
                    <div class="date">{{farm.labelized.pto}}</div>
                </div>
            </Col>
          </Row>
        </div>
      </div>

    </div>

    <div v-for="farm in showFarms" :key="farm.farmInfo.poolId">
      <div v-if="farm.labelized.pfrom_ts < currentTimestamp && isRegistered" class="farm container">
        <div class="card">
          <div class="card-body">
            <Collapse v-model="showCollapse" expand-icon-position="right">
              <CollapsePanel
                v-for="farm in showFarms"
                v-show="true"
                :key="farm.farmInfo.poolId"
                :show-arrow="poolType"
              >
                <Row slot="header" class="farm-head" :class="isMobile ? 'is-mobile' : ''" :gutter="0">
                    <div v-if="farm.labelized" class="labelized">LABELIZED</div>
                  <Col class="lp-icons" :span="isMobile ? 12 : 8">

                    <div v-if="currentTimestamp > farm.farmInfo.poolInfo.end_timestamp" class="label ended"> Ended </div>
                    <div v-if="currentTimestamp < farm.farmInfo.poolInfo.start_timestamp && currentTimestamp < farm.farmInfo.poolInfo.end_timestamp" class="label soon"> Soon </div>


                    <div class="icons">
                      <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                      <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                    </div>
                    {{ isMobile ? farm.farmInfo.lp.symbol : farm.farmInfo.lp.name }}
                  </Col>
                  <Col class="state" :span="isMobile ? 6 : 4">
                    <div class="title">{{ isMobile ? 'Reward' : 'Pending Reward' }}</div>
                    
                    <div v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp" class="value"> - </div>
                    <div v-else class="value">{{ !wallet.connected ? 0 : farm.userInfo.pendingReward.format() }}</div>
                  </Col>
                  <Col v-if="!isMobile" class="state" :span="4">
                    <div class="title">Staked 
                      <Tooltip placement="right" v-if="wallet && !(farm.farmInfo.poolInfo.start_timestamp > currentTimestamp || currentTimestamp > farm.farmInfo.poolInfo.end_timestamp) && farm.farmInfo.currentLPtokens > 0.001">
                        <template slot="title">
                          <div>
                            You got {{farm.farmInfo.currentLPtokens}} unstaked
                          </div>
                        </template>
                        <Icon type="question-circle" style="color:#f00" />
                      </Tooltip>
                      </div>
                    <div v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp" class="value"> - </div>
                    <div v-else class="value">
                      {{ !wallet.connected ? 0 : farm.userInfo.depositBalance.format() }}
                    </div>
                  </Col>
                  <Col class="state" :span="isMobile ? 6 : 4">
                    <div class="title">Total Apr 
                      <Tooltip placement="right" v-if="!(farm.farmInfo.poolInfo.start_timestamp > currentTimestamp || currentTimestamp > farm.farmInfo.poolInfo.end_timestamp)">
                        <template slot="title">
                          <div>
                            Farm APR : {{farm.farmInfo.apr_details.apr}}%<br />
                            Fees : {{farm.farmInfo.apr_details.apy}}%
                          </div>
                        </template>
                        <Icon type="question-circle" />
                      </Tooltip>
                    </div>
                    <div v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp || currentTimestamp > farm.farmInfo.poolInfo.end_timestamp" class="value"> - </div>
                    <div v-else class="value">{{ farm.farmInfo.apr }}%</div>
                  </Col>
                  <Col v-if="!isMobile && poolType" class="state" :span="4">
                    <div class="title">Liquidity</div>
                    <div v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp || currentTimestamp > farm.farmInfo.poolInfo.end_timestamp" class="value"> - </div>
                    <div v-else class="value">
                      ${{
                        Math.round(farm.farmInfo.liquidityUsdValue)
                          .toString()
                          .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                      }}
                    </div>
                  </Col>
                  <Col v-if="!isMobile && !poolType" class="state" :span="4">
                    <Button v-if="!wallet.connected" size="large" ghost @click.stop="$accessor.wallet.openModal">
                      Connect Wallet
                    </Button>
                    <div v-else class="fs-container">
                      <Button
                        :disabled="!wallet.connected || farm.userInfo.depositBalance.isNullOrZero()"
                        size="large"
                        ghost
                        @click.stop="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                      >
                        Harvest & Unstake
                      </Button>
                    </div>
                  </Col>
                </Row>

                <Row v-if="poolType" :class="isMobile ? 'is-mobile' : ''" :gutter="48">
                  <Col :span="isMobile ? 24 : 4">
                  </Col>

                  <Col :span="isMobile ? 24 : 10">
                    <div class="harvest">
                      <div class="title">Pending Reward</div>
                      <div class="pending fs-container">
                        <div class="reward">
                          <div class="token">{{ farm.farmInfo.reward.symbol }} {{ !wallet.connected ? 0 : farm.userInfo.pendingReward.format() }}</div>
                        </div>
                        <div class="btncontainer">
                          <Button
                            size="large"
                            ghost
                            :disabled="!wallet.connected || harvesting || farm.userInfo.pendingReward.isNullOrZero()"
                            :loading="harvesting"
                            @click="harvest(farm.farmInfo)"
                          >
                            Harvest
                          </Button>
                        </div>
                      </div>
                    </div>
                  </Col>

                  <Col :span="isMobile ? 24 : 10">
                    <div class="start">
                      <div class="title">Start farming</div>
                      <div v-if="!wallet.connected" @click="$accessor.wallet.openModal" class="btncontainer">
                      <Button size="large" ghost>
                        Connect Wallet
                      </Button>
                      </div>
                      <div v-else class="fs-container">
                        <div class="btncontainer" v-if="!farm.userInfo.depositBalance.isNullOrZero()">
                        <Button
                          class="unstake"
                          size="large"
                          ghost
                          @click="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                        >
                          <Icon type="minus" />
                        </Button>
                        </div>
                        <div class="btncontainer" v-if="currentTimestamp < farm.farmInfo.poolInfo.end_timestamp && farm.farmInfo.poolInfo.start_timestamp < currentTimestamp">
                          <Button
                            size="large" 
                            ghost 
                            :disabled="!farm.farmInfo.poolInfo.is_allowed || 
                                        farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                                        farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                            @click="openStakeModal(farm.farmInfo, farm.farmInfo.lp)">
                            {{
                              (!farm.farmInfo.poolInfo.is_allowed)?"Not Allowed":
                              (currentTimestamp > farm.farmInfo.poolInfo.end_timestamp?"Ended":
                              farm.farmInfo.poolInfo.start_timestamp > currentTimestamp?"Unstarted":"Stake")
                            }}
                          </Button>
                        </div>

                        <div class="btncontainer" v-if="currentTimestamp < farm.farmInfo.poolInfo.end_timestamp && farm.farmInfo.poolInfo.start_timestamp < currentTimestamp && farm.farmInfo.currentLPtokens > 0.001">
                          <Button
                            size="large" 
                            ghost 
                            :disabled="!farm.farmInfo.poolInfo.is_allowed || 
                                        farm.farmInfo.poolInfo.end_timestamp < currentTimestamp ||
                                        farm.farmInfo.poolInfo.start_timestamp > currentTimestamp"
                            @click="openStakeModalLP(farm.farmInfo, farm.farmInfo.lp)">
                            {{
                              (!farm.farmInfo.poolInfo.is_allowed)?"Not Allowed":
                              (currentTimestamp > farm.farmInfo.poolInfo.end_timestamp?"Ended":
                              farm.farmInfo.poolInfo.start_timestamp > currentTimestamp?"Unstarted":"Stake LP")
                            }}
                          </Button>
                        </div>

                        <div v-if="farm.farmInfo.poolInfo.start_timestamp > currentTimestamp" class="unstarted">
                          <div class="token">
                             {{ getCountdownFromPeriod(farm.farmInfo.poolInfo.start_timestamp - currentTimestamp) }}
                          </div>
                        </div>

                        <div class="btncontainer" v-if="farm.farmInfo.poolInfo.owner.toBase58() == wallet.address && farm.farmInfo.poolInfo.is_allowed && currentTimestamp < farm.farmInfo.poolInfo.end_timestamp">
                          <Button size="large" ghost @click="openAddRewardModal(farm)">
                            Add Reward
                          </Button>
                        </div>
                        <div class="btncontainer" v-if="farm.farmInfo.poolInfo.owner.toBase58() == wallet.address && !farm.farmInfo.poolInfo.is_allowed && currentTimestamp < farm.farmInfo.poolInfo.end_timestamp">
                          <Button size="large" ghost @click="payFarmFee(farm)">
                            Pay Farm Fee
                          </Button>
                        </div>
                      </div>

                        <div class="btncontainer">
                          <a target="_blank" :href=farm.farmInfo.twitterShare>
                            <Button size="large" ghost>   
                              Share
                            </Button>
                          </a>
                        </div>
                    </div>
                  </Col>
                </Row>
              </CollapsePanel>
            </Collapse>
            <div style="text-align: center; width: 100%">
              <div style="width: 80%; display: inline-block">
                <Pagination :total="totalCount" :showTotal="(total, range) => `${range[0]}-${range[1]} of ${total} items`" :pageSize="pageSize" :defaultCurrent="1" v-model="currentPage">
                </Pagination>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>


  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import importIcon from '@/utils/import-icon'
import { Collapse, Col, Radio, Select, Row, Switch as Toggle, Pagination } from 'ant-design-vue'
import { get, cloneDeep } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { deposit, withdraw } from '@/utils/stake'
import { getUnixTs } from '@/utils'
import { getBigNumber } from '@/utils/layouts'
import { LiquidityPoolInfo, LIQUIDITY_POOLS } from '@/utils/pools'
import moment from 'moment'
import { TOKEN_PROGRAM_ID, u64 } from '@solana/spl-token'
import { PAY_FARM_FEE, YieldFarm } from '@/utils/farm'
import { PublicKey } from '@solana/web3.js'
import { DEVNET_MODE, FARM_PROGRAM_ID } from '@/utils/ids'
import { TOKENS, NATIVE_SOL } from '@/utils/tokens'
import { addLiquidity, removeLiquidity } from '@/utils/liquidity'
const CollapsePanel = Collapse.Panel
const RadioGroup = Radio.Group
const RadioButton = Radio.Button


export default Vue.extend({
  components: {
    //Toggle,
    //Collapse,
    //CollapsePanel,
    //Spin,
   // Icon,
    Col,
    Row,
    //Select,
    //Pagination
  },

//    ,
//    RadioGroup,
//    RadioButton

  data() {
    return {
      isMobile: false,

      farms: [] as any[],
      showFarms:[] as any[],
      searchName:"",
      followerCount: 0,
      registeringProcess: false,
      coinPicUrl : '',
      lp: null,
      isRegistered: false,
      registeredDatas: false,
      shareWalletAddress: '',
      rewardCoin: null,
      farmInfo: null as any,
      harvesting: false,
      stakeModalOpening: false,
      addRewardModalOpening: false,
      staking: false,
      coinName: '',
      mintAddress : '',
      adding: false,
      paying: false,
      unstakeModalOpening: false,
      unstaking: false,
      poolType: true,
      endedFarmsPoolId: [] as string[],
      showCollapse: [] as any[],
      currentTimestamp: 0,
      tempInfo:null as any,
      stakeLPError : false,
      labelizedAmms:{} as any,
      certifiedOptions:[{value:0,label:"Labelized"},{value:1,label:"Permissionless"},{value:2,label:"All"}],
      lifeOptions:[{value:0,label:"Opened"},{value:1,label:"Future"},{value:2,label:"Ended"},{value:3,label:"All"}],
      searchCertifiedFarm:0,
      searchLifeFarm:0,
      stakedOnly:false,
      totalCount:110,
      pageSize:10,
      currentPage:1,
      current: 0,
      registerTwitterRetweet : false
    }
  },

  head: {
    title: 'CropperFinance x ... '
  },


  computed: {
    ...mapState(['app', 'wallet', 'farm', 'url', 'price', 'liquidity'])
  },

  watch: {
    'wallet.tokenAccounts': {
      handler(newTokenAccounts: any) {
        this.updateCurrentLp(newTokenAccounts)
      },
      deep: true
    },

    'farm.infos': {
      handler() {
        this.updateFarms()
      },
      deep: true
    },

    'farm.stakeAccounts': {
      handler() {
        this.updateFarms()
      },
      deep: true
    },
    showCollapse: {
      handler() {
        if (!this.poolType && this.showCollapse.length > 0) {
          this.showCollapse.splice(0, this.showCollapse.length)
        }
      },
      deep: true
    },
    searchName:{
      handler(newSearchName:string) {
        this.filterFarms(newSearchName);
      },
      deep: true
    }
  },

  mounted() {
    this.updateFarms()

    var hash = window.location.hash;
    if (hash) {
      hash = hash.substring(1);
      this.searchName = hash;
    } else {
      const query = new URLSearchParams(window.location.search);
      this.searchName = query.get('s') as string;
    }

    if(this.searchName){
      this.searchCertifiedFarm = 2;
      this.searchLifeFarm = 3;
    }
  },

  methods: {
    moment,
    importIcon,
    getCoinPicUrl() {
      let token
      if (this.mintAddress == NATIVE_SOL.mintAddress) {
        token = NATIVE_SOL
      } else {
        token = Object.values(TOKENS).find((item) => item.mintAddress === this.mintAddress)
      }
      if (token) {
        this.coinName = token.symbol.toLowerCase()
        if (token.picUrl) {
          this.coinPicUrl = token.picUrl
        } else {
          this.coinPicUrl = ''
        }
      }
    },
    startRegistering(){
        this.registerTwitterRetweet = true;
        this.updateFarms();
    },
    TokenAmount,
    async updateLabelizedAmms()
    {
      this.labelizedAmms = {};
      let responseData
      try{
        responseData = await fetch(
          'https://api.cropper.finance/farms/'
        ).then(res => res.json());
      }
      catch{
        // dummy data
        responseData = [{"ammID":"ADjGcPYAu5VZWdKwhqU3cLCgX733tEaGTYaXS2TsB2hF","labelized":true},{"ammID":"8j7uY3UiVkJprJnczC7x5c1S6kPYQnpxVUiPD7NBnKAo","labelized":true}]
      }
      finally{
        responseData.forEach((element:any) => {
          this.labelizedAmms[element.ammID] = element;
        });
      }

    },

    async updateFarms() {
      await this.updateLabelizedAmms();
      this.currentTimestamp = moment().unix();
      const farms: any = []
      const endedFarmsPoolId: string[] = []
      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        let userInfo = get(this.farm.stakeAccounts, poolId)

        // @ts-ignore
        const { reward_per_share_net, reward_per_timestamp, last_timestamp } = farmInfo.poolInfo

        // @ts-ignore
        const { reward, lp } = farmInfo



        let newFarmInfo:any = cloneDeep(farmInfo)

        let isPFO = false;

        if (reward && lp) {
          const rewardPerTimestampAmount = new TokenAmount(getBigNumber(reward_per_timestamp), reward.decimals)
          const liquidityItem = get(this.liquidity.infos, lp.mintAddress)


        
          const rewardPerTimestampAmountTotalValue =
            getBigNumber(rewardPerTimestampAmount.toEther()) *
            2 *
            60 *
            60 *
            24 *
            365 *
            this.price.prices[reward.symbol as string]

          const liquidityCoinValue =
            getBigNumber((liquidityItem?.coin.balance as TokenAmount).toEther()) *
            this.price.prices[liquidityItem?.coin.symbol as string]
          const liquidityPcValue =
            getBigNumber((liquidityItem?.pc.balance as TokenAmount).toEther()) *
            this.price.prices[liquidityItem?.pc.symbol as string]
          const liquidityTotalValue = liquidityPcValue + liquidityCoinValue
          
          const liquidityTotalSupply = getBigNumber((liquidityItem?.lp.totalSupply as TokenAmount).toEther())
          const liquidityItemValue = liquidityTotalValue / liquidityTotalSupply
          let liquidityUsdValue = getBigNumber(lp.balance.toEther()) * liquidityItemValue;
          let apr = ((rewardPerTimestampAmountTotalValue / liquidityUsdValue) * 100).toFixed(2)
          if(apr === "NaN" || apr === "Infinity"){
            apr = "0";
          }
          if(isNaN(liquidityUsdValue)){
            liquidityUsdValue = 0;
          }
          // @ts-ignore
          newFarmInfo.apr = apr

          // @ts-ignore
          newFarmInfo.liquidityUsdValue = liquidityUsdValue

          if (rewardPerTimestampAmount.toEther().toString() === '0') {
            //endedFarmsPoolId.push(poolId)
          }
        }

        if (userInfo && lp) {
          userInfo = cloneDeep(userInfo)

          const { rewardDebt, depositBalance } = userInfo
          const liquidityItem = get(this.liquidity.infos, lp.mintAddress)
          const currentTimestamp = this.currentTimestamp;
          const duration = currentTimestamp - last_timestamp.toNumber();
          const rewardPerShareCalc = reward_per_share_net.toNumber() + 1000000000 * reward_per_timestamp.toNumber() * duration / liquidityItem.lp.totalSupply.wei.toNumber();
          
          const pendingReward = depositBalance.wei
            .multipliedBy(getBigNumber(rewardPerShareCalc))
            .dividedBy(1e9)
            .minus(rewardDebt.wei)
          userInfo.pendingReward = new TokenAmount(pendingReward, rewardDebt.decimals)
        } else {
          userInfo = {
            // @ts-ignore
            depositBalance: new TokenAmount(0, farmInfo.lp.decimals),
            // @ts-ignore
            pendingReward: new TokenAmount(0, farmInfo.reward.decimals)
          }
        }

        if((newFarmInfo as any).poolInfo.is_allowed > 0 || 
          (newFarmInfo as any).poolInfo.owner.toBase58() === this.wallet.address){
          let labelized = false;
          if(lp){
            const liquidityItem = get(this.liquidity.infos, lp.mintAddress)
            if(this.labelizedAmms[liquidityItem.ammId]){
              labelized = this.labelizedAmms[liquidityItem.ammId];
              if(labelized){
                if(this.labelizedAmms[liquidityItem.ammId].pfo == true && newFarmInfo.poolId == this.labelizedAmms[liquidityItem.ammId].pfarmID){       
                  const query = new URLSearchParams(window.location.search);
                  if(query.get('f') && this.labelizedAmms[liquidityItem.ammId].slug == query.get('f')){
                    isPFO = true;

                    newFarmInfo.twitterShare = `http://twitter.com/share?text=Earn ${newFarmInfo.reward.name} with our new farm on @CropperFinance&url=https://cropper.finance?s=${newFarmInfo.poolId} &hashtags=${newFarmInfo.lp.coin.symbol},${newFarmInfo.lp.pc.symbol},yieldfarming,Solana`


                    farms.push({
                      labelized,
                      userInfo,
                      farmInfo: newFarmInfo
                    })


                    document.title = 'Fertilizez - CropperFinance x ' + this.labelizedAmms[liquidityItem.ammId].name ;

                    let responseData
                    try{
                      responseData = await fetch(
                        'https://api.cropper.finance/pfo/?farmId= '+ this.labelizedAmms[liquidityItem.ammId].pfarmID + '&t='+ Math.round(moment().unix()/60)
                      ).then(res => res.json());
                    }
                    catch{
                    }
                    finally{
                      if(responseData[this.wallet.address]){
                        this.isRegistered = true;
                        this.registeredDatas = responseData[this.wallet.address];
                        this.shareWalletAddress = "http://cropper.finance/fertilizer/project/?f=" + this.labelizedAmms[liquidityItem.ammId].slug + "&r=" + this.wallet.address;
                      }

                      this.followerCount = Object.keys(responseData).length;
                    }


                  }
                }
              }
            }
          }

        }
        
      }




      this.farms = farms.sort((a: any, b: any ) => (b.farmInfo.liquidityUsdValue - a.farmInfo.liquidityUsdValue));
      this.endedFarmsPoolId = endedFarmsPoolId
      this.filterFarms(this.searchName);

/*
      if(Object.keys(this.farms).length < 1 && Object.keys(this.labelizedAmms).length > 0){
        this.$router.push({
           path: '/fertilizer/'
       })
      }
*/
    },
    filterFarms(searchName:string){
      this.showFarms = this.farms;

      //filter for not allowed farms
      this.showFarms = this.showFarms.filter((farm:any)=>
                                              farm.farmInfo.poolInfo.is_allowed > 0 || 
                                              (farm.farmInfo.poolInfo.owner.toBase58() === this.wallet.address &&
                                              farm.farmInfo.poolInfo.is_allowed === 0));

      if(searchName != "" && searchName != null && this.farms.filter((farm:any)=>farm.farmInfo.poolId.toLowerCase() == searchName.toLowerCase())){
        this.showFarms = this.farms.filter((farm:any)=>farm.farmInfo.poolId.toLowerCase() == searchName.toLowerCase());
      } else if(searchName != "" && searchName != null){
        this.showFarms = this.farms.filter((farm:any)=>farm.farmInfo.lp.symbol.toLowerCase().includes(searchName.toLowerCase()));
      }
    },

    updateCurrentLp(newTokenAccounts: any) {
      if (this.lp) {
        const coin = cloneDeep(this.lp)
        // @ts-ignore
        const lpBalance = get(newTokenAccounts, `${this.lp.mintAddress}.balance`)
        // @ts-ignore
        coin.balance = lpBalance

        this.lp = coin
      }
    },

    openStakeModal(poolInfo: FarmInfo, lp: any) {
      /*
      const coin = cloneDeep(lp)
      const lpBalance = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
      coin.balance = lpBalance

      this.lp = coin
      */
      this.farmInfo = cloneDeep(poolInfo)
      const coinBalance = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.coin.mintAddress}.balance`)
      const pcBalance = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.pc.mintAddress}.balance`)
      this.farmInfo.lp.coin.balance = coinBalance;
      this.farmInfo.lp.pc.balance = pcBalance;
      this.stakeModalOpening = true
    },
    openAddRewardModal(farm:any){
      const rewardCoin = farm.farmInfo.reward;
      const coin = cloneDeep(rewardCoin)
      const rewardBalance = get(this.wallet.tokenAccounts, `${rewardCoin.mintAddress}.balance`)
      coin.balance = rewardBalance

      this.rewardCoin = coin
      this.farmInfo = cloneDeep(farm.farmInfo)
      this.addRewardModalOpening = true
    },
    async addReward(amount:string){
      this.adding = true;
      const conn = this.$web3
      const wallet = (this as any).$wallet
      const rewardAccountAddress = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)

      let fetchedFarm = await YieldFarm.loadFarm(
        conn,
        new PublicKey(this.farmInfo.poolId),
        new PublicKey(FARM_PROGRAM_ID)
      )
      
      if(fetchedFarm){
        //transfer reward amount
        let addRewardAmount:number = Number.parseFloat(amount);
        let userRwardTokenPubkey = new PublicKey(rewardAccountAddress);

        const key = getUnixTs().toString()
        this.$notify.info({
          key,
          message: 'Making transaction...',
          description: '',
          duration: 0
        })
        fetchedFarm.addReward(
          wallet,
          userRwardTokenPubkey,
          addRewardAmount * Math.pow(10,this.farmInfo.reward.decimals)
        )
        .then((txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Add ${amount} ${this.farmInfo.reward.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Adding Reward failed',
            description: error.message
          })
        })
        .finally(() => {
          this.adding = false
          this.addRewardModalOpening = false
        })
      }

    },
    async payFarmFee(farm:any){
      this.paying = true;
      const conn = this.$web3
      const wallet = (this as any).$wallet
      let key = "USDC";
      const usdcCoin = TOKENS[key];// to test. real - USDC
      const usdcAccountAddress = get(this.wallet.tokenAccounts, `${usdcCoin.mintAddress}.tokenAccountAddress`)
      const usdcBalance = get(this.wallet.tokenAccounts, `${usdcCoin.mintAddress}.balance`)
      if(usdcAccountAddress === undefined || usdcAccountAddress === ""){
        this.$notify.error({
            key,
            message: 'Paying farm fee failed',
            description: "Add USDC token in your wallet, please"
          });
        return;
      }

      // check balance if wallet has enough fee
      if(usdcBalance < PAY_FARM_FEE){
        this.$notify.error({
            key,
            message: 'Paying farm fee failed',
            description: "Your USDC balance is low than farm fee"
          });
        return;
      }

      let fetchedFarm = await YieldFarm.loadFarm(
        conn,
        new PublicKey(farm.farmInfo.poolId),
        new PublicKey(FARM_PROGRAM_ID)
      )
      
      if(fetchedFarm){
        //pay farm fee
        let userUSDCTokenPubkey = new PublicKey(usdcAccountAddress);

        const key = getUnixTs().toString()
        this.$notify.info({
          key,
          message: 'Making transaction...',
          description: '',
          duration: 0
        })
        fetchedFarm.payFarmFee(
          wallet,
          userUSDCTokenPubkey,
          PAY_FARM_FEE * Math.pow(10,usdcCoin.decimals)
        )
        .then((txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Pay ${PAY_FARM_FEE} ${usdcCoin.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Paying farm fee failed',
            description: error.message
          })
        })
        .finally(() => {
          this.paying = false
        })
      }
    },
    supplyAndStake(fromCoinAmount: string,toCoinAmount: string,fixedCoin: string) {
      this.staking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet
      
      const poolInfo = get(this.liquidity.infos, this.farmInfo.lp.mintAddress)

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)
      // @ts-ignore
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.coin.mintAddress}.tokenAccountAddress`)
      // @ts-ignore
      const toCoinAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      });

      let txStatus = "";
      addLiquidity(
        conn,
        wallet,
        poolInfo,
        fromCoinAccount,
        toCoinAccount,
        lpAccount,
        this.farmInfo.lp.coin,
        this.farmInfo.lp.pc,
        fromCoinAmount,
        toCoinAmount,
        fixedCoin
      )
      .then(async (txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
            ])
        })

        const description = `Add liquidity for ${fromCoinAmount} ${this.farmInfo.lp.coin?.symbol} and ${toCoinAmount} ${this.farmInfo.lp.pc?.symbol}`
        this.$accessor.transaction.sub({ txid, description })

        txStatus = this.$accessor.transaction.history[txid].status;
        let totalDelayTime = 0;
        while(txStatus === "Pending" && totalDelayTime < 10000){
          let delayTime = 500;
          await this.delay(delayTime);
          totalDelayTime += delayTime;
          txStatus = this.$accessor.transaction.history[txid].status;
          await this.delay(delayTime);
          totalDelayTime += delayTime;
        }
        if(txStatus === "Fail"){
          console.log("add lp failed")
          return;
        }
        //update wallet token account infos
        this.$accessor.wallet.getTokenAccounts();
        let delayForUpdate = 500;
        await this.delay(delayForUpdate);

        let amount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.balance`)
        if(amount){
          amount = amount.wei.toNumber() / Math.pow(10,amount.decimals);
        }
        else{
          amount = 0;
        }

        totalDelayTime = 0;
        while(amount <= 0 && totalDelayTime < 10000){ 
          let dealyTime = 200;
          await this.delay(dealyTime);
          totalDelayTime += dealyTime;
          amount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.balance`)
          if(amount){
            amount = amount.wei.toNumber() / Math.pow(10,amount.decimals);
          }
          else{
            amount = 0;
          }
        }

        if(amount <= 0){
          this.$notify.error({
            key,
            message: 'Add liquidity failed',
            description: "Added LP token amount is 0"
          })
          console.log("added lp amount is 0")
          return;
        }

        this.stakeLP(conn, wallet,this.farmInfo, lpAccount, rewardAccount, infoAccount, amount);
        
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Add liquidity failed',
          description: error.message
        });
      })
      .finally(async () => {
      })
    },
    async stakeLP(conn:any, wallet:any,farmInfo:any,lpAccount:any, rewardAccount:any, infoAccount:any, amount:number){

      const key = getUnixTs().toString()

      deposit(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, amount)
      .then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
            ])
        })

        const description = `Stake ${amount} ${this.farmInfo.lp.name}`
        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Stake failed',
          description: error.message
        });
        this.tempInfo = {
          conn:conn,
          wallet:wallet,
          farmInfo:farmInfo,
          lpAccount:lpAccount,
          rewardAccount:rewardAccount,
          infoAccount:infoAccount,
          amount:amount
        };
        this.stakeLPError = true;
      })
      .finally(() => {
        this.staking = false
        this.stakeModalOpening = false
        this.farmInfo = null
      })
    },
    onRetryStakeLP(){
      this.stakeLPError = false;
      if(!this.tempInfo)
      {
        return;
      }

      this.stakeLP(this.tempInfo.conn,this.tempInfo.wallet,this.tempInfo.farmInfo,this.tempInfo.lpAccount,this.tempInfo.rewardAccount,this.tempInfo.infoAccount,this.tempInfo.amount);
      this.tempInfo = null;
    },
    onRemoveLiquidity(){
      this.stakeLPError = false;
      if(!this.tempInfo)
      {
        return;
      }

      const fromCoinAccount = get(this.wallet.tokenAccounts, `${this.tempInfo.farmInfo.lp.coin.mintAddress}.tokenAccountAddress`)
      const toCoinAccount = get(this.wallet.tokenAccounts, `${this.tempInfo.farmInfo.lp.pc.mintAddress}.tokenAccountAddress`)
      this.removeLP(this.tempInfo.conn,this.tempInfo.wallet,this.tempInfo.farmInfo.lp,this.tempInfo.lpAccount,fromCoinAccount,toCoinAccount,this.tempInfo.amount);

      this.tempInfo = null;
    },
    async delay(ms: number) {
        return new Promise( resolve => setTimeout(resolve, ms) );
    },
    cancelStake() {
      this.lp = null
      this.farmInfo = null
      this.stakeModalOpening = false
    },
    onNothing(){
      this.stakeLPError = false;
      this.tempInfo = null;
    },
    cancelAddReward() {
      this.rewardCoin = null
      this.farmInfo = null
      this.addRewardModalOpening = false
    },

    openUnstakeModal(poolInfo: FarmInfo, lp: any, lpBalance: any) {
      const coin = cloneDeep(lp)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(poolInfo)
      this.unstakeModalOpening = true
    },

    unstakeAndRemove(amount: string) {
      this.unstaking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet
      const coin = this.farmInfo.lp.coin;
      const pc = this.farmInfo.lp.pc;
      const lp = this.farmInfo.lp;

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${coin.mintAddress}.tokenAccountAddress`)
      const toCoinAccount = get(this.wallet.tokenAccounts, `${pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      withdraw(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
        .then(async (txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Unstake ${amount} ${lp.name}`
          this.$accessor.transaction.sub({ txid, description })

          let txStatus = this.$accessor.transaction.history[txid].status;
          while(txStatus === "Pending"){
            await this.delay(500);
            txStatus = this.$accessor.transaction.history[txid].status;
            await this.delay(500);
          }
          if(txStatus === "Fail"){
            console.log("unstake transaction failed")
            return;
          }
          let value = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
          value = value.wei.toNumber() / Math.pow(10,value.decimals);
          if(value <= 0){
            console.log("remove lp amount is 0")
            return;
          }
          value = value.toString();

          this.removeLP(conn, wallet,lp,lpAccount, fromCoinAccount, toCoinAccount, value);

        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Stake failed',
            description: error.message
          })
        })
        .finally(() => {
        })
    },
    removeLP(conn:any,wallet:any,lp:any,lpAccount:any, fromCoinAccount:any, toCoinAccount:any, value:any){
      const key = getUnixTs().toString()
      const poolInfo = get(this.liquidity.infos, lp.mintAddress);
      //remove whole lp amount
      removeLiquidity(conn, wallet, poolInfo, lpAccount, fromCoinAccount, toCoinAccount, value)
      .then((txid) => {
        this.$notify.info({
          key,
          message: 'Transaction has been sent',
          description: (h: any) =>
            h('div', [
              'Confirmation is in progress.  Check your transaction on ',
              h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
            ])
        })

        const description = `Remove liquidity for ${value} ${lp.name}`

        this.$accessor.transaction.sub({ txid, description })
      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Remove liquidity failed',
          description: error.message
        })
      })
      .finally(() => {
        this.unstaking = false
        this.unstakeModalOpening = false
      })
    },

    cancelUnstake() {
      this.lp = null
      this.farmInfo = null
      this.unstakeModalOpening = false
    },
    getAmmId(farmInfo:FarmInfo){
      //get liquidity pool info
        let liquidityPoolInfo:LiquidityPoolInfo = LIQUIDITY_POOLS.find((item) => item.lp.mintAddress === farmInfo.lp.mintAddress) as any;

        //check liquidity pool
        if(liquidityPoolInfo == undefined){
          console.log("find liquidity pool error");
          return "";
        }
        return liquidityPoolInfo.ammId;
    },

    harvest(farmInfo: FarmInfo) {
      this.harvesting = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      deposit(conn, wallet, farmInfo, lpAccount, rewardAccount, infoAccount, '0')
        .then((txid) => {
          this.$notify.info({
            key,
            message: 'Transaction has been sent',
            description: (h: any) =>
              h('div', [
                'Confirmation is in progress.  Check your transaction on ',
                h('a', { attrs: { href: `${this.url.explorer}/tx/${txid}`, target: '_blank' } }, 'here')
              ])
          })

          const description = `Harvest ${farmInfo.reward.symbol} from ${farmInfo.lp.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Harvest failed',
            description: error.message
          })
        })
        .finally(() => {
          this.$accessor.farm.requestInfos()
          this.harvesting = false
        })
    },
    getCountdownFromPeriod(period:number){
      let remain = period;
      let days = Math.floor(remain / ( 24 * 3600));
      remain = remain % (24 * 3600);
      let hours = Math.floor(remain / 3600);
      remain = remain % 3600;
      let minutes = Math.floor(remain / 60);
      remain = remain % 60;
      let seconds = remain;
      
      return ""+days+"d : "+hours + "h : "+minutes+"m";
      
    }
  }
})
</script>

<style lang="less" scoped>
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}
.card-body {
  padding: 0;
  margin: 0;
  border:none
}
.pf-record{
  border-bottom:none !important
}
.radioButtonStyle {
  width: 50%;
  text-align: center;
}

.fertilizeruniq{
  max-width: 1200px;
  margin: 30px auto;

  .notstep{
    padding:20px
  }
}

.fertilizeruniq .list{
  text-align:center;
  width:1300px;
  max-width: 1200px;
  margin-left:auto;
  margin-right:auto;

  .pf-record .pf-record-content{
    padding:0;
  }

  .singleFarm{
    width:calc(33.33333333% - 20px);
    display:inline-block;
    vertical-align:top;
    border-bottom:none !important;
    position:relative;
    margin:0 10px 20px 10px;
    background:#1B2028;

    .banner{
      height:100px;
      position:relative;
      overflow:hidden;

      .large{
        background:#f00;
        height:100px;
        min-width:100%;
        left:50%;
        top:50%;
        position:absolute;
        object-fit: cover;
        transform:translate(-50%,-50%)
      }
    }

    .info{
      margin-bottom:20px
    }

    .followerscount{
      text-align: left;
      font-weight: bold;
      font-size: 17px;
    }

    .ant-col{
      padding:0 10px 5px 10px;
    }

    .small{
      width: 70px;
      border: 4px solid #000;
      border-radius:50%;
      top:100px;
      z-index:2;
      left:50%;
      position:absolute;
      background:#000;
      transform:translate(-50%,-50%)
    }

    .title{
      font-size: 20px;
      margin-top: 40px;
      margin-bottom: 5px;
    }

    .icons img{
      max-height:24px;
    }
  } 
}




</style>

<style lang="less">

.text-center{
  text-align:center
}

.fertilizeruniq {

  h1{
      margin:20px;
      font-size:30px;
  }

  .info{
    font-weight: bold;
    padding: 20px;
  }

  input.link{
    color: #000;
    padding: 5px 20px;
    display: inline-block;
    width: 90%;
    border-radius: 5px;
    border: none;
    margin-top: 5px;
  }

  .steps > div{
    border:1px solid #ccc;
    border-radius:5px;
    padding:5px 10px;
    margin:10px 30px;
  }

  .followerscount{
    font-size:24px;
  }

  .airdropInfo,
  .rewardAmount{
    font-size:20px;
  }


  .notdone{
    opacity:.7;
  }

  .done:last-of-type{
    font-weight:bold;
  }

  .icons{
    margin-left:20px
  }

  .icons img{
    max-width:40px;
    margin-bottom:10px;
  }

  .page-head .title{
    position: absolute;
    left: 50%;
    transform: translate(-50%, 0);
  }

  .farm-head {
    padding: 24px 32px !important;
  }

  .ant-collapse-header {
    padding: 0 !important;

    .farm-head {
      padding: 24px 32px !important;
    }
  }

  .ant-collapse-content {
    border-top: 1px solid #1c274f;
    background-color: rgba(0, 0, 0, 0.9471) !important;
  
  }
}

.ant-alert-warning {
  width: 500px;
  margin-top: 30px;
  background-color: transparent;
  border: 1px solid #85858d;

  .anticon-close {
    color: #fff;
  }
}


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


  .label.soon{
      border: 1px solid #13d89d;
      color:#13d89d;
    position: absolute;
    padding: 0 20px 0 20px;
    border-radius: 3px;
    right: 60px;
  }

  .label.ended{
      border: 1px solid #f00;
      color:#f00;
    position: absolute;
    padding: 0 20px 0 20px;
    border-radius: 3px;
    right: 60px;
  }

main{
  background-color:#000;
  background-image:unset;
  background-size:cover;
  background-position:center bottom;
}

.ant-table-thead > tr > th.ant-table-column-sort {
  background: transparent;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled) {
  color: #fff;
  background: #1c274f;
  border: 1px solid #d9d9d9;
  box-shadow: none;
  border-left-width: 0;
}
.ant-radio-button-wrapper {
  color: #aaa;
  background: transparent;
  // border: 1px solid #d9d9d9;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):hover {
  border: 1px solid #d9d9d9;
  box-shadow: none;
}
.ant-radio-button-wrapper-checked:not(.ant-radio-button-wrapper-disabled):first-child {
  border: 1px solid #d9d9d9;
}
.input-search{
  border-radius: 5px;
}
.pf-arrow{
    text-align: right;
}
.pf-record{
    background-color: #000;
    border-bottom: 1px solid #d9d9d9;

    .pf-record-content{
      padding: 36px 32px 56px 32px;
    }
}
.farm {

  .ant-collapse-header {
    padding: 0 !important;

    .farm-head {
      padding: 24px 32px !important;
    }
  }

  .ant-collapse-content {
    border-top: 1px solid #1c274f;
    background-color: rgba(0, 0, 0, 0.9471) !important;
  
  }
}

.farm.container {
  max-width: 1200px;
  background: #1B2028;
  margin-top:20px;
  margin-bottom:20px;


  .page-head a{
    z-index: 2;
    padding-left: 15px;
    background: #1b2028;
    position: absolute;
    right: 0;

    .btncontainer{
      display:inline-block
    }
  }

  .card {
    .card-body {
      padding: 0;
      background:#000;
      overflow-x: scroll;
      scrollbar-width: none;
      -ms-overflow-style: none;

      .ant-collapse {
        border: 0;
        background-color: rgba(0, 0, 0, 0.9471);

        .ant-collapse-item {
          border-bottom: 0;
        }

        .ant-collapse-item:not(:last-child) {
          border-bottom: 1px solid #d9d9d9;
        }

      }

      .start .btncontainer{
        display: inline-block;
      }
    }
  }

  .harvest {
    .reward {
      .token {
        font-weight: 600;
        font-size: 20px;
      }

      .value {
        font-size: 12px;
      }
    }

    button {
      padding: 0 30px;
    }
  }

  .start {
    .unstarted {
      .token {
        font-weight: 600;
        font-size: 20px;
      }

      .value {
        font-size: 12px;
      }
    }
    
    .unstake {
      margin-right: 10px;
    }

    button {
      width: 100%;
    }
  }

  .harvest,
  .start {
    padding: 16px;
    border: 2px solid #1c274f;
    border-radius: 4px;

    .title {
      font-weight: 600;
      font-size: 12px;
      text-transform: uppercase;
      margin-bottom: 8px;
    }

  }

  .farm-head {
    display: flex;
    align-items: center;

    .lp-icons {
      width: 32%;
      left: 6%;

      .icons {
        margin-right: 8px;
      }
    }

    .state {
      display: flex;
      flex-direction: column;
      text-align: left;

      .title {
        font-size: 12px;
        text-transform: uppercase;
      }

      .value {
        font-size: 16px;
        line-height: 24px;
      }
    }
  }

  .farm-head.is-mobile {
    padding: 24px 16px !important;
  }

  .is-mobile {
    .harvest,
    .start {
      margin-top: 16px;
    }
  }

  p {
    margin-bottom: 0;
  }
}
</style>


