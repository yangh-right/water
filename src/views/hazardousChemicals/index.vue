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
            <return-control :is-drill-down="true"></return-control>
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
          <!-- <template #status="{ text }">
          <span>{{ statusObj[text] || '' }}</span>
        </template> -->
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-modal
      class="secondary-modal"
      :visible="addInfoModelLoading"
      :maskClosable="false"
      title="危化品管理"
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
            <w-form-model-item label="化学品名称：" label-for="selectType" prop="name">
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
            <w-form-model-item label="CAS编号：" label-for="selectType" prop="casNumber">
              <span v-if="preview">{{ addInfoForm.casNumber }}</span>
              <w-input
                v-else
                v-model="addInfoForm.casNumber"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="分子式：" label-for="selectType" prop="formula">
              <span v-if="preview">{{ addInfoForm.formula }}</span>
              <w-input
                v-else
                v-model="addInfoForm.formula"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="危险类别：" label-for="selectType" prop="category">
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
            <w-form-model-item label="储存条件：" label-for="selectType" prop="storageConditions">
              <span v-if="preview">{{ addInfoForm.storageConditions }}</span>
              <w-input
                v-else
                v-model="addInfoForm.storageConditions"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="操作注意事项：" label-for="handlingPrecautions">
              <span v-if="preview">{{ addInfoForm.handlingPrecautions }}</span>
              <w-input
                v-else
                v-model="addInfoForm.handlingPrecautions"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="急救措施：" label-for="firstAidMeasures">
              <span v-if="preview">{{ addInfoForm.firstAidMeasures }}</span>
              <w-input
                v-else
                v-model="addInfoForm.firstAidMeasures"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="暴露控制/个人防护：" label-for="exposureControls">
              <span v-if="preview">{{ addInfoForm.exposureControls }}</span>
              <w-input
                v-else
                v-model="addInfoForm.exposureControls"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="供应商：" label-for="selectType" prop="supplier">
              <span v-if="preview">{{ addInfoForm.supplier }}</span>
              <w-input
                v-else
                v-model="addInfoForm.supplier"
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
            <w-form-model-item label="过期日期：" label-for="expirationDate">
              <span v-if="preview">{{ addInfoForm.expirationDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.expirationDate"
                style="width:100%"
                placeholder="请输入"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="存储位置：" label-for="selectType" prop="location">
              <span v-if="preview">{{ addInfoForm.location }}</span>
              <w-input
                v-else
                v-model="addInfoForm.location"
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
            <w-form-model-item label="单位：" label-for="selectType" prop="unit">
              <span v-if="preview">{{ addInfoForm.unit }}</span>
              <w-input
                v-else
                v-model="addInfoForm.unit"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
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
  hazardousChemicalsPage,
  hazardousChemicalsAdd,
  hazardousChemicalsDeleteById,
  hazardousChemicalsEdit,
  importHazardousChemicals,
  exportHazardousChemicals
} from '@/api/deviceManagement';
export default {
  name: 'HazardousChemicals',
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
        span: 8,
        wrapperCol: { span: 17 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      addInfoFormRule: {
        name: [{ required: true, message: '名称不能为空', trigger: 'change' }],
        casNumber: [{ required: true, message: 'CAS编号不能为空', trigger: 'change' }],
        category: [{ required: true, message: '危险类别不能为空', trigger: 'change' }]
      },
      autoSize: {
        minRows: 2,
        maxRows: 10
      },
      addInfoForm: {
        id: '',
        name: '',
        quantity: '',
        model: '',
        supplier: '',
        casNumber: '',
        formula: '',
        category: '',
        entryDate: '',
        exposureControls: '',
        handlingPrecautions: '',
        firstAidMeasures: '',
        storageConditions: '',
        location: '',
        remarks: '',
        responsiblePerson: ''
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

  methods: {
    uploadImg(data) {
      this.addInfoForm.photos.push(data);
    },
    deleteImg(id) {
      let index = this.addInfoForm.photos.findIndex(v => v.id === id);
      this.addInfoForm.photos.splice(index, 1);
    },
    handleSearch() {
      this.page.current = 1;
      this.getDeviceList();
    },
    async getDeviceList() {
      this.loading = true;
      const { resultData } = await hazardousChemicalsPage({ ...this.searchForm, page: this.page });
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
        model: '',
        formula: '',
        casNumber: '',
        category: '',
        supplier: '',
        entryDate: '',
        expirationDate: '',
        exposureControls: '',
        handlingPrecautions: '',
        firstAidMeasures: '',
        storageConditions: '',
        location: '',
        quantity: '',

        remarks: '',

        responsiblePerson: ''
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
          this.addInfoForm.entryDate = this.addInfoForm.entryDate
            ? moment(this.addInfoForm.entryDate).format('YYYY-MM-DD')
            : '';
          this.addInfoForm.expirationDate = this.addInfoForm.expirationDate
            ? moment(this.addInfoForm.expirationDate).format('YYYY-MM-DD')
            : '';
          this.tableLoading = true;
          if (this.isAdd) {
            hazardousChemicalsAdd(this.addInfoForm).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('添加成功!');
                this.getDeviceList();
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          } else {
            hazardousChemicalsEdit(this.addInfoForm).then(response => {
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
        let { success } = await hazardousChemicalsDeleteById(id);
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
      exportHazardousChemicals(vo).then(res => {
        exportFile(res, '危化品管理');
      });
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importHazardousChemicals(formData);
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
  height: 475px;
  overflow: auto;
}
/deep/ .wpg-form-item {
  margin-bottom: 12px;
}
</style>
