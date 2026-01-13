<!--
 * @Description: 历史数据的图表组件
 * @version:
 * @Author: liuct
 * @Date: 2021-07-14 15:11:24
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-03-31 09:57:35
-->
<template>
  <div id="chartCon" class="chart-con">
    <div v-if="searchLineInfo && page !== 'inspect'" class="tool-box">
      <w-icon
        v-for="item in toolIcon"
        :key="item.icon"
        :title="item.title"
        :type="item.icon"
        :class="`tool-icon ${item.type === currentType ? 'active' : ''}`"
        @click="handlerType(item.type)"
      ></w-icon>
    </div>
    <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
    <div v-if="tips" class="tips">
      <w-empty></w-empty>
    </div>

    <w-empty
      v-else-if="
        (searchLineInfo && chartOption.series.length <= 0) ||
          (searchRunInfo && barOption.series.length <= 0)
      "
    />
    <div v-else class="chart-body">
      <div v-show="searchLineInfo" class="line-chart">
        <div ref="chartBox" class="chart-wrap">
          <bar-chart
            v-show="chartOption.series.length > 0"
            :option="chartOption"
            :darkTheme="'light'"
          ></bar-chart>
        </div>
        <w-table
          v-show="currentType === 'table'"
          bordered
          :columns="columns"
          :data-source="data"
          class="table"
          :scroll="scroll"
        ></w-table>
      </div>
      <!-- 泵机带图 -->
      <bar-chart
        v-show="searchRunInfo && barOption.series.length > 0"
        class="bar-chart"
        :option="barOption"
        :darkTheme="'light'"
      ></bar-chart>
    </div>
  </div>
</template>

<script>
import { exportFile, base64ToBlob } from '@/utils/util';
import html2canvas from 'html2canvas';
import { chartOption, toolIcon, defaultColumns, barOption } from './data';
import {
  getHistoryDataByMultiDate,
  multiPumpData,
  getHistoryDataTable,
  historyExcel
} from '@/api/analysis';
import {
  GetHistoryDataByPumpId // 巡检污水厂监测量
} from '@/api/home';
import { FPegiilmmprtuuu, singleDeviceFigure } from '@/api/runMonitor';
let pumpsStartDate = '';
let pumpsEndDate = '';
const DAYMINUTE = 1440;

function _changeHourMinutestr(xNum) {
  let arr = pumpsStartDate.slice(11).split(':');
  let num = xNum;
  num = Number(num) + 60 * Number(arr[0]) + Number(arr[1]);
  if (num > DAYMINUTE) {
    num = num % DAYMINUTE;
    num = num === 0 ? num + DAYMINUTE : num;
  }
  if (num !== '' && num !== null) {
    let _time =
      (Math.floor(num / 60).toString().length < 2
        ? '0' + Math.floor(num / 60).toString()
        : Math.floor(num / 60).toString()) +
      ':' +
      ((num % 60).toString().length < 2 ? '0' + (num % 60).toString() : (num % 60).toString());
    return _time;
  } else {
    return '';
  }
}

