<!-- 视频设备 海康isc流媒体ws协议播放（实时监控与视频回放），使用的海康h5Player插件播放 -->
<!-- 插件在容器隐藏的情况下，会导致stop失败，解决方式，1. 延迟播放，不会出现闪动的初始化，只有稳定的状态下才可以进行播放， 2. 主动销毁-->
<template>
  <div class="h5-player supply-flex supply-flex-col">
    <div :id="refId" v-resize="handleResize" class="supply-flex-1 supply-overflow-hidden"></div>
    <div class="control-btns supply-flex supply-items-center supply-justify-between supply-text-white">
      <div class="supply-flex supply-items-center">
        <w-icon v-if="playType == '1' && !isPlaySuccess" type="ic_play_arrow" class="supply-mr-4 supply-ml-4" title="播放"
          @click="showPreview"></w-icon>
        <w-icon v-if="playType == '1' && isPlaySuccess" type="ic_pause" class="supply-mr-4 supply-ml-4" title="停止播放"
          @click="Stop"></w-icon>

        <w-icon v-if="playType == '2' && isPlaySuccess" type="ic_pause" class="supply-mr-4 supply-ml-4" title="暂停"
          @click="Pause"></w-icon>
        <w-icon v-if="playType == '2' && !isPlaySuccess" type="ic_play_arrow" title="恢复播放" class="supply-mr-4 supply-ml-4"
          @click="Resume"></w-icon>

        <w-button type="link" size="small" :disabled="!isPlaySuccess" title="慢放" @click="Slow">
          <w-icon v-if="playType == '2'" type="ic_fast_rewind" class="supply-mr-4 supply-ml-4"></w-icon></w-button>
        <w-button type="link" size="small" :disabled="!isPlaySuccess" title="快放" @click="Fast">
          <w-icon v-if="playType == '2'" type="ic_fast_forward" class="supply-mr-4"></w-icon>
        </w-button>

        <div class="supply-flex supply-w-12 supply-items-center supply-justify-center">
          <span v-if="playingRate < 0 && playingRate !== 1" class="supply-text-xs supply-text-yellow-300">X {{ 1 /
            Math.abs(playingRate) }}
          </span>
          <span v-if="playingRate > 0 && playingRate !== 1" class="supply-text-xs supply-text-yellow-300">X {{ playingRate }}
          </span>
        </div>
      </div>

      <div>
        <w-icon v-if="isOpenSound" type="ic_volume_off" class="supply-mr-4 supply-ml-4" title="打开声音" @click="openSound"></w-icon>
        <w-icon v-if="!isOpenSound" type="ic_volume_up" class="supply-mr-4 supply-ml-4" title="关闭声音" @click="closeSound"></w-icon>

        <span v-if="isRecording" class="supply-mr-4 supply-text-red-600">
          Rec: {{ hour | addPrePadding }}:{{ minute | addPrePadding }}:{{ second | addPrePadding }}
        </span>
        <w-icon v-if="!isRecording" type="ic_videocam" class="supply-mr-4" title="开始录像" @click="Record"></w-icon>
        <w-icon v-if="isRecording" type="ic_videocam_off" class="supply-mr-4 supply-text-red-600" title="停止录像"
          @click="StopRecord"></w-icon>
        <w-icon type="ic_camera_alt" class="supply-mr-4" title="抓图" @click="CapturePicture()"></w-icon>
        <w-icon type="ic_zoom_out_map" class="supply-mr-4" title="全屏" @click="FullSreen"></w-icon>
      </div>
    </div>
    <div class="message">{{ message }}</div>
  </div>
</template>

<script >
/* eslint-disable @typescript-eslint/no-this-alias */
import moment from "moment";
import Vue from 'vue'
// import {
//   getISCHlsNoParse,
//   getPlaybackHlsNoParse,
//   getYSISCVideoLive,
//   getYSISCVideoBack,
// } from "@/api/video";
import {
  getISCHlsNoParse
} from '@/api/public';
import { debounce } from "throttle-debounce";
import { sleep } from "@/utils/tools";

