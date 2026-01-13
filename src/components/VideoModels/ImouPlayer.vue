<template>
  <div class="video-wrapper">
    <div class="imou-player" :id="this.playerId"></div>
  </div>
</template>
<script>
import moment from 'moment';
import { getImouPlayKitToken } from '@/api/runMonitor';
export default {
  name: 'ImouPlayer',
  props: {
    videoId: {
      required: true
    },
    queryTime: {
      required: false
    },
    playType: {
      required: true,
      type: String
    },
    playerId: {
      required: false,
      type: String,
      default: 'player'
    },
    videoName: {
      required: false
    }
  },
  data() {
    return {
      player: undefined,
      videoUrl: '',
      kitToken: '',
      initCount: 0
    };
  },
  methods: {
    async init() {
      if (!this.videoId || !this.videoId?.includes('#')) {
        return false;
      }
      await this.stop();
      let url = `imou://open.lechange.com/${this.videoId.replace('#', '/')}/${
        this.playType
      }?streamId=1`; //&streamType=hls
      this.kitToken = await getImouPlayKitToken({ videoId: this.videoId });
      if (this.playType == '1') {
        this.videoUrl = url;
      } else if (this.playType == '2') {
        const beginTime = moment(this.queryTime[0]).format('YYYY-MM-DD HH:mm:ss');
        const endTime = moment(this.queryTime[1]).format('YYYY-MM-DD HH:mm:ss');
        this.videoUrl = `${url}&recordType=localRecord&beginTime=${beginTime}&endTime=${endTime}`;
      }
      const objArr = [
        {
          url: this.videoUrl,
          kitToken: this.kitToken
        }
      ];
      const width = document.querySelector(`#${this.playerId}`).clientWidth || 800;
      const height = document.querySelector(`#${this.playerId}`).clientHeight || 450;
      const params = {
        src: objArr,
        width: width,
        height: height,
        autoplay: true,
        controls: true
      };
      this.initPlayer(params);
    },
    async initPlayer(params) {
      await this.stop();
      setTimeout(() => {
        // eslint-disable-next-line no-undef
        this.player = new ImouPlayer(`#${this.playerId}`);
        this.player.setup(params);
        // this.initCount++;
        // setTimeout(() => {
        //   if (this.initCount < 3 && !this.player.playerSet[0]?.canvasPlayer) {
        //     this.initPlayer(params);
        //   }
        // }, 1000);
      }, 500);
    },
    async stop() {
      if (this.player) {
        await this.player.destroy();
      }
    }
  },
  mounted() {},
  activated() {
    if (this.playType == '1') {
      this.init();
    }
  },
  deactivated() {
    this.stop();
  },
  beforeDestroy() {
    this.stop();
  },
  watch: {
    videoId: {
      handler() {
        this.init();
      },
      immediate: true
    },
    playType() {
      this.init();
    },
    queryTime() {
      this.init();
    }
  }
};
</script>
<style lang="less" scoped>
.video-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  .imou-player {
    width: 100%;
    height: 100%;
    overflow: hidden;
    position: relative;
    /deep/ .player__split {
      display: none;
    }
  }
}
</style>
