<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-07-22 15:19:17
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="content-tab">
        <span class="label" :class="{ active: currentType === 'pie' }" @click="currentType = 'pie'"
          >饼图</span
        >
        <span
          class="label"
          :class="{ active: currentType === 'line' }"
          @click="currentType = 'line'"
          >曲线</span
        >
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="currentType === 'pie'" class="chart-wrapper-list">
        <div class="chart-wrapper">
          <div v-if="hasData" class="card-inner">
            <pie-chart
              ref="pieChart"
              style="width: 100%;height: 172px;"
              :option="totalNumOption"
              :defaultHighlight="true"
            ></pie-chart>
            <ul v-if="hasData" class="legends">
              <li v-for="d in dataList" :key="d.deviceId" class="legends-item">
                <span class="legends-item-marker" :style="{ background: d.color }"></span>
                <span class="legends-item-name" :title="d.name">{{ d.name }}</span>
              </li>
            </ul>
          </div>
          <w-empty v-else class="empty"></w-empty>
        </div>
        <div class="chart-wrapper">
          <div v-if="hasData" class="card-inner">
            <pie-chart
              style="width: 100%;height: 172px;"
              :option="totalNumSmallTypeOption"
              :defaultHighlight="true"
            ></pie-chart>
            <ul v-if="hasData" class="legends">
              <li v-for="d in dataSmallList" :key="d.deviceId" class="legends-item">
                <span class="legends-item-marker" :style="{ background: d.color }"></span>
                <span class="legends-item-name" :title="d.name">{{ d.name }}</span>
              </li>
            </ul>
          </div>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </div>
      <div v-else class="line">
        <div class="chart-wrapper-select">
          <div class="chart-wrapper-select-item">
            <div class="label">选择工艺段:</div>
            <w-select
              v-model="processingType"
              placeholder="请选择工艺段"
              style="width:120px"
              @change="processingTypeChange"
            >
              <w-select-option
                v-for="item in processingList"
                :key="item.dictCode"
                :value="item.dictCode"
                >{{ item.dictName }}</w-select-option
              >
            </w-select>
          </div>
          <div class="chart-wrapper-select-item">
            <div class="label">选择处理段:</div>
            <w-select
              v-model="processingSmallType"
              placeholder="请选择处理段"
              style="width:120px"
              @change="getLineData"
            >
              <w-select-option
                v-for="item in processingSmallTypeList"
                :key="item.dictCode"
                :value="item.dictCode"
                >{{ item.dictName }}</w-select-option
              >
            </w-select>
          </div>
        </div>
        <line-chart
          :darkTheme="'light'"
          :option="lineOption"
          class="line-chart"
          ref="inChart"
        ></line-chart>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { sysDictListByCode } from '@/api/manage';
