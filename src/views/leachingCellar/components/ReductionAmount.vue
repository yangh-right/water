<!--
 * @Author: wangyr
 * @Date: 2023-06-15 15:56:01
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-16 08:54:11
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle" :title="title">
    <div class="content">
      <div class="tabs-box">
        <div class="tabs">
          <div
            v-for="item in displayedPoints"
            :key="item.pointName"
            :class="currentPoint === item.pointName ? 'tab active' : 'tab'"
            @click="handleChange(item)"
          >
            {{ item.pointMemo }}
          </div>
        </div>
        <w-dropdown v-if="pointsArr.length > pageSize" style="line-height: normal;">
          <a class="ant-dropdown-link" @click="e => e.preventDefault()">
            更多<w-icon type="right" />
          </a>
          <w-menu slot="overlay" @click="handleMenuClick">
            <w-menu-item key="1" v-for="i in menuPoints" :key="i.pointName">
              {{ i.pointMemo }}
            </w-menu-item>
          </w-menu>
        </w-dropdown>
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
const dateList = [
  '0:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '24:00'
];

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
  data() {
    return {
      cardTitle: '污染物削减量(T/D)',
      title: '污染物削减量 = 处理水量 × (进水浓度 - 出水浓度)',
      barOption: {
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
          trigger: 'axis'
        },
        xAxis: [
          {
            data: dateList
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
      currentPoint: '',
      pageSize: 99, //显示多少tab
      displayedPoints: [], //显示部分
      menuPoints: [], //更多下拉
      isLoading: false,
      pointsArr: []
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        if (!!val) {
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
    handleMenuClick(e) {
      let indexId = 0;
      let data = {};
      this.pointsArr.map((item, index) => {
        if (item.pointName === e.key) {
          indexId = index;
          data = { ...item };
        }
      });
      [this.pointsArr[this.pageSize - 1], this.pointsArr[indexId]] = [
        this.pointsArr[indexId],
        this.pointsArr[this.pageSize - 1]
      ];
      this.displayedPoints = this.pointsArr.slice(0, this.pageSize);
      this.menuPoints = this.pointsArr.slice(this.pageSize);
      this.handleChange(data);
    },
    async initData(id) {
      this.isLoading = true;
      let { status, resultData } = await pollutantReduction(id);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        this.pointsArr = resultData;
        this.displayedPoints = this.pointsArr?.slice(0, this.pageSize);
        this.menuPoints =
          this.pointsArr.length > this.pageSize ? this.pointsArr.slice(this.pageSize) : [];
        this.handleChange(this.pointsArr[0]);
      }
      this.isLoading = false;
    },
    handleChange(item) {
      this.currentPoint = item.pointName;
      this.handleChart(item);
    },
    handleChart(pointData) {
      let { unit, dataAndTimeList = [] } = pointData;
      let valueList = dataAndTimeList.map(item => item.pv.toFixed(2));
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
  .tabs-box {
    display: flex;
    margin-top: 8px;
    justify-content: flex-start;
    align-items: center;
    .tabs {
      display: flex;
      justify-content: flex-start;
      align-items: center;
      cursor: pointer;
      .tab {
        height: 24px;
        line-height: 24px;
        margin-right: 8px;
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 0 4px;
        background: var(--supply-rgb-color-bg-DEFAULT);
        border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
        color: var(--supply-color-secondary);
        border-radius: 12px;
        font-size: 14px;
      }
      .active {
        color: var(--supply-color-online);
      }
    }
  }
  .ant-dropdown-link:hover {
    color: var(--supply-color-primary-DEFAULT);
    opacity: 0.7;
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
