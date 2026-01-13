<!--
 * @Author: wangyr
 * @Date: 2022-12-07 11:53:14
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-06-30 08:43:17
 * @Description: 优化重构 by AI
-->
<template>
  <div class="chart-content">
    <div v-if="false" class="tool-box">
      <w-icon
        v-for="item in toolIcon"
        :key="item.icon"
        :title="item.title"
        :type="item.icon"
        :class="`tool-icon ${item.type === currentType ? 'active' : ''}`"
        @click="handlerType(item.type)"
      ></w-icon>
    </div>
    <div v-if="!!tips" class="tips">
      <w-empty :description="tips"></w-empty>
    </div>
    <line-chart v-else ref="xChart" :darkTheme="'light'" :option="option"></line-chart>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { toolIcon } from './data';
import { rgbToHsl, hslToRgb } from '@/utils/util';
import { waterPredictionApi, getMonitorList } from '@/api/manage';
import { GetHistoryDataByPumpId } from '@/api/home';

const ColorMap = {
  dark: ['#4285F4'],
  green: ['#37c2ce'],
  red: ['#ce4c1c'],
  default: ['#4285F4']
};

const _colors = ['#ffa94d', '#9567ff', '#ff498c', '#40c9a9', '#d779ff', '#87ce40', '#4285f4'];
const UNIT = 'm³';

