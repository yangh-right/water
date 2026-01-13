<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div class="card-inner">
          <bar-chart
            v-if="tabs.length > 0"
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
import { pollutionOption } from './options.js';
import { getDeviceByCode } from '@/api/analysis.js';
import { sourceTimeData } from '@/api/analysis.js';

export default {
  name: 'CarbonAnalysis',
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
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
  data() {
    return {
      loading: false,
      tabs: [],
      barOption: JSON.parse(JSON.stringify(pollutionOption)),
      data: [],
      deviceId: ''
    };
  },
  computed: {},
  watch: {},
  methods: {
    async getDeviceByCode() {
      let { resultData, status } = await getDeviceByCode();
      if (status === 'complete') {
        this.deviceId = resultData?.id;
        if (this.deviceId) {
          this.getPointList();
        }
      }
    },
    async getPointList() {
      this.loading = true;
      let params = {
        dateType: 'hour',
        deviceIdList: [this.deviceId],
        startDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 00:00:00'),
        endDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 23:59:59'),
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await sourceTimeData(params);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.tabs = resultData;
          this.currentDevice = this.tabs.find(v => v.carbonEmissionTypeName === '电耗');
          this.handleChartData();
        } else {
          this.tabs = [];
          this.currentDevice = {};
        }
      }
    },
    // 处理图表数据
    handleChartData() {
      if (Object.keys(this.currentDevice).length > 0) {
        let dataTime = [],
          relativeData = [];
        let { carbonEmissionDataList, pointMemo, unit = 'kWh' } = this.currentDevice;
        if (carbonEmissionDataList.length) {
          carbonEmissionDataList.forEach(item => {
            dataTime.push(item.dataTime.slice(11, 16));
            relativeData.push(item.value);
          });
        }
        dataTime = Array.from(new Set(dataTime));
        this.barOption.yAxis[0].name = unit;
        this.barOption.xAxis[0].data = dataTime;
        this.barOption.series[0].data = relativeData;
      }
    }
  },
  created() {
    this.getDeviceByCode();
  },
  mounted() {}
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
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
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
    justify-content: center;
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
