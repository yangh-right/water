<!--
 * @Description: 视频流播放组件
 * @Author: liuct
 * @Date: 2021-05-20 09:17:59
 * @LastEditTime: 2023-03-28 09:30:00
 * @LastEditors: Do not edit
-->
<template>
  <div class="video-con">
    <div class="video-main">
      <div
        v-for="it in videoModel"
        :key="it"
        :class="className"
        style="width:100%;height:100%;"
      ></div>
    </div>
    <!-- <div class="video-tool">
      <div @click="videoModel = 1"><img src="@/assets/images/default/icons/one.png" alt="" /></div>
      <div @click="videoModel = 4"><img src="@/assets/images/default/icons/four.png" alt="" /></div>
      <div @click="videoModel = 9"><img src="@/assets/images/default/icons/nine.png" alt="" /></div>
    </div> -->
  </div>
</template>

<script>
import { getPreviewUrlById } from '@/api/runMonitor';
import { viewVideo } from '@/api/onSiteSupervision';
import videojs from 'video.js';
import video_zhCN from 'video.js/dist/lang/zh-CN.json';
import 'videojs-contrib-hls';
videojs.addLanguage('zh-CN', video_zhCN);
import { mapGetters, mapMutations } from 'vuex';
export default {
  name: 'VideoFlow',
  props: {
    item: {
      type: Object,
      default: () => {}
    },
    videType: {
      type: String,
      default: ''
    },
    playSite: {
      // 播放设置1手动播放,2循环播放
      default: '1',
      type: String
    }
  },
  data() {
    return {
      videoModel: 1, // 播放模式，1表示一宫格，4表示四宫格，9表示九宫格
      current: 1,
      videoPlays: [], // 所有的视频播放器
      setInterval: null,
      allVideoList: [],
      player:null
    };
  },
  computed:{
    className(){
      return 'video-active'+this.item.id;
    }
  },
  watch: {
    item: {
      handler(val) {
        this.$nextTick(() => {
          if (val) {
            if(this.player){
               this.player.dispose()
            }
            this.addVideo(val);
          }
        });
      },
      immediate: true
    },
    playSite(val) {
      clearInterval(this.setInterval);
      if (val === '2') {
        this.setLoopPlay();
      }
    }
    // videoModel(val) {
    //   if (this.playSite === '2') {
    //     clearInterval(this.setInterval);
    //     this.setLoopPlay();
    //   } else {
    //     const videoSrc = this.videoPlays.map((v, i) => {
    //       return i < val ? v.src : null;
    //     });
    //     console.log(videoSrc);
    //     this.stopAllPreview();
    //     this.$nextTick(() => {
    //       videoSrc.forEach(src => {
    //         this.addVideo(src);
    //       });
    //     });
    //   }
    // }
  },
  mounted() {
    // if (this.playSite === '2') {
    //   this.setLoopPlay();
    // }
  },
  beforeDestroy() {
    this.stopAllPreview();
    clearInterval(this.setInterval);
  },
  methods: {
    ...mapGetters('tree', ['getAllFlowVideoCode']),
    ...mapMutations('tree', ['setWndNum']),
    videoPlay(id, src) {
      this.player = videojs(id, {}, function() {
        // this.player.play();
      });
      let vm=this;
      this.$nextTick(()=>{
        vm.player.play();
      })
      if (this.videoPlays.length < this.videoModel) {
        this.videoPlays.push({ index: this.current, video: this.player, src: src });
      } else {
        this.videoPlays[this.videoModel - 1] = { index: this.current, video: this.player, src: src };
      }
    },
    addVideo(src) {
      const con = document.getElementsByClassName('video-active'+this.item.id)[0];
      const width = con.clientWidth;
      const height = con.clientHeight;
      this.videoPlays.forEach(item => {
        if (item.index === this.current) {
          item.video.dispose();
        }
      });
      con.innerHTML = `<video
                    id='video${src.id}'
                     width=${width - 2}
                    height=${height - 2}
                    muted
                    class="video-js vjs-default-skin"
                    controls
                >
                    <source src=${src.videoUrl}>
                </video>`;
      this.videoPlay(`video${src.id}`, src.videoUrl);
      // this.current = this.current < this.videoModel ? ++this.current : this.current;
    },
    change(item) {
      this.current = item;
    },
    setLoopPlay() {
      this.setWndNum(this.videoModel);
      this.allVideoList = this.getAllFlowVideoCode();
      let steep = 1;
      this._setIntervalPlaly(steep);
      this.setInterval = setInterval(() => {
        if (steep >= this.allVideoList.length) steep = 0;
        this._setIntervalPlaly(steep);
        steep++;
      }, 60 * 1000);
    },
    _setIntervalPlaly(steep) {
      // 停止之前的视频
      this.stopAllPreview();
      if (typeof this.allVideoList[steep].length >= 0) {
        this.allVideoList[steep].forEach((item, i) => {
          this.viewVideo(item);
        });
      } else {
        this.viewVideo(this.allVideoList[steep]);
      }
    },
    stopAllPreview() {
      this.current = 1;
      this.videoPlays.forEach(v => {
        v.video.dispose();
      });
      this.videoPlays = [];
    }
  }
};
</script>

<style lang="less" scoped>
.video-con {
  width: 100%;
  height: 100%;
  .video-main {
    display: flex;
    width: 100%;
    flex-wrap: wrap;
    height: 100%;
    height: calc(100% - 38px);
    background: #1d1e1e;
    > div {
      border: 1px solid rgb(43, 41, 41);
      .video-js .vjs-tech {
        position: relative !important;
      }
    }
    .video-active {
      border: 1px solid rgb(168, 168, 43);
    }
  }
  .video-tool {
    height: 38px;
    background: #333;
    display: flex;
    justify-content: flex-end;
    > div {
      height: 38px;
      width: 38px;
      padding: 10px;
      cursor: pointer;
    }
    > div:hover {
      background: #444;
    }
    img {
      width: 18px;
      height: 18px;
    }
  }
}
</style>
