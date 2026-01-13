<template>
  <w-modal
    class="add-model"
    destroyOnClose
    :visible="visible"
    :title="title"
    :footer="null"
    :maskClosable="false"
    @cancel="handleCancel"
  >
    <w-info-form
      :fields="modelFields"
      :model="AddForm"
      :layout="layout"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <template #plantId="{ form }">
        <factory-select v-model="form.plantId"></factory-select>
      </template>
      <template #fileList>
        <w-col :span="24">
          <w-form-model-item label="" prop="file">
            <div v-show="file.length > 0" class="customize-file-list">
              <div v-for="(list, index) in file" :key="index" class="customize-file">
                <img
                  v-if="list.name && (list.name.includes('excel') || list.name.includes('xls'))"
                  class="pre-icon"
                  src="../../../assets/images/default/icons/ic_file_excel@2x.png"
                  alt
                />
                <img
                  v-else-if="list.name && list.name.includes('pdf')"
                  class="pre-icon"
                  src="../../../assets/images/default/icons/ic_file_pdf@2x.png"
                  alt
                />
                <img
                  v-else-if="
                    list.name &&
                      (list.name.includes('png') ||
                        list.name.includes('jpg') ||
                        list.name.includes('webp') ||
                        list.name.includes('gif'))
                  "
                  class="pre-icon"
                  src="../../../assets/images/default/icons/ic_file_pic@2x.png"
                  alt
                />
                <img
                  v-else-if="list.name && list.name.includes('doc')"
                  class="pre-icon"
                  src="../../../assets/images/default/icons/ic_file_word@2x.png"
                  alt
                />
                <img
                  v-else
                  class="pre-icon"
                  src="../../../assets/images/default/icons/ic_file_other@2x.png"
                  alt
                />
                <span class="file-text">{{ list.name }}</span>
                <span v-if="list.status === 'uploading'" class="after-text">
                  <w-progress
                    style="width:170px;margin-right:20px"
                    :percent="Math.floor(list.percent)"
                  />
                  <w-icon class="file-delete" type="ic_delete" @click="deleteFile(index)" />
                </span>
                <span v-else class="after-text">
                  <w-icon type="ic_check" style="color:green;margin-left:6px" />
                  <span class="file-status">上传成功</span>
                  <w-icon class="file-delete" type="ic_delete" @click="deleteFile(index)" />
                </span>
              </div>
            </div>
            <w-upload-dragger
              v-show="uploadAble"
              :headers="headers"
              :file-list="file"
              :action="uploadAction"
              :show-upload-list="false"
              :before-upload="beforeUpload"
              :disabled="status === 'uploading'"
              @change="handleChange"
            >
              <div class="upload-style">
                <i class="icon-ic_cloud_upload"></i> 上传文件，请
                <span>点击上传</span>
              </div>
            </w-upload-dragger>
            <span v-if="fileTip" class="file-tip">请至少选择1个文件上传!</span>
            <!--
            <div v-else class="upload-area" @click="preUpload">
                <div class="upload-style">
                <i class="icon-ic_cloud_upload"></i> 上传文件，请
                <span>点击上传</span>
              </div>
            </div>-->
          </w-form-model-item>
        </w-col>
      </template>
    </w-info-form>
  </w-modal>
</template>

