<template>
  <Footer>
    <div :class="isMobile ? 'mobile' : 'pc'">
      <div class="logo">
        <a href="/"><img src="@/assets/icons/logo-text.svg"  width="224.76" height="45.38" /></a>
      </div>
      <div class="icon_list">
        <label>Our Social</label>
        <a :href="linkUrl.twitter" target="_blank">
          Medium
        </a>
        <a :href="linkUrl.discord" target="_blank">
          Discord
        </a>
        <a :href="linkUrl.telegram" target="_blank">
          Twitter
        </a>
        <a :href="linkUrl.medium" target="_blank">
          Telegram
        </a>
      </div>
    </div>
    <div class="foot-line"></div>
    <div :class="isMobile ? 'mobile foot-refer' : 'pc foot-refer'">
      <label>Decentralized 2021</label>
      <div class="refer-list">
        <label>Terms & Conditions</label>
        <label>Privacy Policy</label>
      </div>
    </div>
  </Footer>
</template>

<script lang="ts">
import { Vue, Component } from 'nuxt-property-decorator'

import { Layout } from 'ant-design-vue'

const { Footer } = Layout

@Component({
  components: {
    Footer
  }
})
export default class Foot extends Vue {
  navOpened = false
  linkUrl = {
    home: '/',
    app: '/swap/',
    twitter: 'https://twitter.com/CropperFinance',
    discord: 'https://discord.gg/CropperFinance',
    telegram: 'https://t.me/CropperFinance',
    medium: 'https://cropperfinance.medium.com/'
  }

  get isMobile() {
    return this.$accessor.isMobile
  }

  beforeMount() {
    this.$accessor.queryIsMobile()
  }
}
</script>

<style lang="less" scoped>
.mobile {
  .icon_list {
    text-align: center;
    margin: 48px 0;
    a {
      color: #505F8C !important;
    }
  }
}

.pc {
  display: flex;
  justify-content: space-between;

  .icon_list {
    // font-family: Gilroy;
    font-style: normal;
    font-weight: 400;
    line-height: 42px;
    letter-spacing: -0.05em;
    text-align: left;
    a {
      color: #505F8C !important;
      font-size: 18px;
      padding-right: 5px;
      margin-left: 55.81px;
    }
    label {
      color: #fff !important;
      font-size: 22px;
    }
  }
}

.foot-line {
  height: 1.16px;
  background: #fff;
  opacity: 0.2;
  margin: 30px 0;
}

.foot-refer {
  color: #505F8C !important;
  // font-family: Gilroy;
  font-size: 18px;
  font-style: normal;
  font-weight: 600;
  line-height: 32px;
  letter-spacing: -0.05em;
  text-align: left;

  .refer-list {
    label{
      margin-left: 55.81px;
      padding-right: 10px;
      font-weight: 400;
      line-height: 42px;
    }
  }
}

</style>
