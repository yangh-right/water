<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-02-25 15:16:39
 * @LastEditTime: 2022-09-30 09:57:36
 * @LastEditors: huhaiou
-->
<template>
  <div class="video-iframe-box">
    <div v-if="playType === '2'" class="query-con">
      <span>视频回放</span>
      <span>
        查询时间：
        <w-range-picker
          v-model="queryTime"
          :show-time="{ format: 'HH:mm:ss' }"
          style="width: auto; margin-bottom: 10px;"
          :disabled-date="disabledDate"
          :placeholder="['开始时间', '结束时间']"
          :allowClear="false"
          :format="'YYYY-MM-DD HH:mm:ss'"
          @calendarChange="handleCalendarChange"
          @ok="handleOk"
          @openChange="openChange"
        />
      </span>
    </div>
    <w-tabs v-if="videoType === '3'" v-model="mediaType" size="small" class="tab-con">
      <w-tab-pane key="1" tab="流媒体"></w-tab-pane>
      <w-tab-pane key="2" tab="插件"></w-tab-pane>
    </w-tabs>
    <iframe ref="iframe" class="video-con" title="视频播放" :src="iframeUrl"></iframe>
  </div>
</template>

<script>
import { VUE_APP_HOST } from '@/constants';
import { accessToken } from '@wpg/framework-vue';
import debounce from 'lodash/debounce';

