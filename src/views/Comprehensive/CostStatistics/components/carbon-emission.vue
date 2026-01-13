<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-22 10:18:30
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div class="card-inner">
          <bar-chart
            v-if="dataEchart.length > 0"
            :darkTheme="'light'"
            :option="barOption"
            ref="barChart"
          ></bar-chart>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { waterOption } from './options';
export default {
  name: 'CarbonEmission',
  props: {
    title: {
      type: String,
      default: ''
    },
    strChar: {
      type: String,
      required: true,
      default: ''
    },
    strUnit: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    dataEchart: {
      type: Array,
      default: () => []
    }
  },
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  inject: ['state'],
  data() {
    return {
      barOption: this.initChartOptions()
    };
  },
  watch: {
    dataEchart: {
      handler(val) {
        if (Array.isArray(val) && val.length) {
          this.getPointList(val);
        }
      },
      immediate: true
    }
  },
  methods: {
    initChartOptions() {
      return JSON.parse(JSON.stringify(waterOption(this.state.theme)));
    },
    async getPointList(val) {
      if (!Array.isArray(val) || !val.length) return;
      let dataTime = [],
        flowPvList = [];
      val.forEach(item => {
        dataTime.push(item.date);
        flowPvList.push(item[this.strChar]);
      });
      this.barOption.xAxis[0].axisLabel = {
        formatter: value => {
          return value && value.length > 5 ? value?.slice(5, 10) : value;
        }
      };
      this.barOption.yAxis[0].name = this.strUnit;
      this.barOption.xAxis[0].data = dataTime;
      this.barOption.series[0].name = this.title;
      this.barOption.series[0].data = flowPvList;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .spin {
    height: calc(100% - 40px);
  }

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }
  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
