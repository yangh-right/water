<!--
 * @Author: wangyr
 * @Date: 2024-10-09 10:55:08
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-04 13:06:05
 * @Description:
-->
<template>
  <div class="container">
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
          <template #waterPlantId>
            <FactorySelect
              v-model.trim="searchForm.waterPlantId"
              :showAll="true"
              :autoSelect="true"
              @change="handleSearch"
            ></FactorySelect>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <return-control :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          bordered
          :columns="columns"
          :data-source="dataSource"
          :loading="loading"
          :page="searchForm"
          @changePage="handlePageChange"
        ></w-info-table>
      </template>
    </w-form-table-page>
  </div>
</template>

<script>
import { isNumber, cloneDeep } from 'lodash';
import { headerFields, powerColumns } from './models/data.js';
import { getEnergyTable } from '@/api/report';
import FactorySelect from '@/components/factory-select/index.vue';
export default {
  name: 'powerTable',
  components: { FactorySelect },
  data() {
    return {
      fields: cloneDeep(headerFields),
      loading: false,
      dataSource: [],
      searchForm: {
        waterPlantId: undefined,
        rangeTime: [this.$moment().subtract(8, 'days'), this.$moment().subtract(1, 'days')],
        queryType: 'day',
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      columns: powerColumns
    };
  },
  computed: {},
  watch: {},
  mounted() {
    this.handleSearch();
  },
  methods: {
    handleSearch() {
      if (!this.searchForm.waterPlantId) return false;
      this.searchForm.currentPage = 1;
      this.getModelList();
    },
    async getModelList() {
      this.loading = true;
      let params = {
        ...this.searchForm,
        startTime: this.searchForm.rangeTime[0].format('YYYY-MM-DD HH:mm:ss'),
        endTime: this.searchForm.rangeTime[1].format('YYYY-MM-DD HH:mm:ss')
      };
      const { resultData, status } = await getEnergyTable(params);
      if (status === 'complete') {
        this.baseTableData = resultData;
        this.dealData();
      }
      this.loading = false;
    },
    dealData() {
      let data = JSON.parse(JSON.stringify(this.baseTableData));
      if (data.length === 0) return;
      this.dealTableData(data);
      this.setColumns(data);
    },
    /* 表格数据 */
    dealTableData(data) {
      let arr = [];
      data.forEach(d => {
        d.detailList.forEach((p, i) => {
          arr.push(this.setColValues(p, d, i));
        });
      });
      this.dataSource = arr;
    },
    // 列数据
    setColValues(data, d, i) {
      let { locationName, totalEnergy } = d;
      let { name, startValue, endValue, totalValue } = data;
      return {
        locationName,
        name,
        startValue,
        endValue,
        totalValue: isNumber(totalValue) ? Math.abs(totalValue) : '--',
        totalEnergy: isNumber(totalEnergy) ? Math.abs(totalEnergy) : '--'
      };
    },
    // 合并行数据
    setColumns(data) {
      let dealRows = [];
      data.forEach(p => {
        let len = p.detailList.length;
        dealRows.push(len);
        if (len > 1) {
          for (let i = 1; i < len; i++) {
            dealRows.push(0);
          }
        }
      });
      this.columns[0].customRender = (text, row, index) => {
        return {
          children: <span title={text}>{text}</span>,
          attrs: {
            rowSpan: dealRows[index]
          }
        };
      };
      this.columns[5].customRender = (text, row, index) => {
        return {
          children: <span title={text}>{text}</span>,
          attrs: {
            rowSpan: dealRows[index]
          }
        };
      };
    },
    // 页码change
    handlePageChange(current, pageSize) {
      this.searchForm.currentPage = current;
      this.searchForm.pageSize = pageSize;
      this.getModelList();
    },
    handleReset() {
      this.searchForm = {
        rangeTime: [this.$moment().subtract(8, 'days'), this.$moment().subtract(1, 'days')],
        queryType: 'hour',
        currentPage: 1,
        pageSize: 20,
        total: 0
      };
      this.handleSearch();
    }
  }
};
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;

  /deep/.wpg-calendar-picker {
    width: 365px !important;
  }
}
</style>
