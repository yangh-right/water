<!--
 * @Author: duyibo
 * @Date: 2024-05-31 15:54:15
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-06 15:06:25
 * @Description:
-->
<template>
  <div class="lineChart">
    <line-chart
      v-if="emptyFlag"
      :darkTheme="'light'"
      powerType="powerSupply"
      :option="barOption"
      ref="inChart"
    ></line-chart>
    <w-empty v-else />
    <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
  </div>
</template>

<script>
import { hexToRgba, color, end } from './data';

import moment from 'moment';
import { processWaterQualityPrediction, effluentQualityControl } from '@/api/cockpit';

export default {
  name: 'chart',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  props: {
    waterPlantId: {
      type: [String, Number],
      default: ''
    },
    chartItem: {
      type: Object,
      default: null
    },
    flag: {
      type: Boolean,
      default: true
    },
    showTimeLine: {
      type: Boolean,
      default: false
    },
    signedPv: {
      type: [String, Number],
      default: ''
    },
    rangeTime: {
      type: [Array],
      default: () => []
    }
  },
  data() {
    return {
      emptyFlag: false,
      isLoading: false,
      lines: [8, 12],
      barOption: {
        color: color,
        grid: [
          {
            left: '3%',
            right: '3%',
            top: '10%',
            bottom: '12%'
          }
        ],
        legend: {
          top: 'bottom',
          itemHeight: 2,
          itemWidth: 12,
          data: [
            { icon: 'rect', name: '实时值' },
            { icon: 'rect', name: '预测值' },
            {
              icon:
                'path://M234.666667 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM473.6 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM934.4 490.666667h-136.533333a25.6 25.6 0 1 0 0 51.2h136.533333a25.6 25.6 0 1 0 0-51.2zM712.533333 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2z',
              name: '预警线'
            },
            {
              icon:
                'path://M234.666667 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM473.6 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM934.4 490.666667h-136.533333a25.6 25.6 0 1 0 0 51.2h136.533333a25.6 25.6 0 1 0 0-51.2zM712.533333 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2z',
              name: '设计线'
            }
          ]
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            data: []
          }
        ],
        yAxis: [
          {
            name: 'mg/L',
            max: function(value) {
              return Math.ceil(value.max) + parseInt(value.max * 0.5);
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
              width: 2,
              opacity: 0.15,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  { offset: 0.2, color: color[0] },
                  { offset: 1, color: end }
                ],
                global: false
              }
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
            name: '预警线',
            type: 'line',
            data: [],
            lineStyle: {
              type: 'dashed'
            },
            labelLayout: {
              moveOverlap: 'shiftY'
            }
          },
          {
            name: '设计线',
            type: 'line',
            data: [],
            lineStyle: {
              type: 'dashed'
            },
            labelLayout: {
              moveOverlap: 'shiftY'
            }
          },
          {
            type: 'line',
            data: [],
            markLine: {
              symbol: 'none',
              lineStyle: {
                type: 'solid',
                width: 1
              },
              data: []
            },
            markPoint: {
              data: [
                {
                  coord: ['12:00', 600],
                  symbol: 'circle',
                  symbolSize: 16,
                  itemStyle: {
                    color: 'rgba(203, 221, 242, 1)',
                    shadowColor: 'rgba(46, 224, 85, 1)',
                    shadowBlur: 10
                  }
                }
              ]
            }
          }
        ]
      }
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.initData();
        }
      }
    },
    rangeTime: {
      deep: true,
      handler(newVal, oldVal) {
        if (newVal.length > 0) {
          this.initData();
        }
      }
    }
  },
  methods: {
    async initData() {
      this.isLoading = true;
      let startTime = this.rangeTime.length
        ? moment(this.rangeTime[0]).format('YYYY-MM-DD HH:mm:ss')
        : moment()
            .subtract(12, 'hours')
            .format('YYYY-MM-DD HH:mm:ss');
      let endTime = this.rangeTime.length
        ? moment(this.rangeTime[1])
            .add(24, 'hours')
            .format('YYYY-MM-DD HH:mm:ss')
        : moment()
            .add(24, 'hours')
            .format('YYYY-MM-DD HH:mm:ss');
      let params = {
        startTime,
        pointConfigCode: this.chartItem.superiorCode,
        queryType: 'day',
        secondPointConfigCode: this.chartItem.code,
        endTime,
        waterPlantId: this.waterPlantId
      };
      let URL = this.flag ? processWaterQualityPrediction : effluentQualityControl;
      let { status, resultData } = await URL(params);
      if (status === 'complete') {
        if (resultData.length > 0) {
          const xAxisData = resultData[0].dataAndTimeList?.map(item => item.date) || [];
          this.barOption.xAxis[0].data = xAxisData;
          this.barOption.series[0].data = resultData[0].dataAndTimeList.map(item => {
            return item.pv;
          });
          this.barOption.series[1].data = resultData[0].dataAndTimeList.map(item => {
            return item.simulatePv;
          });
          this.barOption.series[2].data = resultData[0].dataAndTimeList.map(item => {
            return resultData[0].cb;
          });
          this.barOption.series[3].data = resultData[0].dataAndTimeList.map(item => {
            return this.signedPv;
          });
          let preNum = resultData[0].dataAndTimeList.filter(item => {
            return !item.pv && item.pv != '0';
          });
          const splitLine = this.barOption.xAxis[0].data[
            this.barOption.xAxis[0].data.length - preNum.length - 1
          ];
          this.barOption.series[2].label = {
            show: true,
            position: 'top',
            formatter: params => {
              if (params.dataIndex == this.barOption.series[2].data.length - 1) {
                return '{kong|' + params.value + '}';
              } else {
                return '';
              }
            },
            color: '#FFA148',
            align: 'center',
            lineHeight: 24,
            borderRadius: 2,
            fontSize: 16,
            backgroundColor: hexToRgba(color[2], 0.2),
            rich: {
              kong: {
                padding: [4, 10],
                color: '#FFA148',
                fontSize: 16
              }
            }
          };
          this.barOption.series[3].label = {
            show: true,
            position: 'top',
            formatter: params => {
              if (params.dataIndex == this.barOption.series[3].data.length - 1) {
                return '{kong|' + params.value + '}';
              } else {
                return '';
              }
            },
            color: '#800080',
            align: 'center',
            lineHeight: 24,
            borderRadius: 2,
            fontSize: 16,
            backgroundColor: hexToRgba(color[3], 0.2),
            rich: {
              kong: {
                padding: [4, 10],
                color: '#800080',
                fontSize: 16
              }
            }
          };
          this.barOption.series[4].markLine = {
            symbol: 'none',
            lineStyle: {
              type: 'solid',
              width: preNum.length === 0 ? 0 : 1
            },
            data: [
              // 灰色线
              {
                xAxis: splitLine,
                label: {
                  show: false
                },
                lineStyle: {
                  color: '#B5B5B5'
                }
              }
            ]
          };

          if (this.showTimeLine && splitLine != undefined) {
            this.lines.forEach(line => {
              let date = this.$moment(splitLine)
                .add(line, 'hours')
                .format('YYYY-MM-DD HH:mm:ss');
              if (xAxisData.find(item => item === date)) {
                this.barOption.series.push({
                  name: line + '小时',
                  type: 'line',
                  markLine: {
                    itemStyle: {
                      //盒须图样式。
                      normal: {
                        label: {
                          show: false,
                          formatter: line + '小时'
                        }
                      }
                    },
                    name: line + '小时',
                    symbol: 'none', //去掉箭头
                    data: [
                      // 灰色线
                      {
                        xAxis: date,
                        lineStyle: {
                          color: '#B5B5B5'
                        }
                      }
                    ],
                    emphasis: {
                      label: {
                        show: true
                      }
                    }
                  }
                });
              }
            });
          }
          this.emptyFlag = true;
        } else {
          this.emptyFlag = false;
        }
      } else {
        this.emptyFlag = false;
      }

      this.isLoading = false;
    }
  }
};
</script>

<style lang="less" scoped>
.lineChart {
  width: 100%;
  height: calc(100% - 24px);
  display: flex;
  justify-content: center;
  align-items: center;
}
.chart-spin {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
}
</style>
