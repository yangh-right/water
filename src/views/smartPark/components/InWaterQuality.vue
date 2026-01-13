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
          <div class="des">
            <div class="title">总用电量(kwh/d )</div>
            <div class="value">6257</div>
          </div>
        </div>
        <div class="right">
          <div class="right-item">
            <span class="title">生产用电：</span>
            <span class="value">
              38950
              <span class="unit">kwh</span>
            </span>
          </div>
          <div class="right-item">
            <div class="title">生活用电：</div>
            <div class="value">
              820
              <div class="unit">kwh</div>
            </div>
          </div>
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
  '1月',
  '2月',
  '3月',
  '4月',
  '5月',
  '6月',
  '7月',
  '8月',
  '9月',
  '10月',
  '11月',
  '12月'
];
export default {
  name: 'InWaterQuality',
  components: {
    BimCard,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      cardTitle: '能耗管理',
      currentPoint: 'jsc_COD',
      pointsArr: [
        {
          cb: null,
          controlStandard: null,
          dataAndTimeList: [
            {
              date: '2023-05-30 00:00:00',
              pv: 1500
            },
            {
              date: '2023-05-30 01:00:00',
              pv: 1000
            },
            {
              date: '2023-05-30 02:00:00',
              pv: 2000
            },
            {
              date: '2023-05-30 03:00:00',
              pv: 1200
            },
            {
              date: '2023-05-30 04:00:00',
              pv: 2000
            },
            {
              date: '2023-05-30 05:00:00',
              pv: 3800
            },
            {
              date: '2023-05-30 06:00:00',
              pv: 3200
            },
            {
              date: '2023-05-30 07:00:00',
              pv: 4000
            },
            {
              date: '2023-05-30 08:00:00',
              pv: 3700
            },
            {
              date: '2023-05-30 09:00:00',
              pv: 4200
            },
            {
              date: '2023-05-30 10:00:00',
              pv: 4000
            }
          ],
          deviceId: 'yuexiuhycqdsb',
          gb: null,
          pointMemo: 'COD',
          pointName: 'jsc_COD',
          unit: 'kwh'
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
          unit: 'kwh'
        }
      ],
      barOption: {
        color: ['#11b1f1'],
        grid: [
          {
            left: '0%',
            right: '0%',
            top: '19%',
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
            nameTextStyle: {
              color: '#B9D8F6'
            },
            axisLabel: {
              color: '#B9D8F6'
            },
            splitLine: {
              lineStyle: {
                type: 'dashed'
              },
              show: true
            },
            show: true
          }
        ],
        series: [
          {
            type: 'line',
            //  showSymbol: false,
            data: [],
            symbol: 'circle', // 设置标记的图形为circle
            symbolSize: 6,
            itemStyle: {
              borderColor: '#0678be',
              borderWidth: 1
              //  color:'#fff'
            }
            //    smooth: true
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
    height: 70px;
    width: 100%;
    .left {
      width: 172px;
      height: 62px;
      display: flex;
      justify-content: space-around;
      align-items: center;
      .image {
        width: 70px;
        height: 62px;
        background: url('~@/assets/images/default/smartPark/engry.png') no-repeat;
      }
      .des {
        margin-left: 4px;
        .title {
          font-weight: 500;
          font-size: 12px;
          color: #ffffff;
          letter-spacing: 0;
          text-shadow: 0 1px 7px #c6f5ff8f;
        }
        .value {
          margin-top: 4px;
          font-weight: 700;
          font-size: 24px;
          text-shadow: 0 0 5px #4bb4e580;
          background-image: linear-gradient(to bottom, #74b1ec, #ecf9ff, #effcfe);
          -webkit-background-clip: text;
          letter-spacing: 1px;
          line-height: 24px;
          color: transparent;
        }
      }
    }
    .right {
      display: flex;
      height: 100%;

      justify-content: space-around;
      align-items: center;
      flex-direction: column;
      &-item {
        width: 205px;
        text-align: center;
        height: 33px;
        background: url('~@/assets/images/default/smartPark/bg1.png') no-repeat;
        .title {
          display: inline-block;
          font-weight: 500;
          font-size: 12px;
          //  line-height: 33px;
          color: #ffffff;
          letter-spacing: 0;
          //  text-shadow: 0 1px 8px #c6f5ff8f;
        }
        .value {
          display: inline-block;

          font-weight: 700;
          font-size: 22px;
          color: transparent;
          text-shadow: 0 0 5px #4bb4e580;
          background-image: linear-gradient(to bottom, #74b1ec, #ecf9ff, #effcfe);
          -webkit-background-clip: text;
          letter-spacing: 1.65px;

          .unit {
            display: inline-block;
            font-weight: 500;
            font-size: 12px;
            color: #ffffff;
            letter-spacing: 0;
            text-shadow: 0 1px 8px #c6f5ff8f;
          }
        }
      }
      &-item:last-child {
        margin-top: 4px;
      }
    }
  }
  .echart-block {
    width: 100%;
    height: calc(100% - 30px);
    margin-top: 6px;
  }
}
</style>
