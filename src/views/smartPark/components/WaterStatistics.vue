<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="left-box">
        <div class="echart-block">
          <line-chart :darkTheme="'light'" :option="gaugeOption" ref="gaugeChart"></line-chart>
          <div class="pie-bg">
            76%
          </div>
        </div>
        <div class="echart-title">负荷率</div>
      </div>
      <div class="right-box">
        <div class="point-tab">
          <div class="ico-lt"></div>
          <div class="point-text">
            <div class="lable">实时流量(m³/h)</div>
            <div class="value">65.67</div>
          </div>
        </div>
        <div class="point-tab">
          <div class="ico-lt"></div>
          <div class="point-text">
            <div class="lable">当日累积处理量(m³/d)</div>
            <div class="value">2134.88</div>
          </div>
        </div>
        <div class="point-tab">
          <div class="ico-lt"></div>
          <div class="point-text">
            <div class="lable">昨日累积处理量(m³/d)</div>
            <div class="value">3068.63</div>
          </div>
        </div>
      </div>
    </div>
  </bim-card>
</template>

<script>
import * as echarts from 'echarts';
import { fontChart } from '@/utils/util';
import BimCard from './BimCard.vue';
export default {
  name: 'WaterStatistics',
  components: {
    BimCard,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      cardTitle: '水量统计',
      gaugeOption: {}
    };
  },
  computed: {},
  watch: {},
  methods: {
    drawGauge() {
      const pointColor = new echarts.graphic.LinearGradient(0, 1, 0, 0, [
        {
          offset: 0,
          color: '#3D81FF' // 0% 处的颜色
        },
        {
          offset: 1,
          color: '#16CEB9' // 100% 处的颜色
        }
      ]);
      const outColor = new echarts.graphic.LinearGradient(0, 1, 0, 0, [
        {
          offset: 0,
          color: '#000913' // 0% 处的颜色
        },
        {
          offset: 1,
          color: '#0795F0' // 100% 处的颜色
        }
      ]);

      // 指定图表的配置项和数据
      let option = {
        grid: [
          {
            top: '12%',
            left: '3%',
            right: '4%',
            bottom: '4%',
            containLabel: true
          }
        ],
        legend: {
          show: false
        },
        series: [
          {
            type: 'gauge',
            name: '外层辅助',
            radius: '133%',
            startAngle: '180',
            endAngle: '0',
            pointer: {
              show: false
            },
            center: ['50%', '75%'], //整体的位置设置
            detail: {
              show: false
            },
            data: [
              {
                value: 1
              }
            ],
            axisLine: {
              show: true,
              lineStyle: {
                color: [[1, outColor]],
                width: 1,
                opacity: 1
              }
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            axisLabel: {
              show: false
            }
          },
          {
            name: '水量统计',
            type: 'gauge',
            startAngle: 180,
            endAngle: 0,
            min: 0,
            max: 1,
            // splitNumber: 10,
            radius: '124%', // 可调整该属性修改圆环大小
            center: ['50%', '75%'],
            progress: {
              show: true,
              width: 20,
              itemStyle: {
                opacity: 1,
                color: new echarts.graphic.LinearGradient(0, 0, 1, 0, [
                  {
                    offset: 0,
                    color: 'rgba(1,113,206,1)'
                  },
                  {
                    offset: 0.5,
                    color: 'rgba(1,170,192,1)'
                  },
                  {
                    offset: 1,
                    color: 'rgba(104,255,211,1)'
                  }
                ])
              }
            },
            itemStyle: {
              color: '#58D9F9',
              shadowColor: 'rgba(0,138,255,0.45)',
              shadowBlur: 10,
              shadowOffsetX: 2,
              shadowOffsetY: 2
            },
            axisLine: {
              lineStyle: {
                width: 20,
                color: [[1, '#03172E']]
              }
            },
            pointer: {
              show: true,
              length: '80%',
              width: fontChart(4),
              offsetCenter: ['0%', '-8%'],
              itemStyle: {
                color: pointColor
              }
            },
            axisTick: {
              length: 12,
              lineStyle: {
                color: 'auto',
                width: 0
              }
            },
            splitLine: {
              length: 20,
              lineStyle: {
                color: 'auto',
                width: 0
              }
            },
            axisLabel: {
              color: '#464646',
              fontSize: 20,
              distance: -60,
              fontFamily: 'Source Han Sans SC',
              formatter: function(value) {}
            },
            title: {
              offsetCenter: [0, '-30%'],
              fontSize: 22,
              fontFamily: 'DIN Alternate',
              color: '#1678FF'
            },
            detail: {
              show: false
              // fontSize: 22,
              // fontFamily: 'DIN Alternate',
              // offsetCenter: [0, '10%'],
              // valueAnimation: true,
              // formatter: function(value) {
              //   return Math.round(value * 100);
              // },
              // color: '#1678FF'
            },
            data: [
              {
                value: 0.76
              }
            ]
          }
        ]
      };

      this.gaugeOption = option;
    }
  },
  created() {
    this.drawGauge();
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
  display: flex;
  justify-content: space-between;
  .left-box {
    width: 60%;
    height: 100%;

    .echart-block {
      width: 100%;
      height: calc(100% - 48px);
      position: relative;

      .pie-bg {
        width: 84px;
        height: 44px;
        background: url('~@/assets/images/default/pie-chart.png') no-repeat;
        font-weight: 700;
        font-size: 22px;
        color: #ffffff;
        letter-spacing: 0.63px;
        text-align: center;
        line-height: 44px;
        position: absolute;
        left: 50%;
        top: 75%;
        margin-left: -42px;
        margin-top: -42px;
      }
    }
    .echart-title {
      width: 158px;
      height: 34px;
      background-image: linear-gradient(90deg, #00142b00 0%, #1259a7 52%, #00142b00 100%);
      text-align: center;
      line-height: 34px;
      margin: 0 auto;
      font-weight: 600;
      font-size: 16px;
      color: #ffffff;
    }
  }
  .right-box {
    width: 40%;
    height: 100%;
    display: flex;
    flex-direction: column;
    justify-content: space-around;

    .point-tab {
      display: flex;
      align-items: center;

      .ico-lt {
        width: 9px;
        height: 35px;
        background: url('~@/assets/images/default/ico-lt.png') no-repeat;
        margin-right: 4px;
      }
      .point-text {
        .lable {
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: #b2dfff;
        }
        .value {
          font-family: D-DINExp-Bold, sans-serif;
          font-weight: 700;
          font-size: 18px;
          color: #f4f8ff;
          letter-spacing: 0;
        }
      }
    }
  }
}
</style>
