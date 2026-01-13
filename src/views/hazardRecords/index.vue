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
            <w-button class="search-head-btn" type="primary" @click="handleCreate">
              <w-icon type="ic_add" class="supply-text-l "></w-icon>
              创建工单
            </w-button>
            <!--  <w-button class="mr_12" @click="handleImport"
              ><w-icon type="ic_publish" />导入</w-button
            >
            <w-button class="mr_12" @click="handleExport"
              ><w-icon type="ic_file_download" />导出</w-button
            > -->
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          style="height: 100%"
          show-index
          :columns="columns"
          :data-source="dataSource"
          show-checkbox
          :page="searchForm"
          :loading="loading"
          :scroll="{ x: 2000 }"
          @changeCheckbox="changeTableCheckbox"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
          @handleDetail="handleDetail"
          @changePage="handlePageChange"
        >
          <template #status="{ text }">
            <span>{{ statusObj[text] || '' }}</span>
          </template>
          <template #severity="{ text }">
            <span>{{ hazardLevelObj[text] || '' }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-modal
      class="secondary-modal"
      :visible="addInfoModelLoading"
      :maskClosable="false"
      title="隐患管理"
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
            <w-form-model-item label="隐患标题：" label-for="selectType" prop="title">
              <span v-if="preview">{{ addInfoForm.title }}</span>
              <w-input
                v-else
                v-model="addInfoForm.title"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col v-if="!isAdd" span="12">
            <w-form-model-item label="状态：" label-for="selectType" prop="status">
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
            <w-form-model-item label="严重程度：" label-for="selectType" prop="severity">
              <span v-if="preview">{{ hazardLevelObj[addInfoForm.severity] || '' }}</span>
              <w-select v-else v-model="addInfoForm.severity" placeholder="请选择">
                <w-select-option
                  v-for="(item, index) in hazardLevelList"
                  :key="index"
                  :value="item.dictValue"
                >
                  {{ item.dictName }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="发现人：" label-for="selectType" prop="discoverer">
              <span v-if="preview">{{ addInfoForm.discoverer }}</span>
              <w-input
                v-else
                v-model="addInfoForm.discoverer"
                placeholder="请输入"
                style="width: 100%"
              ></w-input>
            </w-form-model-item>
          </w-col>

          <w-col span="12">
            <w-form-model-item label="发现日期：" label-for="discoveryDate">
              <span v-if="preview">{{ addInfoForm.discoveryDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.discoveryDate"
                style="width:100%"
                placeholder="请输入"
                allowClear
              />
            </w-form-model-item>
          </w-col>

          <w-col span="12">
            <w-form-model-item label="发现区域：" label-for="location">
              <span v-if="preview">{{ addInfoForm.location }}</span>
              <w-input
                v-else
                v-model="addInfoForm.location"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="对运营的影响：" label-for="operationalImpact">
              <span v-if="preview">{{ addInfoForm.operationalImpact }}</span>
              <w-input
                v-else
                v-model="addInfoForm.operationalImpact"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="对环境的影响：" label-for="environmentalImpact">
              <span v-if="preview">{{ addInfoForm.environmentalImpact }}</span>
              <w-input
                v-else
                v-model="addInfoForm.environmentalImpact"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col span="12">
            <w-form-model-item label="处理计划：" label-for="actionPlan">
              <span v-if="preview">{{ addInfoForm.actionPlan }}</span>
              <w-input
                v-else
                v-model="addInfoForm.actionPlan"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>

          <w-col span="12">
            <w-form-model-item label="解决期限：" label-for="resolutionDeadline">
              <span v-if="preview">{{ addInfoForm.resolutionDeadline }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.resolutionDeadline"
                style="width:100%"
                placeholder="请输入"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="备注："
              label-for="remarks"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <span v-if="preview">{{ addInfoForm.remarks }}</span>
              <w-textarea
                v-else
                v-model="addInfoForm.remarks"
                style="width:100%"
                placeholder="请输入"
                :rows="4"
              />
            </w-form-model-item>
          </w-col>
          <w-col v-if="!isAdd" span="12">
            <w-form-model-item label="指派给：" label-for="assignedTo">
              <span v-if="preview">{{ addInfoForm.assignedTo }}</span>
              <w-input
                v-else
                v-model="addInfoForm.assignedTo"
                placeholder="请输入"
                style="width:100%"
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col v-if="!isAdd" span="12">
            <w-form-model-item label="解决日期：" label-for="resolutionDate">
              <span v-if="preview">{{ addInfoForm.resolutionDate }}</span>
              <w-date-picker
                v-else
                v-model="addInfoForm.resolutionDate"
                style="width:100%"
                placeholder="请输入"
                allowClear
              />
            </w-form-model-item>
          </w-col>
          <w-col span="24">
            <w-form-model-item
              label="照片："
              label-for="photos"
              :labelCol="labelColWidth1"
              :wrapperCol="wrapperCol"
            >
              <img-slider
                :imgList="addInfoForm.photos"
                :isEdit="!preview"
                @deleteImg="deleteImg"
                @uploadImg="uploadImg"
              />
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </w-modal>
    <!-- 创建工单弹窗 -->
    <ticket-dialog
      :typeDisabled="true"
      ref="ticketDialog"
      :templateType="templateType"
      :templateData="templateData"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
import moment from 'moment';
import TicketDialog from '@/components/TicketDialog/index.vue';
import { headerFields, columns, searchForm } from './config';
import { cloneDeep } from 'lodash';
import {
  hazardRecordsPage,
  hazardRecordsAdd,
  hazardRecordsDeleteById,
  sysDictListByCode,
  hazardRecordsEdit
} from '@/api/deviceManagement';
export default {
  name: 'HazardRecords',
  components: {
    TicketDialog,
    ImgSlider: () => import('@/views/pressureEquipments/ImgSlider.vue')
  },
  data() {
    return {
      installAddressMap: {},
      templateType: '',
      templateData: null,
      selectedRowKeys: [],
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
        title: [{ required: true, message: '标题不能为空', trigger: 'change' }],
        severity: [{ required: true, message: '严重程度不能为空', trigger: 'change' }]
      },
      autoSize: {
        minRows: 2,
        maxRows: 10
      },
      statusObj: {},
      statusList: [],
      hazardLevelList: [],
      hazardLevelObj: {},
      addInfoForm: {
        id: '',
        title: '',
        severity: undefined,
        discoverer: '',
        discoveryDate: '',
        location: '',
        status: undefined,
        operationalImpact: '',
        environmentalImpact: '',
        actionPlan: '',
        photos: [],
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
    this.getHazardLevel();
    this.getHazardStatus();
  },
  methods: {
    changeTableCheckbox(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    uploadImg(data) {
      this.addInfoForm.photos.push(data);
    },
    deleteImg(id) {
      let index = this.addInfoForm.photos.findIndex(v => v.id === id);
      this.addInfoForm.photos.splice(index, 1);
    },
    async getHazardLevel() {
      let res = await sysDictListByCode('hazardLevel');
      let { status, resultData } = res;
      if (status === 'complete') {
        this.hazardLevelList = resultData;
        resultData.forEach(item => {
          this.hazardLevelObj[item.dictValue] = item.dictName;
        });
      }
    },
    async getHazardStatus() {
      let res = await sysDictListByCode('hazardStatus');
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
    handleCreate() {
      if (this.selectedRowKeys.length === 0) {
        this.$message.warning('请至少选择一条隐患');
        return;
      }
      this.templateType = 'zhjs-fxgl';
      this.templateData = {
        hazardRecordId: this.selectedRowKeys,
        id: new Date().valueOf()
      };
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    },
    handleUpdate() {
      this.getDeviceList();
    },
    async getDeviceList() {
      this.loading = true;
      const { resultData } = await hazardRecordsPage({ ...this.searchForm, page: this.page });
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
      this.addInfoForm.photos =
        this.addInfoForm.photos.map(item => {
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
      this.addInfoForm.photos =
        this.addInfoForm.photos.map(item => {
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
        severity: undefined,
        discoverer: '',
        discoveryDate: '',
        location: '',
        status: undefined,
        operationalImpact: '',
        environmentalImpact: '',
        actionPlan: '',
        photos: [],
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
          this.addInfoForm.discoveryDate = this.addInfoForm.discoveryDate
            ? moment(this.addInfoForm.discoveryDate).format('YYYY-MM-DD')
            : '';
          this.addInfoForm.resolutionDate = this.addInfoForm.resolutionDate
            ? moment(this.addInfoForm.resolutionDate).format('YYYY-MM-DD')
            : '';
          this.addInfoForm.resolutionDeadline = this.addInfoForm.resolutionDeadline
            ? moment(this.addInfoForm.resolutionDeadline).format('YYYY-MM-DD')
            : '';
          if (this.isAdd) {
            hazardRecordsAdd(this.addInfoForm).then(response => {
              this.tableLoading = false;
              if (response.status === 'complete') {
                this.$message.success('添加成功!');
                this.getDeviceList();
                this.addInfoModelLoading = false;
                this.cancelAddInfoModel();
              }
            });
          } else {
            hazardRecordsEdit(this.addInfoForm).then(response => {
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
        let { success } = await hazardRecordsDeleteById(id);
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
/deep/ .wpg-modal-body {
  height: 524px;
  overflow: auto;
}
/deep/ .wpg-form-item {
  margin-bottom: 4px;
}
</style>
