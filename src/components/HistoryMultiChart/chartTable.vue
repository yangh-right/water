<!--
 * @Description: 历史数据的图表组件
 * @version:
 * @Author: liuct
 * @Date: 2021-07-14 15:11:24
 * @LastEditors: wangyr
 * @LastEditTime: 2024-12-04 14:11:06
-->
<template>
  <div id="chartCon" class="chart-con">
    <div v-if="searchLineInfo && showToolBox" class="tool-box">
      <w-icon
        v-for="item in toolIcon"
        :key="item.icon"
        :title="item.title"
        :type="item.icon"
        :class="`tool-icon ${item.type === currentType ? 'active' : ''}`"
        @click="handlerType(item.type)"
      ></w-icon>
    </div>
    <div v-if="tips" class="tips">
      <w-empty :description="tips"></w-empty>
    </div>
    <w-empty
      class="tips"
      v-else-if="
        (searchLineInfo && allOption.length <= 0) || (searchRunInfo && barOption.series.length <= 0)
      "
    />
    <div
      v-else
      class="chart-body"
      :style="{ height: showToolBox ? 'calc(100% - 42px)' : 'calc(100% - 12px)' }"
    >
      <div v-resize="handleResize" v-show="searchLineInfo" class="line-chart">
        <div
          v-show="currentType === 'line'"
          id="chartBlock"
          class="chart-block"
          :style="{
            height:
              allOption.length < chartMinNum
                ? 'calc(100% - 12px)'
                : allOption.length * chartHeight + 'px'
          }"
        >
          <template>
            <div v-if="allOption.length > 0" class="chart">
              <div
                :style="`height:calc(${chartNum ? 1 / chartNum : 0} * 100% )`"
                class="chart-wrapper__item"
                v-for="(item, index) in allOption"
                :key="item"
              >
                <line-chart
                  :ref="'chart' + index"
                  :darkTheme="'light'"
                  :option="item"
                  :index="index"
                  @myChartClick="myChartClick"
                ></line-chart>
              </div>
            </div>
          </template>
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
    <w-modal v-model="markVisible" :title="title" width="600px" @cancel="cancel">
      <w-form-model :model="markForm" :label-col="labelCol" :wrapper-col="wrapperCol">
        <w-form-model-item label="构筑物">{{ markForm.deviceName }}</w-form-model-item>
        <w-form-model-item label="参数监测量">{{ markForm.pointName }} </w-form-model-item>
        <w-form-model-item label="时间区间">
          {{ markForm.startTime + ' ~ ' + markForm.endTime }}</w-form-model-item
        >
        <w-form-model-item label="标注原因">
          <span v-if="!markEdit">{{ markForm.remark }}</span>
          <w-textarea v-else v-model="remark" placeholder="请输入标注原因" />
        </w-form-model-item>
      </w-form-model>
      <template slot="footer">
        <w-button v-if="!markEdit" key="submit" type="primary" @click="markEditClick">
          {{ markStatus === 'add' ? '新增' : '修改' }}
        </w-button>
        <w-button v-if="markEdit" key="back" @click="markEdit = false">
          取消
        </w-button>
        <w-button v-if="markEdit" key="submit" type="primary" @click="markSaveClick">
          保存
        </w-button>
      </template>
    </w-modal>
  </div>
</template>

