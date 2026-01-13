<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-19 17:57:31
 * @Description:
-->
<template>
  <card-box title="建议投加预测值">
    <div class="supply-w-full supply-h-full" :id="loadId">
      <line-chart :option="option" :isClick="true" @myChartClick="myChartClick"></line-chart>
    </div>
  </card-box>
</template>

<script>
import { suggestPredictOption as option } from './data';
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
      pointCode: 'day',
      option
    };
  },
  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  computed: {
    loadId() {
      return this.toolConfig.loadId + 'Forecast';
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getData();
        }
      },
      immediate: true
    },
    pointCode: {
      handler(val) {
        this.getData(true);
      }
    }
  },
  created() {
    this.$bus.$on(this.toolConfig.dosingBus, res => {
      this.pointCode = res;
    });
  },
  destroyed() {
    this.$bus.$off([this.toolConfig.dosingBus]);
  },
  activated() {
    this.option.series[0].data = [];
    this.getData();
  },
  methods: {
    async getData(showLoad = false) {
      if (!this.waterPlantId) return;
      let params = {
        end: this.$moment()
          .add(1, 'days')
          .format('YYYY-MM-DD HH:00:00'),
        // start: this.$moment()
        //   .subtract(1, this.pointCode + 's')
        //   .format('YYYY-MM-DD HH:mm:ss'),
        queryType: this.pointCode,
        waterPlantId: this.waterPlantId
      };
      if (this.pointCode == 'day') {
        params['start'] = this.$moment().format('YYYY-MM-DD HH:00:00');
      } else {
        params['start'] = this.$moment()
          .subtract(1, this.pointCode + 's')
          .format('YYYY-MM-DD HH:00:00');
      }
      if (showLoad) {
        this.globalLoading.show({ domId: this.loadId });
      }
      const { resultData, status } = (await this.toolConfig?.addListApi(params)) || {};
      if (status === 'complete') {
        const data = resultData?.[0]?.medicateEntryTimeDataList || [];
        let xData = data?.map(item => item.dateTime) || [];
        let yData = data?.map(item => item.simulatePv) || [];
        let isNoData = !yData?.some(data => data != null);
        if (isNoData) {
          this.option.yAxis[0].min = 0;
          this.option.yAxis[0].max = 5;
        } else {
          delete this.option.yAxis[0].min;
          delete this.option.yAxis[0].max;
        }
        this.option.series[0].data = yData;
        this.option.xAxis[0].data = xData;
        this.option.yAxis[0].name = 'L/h';

        // 传递建议投加量
        this.$emit('suggestData', yData);
      }
      if (showLoad) {
        this.globalLoading.hide({ domId: this.loadId });
      }
    },
    myChartClick(xDataItem, yDataItem) {
      this.drillDown({
        path: '/runPredict/optimalDecision',
        query: {
          waterPlantId: this.waterPlantId,
          pointData: yDataItem,
          tabKey: 'runPredict'
        }
      });
    }
  }
};
</script>

<style lang="less" scoped></style>
