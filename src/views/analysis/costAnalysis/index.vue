<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-11 09:53:04
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-09-13 11:24:17
 * @Description:
-->
<template>
  <div class="search-table">
    <w-form-table-page class="search-table__wrap">
      <template #form>
        <w-form-header
          :layout="layout"
          :neddRetain="false"
          :model="searchForm"
          class="search-table__header wbgc-card"
          :fields="searchFields"
        >
          <template #footer>
            <w-button @click="drillPrice" type="primary" class="extraBtn"
              ><span>单价维护</span></w-button
            >
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
          v-on="tableEvent"
          v-bind="tableProps"
          :loading="tableLoading"
          :showRadio="showRadio"
          @changeRadio="tableChangeRadio"
          :scroll="tableScroll"
          @detail="rowEdit"
          @delete="rowDelete"
          class="search-table__table wbgc-card"
          :columns="columns"
          :data-source="dataList"
          :rowClassName="tableRowClassName"
        >
        </w-info-table>
      </template>
    </w-form-table-page>
  </div>
</template>
<script>
import moment from 'moment';
import { defaultMixin } from '@/components/SearchTable/option';
import { getCostAnalysePage } from '@/api/manage';
import { getDangerConfig as getConfig } from './data';
export default {
  mixins: [defaultMixin],
  props: {
    id: {
      type: [String, Number],
      default: ''
    },
    showRadio: {
      type: Boolean,
      default: false
    },
    hideAction: {
      type: Boolean,
      default: false
    },
    dataConfig: {
      type: Object,
      default: () => ({})
    }
  },
  inject: ['state'],
  data() {
    return {
      ...getConfig(this),
      tableListMeth: getCostAnalysePage,
      detailWidth: 1000,
      waterPlantId: '',
      detailLayout: {
        gutter: [24, 0],
        span: 8,
        wrapperCol: { span: 16 },
        labelCol: { span: 8 }
      },
      layout: {
        labelAuto: false,
        span: 6,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      searchForm: {
        date: [moment().subtract(7, 'days'), moment().subtract(1, 'days')]
      },
      dateParam: {
        date: {
          params: ['startTime', 'endTime'],
          dateFormat: 'YYYY-MM-DD'
        }
      },
      ...this.dataConfig
    };
  },
  computed: {
    detailTitle() {
      return this.modalType ? '编辑隐患' : '新增隐患';
    }
  },
  created() {
    this.getWaterPlant();
  },
  methods: {
    queryData() {},
    drillPrice() {
      this.drillDown({
        path: '/priceMaintenance'
      });
    },
    async getWaterPlant() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantId = resultData?.[0]?.id || '';
      this.getList();
    },
    async getList() {
      if (!this.waterPlantId) return;
      if (!this.tableListMeth) return;
      this.tableLoading = true;
      let params = this.handleApiParams(this.handleParams({ ...this.searchForm }));
      params.waterPlantId = this.waterPlantId;
      const { resultData, status } = await this.tableListMeth(params);
      if (status === 'complete') {
        let { records, total } = resultData;
        this.dataList = resultData || [];
        // 计算合计行并插入
        if (this.dataList.length) {
          this.dataList.push(this.getSummaryRow(this.dataList));
        }
        this.handleList();
      }
      this.tableLoading = false;
    },
    // 新增：合计行计算方法
    getSummaryRow(list) {
      // 字段列表，需与columns一致
      const sumFields = [
        'flowPv',
        'flow',
        'powerPv',
        'power',
        'dosagePv',
        'dosage',
        'sludgePv',
        'sludge',
        'pacPv',
        'pac',
        'sodiumAcetatePv',
        'sodiumAcetate',
        'sodiumHypochloritePv',
        'sodiumHypochlorite'
      ];
      const summary = { num: '合计', _isSummary: true };
      sumFields.forEach(key => {
        const sum = list.reduce((sum, row) => {
          const val = Number(row[key]);
          return sum + (isNaN(val) ? 0 : val);
        }, 0);
        summary[key] = sum.toFixed(2);
      });
      summary.time = '';
      return summary;
    },
    tableRowClassName(row, index) {
      // 合计行加高亮
      if (row._isSummary) return this.state.theme === 'dark' ? 'summary-dark-row' : 'summary-row';
      return '';
    }
  }
};
</script>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
/* .form-item {
  display: flex;
  &__label {
    width: 10.5%;
    text-align: right;
  }
  &__content {
    flex: 1;
    overflow: hidden;
  }
} */
/* 合计行高亮 */
/deep/ .wpg-table-row.summary-row {
  background: #fffbe6 !important;
  font-weight: bold;
}
/* 黑色主题 */
/deep/ .wpg-table-row.summary-dark-row {
  background: #2c2c2c !important;
  font-weight: bold;
}
</style>
