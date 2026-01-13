<template>
  <chart-box :module-data="moduleData" show-title>
    <chart chart-type="rose" :data="moduleData" :optionsHandler="handleOptions" />
  </chart-box>
</template>

<script>
import { merge } from 'lodash-es';

export default {
  name: 'KpiRoseChart',
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
      const lightTheme = theme === 'light';

      if (options) {
        const custom = {
          legend: {
            orient: 'horizontal',
            top: 'auto',
            bottom: 0,
            left: 'center',
            right: 'auto',
            textStyle: { fontSize: 10 },
          },
          series: {
            center: ['50%', '45%'],
            radius: ['20%', '70%'],
          },
        };

        merge(options, custom);
      }

      return options;
    },
  },
};
</script>

<style lang="less" scoped>
:deep(.kpiChart) {
  &-main {
    height: 140px !important;
  }
}
</style>
