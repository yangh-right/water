<template>
  <div class="file-manage-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :layout="{ labelAuto: true }"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
        >
          <template #auditStatus>
            <w-select v-model="searchForm.auditStatus" :allowClear="true" placeholder="请选择">
              <w-select-option v-for="item in auditStatusList" :key="item.key">
                {{ item.label }}
              </w-select-option>
            </w-select>
          </template>
          <template #waterPlantId>
            <factory-select
              class="factory-select"
              v-model="searchForm.waterPlantId"
              :showAll="!autoSelect"
              autoSelect
              @input="handleSearch"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">新增</w-button>
            <w-button icon="reload" @click="handleReset">重置</w-button>
            <w-button type="primary" icon="search" @click="handleSearch">查询</w-button>
            <return-control
              v-if="
                $route.query.backPath &&
                  ($route.query.backPath.includes('/instrument/InstrumentMaintenance') ||
                    $route.query.backPath.includes('/safeCockpit'))
              "
              class="return-btn"
              :is-drill-down="true"
            ></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          showIndex
          :columns="columns"
          :data-source="tableData"
          :page="searchForm"
          :loading="loading"
          show-checkbox
          @changeCheckbox="onSelectChange"
          @downLoad="downLoad"
          @itemEdit="itemEdit"
          @itemDelete="itemDelete"
          @changePage="changePage"
          style="height: 100%"
        >
          <template #fileTime="{ row }">
            {{ row.date }}
          </template>
          <template #auditStatus="{ row }">
            {{ handleAuditStatus(row) }}
          </template>
          <template #plantId="{ row }">
            {{ row.plantId && factoryDict[row.plantId] }}
          </template>
          <template #fileFormat="{ row }">
            <img
              v-if="row.fileFormat.includes('excel') || row.fileFormat.includes('xls')"
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_excel@2x.png"
              alt
            />
            <img
              v-else-if="row.fileFormat.includes('pdf')"
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_pdf@2x.png"
              alt
            />
            <img
              v-else-if="
                row.fileFormat.includes('png') ||
                  row.fileFormat.includes('jpg') ||
                  row.fileFormat.includes('webp') ||
                  row.fileFormat.includes('gif')
              "
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_pic@2x.png"
              alt
            />
            <img
              v-else-if="row.fileFormat.includes('doc')"
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_word@2x.png"
              alt
            />
            <img
              v-else
              class="pre-icon"
              src="./../../assets/images/default/icons/ic_file_other@2x.png"
              alt
            />
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <add-model
      :visible.sync="visible"
      :title="modelTitle"
      :AddForm="modalForm"
      :modelType="modelType"
    ></add-model>
  </div>
</template>

