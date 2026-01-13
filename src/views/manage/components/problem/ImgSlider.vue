<template>
  <div class="img-slider">
    <w-button
      class="control-btn prev"
      :disabled="false"
      icon="double-left"
      @click="prev"
    ></w-button>
    <div class="img-list" ref="imgList">
      <Preview
        :suffix="img.suffix"
        :key="img.id"
        class="preview-img"
        v-for="(img, index) in displayList"
        :url="img.url"
        :canEdit="!pumpCheckStatus && editPermission"
        @remove="remove(img.id, img.bizLevel)"
      />
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
import { assetsRemoveFile, assetsUploadFile } from '@/api/manage';
import Preview from './Preview.vue';
import Vue from 'vue';
import serverConfig from '@/config/server.config';

const WIDTH = 226;

const bizLevelList = {
  project: 'pump_files/community/',
  pumpHouse: 'pump_files/pump/',
  device: 'pump_files/device/',
  pumpHouseTank: 'pump_files/tank_file/',
  other: 'pump_files/other_device_file/'
};

export default Vue.extend({
  name: 'ImgSlider',
  components: {
    Preview
    // Upload
  },
  props: {
    imgList: {
      type: Array,
      default: () => []
    },
    id: {
      type: Number | String
    },
    tab: {
      type: String
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
      acceptList: ['.png', '.jpg', '.jpeg', '.bmp', '.gif']
    };
  },
  computed: {
    displayList() {
      return this.list.map(item => ({
        ...item,
        url: `${serverConfig.IMG_BASE_URL}${item.url}`
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
  height: 100%;
  align-items: stretch;
  width: 100%;
  border: 1px solid var(--supply-color-border-split);
  .img-list {
    min-height: 144px;
    flex: 1;
    display: flex;
    flex-flow: nowrap;
    justify-content: flex-start;
    align-items: center;
    overflow-x: hidden;

    .preview-img {
      flex: none;
      margin: 12px;
      width: 202px;
      height: 120px;
    }
  }
  .control-btn {
    height: auto;
    width: 24px;
    border: none;
    background: var(--supply-color-bg-card-light);
    border-radius: 0px;
    overflow-x: hidden;
    flex: none;
    &.prev {
      border-right: 1px solid var(--supply-color-border-split);
    }
    &.next {
      border-left: 1px solid var(--supply-color-border-split);
    }
  }
}
</style>
