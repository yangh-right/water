<template>
  <div class="power-chart">
    <div class="chart-header">
      <div class="chart-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="chart-content">
      <div class="chart-wrapper">
        <bar-chart v-if="hasChartData" :darkTheme="'light'" :option="chartOptions" ref="barChart" />
        <w-empty v-else class="chart-empty" />
      </div>
    </w-spin>
  </div>
</template>

<script>
import { roomOption } from './options';

export default {
  name: 'PowerChart',

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
    configCode: {
      type: String,
      default: ''
    },
    pointsData: {
      type: Array,
      default: () => [],
      validator: value => Array.isArray(value)
    }
  },

  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },

  inject: ['state'],

  data() {
    return {
      chartOptions: this.initChartOptions(),
      chartData: []
    };
  },

  computed: {
    hasChartData() {
      return Array.isArray(this.chartData) && this.chartData.length > 0;
    }
  },

  watch: {
    pointsData: {
      handler(val) {
        if (Array.isArray(val) && val.length) {
          this.processChartData(val);
        } else {
          this.resetChart();
        }
      },
      immediate: true
    }
  },

  methods: {
    initChartOptions() {
      return JSON.parse(JSON.stringify(roomOption(this.state.theme)));
    },

    resetChart() {
      this.chartData = [];
      this.updateChartOptions();
    },

    processChartData(data) {
      try {
        this.chartData = this.configCode
          ? this.processSingleConfig(data)
          : this.processMultiConfig(data);

        this.updateChartOptions();
      } catch (error) {
        console.error('图表数据处理错误:', error);
        this.resetChart();
      }
    },

    processSingleConfig(data) {
      const targetPoint = data.find(item => item.configCode === this.configCode);
      return targetPoint?.status === 'complete' ? targetPoint.resultData || [] : [];
    },

    processMultiConfig(data) {
      return data.reduce((acc, point) => {
        if (point.resultData?.length) {
          acc.push(...point.resultData);
        }
        return acc;
      }, []);
    },

    formatTimeData(dataList) {
      return dataList.map(v => this.$moment(v.date).format('DD'));
    },

    formatSeriesData(item) {
      return {
        type: 'line',
        smooth: false,
        name: item.pointMemo,
        data: item.dataAndTimeList.map(v => v.pv)
      };
    },

    updateChartOptions() {
      if (!this.hasChartData) return;

      const firstItem = this.chartData[0];
      if (!firstItem) return;

      // 更新Y轴单位
      this.chartOptions.yAxis[0].name = 'm³/d';

      // 更新X轴数据
      this.chartOptions.xAxis[0].data = this.formatTimeData(firstItem.dataAndTimeList);

      // 更新系列数据
      this.chartOptions.series = this.chartData.map(this.formatSeriesData);
    },

    handleDateChange() {
      this.processChartData(this.pointsData);
    }
  }
};
</script>

<style lang="less" scoped>
.power-chart {
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;

  .chart-header {
    padding: 15px 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }

  .chart-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
  }

  .month-picker {
    width: 100px;
  }

  .chart-content {
    height: calc(100% - 40px);
  }

  .chart-wrapper {
    height: 100%;
    padding: 10px 12px;
  }

  .chart-empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /deep/.wpg-select-selection--single {
    height: 32px;
  }

  /deep/.wpg-spin-container {
    height: 100%;
  }

  /deep/.wpg-select {
    width: 120px !important;
  }
}
</style>
