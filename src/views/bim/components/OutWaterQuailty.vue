<!--
 * @Author: wangyr
 * @Date: 2023-05-30 16:43:15
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-05 09:22:36
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="chart-btns">
        <w-button
          v-for="item in pointsArr"
          :key="item.pointName"
          :class="[currentPoint === item.pointName ? 'active-btn' : '', 'point-btn']"
          size="small"
          @click="handleChange(item)"
          >{{ item.pointMemo }}</w-button
        >
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
  '0',
  '1',
  '2',
  '3',
  '4',
  '5',
  '6',
  '7',
  '8',
  '9',
  '10',
  '11',
  '12',
  '13',
  '14',
  '15',
  '16',
  '17',
  '18',
  '19',
  '20',
  '21',
  '22',
  '23',
  '24'
];
export default {
  name: 'OutWaterQuailty',
  components: {
    BimCard,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      cardTitle: '出水水质',
      currentPoint: 'jsc_COD',
      pointsArr: [
        {
          cb: null,
          controlStandard: null,
          dataAndTimeList: [
            {
              date: '2023-05-30 00:00:00',
              pv: 189,
              simulatePv: null
            },
            {
              date: '2023-05-30 01:00:00',
              pv: 168,
              simulatePv: null
            },
            {
              date: '2023-05-30 02:00:00',
              pv: 219,
              simulatePv: null
            },
            {
              date: '2023-05-30 03:00:00',
              pv: 221,
              simulatePv: null
            },
            {
              date: '2023-05-30 04:00:00',
              pv: 235,
              simulatePv: null
            },
            {
              date: '2023-05-30 05:00:00',
              pv: 310,
              simulatePv: null
            },
            {
              date: '2023-05-30 06:00:00',
              pv: 289,
              simulatePv: null
            },
            {
              date: '2023-05-30 07:00:00',
              pv: 282,
              simulatePv: null
            },
            {
              date: '2023-05-30 08:00:00',
              pv: 301,
              simulatePv: null
            },
            {
              date: '2023-05-30 09:00:00',
              pv: 337,
              simulatePv: null
            },
            {
              date: '2023-05-30 10:00:00',
              pv: 295,
              simulatePv: null
            },
            {
              date: '2023-05-30 11:00:00',
              pv: 306,
              simulatePv: null
            },
            {
              date: '2023-05-30 12:00:00',
              pv: 279,
              simulatePv: null
            },
            {
              date: '2023-05-30 13:00:00',
              pv: 268,
              simulatePv: null
            },
            {
              date: '2023-05-30 14:00:00',
              pv: 325,
              simulatePv: null
            },
            {
              date: '2023-05-30 15:00:00',
              pv: 298,
              simulatePv: null
            },
            {
              date: '2023-05-30 16:00:00',
              pv: 301,
              simulatePv: null
            },
            {
              date: '2023-05-30 17:00:00',
              pv: 311,
              simulatePv: null
            },
            {
              date: '2023-05-30 18:00:00',
              pv: 322,
              simulatePv: null
            },
            {
              date: '2023-05-30 19:00:00',
              pv: 324,
              simulatePv: null
            },
            {
              date: '2023-05-30 20:00:00',
              pv: 338,
              simulatePv: null
            },
            {
              date: '2023-05-30 21:00:00',
              pv: 341,
              simulatePv: null
            },
            {
              date: '2023-05-30 22:00:00',
              pv: 347,
              simulatePv: null
            },
            {
              date: '2023-05-30 23:00:00',
              pv: 339,
              simulatePv: null
            },
            {
              date: '2023-05-30 24:00:00',
              pv: 351,
              simulatePv: null
            }
          ],
          deviceId: 'yuexiuhycqdsb',
          gb: null,
          pointMemo: 'COD',
          pointName: 'jsc_COD',
          unit: 'mg/L'
        },
        {
          cb: null,
          controlStandard: null,
          dataAndTimeList: [
            {
              date: '2023-05-30 00:00:00',
              pv: 238,
              simulatePv: null
            },
            {
              date: '2023-05-30 01:00:00',
              pv: 256,
              simulatePv: null
            },
            {
              date: '2023-05-30 02:00:00',
              pv: 314,
              simulatePv: null
            },
            {
              date: '2023-05-30 03:00:00',
              pv: 272,
              simulatePv: null
            },
            {
              date: '2023-05-30 04:00:00',
              pv: 218,
              simulatePv: null
            },
            {
              date: '2023-05-30 05:00:00',
              pv: 332,
              simulatePv: null
            },
            {
              date: '2023-05-30 06:00:00',
              pv: 290,
              simulatePv: null
            },
            {
              date: '2023-05-30 07:00:00',
              pv: 314,
              simulatePv: null
            },
            {
              date: '2023-05-30 08:00:00',
              pv: 300,
              simulatePv: null
            },
            {
              date: '2023-05-30 09:00:00',
              pv: 293,
              simulatePv: null
            },
            {
              date: '2023-05-30 10:00:00',
              pv: 313,
              simulatePv: null
            },
            {
              date: '2023-05-30 11:00:00',
              pv: 279,
              simulatePv: null
            },
            {
              date: '2023-05-30 12:00:00',
              pv: 316,
              simulatePv: null
            },
            {
              date: '2023-05-30 13:00:00',
              pv: 301,
              simulatePv: null
            },
            {
              date: '2023-05-30 14:00:00',
              pv: 306,
              simulatePv: null
            },
            {
              date: '2023-05-30 15:00:00',
              pv: 316,
              simulatePv: null
            },
            {
              date: '2023-05-30 16:00:00',
              pv: 326,
              simulatePv: null
            },
            {
              date: '2023-05-30 17:00:00',
              pv: 321,
              simulatePv: null
            },
            {
              date: '2023-05-30 18:00:00',
              pv: 325,
              simulatePv: null
            },
            {
              date: '2023-05-30 19:00:00',
              pv: 314,
              simulatePv: null
            },
            {
              date: '2023-05-30 20:00:00',
              pv: 328,
              simulatePv: null
            },
            {
              date: '2023-05-30 21:00:00',
              pv: 314,
              simulatePv: null
            },
            {
              date: '2023-05-30 22:00:00',
              pv: 337,
              simulatePv: null
            },
            {
              date: '2023-05-30 23:00:00',
              pv: 339,
              simulatePv: null
            },
            {
              date: '2023-05-30 24:00:00',
              pv: 346,
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
              pv: 218,
              simulatePv: null
            },
            {
              date: '2023-05-30 01:00:00',
              pv: 235,
              simulatePv: null
            },
            {
              date: '2023-05-30 02:00:00',
              pv: 247,
              simulatePv: null
            },
            {
              date: '2023-05-30 03:00:00',
              pv: 287,
              simulatePv: null
            },
            {
              date: '2023-05-30 04:00:00',
              pv: 318,
              simulatePv: null
            },
            {
              date: '2023-05-30 05:00:00',
              pv: 312,
              simulatePv: null
            },
            {
              date: '2023-05-30 06:00:00',
              pv: 289,
              simulatePv: null
            },
            {
              date: '2023-05-30 07:00:00',
              pv: 317,
              simulatePv: null
            },
            {
              date: '2023-05-30 08:00:00',
              pv: 322,
              simulatePv: null
            },
            {
              date: '2023-05-30 09:00:00',
              pv: 267,
              simulatePv: null
            },
            {
              date: '2023-05-30 10:00:00',
              pv: 291,
              simulatePv: null
            },
            {
              date: '2023-05-30 11:00:00',
              pv: 282,
              simulatePv: null
            },
            {
              date: '2023-05-30 12:00:00',
              pv: 319,
              simulatePv: null
            },
            {
              date: '2023-05-30 13:00:00',
              pv: 312,
              simulatePv: null
            },
            {
              date: '2023-05-30 14:00:00',
              pv: 310,
              simulatePv: null
            },
            {
              date: '2023-05-30 15:00:00',
              pv: 294,
              simulatePv: null
            },
            {
              date: '2023-05-30 16:00:00',
              pv: 296,
              simulatePv: null
            },
            {
              date: '2023-05-30 17:00:00',
              pv: 301,
              simulatePv: null
            },
            {
              date: '2023-05-30 18:00:00',
              pv: 312,
              simulatePv: null
            },
            {
              date: '2023-05-30 19:00:00',
              pv: 324,
              simulatePv: null
            },
            {
              date: '2023-05-30 20:00:00',
              pv: 338,
              simulatePv: null
            },
            {
              date: '2023-05-30 21:00:00',
              pv: 314,
              simulatePv: null
            },
            {
              date: '2023-05-30 22:00:00',
              pv: 327,
              simulatePv: null
            },
            {
              date: '2023-05-30 23:00:00',
              pv: 329,
              simulatePv: null
            },
            {
              date: '2023-05-30 24:00:00',
              pv: 341,
              simulatePv: null
            }
          ],
          deviceId: 'yuexiuhycqdsb',
          gb: null,
          pointMemo: 'TN',
          pointName: 'jsc_TN',
          unit: 'mg/L'
        }
      ],
      barOption: {
        color: ['#00FBC0', '#00CCFF'],
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
            data: dateList
          }
        ],
        yAxis: [
          {
            name: '',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              },
              show: true
            }
          }
        ],
        series: [
          {
            name: '实时',
            type: 'line',
            showSymbol: false,
            data: [],
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: this.colorRgb('#00FBC0', 0.8) },
                { offset: 1, color: this.colorRgb('#00FBC0', 0.1) }
              ])
            }
          },
          {
            name: '预测',
            type: 'line',
            showSymbol: false,
            data: [],
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: this.colorRgb('#00CCFF', 0.8) },
                { offset: 1, color: this.colorRgb('#00CCFF', 0.1) }
              ])
            }
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
      let tempArr = valueList.map(item => {
        return Number(item) + parseInt(Math.random(0, 1) * 20);
      });
      this.barOption.series[0].data = valueList.slice(0, 15);
      this.barOption.series[1].data = tempArr;
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

  .chart-btns {
    padding-top: 8px;
    box-sizing: border-box;
    .point-btn {
      height: 22px;
      width: 82px;
      background: #0c2c5a80;
      border: 1px solid #0157a7b3;
      font-family: PingFangSC-Medium, sans-serif;
      font-weight: 500;
      font-size: 12px;
      color: var(--supply-color-secondary);
      letter-spacing: 0;
      text-align: center;
      margin-right: 8px;
    }
    .active-btn {
      color: var(--supply-color-main);
      background: #0d387880;
      border: 1px solid #0157a7;
      box-shadow: inset 0 0 6px 0 #008cff;
    }
  }
  .echart-block {
    width: 100%;
    height: calc(100% - 30px);
    margin-top: 6px;
  }
}
</style>
