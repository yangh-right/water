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
              :showAll="false"
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
            <return-control class="supply-ml-3" :keep="true" :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          bordered
          :columns="columns"
          :scroll="tableScroll"
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
import { headerFields, sludgeColumns } from './models/options.js';
import { getSludgeRecordInfoList } from '@/api/reportRecord';
import FactorySelect from '@/components/factory-select/index.vue';
export default {
  name: 'sludgeRecord',
  components: { FactorySelect },
  data() {
    return {
      fields: cloneDeep(headerFields),
      loading: false,
      dataSource: [],
      searchForm: {
        waterPlantId: undefined,
        rangeTime: [this.$moment().subtract(30, 'days'), this.$moment().subtract(1, 'days')],
        queryType: 'day',
        currentPage: 1,
        pageSize: 999,
        total: 0
      },
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      columns: sludgeColumns,
      initWaterPlantId: ''
    };
  },
  computed: {
    tableScroll() {
      return {
        x: this.columns.length * 150
      };
    }
  },
  watch: {
    'searchForm.waterPlantId': {
      immediated: true,
      handler(val) {
        if (val) {
          this.handleSearch();
        }
      }
    }
  },
  activated() {
    this.initWaterPlantId = this.searchForm.waterPlantId;
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
        startTime: this.searchForm.rangeTime[0].format('YYYY-MM-DD 00:00:00'),
        endTime: this.searchForm.rangeTime[1].format('YYYY-MM-DD 23:59:59')
      };
      const { resultData, status } = await getSludgeRecordInfoList(params);
      if (status === 'complete') {
        this.dataSource = resultData;
      }
      this.loading = false;
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
        waterPlantId: this.initWaterPlantId,
        queryType: 'hour',
        currentPage: 1,
        pageSize: 999,
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
  /deep/ .wpg-form-table-warp .table-warp {
    box-shadow: none;
    padding: 12px 12px 16px;
    height: calc(100% - 78px);
  }
}
</style>