export default {
  name: 'ChartTable',
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  props: {
    itemConfig: {
      type: Object,
      default: () => {}
    },
    pointGroupCategory: {
      type: Object,
      default: () => {}
    },
    searchLineInfo: {
      type: Object,
      default: () => {}
    },
    searchRunInfo: {
      type: Object,
      default: () => {}
    },
    tips: {
      type: String,
      default: '请选择设备或者监测量！'
    },
    type: {
      type: String,
      default: 'multiple' // single 单设备， multiple 多设备
    },
    isPumpGroup: {
      type: String,
      default: ''
    },
    page: {
      type: String,
      default: ''
    },
    min: {
      type: Array
    },
    max: {
      type: Array
    },
    disPlayType: {
      // 每个监测量对应的展示类型
      type: Object,
      default: () => null
    }
  },
  data() {
    return {
      isLoading: false,
      toolIcon,
      currentType: 'line',
      chartOption,
      barOption, // 泵机带图
      defaultColumns,
      columns: [],
      data: [], // 表格数据
      tData: [], // 接口请求到的表格数据
      selectedRowKeys: [],
      mapping: {
        bar: () => this.changeOptionType('bar'),
        line: () => this.changeOptionType('line')
      },
      scroll: {
        x: 0,
        y: 0
      }
    };
  },
  watch: {
    searchLineInfo: {
      handler: function(val) {
        if (!this.tips && val) {
          this.getHistoryData();
          this.getHistoryDataTable();
        }
      },
      deep: true,
      immediate: true
    },
    searchRunInfo: {
      handler: function(val) {
        if (!this.tips && val) {
          this.getBeltData();
        }
      },
      deep: true
    }
  },
  created() {},
  mounted() {
    window.onresize = () => {
      this.useEffect();
    };
  },
  methods: {
    useEffect() {
      let x = this.columns.length * 120;
      this.$nextTick(() => {
        if (document.querySelector('.chart-body')) {
          const boxHeight = document.querySelector('.chart-body').clientHeight;
          const headerHeight = document.querySelector('.wpg-table-thead')?.offsetHeight || 0;
          const pagenationHeight = document.querySelector('.wpg-pagination')
            ? document.querySelector('.wpg-pagination').offsetHeight
            : 0;
          this.scroll = {
            x,
            y: boxHeight - headerHeight - pagenationHeight - 70
          };
        }
      });
    },

    handlerType(type) {
      if (type === 'export') {
        this.historyExcel();
        return;
      }
      this.currentType = type;

      if (type === 'table') {
        this.handlerSimpColumn(this.tData);
        return;
      }

      this.mapping[type]();
    },
    exportImg(name) {
      setTimeout(() => {
        html2canvas(this.$refs.chartBox)
          .then(function(canvas) {
            let img = canvas.toDataURL('image/jpeg', 1.0);
            exportFile(base64ToBlob(img), name, 'jpeg', 'image/jpeg');
          })
          .finally(() => {
            this.isLoading = false;
          });
      }, 500);
    },
    historyExcel() {
      if (this.isLoading) return;
      this.isLoading = true;
      let exportPumpName = ''; // 污水厂名称
      let pointGroupName = ''; // 监测量名称
      if (undefined !== this.itemConfig) {
        if (undefined !== this.itemConfig.exportPumpName) {
          exportPumpName = this.itemConfig.exportPumpName || '';
        }
        // 组态上面单个监测量点击：单个
        if (this.type === 'single' && undefined !== this.itemConfig.exportPointName) {
          pointGroupName = this.itemConfig.exportPointName || '';
        }
      }
      // 数据点击：多个
      if (
        this.type === 'multiple' &&
        undefined !== this.pointGroupCategory &&
        undefined !== this.pointGroupCategory.pointGroupName
      ) {
        pointGroupName = this.pointGroupCategory.pointGroupName || '';
      }

      if (this.currentType !== 'table') {
        this.exportImg(exportPumpName + pointGroupName + '历史数据');
        return;
      }
      const params = {
        ...this.searchLineInfo,
        // crossFlag: this.toolIcon[1].icon.includes('1')
        // 这里设置为false,将crossFlag修改为false,行列转换,超过255导出excel报错
        crossFlag: false
      };
      // 导出xls格式文件
      historyExcel(params)
        .then(res => {
          exportFile(res, exportPumpName + pointGroupName + '历史数据', 'xls');
        })
        .finally(() => {
          this.isLoading = false;
        });
    },

    changeColums() {
      const isRow = this.toolIcon[1].icon.includes('1');
      if (isRow) {
        this.handlerRow(this.tData);
      } else {
        this.handlerColumn(this.tData);
      }
    },

    changeOptionType(type) {
      this.chartOption.series.forEach(item => {
        item.type = type;
        if (type === 'bar') {
          item.barWidth = 10;
        }
      });
    },

    async getHistoryData() {
      if (this.searchLineInfo.codes && this.searchLineInfo.codes.length <= 0) {
        this.chartOption.series = [];
        return;
      }
      this.globalLoading.show({ domId: 'chartCon' });
      let res = { resultData: [] };
      if (this.searchLineInfo.pumpId) {
        if (this.searchLineInfo.codes && this.searchLineInfo.codes.length) {
          res = await GetHistoryDataByPumpId(this.searchLineInfo);
        }
      } else {
        res = await getHistoryDataByMultiDate(this.searchLineInfo);
      }
      this.globalLoading.hide({ domId: 'chartCon' });
      if (res && res.resultData) {
        this.handlerChartData(res.resultData);
      }
    },

    handlerChartData(data) {
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
          },
          min: function(value) {
            return value.min;
          },
          max: function(value) {
            return value.max;
          }
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
                // show: true,
                lineStyle: {
                  // color: '#DEE2E7'
                }
              },
              offset: ind > 1 ? (ind - 1) * 35 : 0,
              min: function(value) {
                return 0;
              }
              // max: function(value) {
              //   return value.max;
              // }
            });
          }
          const devices = Object.keys(date.data[unit]);
          devices.forEach((device, dindex) => {
            const points = Object.keys(date.data[unit][device]);
            // eslint-disable-next-line max-nested-callbacks
            points.forEach((point, i) => {
              const pointData = date.data[unit][device][point];
              // eslint-disable-next-line max-nested-callbacks
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
                this.searchLineInfo.dates.length > 1
                  ? this.searchLineInfo.timeEnum === 'DAYS'
                    ? date.startTime.substring(0, 7)
                    : date.startTime.split(' ')[0]
                  : '';
              const pv = {
                name: pointData[0].deviceName + pointData[0].pointMemo + time,
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
      if (this.searchLineInfo.dates.length > 1) {
        xAxisData = xAxisData.map(item => {
          if (this.searchLineInfo.timeEnum === 'DAYS') {
            return item.substring(8, 10);
          } else {
            return item.substring(11);
          }
        });
      } else {
        xAxisData = xAxisData.map(item => {
          if (this.searchLineInfo.timeEnum === 'DAYS') {
            return item.substring(8, 10);
          } else if (this.searchLineInfo.timeEnum === 'MINUTES') {
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
        // this.chartOption.series[0].markLine = {
        //   data: [
        //     {
        //       name: 'max',
        //       yAxis: this.max
        //     },
        //     {
        //       name: 'min',
        //       yAxis: this.min
        //     }
        //   ]
        // };
        // this.chartOption.yAxis[0].max = Math.max(...maximumMax, this.max);
        // this.chartOption.yAxis[0].min = Math.min(...maximumMax, this.min);
      } else if (this.chartOption.series?.[0]) {
        this.chartOption.series[0].markLine = {
          data: []
        };
        // if (this.chartOption.yAxis?.[0]?.max) {
        //   delete this.chartOption.yAxis[0].max;
        //   delete this.chartOption.yAxis[0].min;
        // }
      }
    },

    async getBeltData() {
      if (this.isPumpGroup === 'single') {
        if (this.searchRunInfo.devicePoints[0].deviceId) {
          const { resultData } = await singleDeviceFigure(
            this.searchRunInfo.devicePoints[0].deviceId
          );
          this.handlerData(resultData);
        } else {
          this.handlerData([]);
        }
      } else {
        const method = this.isPumpGroup === 'multiple' ? FPegiilmmprtuuu : multiPumpData;
        const { resultData } = await method(this.searchRunInfo);
        this.handlerData(resultData);
      }
    },

    handlerData(data) {
      data = data || [];
      const list = [];
      data.forEach((item, index) => {
        if (index === 0) {
          pumpsStartDate = item.startTime;
          pumpsEndDate = item.endTime;
        }
        const devKeys = Object.keys(item.datas);
        devKeys.forEach(dev => {
          const pointKeys = Object.keys(item.datas[dev]);
          pointKeys.forEach(key => {
            const point = item.datas[dev][key];
            const name = `${index > 0 ? item.startTime : ''} ${
              this.type === 'multiple' ? dev : key
            }`;
            list.push({ name, data: point });
          });
        });
      });
      this.handlerBarData(list);
    },

    handlerBarData(data) {
      data.reverse();
      // 停止 工频 变频 故障 未知
      const colors = ['#B0B0B0', '#0ACC9D', '#4183F1', '#FFBF00', '#EFEFEF'];
      let sData = [];
      let yData = [];
      if (data.length > 0) {
        data.forEach((r, idx) => {
          yData.push(r.name);
          r.data.forEach((d, i) => {
            if (sData[i] && sData[i].name) {
              // eslint-disable-next-line max-nested-callbacks
              sData[i].data.forEach((item, idx) => {
                if (!item) {
                  item = {
                    value: 0
                  };
                }
              });
              sData[i].data[idx] = {
                value: d.time,
                status: d.status,
                startDate: d.startTime,
                endDate: d.endTime,
                itemStyle: {
                  normal: {
                    barBorderRadius: 0,
                    color: colors[d.status]
                  },
                  emphasis: {
                    color: colors[d.status]
                  }
                }
              };
            } else {
              let temp = [];
              if (idx > 0) {
                for (let i = 0; i < idx; i++) {
                  temp[i] = { value: 0 };
                }
              }
              temp[idx] = {
                value: d.time,
                status: d.status,
                startDate: d.startTime,
                endDate: d.endTime,
                itemStyle: {
                  normal: {
                    barBorderRadius: 0,
                    color: colors[d.status]
                  },
                  emphasis: {
                    color: colors[d.status]
                  }
                }
              };
              sData[i] = {
                name: r.name,
                type: 'bar',
                stack: 'pump',
                barWidth: 12,
                data: [...temp],
                color: colors
              };
            }
          });
        });
      }
      this.barOption.series = sData;
      this.barOption.yAxis[0].data = yData;
      this.barOption.xAxis[0].axisLabel.formatter = val => {
        const time = _changeHourMinutestr(Number(val));
        return time;
      };
      const max = Math.ceil(
        (this.$moment(pumpsEndDate) - this.$moment(pumpsStartDate)) / 1000 / 60
      );
      this.barOption.xAxis[0].max = max;
    },

    async getHistoryDataTable() {
      if (this.page === 'inspect') return false;
      const { resultData } = await getHistoryDataTable(this.searchLineInfo);
      this.tData = resultData;
      this.handlerSimpColumn(this.tData);
    },
    // 时间竖着排列简化版
    handlerSimpColumn(data) {
      if (data.length <= 0) {
        this.data = [];
        return;
      }
      const columns = [
        {
          title: '时间',
          dataIndex: 'dateTime',
          align: 'center',
          width: 160,
          ellipsis: true
        }
      ];
      const records = [];
      data.forEach((station, index) => {
        station.devices.forEach((dev, ind) => {
          let key = index + dev.deviceId;
          dev.points.forEach((point, i) => {
            key = dev.deviceId + point.pointName;
            const unit = point.data[0]?.eu && point.data[0].eu !== 'none' ? point.data[0].eu : '';
            const title = point.data[0]
              ? point.data[0].deviceName + '-' + point.data[0].pointMemo + unit
              : point.pointName;
            columns.push({
              title: <span title={title}>{title}</span>,
              dataIndex: key,
              align: 'center',
              width: 120,
              ellipsis: true
            });
            // eslint-disable-next-line max-nested-callbacks
            point.data.forEach((date, di) => {
              if (index === 0 && ind === 0 && i === 0) {
                records.push({ dateTime: date.dateTime, key: di + date.deviceId });
              }
              records[di][key] = date.displayType === 4 ? date.dvAfterRatio : date.pvAfterRatio;
            });
          });
        });
      });
      this.columns = [...this.defaultColumns, ...columns];
      this.data = records;
      this.useEffect();
    },

    // 时间竖着排列
    handlerColumn(data) {
      if (data.length <= 0) {
        return;
      }
      const columns = [
        {
          title: '时间',
          dataIndex: 'dateTime',
          align: 'center',
          width: 120,
          ellipsis: true
        }
      ];
      const records = [];
      data.forEach((station, index) => {
        if (this.type === 'multiple') {
          columns.push({
            title: station.stationName,
            ellipsis: true,
            align: 'center',
            children: []
          });
        }
        station.devices.forEach((dev, ind) => {
          let key = index + dev.deviceId;
          if (this.type === 'multiple') {
            columns[1 + index].children.push({
              title: dev.deviceName,
              dataIndex: key,
              align: 'center',
              width: 120,
              ellipsis: true
            });
          }
          if (this.type === 'single') {
            columns.push({
              title: dev.deviceName,
              ellipsis: true,
              align: 'center',
              children: []
            });
          }
          dev.points.forEach((point, i) => {
            if (this.type === 'single') {
              key = i + point.pointName;
              columns[1 + ind].children.push({
                title: point.pointName,
                dataIndex: key,
                align: 'center',
                width: 120,
                ellipsis: true
              });
            }
            // eslint-disable-next-line max-nested-callbacks
            point.data.forEach((date, di) => {
              if (index === 0 && ind === 0 && i === 0) {
                records.push({ dateTime: date.dateTime, key: di });
              }
              records[di][key] = date.displayType === 4 ? date.dvAfterRatio : date.pvAfterRatio;
            });
          });
        });
      });
      this.columns = [...this.defaultColumns, ...columns];
      this.data = records;
      this.useEffect();
    },

    // 时间横着排列
    handlerRow(data) {
      if (data.length <= 0) {
        return;
      }
      const len =
        this.type === 'multiple' ? data[0].devices.length : data[0].devices[0].points.length;
      const renderContent = (value, row, index) => {
        const obj = {
          children: value,
          attrs: {}
        };
        if (index % len !== 0) {
          obj.attrs.rowSpan = 0;
        } else {
          obj.attrs.rowSpan = len;
        }
        return obj;
      };
      const columns = [
        {
          title: this.type === 'multiple' ? '污水厂名称' : '设备名称',
          dataIndex: this.type === 'multiple' ? 'stationName' : 'deviceName',
          align: 'center',
          ellipsis: true,
          width: 120,
          customRender: renderContent
        },
        {
          title: this.type === 'multiple' ? '设备名称' : '监测量名称',
          dataIndex: this.type === 'multiple' ? 'deviceName' : 'pointName',
          align: 'center',
          width: 120,
          ellipsis: true
        }
      ];
      const records = [];
      data.forEach((station, index) => {
        station.devices.forEach((dev, ind) => {
          let item;
          if (this.type === 'multiple') {
            item = {
              stationName: station.stationName,
              deviceName: dev.deviceName,
              key: ind
            };
          }
          dev.points.forEach((point, i) => {
            if (this.type === 'single') {
              item = {
                deviceName: dev.deviceName,
                pointName: point.data[0] ? point.data[0].pointMemo : '',
                key: i
              };
            }
            // eslint-disable-next-line max-nested-callbacks
            point.data.forEach((date, di) => {
              if (index === 0 && ind === 0 && i === 0) {
                columns.push({
                  title: date.dateTime,
                  dataIndex: date.dateTime,
                  ellipsis: true,
                  align: 'center',
                  width: 120
                });
              }
              item[date.dateTime] = date.displayType === 4 ? date.dvAfterRatio : date.pvAfterRatio;
            });
            if (this.type === 'single') {
              records.push(item);
            }
          });
          if (this.type === 'multiple') {
            records.push(item);
          }
        });
      });

      this.columns = [...this.defaultColumns, ...columns];
      this.selectedRowKeys = columns;
      this.data = records;
      this.useEffect();
    }
  }
};
</script>

<style lang="less" scoped>
.chart-con {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  .chart-spin {
    position: absolute;
    left: 55%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
  .tips {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .chart-body {
    width: 100%;
    height: calc(100% - 30px);
    border: 1px solid transparent;
    .bar-chart {
      width: 100%;
      height: 100%;

      // /deep/canvas{
      //   height: 190px!important;
      // }
    }
    .line-chart {
      width: 100%;
      height: 100%;
    }
    .line-chart {
      position: relative;
      .chart-wrap {
        width: 100%;
        height: 100%;
      }
      .table {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        background: var(--supply-color-bg-card-DEFAULT);
      }
    }
  }

  .tool-box {
    width: 100%;
    text-align: right;
    color: #999;

    .tool-icon {
      cursor: pointer;
      margin-right: 8px;

      &.active {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
  }
}
</style>
