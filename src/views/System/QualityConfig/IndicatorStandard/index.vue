<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :title="null"
          :layout="layout"
          :loading="tableLoading"
          :neddRetain="false"
          newLine
        >
          <template #waterPlantId>
            <factory-select
              v-model="searchForm.waterPlantId"
              autoSelect
              :showAll="!autoSelect"
              @input="waterPlantChange"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="addStandard">新增标准</w-button>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <div class="search-title wbgc-card wfc3">
          <w-icon type="info-circle" style="margin: 0 6px; color: #6281a3" />
          可为每种水质指标在污水厂不同区域设定不同的控制标准并关联监测量、采样点，对在线数据和化验结果进行自动衡量
        </div>
        <w-info-table
          class="table-height"
          :columns="columns"
          :data-source="tableData"
          :loading="tableLoading"
          :page="searchForm"
          showIndex
          :scroll="{ x: 1800 }"
          @changePage="handlePageChange"
          @delete="handleDelete"
          @detail="handleDetail"
          @edit="handleEditStandard"
          @changeSwitch="handleSwitch"
        >
          <template #pointNum="{ row, text }">
            <span v-if="text === 0">{{ text }}</span>
            <a v-else @click="handleDetail(row)">{{ text }}</a>
          </template>
          <template #samplingPointNum="{ row, text }">
            <span v-if="text === 0">{{ text }}</span>
            <a v-else @click="handleDetail(row)">{{ text }}</a>
          </template>

          <template #limit="{ row }">
            <span
              v-if="
                !['in', 'ni'].includes(row.limitOpt) &&
                  !['bt', 'nb'].includes(row.limitOpt) &&
                  row.limitOpt &&
                  existAndZero(row.limitValue)
              "
              :title="operatorsDict[row.limitOpt] + row.limitValue + row.unit"
            >
              {{ operatorsDict[row.limitOpt] }}{{ row.limitValue }}{{ row.unit }}
            </span>
            <span
              v-else-if="
                !['in', 'ni'].includes(row.limitOpt) &&
                  ['bt', 'nb'].includes(row.limitOpt) &&
                  row.limitOpt &&
                  existAndZero(row.limitMin) &&
                  existAndZero(row.limitMax)
              "
              :title="
                `${operatorsDict[row.limitOpt]}${row.limitMin}${row.unit}~${row.limitMax}${
                  row.unit
                }`
              "
            >
              {{ operatorsDict[row.limitOpt] }}{{ row.limitMin }}{{ row.unit }}~{{ row.limitMax
              }}{{ row.unit }}
            </span>

            <w-tooltip
              v-else-if="['in', 'ni'].includes(row.limitOpt) && row.limitOpt && row.limitRange"
            >
              <template slot="title">
                {{ row.limitRange }}
              </template>
              <span class="optionText">
                {{ operatorsDict[row.limitOpt] }}：{{ row.limitRange }}
              </span>
            </w-tooltip>
            <span v-else>--</span>
          </template>
          <template #warn="{ row }">
            <span
              v-if="
                !['in', 'ni'].includes(row.warningOpt) &&
                  !['bt', 'nb'].includes(row.warningOpt) &&
                  row.warningOpt &&
                  existAndZero(row.warningValue)
              "
              :title="operatorsDict[row.warningOpt] + row.warningValue + row.unit"
            >
              {{ operatorsDict[row.warningOpt] }}{{ row.warningValue }}{{ row.unit }}
            </span>
            <span
              v-else-if="
                !['in', 'ni'].includes(row.warningOpt) &&
                  ['bt', 'nb'].includes(row.warningOpt) &&
                  row.warningOpt &&
                  existAndZero(row.warningMin) &&
                  existAndZero(row.warningMax)
              "
              :title="
                `${operatorsDict[row.warningOpt]}${row.warningMin}${row.unit}~${row.warningMax}${
                  row.unit
                }`
              "
            >
              {{ operatorsDict[row.warningOpt] }}{{ row.warningMin }}{{ row.unit }}~{{
                row.warningMax
              }}{{ row.unit }}
            </span>

            <w-tooltip
              v-else-if="
                ['in', 'ni'].includes(row.warningOpt) && row.warningOpt && row.warningRange
              "
            >
              <template slot="title">
                {{ row.warningRange }}
              </template>
              <span class="optionText">
                {{ operatorsDict[row.warningOpt] }}：{{ row.warningRange }}
              </span>
            </w-tooltip>
            <span v-else>--</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <ModalDetail
      ref="modalDetail"
      :visible.sync="modalDetailVisible"
      :standardObj="selectedObj"
      :getOuterList="getList"
      @addSamplingPoint="handleAddSamplingPoint"
      @addMonitor="handleAddMonintor"
      @editStandard="handleEditStandard"
    ></ModalDetail>

    <ModalStandard
      :visible.sync="modalStandardVisible"
      :indicatorObj="selectedStandardObj"
      :waterPlantId="searchForm.waterPlantId"
      :indexList="indexList"
      @submit="handleStandardSubmit"
    ></ModalStandard>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index';