<script>
import { exportFile, rgbToHsl, hslToRgb } from '@/utils/util';
import * as echarts from 'echarts';
import { chartOption, toolIcon, defaultColumns, barOption, _colors } from './data';
import {
  getHistoryDataByMultiDate,
  multiPumpData,
  getHistoryDataTable,
  historyExcel,
  getByParam,
  addRemark,
  updateRemark,
  getRemarkList
} from '@/api/analysis';
import {
  GetHistoryDataByPumpId // 巡检污水厂监测量
} from '@/api/home';
import { FPegiilmmprtuuu, singleDeviceFigure } from '@/api/runMonitor';
let pumpsStartDate = '';
let pumpsEndDate = '';
const _stepTypeList = [0, 4, 5];
const DAYMINUTE = 1440;
const _chartEnum = ['enumZeroName', 'enumOneName'];
function getChartValue(value, displayType, enumOneName, enumZeroName) {
  if (displayType === 0) {
    if (value === 1) {
      return enumOneName ?? value ?? '--';
    } else if (value === 0) {
      return enumZeroName ?? value ?? '--';
    } else {
      return '';
    }
  } else {
    return value;
  }
}
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
    BarChart: () => import('@/components/chart/BarChart.vue'),
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  props: {
    chartMinNum: {
      //至少多少个图表开始固定图表的高度
      type: Number,
      default: 3
    },
    chartItemHeight: {
      //固定图表的高
      type: Number,
      default: 231
    },
    isCompare: {
      type: Boolean,
      default: false
    },
    allTreeData: {
      type: Array,
      default: () => []
    },
    deviceInfo: {
      type: Object,
      default: () => {}
    },
    pumpHouseName: {
      type: String,
      default: ''
    },
    itemConfig: {
      type: Object,
      default: () => {}
    },
    treeDataObj: {
      type: Object,
      default: () => null
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
    showToolBox: {
      type: Boolean,
      default: false
    },
    min: {
      type: Number,
      default: 0
    },
    max: {
      type: Number,
      default: 0
    },
    disPlayType: {
      // 每个监测量对应的展示类型
      type: Object,
      default: () => null
    },
    showMark: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      labelCol: { span: 4 },
      wrapperCol: { span: 20 },
      markForm: {
        startTime: '',
        endTime: '',
        deviceId: '',
        deviceName: '',
        pointName: '',
        remark: ''
      },
      remark: '',
      markEdit: false,
      chartHeight: this.chartItemHeight,
      allOption: [],
      chartNum: 0,
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
      },
      totalData: [],
      markVisible: false,
      markStatus: 'add'
    };
  },
  computed: {
    myChart() {
      if (document.getElementById('myChart')) {
        return echarts.init(document.getElementById('myChart'));
      }
      return '';
    },
    title() {
      let text = '标注信息';
      if (this.markStatus === 'add' && this.markEdit) {
        text = '新增标注信息';
      } else if (this.markStatus === 'edit' && this.markEdit) {
        text = '修改标注信息';
      }
      return text;
    }
  },
  watch: {
    allOption: {
      handler() {
        this.handleResize();
        this.$nextTick(() => {
          this.drawLine();
        });
      }
    },
    searchLineInfo: {
      handler: function(val) {
        if (!this.tips && val) {
          this.getHistoryData();
          this.getHistoryDataTable();
        } else {
          this.allOption = [];
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
  mounted() {
    window.onresize = () => {
      this.useEffect();
    };
  },
  methods: {
    async myChartClick(params, index) {
      let obj = this.totalData[index];
      let data = {
        startTime: params.data.coord[0][0],
        endTime: params.data.coord[1][0],
        deviceId: obj[0][0].deviceId,
        deviceName: obj[0][0].deviceName,
        pointName: obj.pointName
      };
      let res = await getByParam(data);
      if (res.resultData) {
        this.markForm = {
          ...res.resultData,
          deviceName: res.resultData.deviceName ? res.resultData.deviceName : obj[0][0].deviceName
        };
        this.markStatus = 'edit';
      } else {
        this.markForm = {
          startTime: params.data.coord[0][0],
          endTime: params.data.coord[1][0],
          deviceId: obj[0][0].deviceId,
          deviceName: obj[0][0].deviceName,
          pointName: obj.pointName,
          remark: ''
        };
        this.markStatus = 'add';
      }
      this.markVisible = true;
    },
    markEditClick() {
      this.remark = this.markForm.remark;
      this.markEdit = true;
    },
    cancel() {
      this.markEdit = false;
      this.markVisible = true;
    },
    markSaveClick() {
      let params = {
        ...this.markForm,
        remark: this.remark
      };
      if (this.markStatus === 'add') {
        addRemark(params).then(res => {
          if (res.status === 'complete') {
            this.$message.success('添加标注成功！');
            this.markEdit = false;
            this.markVisible = false;
            this.getHistoryData();
          }
        });
      } else {
        updateRemark(params).then(res => {
          if (res.status === 'complete') {
            this.$message.success('修改标注成功！');
            this.markEdit = false;
            this.markVisible = false;
            this.getHistoryData();
          }
        });
      }
    },
    useEffect() {
      this.$nextTick(() => {
        if (document.querySelector('.chart-body')) {
          const boxHeight = document.querySelector('.chart-body').clientHeight;
          const headerHeight = document.querySelector('.wpg-table-thead')?.offsetHeight || 0;
          const pagenationHeight = document.querySelector('.wpg-pagination')
            ? document.querySelector('.wpg-pagination').offsetHeight
            : 0;
          this.scroll = {
            x: 1286,
            y: boxHeight - headerHeight - pagenationHeight - 70
          };
        }
      });
    },
    /**
     * 渲染图表
     */
    drawLine() {
      if (this.myChart) {
        this.myChart.clear();
        this.myChart.setOption(this.allOption);
        this.resize();
      }
    },
    resize() {
      this.$nextTick(() => {
        if (this.myChart) this.myChart.resize();
      });
    },
    handleResize() {
      this.$nextTick(() => {
        const chartsDom = document.querySelector('.line-chart');
        if (chartsDom) {
          const chartsHeight = chartsDom.clientHeight;
          if (chartsHeight > this.chartItemHeight * this.chartNum && this.chartNum) {
            this.chartHeight = chartsHeight / this.chartNum;
          } else {
            this.chartHeight = this.chartItemHeight;
          }
          this.resize();
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

    historyExcel() {
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

      const params = {
        ...this.searchLineInfo,
        // 这里设置为false,将crossFlag修改为false,行列转换,超过255导出excel报错
        crossFlag: false
      };
      // 导出xls格式文件
      historyExcel(params).then(res => {
        exportFile(res, exportPumpName + pointGroupName + '历史数据', 'xls');
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
      let params = { ...this.searchLineInfo };
      if (
        (this.searchLineInfo.period === '1' || this.searchLineInfo.period === 1) &&
        this.showMark
      ) {
        params.showMark = true;
      }
      delete params.type;
      delete params.interval;
      this.$emit('setLoadStatus', true);
      let res = null;
      try {
        res = this.searchLineInfo.pumpId
          ? await GetHistoryDataByPumpId(params)
          : await getHistoryDataByMultiDate(params);
      } catch (error) {
        console.log(error);
      }
      if (res?.resultData?.length) {
        !this.isCompare
          ? this.handlerChartData(res?.resultData)
          : this.handlerCompareData(res?.resultData);
      } else {
        this.handlerEmptyData();
      }
    },
    handlerEmptyData() {
      this.allOption = [];
      let pointsName = [];
      this.searchLineInfo.devicePoints.forEach(item => {
        pointsName.push(...item.points);
      });
      let treeData = this.allTreeData.filter(item => pointsName.indexOf(item.pointName) !== -1);
      this.chartNum = treeData.length;
      let chartOptions = [];
      treeData.map((data, indexF) => {
        let xData = [
          this.searchLineInfo.dates?.[0].startTime,
          this.searchLineInfo.dates?.[0].endTime
        ];
        let myOption = {
          legend: {
            show: false
          },
          tooltip: {
            trigger: 'axis',
            confine: true,
            formatter: params => {
              let html = '';
              params.forEach((item, i) => {
                let isDint = false;
                let {
                  data: { value, displayType, enumOneName, enumZeroName }
                } = item;
                if (i == 0) {
                  isDint = item.seriesName.slice(-4) === '水泵状态';
                  html += `<span>时间：${item.name}</span>
                          <p style="margin-bottom: 8px">
                              <span style="display:inline-block;
                              vertical-align: middle;
                              margin-right:4px;border-radius:6px;
                              width:10px;height:10px;background-color:${item.color};"></span>
                              ${item.seriesName} ：${
                    isDint
                      ? pumpStatus[item.data] || '未知'
                      : getChartValue(value, displayType, enumOneName, enumZeroName)
                  }
                          </p>`;
                } else {
                  isDint = item.seriesName.slice(-4) === '水泵状态';
                  html += ` <p style="margin-bottom: 8px">
                              <span style="display:inline-block;
                              vertical-align: middle;
                              margin-right:4px;border-radius:6px;
                              width:10px;height:10px;background-color:${item.color};"></span>
                              ${item.seriesName} ：${
                    isDint
                      ? pumpStatus[item.data] || '未知'
                      : getChartValue(value, displayType, enumOneName, enumZeroName)
                  }
                          </p>`;
                }
              });
              return html;
            }
          },
          axisPointer: {
            link: { xAxisIndex: 'all' },
            label: {
              backgroundColor: '#777'
            }
          },
          grid: [],
          xAxis: [],
          yAxis: [],
          title: [],
          series: []
        };
        let grid = [];
        let xAxis = [];
        let yAxis = [];
        let series = [];
        let title = [];

        xAxis.push({
          type: 'category',
          gridIndex: 0,
          data: xData,
          scale: true,
          boundaryGap: false,
          axisLine: {
            show: true,
            lineStyle: {}
          },
          axisTick: {
            show: true
          },
          splitLine: {
            show: false
          },
          min: 'dataMin',
          max: 'dataMax',
          axisPointer: {
            z: 100
          }
        });
        yAxis.push({
          type: 'value',
          axisLine: {
            show: true,
            lineStyle: {}
          },
          gridIndex: 0,
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          },
          axisLabel: {
            formatter: (value, index) => {
              return value + (data.pointUnit ? '(' + data.pointUnit + ')' : '');
            }
          },
          min: 0,
          max: 5
        });

        grid.push({
          left: '85',
          right: '16',
          top: '30',
          bottom: '20',
          containLabel: false
        });
        series.push({
          name: data?.pointMemo,
          step: false,
          pumpName: data?.stationName || '',
          type: 'line',
          data: [null, null, null],
          smooth: true,
          symbol: 'circle',
          itemStyle: {
            color: 'rgb(' + this.getColor(_colors, indexF, 0) + ')'
          },
          areaStyle: {
            opacity: 0.5,
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0.15,
                  color: 'rgba(' + this.getColor(_colors, indexF, 0) + ',0.3)' //0.3
                },
                {
                  offset: 1,
                  color: 'rgba(' + this.getColor(_colors, indexF, 0) + ',0.08)' //0.08
                }
              ],
              global: false // 缺省为 false
            }
          }
        });

        title = {
          show: true,
          text: this.deviceInfo.name + ':' + data.pointMemo,
          left: '100',
          top: '7',
          textStyle: {
            color: 'rgb(' + this.getColor(_colors, indexF, 0) + ')',
            fontWeight: 'normal',
            fontSize: 12
          }
        };

        myOption.xAxis = xAxis;
        myOption.yAxis = yAxis;
        myOption.series = series;
        myOption.title = title;
        myOption.grid = grid;
        chartOptions.push(myOption);
      });
      this.allOption = [...chartOptions];

      setTimeout(() => {
        let connectChart = [];
        this.allOption.map((item, index) => {
          connectChart.push(
            this.$refs['chart' + index] ? this.$refs['chart' + index][0]?.myChart : {}
          );
        });
        echarts.connect(connectChart);
        this.$emit('setLoadStatus', false);
      }, 1000);
    },
    getLastData(data, arr, prefix = '') {
      if (Array.isArray(Object.values(data)[0])) {
        Object.keys(data).forEach(item => {
          arr[prefix + '_' + item] = data[item];
        });
      } else {
        Object.keys(data).map(key => this.getLastData(data[key], arr, prefix + '_' + key));
      }
    },
    getColor(colorList, chartI, i) {
      let chartColor = '';
      if (chartI < colorList.length) {
        chartColor = rgbToHsl(...colorList[chartI]);
      } else {
        chartColor = [(67 * chartI) % 360, 50, 50];
      }
      return hslToRgb(
        chartColor[0] % 360,
        this.getSuitNum(chartColor[1], 23, i, 100, 15, 100),
        this.getSuitNum(chartColor[2], 43, i, 100, 30, 90)
      ).join(',');
    },
    getSuitNum(base, multiplier, i, remainder, min, max) {
      let res = (base + multiplier * i) % remainder;
      if (res < min || res > max) {
        return this.getSuitNum(base, multiplier, i + 1, remainder, min, max);
      } else {
        return res;
      }
    },
    handlerChartData(resultData) {
      if (resultData.length) {
        this.allOption = [];
        let totalData = this.getChartList(resultData);
        this.chartNum = totalData.length;
        this.totalData = totalData;
        let chartOptions = [];
        //历史数据分析曲线加上污水厂名称
        let serviceArr = [];
        if (!!this.treeDataObj) {
          let pumpArr = Object.values(this.treeDataObj);
          pumpArr.forEach(item => {
            if (Array.isArray(item['children']) && item['children'].length > 0) {
              serviceArr.push(...item['children']);
            }
          });
        }
        totalData.map((data, indexF) => {
          let xData = [];
          let pointerInfo = this.allTreeData.find(
            point => point.pointName === data.pointName && point.deviceId === data.deviceId
          );
          if (data.length > 0) {
            xData = data[0].map(item =>
              this.searchLineInfo.timeEnum === 'DAYS' ? item.dateTime.split(' ')[0] : item.dateTime
            );
          }
          let myOption = {
            legend: {
              show: false
            },
            tooltip: {
              trigger: 'axis',
              confine: true,
              formatter: params => {
                let html = '';
                params.forEach((item, i) => {
                  let isDint = false;
                  let {
                    data: { value, displayType, enumOneName, enumZeroName }
                  } = item;
                  if (i == 0) {
                    isDint = item.seriesName.slice(-4) === '水泵状态';
                    html += `<span>时间：${item.name}</span>
                          <p style="margin-bottom: 8px">
                              <span style="display:inline-block;
                              vertical-align: middle;
                              margin-right:4px;border-radius:6px;
                              width:10px;height:10px;background-color:${item.color};"></span>
                              ${item.seriesName} ：${
                      isDint
                        ? pumpStatus[item.data] || '未知'
                        : getChartValue(value, displayType, enumOneName, enumZeroName)
                    }
                          </p>`;
                  } else {
                    isDint = item.seriesName.slice(-4) === '水泵状态';
                    html += ` <p style="margin-bottom: 8px">
                              <span style="display:inline-block;
                              vertical-align: middle;
                              margin-right:4px;border-radius:6px;
                              width:10px;height:10px;background-color:${item.color};"></span>
                              ${item.seriesName} ：${
                      isDint
                        ? pumpStatus[item.data] || '未知'
                        : getChartValue(value, displayType, enumOneName, enumZeroName)
                    }
                          </p>`;
                  }
                });
                return html;
              }
            },
            axisPointer: {
              link: { xAxisIndex: 'all' },
              label: {
                backgroundColor: '#777'
              }
            },
            grid: [],
            xAxis: [],
            yAxis: [],
            title: [],
            series: []
          };
          let grid = [];
          let xAxis = [];
          let yAxis = [];
          let series = [];
          let title = [];
          data.map(async (item, i) => {
            // console.log('searchLineInfo', this.searchLineInfo);
            let listc = this.showMark ? this.groupAdjacentObjects(item) : [];
            if (listc.length) {
              let dataParams = {
                startTime: this.searchLineInfo.dates[0].startTime,
                endTime: this.searchLineInfo.dates[0].endTime,
                deviceId: item[0].deviceId,
                deviceName: item[0].deviceName,
                pointNameList: [item[0].pointName],
                page: {
                  current: 1,
                  size: 9999
                }
              };
              let { resultData } = await getRemarkList(dataParams);
              if (resultData.length) {
                listc.forEach(item => {
                  resultData.forEach(it => {
                    if (item[0].xAxis === it.startTime && item[1].xAxis === it.endTime) {
                      item[0].name = it.remark != '' ? it.remark : '陡变';
                    }
                  });
                });
              }
            }
            let enumOneName, enumZeroName;
            if (item[0]?.displayType === 0) {
              enumOneName = item[0].enumOneName || '';
              enumZeroName = item[0].enumZeroName || '';
            }
            xAxis.push({
              type: 'category',
              gridIndex: i,
              data: xData,
              scale: true,
              boundaryGap: false,
              axisLine: {
                show: true,
                lineStyle: {}
              },
              axisTick: {
                show: true
              },
              splitLine: {
                show: false
              },
              min: 'dataMin',
              max: 'dataMax',
              axisPointer: {
                z: 100
              }
            });
            yAxis.push({
              type: 'value',
              axisLine: {
                show: true,
                lineStyle: {}
              },
              gridIndex: i,
              axisTick: {
                show: item[0]?.displayType ? true : false
              },
              splitLine: {
                show: false
              },
              scale: true,
              axisLabel: {
                formatter: (value, index) => {
                  if (item[0]?.displayType === 0) {
                    if (value === 1) {
                      return (enumOneName || value) ?? '--';
                    } else if (value === 0) {
                      return (enumZeroName || value) ?? '--';
                    } else {
                      return '';
                    }
                  } else {
                    return value + (data.pointUnit ? '(' + data.pointUnit + ')' : '');
                  }
                }
              },
              minInterval:
                item.type === 'bool' || item.type === 'dint' || item[0]?.displayType === 0
                  ? 1
                  : null,
              splitNumber: 3
            });
            series.push({
              name:
                (this.pumpHouseName ? this.pumpHouseName + '-' : '') +
                item[0]?.deviceName +
                ':' +
                item[0]?.pointMemo +
                '' +
                (data.length > 1
                  ? this.searchLineInfo.timeEnum === 'HOURS'
                    ? item[0]?.dateTime.split(' ')[0]
                    : item[0]?.dateTime.split(' ')[0].slice(0, 7)
                  : ''),
              step: _stepTypeList.includes(item[0]?.displayType) ? true : false,
              pumpName: item[0]?.stationName || '',
              type: 'line',
              data: item.map(child => {
                return {
                  displayType: child.displayType,
                  enumOneName: child.enumOneName,
                  enumZeroName: child.enumZeroName,
                  value: item[0]?.displayType
                    ? item[0]?.displayType === 4
                      ? !!child.dvAfterRatio || child.dvAfterRatio === 0
                        ? child.dvAfterRatio
                        : '--'
                      : !!child.pvAfterRatio || child.pvAfterRatio === 0
                      ? child.pvAfterRatio
                      : '--'
                    : child.pv
                };
              }),
              smooth: true,
              symbol: 'circle',
              itemStyle: {
                color: 'rgb(' + this.getColor(_colors, indexF, i) + ')'
              },
              areaStyle: {
                opacity: 0.5,
                color: {
                  type: 'linear',
                  x: 0,
                  y: 0,
                  x2: 0,
                  y2: 1,
                  colorStops: [
                    {
                      offset: 0.15,
                      color: 'rgba(' + this.getColor(_colors, indexF, i) + ',0.3)' //0.3
                    },
                    {
                      offset: 1,
                      color: 'rgba(' + this.getColor(_colors, indexF, i) + ',0.08)' //0.08
                    }
                  ],
                  global: false // 缺省为 false
                }
              },
              markLine: {
                data: [
                  {
                    name: '',
                    yAxis: pointerInfo?.maxValue || '',
                    lineStyle: { color: '#FF6464' },
                    label: {
                      formatter: `{c}${item[0].eu}`,
                      position: 'insideEndTop',
                      color: '#FF6464'
                    }
                  },
                  {
                    name: '',
                    yAxis: pointerInfo?.minValue || '',
                    lineStyle: { color: '#0ED638' },
                    label: {
                      formatter: `{c}${item[0].eu}`,
                      position: 'insideEndTop',
                      color: '#0ED638'
                    }
                  }
                ]
              },
              markArea: {
                data: listc
              }
            });
            grid.push({
              left: '85',
              right: '30',
              top: '30',
              bottom: '20',
              containLabel: false

              // height: (1 / data.length) * 56 + '%'
            });
            let itemData = null;
            if (i === 0 && serviceArr.length > 0) {
              itemData = serviceArr.filter(service => service['id'] === item[0]['deviceId']);
            }
            title = {
              show: true,
              // z: 99,
              text:
                (item[0].stationName ? item[0].stationName + '-' : '') +
                (!!itemData ? itemData[0].pName + '-' : '') +
                item[0].deviceName +
                ':' +
                item[0].pointMemo,
              left: '100',
              top: '7',
              textStyle: {
                color: 'rgb(' + this.getColor(_colors, indexF, i) + ')',
                fontWeight: 'normal',
                fontSize: 12
              }
            };

            // 始终显示标记线
            // let pointMax = series?.[0]?.data.map(v => v.value).sort((a,b) => b - a)[0];
            // if(!!pointerInfo.maxValue && pointMax < pointerInfo.maxValue){
            //   yAxis[0].max = pointerInfo.maxValue;
            // }
            // console.log('yyy',pointMax)
            // console.log('yyy',pointerInfo)
          });
          myOption.xAxis = xAxis;
          myOption.yAxis = yAxis;
          myOption.series = series;
          myOption.title = title;
          myOption.grid = grid;
          chartOptions.push(myOption);
        });
        this.allOption = [...chartOptions];

        setTimeout(() => {
          let connectChart = [];
          this.allOption.map((item, index) => {
            connectChart.push(
              this.$refs['chart' + index] ? this.$refs['chart' + index][0]?.myChart : {}
            );
          });
          echarts.connect(connectChart);
          this.$emit('setLoadStatus', false);
        }, 1000);
      } else {
        this.$emit('setLoadStatus', false);
        this.allOption = [];
      }
    },
    groupAdjacentObjects(data) {
      const result = [];
      let currentGroup = [];

      for (let i = 0; i < data.length; i++) {
        const currentPointMemoAlias = data[i].pointMemoAlias;

        // 检查当前对象的 pointMemoAlias 是否为 '1' 或 '-1'
        if (currentPointMemoAlias === '-1') {
          if (i > 0 && currentPointMemoAlias !== data[i - 1].pointMemoAlias) {
            // 如果当前对象的 pointMemoAlias 与前一个不同，则将当前组推入结果数组并重置当前组
            if (currentGroup.length > 0) {
              result.push(currentGroup);
              currentGroup = [];
            }
          }
          // 将当前对象添加到当前组
          currentGroup.push(data[i]);
        } else {
          // 如果当前对象的 pointMemoAlias 不是 '1' 或 '-1'，则重置当前组
          if (currentGroup.length > 0) {
            result.push(currentGroup);
            currentGroup = [];
          }
        }
      }

      // 处理最后一个组
      if (currentGroup.length > 0) {
        result.push(currentGroup);
      }
      let list = result.map((tc, tci) => {
        return [tc[0], tc[tc.length - 1]];
      });
      let markAreaList = list.map((tc, tci) => {
        let listItem = tc.map((tcii, tciiIndex) => {
          if (tciiIndex === 0) {
            tcii.markName = '陡变';
            tcii.itemStyle = {
              color: 'rgba(255, 173, 177, 0.6)'
            };
            // tcii.label = {
            //   position: [0, 0],
            // };
          } else {
            tcii.markName = '';
          }
          return {
            name: tcii.markName,
            xAxis: tcii.dateTime,
            itemStyle: tcii.itemStyle ? tcii.itemStyle : {},
            label: tcii.label ? tcii.label : {}
          };
        });
        return listItem;
      });
      return markAreaList;
    },
    handlerCompareData(resultData) {
      if (resultData.length) {
        let totalData = this.getChartList(resultData);
        let chartOptions = [];
        //历史数据分析曲线加上污水厂名称
        let serviceArr = [];
        if (!!this.treeDataObj) {
          let pumpArr = Object.values(this.treeDataObj);
          pumpArr.forEach(item => {
            if (Array.isArray(item['children']) && item['children'].length > 0) {
              serviceArr.push(...item['children']);
            }
          });
        }
        let zzyObjList = [
          {
            label: '氨氮对比NH3N-NH3N1',
            pointsName: ['NH3N', 'NH3N1'],
            children: []
          },
          {
            label: '硝态氮对比NO3N-NO3',
            pointsName: ['NO3N', 'NO3'], //'InstantaneousFlow', 'COD'
            children: []
          }
        ];
        const tempData = zzyObjList.map(item => {
          item['children'] = totalData.filter(v => item.pointsName.indexOf(v.pointName) !== -1);
          return item;
        });
        this.chartNum = tempData.filter(v => v.children.length > 0).length;
        tempData.forEach((field, inx) => {
          if (field.children.length > 0) {
            let fieldsList = field.children;
            let xData = [];
            let grid = [];
            let xAxis = [];
            let yAxis = [];
            let series = [];
            let title = [];
            let myOption = {
              legend: {
                show: false
              },
              tooltip: {
                trigger: 'axis',
                confine: true,
                formatter: params => {
                  let html = '';
                  params.forEach((item, i) => {
                    let isDint = false;
                    let {
                      data: { value, displayType, enumOneName, enumZeroName }
                    } = item;
                    if (i == 0) {
                      isDint = item.seriesName.slice(-4) === '水泵状态';
                      html += `<span>时间：${item.name}</span>
                          <p style="margin-bottom: 8px">
                              <span style="display:inline-block;
                              vertical-align: middle;
                              margin-right:4px;border-radius:6px;
                              width:10px;height:10px;background-color:${item.color};"></span>
                              ${item.seriesName} ：${
                        isDint
                          ? pumpStatus[item.data] || '未知'
                          : getChartValue(value, displayType, enumOneName, enumZeroName)
                      }
                          </p>`;
                    } else {
                      isDint = item.seriesName.slice(-4) === '水泵状态';
                      html += ` <p style="margin-bottom: 8px">
                              <span style="display:inline-block;
                              vertical-align: middle;
                              margin-right:4px;border-radius:6px;
                              width:10px;height:10px;background-color:${item.color};"></span>
                              ${item.seriesName} ：${
                        isDint
                          ? pumpStatus[item.data] || '未知'
                          : getChartValue(value, displayType, enumOneName, enumZeroName)
                      }
                          </p>`;
                    }
                  });
                  return html;
                }
              },
              axisPointer: {
                link: { xAxisIndex: 'all' },
                label: {
                  backgroundColor: '#777'
                }
              },
              grid: [],
              xAxis: [],
              yAxis: [],
              title: [],
              series: []
            };
            fieldsList.forEach((data, indexF) => {
              if (data.length > 0) {
                xData = data[0].map(item =>
                  this.searchLineInfo.timeEnum === 'DAYS'
                    ? item.dateTime.split(' ')[0]
                    : item.dateTime
                );
              }
              // 颜色
              let colorIdx = inx === 0 ? indexF : tempData[0].children.length + indexF;
              data.forEach((item, i) => {
                if (indexF === 0) {
                  let enumOneName, enumZeroName;
                  if (item[0]?.displayType === 0) {
                    enumOneName = item[0].enumOneName || '';
                    enumZeroName = item[0].enumZeroName || '';
                  }
                  xAxis.push({
                    type: 'category',
                    gridIndex: i,
                    data: xData,
                    scale: true,
                    boundaryGap: false,
                    axisLine: {
                      show: true,
                      lineStyle: {}
                    },
                    axisTick: {
                      show: true
                    },
                    splitLine: {
                      show: false
                    },
                    min: 'dataMin',
                    max: 'dataMax',
                    axisPointer: {
                      z: 100
                    }
                  });
                  yAxis.push({
                    type: 'value',
                    axisLine: {
                      show: true,
                      lineStyle: {}
                    },
                    position: indexF === 0 ? 'left' : 'right',
                    gridIndex: i,
                    axisTick: {
                      show: item[0]?.displayType ? true : false
                    },
                    splitLine: {
                      show: false
                    },
                    axisLabel: {
                      formatter: (value, index) => {
                        if (item[0]?.displayType === 0) {
                          if (value === 1) {
                            return (enumOneName || value) ?? '--';
                          } else if (value === 0) {
                            return (enumZeroName || value) ?? '--';
                          } else {
                            return '';
                          }
                        } else {
                          return value + (data.pointUnit ? '(' + data.pointUnit + ')' : '');
                        }
                      }
                    },
                    minInterval:
                      item.type === 'bool' || item.type === 'dint' || item[0]?.displayType === 0
                        ? 1
                        : null,
                    splitNumber: 3
                  });
                  grid.push({
                    left: '85',
                    right: '16',
                    top: '30',
                    bottom: '20',
                    containLabel: false
                  });
                  let itemData = null;
                  if (serviceArr.length > 0) {
                    itemData = serviceArr.filter(service => service['id'] === item[0]['deviceId']);
                  }
                  title = {
                    show: true,
                    text:
                      (item[0].stationName ? item[0].stationName + '-' : '') +
                      (!!itemData ? itemData[0].pName + '-' : '') +
                      item[0].deviceName +
                      ':' +
                      field.label,
                    left: '100',
                    top: '7',
                    textStyle: {
                      color: 'rgb(' + this.getColor(_colors, colorIdx, i) + ')',
                      fontWeight: 'normal',
                      fontSize: 12
                    }
                  };
                }
                series.push({
                  name:
                    (this.pumpHouseName ? this.pumpHouseName + '-' : '') +
                    item[0]?.deviceName +
                    ':' +
                    item[0]?.pointMemo +
                    '' +
                    (data.length > 1
                      ? this.searchLineInfo.timeEnum === 'HOURS'
                        ? item[0]?.dateTime.split(' ')[0]
                        : item[0]?.dateTime.split(' ')[0].slice(0, 7)
                      : ''),
                  step: _stepTypeList.includes(item[0]?.displayType) ? true : false,
                  pumpName: item[0]?.stationName || '',
                  type: 'line',
                  data: item.map(child => {
                    return {
                      displayType: child.displayType,
                      enumOneName: child.enumOneName,
                      enumZeroName: child.enumZeroName,
                      value: item[0]?.displayType
                        ? item[0]?.displayType === 4
                          ? !!child.dvAfterRatio || child.dvAfterRatio === 0
                            ? child.dvAfterRatio
                            : '--'
                          : !!child.pvAfterRatio || child.pvAfterRatio === 0
                          ? child.pvAfterRatio
                          : '--'
                        : child.pv
                    };
                  }),
                  smooth: true,
                  symbol: 'circle',
                  itemStyle: {
                    color: 'rgb(' + this.getColor(_colors, colorIdx, i) + ')'
                  },
                  areaStyle: {
                    opacity: 0.5,
                    color: {
                      type: 'linear',
                      x: 0,
                      y: 0,
                      x2: 0,
                      y2: 1,
                      colorStops: [
                        {
                          offset: 0.15,
                          color: 'rgba(' + this.getColor(_colors, colorIdx, i) + ',0.3)' //0.3
                        },
                        {
                          offset: 1,
                          color: 'rgba(' + this.getColor(_colors, colorIdx, i) + ',0.08)' //0.08
                        }
                      ],
                      global: false // 缺省为 false
                    }
                  }
                });
              });
            });

            myOption.xAxis = xAxis;
            myOption.yAxis = yAxis;
            myOption.series = series;
            myOption.title = title;
            myOption.grid = grid;
            chartOptions.push(myOption);
          }
        });
        this.allOption = [...chartOptions];
        setTimeout(() => {
          let connectChart = [];
          this.allOption.map((item, index) => {
            connectChart.push(
              this.$refs['chart' + index] ? this.$refs['chart' + index][0]?.myChart : {}
            );
          });
          echarts.connect(connectChart);
          this.$emit('setLoadStatus', false);
        }, 1000);
      } else {
        this.$emit('setLoadStatus', false);
        this.allOption = [];
      }
    },
    getChartList(data) {
      let totalData = {};
      let chartData = [];
      chartData = data.map(time => {
        let arr = {};
        this.getLastData(time.data, arr);
        return arr;
      });
      Object.keys(chartData[0]).map((item, index) => {
        let unit = item.split('_')[1];
        let key =
          ((unit && unit != '--') ? unit : '_' + index) +
          '-' +
          item.split('_')[2] +
          '-' +
          item.split('_')[3] +
          (item.split('_')[4] ? '_' + item.split('_')[4] : '') +
          (item.split('_')[5] ? '_' + item.split('_')[5] : '');
        chartData.map((itemC, i) => {
          if (totalData[key]) {
            totalData[key].push(itemC[item] || []);
          } else {
            totalData[key] = [itemC[item] || []];
          }
        });
      });
      Object.keys(totalData).forEach(key => {
        totalData[key].pointUnit = key.split('-')[0][0] === '_' ? '' : key.split('-')[0];
        totalData[key].pointName = key.split('-')[0][0] === '_' ? '' : key.split('-')[2];
        totalData[key].deviceId = key.split('-')[1];
      });
      let totalListData = [];
      let pointKeys = Object.keys(totalData);
      if (this.searchLineInfo && this.searchLineInfo.devicePoints) {
        this.searchLineInfo.devicePoints.forEach(item => {
          item.points?.forEach(point => {
            let key = pointKeys.find(key => {
              let idx = key.indexOf('-') + 1;
              return key.slice(idx) === item.deviceId + '-' + point;
              // key.indexOf(item.deviceId + '-' + point) > -1 // 防止字段查询相同
            });
            if (key) totalListData.push(totalData[key]);
          });
        });
      }
      return totalListData;
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
      if (!this.searchLineInfo.devicePoints?.[0]?.deviceId) return;
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
              width: 200,
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
  .tips {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .chart-body {
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
    .bar-chart,
    .line-chart {
      width: 100%;
      height: 100%;
    }
    .line-chart {
      overflow: auto;
      position: relative;
      .chart-block {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .chart {
          height: 100%;
        }
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
      padding: 7px 0 5px;
      font-size: 18px;
      cursor: pointer;
      margin-right: 12px;

      &.active {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
  }
}
</style>
