<template>
  <div class="vc-image-upload">
    <div v-if="readonly && fileList.length === 0">暂无图片信息</div>
    <w-upload
      :disabled="readonly"
      list-type="picture-card"
      :headers="headers"
      :file-list="fileList"
      :multiple="multiple"
      :action="action"
      :accept="accept"
      :before-upload="beforeUpload"
      :preview-file="handlePreiewFile"
      @change="handleUploadChange($event)"
      @preview="handlePreview"
      :showTrigger="!(readonly === true || fileList.length >= limit)"
    >
      <div v-if="!(readonly === true || fileList.length >= limit)">
        <w-icon :type="loading ? 'loading' : 'plus'" />
        <div class="wfc3 ant-upload-text">上传照片</div>
      </div>
    </w-upload>
    <p v-if="!readonly" class="wfc3 info">{{ info }}</p>
    <w-modal
      :visible="previewVisible"
      :footer="null"
      centered
      :maskClosable="false"
      :width="600"
      @cancel="previewVisible = false"
    >
      <img
        v-if="previewFile.mediaType.includes('image')"
        alt="example"
        style="width: 100%"
        :src="previewFile.src"
      />
      <video
        v-else-if="previewFile.mediaType.includes('video') && previewFile.src"
        id="video"
        style="width: 100%"
        controls
      >
        <source :src="previewFile.src" type="video/mp4" />
        <source :src="previewFile.src" type="video/ogg" />
        您的浏览器不支持 HTML5 video 标签。
      </video>
    </w-modal>
  </div>
</template>

<script>
import { accessToken } from '@wpg/framework-vue';
import serverConfig from '@/config/server.config';
const imgPrefix = '.png, .jpg, .jpeg, .gif, .bmp, .ico, .webp';
// const videoPrefix = '.mp4, .ogg, .flv, .avi, .wmv, .rmvb, .mov';
const videoPrefix = '.mp4';
const videoMask =
  'data:image/jpeg;base64,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';

