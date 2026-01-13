<template>
  <chart-box :module-data="moduleData" show-title>
    <chart chart-type="lineArea" :data="moduleData" :optionsHandler="handleOptions" />
  </chart-box>
</template>

<script>
export default {
  name: 'KpiLineAreaChart',
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
    handleOptions(options) {
      if (options) {
        options.grid.left = 10;
        options.grid.right = 10;
        options.grid.top = 15;
        options.grid.bottom = 25;
        options.legend.textStyle = { fontSize: 10 };
        options.legend.icon = 'rect';
        options.legend.itemWidth = 8;
        options.legend.itemHeight = 8;
        options.legend.pageIconSize = 8;
        options.legend.bottom = 0;
        options.xAxis[0].axisLabel.fontSize = 10;
        options.yAxis[0].axisLabel.fontSize = 10;
      }

      return options;
    },
  },
};
</script>

<style lang="less" scoped>
//...
</style>
