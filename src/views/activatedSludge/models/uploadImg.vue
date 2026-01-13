<template>
  <div>
    <div v-if="type === 1" class="media">
      <div class="media-img" v-for="(opt, index) of fileList" :key="index">
        <!-- 图片 -->
        <w-spin :spinning="opt.spinning">
          <div class="img-card">
            <img
              class="img-play img-icon"
              :src="imgs.pictureImg"
              alt=""
              @click="handleShowImg(opt)"
            />
            <img
              class="img-close img-icon"
              :src="imgs.deleteImg"
              alt=""
              @click="handleClose(opt)"
            />
            <img class="img-item" :src="opt.fileUrl" alt="" />
            <span class="img-cover"></span>
          </div>
        </w-spin>
      </div>
      <w-upload
        v-show="show"
        class="media-uploader"
        name="file"
        list-type="picture-card"
        :action="action"
        :headers="headers"
        :file-list="fileList"
        :multiple="multiple"
        accept=".jpg, .jpeg, .png,.gif"
        :show-upload-list="false"
        :before-upload="beforeUpload"
        @change="handleUploadChange"
      >
        <span class="uploader-content">
          <img class="uploader-img" :src="imgs.addImg" />
        </span>
        <div class="uploader-text">上传照片</div>
      </w-upload>
    </div>
    <div v-if="type === 2">
      <w-upload
        v-show="show"
        name="file"
        list-type="picture-card"
        :action="action"
        :headers="headers"
        :file-list="fileList"
        :multiple="true"
        accept=".jpg, .jpeg, .png,.gif"
        :show-upload-list="false"
        :before-upload="beforeUpload"
        @change="handleUploadChange"
      >
        <a><w-icon type="plus" />添加文件</a>
      </w-upload>
    </div>
    <w-modal :visible="imgVisible" :footer="null" @cancel="imgVisible = false">
      <img style="width: 100%" :src="previewImgUrl" />
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
    multiple: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 9
    },
    format: {
      type: String,
      default: 'YYYY-MM-DD HH:mm:ss'
    },
    type: {
      type: Number,
      default: 1
    }
  },
  data() {
    return {
      imgVisible: false,
      previewImgUrl: '',
      imgTypes: ['jpeg', 'jpg', 'JPG', 'png', 'gif', 'webp'],
      headers: {},
      loading: false,
      fileList: [],
      imgs: {
        addImg,
        deleteImg,
        pictureImg,
        playImg
      },
      previewBaseUrl: serverConfig.IMG_BASE_URL,
      previewFile: {},
      show: true
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
    },
    fileList(val) {
      if (val && val.length < this.limit) {
        this.show = true;
      }
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
          name: item.fileName, // 文件名
          status: 'done',
          fileUrl: this.getFileAccessUrl(item.fileUrl, this.previewBaseUrl),
          ...item
        };
      });
      if (this.fileList.length === this.limit) {
        this.show = false;
      }
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
          imageUrl: undefined,
          fileUrl: undefined,
          fileType: 0,
          spinning: false,
          ...file
        };
        if (file?.response?.resultData?.fileUrl) {
          item.imageUrl = item.response.resultData.fileUrl;
          item.fileUrl = this.getFileAccessUrl(
            item.response.resultData.fileUrl,
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
        if (!item.imageUrl && item.status === 'done') {
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
        if (this.fileList.length === this.limit) {
          this.show = false;
        }
      }
    },
    getFileAccessUrl(imageUrl, previewBaseUrl, subStr = serverConfig.IMG_BASE_URL) {
      if (imageUrl?.startsWith(subStr) || imageUrl?.startsWith('http')) {
        return imageUrl;
      } else {
        return previewBaseUrl + imageUrl;
      }
    },
    // 回传父组件,数据的变化
    returnFileChange() {
      let fileList = this.fileList.map((item, index) => {
        return {
          imageUrl: item.imageUrl,
          fileName: item.name,
          fileUrl: item.fileUrl,
          name: '样本' + (index + 1),
          fileType: item.fileType //文件类型 0 图片 1 视频 2文件
        };
      });
      this.$emit('input', fileList);
    },
    // 关闭图片
    handleClose(opt) {
      this.fileList = this.fileList.filter(item => item.imageUrl !== opt.imageUrl);
      this.$emit('input', this.fileList);
    },
    // 显示图片
    handleShowImg(file) {
      this.imgVisible = true;
      this.previewImgUrl = file.fileUrl;
      this.previewFile = file;
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
        // opacity: 0.3;
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
