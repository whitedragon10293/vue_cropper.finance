(window.webpackJsonp=window.webpackJsonp||[]).push([[17],{1275:function(t,n,e){var content=e(1415);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,e(26).default)("208a9b1c",content,!0,{sourceMap:!1})},1276:function(t,n,e){var content=e(1417);content.__esModule&&(content=content.default),"string"==typeof content&&(content=[[t.i,content,""]]),content.locals&&(t.exports=content.locals);(0,e(26).default)("471edc35",content,!0,{sourceMap:!1})},1414:function(t,n,e){"use strict";e(1275)},1415:function(t,n,e){var o=e(25)(!1);o.push([t.i,".staking.container[data-v-0504f94a]{max-width:1200px}.staking.container .card .card-body[data-v-0504f94a]{padding:0}.staking.container .card .card-body .ant-collapse[data-v-0504f94a]{border:0}.staking.container .card .card-body .ant-collapse .ant-collapse-item[data-v-0504f94a]{border-bottom:0}.staking.container .card .card-body .ant-collapse .ant-collapse-item[data-v-0504f94a]:not(:last-child){border-bottom:1px solid #d9d9d9}.staking.container .harvest .reward .token[data-v-0504f94a]{font-weight:600;font-size:20px}.staking.container .harvest .reward .value[data-v-0504f94a]{font-size:12px}.staking.container .harvest button[data-v-0504f94a]{padding:0 30px}.staking.container .start .unstake[data-v-0504f94a]{width:48px;margin-right:10px}.staking.container .start button[data-v-0504f94a]{width:100%}.staking.container .harvest[data-v-0504f94a],.staking.container .start[data-v-0504f94a]{padding:16px;border:2px solid #1c274f;border-radius:4px}.staking.container .harvest .title[data-v-0504f94a],.staking.container .start .title[data-v-0504f94a]{font-weight:600;font-size:12px;text-transform:uppercase;margin-bottom:8px}.staking.container .harvest button[data-v-0504f94a],.staking.container .start button[data-v-0504f94a]{height:48px}.staking.container .farm-head[data-v-0504f94a]{display:flex;align-items:center}.staking.container .farm-head .lp-icons .icons[data-v-0504f94a]{margin-right:8px}.staking.container .farm-head .state[data-v-0504f94a]{display:flex;flex-direction:column;text-align:left}.staking.container .farm-head .state .title[data-v-0504f94a]{font-size:12px;text-transform:uppercase}.staking.container .farm-head .state .value[data-v-0504f94a]{font-size:16px;line-height:24px}.staking.container .is-mobile .harvest[data-v-0504f94a]{margin-bottom:16px}",""]),t.exports=o},1416:function(t,n,e){"use strict";e(1276)},1417:function(t,n,e){var o=e(25)(!1);o.push([t.i,"::-webkit-scrollbar{display:none}.staking .card-body{overflow-x:scroll;scrollbar-width:none;-ms-overflow-style:none}.staking .ant-collapse-header{padding:24px 32px!important}.staking .ant-collapse-content{border-top:1px solid #1c274f}",""]),t.exports=o},1465:function(t,n,e){"use strict";e.r(n);e(56),e(49),e(63),e(53),e(41),e(76);var o=e(28),r=e(34),c=(e(140),e(87)),l=e.n(c),col=(e(295),e(175)),d=e.n(col),f=(e(296),e(174)),h=e.n(f),v=(e(205),e(48)),m=e.n(v),k=(e(638),e(407)),w=e.n(k),progress=(e(1220),e(1221)),y=e.n(progress),O=(e(634),e(633)),_=e.n(O),C=(e(643),e(307)),j=e.n(C),x=(e(111),e(405),e(31),e(110),e(89),e(635),e(10)),I=e(83),A=e(1215),M=e(74),S=e(16),$=e(149),P=e(112),R=e(11);function B(object,t){var n=Object.keys(object);if(Object.getOwnPropertySymbols){var e=Object.getOwnPropertySymbols(object);t&&(e=e.filter((function(t){return Object.getOwnPropertyDescriptor(object,t).enumerable}))),n.push.apply(n,e)}return n}var z=j.a.Panel,T=x.default.extend({components:{Tooltip:_.a,Progress:y.a,Collapse:j.a,CollapsePanel:z,Spin:w.a,Icon:m.a,Row:h.a,Col:d.a,Button:l.a},data:function(){return{isMobile:!1,farms:[],lp:null,farmInfo:null,harvesting:!1,stakeModalOpening:!1,staking:!1,unstakeModalOpening:!1,unstaking:!1}},head:{title:"Raydium Staking"},computed:function(t){for(var i=1;i<arguments.length;i++){var source=null!=arguments[i]?arguments[i]:{};i%2?B(Object(source),!0).forEach((function(n){Object(r.a)(t,n,source[n])})):Object.getOwnPropertyDescriptors?Object.defineProperties(t,Object.getOwnPropertyDescriptors(source)):B(Object(source)).forEach((function(n){Object.defineProperty(t,n,Object.getOwnPropertyDescriptor(source,n))}))}return t}({},Object(I.e)(["app","wallet","farm","url","price","liquidity"])),watch:{"wallet.tokenAccounts":{handler:function(t){this.updateCurrentLp(t)},deep:!0},"farm.infos":{handler:function(){this.updateFarms()},deep:!0},"farm.stakeAccounts":{handler:function(){this.updateFarms()},deep:!0}},mounted:function(){this.updateFarms()},methods:{TokenAmount:S.a,updateFarms:function(){for(var t=[],n=0,e=Object.entries(this.farm.infos);n<e.length;n++){var r=Object(o.a)(e[n],2),c=r[0],l=r[1];if(l.isStake){var d=Object(A.a)(this.farm.stakeAccounts,c),f=l.poolInfo,h=f.rewardPerShareNet,v=f.rewardPerBlock,m=l.reward,k=l.lp,w=new S.a(Object(R.c)(v),m.decimals),y=2*Object(R.c)(w.toEther())*60*60*24*365*Object(A.a)(this.price.prices,k.symbol),O=Object(A.a)(this.price.prices,k.symbol),_=(y/(Object(R.c)(k.balance.toEther())*O)*100).toFixed(2),C=Object(M.a)(l);if(C.apr=_,d){var j=d=Object(M.a)(d),x=j.rewardDebt,I=j.depositBalance.wei.multipliedBy(Object(R.c)(h)).dividedBy(1e9).minus(x.wei);d.pendingReward=new S.a(I,x.decimals)}else d={depositBalance:new S.a(0,l.lp.decimals),pendingReward:new S.a(0,l.reward.decimals)};t.push({userInfo:d,farmInfo:C})}}this.farms=t},updateCurrentLp:function(t){if(this.lp){var n=Object(M.a)(this.lp),e=Object(A.a)(t,"".concat(this.lp.mintAddress,".balance"));n.balance=e,this.lp=n}},openStakeModal:function(t,n){var e=Object(M.a)(n),o=Object(A.a)(this.wallet.tokenAccounts,"".concat(n.mintAddress,".balance"));e.balance=o,this.lp=e,this.farmInfo=Object(M.a)(t),this.stakeModalOpening=!0},stake:function(t){var n=this;this.staking=!0;var e=this.$web3,o=this.$wallet,r=Object(A.a)(this.wallet.tokenAccounts,"".concat(this.farmInfo.lp.mintAddress,".tokenAccountAddress")),c=Object(A.a)(this.wallet.tokenAccounts,"".concat(this.farmInfo.reward.mintAddress,".tokenAccountAddress")),l=Object(A.a)(this.farm.stakeAccounts,"".concat(this.farmInfo.poolId,".stakeAccountAddress")),d=Object(P.a)().toString();this.$notify.info({key:d,message:"Making transaction...",description:"",duration:0}),Object($.e)(e,o,this.farmInfo,r,c,l,t).then((function(e){n.$notify.info({key:d,message:"Transaction has been sent",description:function(t){return t("div",["Confirmation is in progress.  Check your transaction on ",t("a",{attrs:{href:"".concat(n.url.explorer,"/tx/").concat(e),target:"_blank"}},"here")])}});var o="Stake ".concat(t," ").concat(n.farmInfo.lp.symbol);n.$accessor.transaction.sub({txid:e,description:o})})).catch((function(t){n.$notify.error({key:d,message:"Stake failed",description:t.message})})).finally((function(){n.staking=!1,n.cancelStake()}))},cancelStake:function(){this.lp=null,this.farmInfo=null,this.stakeModalOpening=!1},openUnstakeModal:function(t,n,e){var o=Object(M.a)(n);o.balance=e,this.lp=o,this.farmInfo=Object(M.a)(t),this.unstakeModalOpening=!0},unstake:function(t){var n=this;this.unstaking=!0;var e=this.$web3,o=this.$wallet,r=Object(A.a)(this.wallet.tokenAccounts,"".concat(this.farmInfo.lp.mintAddress,".tokenAccountAddress")),c=Object(A.a)(this.wallet.tokenAccounts,"".concat(this.farmInfo.reward.mintAddress,".tokenAccountAddress")),l=Object(A.a)(this.farm.stakeAccounts,"".concat(this.farmInfo.poolId,".stakeAccountAddress")),d=Object(P.a)().toString();this.$notify.info({key:d,message:"Making transaction...",description:"",duration:0}),Object($.g)(e,o,this.farmInfo,r,c,l,t).then((function(e){n.$notify.info({key:d,message:"Transaction has been sent",description:function(t){return t("div",["Confirmation is in progress.  Check your transaction on ",t("a",{attrs:{href:"".concat(n.url.explorer,"/tx/").concat(e),target:"_blank"}},"here")])}});var o="Unstake ".concat(t," ").concat(n.farmInfo.lp.symbol);n.$accessor.transaction.sub({txid:e,description:o})})).catch((function(t){n.$notify.error({key:d,message:"Stake failed",description:t.message})})).finally((function(){n.unstaking=!1,n.cancelUnstake()}))},cancelUnstake:function(){this.lp=null,this.farmInfo=null,this.unstakeModalOpening=!1},harvest:function(t){var n=this;this.harvesting=!0;var e=this.$web3,o=this.$wallet,r=Object(A.a)(this.wallet.tokenAccounts,"".concat(t.lp.mintAddress,".tokenAccountAddress")),c=Object(A.a)(this.wallet.tokenAccounts,"".concat(t.reward.mintAddress,".tokenAccountAddress")),l=Object(A.a)(this.farm.stakeAccounts,"".concat(t.poolId,".stakeAccountAddress")),d=Object(P.a)().toString();this.$notify.info({key:d,message:"Making transaction...",description:"",duration:0}),Object($.e)(e,o,t,r,c,l,"0").then((function(e){n.$notify.info({key:d,message:"Transaction has been sent",description:function(t){return t("div",["Confirmation is in progress.  Check your transaction on ",t("a",{attrs:{href:"".concat(n.url.explorer,"/tx/").concat(e),target:"_blank"}},"here")])}});var o="Harvest ".concat(t.reward.symbol);n.$accessor.transaction.sub({txid:e,description:o})})).catch((function(t){n.$notify.error({key:d,message:"Harvest failed",description:t.message})})).finally((function(){n.harvesting=!1}))}}}),U=(e(1414),e(1416),e(24)),component=Object(U.a)(T,(function(){var t=this,n=t.$createElement,e=t._self._c||n;return e("div",{staticClass:"staking container"},[e("div",{staticClass:"page-head fs-container"},[e("span",{staticClass:"title"},[t._v("Staking")]),t._v(" "),e("div",{staticClass:"buttons"},[t.farm.initialized?e("Tooltip",{attrs:{placement:"bottomRight"}},[e("template",{slot:"title"},[e("span",[t._v("\n            Displayed data will auto-refresh after\n            "+t._s(t.farm.autoRefreshTime-t.farm.countdown)+" seconds. Click this circle to update manually.\n          ")])]),t._v(" "),e("Progress",{class:t.farm.loading?"disabled":"",attrs:{type:"circle",width:20,"stroke-width":10,percent:100/t.farm.autoRefreshTime*t.farm.countdown,"show-info":!1},on:{click:function(){t.$accessor.farm.requestInfos(),t.$accessor.wallet.getTokenAccounts()}}})],2):t._e()],1)]),t._v(" "),t.stakeModalOpening?e("CoinModal",{attrs:{title:"Stake RAY",coin:t.lp,loading:t.staking},on:{onOk:t.stake,onCancel:t.cancelStake}}):t._e(),t._v(" "),t.unstakeModalOpening?e("CoinModal",{attrs:{title:"Unstake RAY",coin:t.lp,loading:t.unstaking},on:{onOk:t.unstake,onCancel:t.cancelUnstake}}):t._e(),t._v(" "),t.farm.initialized?e("div",{staticClass:"card"},[e("div",{staticClass:"card-body"},[e("Collapse",{attrs:{"expand-icon-position":"right"}},t._l(t.farms,(function(n){return e("CollapsePanel",{key:n.farmInfo.poolId},[e("Row",{staticClass:"farm-head",attrs:{slot:"header",gutter:0},slot:"header"},[e("Col",{staticClass:"lp-icons",attrs:{span:8}},[e("div",{staticClass:"icons"},[e("CoinIcon",{attrs:{"mint-address":n.farmInfo.lp.mintAddress}})],1),t._v("\n              "+t._s(n.farmInfo.lp.symbol)+"\n            ")]),t._v(" "),e("Col",{staticClass:"state",attrs:{span:t.isMobile?8:4}},[e("div",{staticClass:"title"},[t._v(t._s(t.isMobile?"Reward":"Pending Reward"))]),t._v(" "),e("div",{staticClass:"value"},[t._v(t._s(n.userInfo.pendingReward.format()))])]),t._v(" "),t.isMobile?t._e():e("Col",{staticClass:"state",attrs:{span:4}},[e("div",{staticClass:"title"},[t._v("Staked")]),t._v(" "),e("div",{staticClass:"value"},[t._v("\n                "+t._s(n.userInfo.depositBalance.format())+"\n              ")])]),t._v(" "),e("Col",{staticClass:"state",attrs:{span:t.isMobile?8:4}},[e("div",{staticClass:"title"},[t._v("Apr")]),t._v(" "),e("div",{staticClass:"value"},[t._v(t._s(n.farmInfo.apr)+"%")])]),t._v(" "),t.isMobile?t._e():e("Col",{staticClass:"state",attrs:{span:4}},[e("div",{staticClass:"title"},[t._v("Liquidity")]),t._v(" "),e("div",{staticClass:"value"},[t._v(t._s(n.farmInfo.lp.balance.format()))])])],1),t._v(" "),e("Row",{class:t.isMobile?"is-mobile":"",attrs:{gutter:16}},[e("Col",{attrs:{span:t.isMobile?24:12}},[e("div",{staticClass:"harvest"},[e("div",{staticClass:"title"},[t._v("Pending "+t._s(n.farmInfo.reward.symbol)+" Reward")]),t._v(" "),e("div",{staticClass:"pending fs-container"},[e("div",{staticClass:"reward"},[e("div",{staticClass:"token"},[t._v(t._s(n.userInfo.pendingReward.format()))])]),t._v(" "),e("Button",{attrs:{size:"large",ghost:"",disabled:!t.wallet.connected||t.harvesting||n.userInfo.pendingReward.isNullOrZero(),loading:t.harvesting},on:{click:function(e){return t.harvest(n.farmInfo)}}},[t._v("\n                    Harvest\n                  ")])],1)])]),t._v(" "),e("Col",{attrs:{span:t.isMobile?24:12}},[e("div",{staticClass:"start"},[e("div",{staticClass:"title"},[t._v("Start staking")]),t._v(" "),t.wallet.connected?e("div",{staticClass:"fs-container"},[n.userInfo.depositBalance.isNullOrZero()?t._e():e("Button",{staticClass:"unstake",attrs:{size:"large",ghost:""},on:{click:function(e){return t.openUnstakeModal(n.farmInfo,n.farmInfo.lp,n.userInfo.depositBalance)}}},[e("Icon",{attrs:{type:"minus"}})],1),t._v(" "),e("Button",{attrs:{size:"large",ghost:""},on:{click:function(e){return t.openStakeModal(n.farmInfo,n.farmInfo.lp)}}},[t._v("\n                    Stake "+t._s(n.farmInfo.lp.symbol)+"\n                  ")])],1):e("Button",{attrs:{size:"large",ghost:""},on:{click:t.$accessor.wallet.openModal}},[t._v("\n                  Connect Wallet\n                ")])],1)])],1)],1)})),1)],1)]):e("div",{staticClass:"fc-container"},[e("Spin",{attrs:{spinning:!0}},[e("Icon",{staticStyle:{"font-size":"24px"},attrs:{slot:"indicator",type:"loading",spin:""},slot:"indicator"})],1)],1)],1)}),[],!1,null,"0504f94a",null);n.default=component.exports;installComponents(component,{CoinModal:e(299).default,CoinIcon:e(206).default})}}]);