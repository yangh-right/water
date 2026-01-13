<template>
  <div class="content-left">
    <div class="content-left-top">
      <div class="page-title">
        <div class="form-box">
          <div class="form-item ">
            <div class="form-label">选择污水厂:</div>
            <factory-select style="width: 202px" autoSelect v-model="waterPlantId"></factory-select>
          </div>
          <div class="form-item">
            <div class="form-label">选择设备:</div>
            <w-select
              class="select-item"
              style="width: 202px"
              placeholder="请选择设备"
              v-model="picDevice"
              :options="picDeviceOptions"
            ></w-select>
          </div>
        </div>
        <div class="inspect-time">下次检测时间：{{ updateTime }}</div>
      </div>
      <div class="content-box">
        <div class="left-card top-card">
          <div class="top-title">
            <w-icon type="ic_police" class="icon"></w-icon>
            <span class="title-text">报警</span>
          </div>
          <div class="top-cont">
            <span class="status1">{{ !!alarmInfo ? alarmInfo.alarmName : '--' }}</span>
          </div>
        </div>
        <div class="left-card top-card">
          <div class="top-title">
            <w-icon type="wpg_Liquid_level" class="icon"></w-icon>
            <span class="title-text">使用状态</span>
          </div>
          <div class="top-cont">
            <span :style="handleStateStyle" class="status2">{{ deviceStatus }}</span>
          </div>
        </div>
        <div class="left-card top-card">
          <div class="top-title">
            <w-icon type="ic_water_valve" class="icon"></w-icon>
            <span class="title-text">运行状态</span>
          </div>
          <div class="top-cont">
            <span class="status3">{{ onlineStatus }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="content-left-info">
      <!-- <div v-for="(item, i) in sludgeArr" :key="i" class="left-card bottom-card">
        <div class="card-label">{{ item.pointAlias }}</div>
        <div class="card-value">
          <span :class="`status2`">{{ item.pointValue }}</span> {{ item.pointUnit }}
        </div>
      </div> -->
      <div class="left-card chart-100">
        <div class="chart-top">
          <span
            v-for="(tab, index) in tabs"
            :key="index"
            :class="tabCur === tab.value ? 'active' : ''"
            @click="handleTypeChange(tab.value)"
          >
            {{ tab.label }} (%)
          </span>
        </div>
        <w-button class="chart-down" type="link" @click="showTable()">
          图表
        </w-button>
        <div class="chart-cont">
          <w-spin :spinning="SVLoading" class="chart-spin"></w-spin>
          <line-chart
            v-if="SVOption.series.length"
            ref="chart1"
            :darkTheme="'light'"
            :option="SVOption"
          ></line-chart>
          <w-empty v-else style="width:100%;margin:auto" description="暂无数据"></w-empty>
        </div>
      </div>
      <div class="left-card chart-100">
        <div class="chart-top">
          <div class="card-title">SVI (mL/g)</div>
          <w-button class="chart-down" type="link" @click="showTable('SVI')"> 图表 </w-button>
        </div>
        <div class="chart-cont">
          <w-spin :spinning="SVILoading" class="chart-spin"></w-spin>
          <line-chart
            v-if="SVIOption.series.length"
            ref="chart2"
            :darkTheme="'light'"
            :option="SVIOption"
          ></line-chart>
          <w-empty v-else style="width:100%;margin:auto" description="暂无数据"></w-empty>
        </div>
      </div>
      <div class="left-card chart-100">
        <div class="chart-top">
          <div class="card-title">SDI(g/100mL)</div>
          <w-button class="chart-down" type="link" @click="showTable('SDI')"> 图表 </w-button>
        </div>
        <div class="chart-cont">
          <w-spin :spinning="SDILoading" class="chart-spin"></w-spin>
          <line-chart
            v-if="SDIOption.series.length"
            ref="chart3"
            :darkTheme="'light'"
            :option="SDIOption"
          ></line-chart>
          <w-empty v-else style="width:100%;margin:auto" description="暂无数据"></w-empty>
        </div>
      </div>
    </div>
    <!-- 表格弹框 -->
    <w-modal
      :title="tableTitle"
      :visible="tableVis"
      destroyOnClose
      :footer="null"
      @cancel="tableVis = false"
      :width="'800px'"
      centered
    >
      <w-info-table :columns="column" :dataSource="dataList" :scroll="{ y: 400 }">
        <template #toolbar>
          <div class="data-tool">
            <span class="table-title"> </span>
            <w-button type="link" @click="exportExcel" :loading="exportTemLoading">下载</w-button>
          </div>
        </template>
      </w-info-table>
    </w-modal>
  </div>
</template>
<script>
import { exportFile } from '@/utils/util';
import { cloneDeep } from 'lodash';
import * as echarts from 'echarts';
import {
  queryList,
  sysDictListByCode,
  getAlarmInfoByIndustryDeviceId,
  getActivatedSludgeHistoryData
} from '@/api/deviceManagement';
import { deviceOnlineObj, tabs, optionModel, column } from './option';
import { getHistoryDataByMultiDate, historyExcel } from '@/api/analysis';
import { getSysParamByCode } from '@/api/index';
import FactorySelect from '@/components/factory-select';
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
  name: 'LeftInfo',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
    FactorySelect
  },
  data() {
    return {
      waterPlantId: undefined,
      picDevice: undefined,
      picDeviceOptions: [],
      sludgeDeviceType: undefined,
      industryDeviceId: undefined,
      alarmInfo: null, //报警信息
      deviceList: [],
      deviceOnlineObj, //设备在线状态
      deviceStatusObj: {}, //设备使用状态
      legendList: ['待报废', '报废', '正常使用'], //历史数据图表图例
      svOption: {}, //历史数据统计图option
      colorList: ['#5B8FF9', '#61DDAA', '#F6BD16'],
      legendLists: ['今天', '昨天', '上月今日'],
      optionModel, //统计图模型
      SVLoading: false,
      SVTableList: [],
      SVOption: cloneDeep(optionModel), //SV5、SV10、SV30历史数据
      SVILoading: false,
      SVITableList: [],
      SVIOption: cloneDeep(optionModel), //SVL历史数据
      SDILoading: false,
      SDITableList: [],
      SDIOption: cloneDeep(optionModel), //SDL历史数据
      deviceStatusOptions: [],
      tabs,
      tabCur: 'SV5',
      tableVis: false,
      column, //历史数据图表表头
      tableTitle: '',
      dataList: [],
      exportTemLoading: false,
      updateTime: '',
      tabs: [
        {
          label: 'SV5',
          value: 'SV5'
        },
        {
          label: 'SV10',
          value: 'SV10'
        },
        {
          label: 'SV30',
          value: 'SV30'
        }
      ],
      searchLineInfo: {
        devicePoints: [
          {
            deviceId: '',
            points: ['SV10', 'SV30', 'SV5', 'SVI', 'SDI']
          }
        ],
        deviceType: 'INDUSTRY_DEVICE',
        displayType: [],
        dates: [
          {
            startTime: this.$moment().format('YYYY-MM-DD 00:00:00'),
            endTime: this.$moment().format('YYYY-MM-DD 23:59:59')
          },
          {
            startTime: this.$moment()
              .subtract(1, 'day')
              .format('YYYY-MM-DD 00:00:00'),
            endTime: this.$moment()
              .subtract(1, 'day')
              .format('YYYY-MM-DD 23:59:59')
          },
          {
            startTime: this.$moment()
              .subtract(1, 'month')
              .format('YYYY-MM-DD 00:00:00'),
            endTime: this.$moment()
              .subtract(1, 'month')
              .format('YYYY-MM-DD 23:59:59')
          }
        ],
        period: '2',
        timeEnum: 'HOURS',
        productCode: 'water_purification'
      },
      sludgeArr: [
        {
          pointAlias: '',
          pointUnit: '',
          pointValue: '--'
        },
        {
          pointAlias: '',
          pointUnit: '',
          pointValue: '--'
        }
      ]
    };
  },
  computed: {
    // 设备状态
    onlineStatus() {
      if (this.deviceList.length > 0) {
        let value = this.deviceList[0].onlineStatus;
        return this.deviceOnlineObj[value] || '--';
      } else {
        return '--';
      }
    },
    // 使用状态
    deviceStatus() {
      if (this.deviceList.length > 0) {
        let value = this.deviceList[0].deviceStatus;
        return this.deviceStatusObj[value] || '--';
      } else {
        return '--';
      }
    },
    // 使用状态颜色
    handleStateStyle() {
      let color = '#333';
      let deviceStatus = [-1, 0]; // 闲置、待报废 为深灰色
      let deviceArr = this.deviceList;
      if (deviceArr.length > 0) {
        if (deviceStatus.includes(deviceArr[0].deviceStatus)) {
          this.deviceStatusOptions.forEach(item => {
            if (item.value === String(deviceArr[0].deviceStatus)) {
              color = '#c0c8d6';
            }
          });
        }
      }
      return {
        color
      };
    }
  },
  watch: {
    waterPlantId(val) {
      if (val) {
        this.getList(val);
      }
    },
    picDevice(val) {
      this.$emit('handleDevice', val); //将设备id传给父组件
      this.getAlarmInfo(val); //报警信息
      this.getHistoryData(this.tabCur); //SV5、SV10、SV30、SVI、SDI获取历史数据
      this.getHistoryData('SVI');
      this.getHistoryData('SDI');
    }
  },
  async created() {
    let time = this.$moment().format('HH');
    if (time % 2 === 1) {
      this.updateTime = this.$moment()
        .add(1, 'hour')
        .format('YYYY-MM-DD HH:00');
    } else {
      this.updateTime = this.$moment()
        .add(2, 'hour')
        .format('YYYY-MM-DD HH:00');
    }
    await this.getSystemDictList(
      'purification_use_state',
      'deviceStatusObj',
      'deviceStatusOptions'
    );
  },
  methods: {
    async getSludgeDeviceType() {
      const { resultData } = await getSysParamByCode('activated_sludge_type');
      this.sludgeDeviceType = resultData;
    },
    // 根据污水厂id获取设备列表
    async getList(val) {
      await this.getSludgeDeviceType();
      let params = {
        waterPlantId: val,
        deviceTypeList: [this.sludgeDeviceType]
      };
      const { status, resultData } = await queryList(params);
      if (status === 'complete') {
        const records = resultData.records || [];
        this.deviceList = records;
        this.picDeviceOptions = records.map(item => {
          return {
            label: item.deviceName,
            value: item.id
          };
        });
        this.picDevice = records[0].id;
      }
    },
    // 报警信息
    async getAlarmInfo(id) {
      const { status, resultData } = await getAlarmInfoByIndustryDeviceId(id);
      if (status === 'complete' && resultData !== null) {
        this.alarmInfo = resultData;
      } else {
        this.alarmInfo = null;
      }
    },
    //历史数据tab切换
    handleTypeChange(type) {
      this.tabCur = type;
      this.getHistoryData(type);
    },
    //历史数据展示
    async getHistoryData(pointName) {
      // 先获取行业设备id
      let filterDeviceList = this.deviceList.filter(device => device.id == this.picDevice);
      if (filterDeviceList.length === 0) {
        return;
      }
      this.industryDeviceId = filterDeviceList[0].industryDeviceId;
      let params = {
        ...this.searchLineInfo,
        devicePoints: [
          {
            deviceId: this.industryDeviceId,
            points: [pointName]
          }
        ]
      };
      let res = null;
      this.loading = true;
      try {
        if (pointName === 'SVI' || pointName === 'SDI') {
          res = await getActivatedSludgeHistoryData(pointName, params);
        } else {
          res = await getHistoryDataByMultiDate(params);
        }
      } catch (error) {
        console.log(error);
      }
      if (res?.resultData) {
        this.handlerChartData(res?.resultData, pointName);
      }
    },
    // 解析历史数据
    getXAxisData(totalData, pointName) {
      let xAxis = [];
      let dataList = [];
      totalData.map(item => {
        // 从item中将值都获取到
        let pointUnitKeys = Object.keys(item.data);
        let deviceData = pointUnitKeys.length > 0 ? item.data[pointUnitKeys[0]] : {};
        let pointData = deviceData[this.industryDeviceId] ? deviceData[this.industryDeviceId] : {};
        let data = pointData[pointName] || [];
        dataList.push(data);
        const currentTimes = data.map(item => this.$moment(item.dateTime).format('HH:mm'));
        const mergedTimes = [...new Set([...xAxis, ...currentTimes])];
        xAxis = mergedTimes.sort((a, b) => a.localeCompare(b));
      });
      return { xAxis, dataList };
    },
    handlerChartData(totalData, pointName) {
      // 处理表格数据
      this.handlerSimpColumn(totalData, pointName);
      // 处理图表数据
      let series = [];
      const { xAxis, dataList } = this.getXAxisData(totalData, pointName);
      dataList.map((data, i) => {
        const timeValueMap = {};
        data.forEach(item => {
          const time = this.$moment(item.dateTime).format('HH:mm');
          timeValueMap[time] = item.pvAfterRatio || 0;
        });
        const seriesData = xAxis.map(time => timeValueMap[time]);
        series.push({
          name: this.legendLists[i],
          type: 'line',
          data: seriesData,
          symbolSize: 0,
          smooth: true,
          lineStyle: {
            color: this.colorList[i]
          },
          itemStyle: {
            normal: {
              color: this.colorList[i],
              borderColor: this.colorList[i]
            }
          },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              {
                offset: 0,
                color: this.colorList[i]
              },
              {
                offset: 1,
                color: '#fff'
              }
            ])
          }
        });
      });
      let svOptionList = tabs.map(data => data.value);
      let type = svOptionList.includes(pointName) ? 'SV' : pointName;
      type ? (this[`${type}Option`].series = series) : (this.SVption.series = series);
      type ? (this[`${type}Option`].xAxis[0].data = xAxis) : (this.SVption.xAxis[0].data = xAxis);
    },
    //展开历史数据图表
    showTable(type) {
      this.tableVis = true;
      this.tableTitle = type ? type : this.tabCur;
      this.dataList = type ? this[`${type}TableList`] : this.SVTableList;
    },
    // 时间竖着排列简化版
    handlerSimpColumn(totalData, pointName) {
      // 从item中将值都获取到
      let tableData = [];
      const { xAxis, dataList } = this.getXAxisData(totalData, pointName);
      dataList.map((data, indexF) => {
        const timeValueMap = {};
        data.forEach(item => {
          const time = this.$moment(item.dateTime).format('HH:mm');
          timeValueMap[time] = item.pvAfterRatio || 0;
        });
        if (indexF === 0) {
          tableData = xAxis.map((time, index) => {
            return {
              key: index,
              collectionTime: time,
              activedData: timeValueMap[time]
            };
          });
        } else if (indexF === 1) {
          xAxis.forEach((time, index) => {
            if (!tableData[index]) {
              tableData[index] = { key: index };
            }
            tableData[index]['yesterdayData'] = timeValueMap[time];
          });
        } else {
          xAxis.forEach((time, index) => {
            if (!tableData[index]) {
              tableData[index] = { key: index };
            }
            tableData[index]['lastMonthDayData'] = timeValueMap[time];
          });
        }
      });
      let svOptionList = tabs.map(data => data.value);
      let type = svOptionList.includes(pointName) ? 'SV' : pointName;
      type ? (this[`${type}TableList`] = tableData) : (this.SVTableList = tableData);
    },
    //下载图表
    exportExcel() {
      let params = {
        ...this.searchLineInfo,
        devicePoints: [
          {
            deviceId: this.industryDeviceId,
            points: [this.tableTitle]
          }
        ],
        crossFlag: false
      };
      // 导出xls格式文件
      historyExcel(params).then(res => {
        exportFile(res, `${this.tableTitle}数据分析`, 'xlsx');
      });
    },

    // 数据字典
    async getSystemDictList(key, value, options) {
      const { resultData } = await sysDictListByCode(key);
      let data = resultData.map(i => {
        return {
          label: i.dictName,
          value: i.dictCode,
          color: i.color ? i.color : i.remark ? i.remark : '#333'
        };
      });
      this[value] = resultData.reduce((acc, item) => {
        acc[item.dictCode] = item.dictName;
        return acc;
      }, {});
      if (options) this[options] = data;
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-modal-body {
  padding-top: 0;
}
.content-left {
  display: flex;
  flex-direction: column;
  .content-left-top {
    display: flex;
    flex-direction: column;
    width: 100%;
  }
  .content-box {
    display: flex;
    justify-content: space-between;
    width: calc(100% - 12px);
    padding: 12px;
    box-sizing: border-box;
    background: var(--supply-color-bg-card-DEFAULT);
    margin-bottom: 12px;
  }
  .form-box {
    display: flex;
    align-items: center;
  }
  .page-title {
    flex: none;
    width: calc(100% - 12px);
    padding: 12px;
    box-sizing: border-box;
    font-size: 16px;
    font-weight: 7000;
    background-color: var(--supply-color-bg-card-DEFAULT);
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-radius: 4px;
    .form-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-right: 20px;

      .form-label {
        height: 20px;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-secondary);
        letter-spacing: 0;
        margin-right: 12px;
      }
    }

    .inspect-time {
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 12px;
      color: #666666;
      letter-spacing: 0;
    }
  }
  .content-left-info {
    display: flex;
    flex-wrap: wrap;
    flex: 1;
  }
  .left-card {
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    box-sizing: border-box;
    padding: 8px;
    margin-bottom: 12px;
    position: relative;
  }
  .chart-down {
    position: absolute;
    right: 8px;
    top: 4px;
  }
  .top-card {
    width: calc(33.3% - 12px);
    height: 80px;
    display: flex;
    flex-direction: column;
    margin-right: 12px;
    border: 1px solid var(--supply-color-border-DEFAULT);
    .top-title {
      display: flex;
      align-items: center;
      .icon {
        width: 20px;
        height: 20px;
        margin-right: 8px;
      }
      .title-text {
        height: 20px;
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
      }
    }
    .top-cont {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .status1 {
        font-size: 16px;
        font-weight: 500;
        color: #f64357;
        text-align: left;
      }
      .status2 {
        font-size: 16px;
        font-weight: 500;
        color: #20c997;
        text-align: center;
      }
      .status3 {
        font-size: 16px;
        font-weight: 500;
        color: #4285f4;
        text-align: center;
      }
      .date {
        width: 100%;
        text-align: center;
        margin-bottom: 5px;
      }
      .time {
        font-size: 16px;
      }
    }
    &:last-child {
      margin-right: 0px;
    }
  }
  .chart-100 {
    width: calc(100% - 12px);
    height: calc((100% - 24px) / 3);
    margin-right: 12px;
    .chart-top {
      height: 32px;
      display: flex;
      justify-content: flex-start;
      align-items: center;
      border-bottom: 1px solid var(--mbd-4-cls);

      span {
        display: inline-block;
        height: 100%;
        width: 80px;
        font-size: 14px;
        color: #999999;
        text-align: center;
        font-weight: 400;
        line-height: 32px;
        cursor: pointer;
        &.active {
          color: var(--supply-color-primary-DEFAULT);
          border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
        }
      }
    }
    .chart-cont {
      width: 100%;
      height: calc(100% - 46px);
      overflow: hidden;
      position: relative;
      display: flex;
    }
  }
  .chart-50 {
    width: calc(50% - 12px);
    height: 244px;
    margin-right: 12px;
    .chart-top {
      height: 34px;
      width: 100%;
      display: flex;
      justify-content: space-between;
      align-items: center;
      .card-title {
        font-weight: 700;
      }
    }
    .chart-cont {
      width: 100%;
      height: 194px;
      overflow: hidden;
      position: relative;
      display: flex;
    }
  }
  .chart-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
  .bottom-card {
    width: calc(50% - 12px);
    margin-right: 12px;
    height: 80px;
    margin-bottom: 12px;
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: space-around;
    .card-label {
      font-size: 18px;
    }
    .card-value {
      font-size: 18px;
      font-weight: 700;
      .status1 {
        color: red;
      }
      .status2 {
        color: #0cb87f;
      }
    }
  }
}
.data-tool {
  width: 100%;
  display: flex;
  justify-content: space-between;
  box-sizing: border-box;
  align-items: center;
  .table-title {
    font-weight: 700;
    font-size: 16px;
  }
}
</style>
