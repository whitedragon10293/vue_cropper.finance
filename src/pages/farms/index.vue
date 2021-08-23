<template>
  <div class="farm container">
    <div class="page-head fs-container">
      <span class="title">Farms</span>
      <div class="buttons">
        <!-- <span>
          <RadioGroup v-model="poolType" style="display: inline-block; margin: 0 auto; padding-right: 30px">
            <RadioButton class="radioButtonStyle" :value="true"> Active </RadioButton>
            <RadioButton class="radioButtonStyle" :value="false"> Ended </RadioButton>
          </RadioGroup>
        </span> -->


        <NuxtLink to="/farms/create-farm/">
          <div class="btncontainer">
            <Button size="large" ghost>
              Create a farm
            </Button>
          </div>
        </NuxtLink>



        <Tooltip v-if="farm.initialized" placement="bottomRight">
          <template slot="title">
            <span>
              Displayed data will auto-refresh after
              {{ farm.autoRefreshTime - farm.countdown }} seconds. Click this circle to update manually.
            </span>
          </template>
          <Progress
            type="circle"
            :width="20"
            :stroke-width="10"
            :percent="(100 / farm.autoRefreshTime) * farm.countdown"
            :show-info="false"
            :class="farm.loading ? 'disabled' : ''"
            @click="
              () => {
                $accessor.farm.requestInfos()
                $accessor.wallet.getTokenAccounts()
              }
            "
          />
        </Tooltip>
      </div>
    </div>

    <CoinModal
      v-if="stakeModalOpening"
      title="Stake LP"
      :coin="lp"
      :loading="staking"
      @onOk="stake"
      @onCancel="cancelStake"
    />
    <CoinModal
      v-if="unstakeModalOpening"
      title="Unstake LP"
      :coin="lp"
      :loading="unstaking"
      @onOk="unstake"
      @onCancel="cancelUnstake"
    />
    <CoinModal
      v-if="addRewardModalOpening"
      title="Add Reward"
      :coin="rewardCoin"
      :loading="adding"
      @onOk="addReward"
      @onCancel="cancelAddReward"
    />

    <div v-if="farm.initialized">
      <div class="card">
        <div class="card-body">
          <Collapse v-model="showCollapse" expand-icon-position="right">
            <CollapsePanel
              v-for="farm in farms"
              v-show="
                (!endedFarmsPoolId.includes(farm.farmInfo.poolId) && !farm.farmInfo.legacy && poolType) ||
                ((endedFarmsPoolId.includes(farm.farmInfo.poolId) || farm.farmInfo.legacy) && !poolType)
              "
              :key="farm.farmInfo.poolId"
              :show-arrow="poolType"
            >
              <Row slot="header" class="farm-head" :class="isMobile ? 'is-mobile' : ''" :gutter="0">
                <Col class="lp-icons" :span="isMobile ? 12 : 8">
                  <div class="icons">
                    <CoinIcon :mint-address="farm.farmInfo.lp.coin.mintAddress" />
                    <CoinIcon :mint-address="farm.farmInfo.lp.pc.mintAddress" />
                  </div>
                  {{ isMobile ? farm.farmInfo.lp.symbol : farm.farmInfo.lp.name }}
                </Col>
                <Col class="state" :span="isMobile ? 6 : 4">
                  <div class="title">{{ isMobile ? 'Reward' : 'Pending Reward' }}</div>
                  <div class="value">{{ farm.userInfo.pendingReward.format() }}</div>
                </Col>
                <Col v-if="!isMobile" class="state" :span="4">
                  <div class="title">Staked</div>
                  <div class="value">
                    {{ farm.userInfo.depositBalance.format() }}
                  </div>
                </Col>
                <Col class="state" :span="isMobile ? 6 : 4">
                  <div class="title">Apr</div>
                  <div class="value">{{ farm.farmInfo.apr }}%</div>
                </Col>
                <Col v-if="!isMobile && poolType" class="state" :span="4">
                  <div class="title">Liquidity</div>
                  <div class="value">
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
                  <p>Add liquidity:</p>
                  <NuxtLink
                    :to="`/liquidity?from=${farm.farmInfo.lp.coin.mintAddress}&to=${farm.farmInfo.lp.pc.mintAddress}&ammId=${getAmmId(farm.farmInfo)}`"
                  >
                    {{ farm.farmInfo.lp.name }}
                  </NuxtLink>
                </Col>

                <Col :span="isMobile ? 24 : 10">
                  <div class="harvest">
                    <div class="title">Pending {{ farm.farmInfo.reward.symbol }} Reward</div>
                    <div class="pending fs-container">
                      <div class="reward">
                        <div class="token">{{ farm.userInfo.pendingReward.format() }}</div>
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
                      <div class="btncontainer">
                      <Button
                        v-if="!farm.userInfo.depositBalance.isNullOrZero()"
                        class="unstake"
                        size="large"
                        ghost
                        @click="openUnstakeModal(farm.farmInfo, farm.farmInfo.lp, farm.userInfo.depositBalance)"
                      >
                        <Icon type="minus" />
                      </Button>
                      </div>
                      <div class="btncontainer">
                        <Button v-if="farm.farmInfo.poolInfo.owner.toBase58() == wallet.address" size="large" ghost @click="openAddRewardModal(farm)">
                          Add Reward
                        </Button>
                        <Button v-else size="large" ghost @click="openStakeModal(farm.farmInfo, farm.farmInfo.lp)">
                          Stake LP
                        </Button>
                      </div>
                    </div>
                  </div>
                </Col>
              </Row>
            </CollapsePanel>
          </Collapse>
        </div>
      </div>
    </div>

    <div v-else class="fc-container">
      <Spin :spinning="true">
        <Icon slot="indicator" type="loading" style="font-size: 24px" spin />
      </Spin>
    </div>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { mapState } from 'vuex'
