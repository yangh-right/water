<!-- 运行日志 -->
<template>
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
          <w-button type="primary" icon="ic_add" @click="handleAdd">填写日志</w-button>
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
      <w-info-table
        showIndex
        :columns="columns"
        :data-source="tableData"
        :page="searchForm"
        :loading="loading"
        @infoDetail="infoDetail"
        @changePage="changePage"
        style="height: 100%"
      >
        <template #startDate="{ row }">
          {{ row.startDate | formatStart }} - {{ row.endDate | formatEnd }}
        </template>
      </w-info-table>
    </template>
  </w-form-table-page>
</template>

<script>
import { columns } from './components/config';
import FactorySelect from '@/components/factory-select/index';
import moment from 'moment';

export default {
  data() {
    return {
      columns,
      tableData: [],
      loading: false,
      searchForm: {
        waterPlantId: '',
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      page: { size: 20, pages: 1, total: 0 },
      firstTime: 0,
      fields: [
        {
          label: '选择污水厂：',
          name: 'waterPlantId',
          type: 'select',
          span: 8,
          wrapperCol: { span: 18 }
        }
      ]
    };
  },
  computed: {
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },
  components: { FactorySelect },
  filters: {
    //判断当前日期是否为今日、昨日或其他日期，并拼接值班开始时间段
    formatStart(val) {
      let today = moment().startOf('day');
      let yesterday = moment()
        .subtract(1, 'days')
        .startOf('day');
      let time = moment(val).format('HH:mm');
      let str = '';
      if (moment(val).isSame(today, 'd')) {
        str = '今日';
      } else if (moment(val).isSame(yesterday, 'd')) {
        str = '昨日';
      } else {
        str = moment(val).format('YYYY-MM-DD');
      }
      return str + ' ' + time;
    },
    //返回值班结束时间段
    formatEnd(val) {
      return moment(val).format('HH:mm');
    }
  },
  activated() {
    this.getList();
  },
  methods: {
    infoDetail(row) {
      this.goto({ path: '/Operation/RunLog/detail', query: { id: row.id } });
    },
    changePage(currentPage, pageSize) {
      this.searchForm.currentPage = currentPage;
      this.searchForm.pageSize = pageSize;
      this.page.pages = currentPage;
      this.page.size = pageSize;
      this.getList();
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.pages = 1;
      this.getList();
    },
    handleReset() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      this.page.pages = 1;
      this.page.size = 20;
      this.getList();
    },
    async getList() {
      //水厂自动选择会调接口，页面进来第一次也会调接口。
      if (!this.firstTime) {
        this.firstTime++;
        return;
      }
      let params = {
        delFlag: 0,
        orderBy: '',
        pageFlag: true,
        tenantId: ''
      };
      this.loading = true;
      try {
        let res = await this.$http.post('/runLog/list', {
          ...params,
          ...this.searchForm,
          page: this.page
        });
        res.resultData.records.forEach(item => {
          item.nameList.forEach((name, i) => {
            if (name.includes('（')) item.nameList[i] = name.substring(0, name.lastIndexOf('（'));
          });
          item.nameList = item.nameList.join('，');
        });
        this.tableData = res.resultData.records;
        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    handleAdd() {
      this.goto({ path: '/Operation/RunLog/add' });
    }
  }
};
</script>
