<template>
  <w-modal
    v-modalDrag
    :visible="visible"
    :maskClosable="false"
    :title="title"
    :footer="null"
    centered
    :width="width"
    @cancel="handleCancel"
  >
    <w-info-form
      ref="ruleForm"
      :fields="fields"
      :model="addForm"
      :type="type"
      :layout="layout"
      :loading="loading"
      :footer="getFooter"
      @submit="handleSubmit"
      @cancel="handleCancel"
    >
      <template #waterPlantId>
        <factory-select
          class="factory-select"
          v-model="addForm.waterPlantId"
          autoSelect
          :showAll="false"
        ></factory-select>
      </template>
      <template #pictureIds>
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
              v-if="uploadAble"
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
          </w-form-model-item>
        </w-col>
      </template>
    </w-info-form>
  </w-modal>
</template>

<script>
import FactorySelect from '@/components/factory-select/index';
import serverConfig from '@/config/server.config';

export default {
  name: 'AddModal',
  components: {
    FactorySelect
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    width: {
      type: [String, Number],
      default: '560'
    },
    form: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: 'submit'
    },
    modelType: {
      type: String,
      default: 'add'
    }
  },
  data() {
    return {
      visible: false,
      layout: { span: 24, labelCol: { span: 5 }, wrapperCol: { span: 19 }, colon: true },
      loading: false,
      addForm: {},
      orgName: '',
      accept: ['.pdf', '.png', '.jpg', '.jpeg'].join(','),
      file: [],
      headers: {},
      uploadAction: `${serverConfig.PUBLIC_API_BASE_URL}/userCenterApi/FileManager/fileUploadNew`,
      status: '', // 上传的状态
      fileTip: false,
      fields: [
        {
          label: '选择污水厂：',
          name: 'waterPlantId',
          type: 'select',
          colon: true,
          required: true
        },
        {
          submit: true,
          info: true,
          colon: true,
          required: true,
          name: 'orgId',
          label: '选择组织',
          type: 'tree-select',
          attrs: {
            'tree-data': [],
            'dropdown-style': {
              maxHeight: '300px',
              overflow: 'auto'
            },
            replaceFields: {
              title: 'name',
              key: 'id',
              value: 'id'
            },
            'tree-default-expand-all': true
          },
          listeners: {
            select: this.getOrgUserLists
          }
        },
        {
          submit: true,
          required: true,
          info: true,
          colon: true,
          name: 'name',
          label: '用户列表',
          placeholder: '请选择用户',
          type: 'select',
          options: [],
          listeners: {
            change: this.getUserInfoList
          }
        },
        {
          name: 'account',
          type: 'input',
          label: '人员账号',
          disabled: true,
          colon: true,
          required: true
        },
        {
          name: 'role',
          type: 'input',
          label: '人员岗位',
          disabled: true,
          colon: true
        },
        {
          name: 'pictureIds',
          label: '人员资质',
          type: 'input',
          colon: true,
          rules: [{ required: true, message: '' }],
          attrs: {
            readonly: false
          }
        }
      ],
      userInfoList: []
    };
  },
  computed: {
    getFooter() {
      let type = this.modelType === 'check' ? null : {};
      return type;
    },
    uploadAble() {
      if (this.modelType === 'add') {
        return true;
      } else if (this.modelType === 'edit') {
        return true;
      } else {
        return false;
      }
    }
  },
  watch: {
    visible(val) {
      this.fields[1].options = [];
      this.fields[2].options = [];
      val && this.getTenantOrgTrees();
    },
    form: {
      handler(val) {
        this.addForm = { ...val };
        this.file = [];
        if (val?.fileIdAndNames) {
          this.file = val.fileIdAndNames.map(item => {
            return {
              id: item.fileId,
              status: 'done',
              uid: item.uid || new Date().getTime(),
              name: item.fileName,
              type: item.fileName.split('.')[1]
            };
          });
        }
      },
      deep: true,
      immediate: true
    },
    'addForm.orgId'(val, old) {
      // 改变组织，清除下方选中值
      let waterPlantId = this.addForm.waterPlantId;
      if (val && old && val !== old) {
        this.$refs.ruleForm.$_resetFields();
        this.addForm.orgId = val;
        this.addForm.waterPlantId = waterPlantId;
      }
    },
    modelType(val) {
      if (val === 'check') {
        this.fields[0].disabled = true;
        this.fields[1].disabled = true;
        this.fields[2].disabled = true;
        this.fields[5].attrs.readonly = true;
      } else if (val === 'edit') {
        this.fields[0].disabled = true;
        this.fields[1].disabled = true;
        this.fields[2].disabled = true;
        this.fields[5].attrs.readonly = false;
      } else {
        this.fields[0].disabled = false;
        this.fields[1].disabled = false;
        this.fields[2].disabled = false;
        this.fields[5].attrs.readonly = false;
      }
    }
  },
  mounted() {},
  methods: {
    // 获取租户组织树
    async getTenantOrgTrees() {
      let res = await this.$http.post('/EmployeeArchives/getTenantOrgTree', {
        keyword: '',
        activateFlag: [1]
      });
      const treeData = this.getTree(res.resultData);
      this.fields[1].attrs['tree-data'] = treeData;
    },
    // 递归处理 tree-data scopedSlots: null的报错,同时需要处理夫节点不可点击
    getTree(list) {
      list.map(item => {
        if (item.children?.length) {
          // 设置父节点不可点击
          // item.disabled = true;
          this.getTree(item.children);
        }
        delete item.scopedSlots;
        return item;
      });
      return list;
    },
    // 获取组织下用户列表
    async getOrgUserLists(id, e) {
      this.addForm.orgName = e.title;
      this.orgName = this.addForm.orgName;
      this.userInfoList = [];
      let res = await this.$http.post('/EmployeeArchives/getOrgUserList', {
        orgId: id,
        pageFlag: false
      });
      const options = res.resultData.map(item => {
        item.label = item.userName;
        item.value = item.userName;
        return item;
      });
      this.userInfoList = options;
      this.fields[2].options = options;
    },
    // 查询员工岗位信息
    async getUserInfoList(name, option) {
      let userId = option.data.props.userId;
      this.addForm.id = userId;
      this.addForm.account = '';
      this.userInfoList.forEach(user => {
        if (user.userId === userId) {
          this.addForm.account = user.loginName;
        }
      });
      // 查询人员岗位
      let { resultData } = await this.$http.post(
        '/EmployeeArchives/getUserPostList?orgId=' + this.addForm.orgId + '&userId=' + userId
      );
      let dictName = [];
      resultData?.forEach(item => {
        if (item?.dictName) {
          dictName.push(item?.dictName);
        }
      });
      // 角色
      this.addForm.role = dictName.join('/');
    },
    setVisible() {
      this.visible = true;
    },
    isArrayQulity(rule, value, callback) {
      let upUrlList = [];
      let oldList = [];
      value.forEach(item => {
        if (item.id) {
          upUrlList.push(item);
        } else {
          oldList.push(item);
        }
      });
      let qulity = true;
      if (oldList.length > 0) {
        if (upUrlList.length) {
          qulity = false;
        } else {
          qulity = true;
          let error = oldList.some(item => item?.status === 'error');
          if (error) {
            qulity = false;
          }
        }
      } else {
        if (upUrlList.length) {
          qulity = upUrlList.every(i => i.status === 'done');
        } else {
          qulity = false;
        }
      }
      if (qulity) {
        callback();
      } else {
        callback(new Error('资质上传错误，请检查'));
      }
    },
    // 新增人员档案
    handleSubmit() {
      let message = '';
      if (this.file.length === 0) {
        this.fileTip = true;
        return false;
      }
      if (this.modelType === 'add') {
        let pictureIds =
          this.file?.map(item => {
            let f = {};
            f.fileId = item.id;
            f.fileName = item.name;
            return f;
          }) || [];
        // if (!this.getPicUrl(pictureIds)) return false;
        this.loading = true;
        this.$http
          .post('/EmployeeArchives/addEmployeeArchives', {
            waterPlantId: this.addForm.waterPlantId,
            orgId: this.addForm.orgId,
            orgName: this.addForm.orgName,
            name: this.addForm.name,
            account: this.addForm.account,
            role: this.addForm.role,
            id: '',
            fileIdAndNames: pictureIds
          })
          .then(() => {
            message = '新增成功';
            // 调用父组件方法
            // this.$parent.handleReset(); // 重置查询
            this.$parent.getList(); // 重置查询
            this.$message.success(message);
            this.loading = false;
            this.visible = false;
          })
          .catch(() => {
            this.loading = false;
          });
      } else if (this.modelType === 'edit') {
        let pictureIds = [];
        if (this.file?.length) {
          this.file.forEach(item => {
            if (item?.status) {
              pictureIds.push({
                fileId: item.id || item.response.resultData.fileUrl,
                fileName: item.name,
                uid: item.uid
              });
            } else {
              let f = {};
              f.fileId = item.id;
              f.fileName = item.name;
              pictureIds.push(f);
            }
          });
        }
        // if (!this.getPicUrl(pictureIds)) return false;
        this.loading = true;
        this.$http
          .post('/EmployeeArchives/updateEmployeeArchives', {
            waterPlantId: this.addForm.waterPlantId,
            orgId: this.addForm.orgId,
            orgName: this.addForm.orgName,
            name: this.addForm.name,
            account: this.addForm.account,
            role: this.addForm.role,
            id: this.addForm.id,
            fileIdAndNames: pictureIds
          })
          .then(() => {
            message = '编辑成功';
            // 调用父组件方法
            this.$parent.getList(); // 重置查询
            this.$message.success(message);
            this.loading = false;
            this.visible = false;
          })
          .catch(() => {
            this.loading = false;
          });
      } else {
        this.handleCancel();
      }
    },
    handleCancel() {
      this.file = [];
      this.$refs.ruleForm.$_resetFields();
      this.loading = false;
      this.visible = false;
    },
    handleChange(info) {
      const status = info.file.status;
      this.status = status;
      this.file = [...(info.fileList || []).filter(item => item.status)];
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
/deep/ .vc-image-upload {
  height: auto;
  flex-direction: column;
}
/deep/ .vc-file-upload .file-list-info > li {
  height: auto;
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
</style>
