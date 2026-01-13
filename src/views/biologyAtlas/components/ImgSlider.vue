<template>
  <div class="img-slider">
    <w-button
      class="control-btn prev"
      :disabled="false"
      icon="double-left"
      @click="prev"
    ></w-button>
    <div class="img-list" ref="imgList">
      <div
        class="img-box"
        v-for="(img, index) in displayList"
        :key="img.id"
        :class="index === imgIndex ? 'checkedColor' : ''"
        @click="checkedObj(img,index)"
      >
        <Preview
          class="preview-img"
          :url="img.url"
          :canEdit="!pumpCheckStatus && editPermission"
          @remove="remove(img.id, img.bizLevel)"
        />
        <div class="img-bottom">
          <span>种类：{{ img.kindCount }}</span>
          <span>数量：{{ img.quantity }}</span>
        </div>
      </div>
    </div>
    <w-button
      class="control-btn next"
      :disabled="false"
      icon="double-right"
      @click="next"
    ></w-button>
  </div>
</template>

<script>
import { assetsRemoveFile, assetsUploadFile, imgApi } from '@/api/manage';
import Preview from './Preview.vue';
import Vue from 'vue';
import serverConfig from '@/config/server.config';

const WIDTH = 174;

const bizLevelList = {
  tank: 'tank_files/tank/'
};

export default Vue.extend({
  name: 'ImgSlider',
  components: {
    Preview
  },
  props: {
    imgList: {
      type: Array,
      default: () => []
    },
    id: {
      type: [Number, String],
      default: 0
    },
    tab: {
      type: String,
      default: '0'
    },
    pumpId: {
      type: String
    },
    pumpCheckStatus: {
      // 是否审核
      type: Number,
      default: 0
    },
    editPermission: {
      // 是否有编辑权限
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      list: [],
      uploading: false,
      index: 0,
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      acceptList: ['.png', '.jpg', '.jpeg', '.bmp', '.gif'],
 imgIndex:0
    };
  },
  computed: {
    displayList() {
      return this.list.map(item => ({
        ...item,
        url: this.getFileAccessUrl(item.fileId, this.previewBaseUrl)
      }));
    }
  },
  watch: {
    imgList() {
      this.list = this.imgList;
    },
    index() {
      this.$refs.imgList.scrollLeft = WIDTH * this.index;
    }
  },
  methods: {
    next() {
      this.index += 1;
      this.$nextTick(() => {
        if (this.$refs.imgList.scrollLeft < (this.index - 1) * WIDTH) {
          this.index -= 1;
        }
      });
    },
    prev() {
      this.index -= 1;
      if (this.index < 0) this.index = 0;
    },
    remove(id, bizLevel) {
      assetsRemoveFile(id, bizLevel).then(res => {
        if (res.status === 'complete') {
          this.$message.success('删除成功');
          this.$emit('needUpdate');
        } else {
          this.$message.error('删除失败' + res.errorMessage);
        }
      });
    },
    getFileAccessUrl(uniqueId, previewBaseUrl, subStr = serverConfig.PUBLIC_API_BASE_URL) {
      if (uniqueId?.startsWith(subStr) || uniqueId?.startsWith('http')) {
        return uniqueId;
      } else {
        return previewBaseUrl + uniqueId;
      }
    },
    upload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) {
        this.$message.info('上传图片大小不能超过20M！');
        return;
      }
      const filename = file.name;
      const filtType = filename.substring(filename.lastIndexOf('.'));
      if (!this.acceptList.includes(filtType)) {
        this.$message.info(`只能上传${this.acceptList.join(',')}格式的图片`);
        return;
      }
      const formData = new FormData();
      formData.append('file', file);
      formData.append('bizId', this.pumpId);
      formData.append('bizLevel', bizLevelList[this.tab] + this.id);
      formData.append('bizType', 0);
      formData.append('recordLog', true);
      this.uploading = true;
      assetsUploadFile(formData).then(res => {
        if (res.status === 'complete') {
          this.uploading = false;
          event.target.value = '';
          this.$message.success('上传成功');
          this.$emit('needUpdate');
        } else {
          event.target.value = '';
          this.uploading = false;
          this.$message.error('上传失败' + res.errorMessage);
        }
      });
    },
    checkedObj(row,index){
      this.imgIndex=index;
      this.$emit('checkedImg',row)
    }
  },
  mounted() {
    this.list = this.imgList;
  }
});
</script>

<style lang="less" scoped>
.img-slider {
  display: flex;
  position: relative;
  align-items: stretch;
  width: 100%;
  // border: 1px solid #dce0df;
  border: 1px solid var(--supply-color-border-split);
  margin-top: 10px;
  .img-list {
    height: 150px;
    min-height: 112px;
    flex: 1;
    display: flex;
    flex-flow: nowrap;
    justify-content: flex-start;
    // align-items: center;
    overflow-x: hidden;
    .img-box {
      width: 150px;
      margin: 12px 10px 0 10px;
           cursor: pointer;
      // height: 120px;
    }
    .checkedColor{
      border: 1px solid var(--supply-color-online-border);
      overflow: hidden;

    }
    .preview-img {
      flex: none;
      width: 150px;
      height: 100px;
      margin-bottom: 10px;
    }
    .img-bottom {
      width: 150px;
      height: 20px;
      display: flex;
      align-items: center;
      justify-content: space-around;
    }
  }
  .control-btn {
    height: auto;
    width: 24px;

    border: none;
    // background: #f7fafa;
    background: var(--supply-color-bg-card-light);
    border-radius: 0px;
    overflow-x: hidden;
    flex: none;
    &.prev {
      // border-right: 1px solid #dce0df;t
      border-right: 1px solid var(--supply-color-border-split);
    }
    &.next {
      // border-left: 1px solid #dce0df;
      border-left: 1px solid var(--supply-color-border-split);
    }
  }
}
</style>
