/** * @Date: 2019/11/5 17:04 * @Version: 0.0.1 * @Author: passerby * @Description: 折线图组件 *
@Update: 调整组件 by hyq 2020/1/2 9:55 */

<template>
  <div class="chart" ref="chart" :id="chartId" v-resize="resize"></div>
</template>

<script>
import * as echarts from 'echarts';
import { RadarChart } from 'echarts/charts';
// 引入提示框，标题 Component
import {
  TitleComponent,
  TooltipComponent,
  LegendComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent,
  RadarComponent
} from 'echarts/components';

// 注册必须的组件
echarts.use([
  TitleComponent,
  TooltipComponent,
  RadarChart,
  LegendComponent,
  RadarComponent,
  DataZoomInsideComponent,
  DataZoomSliderComponent
]);

export default {
  name: 'RadarChart',
  inject: ['state'],
  data() {
    return {
      myChart: null,
      baseOption: {
        tooltip: {
          //提示框组件
          trigger: 'item', //触发类型
          axisPointer: {
            //坐标轴指示器配置项
            type: 'cross'
          }
        },
        legend: {
          itemWidth: 6,
          itemHeight: 6,
          itemGap: 20,
          icon: 'circle',
          bottom: 15,
          padding: 0,
          left: 'center'
        },
        radar: [
          {
            indicator: [],
            radius: '70%', //雷达图半径
            center: ['50%', '45%'] //雷达图圆心位置
          }
        ],
        series: []
      }
    };
  },
  computed: {
    theme() {
      return (this.state.theme.includes('-') ? 'light' : this.state.theme) || 'light';
    }
  },
  props: {
    chartId: {
      // 图表id
      type: String,
      require: true,
      default: () => {
        return '';
      }
    },
    option: {
      // 图表配置项
      type: Object,
      require: true,
      default: () => {
        return {};
      }
    }
  },
  watch: {
    'state.theme': {
      handler() {
        this.initChart();
      }
    },
    option: {
      handler: function() {
        this.drawLine();
      },
      deep: true
    }
  },
  mounted() {
    this.init();
  },
  beforeDestory() {
    this.dispose();
  },
  activated() {
    this.init();
  },
  deactivated() {
    this.dispose();
  },
  methods: {
    initChart() {
      this.dispose();
      this.$nextTick(() => {
        this.init();
      });
    },
    init() {
      if (!this.myChart) {
        if (this.$refs.chart) {
          this.myChart = echarts.init(this.$refs.chart, this.theme);
          this.drawLine();
        }
      }
    },
    // 渲染图表
    drawLine() {
      if (this.myChart) {
        this.myChart.clear();
        // tools.deepObjectMerge 改成 Object.assign
        this.myChart.setOption(Object.assign(this.baseOption, this.option));
        // this.myChart.setOption(this.baseOption);
        this.myChart.on('click', param => {
          // 当前点击的索引，默认只可以点击（如柱状图bar,折线图折点）
          this.$emit('myChartClick', param);
        });
      }
    },
    dispose() {
      if (this.myChart) {
        this.myChart.dispose();
        this.myChart = null;
        clearInterval(this.$el.__vueSetInterval__);
      }
    }
  }
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
