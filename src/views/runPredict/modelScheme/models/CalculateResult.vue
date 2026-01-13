<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-07-31 08:58:03
-->
<template>
  <div class="page-wrap">
    <w-spin :spinning="loading" class="spin supply-flex-1">
      <div class="result">
        <div class="table-wrapper">
          <w-config-provider>
            <w-table
              class="tableDevice"
              ref="wTable"
              :columns="columns"
              :data-source="data"
              :scroll="{ x: 450, y: 300 }"
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
        <div class="chart-content">
          <div class="chart__title">出水水质</div>
          <div class="tabs">
            <div
              v-for="item in tabs"
              :key="item.id"
              :class="currentParams === item.industryDeviceId ? 'tab active' : 'tab'"
              @click="paramsChange(item)"
            >
              <div class="title">
                <span class="title__name">{{ item.industryDeviceId }}</span>
              </div>
              <div class="point__value">
                <span>{{ 25 }}</span
                ><span class="supply-ml-2">{{ 'mg/L' }}</span>
              </div>
            </div>
          </div>
          <div class="chart-wrapper">
            <line-chart
              v-if="flag"
              :darkTheme="'light'"
              :option="options"
              ref="inChart1"
            ></line-chart>
            <w-empty v-else class="empty"></w-empty>
          </div>
        </div>
      </div>
    </w-spin>
  </div>
