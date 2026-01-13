<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-04 19:50:30
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{title}}</div>
      <div class="form">
        <div class="form-item">
          <w-select
            class="select-item"
            style="width: 202px"
            placeholder="请选择构筑物"
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
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <line-chart v-if="flag" :darkTheme="'light'" :option="waterTempOption" ref="inChart1"></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import {
  getPointConfigsByStructureIdAndGroupType,
  getPointValue,
  getStructureByStationId,
} from '@/api/optimization';
import { waterTempOption } from './options';
export default {
  name: 'ChartData',
  props: {
    title: {
      type: String,
      default: '',
    },
    waterPlantId: {
      type: String,
      default: '',
    },
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
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
          value: 'day',
        },
        {
          label: '3天',
          value: 'days',
        },
        {
          label: '1周',
          value: 'week',
        },
      ],
      paramsOption: '',
      paramsOptions: [],
      waterTempOption,
      endTime: '',
      startTime: '',
      type: '1',
    };
  },
  watch: {
    waterPlantId() {
      this.getStructure();
    },
  },
  created() {
    this.startTime = this.$moment().format('YYYY-MM-DD 00:00:00');
    this.endTime = this.$moment().format('YYYY-MM-DD 23:59:59');
    if (this.waterPlantId) {
      this.getStructure();
    }
  },
  methods: {
    optionsChange() {
      if (this.timeOption === 'day') {
        this.type = '1';
        this.startTime = this.$moment().format('YYYY-MM-DD 00:00:00');
      } else if (this.timeOption === 'days') {
        this.type = '2';
        this.startTime = this.$moment().subtract(2, 'day').format('YYYY-MM-DD 00:00:00');
      } else {
        this.type = '3';
        this.startTime = this.$moment().subtract(6, 'day').format('YYYY-MM-DD 00:00:00');
      }
      if (this.currentDevice) {
        this.getPointData();
      }
    },
    paramsChange() {
      this.getPointList();
    },
    async getStructure() {
      let res = await getStructureByStationId(this.waterPlantId);
      let { status, resultData } = res;
      if (status === 'complete') {
        this.paramsOptions = resultData.map((item) => {
          let obj = {};
          obj.value = item.id;
          obj.label = item.name;
          return obj;
        });
        if (this.paramsOptions.length) {
          this.paramsOption = this.paramsOptions[0].value;
          this.getPointList();
        } else {
          this.flag = false;
        }
      }
    },
    async getPointList() {
      let params = {
        pumpHouseId: this.paramsOption,
        groupType: 'base_do', //进水
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
        type: this.type,
      };
      let { resultData, status } = await getPointValue(param);
      this.loading = false;
      if (status === 'complete') {
        let dataTime = [],
          historyData = [],
          forecastData = [];
        let data = resultData.biochemicalPoolHistoryDataVOS;
        if (data.length) {
          data[0].dataAndTimeList.forEach((item) => {
            dataTime.push(item.date.slice(5, 16));
            historyData.push(item.pv);
            forecastData.push(item.simulatePv);
          });
        }
        dataTime = Array.from(new Set(dataTime))
        this.waterTempOption.yAxis[0].name = data[0].unit;
        this.waterTempOption.xAxis[0].data = dataTime;
        this.waterTempOption.series[0].data = historyData;
        this.waterTempOption.series[1].data = forecastData;
        this.flag = true;
      }
    },
  },
};
</script>

<style lang="less" scoped>
.content {
  margin: 6px;
  width: calc(25% - 6px);
  background-color: var(--supply-color-bg-card-component);
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
    color: #333333;
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
  .spin {
    height: calc(100% - 40px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
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