<script>
import { Base64 } from 'js-base64';
import storage from '@/utils/storage';
import { USER_INFO } from '@/store/mutation-types';
import { batchAdd, batchEdit } from '@/api/fileManagement';
import serverConfig from '@/config/server.config';
import FactorySelect from '@/components/factory-select/index';
export default {
  components: { FactorySelect },
  props: {
    title: {
      type: String,
      default: ''
    },
    AddForm: {
      type: Object,
      default: () => {}
    },
    modelType: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    uploadAble() {
      if (this.modelType === 'add') {
        return true;
      } else if (this.modelType === 'edit' && this.file.length === 0) {
        return true;
      } else {
        return false;
      }
    }
  },
  data() {
    return {
      layout: { span: 24, labelCol: { span: 5 }, wrapperCol: { span: 19 }, colon: true },
      loading: false, //确定按钮时显示等待
      file: [],
      fileTip: false,
      status: '', // 上传的状态
      uploadAction: `${serverConfig.PUBLIC_API_BASE_URL}/userCenterApi/FileManager/fileUploadNew`,
      headers: {},
      show: true,
      modelFields: [
        {
          submit: true,
          required: true,
          colon: true,
          name: 'plantId',
          label: '污水厂名称',
          type: 'input'
        },
        {
          submit: true,
          required: true,
          colon: true,
          name: 'fileTime',
          label: '文件日期',
          type: 'datePicker',
          format: 'YYYY-MM-DD',
          placeholder: '请输入文件日期'
        },
        {
          submit: true,
          name: 'fileList',
          label: '上传文件',
          type: 'input',
          placeholder: ''
        }
      ]
    };
  },
  watch: {
    async visible(val) {
      if (val) {
        this.file = [];
        if (this.AddForm.fileId) {
          this.AddForm.fileTime = this.$moment(this.AddForm.fileTime);
          this.file.push({
            name: this.AddForm.fileOriginName + '.' + this.AddForm.fileFormat,
            uid: this.AddForm.fileId,
            status: 'done'
          });
        }
      }
    }
  },
  methods: {
    async handleSubmit() {
      if (this.file.length === 0) {
        this.fileTip = true;
        return false;
      }
      const userInfo = JSON.parse(Base64.decode(storage.get(USER_INFO)));
      this.loading = true;
      if (this.modelType === 'add') {
        let data = [];
        this.file.forEach(item => {
          let obj = {};
          obj.fileId = item.response.resultData.uniqueId;
          obj.fileOriginName = item.name.split('.')[0];
          obj.fileUrl = item.response.resultData.fileUrl;
          obj.plantId = this.AddForm.plantId;
          obj.profileType = 1;
          obj.projectPhase = this.AddForm.projectPhase;
          obj.fileFormat = item.name.split('.')[1];
          obj.fileTime = this.$moment(this.AddForm.fileTime).format('YYYY-MM-DD');
          obj.createTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
          obj.createUser = userInfo.userName;
          data.push(obj);
        });
        try {
          let res = await batchAdd(data);
          this.$message.success('新增成功');
          this.loading = false;
          this.$emit('update:visible', false);
          // 调用父组件方法
          this.$parent.handleSearch();
        } catch {
          this.loading = false;
        }
      } else {
        let data = this.AddForm;
        if (this.file[0].lastModified) {
          // 重新上传文件
          data = this.AddForm;
          data.fileFormat = this.file[0].name.split('.')[1];
          data.fileId = this.file[0].response.resultData.uniqueId;
          data.fileOriginName = this.file[0].name.split('.')[0];
          data.fileUrl = this.file[0].response.resultData.fileUrl;
        }
        data.fileTime = this.$moment(this.AddForm.fileTime).format('YYYY-MM-DD');
        try {
          let res = await batchEdit(data);
          this.$message.success('修改成功');
          this.loading = false;
          this.$emit('update:visible', false);
          // 调用父组件方法
          this.$parent.handleSearch();
        } catch {
          this.loading = false;
        }
      }
    },
    preUpload() {
      this.$message.error('编辑时,只能上传一个文件');
    },
    handleCancel() {
      this.loading = false;
      this.$emit('update:visible', false);
    },
    handleChange(info) {
      const status = info.file.status;
      this.status = status;
      this.file = [...info.fileList.filter(item => item.status)];
      if (status === 'done') {
        if (info.file.response.status === 'complete') {
          this.$message.success(`${info.file.name} 上传成功`);
        } else {
          this.deleteFile(this.file.length - 1);
          this.$message.error(`${info.file.response.errorMessage}`);
        }
      } else if (status === 'error') {
        this.$message.error(`${info.file.name} 上传失败`);
      }
    },
    deleteFile(index) {
      this.$confirm({
        title: '确定要删除该文件吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.file.splice(index, 1);
          this.status = 'done';
        },
        onCancel: () => {}
      });
    },
    beforeUpload(file) {
      const arr = file.name.split('.');
      const len = arr.length;
      const isJfif = arr[len - 1] !== 'jfif';
      if (!isJfif) {
        this.$message.error('不能上传jfif格式的文件!');
      }
      const isLt2M = file.size / 1024 / 1024 <= 200;
      if (!isLt2M) {
        this.$message.error('上传的文件不能大于200M!');
      }
      return isLt2M && isJfif;
    }
  }
};
</script>
<style lang="less" scoped>
.add-model {
  /deep/ .wpg-modal {
    width: 800px !important;
    top: 240px !important;
  }
  /deep/.wpg-select-tree li .wpg-select-tree-node-content-wrapper-unselectable {
    color: #999;
  }
}
.upload-style {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 40px;
  i {
    font-size: 24px;
    color: #4285f4;
    margin-right: 6px;
  }
  span {
    color: #4285f4;
    margin-left: 4px;
  }
}
.file-list {
  width: 100%;
  li {
    font-size: 14px;
    margin-top: 8px;
    height: 22px;
    line-height: 22px;
    position: relative;
    padding: 0 12px 0 4px;
    a {
      color: rgba(0, 0, 0, 0.65);
    }
    .file-lef {
      margin-right: 8px;
      color: rgba(0, 0, 0, 0.45);
    }

    .file-delete {
      display: none;
      float: right;
      color: rgba(0, 0, 0, 0.45);
    }
  }
  li:hover {
    background-color: #e6f7ff;
    .file-delete {
      display: block;
    }
  }
}
.customize-file-list {
  border: 1px solid #d6d6d6;
  border-radius: 4px;
  max-height: 150px;
  padding: 0 12px;
  margin-bottom: 16px;
  overflow: auto;
  .customize-file {
    display: flex;
  }

  .file-text {
    margin: 0 4px;
    // width: calc(100% - 260px);
  }
  .pre-icon {
    width: 24px;
    height: 24px;
    margin-top: 7px;
    margin-left: 10px;
  }
  .after-text {
    span {
      margin: 0 8px;
    }
  }
}
.upload-area {
  cursor: pointer;
  border: 1px dashed #e9e9e9;
  border-radius: 4px;
  //background:  #e9e9e9;
  .upload-style {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 40px;
    i {
      font-size: 24px;
      color: #4285f4;
      margin-right: 6px;
    }
    span {
      color: #4285f4;
      margin-left: 4px;
    }
  }
}
.upload-area:hover {
  border: 1px dashed #659bf6;
}
.file-tip {
  color: #f64357;
  font-size: 12px;
}
</style>
