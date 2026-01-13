<template>
  <chart-box :module-data="moduleData">
    <chart chart-type="progress" :data="moduleData" :optionsHandler="handleOptions" />
  </chart-box>
</template>

<script>
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
      // const lightTheme = theme === 'light';

      // if (options) {
      //   options.grid.left = 10;
      //   options.grid.right = 20;
      //   options.grid.top = 5;
      //   options.grid.bottom = 30;
      //   options.legend.bottom = 0;
      //   // options.legend.textStyle = { fontSize: 10 };
      //   // options.xAxis[0].axisLabel.fontSize = 10;
      //   // options.yAxis[0].axisLabel.fontSize = 10;

      //   options.series[0].barWidth = 8;
      //   options.series[0].itemStyle.borderRadius = 10;
      //   options.series[0].itemStyle.color = genGradient([
      //     [0, lightTheme ? '#877AFF' : '#503EFF'],
      //     [1, lightTheme ? '#CDB9FF' : '#8F62FF'],
      //   ]);
      // }

      return options;
    },
  },
};
</script>

<style lang="less" scoped>
// :deep(.kpiChart) {
//   &-main {
//     height: 180px !important;
//   }
// }
</style>
