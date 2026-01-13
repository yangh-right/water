<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-23 10:36:50
-->
<template>
  <div class="chart-wrap">
    <w-spin :spinning="loading" class="spin">
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
import { queryTechnologicalData } from '@/api/analysis';
import { lineMap, pointValueType } from './data';
export default {
  name: 'ChartData',
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
    line: {
      type: String,
      default: '1'
    },
    options: {
      type: Object,
      default: () => ({})
    },
    configCode: {
      type: String,
      default: ''
    },
    showType: {
      type: String,
      default: 'chart'
    },
    isReverse: {
      type: Boolean,
      default: false
    },
    hideEmpty: {
      type: Boolean,
      default: false
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      pointCodeMap: {},
      pointCodes: [],
      flag: true,
      loading: false,
      currentParams: '',
      tabs: [],
      option: 'day',
      type: '1',
      endTime: '',
      startTime: '',
      columns: [],
      data: [],
      totalData: []
    };
  },
  computed: {
    // lineParam() {
    //   return lineMap[this.line];
    // }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        this.checkAndRequest();
      },
      immediate: true
    },
    configCode: {
      handler(val) {
        this.checkAndRequest();
      },
      immediate: true // 初始化时立即执行一次
    },
    line(val) {
      this.setChartOption(this.totalData);
    }
  },
  methods: {
    // 检查并请求数据
    checkAndRequest() {
      // 当两个参数都有值时才发起请求
      if (this.configCode && this.waterPlantId) {
        this.getPointData();
      }
    },
    async getPointData() {
      if (!this.waterPlantId) return;
      this.loading = true;
      this.flag = false;
      if (!this.configCode || !this.waterPlantId) {
        return;
      }
      let param = {
        pointConfigType: this.configCode,
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await queryTechnologicalData(param);

      this.loading = false;
      if (status === 'complete') {
        this.totalData = resultData;
        this.setChartOption(resultData);
        this.flag = true;
      }
    },
    setChartOption(data) {
      this.options.series = [];
      let xAxisData = [];
      if (this.isReverse) {
        this.options.yAxis[0].data = data[0].placePointDataList
          .map(item => item.placeName)
          .reverse();
        this.options.xAxis[0].name = data[0].pointUnit;
        xAxisData = this.options.yAxis[0].data;
      } else {
        this.options.xAxis[0].data = data[0].placePointDataList.map(item => item.placeName);
        this.options.yAxis[0].name = data[0].pointUnit;
        xAxisData = this.options.xAxis[0].data;
      }
      data.forEach((item, i) => {
        let name = item.pointMemo;
        pointValueType.forEach(type => {
          let data = this.isReverse ? item.placePointDataList.map(place => place[type.key]).reverse()
            : item.placePointDataList.map(place => place[type.key]);
          this.options.series.push({
            data,
            name: name,
            ...this.seriesConfig,
            stack: 'total' + i
          });
        });
      });
      if (this.hideEmpty) {
        let validIndex = [];
        let validXAxisData = xAxisData.filter((item, index) => {
          if (this.options.series?.some(series => series.data?.[index] != null)) {
            validIndex.push(index);
            return true;
          } else {
            return false;
          }
        });
        this.options.series?.forEach(series => {
          series.data = series.data.filter((item, index) => {
            return validIndex.includes(index);
          });
        });
        if (this.isReverse) {
          this.options.yAxis[0].data = validXAxisData;
        } else {
          this.options.xAxis[0].data = validXAxisData;
        }
      }
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
