<!--
 * @Author: wangyr
 * @Date: 2022-10-09 18:16:39
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-04-27 11:45:22
 * @Description:
-->
<template>
  <div class="chart-con">
    <div v-if="!!tips || chartData.length <= 0" class="empty-title">历史数据</div>
    <div v-else class="header">
      <search ref="timeInterval" class="right-header" @search="onSearch"></search>
      <w-button type="primary" class="top-btn supply-z-10 supply-top-0" @click="toHistoryAnalyse"
        >历史数据分析</w-button
      >
    </div>
    <div v-if="!!tips || chartData.length <= 0" class="tips">
      <w-empty :description="tips"></w-empty>
    </div>
    <div v-else class="data-body">
      <line-chart darkTheme="light" :option="chartOption"></line-chart>
    </div>
  </div>
</template>

<script>
import config from '@/config/setting.config';
import { intervals0, spaces0 } from '@/components/history/data';
import { getHistoryDataByMultiDate } from '@/api/analysis';

export default {
  name: 'historyChart',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
    search: () => import('@/components/history/search.vue')
  },
  props: {
    tips: {
      type: String,
      default: '请选择设备或者监测量！'
    },
    activePoint: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      chartOption: {
        title: {
          text: '历史数据'
        },
        legend: {
          left: '8%',
          top: '-0.5%',
          normal: {}
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        grid: [
          {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            type: 'line',
            stack: 'Total',
            smooth: true,
            showSymbol: false,
            emphasis: {
              focus: 'series'
            },
            data: []
          }
        ]
      },
      chartData: []
    };
  },
  computed: {},
  watch: {
    activePoint: {
      immediate: true,
      deep: true,
      handler(data) {
        // 重置时段数据
        if (!!this.$refs.timeInterval) {
          this.$refs.timeInterval.spaces = spaces0;
          this.$refs.timeInterval.intervals = intervals0;
          this.$refs.timeInterval.form = {
            type: '0',
            interval: '1hours', // 时段
            space: '1', // 间隔
            date: [this.$moment().subtract(1, 'hours'), this.$moment()]
          };
        }
        if (Object.keys(data).length !== 0) {
          let params = {
            devicePoints: [
              {
                deviceId: data?.deviceId,
                points: [data?.pointName]
              }
            ],
            dates: [
              {
                startTime: this.$moment()
                  .subtract(1, 'hour')
                  .format('YYYY-MM-DD HH:mm:ss'),
                endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
              }
            ],
            period: '1',
            timeEnum: 'MINUTES',
            displayType: [],
            deviceType: 'INDUSTRY_DEVICE',
            productCode: config.productCode
          };
          this.getHistoryData(params);
        }
      }
    }
  },
  methods: {
    async getHistoryData(params = {}) {
      let res = await getHistoryDataByMultiDate(params);
      if (res.status === 'complete') {
        this.chartData = res.resultData;
        this.handlerChartData(res.resultData, params);
      }
    },
    handlerChartData(data = [], searchLineInfo = {}) {
      let useBoolYaxis = false;
      let enumOneName = '';
      let enumZeroName = '';
      const axis = [];
      const series = [];
      let xAxisData = [];
      let yAxis = [
        {
          name: '',
          type: 'value',
          axisLine: {
            show: false
          },
          axisTick: {
            show: false
          },
          axisLabel: {
            color: '#868e96',
            fontSize: '10',
            formatter: '{value}'
          }
          // min: function(value) {
          //   return value.min;
          // },
          // max: function(value) {
          //   return value.max;
          // }
        }
      ];
      let maximumMax = [];
      // 时间
      data.forEach((date, index) => {
        const units = Object.keys(date.data);
        units.forEach((unit, ind) => {
          if (index === 0) {
            axis.push({
              name: unit === '--' || unit === 'none' ? '' : unit,
              axisLabel: {
                color: '#969999',
                formatter: '{value}'
              },
              axisTick: {
                inside: true
              },
              axisLine: {
                lineStyle: {}
              },
              offset: ind > 1 ? (ind - 1) * 35 : 0
              // min: function(value) {
              //   return value.min;
              // },
              // max: function(value) {
              //   return value.max;
              // }
            });
          }
          const devices = Object.keys(date.data[unit]);
          devices.forEach((device, dindex) => {
            const points = Object.keys(date.data[unit][device]);
            points.forEach((point, i) => {
              const pointData = date.data[unit][device][point];
              const d = pointData.map(v => {
                if (index === 0 && ind === 0 && dindex === 0 && i === 0) {
                  xAxisData.push(v.dateTime);
                }
                if (units.length === 1 && points.length === 1 && v.dataType === 'bool') {
                  useBoolYaxis = true;
                  enumOneName = v.enumOneName;
                  enumZeroName = v.enumZeroName;
                  yAxis[0].axisLabel.formatter = function(value) {
                    if (value === 1) {
                      return v.enumOneName ?? value ?? '--';
                    } else if (value === 0) {
                      return v.enumZeroName ?? value ?? '--';
                    } else {
                      return '';
                    }
                  };
                }
                return v.displayType === 4 ? v.dvAfterRatio : v.pvAfterRatio;
              });
              maximumMax = [...maximumMax, ...d];
              const time =
                searchLineInfo.dates.length > 1
                  ? searchLineInfo.timeEnum === 'DAYS'
                    ? date.startTime.substring(0, 7)
                    : date.startTime.split(' ')[0]
                  : '';
              const pv = {
                name: pointData[0].pointMemo + time,
                type: 'line',
                data: d
              };
              const type = Number(
                this.disPlayType?.[point] || this.disPlayType?.[point + '-' + device] || '1'
              );
              const obj = { type: 'line' };
              if (type === 0 || type === 5 || type === 4) {
                obj.step = true;
              }
              series.push({ ...pv, yAxisIndex: ind, showSymbol: false, ...obj });
            });
          });
        });
      });
      if (searchLineInfo.dates.length > 1) {
        xAxisData = xAxisData.map(item => {
          if (searchLineInfo.timeEnum === 'DAYS') {
            return item.substring(8, 10);
          } else {
            return item.substring(11);
          }
        });
      } else {
        xAxisData = xAxisData.map(item => {
          if (searchLineInfo.timeEnum === 'DAYS') {
            return item.substring(8, 10);
          } else if (searchLineInfo.timeEnum === 'MINUTES') {
            return item.substring(11);
          } else {
            return item;
          }
        });
      }
      this.chartOption.xAxis[0].data = xAxisData;
      this.chartOption.yAxis = useBoolYaxis ? yAxis : axis;
      if (useBoolYaxis) {
        this.chartOption.tooltip = {
          formatter: function(params, ticket, callback) {
            if (params instanceof Array) {
              if (params.length) {
                let message = '';
                message += `${params[0].axisValueLabel}`;
                params.forEach(param => {
                  message += `<br/>${param.marker}${param.seriesName}: ${
                    param.value === 1
                      ? enumOneName ?? param.value
                      : enumZeroName ?? param.value ?? '--'
                  }`;
                });
                return message;
              } else {
                return '--';
              }
            } else {
              let message = '';
              message += `${params[0].axisValueLabel}`;
              message += `<br/>${params.marker}${params.seriesName}: ${params.value ?? '--'}`;
              return message;
            }
          }
        };
      } else {
        this.chartOption.tooltip = {
          formatter: function(params, ticket, callback) {
            if (params instanceof Array) {
              if (params.length) {
                let message = '';
                message += `${params[0].axisValueLabel}`;
                params.forEach(param => {
                  message += `<br/>${param.marker}${param.seriesName}: ${param.value ?? '--'}`;
                });
                return message;
              } else {
                return '--';
              }
            } else {
              let message = '';
              message += `${params[0].axisValueLabel}`;
              message += `<br/>${params.marker}${params.seriesName}: ${params.value ?? '--'}`;
              return message;
            }
          }
        };
      }
      this.chartOption.series = series;
      if (this.max?.length && this.chartOption.series?.[0]) {
        this.chartOption.series.forEach((item, index) => {
          if (this.max[index] && this.min[index]) {
            item.markLine = {
              data: [
                {
                  name: 'max',
                  yAxis: this.max[index]
                },

                {
                  name: 'min',
                  yAxis: this.min[index]
                }
              ]
            };
          }
        });
      } else if (this.chartOption.series?.[0]) {
        this.chartOption.series[0].markLine = {
          data: []
        };
      }
    },
    toHistoryAnalyse() {
      this.drillDown({
        path: '/runMonitor/historyData',
        query: {
          siteId: this.activePoint?.deviceId || '',
          pointCode: JSON.stringify([this.activePoint?.pointName]) || []
        }
      });
    },
    onSearch(val) {
      let params = {
        devicePoints: [
          {
            deviceId: this.activePoint?.deviceId,
            points: [this.activePoint?.pointName]
          }
        ],
        displayType: [],
        deviceType: 'INDUSTRY_DEVICE',
        productCode: config.productCode,
        ...val
      };
      this.getHistoryData(params);
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.chart-con {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  .empty-title {
    padding: 0 12px;
    padding-top: 10px;
    font-weight: 500;
    color: var(--supply-color-main);
  }
  .tips {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .header {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    align-items: center;
    padding-right: 4%;
    /deep/.wpg-form-item-label {
      display: inline-block;
      overflow: hidden;
      line-height: 30px;
      white-space: nowrap;
      text-align: right;
      vertical-align: middle;
    }
    /deep/.query-form {
      padding: 0 0 0 12px !important;
    }
    /deep/.query-form .date-con .text {
      margin-left: 4px;
    }
    /deep/.wpg-select-selection--single .wpg-select-selection__rendered {
      margin-right: 20px;
    }
    /deep/.wpg-select-arrow {
      display: inline-block;
      font-style: normal;
      text-align: center;
      text-transform: none;
      vertical-align: -0.125em;
      text-rendering: optimizeLegibility;
      position: absolute;
      top: 50%;
      right: 7px;
      margin-top: -6px;
      color: #c0c0c0;
      font-size: 12px;
      line-height: 1;
      transform-origin: 50% 50%;
    }
    /deep/.query-form .wpg-form-item {
      display: flex;
      margin: 0;
      padding: 0 6px 0 0;
    }
    /deep/.wpg-select-selection__rendered {
      position: relative;
      display: block;
      margin-left: 9px;
      line-height: 28px;
    }
    /deep/.wpg-select-selection--single {
      position: relative;
      height: 30px;
      cursor: pointer;
    }
    /deep/.wpg-form-item-control {
      position: relative;
      line-height: 30px;
      zoom: 1;
    }
    /deep/.wpg-radio-button-wrapper {
      display: inline-block;
      height: 30px;
      margin: 0;
      padding: 0 8px;
      line-height: 30px;
      border: 1px solid #d6d6d6;
      border-top-width: 1.02px;
      cursor: pointer;
      transition: color 0.3s, background 0.3s, border-color 0.3s;
    }
    @media screen and (max-width: 1400px) {
      /deep/.wpg-radio-button-wrapper {
        display: inline-block;
        height: 30px;
        margin: 0;
        padding: 0 5px;
        line-height: 30px;
        border: 1px solid #d6d6d6;
        border-top-width: 1.02px;
        cursor: pointer;
        transition: color 0.3s, background 0.3s, border-color 0.3s;
      }
    }
    /deep/.wpg-btn {
      line-height: 1.5;
      position: relative;
      display: inline-block;
      font-weight: 400;
      white-space: nowrap;
      text-align: center;
      background-image: none;
      border: 1px solid transparent;
      cursor: pointer;
      transition: all 0.3s cubic-bezier(0.645, 0.045, 0.355, 1);
      user-select: none;
      touch-action: manipulation;
      height: 30px;
      padding: 0 8px;
      font-size: 14px;
      border-radius: 4px;
    }
    /deep/.wpg-input {
      margin: 0;
      font-variant: tabular-nums;
      list-style: none;
      font-feature-settings: 'tnum';
      position: relative;
      display: inline-block;
      width: 100%;
      height: 30px;
      padding: 8px 12px;
      color: #666666;
      font-size: 14px;
      background-color: #fff;
      background-image: none;
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      transition: all 0.3s;
    }
  }

  .data-body {
    // margin-top: 12px;
    height: calc(100% - 85px);
    overflow: hidden;
    display: flex;
  }
}
</style>
