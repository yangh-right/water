<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 09:58:31
 * @Description:
-->
<template>
  <div class="supply-h-full">
    <w-radio-group
      class="supply-mt-1.5 circle-radio"
      v-model="pointCode"
      @change="handlePointRateCode"
    >
      <w-radio-button v-for="(item, index) in pointList" :key="item.value" :value="item.value">
        {{ item.label }}
      </w-radio-button>
    </w-radio-group>
    <div class="chart-wrapper">
      <line-chart :option="option"></line-chart>
    </div>
    <!-- <div class="suggest" :title="'如按照建议排泥，当月可实现污泥减量' + subtractTotal + 't'">
      如按照建议排泥，当月可实现污泥减量{{ subtractTotal }}t
    </div> -->
  </div>
</template>

<script>
import { effectEvaluationOption } from './data';
export default {
  props: {
    chemicalSludgeRate: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      pointCode: '1',
      pointList: [
        { label: '月', value: '1' },
        { label: '日', value: '2' }
      ],
      subtractTotal: '--',
      option: effectEvaluationOption()
    };
  },
  components: { LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    chemicalSludgeRate: {
      handler() {
        if (this.chemicalSludgeRate.length > 0) {
          this.handleChartData();
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleChartData() {
      let xData = this.chemicalSludgeRate?.map(data => {
        return this.pointCode === '1' ? data.dateTime.slice(0, 11) : data.dateTime;
      });
      let yData1 = this.chemicalSludgeRate?.map(data => data.errorPv);
      let yData2 = this.chemicalSludgeRate?.map(data => data.realPv);
      let yData3 = this.chemicalSludgeRate?.map(data => data.predictPv);
      let option = effectEvaluationOption({
        xData,
        yData1,
        yData2,
        yData3,
        xAxisRotate: 40,
        xAxisLabelFormat: value => {
          return value && value.length > 10
            ? this.pointCode === '1'
              ? value?.slice(5, 10)
              : value?.slice(11, 16)
            : value;
        },
        yAxisName: 't'
      });
      this.subtractTotal = this.chemicalSludgeRate.totalSubtractValue ?? '--';
      let isNoData = !option?.series?.some(item => item?.data?.some(data => data != null));
      if (isNoData) {
        option.yAxis[0].min = 0;
        option.yAxis[0].max = 5;
      } else {
        delete option.yAxis[0].min;
        delete option.yAxis[0].max;
      }
      this.option = option || {};
    },
    handlePointRateCode() {
      this.$emit('handlePointRateCode', this.pointCode);
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';

.supply-h-full {
  height: 100%;
  padding: 6px 0;
  box-sizing: border-box;
}
.chart-wrapper {
  height: calc(100% - 32px);
}
.suggest {
  height: 24px;
  line-height: 24px;
  margin: 0 12px;
  background-color: var(--supply-color-bg-card-dark);
  padding: 0 6px;
  font-weight: 400;
  font-size: 14px;
  color: var(--supply-color-secondary);
  letter-spacing: 0;
  text-align: center;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.type {
  /deep/ .wpg-radio-group {
    .wpg-radio-wrapper {
      color: #f1f8ff;
    }
    .wpg-radio-button-wrapper:not(:first-child)::before {
      display: none;
    }
    .wpg-radio-button-wrapper {
      color: #90a6bd;
      padding: 7px 18px !important;
      height: 34px;
      position: relative;
      font-size: 14px;
      padding-top: 10px;
      font-weight: 400;
      line-height: 20px;
      border-radius: 0;
      border-color: #145494;
      border: 1px solid #145494;
      background: url('~@/assets/images/modules/discharge/tab1.png') no-repeat;
      background-size: 100% 100%;
      box-shadow: none !important;
      &.wpg-radio-button-wrapper-checked {
        color: #f6fbff;
        border-color: #145494;
        font-weight: 700;
        border: 1px solid #145494;
        background: url('~@/assets/images/modules/discharge/tab1_select.png') no-repeat;
        background-size: 100% 100%;
        box-shadow: none !important;
      }
    }
    .wpg-radio-inner {
      background: unset;
    }
  }
}
</style>
