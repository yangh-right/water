<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-29 17:35:17
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="form">
        <div class="form-item">
          <w-select
            class="select-item"
            style="width: 202px"
            placeholder="请选择设备"
            :getPopupContainer="triggerNode => triggerNode.parentNode"
            v-model="paramsOption"
            :options="paramsOptions"
            @change="paramsChange"
          ></w-select>
        </div>
        <div class="form-item">
          <w-select
            class="select-item"
            style="width: 202px"
            placeholder="请选择时间"
            :getPopupContainer="triggerNode => triggerNode.parentNode"
            v-model="timeOption"
            :options="timeOptions"
            @change="optionsChange"
          ></w-select>
        </div>
      </div>
    </div>
    <div v-if="showType === 'chart'" class="tabs">
      <div
        v-for="item in pointsArr"
        :key="item.pointName"
        :class="currentPoint === item.pointName ? 'tab active' : 'tab'"
        @click="handleChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="showType === 'chart'" class="chart-wrapper">
        <line-chart
          v-if="flag"
          :darkTheme="'light'"
          :option="barOption"
          ref="inChart1"
        ></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
      <div v-else class="table-wrapper">
        <w-config-provider>
          <w-table
            class="tableDevice"
            ref="pumpTable"
            :columns="columns"
            :data-source="data"
            :scroll="scroll"
            :pagination="false"
            rowKey="key"
          >
            <div
              :class="[record.statusClass, 'btn-status']"
              slot="status"
              slot-scope="text, record"
            >
              {{ record.statusLabel }}
            </div>
            <template slot="placeName" slot-scope="text, record">
              <span>{{ record.deviceStatus === -1 || !text ? '--' : text.split('-')[0] }}</span>
            </template>
          </w-table>
          <template #renderEmpty>
            <w-empty id="ssmal" style="margin:auto" size="small"></w-empty
          ></template>
        </w-config-provider>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getUpperDevicePointList, getUpperDeviceList } from '@/api/optimization';
import { getHistoryDataByMultiDate, getHistoryDataTable } from '@/api/analysis';
import { mlssOption } from './data';

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

