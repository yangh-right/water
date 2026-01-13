<template>
  <!-- 仪表管理 -->
  <div class="device-view">
    <w-form-table-page>
      <template #form>
        <w-form-model
          :model="searchForm"
          :labelCol="searchLayout.labelCol"
          :wrapperCol="searchLayout.wrapperCol"
          class="supply-w-full"
        >
          <w-row :gutter="8">
            <w-col :span="6">
              <w-form-model-item name="keyword" label="关键词">
                <w-input v-model="searchForm.keyword" placeholder="可搜索标题/意见类型" />
              </w-form-model-item>
            </w-col>
            <w-col :span="6">
              <w-form-model-item name="status" label="处理状态">
                <w-select dropdownClassName="dark" v-model="searchForm.status">
                  <w-select-option
                    v-for="item in statusList"
                    :key="item.dictValue"
                    :value="item.dictValue"
                    >{{ item.dictName }}</w-select-option
                  >
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col class="supply-float-right" :span="10">
              <w-form-model-item class="supply-float-right" :wrapperCol="{ flex: 1 }">
                <w-button type="primary" icon="ic_add" @click="handleAdd">
                  <span>新增</span>
                </w-button>
                <w-button class="supply-mx-3" icon="reload" @click="handleReset">
                  <span>重置</span>
                </w-button>
                <w-button type="primary" icon="ic_search" @click="handleSearch">
                  <span>查询</span>
                </w-button>
                <w-button class="supply-mx-3" @click="handleImport"
                  ><w-icon type="ic_publish" />导入</w-button
                >
                <w-button @click="handleExport"><w-icon type="ic_file_download" />导出</w-button>
                <return-control :is-drill-down="true"></return-control>
              </w-form-model-item>
            </w-col>
          </w-row>
        </w-form-model>
      </template>
      <template #table>
        <w-info-table
          style="height: 100%"
          show-index
          :columns="columns"
          :data-source="dataSource"
          :page="searchForm"
          :loading="loading"
          :scroll="{ x: 2000 }"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
          @handleDetail="handleDetail"
          @changePage="handlePageChange"
        >
          <template #status="{ text }">
            <span>{{ statusObj[text] || '' }}</span>
          </template>
          <template #type="{ text }">
            <span>{{ typeObj[text] || '' }}</span>
          </template>
          <template #handleTime="{ text }">
            <span>{{ text ? text.split(' ')[0] : '' }}</span>
          </template>
          <template #isAnonymous="{ text }">
            <span>{{ text == 1 ? '是' : text == 0 ? '否' : '' }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-modal
      class="secondary-modal"
      :visible="addInfoModelLoading"
      :maskClosable="false"
      title="意见箱"
      width="1000px"
      @cancel="cancelAddInfoModel"
      @ok="addInfoModelOk"
    >
      <w-form-model
        ref="addInfoFormRule"
        :model="addInfoForm"
        :rules="addInfoFormRule"
        v-bind="layout"
        :labelCol="labelColWidth"
      >
        <w-row type="flex" justify="space-between">
          <w-col span="12">
            <w-form-model-item label="标题：" label-for="selectType" prop="title">
              <span v-if="preview">{{ addInfoForm.title }}</span>
              <w-input
                v-else
                v-model="addInfoForm.title"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="意见类型：" label-for="selectType" prop="type">
              <span v-if="preview">{{ statusObj[addInfoForm.type] || '' }}</span>
              <w-select v-else v-model="addInfoForm.type" placeholder="请选择">
                <w-select-option
                  v-for="(item, index) in typeList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="意见内容：" label-for="selectType" prop="content">
              <span v-if="preview">{{ addInfoForm.content }}</span>
              <w-input
                v-else
                v-model="addInfoForm.content"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="提交部门：" label-for="selectType" prop="department">
              <span v-if="preview">{{ addInfoForm.department }}</span>
              <w-input
                v-else
                v-model="addInfoForm.department"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>

          <w-col span="12">
            <w-form-model-item label="提交人：" label-for="submitter">
              <span v-if="preview">{{ addInfoForm.submitter }}</span>
              <w-input
                v-else
                v-model="addInfoForm.submitter"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="联系方式：" label-for="selectType" prop="contact">
              <span v-if="preview">{{ addInfoForm.contact }}</span>
              <w-input
                v-else
                v-model="addInfoForm.contact"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="是否匿名：" label-for="isAnonymous">
              <span v-if="preview">{{ addInfoForm.isAnonymous }}</span>
              <w-select v-else v-model="addInfoForm.isAnonymous" placeholder="请选择">
                <w-select-option :value="1">是</w-select-option>
                <w-select-option :value="0">否</w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="处理状态：" label-for="selectType" prop="status">
              <span v-if="preview">{{ statusObj[addInfoForm.status] || '' }}</span>
              <w-select v-else v-model="addInfoForm.status" placeholder="请选择">
                <w-select-option
                  v-for="(item, index) in statusList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="处理意见：" label-for="handleOpinion">
              <span v-if="preview">{{ addInfoForm.handleOpinion }}</span>
              <w-input
                v-else
                v-model="addInfoForm.handleOpinion"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="处理人：" label-for="handler">
              <span v-if="preview">{{ addInfoForm.handler }}</span>
              <w-input
                v-else
                v-model="addInfoForm.handler"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="处理时间：" label-for="handleTime">
              <span v-if="preview">{{ addInfoForm.handleTime }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.handleTime"
                style="width:100%"
                placeholder="请输入"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="处理意见附件："
              label-for="selectType"
              prop="handleAttachments"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <file-list
                :fileList="addInfoForm.handleAttachments"
                :isEdit="!preview"
                @deleteFile="deleteFile"
                @uploadFile="uploadFile"
              ></file-list>
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </w-modal>
    <div ref="fileCon" style="display: none">
      <input
        id="file"
        ref="file"
        type="file"
        name="fileUpload"
        style="display: none"
        accept=".xls,.xlsx,.XLS,.XLSX"
        @change="handleFile"
      />
    </div>
  </div>
</template>

<script>
import moment from 'moment';
import { headerFields, columns, searchForm } from './config';
import { cloneDeep } from 'lodash';
import { exportFile } from '@/utils/util';
import {
  suggestionBoxPage,
  suggestionBoxAdd,
  suggestionBoxDeleteById,
  suggestionBoxEdit,
  sysDictListByCode,
  exportSuggestionBox,
  importSuggestionBox
} from '@/api/deviceManagement';
export default {
  name: 'SuggestionBox',
  components: {
    FileList: () => import('@/views/pressureEquipments/FileList.vue')
  },
  data() {
    return {
      installAddressMap: {},
      modalInfo: {},
      searchLayout: {
        colon: true,
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      isCommonScreen: true,
      loading: false,
      addInfoModelLoading: false, // 新增信息-弹框loading
      isAdd: true, // 是否新建
      title: '仪表台账',
      preview: false,
      layout: {
        colon: true, // 冒号
        span: 7,
        wrapperCol: { span: 17 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      addInfoFormRule: {
        title: [{ required: true, message: '标题不能为空', trigger: 'change' }],
        type: [{ required: true, message: '意见类型不能为空', trigger: 'change' }]
      },
      autoSize: {
        minRows: 2,
        maxRows: 10
      },
      statusObj: {},
      statusList: [],
      typeList: [],
      typeObj: {},
      addInfoForm: {
        id: '',
        title: '',
        type: '',
        contact: '',
        content: '',
        status: undefined,
        createBy: '',
        department: '',
        handleAttachments: [],
        handleOpinion: '',
        handleTime: '',
        createTime: '',
        handler: '',
        isAnonymous: undefined,
        submitter: '',
        suggestionAttachments: [],
        remark: ''
      },
      labelColWidth: {
        span: 7
      },
      labelColWidth1: {
        span: 3
      },
      wrapperCol: {
        span: 21
      },
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: [],
      headerFields
    };
  },
  computed: {
    fields() {
      if (this.isCommonScreen) {
        return this.headerFields.filter(i => i.isCommonScreen);
      } else {
        return cloneDeep(this.headerFields);
      }
    }
  },
  created() {
    this.getType();
    this.getDeviceStatus();
  },
  activated() {
    this.handleSearch();
  },
  methods: {
    handleSearch() {
      this.page.current = 1;
      this.getDeviceList();
    },
    async getType() {
      let res = await sysDictListByCode('suggestionType');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.typeList = resultData;
        resultData.forEach(item => {
          this.typeObj[item.dictValue] = item.dictName;
        });
      }
    },
    async getDeviceStatus() {
      let res = await sysDictListByCode('suggestionStatus');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.statusList = resultData;
        resultData.forEach(item => {
          this.statusObj[item.dictValue] = item.dictName;
        });
      }
    },
    async getDeviceList() {
      this.loading = true;
      const { resultData } = await suggestionBoxPage({ ...this.searchForm, page: this.page });
      setTimeout(() => {
        this.dataSource = resultData.records;
        this.searchForm.total = resultData.total;
        this.loading = false;
        console.log(this.dataSource);
      }, 500);
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.handleSearch();
    },
    deleteFile(id) {
      let index = this.addInfoForm.handleAttachments.find(v => v.id === id);
      this.addInfoForm.handleAttachments.splice(index, 1);
    },
    uploadFile(data) {
      this.addInfoForm.handleAttachments.push(data);
    },
    handleEdit(row) {
      this.preview = false;
      this.isAdd = false;
      this.addInfoForm = cloneDeep(row);
      this.addInfoForm.handleAttachments =
        this.addInfoForm.handleAttachments.map(item => {
          if (item.id) {
            return item;
          } else {
            return JSON.parse(item);
          }
        }) || [];
      this.addInfoModelLoading = true;
    },
    handleDetail(row) {
      this.isAdd = false;
      this.preview = true;
      this.addInfoForm = cloneDeep(row);
      this.addInfoForm.handleAttachments =
        this.addInfoForm.handleAttachments.map(item => {
          if (item.id) {
            return item;
          } else {
            return JSON.parse(item);
          }
        }) || [];
      this.addInfoModelLoading = true;
    },
    handleAdd() {
      this.preview = false;
      this.isAdd = true;
      this.addInfoForm = {
        id: '',
        title: '',
        type: '',
        contact: '',
        content: '',
        status: undefined,
        createBy: '',
        department: '',
        handleAttachments: [],
        handleOpinion: '',
        handleTime: '',
        createTime: '',
        handler: '',
        isAnonymous: undefined,
        submitter: '',
        suggestionAttachments: [],
        remark: ''
      };
      this.addInfoModelLoading = true;
    },
    cancelAddInfoModel() {
      this.addInfoModelLoading = false;
      this.$refs.addInfoFormRule && this.$refs.addInfoFormRule.resetFields();
    },
    //  弹框确定按钮
    addInfoModelOk() {
      if (this.preview) {
        this.cancelAddInfoModel();
        return false;
      }
      this.$refs.addInfoFormRule.validate(valid => {
        if (valid) {
          this.tableLoading = true;
          this.addInfoForm.handleTime = this.addInfoForm.handleTime
            ? moment(this.addInfoForm.handleTime).format('YYYY-MM-DD')
            : '';
          if (this.isAdd) {
            suggestionBoxAdd(this.addInfoForm).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('添加成功!');
                this.getDeviceList();
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          } else {
            suggestionBoxEdit(this.addInfoForm).then(response => {
              if (response.status === 'complete') {
                this.tableLoading = false;
                this.$message.success('保存成功!');
                this.getDeviceList();
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          }
        }
      });
    },
    handleDelete(row) {
      this.$confirm({
        title: '确定要删除该项记录吗？',
        okText: '确定删除',
        type: 'warning',
        cancelText: '取消',
        onCancel: () => {},
        onOk: () => {
          this.deleteDevice(row.id);
        }
      });
    },
    async deleteDevice(id) {
      try {
        let { success } = await suggestionBoxDeleteById(id);
        if (success) {
          this.$message.success('删除成功！');
          this.handleSearch();
        }
      } catch (error) {
        console.log(error);
      }
    },
    handleImport() {
      this.$refs.file.click();
    },
    handleExport() {
      const vo = this.searchForm;
      exportSuggestionBox(vo).then(res => {
        exportFile(res, '意见箱');
      });
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importSuggestionBox(formData);
      if (res.status == 'complete') {
        this.$message.success('导入成功');
      } else {
        this.$message.error(res.errorMessage);
      }
      this.getDeviceList();
      document.getElementById('file').value = '';
    },
    // 页码change
    handlePageChange(current, pageSize) {
      this.page.current = current;
      this.page.size = pageSize;
      this.getDeviceList();
    }
  }
};
</script>

<style lang="less" scoped>
.device-view {
  width: 100%;
  height: 100%;
}
/deep/.wpg-form-header .wpg-info-form .wpg-form-item {
  margin-bottom: 0;
}
/deep/.wpg-form {
  padding: 5px 20px;
  background: var(--supply-color-bg-card-DEFAULT);
}
/deep/ .wpg-modal-body {
  height: 550px;
  overflow: auto;
}
/deep/ .wpg-form-item {
  margin-bottom: 12px;
}
</style>
