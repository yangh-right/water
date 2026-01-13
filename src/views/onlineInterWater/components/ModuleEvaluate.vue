<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-07-03 10:45:26
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">
        {{ title
        }}<w-tooltip placement="topLeft" class="supply-ml-1" style="cursor: pointer;">
          <template slot="title">
            通过计算预测值与实测值的均方根误差，若均方根误差超过20%可能需调整模型<br />
            通过计算预测值与实测值的相对误差，若误差超过实测值（实测值准确的情况下）±20%可能需调整模型
          </template>
          <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 16px;" />
        </w-tooltip>
      </div>
    </div>
    <div v-if="showType === 'chart'" class="tabs">
      <div
        v-for="item in tabs"
        :key="item.pointName"
        :class="currentParams === item.pointName ? 'tab active' : 'tab'"
        @click="paramsChange(item)"
      >
        {{ item.pointMemo }}
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="showType === 'chart'" class="chart-wrapper">
        <bar-chart
          v-if="tabs.length > 0"
          :darkTheme="'light'"
          :option="barOption"
          ref="barChart"
        ></bar-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
      <div v-else class="table-wrapper">
        <w-config-provider>
          <w-table
            class="tableDevice"
            ref="wTable"
            :columns="columns"
            :data-source="data"
            :scroll="{ y: 200, x: 520 }"
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
import uuid from '@/utils/uuid';
import cloneDeep from 'lodash.clonedeep';
import { getForecastModelEvaluation } from '@/api/optimization';
import { getPointConfigsByPumpHouseIdAndGroupType, modelEvaluation } from '@/api/optimization';
import { moduleOption } from './data';
export default {
  name: 'ModuleEvaluate',
  props: {
    title: {
      type: String,
      default: ''
    },
    showType: {
      type: String,
      default: 'chart'
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    activeModule: {
      type: String,
      default: ''
    },
    tabVal: {
      type: Number,
      default: 0
    }
  },
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  data() {
    return {
      flag: true,
      loading: false,
      tabs: [],
      currentParams: '',
      barOption: moduleOption,
      columns: [],
      currentDevice: {},
      data: []
    };
  },
  watch: {
    waterPlantId() {
      this.getPointList();
    },
    tabVal: {
      handler(val) {
        this.getPointList();
      }
    }
  },
  created() {},
  methods: {
    paramsChange(value) {
      this.currentDevice = value;
      this.currentParams = value.pointName;
      this.loading = true;
      setTimeout(() => {
        this.loading = false;
      }, 400);
      this.handleChartData();
    },
    async getPointList() {
      this.loading = true;
      let methods =
        this.tabVal === 1 ? getForecastModelEvaluation : getPointConfigsByPumpHouseIdAndGroupType;
      let params =
        this.tabVal === 1
          ? this.waterPlantId
          : {
              pumpHouseId: this.waterPlantId, //传水厂id
              groupType: 'outflow' //进水
            };
      let startTime = this.$moment()
        .subtract(24, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      let endTime = this.$moment()
        .add(24, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      let { resultData, status } = await methods(params, startTime, endTime);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.flag = true;
          this.tabs = this.tabVal === 1 ? resultData : resultData[0].pointConfigRels;
          //出水时需要请求数据并进行格式处理
          if (this.tabVal === 2) {
            let promises = [];
            this.tabs.forEach(async item => {
              let params = {
                optionId: this.activeModule,
                pointName: item.pointName,
                waterPlantId: this.waterPlantId
              };
              promises.push(modelEvaluation(params));
            });
            const res = await Promise.allSettled(promises);
            res.forEach((item, index) => {
              if (item.status === 'fulfilled') {
                let dataList = this.getOutPointList(item.value.resultData);
                this.tabs[index].dataList = dataList;
                this.tabs[index].unit = 'mg/L';
              }
            });
          }
          this.currentParams = this.tabs[0].pointName;
          this.currentDevice = this.tabs[0];
          this.handleChartData();
          this.handleTableData();
        } else {
          this.tabs = [];
          this.currentParams = '';
          this.currentDevice = {};
          this.flag = false;
        }
      }
    },
    // 处理图表数据
    handleChartData() {
      let currentDevice = cloneDeep(this.currentDevice);
      if (Object.keys(this.currentDevice).length > 0) {
        let dataTime = [],
          relativeData = [],
          rMSEData = [];
        let { dataList, pointMemo, unit } = this.currentDevice;
        if (dataList && dataList.length > 0) {
          dataList.forEach(item => {
            dataTime.push(item.dateTime);
            relativeData.push(item.relativeError);
            rMSEData.push(item.rMSE);
          });
        }
        dataTime = Array.from(new Set(dataTime));
        this.barOption.yAxis[0].name = unit;
        this.barOption.xAxis[0].data = dataTime;
        this.barOption.series[0].data = relativeData;
        this.barOption.series[1].data = rMSEData;
      }
    },
    // 处理表格数据
    handleTableData() {
      const moduleColumns = [
        {
          title: '时间',
          width: 100,
          align: 'center',
          ellipsis: true,
          dataIndex: 'dateTime',
          customRender: (text, row) => {
            return !!text ? text : '--';
          }
        }
      ];
      // 表格数据
      const tableData = [];
      for (let k = 0; k < 49; k++) {
        tableData.push({});
      }
      this.tabs.forEach((item, i) => {
        let column = {
          title: item.pointMemo,
          width: 200,
          align: 'center',
          ellipsis: true,
          dataIndex: item.pointName,
          children: [
            {
              title: '相对误差',
              width: 100,
              align: 'center',
              ellipsis: true,
              dataIndex: `rela_${item.pointName}`
            },
            {
              title: '均方根误差',
              width: 100,
              align: 'center',
              ellipsis: true,
              dataIndex: `rmse_${item.pointName}`
            }
          ]
        };
        moduleColumns.push(column);
        item.dataList?.forEach((data, j) => {
          if (i === 0) {
            tableData[j]['id'] = uuid();
            tableData[j]['dateTime'] = data.dateTime;
          }
          tableData[j][`rela_${item.pointName}`] = data.relativeError;
          tableData[j][`rmse_${item.pointName}`] = data.rMSE;
        });
      });
      this.columns = moduleColumns;
      this.data = tableData;
    },
    //出水数据格式化
    getOutPointList(resultData) {
      let { xList, squareList, relativeList } = resultData;
      let dataList = [];
      for (let i = 0; i < resultData.xList.length; i++) {
        let item = {
          dateTime: xList[i],
          rMSE: squareList[i],
          relativeError: relativeList[i]
        };

        dataList.push(item);
      }
      return dataList;
    }
  }
};
</script>

<style lang="less" scoped>
/deep/.content-header {
  padding-bottom: 0px !important;
}
.content {
  width: calc(50% - 6px);
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
    margin-top: 8px;
    padding: 0 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
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
    padding: 8px 12px;
  }
  .chart-wrapper {
    height: 100%;
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
