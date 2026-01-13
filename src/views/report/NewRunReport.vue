<!--
 * @Author: wangyr
 * @Date: 2024-04-30 09:00:03
 * @LastEditors: wangyr
 * @LastEditTime: 2024-09-05 10:20:52
 * @Description:
-->
<template>
  <div class="page-layout-wrap">
    <w-form-header
      :fields="fields"
      :model="searchForm"
      :layout="{ wrapperCol: { span: 19 }, labelCol: { span: 5 } }"
      newLine
      :neddRetain="false"
      :title="null"
      :loading="searchLoading"
    >
    <template #footer>
      <w-button icon="reload" @click="handleReset">
        <span>重置</span>
      </w-button>
      <w-button type="primary" icon="ic_search" @click="handleSearch">
        <span>查询</span>
      </w-button>
    </template>
    </w-form-header>
    <w-info-table
      show-index
      rowKey="id"
      :columns="columns"
      :data-source="tableList"
      :loading="loading"
      :page="page"
      :scroll="{ x: 1000 }"
      @detail="reportDetail"
    >
      <template #toolbar>
        <ChTab :tabs="tabs" :value="searchForm.dealFlag" @change="changeTab"></ChTab>
      </template>
      <template #waterPlantId="{ row }">
        {{ getWaterPlantName(row.waterPlantId) }}
      </template>
      <template #dealFlag="{ row }">
        <w-badge :color="getDeal(row)" />
        {{ getRowState(row) }}
      </template>
      <template #reportTypeName="{ row }">
        {{ row.reportModelVO.reportTypeName }}
      </template>
      <template #templateTypeName="{ row }">
        {{ row.reportModelVO.templateTypeName }}
      </template>
      <template #time="{ row }">
        <!-- {{ row.time | dayjs }} -->
        {{ row.time }}
      </template>
    </w-info-table>
  </div>
</template>

<script>
import ChTab from '@/components/ChTab';
import { fields, columns } from './models/data';
import formTableMixin from './models/form-table-mixin';
import { getListByType } from '@/api/report';
import { sysDictListByCode } from '@/api/manage';

export default {
  name: 'NewRunReport',
  components: { ChTab },
  mixins: [formTableMixin],
  data() {
    return {
      fields,
      columns,
      tabs: [
        { key: '', name: '全部' },
        { key: '0', name: '未处理' },
        { key: '2', name: '待审核' },
        { key: '1', name: '已处理' }
      ],
      loading: false,
      tableList: [],
      waterPlantsList: [],
      searchForm: {
        waterPlantId: '',
        reportType: '',
        dealFlag: '',
        searchTimer: ['', ''],
        templateType: 'run' // run laboratory
      }
    };
  },
  watch: {
    'searchForm.dealFlag': {
      handler(val, old) {
        if (val !== old) {
          setTimeout(() => {
            this.handleReset();
          }, 300);
        }
      },
      deep: true
    },
    'searchForm.waterPlantId':{
      handler(val, old) {
        if (val) {
          this.handleSearch();
        }
      },
      immediate: true,
    }
  },
  computed: {},
  created() {
    this.getSysDictListByCodeCut();
    this.getFactoryList();
    this.fields[0].listeners.change = this.handleSearch;
    this.fields[1].listeners.pressEnter = this.handleSearch;
    this.fields[2].listeners.change = this.handleSearch;
  },
  activated() {
    // this.handleSearch();
  },
  methods: {
    getWaterPlantName(id) {
      let stationNameArr = this.waterPlantsList.filter(item => item.id == id);
      return stationNameArr.length > 0 ? stationNameArr[0].stationName : '';
    },
    getDeal(row) {
      let status = 'cyan'; // : 'cyan'
      if (row.commitFlag) {
        if (row.dealFlag) {
          status = 'gold';
        } else {
          status = 'cyan';
        }
      } else {
        status = 'cyan';
      }
      return status;
    },
    getRowState(val) {
      let state = '';
      // commitFlag: 是否提交 1：是 0：否
      /**
       * 未提交：待处理
       * 未审核：待审核
       * 审核完成：已处理
       */
      if (val.commitFlag) {
        if (val.dealFlag) {
          state = '已处理';
        } else {
          state = '待审核';
        }
      } else {
        state = '待处理';
      }
      return state;
    },
    handleReset() {
      this.handlePageReset();
      if (this.waterPlantsList.length > 0) {
        this.searchForm.waterPlantId = this.waterPlantsList[0].id;
      }
      this.handleSearch();
    },
    // 查看详情
    reportDetail(row) {
      this.goto({
        path: '/report/NewDetailReport',
        query: {
          id: row.id,
          title: row.title,
          htmlAddress: row.htmlAddress,
          excelAddress: row.excelAddress,
          commitFlag: row.commitFlag,
          dealFlag: row.dealFlag,
          modelId: row.reportModelVO.id,
          from: this.$route.path,
          color: this.getDeal(row),
          colorName: this.getRowState(row)
        }
      });
    },
    changeTab(val) {
      this.searchForm.dealFlag = val;
    },
    // 获取报表类型字典
    async getSysDictListByCodeCut() {
      let { resultData } = await sysDictListByCode('water_report_form');
      let options = resultData.map(a => ({ label: a.dictName, value: a.dictCode }));
      this.fields[2].options = [{ label: '全部', value: '' }, ...options];
    },
    async getFactoryList() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantsList = resultData.map(a => ({ label: a.stationName, value: a.id, ...a }));
      if (Array.isArray(this.waterPlantsList) && this.waterPlantsList.length > 0) {
        this.fields[0].options = this.waterPlantsList;
        this.fields[0].value = this.waterPlantsList[0].id;
        // 水厂赋值
        this.searchForm.waterPlantId = this.waterPlantsList[0].id;
      }
    },
    async getList() {
      try {
        this.loading = true;
        let commitFlag = ''; // 是否提交
        let dealFlag = ''; // 是否审核

        switch (this.searchForm.dealFlag) {
          case '':
            commitFlag = '';
            dealFlag = '';
            break;
          case '0':
            commitFlag = '0';
            dealFlag = '0';
            break;
          case '1':
            commitFlag = '1';
            dealFlag = '1';
            break;
          case '2':
            commitFlag = '1';
            dealFlag = '0';
            break;
        }
        const { resultData = [], count = 0 } = await getListByType({
          ...this.searchForm,
          keywords: this.searchForm.keywords,
          commitFlag,
          dealFlag,
          waterPlantId: this.searchForm.waterPlantId,
          templateType: this.searchForm.templateType,
          reportType: this.searchForm.reportType,
          ...this.page,
          startTime: this.searchForm.searchTimer[0]
            ? this.searchForm.searchTimer[0] + ' ' + '00:00:00'
            : '',
          endTime: this.searchForm.searchTimer[1]
            ? this.searchForm.searchTimer[1] + ' ' + '23:59:59'
            : ''
        });
        this.tableList = resultData.records;
        this.page.total = count;
      } catch (error) {
        console.log(error);
        this.page.total = 0;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.page-layout-wrap {
  height: 100%;
  /deep/.wpg-info-table {
    height: calc(100% - 66px);
  }
}
/deep/ .wpg-badge-status-dot {
  width: 12px;
  height: 12px;
}
</style>
