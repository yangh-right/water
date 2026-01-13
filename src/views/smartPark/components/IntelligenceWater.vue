<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:15
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-31 15:56:18
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="header">
        <div class="left">
          <div class="image"></div>
        </div>
        <div class="right">
          <w-row type="flex" :warp="true" align="middle">
            <w-col v-for="item in list" :key="item.label" :span="12">
              <div class="divice-tab">
                <div class="label">{{ item.label }}</div>
                <div class="value">
                  {{ item.value }}
                  <span class="unit">{{ item.unit }}</span>
                </div>
              </div>
            </w-col>
          </w-row>
        </div>
      </div>
      <div class="echart-block">
        <line-chart
          :darkTheme="'light'"
          powerType="powerSupply"
          :option="barOption"
          ref="inChart"
        ></line-chart>
      </div>
    </div>
  </bim-card>
</template>

<script>
import * as echarts from 'echarts';
import BimCard from './BimCard.vue';
const dateList = [
  '5.1',
  '5.4',
  '5.7',
  '5.10',
  '5.13',
  '5.16',
  '5.19',
  '5.22',
  '5.25',
  '5.28',
  '5.31'
];
export default {
  name: 'IntelligenceWater',
  components: {
    BimCard,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      cardTitle: '智能灌溉',
      currentPoint: 'jsc_COD',
      list: [
        {
          label: '今日回用水量',
          value: '120',
          unit: 'm³'
        },
        {
          label: '当月累计回用水量',
          value: '285',
          unit: 'm³'
        },
        {
          label: '灌溉点',
          value: '4',
          unit: '个'
        },
        {
          label: '回用水泵',
          value: '4',
          unit: '个'
        }
      ],
      pointsArr: [
        {
          cb: null,
          controlStandard: null,
          dataAndTimeList: [
            {
              date: '2023-05-30 00:00:00',
              pv: 210
            },
            {
              date: '2023-05-30 01:00:00',
              pv: 230
            },
            {
              date: '2023-05-30 02:00:00',
              pv: 240
            },
            {
              date: '2023-05-30 03:00:00',
              pv: 220
            },
            {
              date: '2023-05-30 04:00:00',
              pv: 260
            },
            {
              date: '2023-05-30 05:00:00',
              pv: 297
            },
            {
              date: '2023-05-30 06:00:00',
              pv: 302
            },
            {
              date: '2023-05-30 07:00:00',
              pv: 301
            },
            {
              date: '2023-05-30 08:00:00',
              pv: 300
            },
            {
              date: '2023-05-30 09:00:00',
              pv: 330
            }
          ],
          deviceId: 'yuexiuhycqdsb',
          gb: null,
          pointMemo: 'COD',
          pointName: 'jsc_COD',
          unit: 'm³'
        },
        {
          cb: null,
          controlStandard: null,
          dataAndTimeList: [
            {
              date: '2023-05-30 00:00:00',
              pv: 8,
              simulatePv: null
            },
            {
              date: '2023-05-30 01:00:00',
              pv: 6,
              simulatePv: null
            },
            {
              date: '2023-05-30 02:00:00',
              pv: 4,
              simulatePv: null
            },
            {
              date: '2023-05-30 03:00:00',
              pv: 2,
              simulatePv: null
            },
            {
              date: '2023-05-30 04:00:00',
              pv: 8,
              simulatePv: null
            },
            {
              date: '2023-05-30 05:00:00',
              pv: 2,
              simulatePv: null
            },
            {
              date: '2023-05-30 06:00:00',
              pv: 0,
              simulatePv: null
            },
            {
              date: '2023-05-30 07:00:00',
              pv: 4,
              simulatePv: null
            },
            {
              date: '2023-05-30 08:00:00',
              pv: 0,
              simulatePv: null
            },
            {
              date: '2023-05-30 09:00:00',
              pv: 3,
              simulatePv: null
            },
            {
              date: '2023-05-30 10:00:00',
              pv: 3,
              simulatePv: null
            },
            {
              date: '2023-05-30 11:00:00',
              pv: 9,
              simulatePv: null
            },
            {
              date: '2023-05-30 12:00:00',
              pv: 6,
              simulatePv: null
            },
            {
              date: '2023-05-30 13:00:00',
              pv: 1,
              simulatePv: null
            },
            {
              date: '2023-05-30 14:00:00',
              pv: 6,
              simulatePv: null
            },
            {
              date: '2023-05-30 15:00:00',
              pv: 6,
              simulatePv: null
            }
          ],
          deviceId: 'yuexiuhycqdsb',
          gb: null,
          pointMemo: 'NH3-N',
          pointName: 'NH3-N',
          unit: ''
        },
        {
          cb: null,
          controlStandard: null,
          dataAndTimeList: [
            {
              date: '2023-05-30 00:00:00',
              pv: 8,
              simulatePv: null
            },
            {
              date: '2023-05-30 01:00:00',
              pv: 5,
              simulatePv: null
            },
            {
              date: '2023-05-30 02:00:00',
              pv: 7,
              simulatePv: null
            },
            {
              date: '2023-05-30 03:00:00',
              pv: 7,
              simulatePv: null
            },
            {
              date: '2023-05-30 04:00:00',
              pv: 8,
              simulatePv: null
            },
            {
              date: '2023-05-30 05:00:00',
              pv: 2,
              simulatePv: null
            },
            {
              date: '2023-05-30 06:00:00',
              pv: 9,
              simulatePv: null
            },
            {
              date: '2023-05-30 07:00:00',
              pv: 7,
              simulatePv: null
            },
            {
              date: '2023-05-30 08:00:00',
              pv: 2,
              simulatePv: null
            },
            {
              date: '2023-05-30 09:00:00',
              pv: 7,
              simulatePv: null
            },
            {
              date: '2023-05-30 10:00:00',
              pv: 1,
              simulatePv: null
            },
            {
              date: '2023-05-30 11:00:00',
              pv: 2,
              simulatePv: null
            },
            {
              date: '2023-05-30 12:00:00',
              pv: 9,
              simulatePv: null
            },
            {
              date: '2023-05-30 13:00:00',
              pv: 2,
              simulatePv: null
            },
            {
              date: '2023-05-30 14:00:00',
              pv: 10,
              simulatePv: null
            },
            {
              date: '2023-05-30 15:00:00',
              pv: 4,
              simulatePv: null
            }
          ],
          deviceId: 'yuexiuhycqdsb',
          gb: null,
          pointMemo: 'TN',
          pointName: 'jsc_TN',
          unit: 'm³'
        }
      ],
      barOption: {
        color: ['#11b1f1'],
        grid: [
          {
            left: '0%',
            right: '0%',
            top: '5%',
            bottom: '5%',
            containLabel: true
          }
        ],
        legend: {
          show: false,
          left: 'right',
          top: 'top',
          icon: 'circle',
          itemWidth: 8,
          itemHeight: 8
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            data: dateList,
            axisLabel: {
              color: '#B9D8F6'
            }
          }
        ],
        yAxis: [
          {
            name: '',
            axisLabel: {
              color: '#B9D8F6'
            },
            nameTextStyle: {
              color: '#B9D8F6'
            },
            splitLine: {
              lineStyle: {
                type: 'dashed'
              },
              show: true
            },

            splitNumber: 3,
            show: true
          }
        ],
        series: [
          {
            type: 'line',
            showSymbol: false,
            data: [],
            symbol: 'circle', // 设置标记的图形为circle
            symbolSize: 6,
            itemStyle: {
              borderColor: '#0678be',
              borderWidth: 1
              //  color:'#fff'
            },
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: this.colorRgb('#5c96d2', 0.8) },
                { offset: 1, color: this.colorRgb('#5c96d2', 0.1) }
              ])
            },
            smooth: true
          }
        ]
      }
    };
  },
  computed: {},
  watch: {},
  methods: {
    async initData(id) {
      // this.isLoading = true;
      // let { status, resultData } = await getInletWater(id);
      // if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
      //   this.pointsArr = resultData;
      this.handleChange(this.pointsArr[0]);
      // }
      // this.isLoading = false;
    },
    handleChange(item) {
      this.currentPoint = item.pointName;
      this.handleChart(item);
    },
    handleChart(pointData) {
      let { unit, dataAndTimeList = [] } = pointData;
      let valueList = dataAndTimeList.map(item => item.pv);
      this.barOption.yAxis[0].name = unit;
      this.barOption.series[0].data = valueList;
      console.log(this.barOption, '666666');
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
  },
  created() {
    this.initData();
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;
  .header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    .left {
      width: 172px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      .image {
        width: 95px;
        height: 96px;
        background: url('~@/assets/images/default/smartPark/water.png') no-repeat;
      }
    }
    .right {
      display: flex;
      height: 100%;

      justify-content: space-around;
      align-items: center;
      flex-direction: column;

      .divice-tab {
        .label {
          font-weight: 500;
          font-size: 12px;
          color: #ffffff;
          letter-spacing: 0;
          text-align: center;
          text-shadow: 0 1px 8px #c6f5ff8f;
        }
        .value {
          font-weight: 700;
          font-size: 20px;
          text-align: center;
          color: #74b1ec;
          text-shadow: 0 0 5px #4bb4e580;
          -webkit-background-clip: text;
          letter-spacing: 0.83px;
          line-height: 24px;
          background: url('~@/assets/images/default/smartPark/bg2.png') no-repeat;
          .unit {
            font-weight: 600;
            font-size: 12px;
            color: #b1c9d8;
          }
        }
      }
    }
  }
  .echart-block {
    width: 100%;
    height: 110px;
  }
}
</style>
