<template>
  <div class="pool container">



    <coinModalMulti 
      v-if="stakeModalOpening"
      title="Add liquidity"
      :loading="staking"
      :farmInfo="poolInf"
      @onOk="stake"
      @onCancel="cancelPoolAdd"
    />

    <CoinModal
      v-if="unstakeModalOpening"
      title="Remove Liquidity"
      :coin="lp"
      :loading="unstaking"
      @onOk="unstake"
      @onCancel="cancelUnstake"
    />


    <div class="card">
      <div class="card-body">

        <div class="page-head fs-container">
        <NuxtLink to="/pools/create-pool/">
          <div class="btncontainer">
            <Button size="large" ghost>
              Create a pool
            </Button>
          </div>
        </NuxtLink>
          <span class="title">Liquidity pools</span>
          <div class="buttons">
            <Tooltip placement="bottomRight">
              <template slot="title">
                <span>
                  Displayed data will auto-refresh after
                  {{ autoRefreshTime - countdown }} seconds. Click this circle to update manually.
                </span>
              </template>
              <Progress
                type="circle"
                :width="20"
                :stroke-width="10"
                :percent="(100 / autoRefreshTime) * countdown"
                :show-info="false"
                :class="loading ? 'disabled' : ''"
                @click="
                  () => {
                    flush()
                    $accessor.wallet.getTokenAccounts()
                  }
                "
              />
            </Tooltip>
          </div>
        </div>

        <Table :columns="columns" :data-source="poolsShow" :pagination="false" row-key="lp_mint">
          <span slot="name" slot-scope="text" class="lp-icons">
            {{ void (pool = getPoolByLpMintAddress(text)) }}
            <div class="icons">
              <CoinIcon :mint-address="pool ? getPoolByLpMintAddress(text).lp.coin.mintAddress : ''" />
              <CoinIcon :mint-address="pool ? getPoolByLpMintAddress(text).lp.pc.mintAddress : ''" />
            </div>
            <span>{{ pool.name }}</span>
          </span>
          <span slot="liquidity" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }}</span>
          <span slot="volume_24h" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} (?)</span>
          <span slot="volume_7d" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} (?)</span>
          <span slot="fee_24h" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} (?)</span>
          <span slot="apy" slot-scope="text"> {{ new TokenAmount(text, 2, false).format() }}% (?)</span>
          <span slot="current" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }}</span>
          <span slot="apu" slot-scope="text, pool"  >{{ text }} 

            <div class="btncontainer">
              <Button size="small" ghost :disabled="!wallet.connected"
                  @click="openPoolAddModal(pool)">
                <Icon type="plus" />
              </Button>
            </div>

            &nbsp;


            <div class="btncontainer">
              <Button size="small" ghost :disabled="!wallet.connected || !pool.current"
                  @click="openUnstakeModal(pool, pool.lp, 1)">
                <Icon type="minus" />
              </Button>
            </div>

          </span>
        </Table>
      </div>
    </div>
  </div>
</template>

<script lang="ts">

import { get, cloneDeep } from 'lodash-es'
import { Vue, Component, Watch } from 'nuxt-property-decorator'
import { mapState } from 'vuex'
import { Table, Radio, Progress, Tooltip, Button, Input, Icon } from 'ant-design-vue'
import { getPoolByLpMintAddress, getAllPools } from '@/utils/pools'
import { TokenAmount } from '@/utils/safe-math'
import { getBigNumber } from '@/utils/layouts'
import { addLiquidity, removeLiquidity } from '@/utils/liquidity'
import { LiquidityPoolInfo } from '@/utils/pools'
import { getUnixTs } from '@/utils'
const RadioGroup = Radio.Group
const poolAdd = false
const RadioButton = Radio.Button
@Component({
  head: {
    title: 'Cropper Finance Pools'
  },

  computed: {
    ...mapState([
      // 'wallet', 
      'swap', 'liquidity', 'price', 'url', 'setting'])
  },

  data() {
    return {
      isMobile: false,
      farms: [] as any,
      fromCoin : false,
      lpMintAddress : false,
      toCoin : false,
      poolAdd : false
    }
  },
  components: {
    Table,
    RadioGroup,
    RadioButton,
    Progress,
    Tooltip,
    Button,
    Input,
    Icon
  },
  async asyncData({ $api }) {
    const pools = getAllPools()
    return { pools }
  }
})