export default {
  name: "H5RealtimeOrBack",
  filters: {
    addPrePadding(v) {
      return v < 10 ? `0${v}` : v;
    },
  },
  props: {
    /**
     * 视频类型
     */
    type: {
      type: String,
      default: "3", // 3是海康isc 23是海康iscV3.0
    },
    /**
     * 查询时间
     */
    queryTime: {
      type: Array,
      required: true,
      default: () => [],
    },
    /**
     * 实时播放 1, 回放 2
     */
    playType: {
      required: true,
      type: String,
    },
    /**
     * id
     */
    videoNo: {
      required: true,
      type: String,
    },
    /**
     * refId
     */
    playerId: {
      required: false,
      type: String,
      default: "player",
    },
  },
  data() {
    if (!window.stopvideo) {
      window.stopvideo = []
    }
    window.stopvideo.push(this.Stop)
    return {
      // player: null,
      curIndex: 0,
      isOpenSound: true,
      // 是否已经开始播放
      isPlaySuccess: false,
      // start | init | play | pause | stop(init)
      playStatus: 'start',
      loading: false,
      playingRate: 0,
      isRecording: false,
      hour: 0,
      minute: 0,
      second: 0,
      timer: null,
      message: "",
      refId: this.playerId + Math.floor(Math.random() * 10000000),

      event: new Vue(),
      destroyStatus: false
    };
  },
  watch: {
    queryTime: {
      handler(n) {
        if (this.playType === "1") {
          return false;
        }
        if (this.playStatus === 'init') {
          this.showPlayback(n);
        } else {
          this.event.$once('init', () => {
            this.showPlayback(n);
          })
        }
      },
      deep: true,
    },
    playType: {
      handler() {
        this.setPlayType();
      },
    },
    videoNo: {
      async handler() {
        this.isPlaySuccess && (await this.player?.JS_Stop());
        this.play();
      },
    },
  },
  created() {
    // console.log('create...')
    if (window.xxxx) {
      window.xxxx = '1'
    } else {
      window.xxxx = '0'
    }
    this.cout = window.xxxx
  },
  async mounted() {
    await this.init();
    this.play();
  },
  async beforeDestroy() {
    // console.log('debug: beforeDestroy...')
    this.destroyStatus = true
    this.Stop()
  },
  deactivated() {
    // console.log('debug: deactive....')
    this.destroyStatus = true
    if (this.playType === "1") {
      this.Stop()
    } else {
      this.Pause()
    }
  },
  async activated() {
    // console.log('debug: active...')
    if (this.playType === "1") {
      if (this.playStatus === 'init') {
        this.play();
      } else {
        this.event.$once('init', () => {
          this.play()
        })
      }
    } else {
      this.Resume()
    }
  },
  methods: {

    async init() {
      // console.log('init...', this.cout)
      const publicPath = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ ?? "./";
      if (!document.querySelector(`#${this.refId}`)) {
        return
      }
      this.player = new window.JSPlugin({
        szId: this.refId, // 需要英文字母开头 必填
        szBasePath: `${publicPath}js/hkH5/`, // 必填
        // szBasePath: `./video/hkH5/`, // 必填
        iCurrentSplit: 1,
        oStyle: {
          border: "#343434",
          borderSelect: "#FFCC00",
          background: "#000",
        },
      });
      const _this = this;
      return this.player?.JS_SetWindowControlCallback({
        windowEventSelect(index) {
          // 插件选中窗口回调
          _this.curIndex = index;
        },
        async pluginErrorHandler(index, iErrorCode, oError) {
          // 插件错误回调
          // console.log(index, iErrorCode, oError);
          // "0x12f910011" 流中断，电脑配置过低，程序卡主线程都可能导致流中断
          // "0x12f910027" 后端取流超时，被后端关闭连接
          // "0x12f910023" ws/wss连接超时，默认6s超时时间，原因：网络异常，网络不通
          // "0x12f910029" 普通模式的报错，码流异常导致黑屏,尝试重新取流
          // 0x01900050:  取流失败，详情根据错误码在运管后台进行查询.
          // console.log("this", _this);
          if (
            ["0x12f910011", "0x12f910023", "0x12f910027", "0x12f910029", "0x01900050"].includes(
              iErrorCode
            )
          ) {
            await _this.Stop();
            // _this.play();
          }
        },

        performanceLack() {
          console.error('性能不足')
          _this.Stop()
        }
      }).then(() => {
        // console.log('init...done', this.cout)
        _this.playStatus = 'init'
        this.event.$emit('init')
      });
    },
    async play() {
      const _play = async () => {
        await sleep(1000)
        if (this.destroyStatus) return
        // console.log('play...', this.cout)
        this.loading = true
        try {
          if (this.playType == "1") {
            await this.showPreview();
          } else {
            await this.showPlayback(this.queryTime);
          }
        } finally {
          // console.log('play...done', this.cout)
          this.event.$emit('play')
          this.loading = false
        }
      }
      if (this.playStatus === 'init') {
        _play()
      } else {
        this.event.$once('init', () => {
          _play()
        })
      }
    },
    Stop() {
      const _stop = () => {
        // console.log('stop...', this.cout, this.loading)
        this.player?.JS_StopRealPlayAll(0).then(
          () => {
            this.isPlaySuccess = false;
            // console.log("stop...done", this.cout);
          },
          (e) => {
            // console.log("stop...failed", this.cout);
            console.error("stop failed", e);
          }
        );
      }
      if (this.loading) {
        this.event.$once('play', () => {
          _stop()
        })
      } else {
        _stop()
      }
    },


    startTimer() {
      this.second += 1;
      if (this.second >= 60) {
        this.second = 0;
        this.minute += 1;
      }
      if (this.minute >= 60) {
        this.minute = 0;
        this.hour += 1;
      }
    },


    handleResize() {
      if (this.player) {
        this.player?.JS_Resize();
      }
    },
    async showPlayback(queryTime) {
      let queryBeginTime = moment(queryTime[0]).format("YYYY-MM-DD HH:mm:ss");
      let queryEndTime = moment(queryTime[1]).format("YYYY-MM-DD HH:mm:ss");
      this.message = "";
      try {
        let url;
        let res;
        if (this.type == "3") {
  console.log('3')
        } else if (this.type == "23") {
  console.log('23')
        }
        if (res.data && res.data.status === "complete") {
          url = res.data.resultData;
        } else {
          this.message = (res && res.data && res.data.errorMessage) || "暂无视频资源";
        }
        let beginTime,
          endTime = "";
        if (url) {
          // 海康接口版本 v1、v2 有区别，有可能返回的url没有拼接上回放的开始和结束时间，这里做个判断
          if (url.includes("?") && url.includes("&")) {
            let arr = url.split("?")[1].split("&");
            beginTime = `${moment(arr[0].split("=")[1]).format("YYYY-MM-DDTHH:mm:ss")}Z`;
            endTime = `${moment(arr[1].split("=")[1]).format("YYYY-MM-DDTHH:mm:ss")}Z`;
          } else {
            beginTime = `${moment(queryBeginTime).format("YYYY-MM-DDTHH:mm:ss")}Z`;
            endTime = `${moment(queryEndTime).format("YYYY-MM-DDTHH:mm:ss")}Z`;
          }
        }
        if (url) {
          this.player
            ?.JS_Play(url, { playURL: url, mode: 1 }, 0, beginTime, endTime)
            .then(() => {
              this.isPlaySuccess = true;
              this.message = "";
            })
            .catch((e) => {
              this.isPlaySuccess = false;
              this.message = "暂无视频资源";
              throw e
            });
        }
      } catch (e) {
        this.isPlaySuccess = false;
        throw e
      }
    },
    async showPreview() {
      this.message = "";
      try {
        let url;
        const isHttps = window.location.protocol === "https:";
        let res;
        if (this.type == "3") {
          res = await getISCHlsNoParse(this.videoNo, isHttps ? "wss" : "ws");
        } else if (this.type == "23") {
          // res = await getYSISCVideoLive(this.videoNo, isHttps ? "wss" : "ws");
            console.log('231')
        }
        if (res.data && res.data.status === "complete") {
          url = res.data.resultData;
        } else {
          this.message = (res && res.data && res.data.errorMessage) || "暂无视频资源";
        }
        if (url) {

          return this.player
            ?.JS_Play(url, { playURL: url, mode: 1 }, 0)
            .then(() => {
              this.isPlaySuccess = true;
              this.message = "";
            })
            .catch((e) => {
              this.isPlaySuccess = false;
              this.message = "暂无视频资源";
              throw e
            });
        }
      } catch (e) {
        this.isPlaySuccess = false;
        throw e
      }
    },
    Fast() {
      let that = this;
      this.player?.JS_Fast(0).then(
        (iRate) => {
          // console.log("Fast success, current rate", iRate);
          that.playingRate = iRate;
          if (iRate == 1) {
            that.$message.warning("当前播放速度正常");
          }
        },
        (e) => {
          console.error("Fast failed", e);
          that.$message.warning("已经是最快速度了!");
        }
      );
    },
    Slow() {
      let that = this;
      this.player?.JS_Slow(0).then(
        (iRate) => {
          // console.log("Fast success, current rate", iRate);
          that.playingRate = iRate;
          if (iRate == 1) {
            that.$message.warning("当前播放速度正常");
          }
        },
        (e) => {
          console.error("Fast failed", e);
          that.$message.warning("已经是最慢速度了!");
        }
      );
    },
    FrameForward() {
      this.player?.JS_FrameForward(0).then(
        () => {
          // console.log("FrameForward success");
        },
        () => {
          console.error("FrameForward failed");
        }
      );
    },
    Pause() {
      let that = this;
      this.player?.JS_Pause(0).then(
        () => {
          // console.log("Pause success");
          that.isPlaySuccess = false;
        },
        (e) => {
          console.error("Pause failed", e);
        }
      );
    },
    Resume() {
      let that = this;
      this.player?.JS_Resume(0).then(
        () => {
          that.isPlaySuccess = true;
          // console.log("Resume success");
        },
        (e) => {
          console.error("Resume failed", e);
        }
      );
    },
    stop() {
      this.Stop();
    },
    Record() {
      let that = this;
      let szTime = moment(new Date()).format("YYYYMMDDHHmmss");
      this.player?.JS_StartSaveEx(0, `10.17.137.229_01_${szTime}.mp4`, 5).then(
        () => {
          that.isRecording = true;
          that.timer = setInterval(that.startTimer, 1000);
          // console.log("record success");
        },
        () => {
          console.error("record failed");
        }
      );
    },
    StopRecord() {
      let that = this;
      this.player?.JS_StopSave(0).then(
        () => {
          that.isRecording = false;
          window.clearInterval(that.timer);
          that.hour = 0;
          that.minute = 0;
          that.second = 0;
          // console.log("stopRecord success");
        },
        () => {
          console.error("stopRecord failed");
        }
      );
    },
    openSound() {
      this.player?.JS_OpenSound(this.curIndex).then(() => {
        this.isOpenSound = false;
      }, (err) => {
        this.$message.error("声音播放失败");
        console.error("声音播放失败", err);
      })
    },
    closeSound() {
      this.player?.JS_CloseSound(this.curIndex).then(() => {
        this.isOpenSound = true;
      }, (err) => {
        this.$message.error("声音关闭失败");
        console.error("声音关闭失败", err);
      })
    },
    FullSreen() {
      this.player?.JS_FullScreenDisplay(true).then(
        () => {
          // console.log("JS_FullScreenDisplay success");
        },
        () => {
          console.error("JS_FullScreenDisplay failed");
        }
      );
    },
    async Destroy() {
      this.stop()
    },
    // 视频播放类型插件销毁需要时间，频繁切换时加个防抖
    setPlayType: debounce(1000, async function () {
      this.isPlaySuccess && (await this.player?.JS_Stop());
      this.play();
    }),


    /**
     * export
     */
    snapShot() {
      this.CapturePicture(1);
    },

    /**
     *
     * @param {*} getImgData 受否获取图片数据，若是则返回图片数据不自动下载，否则自动下载图片，不返回图片数据
     */
    CapturePicture(getImgData) {
      const time = new Date().getTime();
      if (getImgData) {
        this.player?.JS_CapturePicture(0, `${time}`, "JPEG", (imgData) => {
          // console.log("imageData", imgData);
          window.parent.postMessage(
            {
              cmd: "snapShotRes",
              data: imgData,
            },
            "*"
          );
        });
      } else {
        this.player?.JS_CapturePicture(0, `${time}`, "JPEG");
      }
    },
  },
};
</script>

<style lang="less" scoped>
.h5-player {
  position: relative;
  width: 100%;
  height: 100%;

  .control-btns {
    background-color: rgb(61, 61, 61);
    width: 100%;
    height: 38px;
    margin: 0 auto;

    .wpgicon:hover {
      background-color: rgb(81, 81, 81);
    }

    /deep/ .wpg-btn-link {
      color: white;
      cursor: auto;

      &:hover {
        color: white;
      }
    }

    /deep/ .wpg-btn-link[disabled] {
      cursor: not-allowed;
      color: gray;

      &:hover {
        color: gray;
      }
    }
  }

  .message {
    position: absolute;
    top: 50%;
    left: 0;
    width: 100%;
    transform: translateY(-50%);
    text-align: center;
    color: #fff;
  }
}
</style>