export default {
  name: 'PumpData',
  props: {
    title: {
      type: String,
      default: ''
    },
    showType: {
      type: String,
      default: 'chart'
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      flag: true,
      loading: false,
      currentDevice: {},
      timeOption: 'day',
      timeOptions: [
        {
          label: '1天',
          value: 'day'
        },
        {
          label: '3天',
          value: 'days'
        },
        {
          label: '1周',
          value: 'week'
        }
      ],
      scroll: {
        x: 620,
        y: 145
      },
      paramsOption: undefined,
      paramsOptions: [],
      barOption: mlssOption,
      endTime: '',
      startTime: '',
      searchLineInfo: {},
      type: '1',
      currentPoint: '',
      currentName: '',
      pointsArr: [],
      columns: [],
      data: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        {
          this.initDeviceList(val);
        }
      }
    }
  },
  created() {
    this.startTime = this.$moment()
      .subtract(1, 'day')
      .format('YYYY-MM-DD HH:mm:ss');
    this.endTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
    this.initPoints();
  },
  methods: {
    async initPoints() {
      let { status, resultData } = await getUpperDevicePointList();
      if (status === 'complete' && Array.isArray(resultData)) {
        this.pointsArr = resultData;

        this.handleChange(this.pointsArr[0]);
      }
    },
    async initDeviceList(id) {
      this.isLoading = true;
      let { status, resultData } = await getUpperDeviceList(id);
      this.loading = false;
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        this.paramsOptions = resultData.map(item => {
          return {
            label: item.deviceName,
            value: item.deviceId
          };
        });
        this.paramsOption = resultData[0].deviceId;
        // 获取图表数据
        setTimeout(() => {
          this.getHistoryData();
          this.getHistoryDataTable();
        }, 200);
      }
    },
    handleChange(item) {
      this.currentPoint = item.pointName;
      this.currentName = item.pointMemo;
      setTimeout(() => {
        this.getHistoryData();
      }, 200);
    },
    paramsChange() {
      setTimeout(() => {
        this.getHistoryData();
        this.getHistoryDataTable();
      }, 200);
    },
    optionsChange() {
      if (this.timeOption === 'day') {
        this.type = '1';
        this.startTime = this.$moment()
          .subtract(1, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
      } else if (this.timeOption === 'days') {
        this.type = '2';
        this.startTime = this.$moment()
          .subtract(3, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
      } else {
        this.type = '3';
        this.startTime = this.$moment()
          .subtract(7, 'day')
          .format('YYYY-MM-DD HH:mm:ss');
      }
      setTimeout(() => {
        this.getHistoryData();
        this.getHistoryDataTable();
      }, 200);
    },
    async getHistoryData() {
      if (!this.paramsOption) {
        return false;
      }
      let params = {
        devicePoints: [
          {
            deviceId: this.paramsOption,
            points: [this.currentPoint]
          }
        ],
        deviceType: 'INDUSTRY_DEVICE',
        displayType: [],
        dates: [
          {
            startTime: this.startTime,
            endTime: this.endTime
          }
        ],
        period: '60',
        timeEnum: 'MINUTES',
        productCode: 'water_purification'
      };
      this.searchLineInfo = params;
      this.loading = true;
      let res = null;
      try {
        res = await getHistoryDataByMultiDate(params);
      } catch (error) {
        console.log(error);
      }
      this.loading = false;
      if (res?.resultData) {
        this.handlerChartData(res?.resultData);
      }
    },
    handlerChartData(resultData) {
      if (resultData.length) {
        this.flag = true;
        let totalData = this.getChartList(resultData);
        totalData.map((data, indexF) => {
          let xData = [];
          if (data.length > 0) {
            xData = data[0].map(item =>
              this.timeOption === 'week' ? item.dateTime.split(' ')[0] : item.dateTime
            );
          }
          let dataArr = [];
          data.map((item, i) => {
            dataArr = item.map(child => {
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
            });
          });
          this.barOption.tooltip = {
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
                              ${this.currentName} ：${
                    isDint
                      ? pumpStatus[item.data] || '未知'
                      : getChartValue(value, displayType, enumOneName, enumZeroName)
                  }
                          </p>`;
                }
              });
              return html;
            }
          };
          this.barOption.yAxis[0].name = data.pointUnit;
          this.barOption.xAxis[0].data = xData;
          this.barOption.series[0].data = dataArr;
        });
      } else {
        this.flag = false;
        this.barOption.yAxis[0].name = '';
        this.barOption.xAxis[0].data = [];
        this.barOption.series[0].data = [];
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
          (unit ? unit : '_' + index) +
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
      });
      let totalListData = [];
      let pointKeys = Object.keys(totalData);
      if (this.searchLineInfo && this.searchLineInfo.devicePoints) {
        this.searchLineInfo.devicePoints.forEach(item => {
          item.points?.forEach(point => {
            let key = pointKeys.find(key => key.indexOf(item.deviceId + '-' + point) > -1);
            if (key) totalListData.push(totalData[key]);
          });
        });
      }
      return totalListData;
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
    async getHistoryDataTable() {
      // if (!this.searchLineInfo.devicePoints?.[0]?.deviceId) return;
      let pointNameArr = this.pointsArr.map(item => item.pointName);
      let params = JSON.parse(JSON.stringify(this.searchLineInfo));
      params['devicePoints'][0]['points'] = pointNameArr;
      const { resultData } = await getHistoryDataTable(params);
      this.handlerSimpColumn(resultData);
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
          width: 140,
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
              width: 160,
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
      this.columns = [...columns];
      this.data = records;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(50% - 6px);
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tabs {
    padding: 0 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      height: 24px;
      line-height: 24px;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .spin {
    height: calc(100% - 64px);
  }
  .chart-wrapper {
    height: 100%;
    // padding: 10px 0;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
