<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 15:19:36
 * @Description:
-->
<template>
  <card-box title="进水水量曲线">
    <div class="supply-h-full supply-pt-2.5">
      <w-radio-group class="circle-radio" v-model="pointCode">
        <w-radio-button v-for="(item, index) in pointList" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-radio-button>
      </w-radio-group>
      <div class="chart-wrapper">
        <line-chart :option="option"></line-chart>
      </div>
    </div>
  </card-box>
</template>

<script>
import { inComingWaterYield } from '@/api/optimization';
import { genWaterAmountOption } from './data';
import CardBox from '@/components/CardBox';
export default {
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pointCode: '',
      pointList: [],
      option: genWaterAmountOption()
    };
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    waterPlantId: {
      handler(val) {
        this.getData();
      },
      immediate: true
    },
    pointCode: {
      handler(val) {
        this.option = this.pointList.find(item => item.value === this.pointCode)?.option || {};
      }
    }
  },
  methods: {
    async getData() {
      if (!this.waterPlantId) return;
      const { resultData, status } = await inComingWaterYield(this.waterPlantId);
      if (status === 'complete') {
        this.pointList =
          resultData?.map(item => {
            let xData = item.dataAndTimeList?.map(data => data.date);
            let yData = item.dataAndTimeList?.map(data => data.pv);
            return {
              value: item.pointName,
              label: item.pointMemo,
              option: genWaterAmountOption({
                xData,
                yData,
                yAxisName: item.unit,
                xAxisRotate: 40,
                xAxisLabelFormat: value => {
                  return value?.slice(11, 16) ?? value;
                }
              })
            };
          }) || [];
        this.option = this.pointList?.[0]?.option || genWaterAmountOption();
        this.pointCode = this.pointList?.[0]?.value || '';
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';
.chart-wrapper {
  height: calc(100% - 26px);
}
</style>
