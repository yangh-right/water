<template>
  <!-- 仪表管理 -->
  <div class="device-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :title="null"
          newLine
          :neddRetain="false"
          :fields="fields"
          :model="searchForm"
          :layout="layout"
          :loading="loading"
        >
          <template #status>
            <w-select dropdownClassName="dark" v-model="searchForm.status">
              <w-select-option
                v-for="item in statusList"
                :key="item.dictValue"
                :value="item.dictValue"
                >{{ item.dictName }}</w-select-option
              >
            </w-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">
              <span>新增</span>
            </w-button>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
            <w-button class="mr_12" @click="handleImport"
              ><w-icon type="ic_publish" />导入</w-button
            >
            <w-button class="mr_12" @click="handleExport"
              ><w-icon type="ic_file_download" />导出</w-button
            >
          </template>
        </w-form-header>
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
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-modal
      class="secondary-modal"
      :visible="addInfoModelLoading"
      :maskClosable="false"
      title="废液管理"
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
            <w-form-model-item label="废液名称：" label-for="selectType" prop="name">
              <span v-if="preview">{{ addInfoForm.name }}</span>
              <w-input
                v-else
                v-model="addInfoForm.name"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="废液类别：" label-for="selectType" prop="category">
              <span v-if="preview">{{ addInfoForm.category }}</span>
              <w-input
                v-else
                v-model="addInfoForm.category"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="来源：" label-for="selectType" prop="source">
              <span v-if="preview">{{ addInfoForm.source }}</span>
              <w-input
                v-else
                v-model="addInfoForm.source"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="数量：" label-for="selectType" prop="quantity">
              <span v-if="preview">{{ addInfoForm.quantity }}</span>
              <w-input
                v-else
                v-model="addInfoForm.quantity"
                placeholder="请输入"
                type="number"
                :min="1"
                :max="9999999999"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="单位：" label-for="unit">
              <span v-if="preview">{{ addInfoForm.unit }}</span>
              <w-input
                v-else
                v-model="addInfoForm.unit"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="存储位置：" label-for="selectType" prop="storageLocation">
              <span v-if="preview">{{ addInfoForm.storageLocation }}</span>
              <w-input
                v-else
                v-model="addInfoForm.storageLocation"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="入库日期：" label-for="entryDate">
              <span v-if="preview">{{ addInfoForm.entryDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.entryDate"
                style="width:100%"
                placeholder="请输入"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="处理方法：" label-for="disposalMethod">
              <span v-if="preview">{{ addInfoForm.disposalMethod }}</span>
              <w-input
                v-else
                v-model="addInfoForm.disposalMethod"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="处理日期：" label-for="disposalDate">
              <span v-if="preview">{{ addInfoForm.disposalDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.disposalDate"
                style="width:100%"
                placeholder="请输入"
                allowClear
              />
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
            <w-form-model-item label="责任人：" label-for="responsiblePerson">
              <span v-if="preview">{{ addInfoForm.responsiblePerson }}</span>
              <w-input
                v-else
                v-model="addInfoForm.responsiblePerson"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="备注：" label-for="remarks">
              <span v-if="preview">{{ addInfoForm.remarks }}</span>
              <w-input
                v-else
                v-model="addInfoForm.remarks"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
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
  wasteLiquidsPage,
  wasteLiquidsAdd,
  wasteLiquidsDeleteById,
  sysDictListByCode,
  wasteLiquidsEdit,
  exportWasteLiquids,
  importWasteLiquids
} from '@/api/deviceManagement';
export default {
  name: 'WasteLiquids',
  data() {
    return {
      installAddressMap: {},
      modalInfo: {},
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
        name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
        category: [{ required: true, message: '类别不能为空', trigger: 'change' }]
      },
      autoSize: {
        minRows: 2,
        maxRows: 10
      },
      statusObj: {},
      statusList: [],
      addInfoForm: {
        id: '',
        name: '',
        category: '',
        source: '',
        status: undefined,
        storageLocation: '',
        location: '',
        disposalMethod: '',
        quantity: '',
        remarks: '',
        unit: '',
        entryDate: '',
        responsiblePerson: '',
        disposalDate: ''
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
  activated() {
    this.handleSearch();
  },
  created() {
    this.getDeviceStatus();
  },
  methods: {
    uploadImg(data) {
      this.addInfoForm.photos.push(data);
    },
    deleteImg(id) {
      let index = this.addInfoForm.photos.findIndex(v => v.id === id);
      this.addInfoForm.photos.splice(index, 1);
    },
    async getDeviceStatus() {
      let res = await sysDictListByCode('WasteLiquidsStatus');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.statusList = resultData;
        resultData.forEach(item => {
          this.statusObj[item.dictValue] = item.dictName;
        });
      }
    },
    handleSearch() {
      this.page.current = 1;
      this.getDeviceList();
    },
    async getDeviceList() {
      this.loading = true;
      const { resultData } = await wasteLiquidsPage({ ...this.searchForm, page: this.page });
      setTimeout(() => {
        this.dataSource = resultData.records;
        this.searchForm.total = resultData.total;
        this.loading = false;
      }, 500);
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.handleSearch();
    },
    handleEdit(row) {
      console.log(row);
      this.preview = false;
      this.isAdd = false;
      this.addInfoForm = cloneDeep(row);
      this.addInfoModelLoading = true;
    },
    handleDetail(row) {
      this.isAdd = false;
      this.preview = true;
      this.addInfoForm = cloneDeep(row);
      this.addInfoModelLoading = true;
    },
    handleAdd() {
      this.preview = false;
      this.isAdd = true;
      this.addInfoForm = {
        id: '',
        name: '',
        category: '',
        source: '',
        status: undefined,
        disposalMethod: '',
        storageLocation: '',
        location: '',
        quantity: '',
        remarks: '',
        unit: '',
        responsiblePerson: '',
        entryDate: '',
        disposalDate: ''
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
          this.addInfoForm.entryDate = this.addInfoForm.entryDate
            ? moment(this.addInfoForm.entryDate).format('YYYY-MM-DD')
            : '';
          this.addInfoForm.disposalDate = this.addInfoForm.disposalDate
            ? moment(this.addInfoForm.disposalDate).format('YYYY-MM-DD')
            : '';
          if (this.isAdd) {
            wasteLiquidsAdd(this.addInfoForm).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('添加成功!');
                this.getDeviceList();
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          } else {
            wasteLiquidsEdit(this.addInfoForm).then(response => {
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
        let { success } = await wasteLiquidsDeleteById(id);
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
      exportWasteLiquids(vo).then(res => {
        exportFile(res, '废液管理');
      });
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importWasteLiquids(formData);
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
/deep/ .wpg-modal-body {
  height: 420px;
  overflow: auto;
}
/deep/ .wpg-form-item {
  margin-bottom: 12px;
}
</style>
