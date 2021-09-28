<template>
  <div>
    <Modal
      :title="state.progress === 0?'Twitter':state.progress === 1?'Retweet':'Congrats !'"
      :visible="show"
      :footer="null"
      :mask-closable="false"
      :closable="false"
      @cancel="$emit('onClose')"
    >
      <div v-if="state.progress === 0">
        <div class="twitter-link">
          <a href="#" :disabled="state.followCropperOnTwitter" @click="followCropper">Follow Cropper Finance on Twitter</a>
        </div>
        <div class="twitter-link">
          <a href="#" :disabled="state.followProjectOnTwitter" @click="followPrject">Follow Project A on Twitter</a>
        </div>

        <Row :gutter="32" class="actions">
          <Col :span="24" style="text-align: center">
            <Button
              :disabled="!state.followCropperOnTwitter && !state.followProjectOnTwitter"
              ghost
              @click="$emit('onGoToRetweet')"
            >
              Next
            </Button>
          </Col>
        </Row>
      </div>

      <div v-else-if="state.progress === 1">
        <div class="retweet">
          <div class="retweet-image"></div>
          <input v-model="keyword" placeholder="Input url here" />
        </div>

        <Row :gutter="32" class="actions">
          <Col :span="24" style="text-align: center">
            <Button
              :disabled="state.retweetUrl === ''"
              ghost
              @click="$emit('onConfirm')"
            >
              Confirm
            </Button>
          </Col>
        </Row>
      </div>

      <div v-else-if="state.progress === 2">
        <div class="congrats">
            You have been successfully registered !
        </div>

        <Row :gutter="32" class="actions">
          <Col :span="24" style="text-align: center">
            <Button
              ghost
              @click="$emit('onCongrats')"
            >
              OK
            </Button>
          </Col>
        </Row>
      </div>
    </Modal>
  </div>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Button, Row, Col } from 'ant-design-vue'

Vue.use(Modal)

const defaultState = {
  followCropperOnTwitter: false,
  followCropperURL: "",
  followProjectOnTwitter: false,
  followProjectURL: "",
  retweetUrl:"",
  progress: 0
}

export default Vue.extend({
  components: {
    Modal,
    Button,
    Row,
    Col
  },
  props: {
    show: {
      type: Boolean,
      default: false
    },
    farm: {
      type: Object,
      default: null
    },
    state: {
      type: Object,
      default: defaultState
    }
  },
  data() {
    return {}
  },
  methods: {
    followCropper(){

    },
    followProject(){
      
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.twitter-link {
  text-align: center;
  margin-top: 15px;
  margin-bottom: 15px;
  a[disabled] {
    color: gray;
  }
}
.retweet {
  display: grid;
  grid-auto-rows: auto;
  row-gap: 14px;
  margin-top: 10px;
  margin-bottom: 20px;
  margin-left: 20px;
  margin-right: 20px;

  .retweet-image {
    height: 200px;
    border: 1px solid @primary-color;
  }

  input {
    padding: 5px;
    border: 1px solid @primary-color;
    border-radius: 4px;
    background-color: transparent;
    font-size: 15px;
    color: @text-color;

    &:active,
    &:focus,
    &:hover {
      outline: 0;
    }
  }
}
.congrats{
  font-size: 18px;
  text-align: center;
  padding: 20px;
  margin: auto;
}
</style>
