<template>
  <div class="pool container">


    <CoinModalMulti
      v-if="poolAdd"
      title="Add Liquidity"
      :lpMintAddress="lpMintAddress"
      :fromCoin="fromCoin"
      :toCoin="toCoin"
      @onOk="PoolAddProcess"
      @onCancel="cancelPoolAdd"
    />


    <div class="card">
      <div class="card-body">

        <div class="page-head fs-container">
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
          <span slot="liquidity" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} (?)</span>
          <span slot="volume_24h" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} (?)</span>
          <span slot="volume_7d" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} (?)</span>
          <span slot="fee_24h" slot-scope="text"> ${{ new TokenAmount(text, 2, false).format() }} (?)</span>
          <span slot="apy" slot-scope="text"> {{ new TokenAmount(text, 2, false).format() }}% (?)</span>
          <span slot="apu" slot-scope="text, pool"  >{{ text }} 

            <div class="btncontainer">
              <Button size="small" ghost :disabled="!wallet.connected"
                  @click="openPoolAddModal(pool)">
                Add
              </Button>
            </div>

            &nbsp;


            <div class="btncontainer">
              <Button size="small" ghost @click="$accessor.wallet.openModal">
                -
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
const RadioGroup = Radio.Group
const poolAdd = false
const RadioButton = Radio.Button
@Component({
  head: {
    title: 'Cropper Finance Pools'
  },

  computed: {
    ...mapState(['wallet', 'swap', 'liquidity', 'url', 'setting'])
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
  lpMintAddress: any = false
  toCoin: any = false
  poolAdd: any = false
  lptoken: any = false
  autoRefreshTime: number = 60
  countdown: number = 0
  timer: any = null
  loading: boolean = false
  searchButton = true
  searchName = ''
  get liquidity() {
    return this.$accessor.liquidity
  }
  @Watch('$accessor.liquidity.initialized', { immediate: true, deep: true })
  refreshThePage() {
    this.showPool()
  }
  @Watch('$accessor.liquidity.info', { immediate: true, deep: true })
  async onLiquidityChanged() {
    this.pools = getAllPools()
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

  PoolAddProcess(){

  }

  openPoolAddModal(poolInfo: any) {
    console.log(poolInfo)
    const fromCoin = cloneDeep(poolInfo.coin1)
    const toCoin = cloneDeep(poolInfo.coin2)
    const lpMintAddress = poolInfo.lp_mint



    const coin1Balance = get(this.$accessor.wallet.tokenAccounts, `${fromCoin.mintAddress}.balance`)
    fromCoin.balance = coin1Balance
    const toCoinBalance = get(this.$accessor.wallet.tokenAccounts, `${toCoin.mintAddress}.balance`)
    toCoin.balance = toCoinBalance

    this.fromCoin = fromCoin
    this.toCoin = toCoin
    this.lptoken = cloneDeep(poolInfo)
    this.lpMintAddress = poolInfo.lp_mint

    this.poolAdd = true
  }

  cancelPoolAdd() {
    this.fromCoin = null
    this.toCoin = null
    this.lptoken = null
    this.lpMintAddress = null
    this.poolAdd = false
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
    this.pools = getAllPools()
    this.showPool()
    this.loading = false
    this.countdown = 0
  }
  getPoolByLpMintAddress = getPoolByLpMintAddress
  TokenAmount = TokenAmount
}
</script>

<style lang="less" scoped>
section{
  background:#000 !important; 
}
.container {
  max-width: 1200px;
  background:#000;
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
  padding-top: 25px;
}
</style>

<style lang="less">
::-webkit-scrollbar {
  display: none; /* Chrome Safari */
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