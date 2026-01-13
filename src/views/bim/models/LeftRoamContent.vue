<!--
 * @Author: wangyr
 * @Date: 2023-05-29 14:11:36
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-06 10:48:33
 * @Description:
-->
<template>
  <div :style="{ left: asideShowLeft ? '0' : '-310px' }" class="cockpit-aside cockpit-aside-left">
    <div class="aside-btn-left" @click="asideShowLeft = !asideShowLeft">
      <w-icon :type="asideShowLeft ? 'ic_chevron_left_more' : 'ic_chevron_right_more'"></w-icon>
    </div>
    <div class="aside-list-box aside-left-box">
      <BimOrder ref="bimOrder" @viewStrating="viewStrating" :taskId="taskId" :appid="appid" />
    </div>
    <div class="playbtns" v-if="showPlayBtns" :style="{ left: asideShowLeft ? '350px' : '420px' }">
      <div class="stopBtn" @click="stopBtnClick()"></div>
      <div class="pauseBtn" @click="playBtnClick()" :class="{ playing: !playing }"></div>
      <w-progress
        :percent="percent"
        :showInfo="false"
        :strokeWidth="6"
        trailColor="transparent"
        :strokeColor="{
          '0%': '#54BDC4',
          '100%': '#0981AF'
        }"
      />
    </div>
  </div>
</template>

<script>
import BimOrder from '../components/BimOrder.vue';
export default {
  name: 'LeftRoamContent',
  components: {
    BimOrder
  },
  props: {
    taskId: {
      type: String,
      default: ''
    },
    appid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      asideShowLeft: true,
      showPlayBtns: false,
      playing: false,
      percent: 1,
      timer: {}
    };
  },
  computed: {},
  watch: {},
  methods: {
    async playBtnClick() {
      this.playing = !this.playing;
      await this.$refs?.bimOrder.replayorPause(!this.playing);
      if (this.playing) {
        this.timeStart();
      } else {
        this.timer && clearInterval(this.timer);
      }
    },
    async stopBtnClick() {
      await this.$refs?.bimOrder.animateAction('stop');
      this.showPlayBtns = false;
      this.playing = false;
      this.timer && clearInterval(this.timer);
    },
    viewStrating(playing, time) {
      this.showPlayBtns = playing;
      this.playing = playing;
      this.percent = 1;
      this.timeStart(time);
    },
    timeStart(time) {
      this.timer && clearInterval(this.timer);
      let that = this;
      this.timer = setInterval(() => {
        that.percent += 10 / (time || 75); //动画时长75秒
        if (that.percent >= 100) {
          that.timer && clearInterval(that.timer);
          that.showPlayBtns = false;
          that.playing = false;
        }
      }, 100);
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.cockpit-aside {
  width: 310px;
  height: auto;
  position: absolute;
  top: 2px;
  left: 2px;
  bottom: 2px;
  z-index: 100;
  transition: 0.5s;
  background: rgba(8, 56, 90, 0.33);
  -webkit-backdrop-filter: blur(10px);
  backdrop-filter: blur(10px);

  .aside-btn-left {
    width: 20px;
    height: 52px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 1px;
    filter: blur(6);
    position: absolute;
    top: 52px;
    right: -22px;
    color: #fff;
    cursor: pointer;
    background: rgba(7, 32, 61, 0.75);
  }

  .aside-list-box {
    width: 100%;
    height: auto;
    display: flex;
    flex-direction: column;
  }
  .playbtns {
    padding: 0 18px;
    height: 42px;
    width: 900px;
    position: absolute;
    left: 350px;
    bottom: 0px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    background-image: url('~@/assets/images/default/bim/bg_bf.png');
    .wpg-progress {
      width: 780px;
      /deep/ .wpg-progress-outer {
        .wpg-progress-inner {
          height: 40px;
          position: relative;
          display: flex;
          align-items: center;
          background: transparent;
          border-radius: 3px;
          &::before {
            content: '';
            position: absolute;
            top: 15px;
            right: 0px;
            width: 100%;
            height: 10px;
            background: rgba(40, 87, 103, 0.6);
            border-radius: 3px;
          }
          .wpg-progress-bg {
            &::before {
              content: '';
              top: -14px;
              right: -18px;
              width: 36px;
              height: 36px;
              border-radius: 18px;
              position: absolute;
              background-repeat: no-repeat;
              background-size: 100% 100%;
              background-image: url('~@/assets/images/default/bim/ic_light.png');
            }
          }
        }
      }
    }

    .stopBtn {
      width: 29px;
      height: 29px;
      border-radius: 14.5px;
      background-image: url('~@/assets/images/default/bim/ic_quit.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      &:hover {
        cursor: pointer;
        opacity: 0.7;
      }
    }
    .pauseBtn {
      width: 32px;
      height: 32px;
      border-radius: 16px;
      background-image: url('~@/assets/images/default/bim/ic_suspend.png');
      background-repeat: no-repeat;
      background-size: 100% 100%;
      &:hover {
        cursor: pointer;
        opacity: 0.7;
      }
      &.playing {
        background-image: url('~@/assets/images/default/bim/ic_play.png');
      }
    }
  }
}
</style>
