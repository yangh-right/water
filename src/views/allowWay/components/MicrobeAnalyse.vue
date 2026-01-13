<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-16 10:57:09
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <w-radio-group v-model="line" size="small" button-style="solid">
        <w-radio-button v-for="item in lineList" :key="item.dictCode" :value="item.dictValue">
          {{ item.dictName }}
        </w-radio-button>
      </w-radio-group>
    </div>
    <div v-if="showType === 'chart'" class="tabs">
      <div
        v-for="item in tabs"
        :key="item.pointName"
        :class="currentParams === item.pointMemo ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="showType === 'chart'" class="chart-wrapper">
        <bar-chart
          v-if="flag"
          :darkTheme="'light'"
          :option="microbeOption"
          ref="barChart"
        ></bar-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
      <div v-else class="table-wrapper">
        <w-config-provider>
          <w-table
            class="tableDevice"
            ref="wTable"
            :columns="columns"
            :data-source="data"
            :scroll="{ y: 105, x: 520 }"
            :pagination="false"
            rowKey="id"
          >
            <div
              :class="[record.statusClass, 'btn-status']"
              slot="status"
              slot-scope="text, record"
            >
              {{ record.statusLabel }}
            </div>
            <template slot="placeName" slot-scope="text, record">
              <span>{{ record.deviceStatus === -1 || !text ? '--' : text.split('-')[0] }}</span>
            </template>
          </w-table>
          <template #renderEmpty>
            <w-empty id="ssmal" style="margin:auto" size="small"></w-empty
          ></template>
        </w-config-provider>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { microbialAnalysis } from '@/api/analysis';
import purificationLineMixin from '@/utils/mixins/purificationLineMixin.js';
import { getPointConfigsByPumpHouseIdAndGroupType, getPointValue } from '@/api/optimization';
import { microbeOption, moduleColumns, lineMap } from './data';
export default {
  name: 'ModuleEvaluate',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    showType: {
      type: String,
      default: 'chart'
    }
  },
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  mixins: [purificationLineMixin],
  data() {
    return {
      flag: true,
      line: '0',
      loading: false,
      tabs: [],
      currentParams: '水量',
      option: 'day',
      type: '1',
      microbeOption,
      endTime: '',
      startTime: '',
      columns: moduleColumns,
      data: [],
      totalData: []
    };
  },
  computed: {
    lineParam() {
      return lineMap[this.line];
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        this.getPointData();
      },
      immediate: true
    },
    line(val) {
      this.setChartOption(this.totalData);
    }
  },
  created() {},
  methods: {
    initData() {
      this.barOption.series[0].data = [48, 48, 48, 48, 48, 48, 48, 48, 48];
      this.barOption.series[1].data = [18, 18, 18, 18, 18, 18, 18, 18, 18];
    },
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointMemo;
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
      // this.getPointData();
    },
    async getPointList() {
      if (!this.waterPlantId) return;
      let params = {
        pumpHouseId: this.waterPlantId //传水厂id
      };
      let { resultData, status } = await getPointConfigsByPumpHouseIdAndGroupType(params);
      if (status === 'complete') {
        if (resultData.length) {
          let data = resultData[0].pointConfigRels;
          let temp;
          data.forEach((item, index) => {
            if (item.pointMemo === 'COD') {
              temp = item;
              data.splice(index, 1);
            }
          });
          data.unshift(temp);
          this.tabs = data;
          this.currentParams = this.tabs[0].pointMemo;
          this.currentDevice = this.tabs[0];
          this.getPointData();
        } else {
          this.tabs = [];
          this.currentParams = '';
          this.currentDevice = {};
          this.flag = false;
        }
      }
    },
    async getPointData() {
      this.loading = true;
      this.flag = false;
      let param = {
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await microbialAnalysis(param);
      this.loading = false;
      if (status === 'complete') {
        this.totalData = resultData;
        this.setChartOption(resultData);
        this.flag = true;
      }
    },
    setChartOption(data) {
      this.microbeOption.series = [];
      this.microbeOption.yAxis[0].name = data[0].pointUnit;
      data.forEach((item, i) => {
        this.microbeOption.series[i] = { barMaxWidth: 8, type: 'bar' };
        this.microbeOption.series[i].data = item[this.lineParam].map(
          place => place.modelPointValue
        );
        this.microbeOption.series[i].name = item.pointMemo;
      });
      this.microbeOption.xAxis[0].data = data?.[0][this.lineParam].map(item => item.placeName);
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(50% - 6px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tabs {
    padding: 0 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      height: 24px;
      line-height: 24px;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .spin {
    height: calc(100% - 40px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
