<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-09 13:42:38
-->
<template>
  <div class="chart-wrap">
    <div class="tabs">
      <div
        v-for="item in tabs"
        :key="item"
        :class="currentParams === item ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item }}
        <w-tooltip placement="topLeft" v-if="item === '硝化速率'">
          <template slot="title">
            硝化速率=（毫克硝态氮量/克挥发性悬浮固体浓度·小时）
          </template>
          <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 16px; cursor: pointer;" />
        </w-tooltip>
        <w-tooltip placement="topLeft" v-if="item === '反硝化速率'">
          <template slot="title">
            反硝化速率=硝态氮浓度/(进水COD浓度*0.4)
          </template>
          <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 16px; cursor: pointer;" />
        </w-tooltip>
      </div>
      <w-select
        class="select-item supply-ml-auto supply-mb-2"
        style="width: 119px"
        placeholder="请选择构筑物"
        v-model="placeId"
        @change="placeChange"
      >
        <w-select-option v-for="(item, index) in placeList" :key="item.id" :value="item.id">
          {{ item.name }}
        </w-select-option>
      </w-select>
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
import { getPlaceListByModelParam, getSludgeTechnologicalTimeData } from '@/api/analysis';
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
    paramConfigurationType: {
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
      placeId: '',
      placeList: [],
      placeData: {},
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
      this.currentParams = value;
      this.placeId = this.placeData?.[this.currentParams]?.[0]?.id || '';
      this.placeList = this.placeData?.[this.currentParams];
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 1000);
      this.getPointData();
    },
    placeChange() {
      this.getPointData();
    },
    async getPointList() {
      let params = {
        paramConfigurationType: this.paramConfigurationType,
        modelTypeCode: '4',
        line: this.line
      };
      let { resultData, status } = await getPlaceListByModelParam(params);
      if (status === 'complete') {
        resultData = resultData || {};
        this.placeData = resultData;
        this.tabs = Object.keys(this.placeData);
        this.currentParams = this.tabs[0] || '';
        this.placeId = this.placeData?.[this.currentParams]?.[0]?.id || '';
        this.placeList = this.placeData?.[this.currentParams];

        this.getPointData();
      }
    },
    dateChange(val) {
      this.dateParam = val;
      this.getPointData();
    },
    async getPointData() {
      if (!this.placeId || !this.waterPlantId) {
        this.setChartData([]);
        return;
      }
      this.loading = true;
      this.flag = false;
      let param = {
        startDateTime: this.dateParam.dates.startTime,
        endDateTime: this.dateParam.dates.endTime,
        waterPlantId: this.waterPlantId,
        paramConfigurationType: this.paramConfigurationType,
        placeId: this.placeId
      };
      let { resultData, status } = await getSludgeTechnologicalTimeData(param);
      console.log('resultData', resultData);

      this.loading = false;
      if (status === 'complete') {
        resultData = resultData || [];

        this.setChartData(resultData);
      }
    },
    setChartData(resultData) {
      if (resultData.length) {
        this.options.xAxis[0].data = resultData?.[0]?.timeDataList.map(item => item.dateTimeStr);
        this.options.series = [];
        resultData.forEach((item, i) => {
          let name = item.pointMemo;
          const timeDataList = item.timeDataList;
          let data = timeDataList.map(val => val.modelPointValue);
          this.options.series.push({
            data,
            yAxisIndex: i ? 1 : 0,
            name: name,
            ...this.seriesConfig
          });
        });
        let max1 = Math.max(...(this.options.series?.[0].data || [])) || 350;
        let max2 = 10;
        if (this.options.series.slice(1).length) {
          max2 = Math.max(
            ...this.options.series.slice(1).map(item => Math.max(...item.data) || 10)
          );
        }
        max1 = this.ceilNumber(max1);
        max2 = this.ceilNumber(max2);
        this.options.yAxis = [];
        let yName1 = resultData[0]?.pointUnit || 'mg/L';
        this.options.yAxis[0] = {
          type: 'value',
          name: yName1,
          interval: Math.ceil(max1 / 5),
          max: max1,
          nameTextStyle: {
            color: '#00000073',
            align: 'center',
            padding: yName1.length > 15 ? [0, 0, 0, 108] : [0, 14, 0, 0]
          }
        };
        let yName2 = resultData[1]?.pointUnit || 'mg/L';
        if (resultData.length > 1) {
          this.options.yAxis[1] = {
            type: 'value',
            max: max2,
            name: yName2,
            interval: Math.ceil(max2 / 5),
            nameTextStyle: {
              color: '#00000073',
              align: 'center',
              padding: yName2.length > 15 ? [0, 95, 0, 0] : [0, 0, 0, 14]
            }
          };
        }
        this.flag = true;
      } else {
        this.flag = false;
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
  .search {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
  }
}
.form-item {
  margin-top: 10px;
  width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  width: 100%;
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
    padding: 0 8px;
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
