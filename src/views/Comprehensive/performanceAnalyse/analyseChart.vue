<template>
  <div class="content">
    <div class="content-header">
      <span></span>
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div class="card-inner">
          <bar-chart
            v-if="chartData.length > 0 && barOption.xAxis[0].data.length > 0"
            :darkTheme="'light'"
            :option="barOption"
            ref="barChart"
          ></bar-chart>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </div>
    </w-spin>
  </div>
</template>

<script>
import { option } from './options.js';

export default {
  name: 'analyseChart',
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    chartData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      tabs: [],
      currentParams: '',
      barOption: JSON.parse(JSON.stringify(option))
    };
  },
  computed: {},
  watch: {
    chartData: {
      handler(newVal, oldVal) {
        if (newVal.length) {
          this.handleChartData(newVal);
        }
      },
      immediate: true
    }
  },
  methods: {
    // 处理图表数据
    handleChartData() {
      let dataTime = [],
        series = [];
      this.chartData.forEach((item, i) => {
        if (i === 0) {
          dataTime = item.map(p => p.dateTime.slice(11, 16));
        }
        series.push({
          name: item[0].pointMemo,
          type: 'line',
          barWidth: 10,
          itemStyle: {
            normal: {
              color: this.generateRandomColor()
            }
          },
          data: item.map(item => item.pv)
        });
      });

      this.barOption.xAxis[0].data = dataTime;
      this.barOption.series = series;
    },
    generateRandomColor() {
      // 生成三个随机数作为 RGB 值
      var r = Math.floor(Math.random() * 256);
      var g = Math.floor(Math.random() * 256);
      var b = Math.floor(Math.random() * 256);
      // 组装成颜色字符串
      var color = 'rgb(' + r + ',' + g + ',' + b + ')';
      return color;
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  height: 100%;
  &-header {
    width: 100%;
    padding: 0px 12px;
    display: flex;

    align-items: center;
    height: 32px;
    span {
      display: inline-block;
      width: 4px;
      height: 18px;
      background: var(--supply-color-auxiliary);
    }
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
    margin-left: 8px;
  }
  .spin {
    height: calc(100% - 32px);
  }
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .chart-wrapper {
    height: 100%;
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
  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
