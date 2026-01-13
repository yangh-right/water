<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 10:17:56
 * @Description:
-->
<template>
  <card-box :title="toolConfig.addTitle">
    <div class="supply-mr-2" slot="titleRight">
      <w-button
        v-if="toolConfig.showTitleRadio"
        type="primary"
        size="small"
        @click.native="toPredict"
        >智能除磷</w-button
      >
      <return-control :is-drill-down="true" size="small"></return-control>
    </div>
    <div class="supply-w-full supply-h-full" :id="loadId">
      <w-radio-group class="supply-mt-1.5 circle-radio" v-model="pointCode">
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
import { carbonDosageOption as option } from './data';
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
      pointList: [
        { label: '日', value: 'day', unit: 'L/h' },
        { label: '月', value: 'month', unit: 'L/h' }
      ],
      option
    };
  },
  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },
  computed: {
    loadId() {
      return this.toolConfig.loadId + 'Dosing';
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        this.getData();
      },
      immediate: true
    },
    pointCode: {
      handler(val) {
        this.$bus.$emit(this.toolConfig.dosingBus, val);
        this.getData(true);
      }
    }
  },
  activated() {
    this.option.series[0].data = [];
    this.getData();
  },
  methods: {
    async getData(showLoad = false) {
      if (!this.waterPlantId) return;
      let params = {
        end: this.$moment().format('YYYY-MM-DD HH:00:00'),
        start: this.$moment()
          .subtract(1, this.pointCode + 's')
          .format('YYYY-MM-DD 08:00:00'),
        queryType: this.pointCode,
        waterPlantId: this.waterPlantId
      };
      if (showLoad) {
        this.globalLoading.show({ domId: this.loadId });
      }
      const { resultData, status } = (await this.toolConfig?.addListApi(params)) || {};
      if (status === 'complete') {
        const curDateType = this.pointList.find(item => item.value === this.pointCode);
        const data = resultData?.[0]?.medicateEntryTimeDataList || [];
        let xData = data?.map(item => item.dateTime) || [];
        let yData = data?.map(item => item.realPv) || [];
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
        this.option.yAxis[0].name = curDateType.unit;
      }
      if (showLoad) {
        this.globalLoading.hide({ domId: this.loadId });
      }
    },
    toPredict() {
      this.drillDown({
        path: '/debugTool/delPDosing',
        query: {}
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';

.chart-wrapper {
  height: calc(100% - 34px);
}
</style>
