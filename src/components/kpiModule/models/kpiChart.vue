<template>
  <chart-box :module-data="moduleData" show-title>
    <custom-chart v-bind="chartConfig" :chart-data="moduleData" />
  </chart-box>
</template>

<script>
const chartConfigMap = {
  23: { type: 'donut', style: 2 },
  27: { type: 'rose', style: 2 },
  31: { type: 'bar', style: 2 },
  32: { type: 'bar', style: 2 },
  33: { type: 'bar', style: 2 },
  41: { type: 'line', style: 2 },
  45: { type: 'reverseBar', style: { 1: 3, 2: 4, 3: 5 } },
  51: { type: 'lineArea', style: 2 },
};

export default {
  name: 'KpiChart',
  components: {
    ChartBox: () => import('./chartBox.vue'),
    CustomChart: () => import('@/components/customChart/index.vue'),
  },
  props: {
    moduleData: Object,
  },
  data() {
    return {};
  },
  computed: {
    chartConfig() {
      const { showType, echartColor } = this.moduleData?.block ?? {};

      if (showType) {
        const config = chartConfigMap[showType];
        if (config) {
          let _config = { chartType: config.type, chartStyle: config.style };

          if (typeof config.style === 'object') {
            _config.chartStyle = _config.chartStyle[echartColor];
          }

          return _config;
        }
      }
      return null;
    },
  },
};
</script>
