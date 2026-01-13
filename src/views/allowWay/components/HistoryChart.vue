<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-29 11:44:27
-->
<template>
  <div class="chart-wrap">
    <div v-if="showType === 'chart'" class="tabs">
      <div
        v-for="item in tabs"
        :key="item.id"
        :class="currentParams === item.id ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.name }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin supply-flex-1">
      <div v-if="showType === 'chart'" class="chart-wrapper">
        <line-chart v-if="flag" :darkTheme="'light'" :option="options" ref="inChart1"></line-chart>
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
import { getMainProcessingPlaces, getTechnologicalTimeData } from '@/api/analysis';
import { lineMap, pointHistoryType } from './data';

export default {
  name: 'HistoryChart',
  props: {
    seriesConfig: {
      type: Object,
      default: () => ({
        type: 'line',
        smooth: true
      })
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    options: {
      type: Object,
      default: () => ({})
    },
    showType: {
      type: String,
      default: 'chart'
    },
    line: {
      type: String,
      default: '1'
    },
    configCode: {
      type: String,
      default: ''
    },
    date: {
      type: Object,
      default: () => ({
        period: '5',
        timeEnum: 'MINUTES',
        dates: {
          startTime: moment()
            .startOf('day')
            .format('YYYY-MM-DD HH:mm:ss'),
          endTime: moment().format('YYYY-MM-DD HH:mm:ss')
        }
      })
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      dateParam: this.date,
      flag: true,
      loading: false,
      currentParams: '',
      tabs: [],
      columns: [],
      data: []
    };
  },
  computed: {
    lineParam() {
      return lineMap[this.line];
    }
  },
  watch: {
    date: {
      handler(val) {
        this.dateParam = val;
        this.getPointData();
      }
    },
    line: {
      handler(val) {
        this.getPointList();
      }
    },
    waterPlantId: {
      handler(val) {
        this.getPointList();
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.id;
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
      this.getPointData();
    },
    async getPointList() {
      let params = {
        waterPlantId: this.waterPlantId,
        line: 1,
        allLineFlag: true
      };
      let { resultData, status } = await getMainProcessingPlaces(this.waterPlantId);
      if (status === 'complete') {
        if (resultData.length) {
          this.tabs = resultData;
          this.currentParams = this.tabs[0]?.id;
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
    dateChange(val) {
      this.dateParam = val;
      this.getPointData();
    },
    async getPointData() {
      this.loading = true;
      this.flag = false;
      let param = {
        startDateTime: this.dateParam.dates.startTime,
        endDateTime: this.dateParam.dates.endTime,
        waterPlantId: this.waterPlantId,
        pointConfigCode: this.configCode,
        placeId: this.currentParams
      };
      let { resultData, status } = await getTechnologicalTimeData(param);
      this.loading = false;
      if (status === 'complete') {
        this.options.xAxis[0].data = resultData?.[0]?.timeDataList.map(item => item.dateTimeStr);
        this.options.series = [];
        resultData.forEach((item, i) => {
          let name = item.pointMemo;
          const timeDataList = item.timeDataList;
          pointHistoryType.forEach(type => {
            let data = timeDataList.map(val => val[type.key]);
            this.options.series.push({
              data,
              yAxisIndex: i ? 1 : 0,
              name: name,
              ...this.seriesConfig,
              stack: 'total' + i
            });
          });
        });
        let max1 =
          Math.max(
            ...(this.options.series?.[0].data || []),
            ...(this.options.series?.[2].data || [])
          ) || 350;
        let max2 = 10;
        if (this.options.series.slice(2).length) {
          max2 = Math.max(
            ...this.options.series.slice(2).map(item => Math.max(...item.data) || 10)
          );
        }
        max1 = this.ceilNumber(max1);
        max2 = this.ceilNumber(max2);
        this.options.yAxis = [];
        this.options.yAxis[0] = {
          type: 'value',
          name: resultData[0]?.pointUnit || 'mg/L',
          interval: Math.ceil(max1 / 5),
          max: max1,
          nameTextStyle: {
            color: '#00000073',
            align: 'right'
          }
        };
        if (resultData.length > 1) {
          this.options.yAxis[1] = {
            type: 'value',
            max: max2,
            name: resultData[1]?.pointUnit || 'mg/L',
            interval: Math.ceil(max2 / 5),
            nameTextStyle: {
              color: '#00000073',
              align: 'left'
            }
          };
        }
        this.flag = true;
      }
    },
    ceilNumber(number) {
      let bite = 0;
      if (number < 10) {
        return 10;
      }
      while (number >= 10) {
        number /= 10;
        bite += 1;
      }
      return Math.ceil(number) * Math.pow(10, bite);
    }
  }
};
</script>

<style lang="less" scoped>
.chart-wrap {
  height: 100%;
  display: flex;
  flex-direction: column;
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
  flex: 1;
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
</style>
