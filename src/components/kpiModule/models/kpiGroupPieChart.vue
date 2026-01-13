<template>
  <div class="kpiChart">
    <w-radio-group v-model="curTab" size="small">
      <w-radio-button v-for="tab in tabs" :key="tab.value" :value="tab.value">{{
        tab.label
      }}</w-radio-button>
    </w-radio-group>
    <div class="kpiChart-main">
      <chart chart-type="hollowCake" :data="data" :optionsHandler="handleOptions" />
    </div>
  </div>
</template>

<script>
import { merge } from 'lodash-es';

export default {
  name: 'KpiGroupPieChart',
  components: {
    Chart: () => import('@/components/echarts/index.vue')
  },
  props: {
    moduleData: Object
  },
  data() {
    return {
      tabs: [],
      curTab: null
    };
  },
  computed: {
    block() {
      return this.moduleData.block ?? {};
    },
    data() {
      const { manyIndicatorUniversalVOS } = this.moduleData;
      return manyIndicatorUniversalVOS?.[this.curTab];
    }
  },
  watch: {
    moduleData: {
      immediate: true,
      handler: 'initData'
    }
  },
  methods: {
    /**
     * @description: 初始化数据
     * @return {*}
     */
    initData() {
      const { columns } = this.moduleData;
      this.tabs = columns.map((v, i) => ({ label: v.title, value: i }));
      this.curTab = this.tabs?.[0]?.value;
    },

    /**
     * @description: 处理图表配置
     * @param {*} options
     * @return {*}
     */
    handleOptions(options, { theme }) {
      // const lightTheme = theme === 'light';
      const { echartColor } = this.block;

      if (options) {
        const color = {
          1: ['#3E7FFF', '#56CFA2', '#596C8F', '#EAB519', '#4E3AFF'],
          2: ['#0094FF', '#00DBD2', '#007CB2']
        };

        const custom = {
          color: color[echartColor],
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
.kpiChart {
  display: flex;
  flex-direction: column;
  grid-column: 1 / span 2;
  align-items: center;
  padding: 4px 4px 0;

  :deep(.wpg-radio) {
    &-button-wrapper {
      min-width: 74px;
      font-size: 14px;
      text-align: center;
    }
  }

  &-main {
    width: 100%;
    height: 140px;
  }
}
</style>
