<template>
  <div>
    <w-carousel class="img-carousel" dotsClass="dots-class" arrows :beforeChange="beforeChange">
      <template #prevArrow>
        <div class="icon-item left-icon">
          <img :src="leftImg" />
        </div>
      </template>
      <template #nextArrow>
        <div class="icon-item right-icon">
          <img :src="rightImg" />
        </div>
      </template>
      <div class="file-item" v-for="(opt, index) of fileList" :key="opt.fileId">
        <div class="file-title" :title="opt.fileName">{{ opt.fileName }}</div>
        <img
          v-if="opt.fileType === 0"
          class="file-item"
          :src="handleImgSrc(opt.fileId)"
          @click="handlePreview('img', handleImgSrc(opt.fileId))"
        />
        <video
          v-if="opt.fileType === 1"
          class="file-item"
          width="220"
          height="240"
          @click="handlePreview('video', handleImgSrc(opt.fileId))"
        >
          <source :src="handleImgSrc(opt.fileId)" />
        </video>
        <HtVideo :videoId="opt.videoId" :videoType="opt.videoType" :key="opt.videoId"></HtVideo>
        <!-- <videolive-Box

          :currentVideoCode="opt.videoId"
          :extColumn="opt.videoType"
        ></videolive-Box> -->
      </div>
      <w-empty v-if="!fileList.length" class="empty" description="暂无图片"></w-empty>
    </w-carousel>
    <w-modal
      :visible="imgVisible"
      width="600px"
      :footeeleteDevicer="null"
      @cancel="imgVisible = false"
    >
      <img style="width: 100%" :src="previewImgUrl" />
    </w-modal>
    <w-modal
      :visible="videoVisible"
      width="800px"
      title="视频播放"
      :footer="null"
      @cancel="videoVisible = false"
    >
      <video width="720" height="400" controls autoplay>
        <source :src="previewImgUrl" />
        <source :src="previewImgUrl" type="video/mp4" />
        <source :src="previewImgUrl" type="video/ogg" />
        <source :src="previewImgUrl" type="video/webm" />
        <source :src="previewImgUrl" type="video/mpeg4" />
        您的浏览器不支持Video标签。
      </video>
    </w-modal>
  </div>
</template>

<script>
import leftImg from '@/assets/images/default/device/ic_chevron_left@2x.png';
import rightImg from '@/assets/images/default/device/ic_chevron_right@2x.png';
import HtVideo from './video-player/index.vue';
import serverConfig from '@/config/server.config';
export default {
  name: 'ImageSwitch',
  components: { HtVideo },
  props: {
    fileList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      leftImg,
      rightImg,
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      imgVisible: false,
      videoVisible: false,
      previewImgUrl: '',
      protocal: this.$config.protocal ? this.$config.protocal : 'ws' //'ws','hls'
    };
  },
  computed: {
    isChrome() {
      return navigator.userAgent.toLowerCase().includes('chrome');
    }
  },
  watch: {},
  activated() {},
  methods: {
    beforeChange(form, to) {
      this.fileList.forEach((item, index) => {
        this.fileList[index].showVideo = false;
      });
      this.fileList[to].showVideo = true;
    },
    handleImgSrc(fileId) {
      if (fileId) {
        return this.previewBaseUrl + fileId;
      }
      return '';
    },
    handlePreview(type, src) {
      if (type === 'img') {
        this.imgVisible = true;
      } else if (type === 'video') {
        this.videoVisible = true;
      }
      this.previewImgUrl = src;
    }
  }
};
</script>

<style lang="less" scoped>
.img-carousel {
  width: 220px;
  height: 240px;
  .empty {
    height: 240px;
    padding-top: 40px;
  }
  .file-item {
    width: 220px;
    height: 240px;
    border-radius: 10px;
    overflow: hidden;
    position: relative;
    .file-title {
      position: absolute;
      top: 0;
      width: 100%;
      height: 30px;
      padding: 0 16px;
      line-height: 30px;
      background: rgba(255, 255, 255, 0.2);
      border-radius: 0 0 4px 4px;
      text-align: center;
      color: #fff;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      z-index: 10;
    }
    .file-item {
      display: block;
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }
}
/deep/ .dots-class {
  height: 10px;
  li {
    margin-right: 16px;
    button {
      width: 10px !important;
      height: 10px;
      border-radius: 50%;
      background-color: #f5f5f5;
    }
  }
  .slick-active {
    button {
      background-color: #fff;
    }
  }
}
/deep/ .icon-item {
  width: 26px;
  height: 26px;
  top: calc(50% - 13px);
  z-index: 10;
  line-height: 26px;
  text-align: center;
  border-radius: 4px;
  background-color: rgba(31, 45, 61, 0.5);
  opacity: 0.8;
  img {
    width: 10px;
    height: 14px;
  }
  &:hover {
    opacity: 1;
    background-color: rgba(31, 45, 61, 0.5);
  }
}
/deep/ .left-icon {
  left: 4px;
}
/deep/ .right-icon {
  right: 4px;
}
</style>
