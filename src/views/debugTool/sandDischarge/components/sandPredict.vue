<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 11:34:08
 * @Description:
-->
<template>
  <card-box title="曝气沉砂池称重预测">
    <line-chart :option="option"></line-chart>
  </card-box>
</template>

<script>
import { sandPrediction } from '@/api/optimization';
import { sandPredictOption as option } from './data';
import moment from 'moment';
import CardBox from '@/components/CardBox';
export default {
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    bucketId: {
      type: String | Number,
      default: ''
    }
  },
  data() {
    return {
      option
    };
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  watch: {
    waterPlantId: {
      handler(val) {
        this.getData();
      }
    },
    bucketId: {
      handler(val) {
        this.getData();
      },
      immediate: true
    }
  },
  methods: {
    async getData() {
      if (!(this.waterPlantId && this.bucketId)) {
        let days = this.$moment()
          .endOf('month')
          .format('DD');
        let xData = [];
        let yData = [];
        for (let i = 1; i <= days; i++) {
          xData.push(i < 10 ? '0' + i : i);
          yData.push(null);
        }
        // this.option.yAxis[0].min = 0;
        // this.option.yAxis[0].max = 5;
        this.option.xAxis[0].data = xData;
        this.option.series[0].data = yData;
        return;
      }
      let params = {
        bucketId: this.bucketId,
        endTime: moment().format('YYYY-MM-DD HH:mm:ss'),
        startTime: moment()
          .subtract(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss'),
        waterPlantId: this.waterPlantId
      };
      const { resultData, status } = await sandPrediction(params);
      if (status === 'complete') {
        this.option.yAxis[0].name = 'kg';
        this.option.xAxis[0].data = resultData?.xAxis || [];
        this.option.series[0].data = resultData?.yAxis || [];
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
