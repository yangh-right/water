<!--
 * @Author: wangyr
 * @Date: 2023-09-04 14:29:16
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-21 17:03:28
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle" :showTime="false">
    <div class="card-inner">
      <div class="echart-block">
        <line-chart
          :darkTheme="'light'"
          powerType="powerSupply"
          :option="option"
          ref="inChart"
        ></line-chart>
      </div>
    </div>
  </cockpit-card>
</template>

<script>
import * as echarts from 'echarts';
import { getEnergyDayData } from '@/api/analysis.js';
export default {
  name: 'DevicePowerAlasysis',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
    CockpitCard: () => import('./CockpitCard.vue')
  },
  props: {
    factoryId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      cardTitle: '污水处理量分析',
      option: {}
    };
  },
  watch: {
    factoryId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.initData();
        }
      }
    }
  },
  methods: {
    async initData() {
      let params = {
        dateType: 'day',
        statType: 0,
        deviceIdList: [],
        waterPlantId: this.factoryId,
        startDate: this.$moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        endDate: this.$moment()
          .endOf('month')
          .format('YYYY-MM-DD')
      };
      const { status, resultData } = await getEnergyDayData(params);
      if (status === 'complete') {
        this.initChart(resultData);
      }
    },
    initChart(val) {
      let xAxisData = val.map(item => item.date.slice(-2));
      let seriesData = val.map(item => item.flowPv);
      let option = {
        color: ['#77BBFA'],
        grid: [
          {
            left: '3%',
            right: '3%',
            top: '22%',
            bottom: '10%'
          }
        ],
        legend: {
          show: false,
          top: 'bottom',
          icon: 'rect',
          itemHeight: 2,
          itemWidth: 12
        },
        tooltip: {
          confine: true,
          trigger: 'axis'
        },
        xAxis: [
          {
            data: xAxisData
          }
        ],
        yAxis: [
          {
            name: '吨',
            nameTextStyle: {
              color: '#00000073',
              align: 'right'
            },
            type: 'value',
            axisTick: { show: false },
            axisLabel: {
              show: true,
              interval: 0,
              formatter: '{value}'
            },
            axisLine: { show: true, lineStyle: { color: '#dddddd' } },
            splitLine: { lineStyle: { type: 'dashed', color: '#eeeeee' } }
          }
        ],
        series: [
          {
            name: '污水处理量',
            type: 'line',
            z: 3,
            showSymbol: false,
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: this.colorRgb('#77BBFA', 0.7) },
                { offset: 1, color: this.colorRgb('#77BBFA', 0.1) }
              ])
            },
            data: seriesData
          }
        ]
      };
      this.option = option;
    },
    colorRgb(str, opacity) {
      let sColor = str.toLowerCase();
      if (sColor) {
        if (sColor.length === 4) {
          let sColorNew = '#';
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
        }
        return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
      } else {
        return sColor;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  display: flex;
  justify-content: space-between;

  .echart-block {
    width: 100%;
    height: 100%;
    text-align: center;
  }
}
</style>
