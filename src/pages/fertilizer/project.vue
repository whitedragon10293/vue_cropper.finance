<template>
  <div class="container" :class="isMobile ? 'create-pool-mobile' : 'create-pool'">
    <TwitterRetweetReg
      :show="registerTwitterRetweet"
      @onClose="() => ((registerTwitterRetweet = false))"
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
  farmId: any = null
  current: number = 1
  registerTwitterRetweet:boolean = true;

  get isMobile() {
    return this.$accessor.isMobile
  }

  get wallet() {
    return this.$accessor.wallet
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
