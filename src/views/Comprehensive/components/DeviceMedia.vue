<template>
  <div class="media">
    <div class="media-img" v-for="opt of fileList" :key="opt.fileId">
      <!-- 图片 -->
      <w-spin :spinning="opt.spinning">
        <div class="img-card" v-if="opt.fileType === 0">
          <img
            class="img-play img-icon"
            :src="imgs.pictureImg"
            alt=""
            @click="handleShowImg(opt)"
          />
          <img class="img-close img-icon" :src="imgs.deleteImg" alt="" @click="handleClose(opt)" />
          <img class="img-item" :src="opt.fileUrl" alt="" />
          <span class="img-cover"></span>
        </div>
        <!-- 视频 -->
        <div class="img-card" v-else-if="opt.fileType === 1">
          <img
            class="img-play img-icon"
            :src="imgs.playImg"
            alt=""
            @click="handleVideoPlay(opt.fileUrl)"
          />
          <img class="img-close img-icon" :src="imgs.deleteImg" alt="" @click="handleClose(opt)" />
          <video class="img-item" width="80" height="80">
            <source :src="opt.fileUrl" />
          </video>
          <span class="img-cover"></span>
        </div>
      </w-spin>
    </div>
    <w-upload
      v-if="isEdit"
      class="media-uploader"
      name="file"
      list-type="picture-card"
      :action="action"
      :headers="headers"
      :file-list="fileList"
      :multiple="multiple"
      :show-upload-list="false"
      :before-upload="beforeUpload"
      @change="handleUploadChange"
    >
      <span class="uploader-content">
        <img class="uploader-img" :src="imgs.addImg" />
      </span>
      <div class="uploader-text">上传照片/视频</div>
    </w-upload>
    <div v-if="isEdit">支持.jpg、png、.mp4文件，可上传{{ limit }}个文件，单个文件大小不超过50M</div>
    <w-modal :visible="imgVisible" :footer="null" @cancel="imgVisible = false">
      <img style="width: 100%" :src="previewImgUrl" />
      <div style="text-align: center;margin-top: 10px">
        <w-button type="primary" @click="setCover">设置为封面</w-button>
      </div>
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
import addImg from '@/assets/images/default/device/ic_add@2x.png';
import deleteImg from '@/assets/images/default/device/ic_delete@2x.png';
import pictureImg from '@/assets/images/default/device/ic_picture@2x.png';
import playImg from '@/assets/images/default/device/ic_play@2x.png';
import { accessToken } from '@wpg/framework-vue';

