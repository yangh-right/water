<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-07-03 10:38:39
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <div v-if="showType === 'chart'" class="tabs-box">
      <div class="tabs">
        <div
          v-for="item in tabs"
          :key="item.pointName"
          :class="currentParams === item.pointName ? 'tab active' : 'tab'"
          @click="paramsChange(item)"
        >
          {{ item.pointName }}
        </div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div v-if="showType === 'chart'" class="chart-wrapper">
        <line-chart
          v-if="tabs.length > 0"
          :darkTheme="'light'"
          :option="inWaterOption"
          :ref="modleType"
        ></line-chart>
        <w-empty v-else class="empty"></w-empty>
      </div>
      <div v-else class="table-wrapper">
        <w-config-provider>
          <w-table
            class="tableDevice"
            ref="pointTable"
            :columns="columns"
            :data-source="data"
            :scroll="{ y: 300, x: scrollX }"
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
import { getForecastAndHistory, getPointValue } from '@/api/optimization';
import { inWaterOption, pointsData } from './data';
export default {
  name: 'ChartData',
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
    modleType: {
      type: String,
      default: ''
    },
    tabVal: {
      type: Number,
      default: 0
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      flag: true,
      loading: false,
      currentParams: '',
      scrollX: 420,
      tabs: [],
      inWaterOption: JSON.parse(JSON.stringify(inWaterOption)),
      columns: [],
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
      },
      immediate: true
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
      this.getPointData();
      this.handleTableData();
    },
    async getPointList() {
      if (!this.waterPlantId) return;
      this.loading = true;
      let startTime = this.$moment()
        .subtract(24, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      let endTime = this.$moment()
        .add(24, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      let { resultData, status } = await getForecastAndHistory(
        this.waterPlantId,
        this.modleType,
        startTime,
        endTime
      );
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.flag = true;
          this.tabs = resultData;
          this.currentParams = this.tabs[0].pointName;
          this.currentDevice = this.tabs[0];
          this.getPointData();
          this.handleTableData();
        } else {
          this.tabs = [];
          this.currentParams = '';
          this.currentDevice = {};
          this.flag = false;
        }
      }
    },
    getPointData() {
      if (Object.keys(this.currentDevice).length > 0) {
        let { subChartVO, unit } = this.currentDevice;
        if (Object.keys(subChartVO).length > 0) {
          this.inWaterOption.yAxis[0].name = unit;
          this.inWaterOption.xAxis[0].data = subChartVO.xList;
          this.inWaterOption.series[0].data = subChartVO.yList;
          this.inWaterOption.series[1].data = subChartVO.preYList;
        }
      }
    },
    handleTableData() {
      const moduleColumns = [
        {
          title: '时间',
          width: 100,
          align: 'center',
          ellipsis: true,
          dataIndex: 'date',
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
      this.tabs.forEach(item => {
        let { subChartVO, pointName, pointCode, unit } = item;
        let column = [
          {
            title: `实际值(${pointName}_${unit})`,
            width: 160,
            align: 'center',
            ellipsis: true,
            dataIndex: `real_${pointCode}`,
            customRender: (text, row) => {
              return !!text ? text : '--';
            }
          },
          {
            title: `预测值(${pointName}_${unit})`,
            width: 160,
            align: 'center',
            ellipsis: true,
            dataIndex: `pre_${pointCode}`,
            customRender: (text, row) => {
              return !!text ? text : '--';
            }
          }
        ];
        moduleColumns.push(...column);
        let { xList, yList, preYList } = subChartVO;
        xList.forEach((data, j) => {
          tableData[j]['id'] = uuid();
          tableData[j]['date'] = data;
          tableData[j][`real_${pointCode}`] = yList[j];
          tableData[j][`pre_${pointCode}`] = preYList[j];
        });
      });
      this.scrollX = 320 * this.tabs.length;
      this.columns = moduleColumns;
      this.data = tableData;
    }
  }
};
</script>

<style lang="less" scoped>
/deep/.content-header {
  padding-bottom: 0px !important;
}
.content {
  width: calc(50% - 8px);
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

  .tabs-box {
    display: flex;
    margin-top: 8px;
    margin-left: 12px;
    justify-content: flex-start;
    align-items: center;
    .tabs {
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
  }
  .ant-dropdown-link:hover {
    color: var(--supply-color-primary-DEFAULT);
    opacity: 0.7;
  }
  .spin {
    height: calc(100% - 64px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
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