export default {
  name: 'VideoIframe',
  props: {
    /**
     * 视频主键id（或 videoId：视频id，videoType：视频类型，取字典value值，videoName：视频名称）
     * （二选一，若传了id则不需传后面三个，若不传id，则必须传videoId和videoType）
     */
    id: {
      type: String,
      default: ''
    },
    videoId: {
      type: String,
      default: ''
    },
    videoType: {
      type: String,
      default: ''
    },
    videoName: {
      type: String,
      default: ''
    },
    // 播放类型（"1"：实时监控，"2"：视频回放，默认"1"）
    playType: {
      type: String,
      default: '1'
    },
    // 插件或流媒体播放（"1"：流媒体，"2"：插件，默认"1"）（只针对同时支持插件和流媒体播放视频类型有效）
    activeMediaPlugin: {
      type: String,
      default: '1'
    },
    // isc插件播放时会出现两个插件播放画面，outerWidth、outerHeight是外层容器modal的宽高
    outerSize: {
      // [outerWidth, outerHeight]
      type: Array,
      default: () => {
        return [0, 0];
      }
    }
  },
  data() {
    return {
      dragModalResize: false, // modal是否全屏
      screenWidth: 0,
      screenHeight: 0,
      mediaType: this.activeMediaPlugin,
      queryTime: [this.$moment().day(this.$moment().day() - 1), this.$moment()]
    };
  },
  computed: {
    // top、left视频窗口在页面中的实际位置
    offset() {
      const TOP_OFFSET_FULLSCREEN = 142;
      const TOP_OFFSET_NORMAL = 96;
      const LEFT_OFFSET = 16;

      const topOffset = this.playType === '2' ? TOP_OFFSET_FULLSCREEN : TOP_OFFSET_NORMAL;

      if (this.dragModalResize) {
        return {
          top: topOffset,
          left: LEFT_OFFSET
        };
      }

      const calculateCenterPosition = (screenSize, elementSize) => {
        return elementSize === 0 ? 0 : (screenSize - elementSize) / 2;
      };

      return {
        top: calculateCenterPosition(this.screenHeight, this.outerSize[1]) + topOffset,
        left: calculateCenterPosition(this.screenWidth, this.outerSize[0]) + LEFT_OFFSET
      };
    },
    iframeUrl() {
      const token = accessToken.get();
      const { id, videoId, videoType, playType, mediaType, offset } = this;
      const baseUrl = `${
        process.env?.NODE_ENV === 'development' ? VUE_APP_HOST : ''
      }/device-plat/iframe.html#/videoDevice/video`;
      let queryUrl = '';
      if (id) queryUrl += `id=${id}`;
      else queryUrl += `videoId=${encodeURIComponent(videoId)}&videoType=${videoType}`;
      if (mediaType) queryUrl += `&activeMediaPlugin=${mediaType}`;
      if (playType === '2') {
        let startTime = this.queryTime[0].format('YYYYMMDDTHHmmss');
        let endTime = this.queryTime[1].format('YYYYMMDDTHHmmss');
        queryUrl += `&startTime=${startTime}&endTime=${endTime}`;
      }
      if (videoType === '3' && mediaType === '2') {
        queryUrl += `&left=${offset.left}&top=${offset.top}`;
      }
      return `${baseUrl}?${queryUrl}&playType=${playType}&token=${token}`;
    },
    iframeWindow() {
      return this.$refs.iframe.contentWindow;
    }
  },
  watch: {
    offset() {
      if (this.videoType === '3' && this.mediaType === '2') this.resizeVideo();
    },
    id() {
      this.playType === '2' && this.initQueryTime();
      this.refreshVideo();
    },
    videoId() {
      this.playType === '2' && this.initQueryTime();
      this.refreshVideo();
    },
    playType() {
      this.playType === '2' && this.initQueryTime();
      this.refreshVideo();
    },
    mediaType() {
      this.playType === '2' && this.initQueryTime();
      this.refreshVideo();
    }
  },
  methods: {
    /* 初始化回放日期 */
    initQueryTime() {
      // 大华视频播放模式仅为流媒体播放，回放时间只能是当天，不能跨天
      if (this.videoType === '7') this.queryTime = [this.$moment().startOf('day'), this.$moment()];
    },
    /* 禁止选择日期 */
    disabledDate(current) {
      // 当前视频为类型7即大华乐橙视频时，回放时间只能是当天，不能跨天
      if (this.videoType === '7') {
        if (!this.disabledCurrent) return current > this.$moment();
        return (
          (current &&
            current <
              this.$moment(this.disabledCurrent)
                .subtract(0, 'day')
                .startOf('day')) ||
          current >
            this.$moment(this.disabledCurrent)
              .add(0, 'day')
              .endOf('day') ||
          current > this.$moment()
        );
      } else return current && current > this.$moment().endOf('day');
    },

    /**
     * 获取手动选择的时间段起始值
     */
    handleCalendarChange(dates) {
      // 获取手动选择的时间段起始值
      this.disabledCurrent = dates[0];
    },

    /* 弹出日历和关闭日历 */
    openChange(status) {
      // 清空禁用时间段的设置
      this.disabledCurrent = null;
      this.setHideVideo(status);
    },

    /* 确认选择时间 */
    handleOk(dates) {
      this.queryTime = dates;
      this.refreshVideo();
    },

    setHideVideo(status) {
      /**
       * 隐藏显示视频（插件播放时使用，event.data.cmd === "setHideVideo"，event.data.params传true或false）
       * */
      this.iframeWindow.postMessage({ cmd: 'setHideVideo', params: status }, '*');
    },

    refreshVideo() {
      setTimeout(() => {
        // 切换刷新视频（event.data.cmd === "refresh"）
        this.iframeWindow.postMessage({ cmd: 'refresh' }, '*');
      });
    },

    stopPlay() {
      // 停止播放（event.data.cmd === "stop"）
      this.iframeWindow.postMessage({ cmd: 'stop' }, '*');
    },

    resizeVideo() {
      setTimeout(() => {
        // 调整视频位置（event.data.cmd === "resize"）
        this.iframeWindow.postMessage({ cmd: 'resize' }, '*');
      });
    },

    // 窗口大小发生变化会重新计算offset
    listenResize: debounce(function() {
      this.screenWidth = document.body.clientWidth;
      this.screenHeight = document.body.clientHeight;
    }, 1000)
  },
  mounted() {
    this.playType === '2' && this.initQueryTime();

    // 监听窗口大小变化
    this.screenWidth = document.body.clientWidth;
    this.screenHeight = document.body.clientHeight;
    window.addEventListener('resize', this.listenResize);

    // 监听弹窗窗口全屏--flag：true全屏 false退出全屏
    this.$bus.$on('dragModalResize', flag => {
      this.dragModalResize = flag;
    });
  },
  beforeDestroy() {
    window.removeEventListener('resize', this.listenResize);
  }
};
</script>

<style lang="less" scoped>
.video-iframe-box {
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .video-con {
    flex: 1;
    width: 100%;
  }
}
</style>