import serverConfig from '@/config/server.config';
export default {
  name: 'DeviceMedia',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    accept: {
      type: Array,
      default: () => ['jpeg', 'jpg', 'png', 'gif', 'webp', 'mp4', 'webm', 'ogg', 'mpeg4']
    },
    multiple: {
      type: Boolean,
      default: false
    },
    url: {
      type: String,
      default: ''
    },
    limit: {
      type: Number,
      default: 9
    },
    isEdit: {
      type: Boolean,
      default: true
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    }
  },
  data() {
    return {
      imgVisible: false,
      previewImgUrl: '',
      imgTypes: ['jpeg', 'jpg', 'JPG', 'png', 'gif', 'webp'],
      videoTypes: ['mp4', 'webm', 'ogg', 'mpeg4'],
      headers: {},
      videoVisible: false,
      loading: false,
      fileList: [],
      imgs: {
        addImg,
        deleteImg,
        pictureImg,
        playImg
      },
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      previewFile: {}
    };
  },
  computed: {
    action() {
      return serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/fileUploadNew';
    }
  },
  watch: {
    value: {
      handler() {
        this.initData();
      },
      deep: true,
      immediate: true
    }
  },
  created() {
    this.headers = { Authorization: 'Bearer ' + accessToken.get() };
  },
  methods: {
    initData() {
      this.fileList = this.value?.map(item => {
        return {
          spinning: false,
          uid: item.fileId,
          name: item.fileName, // 文件名
          status: 'done',
          fileUrl: this.getFileAccessUrl(item.fileId, this.previewBaseUrl),
          ...item
        };
      });
    },
    beforeUpload(file) {
      if (this.fileList.length === this.limit) {
        this.$message.warning(`最多上传${this.limit}个照片视频`);
        return false;
      }
      const isType = file.type.startsWith('image') || file.type.startsWith('video');
      if (!isType) {
        this.$message.warning('文件类型不合适！');
        return false;
      }
      const isStorage = file.size / 1024 / 1024 < 50;
      if (!isStorage) {
        this.$message.warning('文件大小不能大于50M！');
        return isStorage;
      }
    },
    handleUploadChange(fileObj) {
      let { fileList } = fileObj;
      this.fileList = fileList.map(file => {
        let item = {
          fileId: undefined,
          fileUrl: undefined,
          fileType: 0,
          spinning: false,
          ...file
        };
        if (file?.response?.resultData?.uniqueId) {
          item.fileId = item.response.resultData.uniqueId;
          item.fileUrl = this.getFileAccessUrl(
            item.response.resultData.uniqueId,
            this.previewBaseUrl
          );
          if (this.imgTypes.some(i => item.type.includes(i))) {
            item.fileType = 0;
          } else {
            item.fileType = 1;
          }
          item.uploadTime = this.$moment().format(this.format);
        } else {
          item.status = item.status || 'error';
        }
        if (!item.fileId && item.status === 'done') {
          item.status = 'error';
          item.response = file?.response?.errorMessage || '上传错误';
          this.$message.error(file?.response?.errorMessage || '上传错误');
        }
        item.spinning = file.status !== 'done';
        return item;
      });
      this.fileList = this.fileList.filter(file => file.status !== 'error');
      this.loading = this.fileList.some(i => i.status === 'uploading');
      if (this.fileList.every(i => i.status === 'done')) {
        this.returnFileChange();
      }
    },
    getFileAccessUrl(uniqueId, previewBaseUrl, subStr = serverConfig.PUBLIC_API_BASE_URL) {
      if (uniqueId?.startsWith(subStr) || uniqueId?.startsWith('http')) {
        return uniqueId;
      } else {
        return previewBaseUrl + uniqueId;
      }
    },
    // 回传父组件,数据的变化
    returnFileChange() {
      let fileList = this.fileList.map(item => {
        return {
          fileId: item.fileId,
          fileName: item.name,
          fileType: item.fileType //文件类型 0 图片 1 视频 2文件
        };
      });
      this.$emit('input', fileList);
    },
    // 关闭图片
    handleClose(opt) {
      this.fileList = this.fileList.filter(item => item.fileId !== opt.fileId);
      this.$emit('input', this.fileList);
    },
    // 显示图片
    handleShowImg(file) {
      this.imgVisible = true;
      this.previewImgUrl = file.fileUrl;
      this.previewFile = file;
    },
    // 视频播放
    handleVideoPlay(fileUrl) {
      this.videoVisible = true;
      this.previewImgUrl = fileUrl;
    },
    setCover() {
      let index = this.fileList.findIndex(file => file.fileId === this.previewFile.fileId);
      if (index > -1) {
        this.fileList.splice(index, 1);
        this.fileList.unshift(this.previewFile);
        this.$emit('input', this.fileList);
        this.$message.success('已设置为封面，在保存之后生效');
      }
    }
  }
};
</script>

<style lang="less" scoped>
.media {
  display: flex;
  flex-direction: row;
  flex-wrap: wrap;
  .media-img {
    width: 100px;
    height: 100px;
    padding: 10px;
    line-height: 100px;
    text-align: center;
    border-radius: 4px;
    overflow: hidden;
    margin-right: 16px;
    .img-card {
      widows: 80px;
      height: 80px;
      border-radius: 10px;
      overflow: hidden;
      position: relative;
      .img-play {
        display: none;
        width: 22px;
        height: 22px;
        position: absolute;
        top: calc(50% - 12px);
        left: 10px;
        cursor: pointer;
        z-index: 10;
      }
      .img-close {
        display: none;
        width: 22px;
        height: 22px;
        position: absolute;
        top: calc(50% - 12px);
        right: 10px;
        cursor: pointer;
        z-index: 10;
      }
      .img-item {
        display: block;
        width: 100%;
        height: 100%;
        object-fit: cover;
      }
      .img-cover {
        display: none;
        background: rgba(255, 255, 255, 0.3);
      }
      &:hover {
        .img-cover {
          display: inline-block;
          position: absolute;
          width: 80px;
          height: 80px;
          top: 0;
          left: 0;
          z-index: 1;
        }
        .img-icon {
          display: inline;
        }
      }
    }
  }
  .media-uploader {
    border: 1px dashed #d6d6d6;
    border-radius: 4px;
    width: 100px;
    height: 100px;
    .uploader-content {
      margin-left: calc(50% - 15px);
      width: 30px;
      height: 30px;
      border: 1px dashed #d6d6d6;
      display: flex;
      justify-content: center;
      align-items: center;
      .uploader-img {
        width: 18px;
        height: 18px;
        border: 1px dashed #d6d6d6;
      }
    }
    .uploader-text {
      margin-top: 6px;
      font-size: 12px;
      color: #999;
    }
  }
}
</style>
