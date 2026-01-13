<!--
 * @Author: wangyr
 * @Date: 2023-06-15 15:56:01
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-20 14:34:03
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle" :title="title">
    <div class="content">
      <div class="tabs">
        <w-radio-group v-model="currentPoint" @change="handleChange">
          <w-radio-button v-for="item in pointsArr" :key="item.pointName" :value="item.pointName">
            {{ item.pointMemo }}
          </w-radio-button>
        </w-radio-group>
      </div>
      <div class="chart-wrapper">
        <line-chart
          :darkTheme="'light'"
          powerType="powerSupply"
          :option="barOption"
          ref="inChart"
        ></line-chart>
      </div>
      <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
    </div>
  </cockpit-card>
</template>

<script>
import * as echarts from 'echarts';
import CockpitCard from './CockpitCard.vue';
import { pollutantReduction } from '@/api/cockpit.js';
export default {
  name: 'ReductionAmount',
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
  watch: {
    factoryId: {
      handler(val) {
        if (val) {
          this.initData(val);
        }
      }
    }
  },
  data() {
    return {
      cardTitle: '污染物削减量(T/D)',
      barOption: {
        color: ['#3EFBFF'],
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
            type: 'value',
            name: '%',
            splitLine: {
              lineStyle: {
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
            name: '削减量',
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
          }
        ]
      },
      pointsArr: [],
      currentPoint: '',
      color: '',
      isLoading: false,
      title: '污染物削减量 = 处理水量 × (进水浓度 - 出水浓度)'
    };
  },
  computed: {},
  activated() {
    if (this.factoryId) {
      this.initData(this.factoryId);
    }
  },
  methods: {
    async initData(id) {
      this.isLoading = true;
      let { status, resultData } = await pollutantReduction(id);
      this.isLoading = false;
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        this.pointsArr = resultData;
        this.currentPoint = this.pointsArr[0].pointName;
        this.handleChange(this.pointsArr[0]);
      }
      this.isLoading = false;
    },
    handleChange() {
      let pointObj = this.pointsArr.find(item => item.pointName === this.currentPoint);
      this.handleChart(pointObj);
    },
    handleChart(pointData) {
      let { dataAndTimeList = [] } = pointData;
      let valueList = dataAndTimeList.map(item => item.pv);
      this.barOption.xAxis[0].data = dataAndTimeList.map(item => item.date?.slice(11, 16));
      this.barOption.series[0].data = valueList;
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
  .tabs {
    margin-top: 6px;
    cursor: pointer;
  }
  .chart-wrapper {
    width: 100%;
    height: calc(100% - 24px);
  }
  .chart-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
}
</style>