import { Tooltip, Progress, Collapse, Spin, Icon, Row, Col, Button, Radio } from 'ant-design-vue'

import { get, cloneDeep } from 'lodash-es'
import { TokenAmount } from '@/utils/safe-math'
import { FarmInfo } from '@/utils/farms'
import { deposit, withdraw } from '@/utils/stake'
import { getUnixTs } from '@/utils'
import { getBigNumber } from '@/utils/layouts'
import { LiquidityPoolInfo, LIQUIDITY_POOLS } from '@/utils/pools'
import moment from 'moment'
import { u64 } from '@solana/spl-token'
import { YieldFarm } from '@/utils/farm'
import { PublicKey } from '@solana/web3.js'
import { FARM_PROGRAM_ID } from '@/utils/ids'

const CollapsePanel = Collapse.Panel

const RadioGroup = Radio.Group
const RadioButton = Radio.Button

export default Vue.extend({
  components: {
    Tooltip,
    Progress,
    Collapse,
    CollapsePanel,
    Spin,
    Icon,
    Row,
    Col,
    Button
  },

//    ,
//    RadioGroup,
//    RadioButton

  data() {
    return {
      isMobile: false,

      farms: [] as any,

      lp: null,
      rewardCoin: null,
      farmInfo: null as any,
      harvesting: false,
      stakeModalOpening: false,
      addRewardModalOpening: false,
      staking: false,
      adding: false,
      unstakeModalOpening: false,
      unstaking: false,
      poolType: true,
      endedFarmsPoolId: [] as string[],
      showCollapse: [] as any[]
    }
  },

  head: {
    title: 'Raydium Farm'
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
    }
  },

  mounted() {
    this.updateFarms()
  },

  methods: {
    TokenAmount,

    updateFarms() {

      const farms: any = []
      const endedFarmsPoolId: string[] = []
      for (const [poolId, farmInfo] of Object.entries(this.farm.infos)) {
        let userInfo = get(this.farm.stakeAccounts, poolId)

        // @ts-ignore
        const { reward_per_share_net, reward_per_timestamp, last_timestamp } = farmInfo.poolInfo

        // @ts-ignore
        const { reward, lp } = farmInfo

        const newFarmInfo = cloneDeep(farmInfo)

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

          const liquidityUsdValue = getBigNumber(lp.balance.toEther()) * liquidityItemValue;
          let apr = ((rewardPerTimestampAmountTotalValue / liquidityUsdValue) * 100).toFixed(2)
          if(liquidityUsdValue <= 0){
            apr = "0";
          }
          // @ts-ignore
          newFarmInfo.apr = apr
          // @ts-ignore
          newFarmInfo.liquidityUsdValue = liquidityUsdValue

          if (rewardPerTimestampAmount.toEther().toString() === '0') {
            endedFarmsPoolId.push(poolId)
          }
        }

        if (userInfo && lp) {
          userInfo = cloneDeep(userInfo)

          const { rewardDebt, depositBalance } = userInfo
          const liquidityItem = get(this.liquidity.infos, lp.mintAddress)
          const currentTimestamp = moment().unix();
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

        farms.push({
          userInfo,
          farmInfo: newFarmInfo
        })
      }

      this.farms = farms
      this.endedFarmsPoolId = endedFarmsPoolId
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
      const coin = cloneDeep(lp)
      const lpBalance = get(this.wallet.tokenAccounts, `${lp.mintAddress}.balance`)
      coin.balance = lpBalance

      this.lp = coin
      this.farmInfo = cloneDeep(poolInfo)
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
    stake(amount: string) {
      this.staking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      deposit(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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
          })
        })
        .finally(() => {
          this.staking = false
          this.stakeModalOpening = false
        })
    },

    cancelStake() {
      this.lp = null
      this.farmInfo = null
      this.stakeModalOpening = false
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

    unstake(amount: string) {
      this.unstaking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet

      const lpAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.lp.mintAddress}.tokenAccountAddress`)
      const rewardAccount = get(this.wallet.tokenAccounts, `${this.farmInfo.reward.mintAddress}.tokenAccountAddress`)
      const infoAccount = get(this.farm.stakeAccounts, `${this.farmInfo.poolId}.stakeAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })

      withdraw(conn, wallet, this.farmInfo, lpAccount, rewardAccount, infoAccount, amount)
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

          const description = `Unstake ${amount} ${this.farmInfo.lp.name}`
          this.$accessor.transaction.sub({ txid, description })
        })
        .catch((error) => {
          this.$notify.error({
            key,
            message: 'Stake failed',
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
          this.harvesting = false
        })
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
}
.farm.container {
  max-width: 1200px;

  .card {
    .card-body {
      padding: 0;
      overflow-x: scroll;
      scrollbar-width: none;
      -ms-overflow-style: none;

      .ant-collapse {
        border: 0;

        .ant-collapse-item {
          border-bottom: 0;
        }

        .ant-collapse-item:not(:last-child) {
          border-bottom: 1px solid #d9d9d9;
        }
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
    .unstake {
      width: 48px;
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
.radioButtonStyle {
  width: 50%;
  text-align: center;
}
</style>

<style lang="less">
.farm {
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
</style>
