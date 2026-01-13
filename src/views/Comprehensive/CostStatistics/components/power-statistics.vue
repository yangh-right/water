<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-14 16:48:20
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="form">
        <div class="form-item">
          <w-month-picker
            v-model="dateOption"
            style="width: 100px"
            placeholder="选择月份"
            size="small"
            :allowClear="false"
            :disabledDate="disabledDate"
            @change="handleChange"
          />
        </div>
      </div>
    </div>
    <div v-if="tabs.length > 0" class="points-box">
      <w-select
        v-model="currentParams"
        mode="multiple"
        placeholder="请选择"
        :maxTagCount="4"
        size="small"
        style="width: 100%"
        @change="handleChange"
      >
        <w-select-option v-for="item in tabs" :key="item.useId">
          {{ item.placeName }}
        </w-select-option>
      </w-select>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div class="card-inner">
          <bar-chart
            v-if="chartData.length > 0"
            :darkTheme="'light'"
            :option="barOption"
            ref="barChart"
          ></bar-chart>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { powerOption, LevelColorMap } from './options';
import {
  getPlacesByPointConfigCode,
  getDevicesByPointConfigCode,
  getEnergyTimeDataPlaceAnalysis,
  getEnergyTimeDataDeviceAnalysis
} from '@/api/analysis.js';
export default {
  name: 'PowerStatistics',
  props: {
    title: {
      type: String,
      default: ''
    },
    apiType: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  data() {
    return {
      loading: false,
      dateOption: this.$moment(),
      tabs: [],
      currentParams: [],
      barOption: JSON.parse(JSON.stringify(powerOption)),
      chartData: []
    };
  },
  inject: ['state'],
  computed: {
    color: {
      get() {
        return LevelColorMap[this.state.theme] || LevelColorMap['default'];
      },
      set() {}
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.queryPointList(val);
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    async queryPointList() {
      let apiObject = {
        placesApi: getPlacesByPointConfigCode,
        devicesApi: getDevicesByPointConfigCode
      };
      if (!apiObject[this.apiType]) return false;
      this.loading = true;
      let params = {
        type: 'energy',
        pumpHouseId: this.waterPlantId,
        configCode: 'Dev_Power'
      };
      let { resultData, status } = await apiObject[this.apiType](params);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.tabs = resultData;
          this.tabs.forEach((item, idx) => {
            if (this.apiType == 'placesApi') {
              item.useId = item.id;
            } else {
              item.useId = item.industryDeviceId;
            }
            if (idx < 2) {
              this.currentParams.push(item.useId);
            }
          });
          this.queryChartData();
        } else {
          this.tabs = [];
          this.currentParams = [];
        }
      }
    },
    handleChange() {
      this.queryChartData();
    },
    async queryChartData() {
      let apiObject = {
        placesApi: getEnergyTimeDataPlaceAnalysis,
        devicesApi: getEnergyTimeDataDeviceAnalysis
      };
      if (!apiObject[this.apiType]) return false;
      this.loading = true;
      let params = {
        endDate: this.$moment(this.dateOption)
          .endOf('month')
          .format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: this.$moment(this.dateOption)
          .startOf('month')
          .format('YYYY-MM-DD'),
        dateType: 'day'
      };
      // 判断来源
      if (this.apiType == 'placesApi') {
        params.placeIdList = this.currentParams;
      } else {
        params.deviceIdList = this.currentParams;
      }
      let { resultData, status } = await apiObject[this.apiType](params);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.chartData = resultData;
          this.handleChartData();
        } else {
          this.chartData = [];
        }
      }
    },
    // 处理图表数据
    handleChartData() {
      if (this.chartData.length > 0) {
        let dataTime = [],
          seriesArr = [];
        this.chartData.forEach((item, idx) => {
          if (idx === 0) {
            dataTime = item.energyList.map(d => d.date.slice(-2));
          }
          let seriesData = {
            name: item.placeName,
            type: 'line',
            smooth: false,
            itemStyle: {
              color: idx < 12 ? this.color[idx] : this.generateRandomColor()
            },
            data: item.energyList.map(k => k.powerPv)
          };
          seriesArr.push(seriesData);
        });
        this.barOption.yAxis[0].name = 'kw·h';
        this.barOption.xAxis[0].data = dataTime;
        this.barOption.series = seriesArr;
      }
    },
    generateRandomColor() {
      // 生成三个随机数作为 RGB 值
      var r = Math.floor(Math.random() * 256);
      var g = Math.floor(Math.random() * 256);
      var b = Math.floor(Math.random() * 256);
      // 组装成颜色字符串
      var color = 'rgb(' + r + ',' + g + ',' + b + ')';
      return color;
    },
    disabledDate(current) {
      return current && current > this.$moment().endOf('month');
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;

    /deep/ .wpg-select {
      width: 120px !important;
    }
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .points-box {
    width: 100%;
    padding: 15px 12px;
    height: 40px;
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

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }
  .empty {
    width: 100%;
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
