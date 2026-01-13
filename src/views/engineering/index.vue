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
                <w-input
                  v-model="searchForm.keyword"
                  placeholder="可搜索工程名称/工程编号/工程描述"
                />
              </w-form-model-item>
            </w-col>
            <w-col :span="6">
              <w-form-model-item name="status" label="工程状态">
                <w-select dropdownClassName="dark" v-model="searchForm.status">
                  <w-select-option
                    v-for="item in projectManagementStatusList"
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
          <template #paymentStatus="{ text }">
            <span>{{ paymentsStatusObj[text] || '' }}</span>
          </template>
          <template #status="{ text }">
            <span>{{ projectManagementStatusObj[text] || '' }}</span>
          </template>

          <template #projectType="{ text }">
            <span>{{ projectTypeObj[text] || '' }}</span>
          </template>

          <template #currentStage="{ text }">
            <span>{{ projectStageObj[text] || '' }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-modal
      class="secondary-modal"
      :visible="addInfoModelLoading"
      :maskClosable="false"
      title="工程管理"
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
            <w-form-model-item label="工程名称：" label-for="projectName" prop="projectName">
              <span v-if="preview">{{ addInfoForm.projectName }}</span>
              <w-input
                v-else
                v-model="addInfoForm.projectName"
                placeholder="请输入工程名称"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="工程编号：" label-for="projectCode" prop="projectCode">
              <span v-if="preview">{{ addInfoForm.projectCode }}</span>
              <w-input
                v-else
                v-model="addInfoForm.projectCode"
                placeholder="请输入工程编号"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="工程类型：" label-for="projectType" prop="projectType">
              <span v-if="preview">{{ projectTypeObj[addInfoForm.projectType] || '' }}</span>
              <w-select v-else v-model="addInfoForm.projectType" placeholder="请选择工程类型">
                <w-select-option
                  v-for="(item, index) in projectTypeList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="工程地点：" label-for="location" prop="location">
              <span v-if="preview">{{ addInfoForm.location }}</span>
              <w-input
                v-else
                v-model="addInfoForm.location"
                placeholder="请输入工程地点"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="项目经理：" label-for="manager" prop="manager">
              <span v-if="preview">{{ addInfoForm.manager }}</span>
              <w-input
                v-else
                v-model="addInfoForm.manager"
                placeholder="请输入项目经理"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="工程描述：" label-for="description" prop="description">
              <span v-if="preview">{{ addInfoForm.description }}</span>
              <w-input
                v-else
                v-model="addInfoForm.description"
                placeholder="请输入工程描述"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="工程状态：" label-for="status" prop="status">
              <span v-if="preview">{{ projectManagementStatusObj[addInfoForm.status] || '' }}</span>
              <w-select v-else v-model="addInfoForm.status" placeholder="请选择工程状态">
                <w-select-option
                  v-for="(item, index) in projectManagementStatusList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="合同编号：" label-for="contractCode" prop="contractCode">
              <span v-if="preview">{{ addInfoForm.contractCode }}</span>
              <w-input
                v-else
                v-model="addInfoForm.contractCode"
                placeholder="请输入合同编号"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="合同名称：" label-for="contractName" prop="contractName">
              <span v-if="preview">{{ addInfoForm.contractName }}</span>
              <w-input
                v-else
                v-model="addInfoForm.contractName"
                placeholder="请输入合同名称"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="甲方：" label-for="partyA" prop="partyA">
              <span v-if="preview">{{ addInfoForm.partyA }}</span>
              <w-input
                v-else
                v-model="addInfoForm.partyA"
                placeholder="请输入甲方"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="乙方：" label-for="partyB" prop="partyB">
              <span v-if="preview">{{ addInfoForm.partyB }}</span>
              <w-input
                v-else
                v-model="addInfoForm.partyB"
                placeholder="请输入乙方"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="合同金额：" label-for="contractAmount" prop="contractAmount">
              <span v-if="preview">{{ addInfoForm.contractAmount }}</span>
              <w-input-number
                v-else
                v-model="addInfoForm.contractAmount"
                placeholder="请输入合同金额"
                style="width: 100%"
                :min="0"
                :precision="2"
              ></w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="开工日期：" label-for="startDate" prop="startDate">
              <span v-if="preview">{{ addInfoForm.startDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.startDate"
                style="width: 100%"
                placeholder="请选择开工日期"
              />
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="计划完工日期：" label-for="planEndDate" prop="planEndDate">
              <span v-if="preview">{{ addInfoForm.planEndDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.planEndDate"
                style="width: 100%"
                placeholder="请选择计划完工日期"
              />
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item
              label="实际完工日期："
              label-for="actualEndDate"
              prop="actualEndDate"
            >
              <span v-if="preview">{{ addInfoForm.actualEndDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.actualEndDate"
                style="width: 100%"
                placeholder="请选择实际完工日期"
              />
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="当前阶段：" label-for="currentStage" prop="currentStage">
              <span v-if="preview">{{ projectStageObj[addInfoForm.currentStage] || '' }}</span>
              <w-select v-else v-model="addInfoForm.currentStage" placeholder="请选择当前阶段">
                <w-select-option
                  v-for="(item, index) in projectStageList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="完成率：" label-for="completionRate" prop="completionRate">
              <span v-if="preview">{{ addInfoForm.completionRate }}%</span>
              <w-input-number
                v-else
                v-model="addInfoForm.completionRate"
                placeholder="请输入完成率"
                style="width: 100%"
                :formatter="value => `${value}%`"
                :parser="value => value.replace('%', '')"
                :min="0"
                :max="100"
                :precision="2"
              ></w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="进度说明：" label-for="progressDesc" prop="progressDesc">
              <span v-if="preview">{{ addInfoForm.progressDesc }}</span>
              <w-input
                v-else
                v-model="addInfoForm.progressDesc"
                placeholder="请输入进度说明"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="预算金额：" label-for="budgetAmount" prop="budgetAmount">
              <span v-if="preview">{{ addInfoForm.budgetAmount }}元</span>
              <w-input-number
                v-else
                v-model="addInfoForm.budgetAmount"
                placeholder="请输入预算金额"
                style="width: 100%"
                :formatter="value => `${value}元`"
                :parser="value => value.replace('元', '')"
                :min="0"
                :precision="2"
              ></w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="实际支出：" label-for="actualAmount" prop="actualAmount">
              <span v-if="preview">{{ addInfoForm.actualAmount }}元</span>
              <w-input-number
                v-else
                v-model="addInfoForm.actualAmount"
                placeholder="请输入实际支出"
                style="width: 100%"
                :formatter="value => `${value}元`"
                :parser="value => value.replace('元', '')"
                :min="0"
                :precision="2"
              >
              </w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="材料成本：" label-for="materialCost" prop="materialCost">
              <span v-if="preview">{{ addInfoForm.materialCost }}元</span>
              <w-input-number
                v-else
                v-model="addInfoForm.materialCost"
                placeholder="请输入材料成本"
                style="width: 100%"
                :formatter="value => `${value}元`"
                :parser="value => value.replace('元', '')"
                :min="0"
                :precision="2"
              ></w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="人工成本：" label-for="laborCost" prop="laborCost">
              <span v-if="preview">{{ addInfoForm.laborCost }}元</span>
              <w-input-number
                v-else
                v-model="addInfoForm.laborCost"
                placeholder="请输入人工成本"
                style="width: 100%"
                :formatter="value => `${value}元`"
                :parser="value => value.replace('元', '')"
                :min="0"
                :precision="2"
              ></w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="设备成本：" label-for="equipmentCost" prop="equipmentCost">
              <span v-if="preview">{{ addInfoForm.equipmentCost }}</span>
              <w-input-number
                v-else
                v-model="addInfoForm.equipmentCost"
                placeholder="请输入设备成本"
                style="width: 100%"
                :min="0"
                :precision="2"
              ></w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="其他成本：" label-for="otherCost" prop="otherCost">
              <span v-if="preview">{{ addInfoForm.otherCost }}</span>
              <w-input-number
                v-else
                v-model="addInfoForm.otherCost"
                placeholder="请输入其他成本"
                style="width: 100%"
                :min="0"
                :precision="2"
              ></w-input-number>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="付款状态：" label-for="paymentStatus" prop="paymentStatus">
              <span v-if="preview">{{ paymentsStatusObj[addInfoForm.paymentsStatus] || '' }}</span>
              <w-select v-else v-model="addInfoForm.paymentStatus" placeholder="请选择付款状态">
                <w-select-option
                  v-for="(item, index) in paymentsStatusList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="合同文件列表："
              label-for="contractFiles"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <file-list
                fileCode="contractFiles"
                :isEdit="!preview"
                :fileList="addInfoForm.contractFiles"
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
  projectManagementPage,
  projectManagementAdd,
  projectManagementEdit,
  projectManagementDeleteById,
  sysDictListByCode,
  exportProjectManagement,
  importProjectManagement
} from '@/api/deviceManagement';
export default {
  name: 'Engineering',
  components: {
    FileList: () => import('@/views/pressureEquipments/FileList.vue')
  },
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
      searchLayout: {
        colon: true,
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      layout: {
        colon: true, // 冒号
        span: 7,
        wrapperCol: { span: 17 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      addInfoFormRule: {
        projectName: [{ required: true, message: '工程名称不能为空', trigger: 'change' }],
        projectCode: [{ required: true, message: '工程编号不能为空', trigger: 'change' }],
        projectType: [{ required: true, message: '工程类型不能为空', trigger: 'change' }],
        currentStage: [{ required: true, message: '当前阶段不能为空', trigger: 'change' }]
      },
      autoSize: {
        minRows: 2,
        maxRows: 10
      },
      projectManagementStatusObj: {},
      projectManagementStatusList: [],
      projectTypeList: [],
      projectTypeObj: {},
      projectStageList: [],
      projectStageObj: {},
      paymentsStatusList: [],
      paymentsStatusObj: {},
      addInfoForm: {
        id: '',
        title: '',
        severity: undefined,
        discoverer: '',
        discoveryDate: '',
        contractFiles: [],
        location: '',
        status: undefined,
        operationalImpact: '',
        environmentalImpact: '',
        actionPlan: '',
        resolutionDate: '',
        resolutionDeadline: '',
        remarks: '',
        assignedTo: ''
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
    this.getPaymentsStatus();
    this.getProjectManagementStatus();
    this.getProjectStage();
    this.getProjectType();
  },
  methods: {
    async getPaymentsStatus() {
      let res = await sysDictListByCode('paymentStatus');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.paymentsStatusList = resultData;
        resultData.forEach(item => {
          this.paymentsStatusObj[item.dictValue] = item.dictName;
        });
      }
    },
    async getProjectStage() {
      let res = await sysDictListByCode('projectStage');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.projectStageList = resultData;
        resultData.forEach(item => {
          this.projectStageObj[item.dictValue] = item.dictName;
        });
      }
    },
    async getProjectType() {
      let res = await sysDictListByCode('projectType');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.projectTypeList = resultData;
        resultData.forEach(item => {
          this.projectTypeObj[item.dictValue] = item.dictName;
        });
      }
    },
    async getProjectManagementStatus() {
      let res = await sysDictListByCode('projectManagementStatus');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.projectManagementStatusList = resultData;
        resultData.forEach(item => {
          this.projectManagementStatusObj[item.dictValue] = item.dictName;
        });
      }
    },
    handleSearch() {
      this.page.current = 1;
      this.getDeviceList();
    },
    async getDeviceList() {
      this.loading = true;
      const { resultData } = await projectManagementPage({ ...this.searchForm, page: this.page });
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
      this.preview = false;
      this.isAdd = false;
      this.addInfoForm = cloneDeep(row);
      this.addInfoForm.contractFiles =
        this.addInfoForm.contractFiles.map(item => {
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
      this.addInfoForm.contractFiles =
        this.addInfoForm.contractFiles.map(item => {
          if (item.id) {
            return item;
          } else {
            return JSON.parse(item);
          }
        }) || [];

      this.addInfoModelLoading = true;
    },
    deleteFile(id, code) {
      let index = this.addInfoForm[code].findIndex(v => v.id === id);
      this.addInfoForm[code].splice(index, 1);
    },
    uploadFile(data, code) {
      if (!this.addInfoForm[code]) this.addInfoForm[code] = [];
      this.addInfoForm[code].push(data);
    },
    handleAdd() {
      this.preview = false;
      this.isAdd = true;
      this.addInfoForm = {
        id: '',
        severity: undefined,
        discoverer: '',
        discoveryDate: '',
        contractFiles: [],
        location: '',
        status: undefined,
        operationalImpact: '',
        environmentalImpact: '',
        actionPlan: '',
        resolutionDate: '',
        resolutionDeadline: '',
        remarks: '',
        assignedTo: ''
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
          this.addInfoForm.startDate = this.addInfoForm.startDate
            ? moment(this.addInfoForm.startDate).format('YYYY-MM-DD')
            : '';
          this.addInfoForm.planEndDate = this.addInfoForm.planEndDate
            ? moment(this.addInfoForm.planEndDate).format('YYYY-MM-DD')
            : '';
          this.addInfoForm.actualEndDate = this.addInfoForm.actualEndDate
            ? moment(this.addInfoForm.actualEndDate).format('YYYY-MM-DD')
            : '';
          if (this.isAdd) {
            projectManagementAdd(this.addInfoForm).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('添加成功!');
                this.getDeviceList();
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          } else {
            projectManagementEdit(this.addInfoForm).then(response => {
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
    handleExport() {
      const vo = this.searchForm;
      exportProjectManagement(vo).then(res => {
        exportFile(res, '工程管理');
      });
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importProjectManagement(formData);
      if (res.status == 'complete') {
        this.$message.success('导入成功');
      } else {
        this.$message.error(res.errorMessage);
      }
      this.getDeviceList();
      document.getElementById('file').value = '';
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
        let { success } = await projectManagementDeleteById(id);
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
  height: 524px;
  overflow: auto;
}
/deep/ .wpg-form-item {
  margin-bottom: 4px;
}
</style>
