<template>
  <div class="file-list">
      <Preview
        v-for="file in displayList"
        :key="file.id"
        class="preview"
        type="file"
        :url="file.url"
        :suffix="file.suffix"
        :name="file.oldName"
         :canEdit="isEdit"
        @remove="remove(file.id, file.bizLevel)"
      />
    <Upload v-if="isEdit" :acceptList="acceptList" :loading="uploading" @change="upload">
      点击上传文件
    </Upload>
    <!-- <w-empty v-if="!editPermission && !fileList.length"></w-empty> -->
  </div>
</template>

<script>
import { assetsUploadFile, assetsRemoveFile } from "@/api/manage"
import Upload from "./Upload.vue";
import Preview from "./Preview.vue";
import serverConfig from '@/config/server.config';
export default {
  name: 'FileList',
  components: {
    Upload,
    Preview
  },
  props: {
    fileList: {
      type: Array,
      default: () => []
    },
    fileCode: {
      type: String,
      default: ''
    },
    isEdit: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      // action: `${serverConfig.API_BASE_URL}/fileManage/uploadWithBiz`,
      files: [],
      uploading: false,
      acceptList: ['.doc', '.docx', '.wps', '.xls', '.xlsx', '.ppt', '.pptx', '.txt', '.pdf', '.zip', '.rar', '.dwg']
    };
  },
  computed: {
    displayList() {
      return this.fileList.map(item => ({
        ...item,
        url: `${serverConfig.IMG_BASE_URL}${item.url}`
      }));
    }
  },
  methods: {
    remove(id, bizLevel) {
      assetsRemoveFile(id, bizLevel).then(res => {
        if (res.status === 'complete') {
          this.$message.success('删除成功');
          this.$emit('deleteFile', id, this.fileCode);
        } else {
          this.$message.error('删除失败' + res.errorMessage);
        }
      });
    },
    upload(event) {
      const file = event.target.files[0];
      if (!file) return;
      if (file.size > 20 * 1024 * 1024) {
        this.$message.info('上传文件大小不能超过20M！');
        return;
      }
      const filename = file.name;
      const filtType = filename.substring(filename.lastIndexOf('.'));
      if (!this.acceptList.includes(filtType)) {
        this.$message.info(`只能上传${this.acceptList.join(',')}格式的文件`);
        return;
      }
      let formData = new FormData();
      let time = new Date().getTime();
      formData.append('file', file);
      formData.append('bizId', time);
      formData.append('bizLevel', time);
      formData.append('bizType', 0);
      this.uploading = true;
      assetsUploadFile(formData).then(res => {
        if (res.status === "complete") {
          this.files = [];
          this.uploading = false;
          event.target.value = '';
          this.$message.success('上传成功');
          this.$emit('uploadFile', {
            id: res.resultData.id,
            bizLevel: res.resultData.bizLevel,
            bizId: res.resultData.bizId,
            name: res.resultData.oldName,
            oldName: res.resultData.oldName,
            url: res.resultData.url,
          },this.fileCode);
        } else {
          this.uploading = false;
          event.target.value = '';
          this.$message.error('上传失败'+res.errorMessage);
        }
      })
    },
  }
};
</script>

<style lang="less" scoped>
.file-list {
  padding: 12px 0;
  display: flex;
  align-items: center;
  flex-flow: wrap;
  .preview {
    width: 120px;
    height: 120px;
  }
}
</style>
