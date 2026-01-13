<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-10-08 16:33:02
-->
<template>
  <div class="content supply-flex supply-flex-col">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <date-select @change="dateChange" v-if="showDate" ref="myTime"></date-select>
    </div>
    <div v-if="showType === 'chart'" class="tabs">
      <div
        v-for="item in tabs"
        :key="item.pointName"
        :class="currentParams === item.pointMemo ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin supply-flex-1">
      <div v-if="showType === 'chart'" class="chart-wrapper">
        <line-chart
          v-if="flag"
          :darkTheme="'light'"
          :option="pollutantOption"
          ref="inChart1"
        ></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
      <div v-else class="table-wrapper">
        <w-config-provider>
          <w-table
            class="tableDevice"
            ref="wTable"
            :columns="columns"
            :data-source="data"
            :scroll="{ y: 145 }"
            :pagination="false"
            rowKey="id"
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
import moment from 'moment';
import { getShortDateStr } from '@/utils/util';
import DateSelect from '../DateSelect.vue';
import { removalRate } from '@/api/analysis';
import { getPointConfigsByPumpHouseIdAndGroupType, getPointValue } from '@/api/optimization';
import { pollutantOption, pointsData } from '../data';
export default {
  name: 'ChartData',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    },
    showType: {
      type: String,
      default: 'chart'
    },
    showDate: {
      type: Boolean,
      default: false
    },
    modleType: {
      type: String,
      default: ''
    }
  },
  components: {
    DateSelect,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
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
      loading: false,
      currentParams: '',
      tabs: [],
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
      pollutantOption,

      columns: [],
      data: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          if (this.$refs.myTime) {
            this.$refs.myTime.timeChange();
          } else {
            this.getPointData();
          }
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointMemo;
      const dataList = this.currentDevice.dataList;
      this.updateChartData(dataList);

      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 300);
      // this.getPointData();
    },
    dateChange(val) {
      this.dateParam = val;
      this.getPointData();
    },
    async getPointData() {
      this.loading = true;
      this.flag = false;
      let param = {
        deviceType: 'INDUSTRY_DEVICE',
        ...this.dateParam,
        productCode: 'water_purification',
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await removalRate(param);
      this.loading = false;
      if (status === 'complete') {
        this.tabs = resultData || [];
        this.currentParams = this.tabs[0]?.pointMemo;
        this.currentDevice = this.tabs[0] || {};
        const dataList = this.currentDevice.dataList || [];
        this.updateChartData(dataList);
        this.flag = true;
      }
    },
    updateChartData(dataList) {
      if (dataList.length) {
        let dateList = getShortDateStr(dataList.map(item => item.dateTime));
        this.pollutantOption.xAxis[0].data = dateList;
        this.pollutantOption.series[0].data = dataList.map(item => item.pv);
      } else {
        this.pollutantOption.yAxis[0].max = 100;
        this.pollutantOption.yAxis[0].min = 0;
        this.pollutantOption.xAxis[0].data = [];
        this.pollutantOption.series[0].data = [];
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  height: calc(100%);
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
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tabs {
    padding: 0 12px;
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      white-space: nowrap;
      margin-bottom: 8px;
      height: 24px;
      line-height: 24px;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 15px;
      background: var(--supply-color-bg-card-dark);
      border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
      color: var(--supply-color-secondary);
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: var(--supply-color-online);
    }
  }
  .spin {
    height: calc(100% - 64px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 0 0 10px;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
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
