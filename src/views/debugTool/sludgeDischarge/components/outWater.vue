<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-31 09:52:37
 * @Description:
-->
<template>
  <div class="supply-h-full">
    <div class="chart-wrapper">
      <line-chart :option="option"></line-chart>
    </div>
  </div>
</template>

<script>
import { genOutWaterOption } from './data';
export default {
  inject: ['state'],
  props: {
    chemicalSludgeEntryData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      pointCode: '0',
      pointList: [
        { label: '年', value: '0' },
        { label: '月', value: '1' }
      ],
      option: genOutWaterOption()
    };
  },
  components: { LineChart: () => import('@/components/CardBox/chartBox.vue') },
  computed: {
    isDark() {
      return this.state.theme === 'dark';
    }
  },
  watch: {
    isDark() {
      this.setOptionColor();
    },
    option: {
      handler(val) {
        this.setOptionColor();
      }
    },
    chemicalSludgeEntryData: {
      handler() {
        if (this.chemicalSludgeEntryData.length > 0) {
          this.handleChartData();
        }
      },
      iimmediate: true,
      deep: true
    }
  },
  methods: {
    setOptionColor() {
      this.option.series[1].itemStyle.color = this.isDark ? 'rgba(0,63,119,1)' : '#fff';
    },
    handleChartData() {
      let xData = this.chemicalSludgeEntryData?.map(data => data.date.slice(-5));
      let yData = this.chemicalSludgeEntryData?.map(data => data.netWeight);
      let option = genOutWaterOption({
        xData,
        yData,
        xAxisRotate: 40,
        yAxisName: 't'
      });
      let isNoData = yData?.some(data => data != null);
      if (!isNoData) {
        option.yAxis[0].min = 0;
        option.yAxis[0].max = 5;
        option.series[0].showBackground = false;
      } else {
        delete option.yAxis[0].min;
        delete option.yAxis[0].max;
        option.series[0].showBackground = true;
      }
      this.option = option || {};
    },
    handlePointCode() {
      this.$emit('handlePointCode', this.pointCode);
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
  height: 100%;
}
</style>
