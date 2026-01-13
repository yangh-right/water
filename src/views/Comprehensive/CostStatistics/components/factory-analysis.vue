<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-22 10:18:30
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
            @change="getPointList"
          />
        </div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div class="card-inner">
          <bar-chart
            v-if="dataEchart.length > 0"
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
import { moduleOption } from './options';
import { getEnergyDayData } from '@/api/analysis.js';
export default {
  name: 'FactoryAnalysis',
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
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  data() {
    return {
      loading: false,
      dateOption: this.$moment(),
      barOption: moduleOption,
      dataEchart: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getPointList(val);
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    onChange() {},
    async getPointList() {
      this.loading = true;
      this.dataEchart = [];
      let param = {
        dateType: 'day',
        deviceIdList: [],
        endDate: this.$moment(this.dateOption)
          .endOf('month')
          .format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: this.$moment(this.dateOption)
          .startOf('month')
          .format('YYYY-MM-DD'),
        statType: 0,
        waterPlantIdList: [this.waterPlantId]
      };
      let { resultData, status } = await getEnergyDayData(param);
      this.loading = false;
      if (status === 'complete') {
        this.dataEchart = resultData;
        let dataTime = [],
          energyList = [],
          powerPvList = [];
        this.dataEchart.forEach(item => {
          dataTime.push(item.date.slice(-2));
          powerPvList.push(item.powerPv);
          energyList.push(item.energy);
        });
        this.barOption.yAxis[0].name = 'kWh';
        this.barOption.yAxis[1].name = 'kWh';
        this.barOption.xAxis[0].data = dataTime;
        this.barOption.series[0].data = powerPvList;
        this.barOption.series[1].data = energyList;
      }
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
  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
