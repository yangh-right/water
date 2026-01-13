<!--
 * @Author: wangyr
 * @Date: 2023-03-22 09:37:04
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-03-22 10:20:09
 * @Description:
-->
<template>
  <chart-box :module-data="moduleData" show-title>
    <chart chart-type="hollowCake" :data="moduleData" :optionsHandler="handleOptions" />
  </chart-box>
</template>

<script>
import { merge } from 'lodash-es';

export default {
  name: 'KpiPieChart',
  components: {
    ChartBox: () => import('./chartBox.vue'),
    Chart: () => import('@/components/echarts/index.vue')
  },
  props: {
    moduleData: Object
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
      if (options) {
        const custom = {
          title: {
            top: '40%',
            left: '50%',
            itemGap: 4,
            text: '总',
            subtextStyle: {
              fontSize: 14,
              fontWeight: 'bold'
            }
          },
          legend: {
            orient: 'horizontal',
            top: 'auto',
            bottom: 0,
            left: 'center',
            right: 'auto',
            textStyle: { fontSize: 10 },
            pageTextStyle: {
              color: '#adb5bd'
            }
          },
          series: {
            center: ['50%', '45%'],
            radius: ['45%', '70%']
          }
        };

        merge(options, custom);
      }

      return options;
    }
  }
};
</script>

<style lang="less" scoped>
:deep(.kpiChart) {
  &-main {
    height: 140px !important;
  }
}
</style>
