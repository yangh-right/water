<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="tips-header">
        <div class="filed">
          <img src="@/assets/images/default/sludge1.png" alt="当月污泥累积外运量(T)" />
          <div class="filed-info">
            <div class="label">当月污泥累积外运量</div>
            <div class="value">{{ totalHistoryValue }} <span class="unit">t</span></div>
          </div>
        </div>
        <div class="filed">
          <img src="@/assets/images/default/sludge2.png" alt="吨水污泥产量(kg/m³)" />
          <div class="filed-info">
            <div class="label">吨水污泥产量</div>
            <div class="value">{{ totalRateValue }} <span class="unit">kg/m³</span></div>
          </div>
        </div>
      </div>
      <div class="echarts-block">
        <bar-chart :darkTheme="'light'" :option="barOption" ref="barChart"></bar-chart>
      </div>
    </div>
  </cockpit-card>
</template>

<script>
import * as echarts from 'echarts';
import { getChemicalSludgeEntryData } from '@/api/optimization';
import CockpitCard from './CockpitCard.vue';
export default {
  name: 'SludgeCount',
  components: {
    CockpitCard,
    BarChart: () => import('@/components/chart/BarChart.vue')
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
      cardTitle: '污泥产量',
      barOption: {},
      totalHistoryValue: 0,
      totalRateValue: 0
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        if (val) {
          this.getChemicalSludgeEntryData();
        }
      }
    }
  },
  methods: {
    getChemicalSludgeEntryData(type = 0) {
      let params = {
        waterPlantId: this.factoryId,
        yoyFlag: true,
        totalRateFlag: true,
        type
      };
      getChemicalSludgeEntryData(params).then(res => {
        if (res.status === 'complete') {
          this.chemicalSludgeEntryData = res.resultData;
          let xData = this.chemicalSludgeEntryData.timeDataList?.map(data => data.dateTimeStr);
          let yData = this.chemicalSludgeEntryData.timeDataList?.map(data => {
            return data.historyPointValue;
          });
          this.totalHistoryValue = this.chemicalSludgeEntryData.totalHistoryValue || 0;
          this.totalRateValue = this.chemicalSludgeEntryData.totalRateValue || 0;
          let option = {
            tooltip: {
              trigger: 'axis'
            },
            grid: [
              {
                top: '12%',
                left: '3%',
                right: '4%',
                bottom: '4%',
                containLabel: true
              }
            ],
            xAxis: [
              {
                data: xData,
                axisTick: {
                  show: false
                },
                axisLine: {
                  show: true
                },
                axisLabel: {
                  show: true,
                  margin: 15,
                  textStyle: {
                    fontSize: 14,
                    color: '#ffffff'
                  }
                },
                interval: 0
              }
            ],
            yAxis: [
              {
                name: this.chemicalSludgeEntryData.pointUnit || '',
                nameTextStyle: {
                  padding: [0, 0, -12, -4]
                },
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
                name: '柱顶部',
                type: 'pictorialBar',
                symbolSize: [12, 6],
                symbolOffset: [0, -5],
                z: 12,
                itemStyle: {
                  normal: {
                    color: '#363F5E',
                    opacity: 0.5
                  }
                },
                data: yData
              },
              {
                name: '柱底部',
                type: 'pictorialBar',
                symbolSize: [12, 6],
                symbolOffset: [0, 0],
                z: 12,
                itemStyle: {
                  normal: {
                    color: '#64EDFF'
                  }
                },
                data: yData,
                tooltip: {
                  show: false
                }
              },
              {
                type: 'bar',
                itemStyle: {
                  normal: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: 'rgba(53,185,255,0.9)' },
                      { offset: 1, color: '	rgba(41,164,209,0.7)' }
                    ])
                  }
                },
                z: 16,
                silent: true,
                barWidth: 12,
                barGap: '-100%', // Make series be overlap
                data: yData,
                tooltip: {
                  show: false
                }
              },
              {
                name: '最上层立体圆',
                type: 'pictorialBar',
                symbolSize: [12, 6],
                symbolOffset: [0, -5],
                z: 12,
                itemStyle: {
                  normal: {
                    color: '#363F5E'
                  }
                },
                data: yData.map(y => {
                  return {
                    value: this.totalHistoryValue,
                    symbolPosition: 'end'
                  };
                }),
                tooltip: {
                  show: false
                }
              },
              {
                //上部立体柱
                stack: '1',
                type: 'bar',
                itemStyle: {
                  normal: {
                    color: '#36405E',
                    opacity: 0.7
                  }
                },
                silent: true,
                barWidth: 12,
                barGap: '-100%',
                data: yData.map(() => {
                  return this.totalHistoryValue;
                }),
                tooltip: {
                  show: false
                }
              }
            ]
          };
          this.barOption = option;
        }
      });
    },
    initData() {
      let data = [
        {
          name: '常规',
          value: 175.17
        },
        {
          name: '紧急',
          value: 148.35
        },
        {
          name: '疑难',
          value: 95.36
        }
      ];
      let xAxisData = [];
      let seriesData1 = [];
      let sum = 0;
      data.forEach(item => {
        xAxisData.push(item.name);
        seriesData1.push(item.value);
        sum += item.value;
      });
      let option = {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          },
          formatter: function(params, ticket, callback) {
            const item = params[3];
            return item.name + ' : ' + item.value;
          }
        },
        grid: [
          {
            top: '12%',
            left: '3%',
            right: '4%',
            bottom: '4%',
            containLabel: true
          }
        ],
        xAxis: [
          {
            data: xAxisData,
            axisTick: {
              show: false
            },
            axisLine: {
              show: true
            },
            axisLabel: {
              show: true,
              margin: 15,
              textStyle: {
                fontSize: 14,
                color: '#ffffff'
              }
            },
            interval: 0
          }
        ],
        yAxis: [
          {
            name: 'T',
            nameTextStyle: {
              padding: [0, 0, -12, -4]
            },
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
            name: '柱顶部',
            type: 'pictorialBar',
            symbolSize: [12, 6],
            symbolOffset: [0, -5],
            z: 12,
            itemStyle: {
              normal: {
                color: '#363F5E',
                opacity: 0.5
              }
            },
            data: seriesData1
          },
          {
            name: '柱底部',
            type: 'pictorialBar',
            symbolSize: [12, 6],
            symbolOffset: [0, 0],
            z: 12,
            itemStyle: {
              normal: {
                color: '#64EDFF'
              }
            },
            data: seriesData1
          },
          {
            type: 'bar',
            itemStyle: {
              normal: {
                color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                  { offset: 0, color: 'rgba(53,185,255,0.9)' },
                  { offset: 1, color: '	rgba(41,164,209,0.7)' }
                ])
              }
            },
            z: 16,
            silent: true,
            barWidth: 12,
            barGap: '-100%', // Make series be overlap
            data: seriesData1
          },
          {
            name: '最上层立体圆',
            type: 'pictorialBar',
            symbolSize: [12, 6],
            symbolOffset: [0, -5],
            z: 12,
            itemStyle: {
              normal: {
                color: '#363F5E'
              }
            },
            data: [
              {
                value: sum,
                symbolPosition: 'end'
              },
              {
                value: sum,
                symbolPosition: 'end'
              },
              {
                value: sum,
                symbolPosition: 'end'
              }
            ]
          },
          {
            //上部立体柱
            stack: '1',
            type: 'bar',
            itemStyle: {
              normal: {
                color: '#36405E',
                opacity: 0.7
              }
            },
            silent: true,
            barWidth: 12,
            barGap: '-100%', // Make series be overlap
            data: [sum, sum, sum]
          }
        ]
      };
      this.barOption = option;
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;

  .tips-header {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: flex-start;
    margin-top: 4px;

    .filed {
      width: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        margin-right: 8px;
      }
      .filed-info {
        .label {
          font-family: AlibabaPuHuiTi_2_55, sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: #b2dfff;
          letter-spacing: 0;
        }
        .value {
          font-size: 18px;
          font-family: MiSans-DNaNpxibold, sans-serif;
          color: #e0f2ff;
          letter-spacing: 0;
          text-shadow: 0 1px 8px #51aaf2cf;
        }
        .unit {
          font-family: MiSans-Regular, sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: #f0f6ff;
          letter-spacing: 0;
        }
      }
    }
  }
  .echarts-block {
    width: 100%;
    height: calc(100% - 44px);
  }
}
</style>
