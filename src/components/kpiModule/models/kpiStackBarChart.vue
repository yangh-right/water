<template>
  <chart-box :module-data="moduleData" show-title>
    <chart chart-type="top" :data="moduleData" :optionsHandler="handleOptions" />
  </chart-box>
</template>

<script>
import { genGradient } from '@/components/echarts/libs/utils.js';

export default {
  name: 'KpiStackBarChart',
  components: {
    ChartBox: () => import('./chartBox.vue'),
    Chart: () => import('@/components/echarts/index.vue'),
  },
  props: {
    moduleData: Object,
  },
  data() {
    return {};
  },
  methods: {
    /**
     * @description: 处理图表配置
     * @param {*} options
     * @return {*}
     */
    handleOptions(options, { theme }) {
      const { echartColor } = this.moduleData.block;

      if (options) {
        const color = {
          1: {
            light: ['#877AFF', '#CDB9FF'],
            dark: ['#503EFF', '#8F62FF'],
          },
          2: {
            light: ['#877AFF', '#CDB9FF'],
            dark: ['#0E5EE1', '#2AF2E2'],
          },
          3: {
            light: ['#877AFF', '#CDB9FF'],
            dark: ['#491CC6', '#4EA1FF'],
          },
        };
        const curColor = (color[echartColor] ?? color[1])?.[theme];

        options.grid.left = 10;
        options.grid.right = 20;
        options.grid.top = 5;
        options.grid.bottom = 30;
        options.legend.bottom = 0;
        // options.legend.textStyle = { fontSize: 10 };
        // options.xAxis[0].axisLabel.fontSize = 10;
        // options.yAxis[0].axisLabel.fontSize = 10;

        options.series[0].barWidth = 8;
        options.series[0].itemStyle.borderRadius = 10;
        options.series[0].itemStyle.color = genGradient([
          [0, curColor[0]],
          [1, curColor[1]],
        ]);
      }

      return options;
    },
  },
};
</script>

<style lang="less" scoped>
:deep(.kpiChart) {
  &-main {
    height: 180px !important;
  }
}
</style>
