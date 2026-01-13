<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-20 10:33:06
 * @Description:
-->
<template>
  <card-box title="砂桶清运情况">
    <template #titleRight>
      <w-button type="primary" @click.native="toPredict">砂桶记录</w-button>
    </template>
    <line-chart :option="option"></line-chart>
  </card-box>
</template>

<script>
import { cleaningSituation } from '@/api/optimization.js';
import moment from 'moment';
import { sandBucketClearOption as option } from './data';
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
        waterPlantId: this.waterPlantId,
        bucketId: this.bucketId,
        startTime: moment()
          .subtract(1, 'months')
          .format('YYYY-MM-DD HH:mm:ss'),
        endTime: moment().format('YYYY-MM-DD HH:mm:ss')
      };
      const { resultData, status } = await cleaningSituation(params);
      if (status === 'complete' && !!resultData) {
        let { xAxis, yAxis } = resultData;
        let xData = xAxis.map(timeItem => moment(timeItem).format('YYYY-MM-DD'));
        this.option.xAxis[0].data = xData;
        this.option.series[0].data = yAxis;
      }
    },
    toPredict() {
      this.drillDown({
        path: '/sedimentRemovalArrange'
      });
    }
  }
};
</script>
<style lang="less" scoped></style>