</template>
<script>
import moment from 'moment';
import {
  getDevicesByPointConfigCode,
  getHistoryDataByMultiDate,
  getPointConfigCode
} from '@/api/analysis';
export default {
  name: 'CalculateResult',
  props: {
    waterPlantId: {
      type: String,
      default: '1663413717179568130'
    },
    options: {
      type: Object,
      default: () => ({})
    },
    showType: {
      type: String,
      default: 'chart'
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
      pointCodes: [],
      flag: true,
      loading: false,
      currentParams: 'COD',
      tabs: [
        { industryDeviceId: 'COD', value: 24 },
        { industryDeviceId: 'NH3-N', value: 0.5 },
        { industryDeviceId: 'TN', value: 7.5 },
        { industryDeviceId: 'TP', value: 0.3 },
        { industryDeviceId: 'SS', value: 6.7 }
      ],
      columns: [
        {
          title: '名称',
          dataIndex: 'name',
          key: 'name',
          width: 150,
          ellipsis: true
        },
        {
          title: 'A区',
          dataIndex: 'areaA',
          key: 'areaA',
          width: 150,
          ellipsis: true
        },
        {
          title: 'B区',
          dataIndex: 'areaB',
          key: 'areaB',
          width: 150,
          ellipsis: true
        }
      ],
      data: []
    };
  },
  watch: {
    date: {
      handler(val) {
        this.dateParam = val;
        // this.getPointData();
      }
    },
    waterPlantId: {
      handler(val) {
        // this.getPointList();
      },
      immediate: true
    }
  },
  created() {
    this.data = [
      { name: '缺氧回流流量', areaA: 12344, areaB: 12344 },
      { name: '好氧回流流量', areaA: 12344, areaB: 12344 },
      { name: '排泥量', areaA: 2400, areaB: 2400 },
      { name: '碳源投加量', areaA: 6.43, areaB: 6.43 },
      { name: '好氧1段DO设置点', areaA: 133, areaB: 133 },
      { name: '总能耗', areaA: 13445, areaB: 13445 }
    ];
    // this.getPointCodes();
  },
  methods: {
    async getPointCodes(callBack) {
      let { resultData, status } = await getPointConfigCode(this.configCode);
      if (status === 'complete') {
        this.pointCodes = resultData?.pointNames ? JSON.parse(resultData.pointNames) : [];
        callBack && callBack();
      }
    },
    paramsChange(value) {
      // this.currentDevice = value;
      this.currentParams = value.industryDeviceId;
      // this.loading = true;
      // setTimeout(() => {
      //   this.loading = false;
      // }, 1000);
      // this.getPointData();
    },
    async getPointList() {
      if (!this.waterPlantId) return;
      let params = {
        pumpHouseId: this.waterPlantId,
        configCode: this.configCode
      };
      let { resultData, status } = await getDevicesByPointConfigCode(params);
      if (status === 'complete') {
        if (resultData.length) {
          this.tabs = resultData;
          this.currentParams = this.tabs[0]?.industryDeviceId;
          this.currentDevice = this.tabs[0];
          if (this.pointCodes.length) {
            this.getPointData();
          } else {
            this.getPointCodes(() => {
              this.getPointData();
            });
          }
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
        ...this.dateParam,
        deviceType: 'INDUSTRY_DEVICE',
        devicePoints: [{ deviceId: this.currentParams, points: this.pointCodes }],
        productCode: 'water_purification'
      };
      let { resultData, status } = await getHistoryDataByMultiDate(param);

      this.loading = false;
      if (status === 'complete') {
        let totalData = this.getChartList(resultData);
        this.options.yAxis[0].name = totalData[0]?.pointUnit || '';
        this.options.xAxis[0].data = totalData[0]?.[0]?.map(item => item.dateTime);
        this.options.series = totalData.map(list => {
          let data = list?.[0] || [];
          return {
            name: data?.[0]?.pointMemo || '',
            data: data?.map(item => item.pv),
            type: 'line',
            smooth: true
          };
        });

        this.flag = true;
      }
    },
    getChartList(data) {
      let totalData = {};
      let chartData = [];
      chartData = data.map(time => {
        let arr = {};
        this.getLastData(time.data, arr);
        return arr;
      });
      Object.keys(chartData[0]).map((item, index) => {
        let unit = item.split('&')[1];
        let key = (unit ? unit : '_' + index) + '-' + item.split('&')[2] + '-' + item.split('&')[3];
        chartData.map((itemC, i) => {
          if (totalData[key]) {
            totalData[key].push(itemC[item] || []);
          } else {
            totalData[key] = [itemC[item] || []];
          }
        });
      });
      Object.keys(totalData).forEach(key => {
        totalData[key].pointUnit = key.split('-')[0][0] === '_' ? '' : key.split('-')[0];
      });
      let totalListData = [];
      let pointKeys = Object.keys(totalData);
      this.pointCodes.forEach(point => {
        let key = pointKeys.find(key => key.indexOf(this.currentParams + '-' + point) > -1);
        if (key) totalListData.push(totalData[key]);
      });
      return totalListData;
    },
    getLastData(data, arr, prefix = '') {
      if (Array.isArray(Object.values(data)[0])) {
        Object.keys(data).forEach(item => {
          arr[prefix + '&' + item] = data[item];
        });
      } else {
        Object.keys(data).map(key => this.getLastData(data[key], arr, prefix + '&' + key));
      }
    }
  }
};
</script>

<style lang="less" scoped>
.page-wrap {
  height: fit-content;
}

.form-item {
  margin-top: 10px;
  width: 80px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tabs {
  display: flex;
  flex-wrap: wrap;
  justify-content: flex-start;
  align-items: center;
  cursor: pointer;
  .tab {
    border-radius: 2px;
    min-width: 72px;
    width: fit-content;
    margin-right: 12px;
    margin-bottom: 12px;
    padding: 5px 8px;
    background: #f9fafb;
    .title__name {
      line-height: 20px;
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-secondary);
    }
    .point__value {
      font-weight: 700;
      line-height: 16px;
      font-size: 14px;
      color: var(--supply-color-secondary);
    }
  }
  .active {
    border-bottom: 2px solid #4285f4;
    background: #5b8ff91a;
    .title__name {
      line-height: 20px;
      font-weight: 400;
      font-size: 14px;
      color: #5b8ff9;
    }
    .point__value {
      font-weight: 700;
      line-height: 16px;
      font-size: 14px;
      color: #4285f4;
    }
  }
}
.spin {
  flex: 1;
}
.result {
  display: flex;
}
.chart-content {
  display: flex;
  flex-direction: column;
  width: 50%;
  .chart__title {
    padding: 0 0 8px 0;
    font-weight: 500;
    line-height: 20px;
    font-size: 14px;
    color: var(--supply-color-main);
  }
  .chart-wrapper {
    min-height: 203px;
    width: 100%;
    flex: 1;
  }
}
.table-wrapper {
  width: 50%;
  padding: 0 12px 0 0;
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
