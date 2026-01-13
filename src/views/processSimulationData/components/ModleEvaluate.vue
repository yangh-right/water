<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-07-03 10:02:45
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <div class="tabs">
      <div
        v-for="item in tabs"
        :key="item.pointName"
        :class="currentParams === item.pointName ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <bar-chart
          v-if="tabs.length > 0"
          :darkTheme="'light'"
          :option="barOption"
          ref="barChart"
        ></bar-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getPointConfigsByPumpHouseIdAndGroupType, modelEvaluation } from '@/api/optimization';
import { moduleOption } from './data';
export default {
  name: 'ModuleEvaluate',
  props: {
    title: {
      type: String,
      default: ''
    },
    activeModule: {
       type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  data() {
    return {
      flag: true,
      loading: false,
      tabs: [],
      currentParams: '',
      barOption: moduleOption,
      columns: [],
      data: []
    };
  },
  watch: {
    activeModule: {
       immediate: true,
      deep: true,
      handler(val) {
        if (val) {
          this.getTabsList();
        }
      }
    }
  },
  created() {},
  methods: {
    async getTabsList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        groupType: 'outflow' //进水
      };
      let { resultData, status } = await getPointConfigsByPumpHouseIdAndGroupType(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.tabs = resultData[0].pointConfigRels;
          this.currentParams = this.tabs[0].pointName;
          this.currentDevice = this.tabs[0];
          this.getPointList();
        } else {
          this.tabs = [];
          this.currentParams = '';
          this.currentDevice = {};
          this.flag = false;
        }
      }
    },
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointName;
      this.getPointList();
    },
    async getPointList() {
      this.loading = true;
      let params = {
        optionId: this.activeModule,
        pointName: this.currentDevice.pointName,
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await modelEvaluation(params);
      this.loading = false;
      if (status === 'complete') {
        this.barOption.xAxis[0].data = resultData.xList;
        this.barOption.series[0].data = resultData.relativeList;
        this.barOption.series[1].data = resultData.squareList;
        if (resultData.relativeList.length > 0 || resultData.squareList.length > 0) {
          this.flag = true;
        } else {
          this.flag = false;
        }
      }
    },
    handleChartData() {
      if (Object.keys(this.currentDevice).length > 0) {
        let dataTime = [],
          relativeData = [],
          rMSEData = [];
        let { dataList, pointMemo, unit } = this.currentDevice;
        if (dataList.length) {
          dataList.forEach(item => {
            dataTime.push(item.dateTime.slice(11, 16));
            relativeData.push(item.relativeError);
            rMSEData.push(item.rMSE);
          });
        }
        dataTime = Array.from(new Set(dataTime));
        this.barOption.yAxis[0].name = unit;
        this.barOption.yAxis[1].name = unit;
        this.barOption.xAxis[0].data = dataTime;
        this.barOption.series[0].data = relativeData;
        this.barOption.series[1].data = rMSEData;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  // background: var(--supply-color-bg-card-DEFAULT);
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
    font-weight: 500;
    font-size: 14px;
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
      background: var(--supply-color-bg-card-dark);
      border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
      color: var(--supply-color-secondary);
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: var(--supply-color-online);
    }
  }
  .spin {
    height: calc(100% - 64px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 6px 0;
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
