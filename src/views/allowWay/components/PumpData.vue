<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-16 10:57:45
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="content-header__right supply-flex">
        <w-radio-group class="supply-mr-3" v-model="line" size="small" button-style="solid">
          <w-radio-button v-for="item in lineList" :key="item.dictCode" :value="item.dictValue">
            {{ item.dictName }}
          </w-radio-button>
        </w-radio-group>
        <date-select @change="dateChange" v-if="showDate"></date-select>
      </div>
    </div>

    <div class="content-body">
      <w-spin :spinning="loading1" class="spin">
        <div class="search ">
          <div v-if="showType === 'chart'" class="tabs">
            <div
              v-for="item in pointsArr1"
              :key="item.pointName"
              :class="currentPoint1 === item.pointName ? 'tab active' : 'tab'"
              @click="handleChange(item, 1)"
            >
              {{ item.pointMemo }}
            </div>
          </div>
          <w-select
            class="select-item"
            style="width: 119px"
            placeholder="请选择构筑物"
            :getPopupContainer="triggerNode => triggerNode.parentNode"
            v-model="paramsOption"
            :options="placeOptions"
            @change="paramsChange"
          ></w-select>
        </div>
        <div class="chart-wrapper">
          <line-chart
            v-if="flag"
            :darkTheme="'light'"
            :option="barOption"
            ref="inChart1"
          ></line-chart>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </w-spin>
      <w-divider class="divider" type="vertical"></w-divider>
      <w-spin :spinning="loading2" class="spin">
        <div class="search ">
          <div v-if="showType === 'chart'" class="tabs">
            <div
              v-for="item in pointsArr2"
              :key="item.pointName"
              :class="currentPoint2 === item.pointName ? 'tab active' : 'tab'"
              @click="handleChange(item, 2)"
            >
              {{ item.pointMemo }}
            </div>
          </div>
        </div>
        <div class="chart-wrapper">
          <line-chart
            v-if="flag"
            :darkTheme="'light'"
            :option="barOption1"
            ref="inChart1"
          ></line-chart>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </w-spin>
    </div>
  </div>
