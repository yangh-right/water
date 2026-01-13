<template>
  <div ref="chart" :class="['chart', gaugeClassName]"></div>
</template>

<script>
import { isFunction, isNil } from 'lodash-es';
import { chartApi, checkChartType } from './libs/typeMap';
import { getBaseTheme } from './libs/utils';
import chartResizeMixin from '@/utils/mixins/chartResizeMixin';

export default {
  name: 'Index',
  mixins: [chartResizeMixin],
  inject: ['state'],
  inheritAttrs: false,
  props: {
    chartType: String,
    data: Object,
    dataset: Object,
    optionsHandler: Function,
  },
  data() {
    return {
      options: null,
      chart: null,
    };
  },
  computed: {
    baseTheme() {
      return getBaseTheme(this.state.theme);
    },
    isGauge() {
      return checkChartType(this.chartType) === 'gauge';
    },
    gaugeType() {
      return this.isGauge ? this.data.chartType[this.baseTheme] : null;
    },
    gaugeClassName() {
      return this.isGauge ? `gauge gauge-t${this.gaugeType}` : '';
    },
  },
  watch: {
    data: 'initOptions',
    dataset: 'initOptions',
    chartType: 'initOptions',
    'state.theme': 'handleThemeChange',
  },
  mounted() {
    this.initChart();
    this.initOptions();
  },
  beforeDestroy() {
    this.disposeChart();
  },
  methods: {
    /**
     * @description: 处理主题变化
     * @return {*}
     */
    handleThemeChange() {
      this.initChart();
      this.initOptions();
    },

    /**
     * @description: 初始化图表
     * @return {*}
     */
    initChart() {
      this.disposeChart();
      this.chart = this.$echarts.init(this.$refs.chart, `wpg.${this.baseTheme}`);
    },

    /**
     * @description: 初始化配置
     * @return {*}
     */
    initOptions() {
      if (!this.chartType || !chartApi[this.chartType]) {
        console.error('暂不支持该类型图表: ' + this.chartType);
        return;
      }

      let dataset = this.dataset;
      let extraArgs = {
        theme: this.baseTheme, // 主题
      }; // 额外参数

      // 如果只有原始数据，则构造标准的数据源格式
      if (isNil(dataset) && this.data) {
        const { block, columns, records } = this.data;
        let dimensions = [];
        let source = [];
        let kvMap = {};

        columns.forEach((v) => {
          dimensions.push(v.title);
          kvMap[v.dataIndex] = v.title;
        });

        if (checkChartType(this.chartType) === 'pie') {
          // 饼图数据格式转换
          source = records
            .map((v) => {
              return Object.keys(v).reduce((s, a) => {
                if (!isNil(kvMap[a])) {
                  s.name = kvMap[a];
                  s.value = v[a];
                }
                return s;
              }, {});
            })
            .filter((v) => Object.keys(v).length);

          dataset = source;
        } else if (['top', 'side'].includes(this.chartType)) {
          // 该类型返回数据结构特殊
          dimensions = ['名称', block.chsName];
          source = records.map((v) => {
            return Object.keys(v).reduce((s, a) => {
              if (!isNil(kvMap[a])) {
                s['名称'] = kvMap[a];
                s[block.chsName] = v[a];
              }
              return s;
            }, {});
          });

          dataset = {
            dimensions,
            source,
          };
        } else if (this.isGauge) {
          // 仪表盘因为有图片叠底，需要传入尺寸调整图片大小
          const { offsetWidth, offsetHeight } = this.$refs.chart;
          extraArgs = {
            type: this.gaugeType,
            size: { w: offsetWidth, h: offsetHeight },
          };

          // 仪表盘返回特殊结构
          dataset = records;
        } else {
          source = records.map((v) => {
            return Object.keys(v).reduce((s, a) => {
              if (!isNil(kvMap[a])) {
                s[kvMap[a]] = v[a];
              }
              return s;
            }, {});
          });

          dataset = {
            dimensions,
            source,
          };
        }
      }

      let options = chartApi[this.chartType](dataset, extraArgs);
      this.options = isFunction(this.optionsHandler)
        ? this.optionsHandler(options, extraArgs)
        : options;
      this.drawChart();
    },

    /**
     * @description: 绘制图表
     * @return {*}
     */
    drawChart() {
      if (this.chart) {
        this.chart.clear();

        if (this.options) {
          this.chart.setOption(this.options, true);
        }
      }
    },

    /**
     * @description: 释放实例
     * @return {*}
     */
    disposeChart() {
      if (this.chart && !this.chart.isDisposed()) {
        this.chart.dispose();
        this.chart = null;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.chart {
  width: 100%;
  height: 100%;

  &.gauge {
    width: 250px;
    height: 250px;
    margin: 0 auto;
  }

  &.gauge-t-2 {
    background: url('~@/assets/panel/panel_round3.png') center center/180px no-repeat;
  }

  &.gauge-t-3 {
    background: url('~@/assets/panel/panel_round1.png') center center/180px no-repeat;
  }

  &.gauge-t-4 {
    background: url('~@/assets/panel/panel_round2_red.png') center center/180px no-repeat;
  }
}
</style>