export default {
  name: 'predict',
  components: {
    LineChart: () => import('@/components/chart/LineChart')
  },
  props: {
    pumpId: {
      type: String,
      required: true
    },
    modleType: {
      type: String,
      required: true
    },
    dateTime: {
      type: Object,
      required: true
    },
    predictDeviceIds: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      toolIcon,
      currentType: 'line',
      option: null,
      historyData: [],
      predictionData: [],
      startDateTime: '',
      endDateTime: '',
      tips: '请选择污水厂！'
    };
  },
  inject: ['state'],
  computed: {
    ...mapState('report', { params: state => state.alarmParams }),
    themeColor: {
      get() {
        return ColorMap[this.state.theme] || ColorMap['default'];
      },
      set() {}
    }
  },
  watch: {
    'state.theme'(newValue) {
      this.themeColor = ColorMap[newValue] || ColorMap['default'];
    },
    pumpId: {
      handler(newValue) {
        if (newValue) this.getWaterPrediction();
      }
    },
    dateTime: {
      handler() {
        this.getWaterPrediction();
      },
      deep: true
    },
    predictDeviceIds: {
      handler() {
        this.getWaterPrediction();
      },
      deep: true
    },
    modleType: {
      handler() {
        this.getWaterPrediction();
      }
    }
  },
  methods: {
    async getWaterPrediction() {
      try {
        // if (this.predictDeviceIds.length === 0) return;
        this.startDateTime = this.dateTime.format('YYYY-MM-DD 00:00:00');
        this.endDateTime = this.$moment(this.dateTime)
          .add(1, 'days')
          .format('YYYY-MM-DD 00:00:00');
        let deviceId = this.predictDeviceIds.join(',');
        const params1 = {
          endDateTime: this.endDateTime,
          scale: 1,
          startDateTime: this.startDateTime,
          stationId: `${this.pumpId}_${deviceId}`
        };
        const params2 = {
          pumpId: this.pumpId,
          codes: [`${this.modleType}_data`],
          period: 30,
          timeEnum: 'MINUTES',
          dates: [
            {
              startTime: this.startDateTime,
              endTime: this.$moment(this.dateTime).format('YYYY-MM-DD 23:59:59')
            }
          ]
        };
        const [predictionRes, historyRes] = await Promise.all([
          waterPredictionApi(params1),
          GetHistoryDataByPumpId(params2)
        ]);
        this.predictionData = predictionRes.resultData;
        this.historyData = historyRes.resultData;
        this.option = this.buildChartOption();
        this.tips = '';
      } catch (e) {
        this.tips = '请选择污水厂！';
      }
    },
    buildChartOption() {
      const predictionChartData = Array.isArray(this.predictionData.water)
        ? this.predictionData.water
        : [];
      const historyChartData = this.getChartList(this.historyData);
      let xAxis = [
        {
          type: 'category',
          gridIndex: 0,
          data: [],
          scale: true,
          boundaryGap: false,
          axisLine: { show: true, lineStyle: {} },
          axisTick: { show: true },
          splitLine: { show: false },
          min: 'dataMin',
          max: 'dataMax',
          axisPointer: { z: 100 }
        }
      ];
      let yAxis = [
        {
          type: 'value',
          name: '流量: m³',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#58D0D3'
            }
          },
          axisLabel: {
            formatter: '{value}',
            color: '#58D0D3'
          }
        },
        {
          type: 'value',
          name: 'mg/L',
          axisLine: {
            show: true,
            lineStyle: {
              color: '#FFA94D'
            }
          },
          axisLabel: {
            formatter: '{value}',
            color: '#FFA94D'
          }
        }
      ];
      let series = [];
      let legend = [];
      const LEGEND_PREDICTION = this.modleType === 'pump_inlet' ? '预测进水量' : '预测调蓄量';
      const LEGEND_ACTUAL = this.modleType === 'pump_inlet' ? '实际进水量' : '实际调蓄量';
      if (predictionChartData.length > 0) {
        legend.push(LEGEND_PREDICTION, LEGEND_ACTUAL);
        const xData = [];
        const predictionWaterData = [];
        const actualWaterData = [];
        const pushData = (item, hour) => {
          xData.push(hour);
          predictionWaterData.push(item.predictionWater);
          actualWaterData.push(item.actualWater);
        };
        for (let i = 1; i < predictionChartData.length - 1; i++) {
          const item = predictionChartData[i];
          const hourValue = item.dateTime.includes('30:00') ? `${item.hour}:30` : `${item.hour}:00`;
          pushData(item, hourValue);
        }
        if (predictionChartData.length > 1) {
          const lastItem = predictionChartData[predictionChartData.length - 1];
          pushData(lastItem, '24:00');
        }
        xAxis[0].data = xData;
        const commonSeriesConfig = {
          type: 'line',
          symbol: 'circle',
          symbolSize: 8,
          tooltip: {
            valueFormatter: value => (value || value === '0' ? value : '-') + UNIT
          },
          yAxisIndex: 0 // 左y轴
        };
        series.push(
          {
            ...commonSeriesConfig,
            name: LEGEND_PREDICTION,
            itemStyle: { normal: { color: '#31BBC6', lineStyle: { color: '#31BBC6' } } },
            data: predictionWaterData
          },
          {
            ...commonSeriesConfig,
            name: LEGEND_ACTUAL,
            itemStyle: { normal: { color: '#4EA6FF', lineStyle: { color: '#4EA6FF' } } },
            data: actualWaterData
          }
        );
      }
      if (Object.keys(historyChartData).length > 0) {
        Object.keys(historyChartData).forEach((key, indexF) => {
          let data = historyChartData[key];
          let xData = [];
          data.map((item, i) => {
            let name = (item[0]?.deviceName || '') + (item[0]?.pointMemo || '');
            legend.push(name);
            series.push({
              name,
              pumpName: item[0]?.stationName || '',
              type: 'line',
              data: item.map(child => {
                return {
                  unit: child.eu,
                  displayType: child.displayType,
                  enumOneName: child.enumOneName,
                  enumZeroName: child.enumZeroName,
                  value: item[0]?.displayType
                    ? item[0]?.displayType === 4
                      ? child.dvAfterRatio ?? '--'
                      : child.pvAfterRatio ?? '--'
                    : child.pv
                };
              }),
              smooth: true,
              symbolSize: 8,
              symbol: 'circle',
              itemStyle: {
                normal: { color: _colors[indexF], lineStyle: { color: _colors[indexF] } }
              },
              yAxisIndex: 1 // 右y轴
            });
          });
        });
      }
      return {
        legend: { data: legend, left: 10 },
        axisPointer: {
          link: { xAxisIndex: 'all' },
          label: { backgroundColor: '#777' }
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
          formatter: params => {
            let html = '';
            params.forEach((item, i) => {
              let val =
                item.data !== null && typeof item.data === 'object' ? item.data.value : item.data;
              let unit =
                item.data !== null && typeof item.data === 'object' ? item.data.unit : UNIT;
              if (i === 0) {
                html += `<span>${
                  item.name
                }</span><p style="margin-bottom: 8px"><span style="display:inline-block;vertical-align: middle;margin-right:4px;border-radius:6px;width:10px;height:10px;background-color:${
                  item.color
                };"></span>${item.seriesName} ：${val || val == '0' ? val : '--'}${unit}</p>`;
              } else {
                html += `<p style="margin-bottom: 8px"><span style="display:inline-block;vertical-align: middle;margin-right:4px;border-radius:6px;width:10px;height:10px;background-color:${
                  item.color
                };"></span>${item.seriesName} ：${val || val == '0' ? val : '--'}${unit}</p>`;
              }
            });
            return html;
          }
        },
        grid: [{ left: '3%', right: '2%', bottom: '3%', containLabel: true }],
        xAxis,
        yAxis,
        series
      };
    },
    getChartList(data) {
      let totalData = {};
      let chartData = data.map(time => {
        let arr = {};
        this.getLastData(time.data, arr);
        return arr;
      });
      Object.keys(chartData[0] || {}).forEach((item, index) => {
        let unit = item.split('_')[1];
        let key =
          (unit ? unit : '_' + index) +
          '-' +
          item.split('_')[2] +
          '-' +
          item.split('_')[3] +
          (item.split('_')[4] ? '_' + item.split('_')[4] : '') +
          (item.split('_')[5] ? '_' + item.split('_')[5] : '');
        chartData.forEach((itemC, i) => {
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
      return totalData;
    },
    getLastData(data, arr, prefix = '') {
      if (Array.isArray(Object.values(data)[0])) {
        Object.keys(data).forEach(item => {
          arr[prefix + '_' + item] = data[item];
        });
      } else {
        Object.keys(data).forEach(key => this.getLastData(data[key], arr, prefix + '_' + key));
      }
    },
    getSuitNum(base, multiplier, i, remainder, min, max) {
      let res = (base + multiplier * i) % remainder;
      if (res < min || res > max) {
        return this.getSuitNum(base, multiplier, i + 1, remainder, min, max);
      } else {
        return res;
      }
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
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
        }
        return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
      } else {
        return sColor;
      }
    },
    handlerType(type) {}
  }
};
</script>

<style lang="less" scoped>
.chart-content {
  width: 100%;
  height: 100%;
  position: relative;

  .tool-box {
    width: 100%;
    text-align: right;
    color: #999;
    position: absolute;
    right: -22px;

    .tool-icon {
      cursor: pointer;
      margin-right: 8px;

      &.active {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
  }
  .tips {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
