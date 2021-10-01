<template>
  <div>
    <Modal
      :title="this.progression < 2 ? 'Twitter' : this.progression < 4 ? 'Telegram' : this.progression < 5 ? 'Retweet' : 'You won a ticket' "
      :visible="show"
      :footer="null"
      :mask-closable="false"
      :closable="false"
      @cancel="$emit('onClose')"
    >
      <div v-if="this.progression < 2">
        <div class="twitter-link" :class="this.progression == 0 ? 'current' : ''">
          <a href="https://twitter.com/CropperFinance" target="_blank" >Follow @CropperFinance on Twitter</a>
        </div>
        <div class="twitter-link" :class="this.progression == 1 ? 'current' : ''">
          <a :href="farm.labelized.links.twitter" target="_blank">Follow {{farm.labelized.name}} on Twitter</a>
        </div>

        <Row :gutter="32" class="actions">
          <Col :span="24" style="text-align: center">
            <Button
              ghost
              @click="nextStep()"
            >
              Next
            </Button>
          </Col>
        </Row>
      </div>

      <div v-else-if="this.progression < 4 && this.progression >= 2 ">
        <div class="twitter-link" :class="this.progression == 2 ? 'current' : ''">
          <a href="https://t.me/CropperFinance" target="_blank" >Follow @CropperFinance on Telegram</a>
        </div>
        <div class="twitter-link" :class="this.progression == 3 ? 'current' : ''">
          <a :href="farm.labelized.links.telegram" target="_blank">Follow {{farm.labelized.name}} on Telegram</a>
        </div>

        <Row :gutter="32" class="actions">
          <Col :span="24" style="text-align: center">
            <Button
              ghost
              @click="nextStep()"
            >
              Next
            </Button>
          </Col>
        </Row>
      </div>

      <div v-else-if="this.progression < 5 && this.progression >= 4">

        <blockquote class="twitter-tweet"><p lang="en" dir="ltr">👨🏻‍🌾 Dear Croppers,<br><br>📣 We’re excited to announce our Farm Launcher’s hero feature. <br><br>🎉 Introducing a feature that celebrates DeFi innovation while rewarding farmers. <br><br>🤝 Meet <a href="https://twitter.com/hashtag/Fertilizer?src=hash&amp;ref_src=twsrc%5Etfw">#Fertilizer</a>🧪<a href="https://t.co/BeuvL2aUbz">https://t.co/BeuvL2aUbz</a></p>&mdash; CropperFinance (@CropperFinance) <a href="https://twitter.com/CropperFinance/status/1443533161913372672?ref_src=twsrc%5Etfw">September 30, 2021</a></blockquote> <script async src="https://platform.twitter.com/widgets.js" charset="utf-8"></script>

        <div class="twitter-link">

          Retweet this tweet and input retweet url :

          <input type="text" class="link" placeholder="Paste url here"

          @input="nurl($event.target.value)"

           />
        </div>

        <Row :gutter="32" class="actions">
          <Col :span="24" style="text-align: center">
            <Button
              ghost
              @click="checkUrl()"
            >
              Next
            </Button>
          </Col>
        </Row>
      </div>


      <div v-else-if="this.progression <= 5">
        <div class="congrats">
            You have been successfully registered !
        </div>

        <Row :gutter="32" class="actions">
          <Col :span="24" style="text-align: center">
            <Button
              ghost
              @click="$emit('onCongrats')"
            >
              Close
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
      required: true
    }
  },
  data() {
    return {
      progression: 0,
      url : false as any
    }
  },
  methods: {
    nextStep(){
      if(this.progression < 1){ 
        this.progression = 0;
      }
      this.progression++;
      console.log(this.farm);

    },
    nurl(url: string) {
        this.url = url
    },
    checkUrl(){
      let url;


      
      try {
        url = new URL(this.url);
      } catch (_) {
        return false;  
      }


      const recipeUrl = 'https://api.croppppp.com/pfo/register/';
      const postBody = {
          spl: this.$accessor.wallet.address,
          farmId: 10
      };
      const requestMetadata = {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json'
          },
          body: JSON.stringify(postBody)
      };

      fetch(recipeUrl, requestMetadata)
          .then(res => res.json())
          .then(recipes => {
          
          });


      return url.protocol === "http:" || url.protocol === "https:";
    }
  }
})
</script>

<style lang="less" scoped>
@import '../styles/variables';

input.link{
    width: 100%;
    padding: 10px;
    border-radius: 10px;
    margin-top: 5px;
}

.twitter-link {
  text-align: center;
  margin-top: 15px;
  margin-bottom: 15px;
  color: gray;
  a{
    color:gray
  }
  a[disabled] {
    color: gray;
  }
  &.current a{
    color:#fff;
    font-weight:bold
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