export default class Pools extends Vue {
  columns = [
    {
      title: 'Name',
      dataIndex: 'lp_mint',
      key: 'lp_mint',
      scopedSlots: { customRender: 'name' }
    },
    {
      title: 'Liquidity',
      dataIndex: 'liquidity',
      key: 'liquidity',
      scopedSlots: { customRender: 'liquidity' },
      defaultSortOrder: 'descend',
      sorter: (a: any, b: any) => a.liquidity - b.liquidity
    },
    {
      title: 'Volume (24hrs)',
      dataIndex: 'volume_24h',
      key: 'volume_24h',
      scopedSlots: { customRender: 'volume_24h' },
      sorter: (a: any, b: any) => a.volume_24h - b.volume_24h
    },
    {
      title: 'Volume (7d)',
      dataIndex: 'volume_7d',
      key: 'volume_7d',
      scopedSlots: { customRender: 'volume_7d' },
      sorter: (a: any, b: any) => a.volume_7d - b.volume_7d
    },
    {
      title: 'Fees (24hr)',
      dataIndex: 'fee_24h',
      key: 'fee_24h',
      scopedSlots: { customRender: 'fee_24h' },
      sorter: (a: any, b: any) => a.fee_24h - b.fee_24h
    },
    {
      title: '1y Fees / Liquidity',
      dataIndex: 'apy',
      key: 'apy',
      scopedSlots: { customRender: 'apy' },
      sorter: (a: any, b: any) => a.apy - b.apy
    },

    {
      title: 'Your liquidity',
      dataIndex: 'current',
      key: 'current',
      scopedSlots: { customRender: 'current' },
      sorter: (a: any, b: any) => a.current - b.current
    },

    {
      title: '',
      dataIndex: 'apu',
      scopedSlots: { customRender: 'apu' },
      key: 'apu'
    }
  ]
  pools: any = []
  poolsShow: any = []
  poolType: string = 'RaydiumPools'
  fromCoin: any = false
  staking: any = false
  lp: any = false
  unstaking: any = false
  wallet: any = this.$accessor.wallet
  lpMintAddress: any = false
  stakeModalOpening: any = false
  unstakeModalOpening: any = false
  toCoin: any = false
  poolAdd: any = false
  poolInf: any = false
  lptoken: any = false
  autoRefreshTime: number = 60
  countdown: number = 0
  timer: any = null
  loading: boolean = false
  searchButton = true
  searchName = ''

  get liquidity() {
    this.$accessor.wallet.getTokenAccounts()
    return this.$accessor.liquidity
  }
  @Watch('$accessor.liquidity.initialized', { immediate: true, deep: true })
  refreshThePage() {
    this.showPool()
  }
  @Watch('$accessor.liquidity.info', { immediate: true, deep: true })
  async onLiquidityChanged() {
    this.pools = this.poolsFormated()
    this.showPool()
  }
  @Watch('poolType')
  onPoolTypeChanged() {
    this.showPool()
  }
  @Watch('searchName')
  onSearchNameChanged() {
    this.showPool()
  }
  showPool() {
    const pool = []
    for (const item of this.pools) {
          pool.push(item)
    }
    this.poolsShow = pool


  }

  async delay(ms: number) {
      return new Promise( resolve => setTimeout(resolve, ms) );
  }

  openUnstakeModal(poolInfo : any, lp: any, lpBalance: any) {

    const coin = cloneDeep(lp)
    coin.balance = get(this.wallet.tokenAccounts, `${coin.mintAddress}.balance`)
    this.lp = coin

    this.poolInf = cloneDeep(poolInfo)

    this.unstakeModalOpening = true
  }

