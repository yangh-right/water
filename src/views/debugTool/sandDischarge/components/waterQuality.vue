<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-20 10:33:06
 * @Description:
-->
<template>
  <card-box title="曝气沉砂池称重">
    <line-chart :option="option"></line-chart>
  </card-box>
</template>

<script>
import { getHistoryResultList } from '@/api/analysis.js';
import moment from 'moment';
import { genWaterQualityOption } from './data';
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
    },
    bucketList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      option: genWaterQualityOption({
        xAxisRotate: 40,
        xAxisLabelFormat: value => {
          return value && value.length > 5 ? value?.slice(5, 10) : value;
        }
      })
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
      // 获取当前桶信息并处理空值
      const currentBucket = this.bucketList.find(v => v.id === this.bucketId) || {};
      const { deviceId = '', pointName = '' } = currentBucket;

      // 计算时间范围
      const endTime = moment().format('YYYY-MM-DD HH:mm:ss');
      const startTime = moment()
        .subtract(1, 'months')
        .format('YYYY-MM-DD HH:mm:ss');

      // 组织请求参数
      const params = {
        waterPlantId: this.waterPlantId,
        startTime,
        endTime,
        timeEnum: 'DAYS',
        devicePoints: [
          {
            deviceId,
            points: [pointName]
          }
        ]
      };
      const { resultData, status } = await getHistoryResultList(params);
      if (status === 'complete' && Array.isArray(resultData) && resultData?.length) {
        let xData = resultData.map(timeItem => moment(timeItem.dateTime).format('YYYY-MM-DD'));
        let seriesData = resultData.map(timeItem => timeItem.pv);

        this.option.yAxis[0].name = 'kg';
        this.option.xAxis[0].data = xData;
        this.option.series[0].data = seriesData;
      }
    }
  }
};
</script>
<style lang="less" scoped></style>
