<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-04 19:49:56
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="form-item">
        <w-select
          class="select-item"
          style="width: 202px"
          placeholder="请选择时间"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
          v-model="option"
          :options="options"
          @change="optionsChange"
        ></w-select>
      </div>
    </div>
    <div class="tabs">
      <div
        v-for="item in tabs"
        :key="item.pointName"
        :class="currentParams === item.pointMemo ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <line-chart
          v-if="flag"
          :darkTheme="'light'"
          :option="inWaterOption"
          ref="inChart1"
        ></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getPointConfigsByPumpHouseIdAndGroupType, getPointValue } from '@/api/optimization';
import { inWaterOption } from './options';
export default {
  name: 'ChartData',
  props: {
    title: {
      type: String,
      default: ''
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
      tabs: [],
      currentParams: '',
      option: 'day',
      type: '1',
      options: [
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
      inWaterOption: inWaterOption,
      endTime: '',
      startTime: ''
    };
  },
  watch: {
    waterPlantId() {
      this.getPointList();
    }
  },
  created() {
     this.startTime = this.$moment().format('YYYY-MM-DD 00:00:00');
    this.endTime = this.$moment().format('YYYY-MM-DD 23:59:59');
    if (this.waterPlantId) {
      this.getPointList();
    }
  },
  methods: {
    optionsChange() {
      console.log(this.option);
      if (this.option === 'day') {
        this.type = '1';
        this.startTime = this.$moment()
          .subtract(1, 'day')
          .format('YYYY-MM-DD 00:00:00');
      } else if (this.option === 'days') {
        this.type = '2';
        this.startTime = this.$moment()
          .subtract(2, 'day')
          .format('YYYY-MM-DD 00:00:00')
      } else {
        this.type = '3';
        this.startTime = this.$moment()
          .subtract(6, 'day')
          .format('YYYY-MM-DD 00:00:00')
      }
      if (this.currentDevice) {
        this.getPointData();
      }
    },
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointMemo;
      this.getPointData();
    },
    async getPointList() {
      let params = {
        pumpHouseId: this.waterPlantId, //传水厂id
        groupType: 'base_cockpit_inlet' //进水
      };
      let { resultData, status } = await getPointConfigsByPumpHouseIdAndGroupType(params);
      if (status === 'complete') {
        if (resultData.length) {
          let data = resultData[0].pointConfigRels;
          let temp;
          data.forEach((item, index) => {
            if (item.pointMemo === 'COD') {
              temp = item;
              data.splice(index, 1);
            }
          });
          data.unshift(temp);
          this.tabs = data;
          this.currentParams = this.tabs[0].pointMemo;
          this.currentDevice = this.tabs[0];
          this.getPointData();
        } else {
          this.tabs = [];
          this.currentParams = '';
          this.currentDevice = {};
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
        // let data1 = resultData.forecastDataVOS;
        if (data.length) {
          data[0].dataAndTimeList.forEach(item => {
            dataTime.push(item.date.slice(5, 16));
            historyData.push(item.pv);
            forecastData.push(item.simulatePv);
          });
        }
        // if (data1.length) {
        //   data1.forEach((item) => {
        //     dataTime.push(item.dataTime.slice(5, 16));
        //     forecastData.push(item.pointValue);
        //   });
        // }
        dataTime = Array.from(new Set(dataTime));
        this.inWaterOption.yAxis[0].name = data[0].unit;
        this.inWaterOption.xAxis[0].data = dataTime;
        this.inWaterOption.series[0].data = historyData;
        this.inWaterOption.series[0].name = this.currentDevice.pointMemo;
        this.inWaterOption.series[1].data = forecastData;
        this.flag = true;
      }
    }
  }
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
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .tabs {
    padding: 0 20px;
    margin-top: 8px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      margin-left: 10px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 4px 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 13px;
      font-size: 14px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .spin {
    height: calc(100% - 70px);
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
}
</style>
