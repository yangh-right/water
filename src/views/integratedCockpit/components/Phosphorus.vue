<!--
 * @Author: wangyr
 * @Date: 2023-06-15 15:56:01
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-15 11:46:26
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        ref="inChart"
      ></line-chart>
      <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
    </div>
  </cockpit-card>
</template>

<script>
import * as echarts from 'echarts';
import CockpitCard from './CockpitCard.vue';
import { totalPhosphorus } from '@/api/cockpit.js';
export default {
  name: 'Phosphorus',
  components: {
    CockpitCard,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  props: {
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      cardTitle: '总磷控制曲线',
      barOption: {
        color: ['#3EFBFF', '#1D7BFF', '#FFD23D', '#CF48F7', '#FF4F3D'],
        grid: [
          {
            left: '3%',
            right: '3%',
            top: '18%',
            bottom: '12%'
          }
        ],
        legend: {
          top: 'top',
          left: 'right',
          itemHeight: 2,
          itemWidth: 12,
          icon: 'rect',
          textStyle: {
            fontSize: '12px',
            color: '#D8ECFF'
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            axisLabel: {
              color: '#8C99A6'
            },
            axisLine: {
              show: true,
              lineStyle: {
                color: '#354050'
              }
            },
            data: []
          }
        ],
        yAxis: [
          {
            name: '',
            splitLine: {
              lineStyle: {
                type: 'dashed',
                color: '#141618'
              }
            },
            axisLabel: {
              color: '#8C99A6'
            },
            nameTextStyle: {
              align: 'right',
              color: '#8C99A6'
            }
          }
        ],
        series: [
          {
            name: '实时值',
            type: 'line',
            showSymbol: false,
            data: [],
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: this.colorRgb('#77BBFA', 0.7) },
                { offset: 1, color: this.colorRgb('#77BBFA', 0.1) }
              ])
            }
          },
          {
            name: '预测值',
            type: 'line',
            showSymbol: false,
            data: [],
            smooth: true
          },
          {
            name: '1级',
            type: 'line',
            showSymbol: false,
            data: [
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5
            ],
            smooth: true,
            lineStyle: {
              type: 'dashed',
              width: 1
            }
          }
        ]
      },
      isLoading: false
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        if (val) {
          this.initData(val);
        }
      }
    }
  },
  activated() {
    if (this.factoryId) {
      this.initData(this.factoryId);
    }
  },
  methods: {
    async initData(id) {
      this.isLoading = true;
      let { status, resultData } = await totalPhosphorus(id);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        let { unit, dataAndTimeList } = resultData[0];
        let dateList = dataAndTimeList.map(item => item.date?.slice(11, 16));
        let valueList = dataAndTimeList.map(item => item.pv);
        let simulatePvList = dataAndTimeList.map(item => item.simulatePv);
        this.barOption.yAxis[0].name = unit;
        this.barOption.xAxis[0].data = dateList;
        this.barOption.series[0].data = valueList;
        this.barOption.series[1].data = simulatePvList;
      }
      this.isLoading = false;
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
.content {
  width: 100%;
  height: 100%;
  position: relative;
  .chart-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
}
</style>