  cancelUnstake(){
    this.unstakeModalOpening = false
  }


  unstake(amount: string) {
    this.unstaking = true

    const conn = this.$web3
    const wallet = (this as any).$wallet
    const coin = this.poolInf.lp.coin;
    const pc = this.poolInf.lp.pc;
    const lp = this.poolInf.lp;

    const lpAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.tokenAccountAddress`)
    const fromCoinAccount = get(this.wallet.tokenAccounts, `${coin.mintAddress}.tokenAccountAddress`)
    const toCoinAccount = get(this.wallet.tokenAccounts, `${pc.mintAddress}.tokenAccountAddress`)

    const key = getUnixTs().toString()
    this.$notify.info({
      key,
      message: 'Making transaction...',
      description: '',
      duration: 0
    })


    const poolInfo = get(this.liquidity.infos, lp.mintAddress);
    //remove whole lp amount
    removeLiquidity(conn, wallet, poolInfo, lpAccount, fromCoinAccount, toCoinAccount, amount)
    .then((txid) => {
      this.$notify.info({
        key,
        message: 'Transaction has been sent',
        description: (h: any) =>
          h('div', [
            'Confirmation is in progress.'
          ])
      })

      const description = `Remove liquidity for ${amount} LP Token`

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
      this.flush()
      this.$accessor.wallet.getTokenAccounts()
      this.unstaking = false
      this.unstakeModalOpening = false
    })

  }


  stake(fromCoinAmount: string,toCoinAmount: string,fixedCoin: string) {

      this.staking = true

      const conn = this.$web3
      const wallet = (this as any).$wallet
      
      const poolInfo = get(this.liquidity.infos, this.poolInf.lp.mintAddress)

      const lpAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.tokenAccountAddress`)
      // @ts-ignore
      const fromCoinAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.coin.mintAddress}.tokenAccountAddress`)
      // @ts-ignore
      const toCoinAccount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.pc.mintAddress}.tokenAccountAddress`)

      const key = getUnixTs().toString()
      this.$notify.info({
        key,
        message: 'Making transaction...',
        description: '',
        duration: 0
      })
      addLiquidity(
        conn,
        wallet,
        poolInfo,
        fromCoinAccount,
        toCoinAccount,
        lpAccount,
        this.poolInf.lp.coin,
        this.poolInf.lp.pc,
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
              'Confirmation is in progress.'
            ])
        })

        const description = `Add liquidity for ${fromCoinAmount} ${this.poolInf.lp.coin?.symbol} and ${toCoinAmount} ${this.poolInf.lp.pc?.symbol}`
        this.$accessor.transaction.sub({ txid, description })

        let txStatus = this.$accessor.transaction.history[txid].status;
        while(txStatus === "Pending"){
          await this.delay(500);
          txStatus = this.$accessor.transaction.history[txid].status; 
          await this.delay(500);
        }
        if(txStatus === "Fail"){
          console.log("add lp failed")
          return;
        }
        let amount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.balance`)
        //stake whole lp amount
        amount = amount.wei.toNumber() / Math.pow(10,amount.decimals);
        let delayTime = 0;
        while(amount <= 0 && delayTime < 10000){ //after 4 seconds ,it's failed
          await this.delay(200);
          delayTime += 200;
          amount = get(this.wallet.tokenAccounts, `${this.poolInf.lp.mintAddress}.balance`)
          amount = amount.wei.toNumber() / Math.pow(10,amount.decimals);
        }
        if(amount <= 0){
          console.log("added lp amount is 0")
          return;
        }

      })
      .catch((error) => {
        this.$notify.error({
          key,
          message: 'Add liquidity failed',
          description: error.message
        })
      })
      .finally(async () => {
        this.flush()
        this.$accessor.wallet.getTokenAccounts()
        this.staking = false
        this.stakeModalOpening = false
      })
    }


  poolsFormated(){

    const conn = this.$web3
    const wallet = (this as any).$accessor.wallet
    const liquidity = ((this as any).$accessor.liquidity);
    const price = ((this as any).$accessor.price);


    const polo:any = []

    getAllPools().forEach(function (value : any) {


      const liquidityItem = get(liquidity.infos, value.lp_mint)
      let lp = getPoolByLpMintAddress(value.lp_mint); 


      const liquidityCoinValue =
        getBigNumber((liquidityItem?.coin.balance as TokenAmount).toEther()) *
        price.prices[liquidityItem?.coin.symbol as string]
      const liquidityPcValue =
        getBigNumber((liquidityItem?.pc.balance as TokenAmount).toEther()) *
        price.prices[liquidityItem?.pc.symbol as string]
      const liquidityTotalValue = liquidityPcValue + liquidityCoinValue

      const liquidityTotalSupply = getBigNumber((liquidityItem?.lp.totalSupply as TokenAmount).toEther())
      const liquidityItemValue = liquidityTotalValue / liquidityTotalSupply
      


      value.liquidity = liquidityTotalValue;

      if(liquidityPcValue != 0 && liquidityCoinValue != 0){


        if(wallet){
            value.current = get(wallet.tokenAccounts, `${value.lp_mint}.balance`)
            if(value.current){
              value.current = (value.current.wei.toNumber() / Math.pow(10,value.current.decimals)) * liquidityItemValue;
            } else {
              value.current = 0;
            }
        } else {
          value.current = 0;
        }


        polo.push(value);

      }
    });
    console.log(polo);
    return polo
  }

  openPoolAddModal(poolInfo: any) {


      this.poolInf = cloneDeep(poolInfo)
      const coinBalance = get(this.wallet.tokenAccounts, `${this.poolInf.coin1.mintAddress}.balance`)
      const pcBalance = get(this.wallet.tokenAccounts, `${this.poolInf.coin2.mintAddress}.balance`)
      this.poolInf.lp.coin.balance = coinBalance;
      this.poolInf.lp.pc.balance = pcBalance;
      this.stakeModalOpening = true


  }

  cancelPoolAdd() {
    this.fromCoin = null
    this.toCoin = null
    this.lptoken = null
    this.lpMintAddress = null
    this.stakeModalOpening = false
  }

  mounted() {
    this.setTimer()
  }
  setTimer() {
    this.timer = setInterval(async () => {
      if (!this.loading) {
        if (this.countdown < this.autoRefreshTime) {
          this.countdown += 1
          if (this.countdown === this.autoRefreshTime) {
            await this.flush()
          }
        }
      }
    }, 1000)
  }
  async flush() {

    this.loading = true
    this.pools = this.poolsFormated()
    this.showPool()
    this.loading = false
    this.countdown = 0
  }
  getPoolByLpMintAddress = getPoolByLpMintAddress
  TokenAmount = TokenAmount



}
</script>

<style lang="less" scoped>

.ant-layout-content{
  background:#000 !important;  
}

section{
  background:#000 !important; 
}


.pool.container {
  max-width: 1200px;
  background: #1B2028;
  margin-top:20px;
  margin-bottom:20px;

  .page-head{
    margin-top:10px
  }
  .page-head a{
    z-index: 2;
    padding-left: 15px;
    background: #1b2028;
    position: absolute;
    right: 0;
    top: -16px;

    .btncontainer{
      display:inline-block
    }
  }

  .page-head .buttons{
    position:absolute;
    left:0
  }

  h6 {
    margin-bottom: 0;
  }
  .action {
    display: grid;
    grid-gap: 4px;
  }
  .lp-icons {
    .icons {
      margin-right: 8px;
    }
  }
}
.radioButtonStyle {
  width: 50%;
  text-align: center;
}
.card-body {
      padding: 0;
}
</style>

<style lang="less">
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
}

td{
  background:#000 !important
}
.pool {
  .card-body {
    overflow-x: scroll;
    scrollbar-width: none;
    -ms-overflow-style: none;
  }
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
.search-btn {
  background: transparent !important;
  border: none !important;
}
.input-search .ant-input {
  height: 32.01px !important;
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
</style>