<script>
import serverConfig from '@/config/server.config';
import { getProjectStepApi } from '@/api/public';
import { getPage, deleteFile } from '@/api/fileManagement';
import { riskListcolumns } from './components/config';
import FactorySelect from '@/components/factory-select/index';
import Step from './components/Step.vue';
import AddModel from './components/AddModel.vue';
export default {
  name: 'riskList',
  components: { FactorySelect, Step, AddModel },
  data() {
    return {
      columns: riskListcolumns,
      visible: false,
      modelTitle: '新增',
      tableData: [],
      loading: false,
      modalForm: {},
      modelType: '',
      downLoadUrl: `${serverConfig.IMG_BASE_URL}`,
      searchForm: {
        waterPlantId: '',
        projectPhase: '',
        auditStatus: undefined,
        fileName: '',
        rangeTime: [this.$moment().subtract(1, 'years'), this.$moment()],
        createUser: '',
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      auditStatusList: [
        {
          key: 0,
          label: '待审核'
        },
        {
          key: 1,
          label: '审核通过'
        },
        {
          key: 2,
          label: '审核不通过'
        }
      ],
      steps: [],
      page: { size: 10, current: 1, pages: 0, total: 0 },
      firstTime: 0,
      fields: [
        {
          label: '选择污水厂：',
          name: 'waterPlantId',
          type: 'select',
          span: 4
        },
        {
          label: '文件名称',
          name: 'fileName',
          type: 'input',
          span: 4
        },
        // {
        //   label: '审核状态',
        //   name: 'auditStatus',
        //   type: 'select',
        //   span: 3
        // },
        {
          label: ['时间'],
          name: 'rangeTime',
          type: 'rangePicker',
          span: 6
        },
        {
          label: '操作人',
          name: 'createUser',
          type: 'input',
          span: 4
        }
      ],
      selectedRowKeys: [],
      curRow: null,
      isBatch: false
    };
  },
  computed: {
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    },
    hasSelected() {
      return this.selectedRowKeys.length > 0;
    },
    factoryDict() {
      let obj = {};
      this.$store.state.factoryList.map(item => {
        obj[item.id] = item.stationName;
      });
      return obj;
    }
  },
  activated() {
    this.getList();
  },
  created() {
    this.getProjectSteps();
  },
  methods: {
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    handleAuditStatus(row) {
      let auditStatusLabel = this.auditStatusList.find(item => item.key == row.auditStatus)?.label;
      return !!auditStatusLabel ? auditStatusLabel : '--';
    },
    async getProjectSteps() {
      let res = await getProjectStepApi();
      let { status, resultData } = res;
      if (status === 'complete') {
        this.steps = resultData;
      }
    },
    downLoad(row) {
      const x = new XMLHttpRequest();
      x.open('GET', this.downLoadUrl + '/' + row.fileUrl, true);
      x.responseType = 'blob';
      x.onload = function(e) {
        const url = window.URL.createObjectURL(x.response);
        const a = document.createElement('a');
        a.href = url;
        a.target = '_blank';
        a.download = row.fileOriginName;
        a.click();
        a.remove();
      };
      x.send();
    },
    itemEdit(row) {
      this.visible = true;
      this.modelTitle = '编辑';
      this.modelType = 'edit';
      this.modalForm = row;
    },
    itemDelete(row) {
      this.$confirm({
        title: '确定要删除该条数据吗？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.deleteRecord(row);
        },
        onCancel: () => {}
      });
    },
    async deleteRecord(data) {
      let res = await deleteFile(data.id);
      let { status, errorMessage } = res;
      if (status === 'complete') {
        this.$message.success('删除成功');
        this.getList();
      } else {
        this.$message.success(errorMessage);
      }
    },
    changePage(currentPage, pageSize) {
      this.searchForm.currentPage = currentPage;
      this.searchForm.pageSize = pageSize;
      this.page.current = currentPage;
      this.page.size = pageSize;
      this.getList();
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getList();
    },
    handleReset() {
      this.searchForm = {
        projectPhase: '',
        auditStatus: undefined,
        fileName: '',
        rangeTime: [this.$moment().subtract(1, 'years'), this.$moment()],
        createUser: '',
        currentPage: 1,
        pageSize: 10,
        total: 0
      };
      this.page.current = 1;
      this.page.size = 10;
      this.getList();
    },
    async getList() {
      this.searchForm.projectPhase = this.currentStep;
      this.searchForm.startTime = this.searchForm.rangeTime[0].format('YYYY-MM-DD') + ' 00:00:00';
      this.searchForm.endTime = this.searchForm.rangeTime[1].format('YYYY-MM-DD') + ' 23:59:59';
      this.searchForm.page = this.page;
      this.searchForm.profileType = 1;
      this.loading = true;
      try {
        let res = await getPage(this.searchForm);
        this.tableData = res.resultData.records.map(item => {
          item.date = item.fileTime.split(' ')[0];
          return item;
        });
        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    handleAdd() {
      this.visible = true;
      this.modelTitle = '新增';
      this.modelType = 'add';
      this.modalForm = {};
    }
  }
};
</script>
<style lang="less" scoped>
.file-manage-view {
  height: 100%;
}
.device-title {
  color: #6281a3;
  font-size: 14px;
}
.steps {
  width: 100%;
  display: flex;
  justify-content: flex-start;
  flex-flow: row wrap;
}
.pre-icon {
  width: 28px;
  height: 28px;
}
</style>
