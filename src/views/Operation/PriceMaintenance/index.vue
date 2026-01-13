<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :layout="headerLayout"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
          @search="handleSearch"
        >
          <template #waterPlantId>
            <factory-select
              showAll
              autoSelect
              v-model="searchForm.waterPlantId"
              @change="getList"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">编辑单价</w-button>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
            <return-control :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-tabs class="tab-wrap" size="large" v-model="deviceTab" @change="tabChange">
          <w-tab-pane v-for="item in tabs" :key="item.key" :tab="item.label"></w-tab-pane>
        </w-tabs>
        <div class="full-table-wrap">
          <w-info-table
            v-loading="loading"
            :columns="columns"
            :data-source="data"
            :model="searchForm"
            :page="searchForm"
            :scroll="{ x: 1200 }"
            @changePage="handlePageChange"
            :rowKey="rowKey"
          >
            <template #price="{ text }">
              <span>{{ text }}</span>
            </template>
          </w-info-table>
        </div>
      </template>
    </w-form-table-page>
    <AddPrice
      :visible.sync="addVisible"
      :title="addTitle"
      :outer-form="addForm"
      :outer-list="data"
      @success="getList"
    />
  </div>
</template>

<script>
import { recordColumns, infoColumns } from './config';
import { getPriceOperate, getPriceRecord, getCurrentPriceUnit } from '@/api/reportRecord';
import FactorySelect from '@/components/factory-select';

const PRICE_FIELDS = [
  { name: '流量单价', key: 'flowUnitPrice' },
  { name: '电量单价', key: 'powerUnitPrice' },
  { name: '药量单价', key: 'dosageUnitPrice' },
  { name: 'PAC单价', key: 'pacUnitPrice' },
  { name: '污泥单价', key: 'sludgeUnitPrice' },
  { name: '乙酸钠单价', key: 'sodiumAcetateUnitPrice' },
  { name: '次氯酸钠单价', key: 'sodiumHypochloriteUnitPrice' }
];

const TABS = [
  {
    key: '1',
    label: '当前单价',
    code: 'info',
    pageMeth: getCurrentPriceUnit
  },
  {
    key: '2',
    label: '历史单价',
    code: 'records',
    pageMeth: getPriceRecord
  }
];

export default {
  name: 'PriceMaintenance',
  components: {
    FactorySelect,
    AddPrice: () => import('./components/AddPrice.vue')
  },
  data() {
    return {
      loading: false,
      headerLayout: {
        span: 6,
        colon: true,
        labelAuto: true,
        wrapperCol: { span: 18 }
      },
      tabs: TABS,
      deviceTab: '1',
      fields: [
        {
          label: '选择污水厂',
          name: 'waterPlantId',
          type: 'input'
        }
      ],
      searchForm: {
        waterPlantId: undefined,
        name: '',
        currentPage: 1,
        pageSize: 20,
        total: 5
      },
      originPrice: {},
      data: [],
      addVisible: false,
      addTitle: '编辑单价',
      addForm: {}
    };
  },
  computed: {
    columns() {
      return this.deviceTab === '1' ? infoColumns : recordColumns;
    },
    rowKey() {
      return this.deviceTab === '1' ? 'name' : 'id';
    }
  },
  activated() {
    this.handleSearch();
  },
  methods: {
    tabChange() {
      this.handleSearch();
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.getList();
    },
    handleReset() {
      this.searchForm = {
        name: '',
        currentPage: 1,
        pageSize: 20
      };
      this.getList();
    },
    async getList() {
      this.loading = true;
      try {
        const params = {
          ...this.searchForm,
          page: {
            current: this.searchForm.currentPage,
            size: this.searchForm.pageSize
          }
        };
        const currentTab = this.tabs[this.deviceTab - 1];
        const { resultData, status } = await currentTab.pageMeth(params);

        if (status === 'complete' && resultData) {
          if (this.deviceTab === '1') {
            this.originPrice = JSON.parse(JSON.stringify(resultData));
            this.handleTableData(resultData);
          } else {
            this.handleTableRecord(resultData);
          }
        }
      } catch (error) {
        console.error(error);
      } finally {
        this.loading = false;
      }
    },
    handleTableData(resultData) {
      this.data = PRICE_FIELDS.map(field => ({
        name: field.name,
        price: resultData[field.key],
        createBy: resultData.createBy,
        inUse: resultData.inUse,
        updateBy: resultData.updateBy,
        updateTime: resultData.updateTime,
        version: resultData.version,
        createTime: resultData.createTime
      }));
      this.searchForm.total = PRICE_FIELDS.length;
    },
    handleTableRecord(resultData) {
      this.data = resultData?.records || [];
      this.searchForm.total = resultData?.total;
    },
    handlePageChange(page) {
      this.searchForm.currentPage = page.current;
      this.searchForm.pageSize = page.pageSize;
      this.getList();
    },
    handleAdd() {
      this.addTitle = '编辑单价';
      this.addForm = { ...this.originPrice };
      this.addVisible = true;
    }
  }
};
</script>

<style lang="less" scoped>
.full-view {
  height: 100%;

  /deep/ .wpg-tag {
    min-width: 60px;
    text-align: center;
  }
  /deep/ .wpg-info-table {
    height: calc(100% - 48px) !important;
  }
  /deep/ .wpg-modal-body {
    height: 480px;
    overflow: auto;
  }
}
</style>
