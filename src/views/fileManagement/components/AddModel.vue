<!-- 文件管理 - 添加/编辑弹窗组件 -->
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
    <!-- 表单区域 -->
    <w-info-form
      :fields="modelFields"
      :model="AddForm"
      :layout="layout"
      :loading="loading"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <!-- 水厂选择 -->
      <template #plantId="{ form }">
        <factory-select v-model="form.plantId"></factory-select>
      </template>
      <!-- 是否默认文件 -->
      <template #defaultFile="{ form }">
        <w-radio-group v-model="form.defaultFile">
          <w-radio :value="1">是</w-radio>
          <w-radio :value="0">否</w-radio>
        </w-radio-group>
      </template>
      <!-- 文件上传 -->
      <template #fileList>
        <w-col :span="24">
          <w-form-model-item label="" prop="file">
            <!-- 文件列表展示 -->
            <div v-show="file.length > 0" class="customize-file-list">
              <div v-for="(list, index) in file" :key="index" class="customize-file">
                <!-- 文件图标 -->
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
                <!-- 文件名 -->
                <span class="file-text">{{ list.name }}</span>
                <!-- 上传状态 -->
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
            <!-- 文件上传区域 -->
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
            <!-- 文件上传提示 -->
            <span v-if="fileTip" class="file-tip">请至少选择1个文件上传!</span>
          </w-form-model-item>
        </w-col>
      </template>
    </w-info-form>
  </w-modal>
</template>

<script>
// 导入相关依赖
import { Base64 } from 'js-base64';
import storage from '@/utils/storage';
import { USER_INFO } from '@/store/mutation-types';
import { batchAdd, batchEdit } from '@/api/fileManagement';
import serverConfig from '@/config/server.config';
import FactorySelect from '@/components/factory-select/index';

export default {
  components: { FactorySelect },
  props: {
    // 弹窗标题
    title: {
      type: String,
      default: ''
    },
    // 表单数据
    AddForm: {
      type: Object,
      default: () => {}
    },
    // 阶段选项
    steps: {
      type: Array,
      default: () => []
    },
    // 弹窗类型：add/edit
    modelType: {
      type: String,
      default: 'add'
    },
    // 是否显示弹窗
    visible: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    // 是否允许上传
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
      // 表单布局
      layout: { span: 24, labelCol: { span: 5 }, wrapperCol: { span: 19 }, colon: true },
      loading: false, // 提交按钮加载状态
      file: [], // 文件列表
      fileTip: false, // 文件上传提示
      status: '', // 上传状态
      uploadAction: `${serverConfig.PUBLIC_API_BASE_URL}/userCenterApi/FileManager/fileUploadNew`, // 上传地址
      headers: {}, // 上传请求头
      show: true,
      // 表单字段配置
      modelFields: [
        {
          submit: true,
          required: true,
          colon: true,
          name: 'plantId',
          label: '水厂名称',
          type: 'input'
        },
        {
          submit: true,
          required: true,
          colon: true,
          name: 'projectPhase',
          label: '所属阶段',
          attrs: { 'allow-clear': true },
          options: [],
          type: 'select'
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
        },
        {
          submit: true,
          name: 'remark',
          label: '文档描述',
          type: 'input',
          placeholder: ''
        },
        {
          submit: true,
          name: 'defaultFile',
          label: '是否默认',
          type: 'input',
          placeholder: ''
        }
      ]
    };
  },
  watch: {
    // 监听弹窗显示状态
    async visible(val) {
      if (val) {
        // 初始化阶段选项
        this.modelFields[1].options = this.steps.map(item => ({
          value: item.dictValue,
          label: item.dictName
        }));
        this.file = [];
        // 编辑模式下初始化文件
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
    // 提交表单
    async handleSubmit() {
      if (this.file.length === 0) {
        this.fileTip = true;
        return false;
      }
      const userInfo = JSON.parse(Base64.decode(storage.get(USER_INFO)));
      this.loading = true;
      // 新增模式
      if (this.modelType === 'add') {
        let data = [];
        this.file.forEach(item => {
          let obj = {};
          obj.fileId = item.response.resultData.uniqueId;
          obj.fileOriginName = item.name.split('.')[0];
          obj.fileUrl = item.response.resultData.fileUrl;
          obj.plantId = this.AddForm.plantId;
          obj.remark = this.AddForm.remark;
          obj.defaultFile = this.AddForm.defaultFile;
          obj.projectPhase = this.AddForm.projectPhase;
          obj.fileFormat = item.name.split('.')[1];
          obj.fileTime = this.$moment(this.AddForm.fileTime).format('YYYY-MM-DD');
          obj.createTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
          obj.createUser = userInfo.userName;
          data.push(obj);
        });
        try {
          await batchAdd(data);
          this.$message.success('新增成功');
          this.loading = false;
          this.$emit('update:visible', false);
          // 调用父组件刷新方法
          this.$parent.handleSearch();
        } catch {
          this.loading = false;
        }
      } else {
        // 编辑模式
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
          await batchEdit(data);
          this.$message.success('修改成功');
          this.loading = false;
          this.$emit('update:visible', false);
          // 调用父组件刷新方法
          this.$parent.handleSearch();
        } catch {
          this.loading = false;
        }
      }
    },
    // 取消操作
    handleCancel() {
      this.loading = false;
      this.$emit('update:visible', false);
    },
    // 文件上传状态变化
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
    // 删除文件
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
    // 文件上传前校验
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
/* 样式部分 */
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
.customize-file-list {
  border: 1px solid #d6d6d6;
  border-radius: 4px;
  max-height: 150px;
  padding: 0 12px;
  margin-bottom: 16px;
  overflow: auto;
  .customize-file {
    display: flex;
    .file-text {
      margin: 0 4px;
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
}
.file-tip {
  color: #f64357;
  font-size: 12px;
}
</style>
