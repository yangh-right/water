<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-10-11 08:55:49
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-07-04 17:22:27
 * @Description:
-->
<template>
  <div class="clearfix">
    <w-upload
      :headers="headers"
      v-bind="$attrs"
      :multiple="multiple"
      :name="fileParam"
      :file-list="fileList"
      :disabled="disabled"
      :showUploadList="false"
      :action="action || uploaderAction"
      v-on="$listeners"
      @change="handleChange"
      :before-upload="beforeUpload"
    >
      <w-button :disabled="disabled" icon="upload"> 点击上传 </w-button>
    </w-upload>
    <div class="file-list-wrapper">
      <component
        :fileList="previewList"
        :disabled="disabled"
        :showName="showName"
        :is="fileListComponent"
        @removeFile="removeFile"
        @downloadFile="downloadFile"
      ></component>
    </div>
  </div>
</template>
<script>
import { exportUrlFile } from '@/utils/util.js';
import nameList from './fileList/nameList';
import cardList from './fileList/cardList';
import videoList from './fileList/videoList';
import serverConfig from '@/config/server.config';
import { accessToken } from '@wpg/framework-vue';
export default {
  name: 'UploadFile',
  components: {
    nameList,
    videoList,
    cardList
  },
  props: {
    multiple: {
      type: Boolean,
      default: false
    },
    limit: {
      type: Number,
      default: 1
    },
    fileParam: {
      type: String,
      default: 'file'
    },
    isUpload: {
      type: Boolean,
      default: true
    },
    disabled: {
      type: Boolean,
      default: false
    },
    showName: {
      type: Boolean,
      default: true
    },
    fileListComponent: {
      type: Function | String,
      default: 'cardList'
    },
    action: {
      type: String,
      default: ''
    },
    //{
    // uid: item,
    //  id: item,
    //  name: this.form.imageName[index],
    //  status: 'done',
    //  url: item,
    //}
    value: {
      default: () => []
    }
  },
  data() {
    return {
      uploaderAction: `${serverConfig.API_BASE_URL}/fileManage/uploadWithBiz?bizId=1&bizLevel=1&bizType=0`,
      headers: {},
      fileList: []
    };
  },
  computed: {
    previewList() {
      return this.fileList?.map(item => {
        return {
          uid: item.uid,
          name: item.name,
          url: item.url
        };
      });
    }
  },
  watch: {
    value: {
      handler(val) {
        this.fileList = [...(val?.filter(item => item) || [])];
        this.fileList?.forEach(item => {
          item.status = 'done';
        });
      },
      immediate: true
    }
  },
  created() {
    const token = `Bearer ${accessToken.get()}`;
    this.headers = { Authorization: token };
  },
  methods: {
    downloadFile(file) {
      exportUrlFile(file.url, file.name);
      // let fileName = file.name;
      // import('file-saver').then(FileSaver => {
      //   FileSaver.saveAs(file.url, fileName);
      // });
    },
    beforeUpload(file) {
      this.fileList = [...this.fileList, file];
      if (!this.multiple) {
        this.fileList = this.fileList.slice(-1);
      }
      if (this.isUpload) {
        return true;
      } else {
        return false;
      }
    },
    removeFile(file) {
      this.fileList = this.fileList.filter(item => item.uid !== file.uid);
      this.$emit('change', [...this.fileList]);
      this.$emit('input', [...this.fileList]);
    },
    handleChange(info) {
      if (this.fileList.every(item => item.status === 'done')) {
        let fileList = [...info.fileList];
        if (this.limit && fileList.length > this.limit) {
          fileList = fileList.slice(0, this.limit);
          this.$message.error('文件上传数不能超过' + this.limit);
        }
        let fileResList = [];
        fileResList = fileList.filter(item => item);
        fileResList.forEach(file => {
          if (!file.url && file?.response?.resultData?.url) {
            file.url = this.imageFullUrl(file.response.resultData.url);
          }
        });
        this.fileList = [...fileResList];
        this.$emit('change', fileResList);
        this.$emit('input', fileResList);
      }
    },
    imageFullUrl(url) {
      return /^water-purification/.test(url) ? serverConfig.IMG_HOST_URL + url : url;
    }
  }
};
</script>
<style lang="less" scoped>
.file-list-wrapper {
  margin-top: 4px;
  width: 100%;
  .file__item {
    padding: 0 6px;
    width: 100%;
    height: 21px;
    display: flex;
    align-items: center;
    .paper-clip {
      font-size: 14px;
      margin-right: 6px;
    }
    .file-name {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      color: var(--supply-color-primary-DEFAULT);
      text-overflow: ellipsis;
      height: 21px;
      .name {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        display: inline-block;
        position: relative;
        top: -12px;
        cursor: pointer;
      }
    }
    .file-delete {
      font-size: 14px;
      display: none;
    }
    &:hover {
      background-color: var(--supply-color-bg-card-dark);
      .file-delete {
        display: block;
      }
    }
  }
}
</style>
