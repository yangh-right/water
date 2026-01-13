<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-24 09:43:52
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ renamePoint }}</div>
      <div class="form-item">
        <!-- <w-icon type="download" class="form-item__icon"></w-icon> -->
      </div>
    </div>
    <div class="chart-wrapper">
      <line-chart :option="option" :darkTheme="'light'" ref="inChart1"></line-chart>
    </div>
  </div>
</template>
<script>
import { inWaterOption } from './options';
import { runTypeList } from './options';
const typeMap = {};
runTypeList.forEach(item => {
  typeMap[item.value] = item.name;
});
import cloneDeep from 'lodash.clonedeep';
const ThemeColor = {
  red: 'rgb(206, 76, 28)',
  green: 'rgb(0, 133, 131)',
  default: '#4285F4'
};
export default {
  name: 'ChartItem',
  inject: ['state'],
  props: {
    config: {
      type: Object,
      default: () => ({})
    },
    initOption: {
      type: Object,
      default: () => inWaterOption
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      option: cloneDeep(this.initOption)
    };
  },
  computed: {
    themeColor() {
      return ThemeColor[this.state.theme] || ThemeColor.default;
    },
    renamePoint() {
      return this.config.title === 'NH3-N' || this.config.title === 'NH3N'
        ? 'NH₃-N'
        : this.config.title;
    }
  },
  watch: {
    config: {
      handler(val) {
        this.getPointData();
      },
      immediate: true,
      deep: true
    },
    themeColor: {
      handler(val) {
        if (Object.keys(this.option).length) {
          this.getPointData();
        }
      }
    }
  },
  created() {},

  methods: {
    async getPointData() {
      // 根据 isReverse 配置更新坐标轴
      this.updateAxes();

      // 初始化 series 数据
      this.option.series = [];
      this.config.data?.forEach((item, i) => {
        this.option.series[i] = this.createSeriesItem(item, i);
      });

      // 如果 isReverse 为 true，反转 series 数据
      if (this.config.isReverse) {
        this.reverseSeriesData();
      }

      // 设置主题颜色
      this.option.grid = [
        {
          left: '35px',
          right: '12px',
          top: '40px',
          bottom: '12px',
          containLabel: true
        }
      ];
      this.option.color[0] = this.themeColor;
      this.option.yAxis[0].name = 'mg/L';
      this.option.yAxis[0].nameTextStyle = {
        color: '#00000073',
        align: 'right'
      };
    },

    // 更新坐标轴配置
    updateAxes() {
      if (this.config.isReverse) {
        this.option.xAxis[0].type = 'value';
        this.option.yAxis[0].type = 'category';
        const xList = this.config.data?.[0]?.xList || [];
        this.option.yAxis[0].data = [...xList].reverse();
        this.option.yAxis[0].axisLabel = this.config.axisLabel || {};
      } else {
        this.option.xAxis[0].data = this.config.data?.[0]?.xList || [];
        this.option.xAxis[0].axisLabel = this.config.axisLabel || {};
      }
    },

    // 创建 series 项
    createSeriesItem(item, i) {
      const { yList } = item || {};
      const seriesConfig = this.config?.seriesConfig?.[i] || {};

      const data = (yList || []).map(subItem => {
        if (subItem === '' || subItem === null) return null;
        return Array.isArray(subItem) ? subItem : Number(subItem);
      });

      return {
        type: 'line',
        smooth: true,
        ...seriesConfig,
        data,
        name: this.config.legend[i]
      };
    },

    // 反转 series 数据
    reverseSeriesData() {
      this.option.series.forEach(item => {
        item.data.reverse();
      });
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  background: var(--supply-color-bg-card-component);
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 45px;
  }
  &-title {
    font-size: 16px;
    color: var(--supply-color-secondary);
    letter-spacing: 0;
  }
  .form-item {
    margin-top: 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .select-item {
    }
    &__icon {
      cursor: pointer;
      position: relative;
      font-size: 20px;
      margin: 0 0 0 12px;
      color: #c0c0c0;
    }
  }
  .tabs {
    padding: 0 20px;
    margin-top: 8px;
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

  .chart-wrapper {
    height: calc(100% - 45px);
    width: 100%;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
