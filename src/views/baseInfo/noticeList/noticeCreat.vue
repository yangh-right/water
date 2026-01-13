<template>
  <div class="create-notice query-form">
    <div class="header supply-bg-bg-card-DEFAULT">
      <div>
        <i class="header-tip"></i>
        {{ flag }}内容
      </div>
      <div>
        <w-button class="supply-mr-3" @click="cancel()">取消</w-button>
        <w-button class="supply-mr-3" @click="sendNotice('0')">暂存</w-button>
        <w-button type="primary" @click="sendNotice('1')">
          发布
        </w-button>
      </div>
    </div>
    <w-row :span="24" class="body supply-bg-bg-card-DEFAULT">
      <w-form-model
        ref="formCreate"
        class="create-query-form"
        layout="inline"
        :model="formCreate"
        :rules="rules"
      >
        <w-col :span="12">
          <w-form-model-item label="标题" prop="title">
            <w-input
              v-model="formCreate.title"
              placeholder="请输入标题"
              :maxLength="100"
              allowClear
            />
          </w-form-model-item>
        </w-col>
        <w-col :span="12">
          <w-form-model-item label="通知范围" prop="rangeIds">
            <region-or-org-select
              v-if="type"
              ref="regionOrOrg"
              class="form-region-select"
              :item="{
                label: '',
                isShowType: true,
                type: type,
                ids: ids,
                isFeedback: flag !== '创建'
              }"
              @selectChange="handleOrgChange"
              @typeChange="handleTypeChange"
            ></region-or-org-select>
          </w-form-model-item>
        </w-col>
        <w-col :span="12">
          <w-form-model-item label="类型" prop="noticeType">
            <w-select v-model="formCreate.noticeType" placeholder="请选择">
              <w-select-option v-for="item in typeList" :key="item.dictCode" :value="item.dictCode">{{
                item.dictName
              }}</w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col :span="12">
          <w-form-model-item label="创建人" prop="createBy">
            <w-input v-model="formCreate.createBy" disabled />
          </w-form-model-item>
        </w-col>
        <!-- <w-col :span="12">
          <w-form-model-item label="创建部门" prop="createDepartment">
            <w-input v-model="formCreate.createDepartment" disabled />
          </w-form-model-item>
        </w-col> -->
        <w-col :span="12">
          <w-form-model-item label="创建日期" prop="createDate">
            <w-input v-model="formCreate.createDate" disabled />
          </w-form-model-item>
        </w-col>
        <w-col :span="24">
          <w-form-model-item label="文本内容" prop="content">
            <vc-editor
             v-if="show" v-model="formCreate.content"
              placeholder="请输入内容"
            />
          </w-form-model-item>
        </w-col>
        <w-col :span="24">
          <w-form-model-item label="上传附件" prop="file">
            <div v-show="file.length > 0" class="customize-file-list">
              <div>
                <div v-for="(list, index) in file" :key="index">
                  <img
                    v-if="(list.type && list.type.includes('excel')) || (list.name && list.name.includes('excel'))"
                    class="pre-icon"
                    src="../../../assets/images/default/icons/ic_file_excel@2x.png"
                    alt=""
                  />
                  <img
                    v-else-if="(list.type && list.type.includes('pdf')) || (list.name && list.name.includes('pdf'))"
                    class="pre-icon"
                    src="../../../assets/images/default/icons/ic_file_pdf@2x.png"
                    alt=""
                  />
                  <img
                    v-else-if="(list.type && list.type.includes('image')) || (list.name && list.name.includes('image'))"
                    class="pre-icon"
                    src="../../../assets/images/default/icons/ic_file_pic@2x.png"
                    alt=""
                  />
                  <img
                    v-else-if="(list.type && list.type.includes('doc')) || (list.name && list.name.includes('doc'))"
                    class="pre-icon"
                    src="../../../assets/images/default/icons/ic_file_word@2x.png"
                    alt=""
                  />
                  <img
                    v-else
                    class="pre-icon"
                    src="../../../assets/images/default/icons/ic_file_other@2x.png"
                    alt=""
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
                    <w-icon type="ic_check" style="color:green" />
                    <span>上传成功</span>
                    <w-icon class="file-delete" type="ic_delete" @click="deleteFile(index)" />
                  </span>
                </div>
              </div>
            </div>
            <w-upload-dragger
              v-if="show"
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
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </div>
</template>

