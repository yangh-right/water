<!--
 * @Description:
 * @Author: JianYue
 * @Date: 2024-09-13 16:45:50
 * @LastEditTime: 2024-11-05 09:38:17
 * @LastEditors: wangyr
-->
<template>
  <div :class="[state.theme, tabVal !== 'dataCorrection' ? 'card-bg' : '', 'card']">
    <div :class="['card-list', `status-${deviceInfor.deviceStatus}`]">
      <div class="card-list-title">
        <span>{{ deviceInfor.deviceName }}</span>
        <w-icon
          v-if="deviceInfor.deviceStatus === '0'"
          type="ic_wifi_off"
          style="font-size:24px"
        ></w-icon>
        <w-icon v-else type="ic_wifi" style="color: rgb(10,204,157);font-size:24px"></w-icon>
        <w-icon
          v-if="deviceInfor.isSet"
          class="supply-ml-3 supply-cursor-pointer"
          type="setting"
          style="font-size:16px"
          @click="handleSetting"
        ></w-icon>
      </div>
      <div :class="['card-list-content']">
        <div v-for="(device, index) in deviceInfor.deviceDataList" :key="index" class="device-list">
          <template v-if="!deviceInfor.isSet || device.isShow">
            <span style="color: var(--supply-color-secondary);">{{ device.pointMemoAlias }}</span>
            <span
              :class="[device.isFlicker ? 'point-alarm' : '', 'point-val']"
              @click="showDetail(device)"
              @dblclick="changePointLimit(device)"
              v-if="tabVal === 'realTime' || tabVal === 'dataCorrection'"
              >{{ device.realPv || device.realPv == '0' ? device.realPv : '' }}
              <span class="point-unit" style="color: var(--supply-color-secondary);">{{
                device.pointUnit
              }}</span>
            </span>
            <span class="point-val" v-if="tabVal === 'forecast'"
              >{{ device.simulatePv || device.simulatePv == '0' ? device.simulatePv : ''
              }}<span class="point-unit" style="color: var(--supply-color-secondary);">{{
                device.pointUnit
              }}</span></span
            >
          </template>
        </div>
      </div>
      <!-- <div class="card-list-bot">{{ deviceInfor.deviceId }}</div> -->
    </div>
  </div>
</template>

<script>
export default {
  name: 'dataCard',
  props: {
    deviceInfor: {
      type: Object,
      default: () => {}
    },
    tabVal: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      clickTimer: null,
      clickDelay: 500 // 双击判定时间间隔
    };
  },
  inject: ['state'],
  methods: {
    showDetail(item) {
      if (this.clickTimer) {
        clearTimeout(this.clickTimer);
        this.clickTimer = null;
        this.changePointLimit(item);
      } else {
        this.clickTimer = setTimeout(() => {
          this.$emit('showDetail', item, this.deviceInfor);
          this.clickTimer = null;
        }, this.clickDelay);
      }
    },
    handleSetting() {
      this.$emit('handleSetting', this.deviceInfor);
    },
    changePointLimit(item) {
      this.$emit('changePointLimit', item, this.deviceInfor);
    }
  }
};
</script>

<style lang="less" scoped>
.card {
  width: 100%;
  height: 220px;
  padding: 0 12px 12px 0;
  &-list {
    width: 100%;
    height: 100%;
    padding: 0 12px;
    border-radius: 4px;
    position: relative;
    border: 1px solid #d6d6d6;
    &-title {
      line-height: 40px;
      height: 40px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      color: var(--supply-color-main);
      span {
        width: calc(100% - 28px);
        overflow: hidden; /*超出部分隐藏*/
        white-space: nowrap; /*禁止换行*/
        text-overflow: ellipsis; /*省略号*/
      }
    }
    &-content {
      height: 154px;
      overflow-y: auto;
      padding: 12px 6px;
      &::-webkit-scrollbar {
        display: none;
      }
      .device-list {
        display: flex;
        align-items: center;
        justify-content: space-between;
        .zzy-title {
          font-size: 12px;
        }
        span {
          display: inline-block;
        }

        span:nth-child(1) {
          flex: 1 0 48%;
          text-align: left;
        }
        span:nth-child(2) {
          flex: 1 0 42%;
          text-align: right;
          cursor: pointer;
        }
        .point-unit {
          width: 36px;
          text-align: right !important;
        }
      }
    }
    &-bot {
      color: var(--supply-color-third);
    }
  }
  .status-0 {
    background-image: radial-gradient(circle at 87% 3.2%, #dfe2e7 10%, #ffffff 65%);
    color: var(--supply-color-offline);
    /* -webkit-animation: point_online 1.5s ease-in infinite;
    animation: point_online 1.5s ease-in infinite; */
    .card-list-content {
      background-color: #f7fbff;
    }
  }
  .status-1,
  .status-null,
  .status-2 {
    background-image: radial-gradient(circle at 97% 3.2%, #e0f7e9 10%, #ffffff 65%);
    color: var(--supply-color-online);
    /* -webkit-animation: point_online 1.5s ease-in infinite;
    animation: point_online 1.5s ease-in infinite; */
    .card-list-content {
      background-color: #fafffa;
    }
  }

  &.card-bg {
    .status-2 {
      background-image: radial-gradient(circle at 97% 3.2%, #ffefea 10%, #ffffff 65%);
      color: var(--supply-color-online);

      .card-list-content {
        background-color: #fcfafa;
      }
    }
  }
  .point-alarm {
    color: var(--supply-color-alarm);
    -webkit-animation: point_alarm 1.5s ease-in infinite;
    animation: point_alarm 1.5s ease-in infinite;
  }
}
.dark {
  .status-0 {
    background-image: radial-gradient(circle at 97% 6.4%, #39393b 0%, #100f0f 65%);
    color: var(--supply-color-offline);
    /* -webkit-animation: point_online 1s ease-in infinite;
    animation: point_online 1s ease-in infinite; */
    .card-list-content {
      background: #191a1a;
    }
  }
  .status-1,
  .status-null,
  .status-2 {
    background-image: radial-gradient(circle at 97% 3.2%, #132e21 0%, #06140a 65%);
    color: var(--supply-color-online);
    /* -webkit-animation: point_online 1s ease-in infinite;
    animation: point_online 1s ease-in infinite; */
    .card-list-content {
      background: #0a1b0e;
    }
  }
  &.card-bg {
    .status-2 {
      background-image: radial-gradient(circle at 97% 3.2%, #441508 0%, #140606 65%);
      color: var(--supply-color-online);
      /* -webkit-animation: point_alarm 1s ease-in infinite;
      animation: point_alarm 1s ease-in infinite; */
      .card-list-content {
        background: #1f0c0b;
      }
    }
  }
  .point-alarm {
    color: var(--supply-color-alarm);
    -webkit-animation: point_alarm 1.5s ease-in infinite;
    animation: point_alarm 1.5s ease-in infinite;
  }
}
@-webkit-keyframes point_online {
  0% {
    color: #004042;
  }
  100% {
    color: rgba(77, 182, 172, 0.3);
  }
}
@keyframes point_online {
  0% {
    color: #004042;
  }
  100% {
    color: rgba(77, 182, 172, 0.3);
  }
}
@-webkit-keyframes point_alarm {
  0% {
    color: #ff0000;
  }
  100% {
    color: rgba(255, 0, 0, 0.3);
  }
}
@keyframes point_alarm {
  0% {
    color: #ff0000;
  }
  100% {
    color: rgba(255, 0, 0, 0.3);
  }
}
</style>