export default {
  name: 'WVcUpload',

  model: {
    prop: 'value',
    event: 'change'
  },

  props: {
    disabled: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    tip: {
      type: String,
      default: ''
    },
    accept: {
      type: String,
      default: imgPrefix + ',' + videoPrefix
    },
    text: {
      type: String,
      default: '点击上传'
    },

    value: {
      type: [String, Array],
      require: false
    },
    // 默认为M
    maxSize: {
      type: Number,
      default: 100
    },
    // 是否多图
    multiple: {
      type: Boolean,
      required: false,
      default: false
    },
    // 多图情况下限制图片张数
    limit: {
      type: Number || String,
      required: false,
      default: 9
    }
  },

  data() {
    return {
      uid: {},
      fileList: [],
      headers: {},
      loading: false,
      previewVisible: false,
      previewFile: { mediaType: 'image/png', url: '', src: '' },
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/'
    };
  },
  computed: {
    info() {
      return `支持${this.accept}文件${this.accept.split[','] > 1 ? '等' : ''}, 可上传${
        this.limit
      }个文件,单个文件大小不超过${this.maxSize}M`;
    },
    action() {
      return serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/fileUploadNew';
    }
  },

  watch: {
    value(val) {
      if (Array.isArray(val)) {
        if (val.length !== this.fileList.length) {
          this.initFileList();
        }
      }
    }
  },

  created() {
    this.headers = { Authorization: 'Bearer ' + accessToken.get() };
    this.initFileList();
  },

  methods: {
    // 显示已有图片
    initFileList() {
      const paths = this.handleProcessValue();
      this.fileList = paths
        .map(file => {
          let url = file?.id && this.getFileAccessHttpUrl(file.id, this.previewBaseUrl);
          let fileName = this.getFileName(file?.url || '');
          return {
            ...file,
            id: file.id,
            uid: this.uid[fileName] || this.uidGenerator(),
            name: file?.name || fileName || 'image',
            status: file.status || 'done',
            url: url,
            thumbUrl: (file.mediaType || file.type).startsWith('video')
              ? file.thumbUrl ?? videoMask
              : url,
            type: file.mediaType || file.type
          };
        })
        .filter(i => i.url);
    },
    getFileName(path) {
      let p = path;
      if (p.lastIndexOf('\\') >= 0) {
        let reg = /\\\\/g;
        p = p.replace(reg, '/');
      }
      return p.substring(p.lastIndexOf('/') + 1);
    },
    uidGenerator() {
      return '-' + parseInt(Math.random() * 10000 + 1, 10);
    },
    getFileAccessHttpUrl(avatar, previewBaseUrl, subStr = serverConfig.PUBLIC_API_BASE_URL) {
      if (avatar?.startsWith(subStr) || avatar?.startsWith('http')) {
        return avatar;
      } else {
        return previewBaseUrl + avatar;
      }
    },
    /**
     * 处理传入的value
     */
    handleProcessValue() {
      /**
       * value 可能的格式
       *
       * 1. 'url'
       *
       * 2. ['url', 'url']
       *
       * 上面默认都是图片的url
       *
       * 3. [
       *  {type: 'image/*', url: ''},
       *  {type: 'video/mp4', url: ''}
       * ]
       */
      const value = this.value;
      let list = [];
      if (typeof value === 'string') {
        list = value
          .split(',')
          .filter(item => item)
          .map(i => ({ type: 'image/png', url: i }));
      } else {
        if (Array.isArray(value)) {
          list = value
            .filter(item => item)
            .map(i => {
              if (typeof i === 'object') {
                // const isVideo = (i?.mediaType || i?.type).includes('video');
                return {
                  ...i,
                  // url: isVideo ? undefined : i.url || i.id,
                  url: i.url || i.id
                };
              } else {
                return {
                  mediaType: 'image/png',
                  url: i,
                  status: 'done'
                };
              }
            });
        }
      }
      return list;
    },

    beforeUpload(file, fileList) {
      let fileType = file.type;
      if (fileType.indexOf('image') < 0 && fileType.indexOf('video') < 0) {
        this.$message.warning('请上传图片/视频！');
        return false;
      }
      let max = this.maxSize * 1024 * 1024;
      if (file.size > max) {
        this.$message.warning(`文件大小需要小于${this.maxSize}M！`);
        return false;
      }
      if (this.fileList.length + fileList.length > this.limit) {
        this.$message.warning(`最多上传${this.limit}张图片/视频`);
        return false;
      }
    },

    // 图片上传回调
    handleUploadChange(info) {
      this.loading = true;
      let fileList = [...info.fileList];
      if (fileList.length > this.limit) {
        fileList = fileList.slice(0, this.limit);
        this.$message.warning(`最多上传${this.limit}张图`);
      }

      this.fileList = fileList.map(file => {
        const item = { ...file };
        if (file?.response?.resultData?.uniqueId) {
          item.id = item.response.resultData.uniqueId;
          item.url = this.getFileAccessHttpUrl(
            item.response.resultData.uniqueId,
            this.previewBaseUrl
          );
        } else {
          item.status = item.status || 'error';
        }
        item.mediaType = item.mediaType || item.type;
        const uniqueIdDefined = file?.response?.resultData?.uniqueId !== undefined;
        const itemIdDefined = item.id !== undefined && item.id !== null;
        if ((!uniqueIdDefined || !itemIdDefined) && item.status === 'done') {
          item.status = 'error';
          item.response = file?.response?.errorMessage || '上传错误';
        }

        return item;
      });
      this.loading = this.fileList.some(i => i.status === 'uploading');
      this.handlePathChange();
    },
    // 回传父组件
    handlePathChange() {
      if (this.fileList.some(i => i.status === 'uploading')) {
        return;
      }
      const value = [];
      for (let i = 0; i < this.fileList.length; i++) {
        const item = { ...this.fileList[i] };
        item.mediaType = item.mediaType || item.type;
        value.push({
          type: item.mediaType || item.type,
          mediaType: item.mediaType || item.type,
          url: item.status === 'error' ? undefined : item.url,
          thumbUrl: item?.thumbUrl,
          id: item.status === 'error' ? undefined : item.id,
          status: item.status,
          response: item.status === 'error' ? item.response : null
        });
      }
      this.$emit('change', value.length ? value : undefined);
    },

    // 删除
    handleDelete() {},

    async handlePreview(file) {
      if (file.url) {
        this.previewFile = {
          mediaType: file.mediaType || file.type,
          src: file.url
        };
        this.previewVisible = true;
      }
    },
    handlePreiewFile(file) {
      return new Promise(resolve => {
        if ((file.mediaType || file.type).startsWith('video')) {
          const url = window.URL.createObjectURL(file);
          this.getVideoBase64(url).then(src => {
            window.URL.revokeObjectURL(url);
            resolve(src);
          });
        } else {
          resolve(file.url);
        }
      });
    },
    /**
     * 获取视频封面
     * @param url
     * @returns {Promise<dataURL>}
     */
    getVideoBase64(url) {
      return new Promise(resolve => {
        let dataURL = '';
        const video = document.createElement('video');
        const play = new Image();

        // 处理跨域
        video.setAttribute('crossOrigin', 'anonymous');
        video.setAttribute('src', url);
        video.setAttribute('width', 100);
        video.setAttribute('height', 100);
        video.setAttribute('autoplay', 'autoplay');
        video.pause();
        video.addEventListener('loadeddata', () => {
          // 视频时长video.duration;
          let canvas = document.createElement('canvas');
          // canvas的尺寸和图片一样
          let width = video.width;
          let height = video.height;

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          // 绘制canvas
          ctx.drawImage(video, 0, 0, width, height);
          // 绘制播放图标到封面上
          ctx.drawImage(play, width / 2 - 10, height / 2 - 10, 20, 20);
          // 转换为base64
          dataURL = canvas.toDataURL('image/jpeg');
          resolve(dataURL);
        });
      });
    }
  }
};
</script>

<style lang="less" scoped>
[data-wpg-theme='dark'] {
  .wpg-upload-item {
    background-color: #0e1116;
  }
}

[data-wpg-theme='knight-dark'],
[data-wpg-theme='foggy-dark'],
[data-wpg-theme='light'] {
  .wpg-upload-item {
    background-color: #f2f6fc;
  }
}

.vc-image-upload {
  width: 100%;
  display: flex;
  flex-direction: column;

  /deep/ .wpg-upload-picture-card-wrapper {
    .wpg-upload {
      &-select {
        width: 100px;
        height: 100px;
        margin: 0;
        border: 1px dashed #d6d6d6;
      }

      .anticon {
        font-size: 18px;
      }

      &-text {
        font-size: 12px;
      }

      &-list {
        // display: flex;

        &-picture-card-container {
          width: 100px;
          height: 100px;
        }

        &-item {
          width: 100px;
          height: 100px;
          margin: 0;
          padding: 10px;
          border: 1px solid transparent;

          &-error {
            border-color: #f5222d;
          }
        }
      }
    }
  }

  .info {
    font-size: 12px;
    line-height: 16px;
  }
}
</style>
