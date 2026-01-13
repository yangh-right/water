<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 09:54:29
 * @Description:
-->
<template>
  <div class="supply-h-full">
    <w-radio-group class="circle-radio" v-model="mlssPlaceId">
      <w-radio-button v-for="item in placePoints" :key="item.id" :value="item.id">
        {{ item.name }}
      </w-radio-button>
    </w-radio-group>
    <div class="chart-wrapper">
      <line-chart :option="option"></line-chart>
    </div>
  </div>
</template>

<script>
import { carbonDosageOption } from './data';
export default {
  name: 'CarbonDosage',
  props: {
    placePoints: {
      type: Array,
      default: () => []
    },
    mlssSludgeDischargeData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      mlssPlaceId: '',
      option: carbonDosageOption()
    };
  },
  components: { LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    placePoints: {
      handler() {
        if (this.placePoints.length > 0) {
          this.mlssPlaceId = this.placePoints[0].id;
        }
      },
      iimmediate: true,
      deep: true
    },
    mlssSludgeDischargeData: {
      handler() {
        if (Object.keys(this.mlssSludgeDischargeData).length > 0) {
          this.handleChartData();
        }
      },
      iimmediate: true,
      deep: true
    }
  },
  methods: {
    handleChartData() {
      let xData = this.mlssSludgeDischargeData.timeDataList?.map(data => data.dateTimeStr);
      let yData = this.mlssSludgeDischargeData.timeDataList?.map(data => data.modelPointValue);
      let option = carbonDosageOption({
        xData,
        yData,
        xAxisRotate: 40,
        xAxisLabelFormat: value => {
          return value && value.length > 12 ? value?.slice(11, 16) : value;
        },
        yAxisName: this.mlssSludgeDischargeData.pointUnit ?? 'mg/L'
      });
      let isNoData = yData?.some(data => data != null);
      if (!isNoData) {
        option.yAxis[0].min = 0;
        option.yAxis[0].max = 5;
      } else {
        delete option.yAxis[0].min;
        delete option.yAxis[0].max;
      }
      this.option = option || {};
    },
    handleMlssPointCode() {
      this.$emit('handleMlssPointCode', this.mlssPlaceId);
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
  height: calc(100% - 30px);
}
</style>
