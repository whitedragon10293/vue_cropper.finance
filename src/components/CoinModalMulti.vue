<template>
  <Modal :title="title" :visible="true" :footer="null" :width="400" centered @cancel="$emit('onCancel')">
    <div class="coin-modal">







    
      <div class="label fs-container">
        <span></span>
        <span v-if="fromCoin.balance && !fromCoin.balance.wei.isNaN()"> Balance: {{ fromCoin.balance.fixed() }} </span>
      </div>

      <div class="coin-input fs-container">
        <input
          v-model="fromCoinAmount"
          inputmode="decimal"
          autocomplete="off"
          autocorrect="off"
          placeholder="0.00"
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minlength="1"
          maxlength="79"
          spellcheck="false"
          id="fromCoinAmount"

          @input="updateAmounts"
          @focus="
            () => {
              fixedCoin = fromCoin.mintAddress
            }
          "


        />
        <button
          v-if="fromCoin.balance && (isNullOrZero(fromCoin) || lt(fromCoin, fromCoin.balance.toEther()))"
          class="max-button"
          @click="setMaxFromCoin"
        >
          MAX
        </button>
        <div v-if="fromCoin.symbol" class="coin-name">
          {{ fromCoin.symbol }}
        </div>
      </div>
    </div>


        <div class="add-icon fc-container">
          <div class="fc-container">
            <Icon type="plus" />
          </div>
        </div>


    <div class="coin-modal">
      <div class="label fs-container">
        <span></span>
        <span v-if="toCoin.balance && !toCoin.balance.wei.isNaN()"> Balance: {{ toCoin.balance.fixed() }} </span>
      </div>
      <div class="coin-input fs-container">
        <input
          v-model="toCoinAmount"
          inputmode="decimal"
          autocomplete="off"
          autocorrect="off"
          placeholder="0.00"
          type="text"
          pattern="^[0-9]*[.,]?[0-9]*$"
          minlength="1"
          maxlength="79"
          spellcheck="false"
          id="toCoinAmount"


          @input="updateAmounts"
          @focus="
            () => {
              fixedCoin = toCoin.mintAddress
            }
          "
        />
        <button
          v-if="toCoin.balance && (isNullOrZero(toCoin) || lt(toCoin, toCoin.balance.toEther()))"
          class="max-button"
          @click="setMaxToCoin"
        >
          MAX
        </button>
        <div v-if="toCoin.symbol" class="coin-name">
          {{ toCoin.symbol }}
        </div>
      </div>
    </div>

    <Row :gutter="32" class="actions">
      <Col :span="12">
        <Button ghost @click="$emit('onCancel')"> Cancel </Button>
      </Col>
      <Col :span="12">
        <Button
          :loading="loading"
          :disabled="loading || isNullOrZero(fromCoinAmount) || !lte(fromCoinAmount, fromCoin.balance.toEther())"
          ghost
          @click="$emit('onOk', value)"
        >
          Confirm
        </Button>
      </Col>
    </Row>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Row, Col, Button } from 'ant-design-vue'

import { getOutAmount, addLiquidity, getLiquidityInfoSimilar } from '@/utils/liquidity'
import { inputRegex, escapeRegExp } from '@/utils/regex'
import { lt, lte, isNullOrZero } from '@/utils/safe-math'

// fix: Failed to resolve directive: ant-portal
Vue.use(Modal)

export default Vue.extend({
  components: {
    Modal,
    Row,
    Col,
    Button
  },

  props: {
    title: {
      type: String,
      default: ''
    },

    lpMintAddress: {
      type: String,
      default: ''
    },

    fromCoin: {
      type: Object,
      required: true
    },
    toCoin: {
      type: Object,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      value: '',
      fromCoinValue: ''
    }
  },



  watch: {

  },

  methods: {
    lt,
    lte,
    isNullOrZero,

    setMaxFromCoin(){

      let el = document.getElementById("fromCoinAmount");
      el.value = this.fromCoin.balance.fixed()
      this.fromCoinAmount = el.value
      this.fixedCoin = this.fromCoin.mintAddress
      this.updateAmounts();

    },

    setMaxToCoin(){

      let el = document.getElementById("toCoinAmount");
      el.value = this.toCoin.balance.fixed()
      this.toCoinAmount = el.value
      this.fixedCoin = this.toCoin.mintAddress

      this.updateAmounts();

    },

    updateAmounts() {


      if (this.fromCoin && this.toCoin && this.lpMintAddress) {
        const poolInfo = {
          coin : this.fromCoin,
          pc : this.toCoin
        }

        if (this.fixedCoin === this.fromCoin.mintAddress) {



          const amount = getOutAmount(
            poolInfo,
            this.fromCoinAmount,
            this.fromCoin.mintAddress,
            this.toCoin.mintAddress,
            1
          )

          let el = document.getElementById("toCoinAmount");
          if (amount.isNaN() || !amount.isFinite()) {
            el.value = ''
          } else {
            el.value = amount.toFixed(this.toCoin.decimals)
          }
        } else {
        
        const poolInfo = {
          coin : this.fromCoin,
          pc : this.toCoin
        }

          const amount = getOutAmount(
            poolInfo,
            this.toCoinAmount,
            this.toCoin.mintAddress,
            this.fromCoin.mintAddress,
            1
          )

          let el = document.getElementById("fromCoinAmount");
          if (amount.isNaN() || !amount.isFinite()) {
            el.value = ''
          } else {
            el.value = amount.toFixed(this.toCoin.decimals)
          }
        }
      }
    },
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.actions {
  margin-top: 10px;

  button {
    width: 100%;
  }
}

.coin-modal {
  background: #000829;
  border-radius: 4px;

  .add-icon {
    div {
      height: 32px;
      width: 32px;
      border-radius: 50%;
      background: #000829;
    }
  }

  .label {
    padding: 0.75rem 1rem 0;
    font-size: 12px;
    line-height: 14px;
    color: rgb(133, 133, 141);
  }

  input {
    width: 0;
    padding: 0;
    border: none;
    background-color: transparent;
    font-weight: 600;
    font-size: 16px;
    line-height: 24px;
    flex: 1 1 auto;
    color: @text-color;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    &:active,
    &:focus,
    &:hover {
      outline: 0;
    }
  }

  input[disabled] {
    cursor: not-allowed;
  }

  .coin-input {
    padding: 0.75rem 0.75rem 0.75rem 1rem;

    button {
      border: none;
      background-color: transparent;
      font-weight: 600;
      font-size: 14px;
      line-height: 22px;
      border-radius: 4px;
      white-space: nowrap;
      cursor: pointer;

      &:active,
      &:focus,
      &:hover {
        outline: 0;
      }

      &:hover {
        background-color: @modal-header-bg;
      }
    }

    .max-button {
      height: 32px;
      padding: 0 16px;
      color: @primary-color;
    }

    .coin-name {
      padding: 0.5rem;
      line-height: 24px;
      font-weight: 600;
    }
  }
}
</style>
