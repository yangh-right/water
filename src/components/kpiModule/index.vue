<!--
 * @Author: wangyr
 * @Date: 2023-02-17 16:56:12
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-02-23 09:22:17
 * @Description:
-->
<template>
  <component :is="cmp" v-if="cmp" :draggable="disabled" :module-data="moduleData" />
</template>

<script>
import KpiCard from './models/kpiCard.vue';
import KpiCard2 from './models/kpiCard2.vue';
import KpiCard3 from './models/kpiCard3.vue';
import KpiLineAreaChart from './models/kpiLineAreaChart.vue';
import KpiTable from './models/kpiTable.vue';
import KpiStackBarChart from './models/kpiStackBarChart.vue';
import KpiBarChart from './models/kpiBarChart.vue';
import KpiMixedChart from './models/kpiMixedChart.vue';
import KpiGroupPieChart from './models/kpiGroupPieChart.vue';
import KpiPieChart from './models/kpiPieChart.vue';
import KpiRoseChart from './models/kpiRoseChart.vue';
import KpiProgressChart from './models/kpiProgressChart.vue';
import KpiReverseStackBarChart from './models/kpiReverseStackBarChart.vue';

const GB = {
  moduleMap: {
    // 1/2指标卡：不展示下标
    1: 'KpiCard',
    // 1/2指标卡：展示下标
    2: 'KpiCard',
    4: 'KpiCard',
    // 指标卡
    3: 'KpiCard3',
    // 指标表格
    20: 'KpiTable',
    42: 'KpiTable',
    // 指标折线面积图
    41: 'KpiLineAreaChart',
    // 指标堆叠图
    45: 'KpiStackBarChart',
    47: 'KpiStackBarChart',
    // 指标柱状图
    31: 'KpiBarChart',
    32: 'KpiBarChart',
    33: 'KpiBarChart',
    // 指标混合图
    34: 'KpiMixedChart',
    // 指标分组饼图
    29: 'KpiGroupPieChart',
    // 指标饼图
    23: 'KpiPieChart',
    // 指标玫瑰图
    27: 'KpiRoseChart',
    // 指标反转堆叠柱状图
    35: 'KpiReverseStackBarChart',
  },
};

export default {
  name: 'KpiModule',
  components: {
    KpiCard,
    KpiCard2,
    KpiCard3,
    KpiTable,
    KpiLineAreaChart,
    KpiStackBarChart,
    KpiBarChart,
    KpiMixedChart,
    KpiGroupPieChart,
    KpiPieChart,
    KpiRoseChart,
    KpiProgressChart,
    KpiReverseStackBarChart,
  },
  inheritAttrs: false,
  props: {
    disabled: Boolean,
    moduleData: Object,
  },
  computed: {
    cmp() {
      return GB.moduleMap[this.moduleData?.block?.showType];
    },
  },
};
</script>
