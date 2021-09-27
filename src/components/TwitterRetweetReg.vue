<template>
  <Modal
    title="Twitter"
    :visible="show"
    :footer="null"
    :mask-closable="false"
    :closable="false"
    @cancel="$emit('onClose')"
  >
    <div class="twitter-link">
      <a href="#">Follow Cropper Finance on Twitter</a>
    </div>
    <div class="twitter-link">
      <a href="#">Follow Project A on Twitter</a>
    </div>
    
    <Row :gutter="32" class="actions">
      <Col :span="24" style="text-align: center">
        <Button ghost @click="$emit('onOk', value)"> Next </Button>
      </Col>
    </Row>
  </Modal>
</template>

<script lang="ts">
import Vue from 'vue'
import { Modal, Button, Row, Col } from 'ant-design-vue'

Vue.use(Modal)

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
      default: null
    }
  },
  data() {
    return {}
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

.twitter-link {
  text-align: center;
  margin-top: 15px;
  margin-bottom: 15px;
  
}
</style>