<script>
import { accessToken } from "@wpg/framework-vue";
import storage from '@/utils/storage';
import RegionOrOrgSelect from '@/components/SelectRoleOrOrg';
import serverConfig from '@/config/server.config';
import { sysDictListByCode } from '@/api/manage';
import { saveNotice, selectNoticeInfoDetail } from '@/api/notice';
import { mapState, mapMutations } from 'vuex';
export default {
  name: 'NoticeCreat',
  components: {
    RegionOrOrgSelect
  },
  data() {
    return {
      show: false,
      typeList: [],
      type: '',
      file: [],
      lastFile: [], // 上一次暂存的文件列表
      formCreate: {
        userType: 0, // 0组织 1角色
        content: '',
        createBy: '',
        createDate: this.$moment().format('YYYY-MM-DD'),
        // createDepartment: '',
        noticeType: '',
        title: '',
        rangeIds: []
      },
      rules: {
        title: [{ required: true, message: '请输入标题' }],
        createDate: [{ required: true, message: '请输入创建时间' }],
        createBy: [{ required: true, message: '请输入创建人' }],
        rangeIds: [{ required: true, message: '请选择通知范围' }],
        noticeType: [{ required: true, message: '请选择类型' }]
      },
      ids: [],
      uploadAction: `${serverConfig.PUBLIC_API_BASE_URL}/userCenterApi/FileManager/fileUploadNew`,
      headers: {},
      flag: '创建',
      downLoadUrl: `${serverConfig.IMG_BASE_URL}`,
      status: '', // 上传的状态
      detailType: ''
    };
  },
  computed: {
    ...mapState('account', { currUser: 'user' }),
    ...mapState('page', ['current', 'opened'])
  },
  created() {
    const token = `Bearer ${accessToken.get()}`;
    this.headers = { Authorization: token };
  },
  activated() {
    this.file = [];
    this.show = true;
    let { id, flag, rowType } = this.$route.query;
    this.flag = flag;
    if (id) {
      this.getNoticeDetail(id, rowType);
    } else {
      this.type = 'org';
      this.lastFile = [];
      this.formCreate = {
        userType: 0, // 0组织 1角色
        content: '',
        createBy: '',
        createDate: this.$moment().format('YYYY-MM-DD'),
        // createDepartment: '',
        noticeType: '',
        title: '',
        rangeIds: []
      }
    }
    this.formCreate.createBy = this.currUser.userName;
    this.getNoticeTypeList();
    this.selectUserDep();
  },
  deactivated() {
    this.show = false;
    this.type = '';
  },
  methods: {
    ...mapMutations('page', ['removeOpened']),
    // 获取用户部门
    async selectUserDep() {
      // let result = await selectUserDep();
      // this.formCreate.createDepartment = result;
    },
    async getNoticeDetail(id, rowType) {
      let result = await selectNoticeInfoDetail({ id, rowType });
      this.$nextTick(() => {
        this.formCreate = {
          userType: result.userType ? 1 : 0, // 0组织 1角色
          content: result.content,
          createBy: result.createBy,
          createDate: result.createDate,
          noticeType: result.noticeType,
          title: result.title,
          rangeIds: result.rangeIds ? result.rangeIds : [],
          id: result.id
        };
        this.file = result.infos.map(item => {
          return {
            ...item,
            status: 'done',
            uid: item.id
          };
        });
        this.lastFile = this.file;
        this.type = result.userType === 0 ? 'org' : 'role';
        this.ids = result.ranges.map(v => v.noticeObjectId);
        this.formCreate.rangeIds = this.ids;
        this.detailType = this.type;
      });
    },
    /**
     * 获取 notice 类型
     */
    async getNoticeTypeList() {
      const { resultData } = await sysDictListByCode('notice_type');
      this.typeList = resultData;
    },
    // 查询组织/角色类型改变
    handleTypeChange(value) {
      this.type = value;
      this.formCreate.userType = value === 'org' ? '0' : '1';
    },
    // 查询组织/角色范围改变
    handleOrgChange(value) {
      this.ids = value;
      this.formCreate.rangeIds = value;
      if (value.length > 0) {
        this.$refs.formCreate.clearValidate('rangeIds');
      }
    },
    cancel(rowType) {
      this.$refs.formCreate.resetFields();
      const index = this.opened.findIndex(page => page.path.includes('/baseInfo/creatNoticeList'));
      if (index >= 0) {
        this.removeOpened(index);
      }
      rowType && sessionStorage.setItem('noticeListRowType', rowType);
      this.goto({ path: '/baseInfo/noticeList' });
    },
    sendNotice(optType) {
      let info = [];
      this.file.map(v => {
        info.push({
          name: v.name,
          // type: v.type,
          url: v.response ? v.response.resultData.fileUrl : v.fileUrl
        });
      });
      let params = {
        ...this.formCreate,
        optType: optType, // 存储方式0:暂存1:发布 ,
        infos: info
      };
      this.$refs.formCreate.validate(valid => {
        if (
          valid ||
          (this.formCreate.title &&
            this.formCreate.noticeType &&
            this.formCreate.rangeIds.length > 0)
        ) {
          this.$confirm({
            title: '提示',
            content: `确定要${optType === '0' ? '暂存' : '发布'}吗？`,
            onOk: async () => {
              console.log(params);
              await saveNotice(params);
              this.$message.success(optType === '0' ? '暂存成功' : '发布成功！');
              const rowType = optType === '0' ? 2 : 1;
              this.cancel(rowType);
            }
          });
        }
      });
    },
    handleChange(info) {
      console.log(info,'info')
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
      this.file.splice(index, 1);
      this.status = 'done';
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
.create-notice {
  height: 100%;
  .header {
    height: 60px;
    border-radius: 4px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    font-size: 16px;
    color: #6281a3;
    .header-tip {
      width: 5px;
      height: 16px;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
      background: #87ce40;
    }
  }
  .body {
    height: calc(100% - 72px);
    overflow: auto;
    border-radius: 4px;
    padding: 20px 60px;
    .table-page-preview-content {
      height: auto;
      max-height: 350px;
    }
    .upload-style {
      display: flex;
      align-items: center;
      justify-content: center;
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
      li {
        display: flex;
        align-items: center;
        color: #666666;
        height: 36px;
        .file-text {
          width: calc(100% - 260px);
        }
        .pre-icon {
          width: 14px;
          margin-right: 10px;
        }
        .after-text {
          span {
            margin: 0 8px;
          }
        }
      }
    }
  }
}
</style>
<style lang="less">
.create-notice {
  .create-query-form {
    .wpg-col-12 {
      height: 59px;
    }
    .wpg-col-24 {
      margin-bottom: 16px;
    }
    .form-region-select {
      .wpg-select {
        width: 190px !important;
      }
    }
    .wpg-form-item {
      display: flex;
      align-items: flex-start;
    }
    .wpg-form-item-label {
      width: 70px;
      text-align: right;
      margin-right: 8px;
    }
    .wpg-form-item-control-wrapper {
      flex: 1;
    }
    .wpg-radio-button-wrapper {
      height: 36px;
      line-height: 36px;
      min-width: 64px;
      text-align: center;
    }
  }
}
</style>
