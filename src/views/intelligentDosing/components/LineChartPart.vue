<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-10 11:20:29
-->
<template>
  <div class="content">
    <div class="content-title">{{ title }}</div>
    <div v-if="tabs.length" class="tabs">
      <div
        v-for="item in tabs"
        :key="item.pointName"
        :class="currentParams === item.pointMemo ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper" :style="{ height: tabs.length ? '170px' : '200px' }">
        <line-chart v-if="flag" :darkTheme="'light'" :option="options" ref="inChart1"></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
export default {
  name: 'LineChartPart',
  props: {
    options: {
      type: Object,
      default: () => {}
    },
    tabs: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: true
    },
    title: {
      type: String,
      default: ''
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  computed: {
    flag() {
      return this.options.series[0].data.length;
    }
  },
  watch: {
    'tabs.length'(val) {
      this.currentParams = val ? this.tabs[0].pointMemo : '';
    }
  },
  data() {
    return {
      currentParams: '',
      dataList: []
    };
  },
  methods: {
    paramsChange(data) {
      this.currentParams = data.pointMemo;
      this.$emit('paramsChange', { type: this.title, value: this.currentParams });
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  margin-bottom: 12px;
  width: calc(50% - 5px);
  height: 240px;
  background-color: var(--supply-color-bg-card-component);
  &-title {
    padding: 15px 12px 10px;
    font-weight: 600;
    font-size: 16px;
    color: #333333;
    letter-spacing: 0;
  }
  .tabs {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      margin-left: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4px 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 13px;
      font-size: 14px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .spin {
    height: calc(100% - 80px);
  }
  .chart-wrapper {
    padding: 10px 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