import ModalStandard from './components/TheModalStandard.vue';
import ModalDetail from './components/TheModalDetail.vue';
import { fieldsList, columns, operatorsDict } from './config';
export default {
  name: 'structureConfig',
  components: {
    FactorySelect,
    ModalStandard,
    ModalDetail
  },
  data() {
    return {
      //头部搜索变量
      fields: fieldsList,
      layout: {
        colon: true,
        labelAuto: true,
        gutter: [12, 8]
      },
      searchForm: {
        waterPlantId: '',
        structureIds: undefined,
        indexIds: undefined,
        pageSize: 20,
        currentPage: 1,
        total: 0
      },
      page: { size: 20, pages: 1, total: 0 },
      /* 表格参数 */
      tableLoading: true,
      // columns: columns,
      tableData: [],
      operatorsDict: operatorsDict,

      /* 新增/编辑模态框 */
      modalStandardVisible: false,
      selectedStandardObj: undefined,
      modalDetailVisible: false,
      selectedObj: {}, //详情中所选指标id

      //模态框需要
      indexList: [],
      structureList: []
    };
  },
  computed: {
    ...mapState('dict', ['factory_standard', 'national_standard']),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    },
    columns() {
      return columns({
        factory_standard: this.factory_standard,
        national_standard: this.national_standard
      });
    }
  },
  activated() {
    if (this.$route.query.indexIds) {
      this.searchForm.indexIds = [this.$route.query.indexIds];
    } else {
      this.searchForm.indexIds = undefined;
    }
    this.getList();
  },
  methods: {
    /* 头部表单操作 */
    async waterPlantChange() {
      this.searchForm.currentPage = 1;
      this.searchForm.indexIds = undefined;
      this.searchForm.structureIds = undefined;
      //看情况获取构筑物 和 指标下拉框列表
      await this.getOptions();
      //获取列表
      await this.getList();
    },
    async handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.pages = 1;
      await this.getList();
    },
    async handleReset() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      this.page.pages = 1;
      this.page.size = 20;
      this.searchForm.structureIds = undefined;
      this.searchForm.indexIds = undefined;
      await this.getOptions();
      await this.getList();
    },
    //获取构筑物 和 指标名称列表
    async getOptions() {
      //获取构筑物列表
      try {
        let { resultData: structureList } = await this.$http.post(`/place/list`, {
          currentPage: 1,
          delFlag: 0,
          ids: [],
          orderBy: '',
          pageFlag: false,
          pageSize: 10,
          tenantId: '',
          waterPlantIds: [],
          name: '',
          nameLike: '',
          coding: '',
          waterPlantId: this.searchForm.waterPlantId
        });

        this.structureList = structureList.records.map(item => {
          return {
            ...item,
            value: item.id,
            label: item.name
          };
        });
        this.fields[1].options = this.structureList;
      } catch (error) {
        console.log(error);
      }

      //获取指标列表
      try {
        let { resultData: indexList } = await this.$http.post(`/waterIndex/page`, {
          currentPage: 1,
          delFlag: 0,
          ids: [],
          orderBy: '',
          pageFlag: false,
          pageSize: 10,
          tenantId: '',
          name: '',
          nameLike: '',
          containerId: '',
          conservantId: '',
          validFlag: 1
        });

        this.indexList = indexList.records.map(item => {
          return {
            ...item,
            rangeValue: item.value,
            value: item.id,
            label: item.name
          };
        });
        this.fields[2].options = this.indexList;
      } catch (error) {
        console.log(error);
      }
    },
    // 获取列表
    async getList() {
      try {
        this.tableLoading = true;
        let res = await this.$http.post(`/controlStandard/page`, {
          ...this.searchForm,
          delFlag: 0,
          orderBy: '',
          tenantId: '',
          pointLocation: '',
          ids: [],
          page: this.page
        });

        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
        this.tableData = res.resultData.records;
      } catch (error) {
        this.tableData = [];
        console.log(error);
      } finally {
        this.tableLoading = false;
      }
    },

    addStandard() {
      this.selectedStandardObj = undefined;
      this.modalStandardVisible = true;
      console.log('新增标准');
    },
    /* 模态框操作 */
    async handleStandardSubmit(params, type) {
      this.modalStandardVisible = false;
      await this.postData(params, type);
      if (this.modalDetailVisible) {
        this.$refs.modalDetail.getAllData();
      }

      this.getList();
    },

    /* 表格操作 */
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.getList();
    },
    handleDetail(row) {
      console.log('点击详情', row);
      this.modalDetailVisible = true;
      this.selectedObj = row;
    },

    async handleDelete(row) {
      this.$confirm({
        title:
          '删除后所关联监测量和采样点对应的水质指标将无法展示标准，您确定要删除该指标控制标准吗？',
        okText: '确定删除',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          row.delFlag = 1;
          await this.postData(row, 'put');
          this.getList();
        }
      });
    },
    handleAddSamplingPoint() {
      this.modalSamplingVisible = true;
    },
    handleAddMonintor() {
      this.modalMonitorVisible = true;
    },

    handleEditStandard(row) {
      this.selectedStandardObj = row;
      this.modalStandardVisible = true;
    },
    async handleSwitch(checked, row) {
      if (!checked) {
        this.$confirm({
          title:
            '禁用后所关联监测量和采样点对应的水质指标将无法展示标准，您确定要禁用该指标控制标准吗？',
          okText: '确定禁用',
          cancelText: '取消',
          centered: true,
          onOk: async () => {
            this.postValidFlag(row, checked);
          }
        });
      } else {
        this.postValidFlag(row, checked);
      }
    },

    /* 公共操作 */
    async postData(params, type) {
      try {
        await this.$http[type](`/controlStandard`, params);
        this.$message.success('操作成功');
      } catch (error) {
        console.log(error);
      }
    },

    async postValidFlag(row, checked) {
      try {
        row.validFlag = checked;
        await this.postData(row, 'put');
      } catch (error) {
        console.log(error);
        row.validFlag = !checked;
      }
    },

    existAndZero(val) {
      return val || val === 0;
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/switch.less';
.search-title {
  padding: 0 0 8px 16px;
  font-size: 14px;

  & > span {
    font-size: 16px;
    font-weight: bold;
  }
}
.table-height {
  height: calc(100% - 30px);
}
</style>