import { totalNumOption, lineOption, totalNumSmallTypeOption, LevelColorMap } from './options';
import {
  getElectricalDeviceEnergyProportion,
  getElectricalDeviceEnergyTimeDataList
} from '@/api/cockpit.js';
export default {
  name: 'PowerProportion',

  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    pointsData: {
      type: Array,
      default: () => [],
      validator: value => Array.isArray(value)
    },
    timeObj: {
      type: Object,
      default: () => {}
    }
  },

  components: {
    PieChart: () => import('@/components/chart/PieChart.vue'),
    LineChart: () => import('@/components/chart/LineChart.vue')
  },

  data() {
    return {
      currentType: 'pie',
      totalNumOption,
      lineOption,
      totalNumSmallTypeOption,
      processingType: undefined,
      processingSmallType: undefined,
      processingSmallTypeList: [],

      processingList: [],
      dataList: [],
      dataSmallList: []
    };
  },

  inject: ['state'],

  computed: {
    color() {
      return LevelColorMap[this.state.theme] || LevelColorMap['default'];
    },

    hasData() {
      return Array.isArray(this.dataList) && this.dataList.length > 0;
    }
  },

  watch: {
    pointsData: {
      handler(val) {
        if (Array.isArray(val) && val.length) {
          this.processChartData();
        } else {
          this.resetChart();
        }
      },
      immediate: true
    },
    currentType(val) {
      if (val) {
        this.getLineData();
      }
    }
  },

  created() {
    this.getDict();
  },

  methods: {
    calculateSum(data) {
      if (!data.dataAndTimeList?.length) return 0;
      const dataList = data?.dataAndTimeList || [];
      return dataList.reduce((sum, item) => sum + (Number(item.pv) || 0), 0);
    },

    resetChart() {
      this.dataList = [];
      this.updateChartOption();
    },

    processChartData() {
      try {
        // 处理数据
        const dataEchart = this.pointsData[0].resultData.map((point, index) => ({
          name: point.typeName || '--',
          code: point.type,
          color: this.color[index],
          sum: point.powerPv
        }));

        // 计算总和
        const total = dataEchart.reduce((acc, curr) => acc + curr.sum, 0);

        // 计算比例并格式化数据
        this.dataList = dataEchart.map((item, index) => ({
          ...item,
          value: total === 0 ? 0 : Number(((item.sum / total) * 100).toFixed(2)),
          color: this.color[index]
        }));

        this.updateChartOption();
      } catch (error) {
        console.error('图表数据处理错误:', error);
        this.resetChart();
      }
    },

    updateChartOption() {
      if (!this.totalNumOption.series?.[0]) return;

      this.totalNumOption.color = this.color;
      this.totalNumOption.series[0].data = this.dataList;

      // 添加图表事件监听
      setTimeout(() => {
        let myChart = this.$refs.pieChart?.myChart;
        if (myChart) {
          // 先解除监听防止重复监听
          myChart.off('selectchanged');
          // 监听数据点击事件
          myChart.on('selectchanged', event => {
            this.getSmallTypeChartData(event.fromActionPayload.dataIndexInside);
          });
        }
      }, 1000);

      this.getSmallTypeChartData();
    },
    //字典code
    async getDict() {
      let { resultData, status } = await sysDictListByCode('energy_processing_type');
      if (status === 'complete') {
        this.processingList = resultData;
        this.processingTypeChange();
      }
    },
    async processingTypeChange() {
      this.processingSmallType = '';
      this.processingType = this.processingType
        ? this.processingType
        : this.processingList[0]?.dictCode;
      this.getLineData();
      let { resultData, status } = await sysDictListByCode(this.processingType);
      if (status === 'complete') {
        this.processingSmallTypeList = resultData;
      }
    },
    async getSmallTypeChartData(current = 0) {
      this.processingType = this.dataList[current]?.code || '';
      let { status, resultData } = await getElectricalDeviceEnergyProportion({
        ...this.timeObj,
        timePeriod: 'Days',
        smallTypeFlag: true,
        processingType: this.processingType
      });
      if (status === 'complete') {
        let data = resultData.map((point, index) => ({
          name: point.typeName || '--',
          code: point.type,
          color: this.color[index],
          sum: point.powerPv
        }));
        let total = data.reduce((acc, curr) => acc + curr.sum, 0);
        // 计算比例并格式化数据
        this.dataSmallList = data.map((item, index) => ({
          ...item,
          value: total === 0 ? 0 : Number(((item.sum / total) * 100).toFixed(2)),
          color: this.color[index]
        }));
        if (!this.totalNumSmallTypeOption.series?.[0]) return;
        this.totalNumSmallTypeOption.color = this.color;
        this.totalNumSmallTypeOption.series[0].data = this.dataSmallList;
      }
    },
    async getLineData() {
      let params = {
        ...this.timeObj,
        timePeriod: 'Days',
        processingType: this.processingType,
        processingSmallType: this.processingSmallType
      };
      let res = await getElectricalDeviceEnergyTimeDataList(params);
      let { status, resultData } = res;
      if (status === 'complete') {
        this.lineOption.xAxis[0].data = resultData.map(item => item.dateTime) || [];
        this.lineOption.series[0].data = resultData.map(item => item.powerPv) || []; //值
        this.lineOption.series[1].data = resultData.map(item => item.qoqPowerPv) || []; //值
        this.lineOption.series[2].data = resultData.map(item => item.yoyPowerPv) || []; //值
      }
    }
  }
};
</script>

<style lang="less" scoped>
.dark-color {
  [data-wpg-theme='dark'] & {
    color: #fff;
  }
}
.content {
  width: 100%;
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
  &-tab {
    .label {
      cursor: pointer;
      font-size: 13px;
      margin-right: 12px;
    }
    .active {
      color: var(--supply-color-primary-active);
      font-size: 15px;
    }
  }
  .spin {
    width: 100%;
    height: calc(100% - 40px);
  }
  .line {
    height: 100%;
  }
  .chart-wrapper-list {
    display: flex;
    justify-content: space-around;
    align-items: center;
    height: 100%;
  }
  .chart-wrapper-select {
    padding: 0 12px;
    width: 100%;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    &-item {
      margin-right: 12px;
      width: auto;
      display: flex;
      justify-content: flex-start;
      align-items: center;
    }
    .label {
      width: 80px;
    }
  }
  .line-chart {
    height: calc(100% - 50px);
  }
  .chart-wrapper {
    width: 50%;
    height: 100%;
  }
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
  }
  .legends {
    margin-top: -18px;
    list-style-type: none;
    display: flex;
    flex-wrap: wrap;
    overflow: auto;
    padding: 0 12px;

    &-item {
      cursor: pointer;
      font-size: 14px;
      margin-bottom: 8px;
      width: 50%;
      display: flex;
      align-items: center;
      justify-content: flex-start;

      &-marker {
        width: 10px;
        height: 10px;
        display: inline-block;
        margin-right: 8px;
        border-radius: 2px;
      }

      &-name {
        margin-right: 10px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        color: var(--supply-color-text-secondary);
      }
    }
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