</template>
<script>
import moment from 'moment';
import {
  getPointConfigsByStructureIdAndGroupType,
  getPointValue,
  getStructureByStationId
} from '@/api/optimization';
import DateSelect from './DateSelect.vue';
import purificationLineMixin from '@/utils/mixins/purificationLineMixin.js';
import { removalRate } from '@/api/cockpit.js';
import { activeSludgeOption as mlssOption, barOption1, pumpDataColumns } from './data';
export default {
  name: 'PumpData',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    showDate: {
      type: Boolean,
      default: false
    },
    showType: {
      type: String,
      default: 'chart'
    }
  },
  components: {
    DateSelect,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  mixins: [purificationLineMixin],
  data() {
    return {
      dateParam: {
        period: '5',
        timeEnum: 'MINUTES',
        dates: {
          startTime: moment()
            .startOf('day')
            .format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      },
      flag: true,
      barOption1,
      loading1: false,
      loading2: false,
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
      paramsOption: '1',
      paramsOptions: {
        '1': {
          //线路
          '1': [
            { label: '一级好氧池A', value: '1' },
            { label: '二级好氧池A', value: '2' }
          ],
          '2': [
            { label: '一级缺氧池A', value: '1' },
            { label: '二级缺氧池A', value: '2' }
          ]
        },
        '2': {
          '1': [
            { label: '一级好氧池B', value: '1' },
            { label: '二级好氧池B', value: '2' }
          ],
          '2': [
            { label: '一级缺氧池B', value: '1' },
            { label: '二级缺氧池B', value: '2' }
          ]
        }
      },
      barOption: mlssOption,
      type: '1',
      currentPoint1: '1',
      line: '0',
      currentPoint2: '1',
      pointsArr1: [
        {
          pointMemo: '硝化速率',
          unit: 'mgNH3-N ·gVSS-1 ·h-1',
          pointName: '1'
        },
        {
          pointMemo: '反硝化速率',
          unit: 'mgNO3 - -N ·gVSS-1 ·h-1',
          pointName: '2'
        }
      ],
      pointsArr2: [
        {
          pointMemo: '厌氧释磷速率',
          pointName: '1'
        }
      ],
      columns: pumpDataColumns,
      data: [
        { time: '0:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '01:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '02:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '03:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '0' },
        { time: '04:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '05:00', jsc_COD: '0', jsc_NH3: '0', jsc_TN: '1' },
        { time: '06:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '07:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '0' },
        { time: '08:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '09:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '10:00', jsc_COD: '0', jsc_NH3: '0', jsc_TN: '1' },
        { time: '11:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '12:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '0' },
        { time: '13:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' },
        { time: '14:00', jsc_COD: '0', jsc_NH3: '1', jsc_TN: '1' }
      ]
    };
  },
  computed: {
    placeOptions() {
      return this.paramsOptions[this.line][this.currentPoint1];
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        {
          this.initData('1645684477654003713');
        }
      }
    }
  },
  created() {},
  methods: {
    async initData(id) {
      // this.isLoading = true;
      // let { status, resultData } = await removalRate(id);
      // if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
      //   this.pointsArr = resultData;
      //   this.handleChange(this.pointsArr[0]);
      // } else {
      this.pointsArr = [
        {
          pointMemo: '流量',
          pointName: 'jsc_water'
        },
        {
          pointMemo: 'COD',
          pointName: 'jsc_COD'
        },
        {
          pointMemo: '氨氮',
          pointName: 'jsc_an'
        }
      ];
      this.handleChange(this.pointsArr[0]);
      // }
      // this.isLoading = false;
    },
    handleChange(item, index) {
      this['currentPoint' + index] = item.pointName;
      this.loading = true;
      setTimeout(() => {
        if (index === 1) {
          this.handleChart(item);
        }
        this.loading = false;
      }, 1000);
    },
    handleChart(pointData) {
      // let { unit, dataAndTimeList = [] } = pointData;
      // let valueList = dataAndTimeList.map(item => item.pv);
      // this.barOption.yAxis[0].name = unit;
      // this.barOption.xAxis[0].data = dataAndTimeList.map(item => item.date?.slice(11, 16));
      // this.barOption.series[0].data = valueList;
      // this.barOption.yAxis[0].name = 'mg/L';
      // this.barOption.xAxis[0].data = [
      //   '0:00',
      //   '03:00',
      //   '06:00',
      //   '09:00',
      //   '12:00',
      //   '15:00',
      //   '18:00',
      //   '21:00',
      //   '24:00'
      // ];
      // this.barOption.series[0].data = [21, 40, 42, 38, 42, 46, 50, 56, 60];
      this.barOption.yAxis[0].name =
        this.pointsArr1.find(item => item.pointName === this.currentPoint1)?.unit || '';
    },
    optionsChange() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
    },
    paramsChange() {
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
      // this.getPointList();
    },
    async getStructure() {
      let res = await getStructureByStationId(this.waterPlantId);
      let { status, resultData } = res;
      if (status === 'complete') {
        // this.paramsOptions = resultData.map(item => {
        //   let obj = {};
        //   obj.value = item.id;
        //   obj.label = item.name;
        //   return obj;
        // });
        if (this.placeOptions.length) {
          this.paramsOption = this.placeOptions[0].value;
          this.getPointList();
        } else {
          this.flag = false;
        }
      }
    },
    dateChange(val) {
      // this.dateParam = val;
      // this.getPointData();
    },
    async getPointList() {
      let params = {
        pumpHouseId: this.paramsOption,
        groupType: 'base_mlss' //进水
      };
      let { resultData, status } = await getPointConfigsByStructureIdAndGroupType(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.tabs = resultData[0].pointConfigRels;
          this.currentDevice = this.tabs[0];
          this.getPointData();
        } else {
          this.flag = false;
        }
      }
    },
    async getPointData() {
      this.loading = true;
      this.flag = false;
      let param = {
        deviceId: this.currentDevice.deviceId,
        endTime: this.endTime,
        pointCode: [this.currentDevice.pointName],
        startTime: this.startTime,
        waterPlantId: this.waterPlantId,
        type: this.type
      };
      let { resultData, status } = await getPointValue(param);
      this.loading = false;
      if (status === 'complete') {
        let dataTime = [],
          historyData = [],
          forecastData = [];
        let data = resultData.biochemicalPoolHistoryDataVOS;
        let data1 = resultData.forecastDataVOS;
        if (data.length) {
          data[0].dataAndTimeList.forEach(item => {
            dataTime.push(item.date.slice(5, 16));
            historyData.push(item.pv);
          });
        }
        if (data1.length) {
          data1.forEach(item => {
            dataTime.push(item.dataTime.slice(5, 16));
            forecastData.push(item.pointValue);
          });
        }
        dataTime = Array.from(new Set(dataTime));
        this.mlssOption.yAxis[0].name = data[0].unit;
        this.mlssOption.xAxis[0].data = dataTime;
        this.mlssOption.series[1].data = historyData;
        this.mlssOption.series[0].data = forecastData;
        this.flag = true;
      }
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
  &-body {
    align-items: center;
    height: calc(100% - 40px);
    display: flex;
    justify-content: space-between;
    .spin {
      width: calc(50% - 10px);
      .search {
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 35px;
      }
    }
    .divider {
      height: 80%;
    }
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
    height: 100%;
  }
  .chart-wrapper {
    height: calc(100% - 35px);
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
  }
}
</style>
