<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-15 11:17:03
 * @Description:
-->
<template>
  <div class="supply-h-full">
    <div class="title">
      <div class="title__text">进水</div>
    </div>
    <w-radio-group class="circle-radio" v-model="pointCode">
      <w-radio-button v-for="(item, index) in pointList" :key="item.value" :value="item.value">
        {{ item.label }}
      </w-radio-button>
    </w-radio-group>
    <div class="chart-wrapper">
      <line-chart :option="option"></line-chart>
    </div>
  </div>
</template>

<script>
import { genInWaterOption } from './data';
import CardBox from '@/components/CardBox';
export default {
  inject: ['toolConfig'],
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      pointCode: '',
      option: genInWaterOption(),
      pointList: []
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
      let params = {
        endDateTime: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        startDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00'),
        waterPlantId: this.waterPlantId
      };
      const { resultData, status } = (await this.toolConfig?.inWaterApi(params)) || {};
      if (status === 'complete') {
        this.pointList =
          resultData?.map(item => {
            let xData = item.timeDataList?.map(data => `${data.dateTimeStr}:00`);
            let yData = item.timeDataList?.map(data => data.historyPointValue);
            let option = genInWaterOption({
              xData,
              yData,
              yAxisName: item.pointUnit,
              xAxisRotate: 40
            });
            let isNoData = yData?.some(data => data != null);
            if (!isNoData) {
              option.yAxis[0].min = 0;
              option.yAxis[0].max = 5;
            } else {
              delete option.yAxis[0].min;
              delete option.yAxis[0].max;
            }
            return {
              value: item.pointName,
              label: item.pointMemo,
              option
            };
          }) || [];
        this.option = this.pointList?.[0]?.option || genInWaterOption();
        this.pointCode = this.pointList?.[0]?.value || '';
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';

.title {
  margin-left: 12px;
  &__text {
    font-weight: 400;
    font-size: 16px;
    line-height: 22px;
    color: var(--supply-color-deviate);
  }
  margin-bottom: 6px;
}
.chart-wrapper {
  height: calc(100% - 60px);
}
</style>
