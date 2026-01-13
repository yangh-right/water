<template>
  <div class="main-page-wrap">
    <div class="main-page">
      <div class="iframeBox">
        <div class="video-bg"></div>
        <video
          :class="['iframeBox_video', showVideoImg ? 'video-load ' : '']"
          loop
          id="regulationVideo"
          muted="muted"
          autoplay="autoplay"
          :src="videoUrl"
          controls="controls"
          poster="@/assets/images/default/smart-center-bg.png"
        ></video>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'digitalTwin',
  components: {},
  data() {
    return {
      btnList: [
        { key: 'slkz', name: '水量预测模型' },
        { key: 'sssl', name: '实时水龄模型' },
        { key: 'fmkd', name: '阀门开度模型' },
        { key: 'dtgfq', name: '动态高峰期' },
        { key: 'txpc', name: '精准调蓄排程' },
        { key: 'ywkz', name: '最佳液位控制' }
      ],
      btnKey: 'slkz',
      showVideoImg: true,
      videoUrl: `${
        process.env?.NODE_ENV === 'development'
          ? 'http://10.10.15.107/purification_video/1.mp4'
          : '/purification_video/1.mp4'
      }`,
      svgPreviewUrl: undefined,
      timeinter: null
    };
  },
  mounted() {
    const myVid = document.getElementById('regulationVideo');
    myVid.addEventListener('loadeddata', () => {
      this.showVideoImg = false;
      this.time();
    });
    myVid.addEventListener('loadstart', () => {
      this.showVideoImg = true;
    });
  },
  beforeDestroy() {
    clearInterval(this.timeinter);
    this.timeinter = null;
  },
  methods: {
    time() {
      if (this.timeinter) {
        clearInterval(this.timeinter);
      }
      this.timeinter = setInterval(() => {
        let index = this.btnList.findIndex(item => item.key === this.btnKey);
        if (index >= this.btnList.length - 1) {
          index = 0;
        } else {
          index += 1;
        }
        this.btnKey = this.btnList[index].key;
        if (index === 0) {
          setTimeout(() => {
            this.time();
          }, 800);
        }
      }, 4167);
    }
  }
};
</script>

<style lang="less" scoped>
.main-page-wrap {
  width: 100%;
  height: 100%;
  position: relative;
}

.main-page {
  width: 100%;
  height: 100%;
  position: relative;

  .iframeBox,
  .iframeBox > iframe {
    width: 100%;
    height: 100%;
  }

  .iframeBox {
    position: relative;
    .video-bg {
      position: absolute;
      width: 100%;
      height: 100%;
      background: url('~@/assets/images/default/smart-center-bg.png') no-repeat;
      background-size: 100% 100%;
    }
    &_video {
      position: relative;
      width: 100%;
      height: 100%;
      &.video-load {
        z-index: 1;
      }
    }

    #regulationVideo {
      pointer-events: none;
    }
  }
}
</style>
