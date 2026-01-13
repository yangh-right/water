<!--
 * @Author: wangyr
 * @Date: 2024-10-17 11:17:35
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-17 18:07:34
 * @Description:
-->

<template>
  <div :class="['history-con', 'wbgc-seatbox']">
    <div class="left-tree wbgc-card">
      <device-tree
        ref="searchTree"
        :treeType="'device'"
        :isReturnObj="true"
        :pageSiteId.sync="pageSiteId"
        :checkedIds="checkDev"
        :checkable="false"
        @onTreeChecked="onSelect"
      ></device-tree>
    </div>
    <div class="center-con" id="centerCon">
      <div class="center-search wbgc-card">
        <div class="serch-down">
          <search
            @exportFile="exportExcel"
            ref="timeInterval"
            class="right-header supply-bg-bg-card-DEFAULT"
            @search="onSearch"
          >
            <w-form-model-item>
              <w-button @click="exportExcel">
                导出
              </w-button>
            </w-form-model-item>
          </search>
        </div>
      </div>
      <div class="center-body wbgc-card">
        <chart-table
          :showToolBox="true"
          @setLoadStatus="setLoadStatus"
          class="multi-chart"
          :chart-min-num="4"
          :tips="tips"
          :isCompare="true"
          type="multiple"
          :search-line-info="searchLineInfo"
        ></chart-table>
        <div v-show="showServes" class="tree-block">
          <!-- 单泵房 监测量可多选 -->
          <point-multi
            :visible.sync="visible"
            ref="multTree"
            :showDefault="showDefault"
            :defaultKeys="defaultKeys"
            @change="changeServices"
          ></point-multi>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import chartTable from '@/components/HistoryMultiChart/chartTable.vue';
import { exportFile } from '@/utils/util';
import DeviceTree from './components/comparisonTree';
import LineChart from '@/components/chart/LineChart';
import search from './historyData/search.vue';
import PointMulti from './components/pointMulti';
import { historyExcel, getUnitByPointNames } from '@/api/analysis';
import config from '@/config/setting.config';
import * as echarts from 'echarts';
export default {
  name: 'dataComparison',
  components: {
    DeviceTree,
    LineChart,
    PointMulti,
    search,
    chartTable
  },
  data() {
    return {
      tips: '请选择设备或者监测量！',
      isDrillDown: false,
      searchLineInfo: {
        devicePoints: [],
        deviceType: 'INDUSTRY_DEVICE', // 设备类型
        displayType: [], // 监测量类型
        dates: [
          {
            startTime: this.$moment()
              .subtract(1, 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
          }
        ],
        period: '1',
        timeEnum: 'MINUTES'
      },
      visible: false,
      itemData: {},
      treeDataObj: null,
      showSearch: false,
      pageSiteId: '',
      showServes: false,
      tabs: ['单构筑物对比', '多构筑物对比'],
      selectDev: [], // 单选树设备ids
      checkDev: [], // 多选树设备ids
      multiPointIds: [], //多选监测量ids
      serviceIds: [], // 监测量ids
      showDefault: true, // 单泵房默认选中监测量
      defaultKeys: [], // 路由参数
      type: 'line', // 展示类型为曲线还是表格
      loading: false,
      startTime: this.$moment().startOf('day'),
      endTime: this.$moment(),
      currentSev: [],
      scroll: { x: 0, y: 0 },
      tableData: { rows: [] },
      allOption: [],
      isInitTab: true
    };
  },
  computed: {
    myChart() {
      if (document.getElementById('myChart')) {
        return echarts.init(document.getElementById('myChart'));
      }
      return '';
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.$refs.dragModal.visible = val;
      }
    },
    '$route.query': {
      async handler(val) {
        if (
          this.$route.path === '/runMonitor/historyData' ||
          this.$route.path.includes('/runMonitor/historyData')
        ) {
          if (this.$route.query.pointCode) {
            this.isDrillDown = true;
            this.showDefault = false;
            this.defaultKeys = JSON.parse(this.$route.query.pointCode);
          } else {
            this.showDefault = true;
          }
          this.showSearch = false;
          this.pageSiteId = '';
          setTimeout(() => {
            if (val.backPath === '/mapNav') {
              let date = val.date ? this.$moment(val.date) : this.$moment();
              this.$refs.timeInterval.setDate(date);
            }
            this.pageSiteId = val.siteId || '';
            this.showSearch = true;
          }, 200);
          setTimeout(() => {
            if (val.backPath !== '/mapNav') this.queryData();
          }, 2000);
        }
      },
      deep: true,
      immediate: true
    }
  },
  async mounted() {
    setTimeout(() => {
      this.queryData();
    }, 500);
  },
  methods: {
    exportExcel() {
      const params = {
        ...this.searchLineInfo,
        // 这里设置为false,将crossFlag修改为false,行列转换,超过255导出excel报错
        crossFlag: false
      };
      // 导出xls格式文件
      historyExcel(params).then(res => {
        exportFile(res, '数据对比分析', 'xls');
      });
    },
    onSearch(val) {
      this.searchLineInfo = { ...this.searchLineInfo, ...val };
      this.queryData();
    },
    setLoadStatus(status) {
      // this.globalLoading[status ? 'show' : 'hide']({ domId: 'centerCon' });
    },
    // 左侧树选中
    async onSelect(data) {
      if (this.isDrillDown) {
        this.isDrillDown = false;
      } else {
        this.showDefault = true;
      }
      this.itemData = data.itemData;
      this.selectDev = data.selectedKeys;
      this.$refs.multTree.getPointData(this.selectDev, this.itemData.id);
    },
    // 改变监测量数据
    changeServices(data) {
      if (data.length == 0) {
        this.serviceIds = [];
        this.currentSev = [];
      } else {
        this.serviceIds = data.key.filter(item => typeof item === 'string');
        this.currentSev = data.name;
      }
      let devicePoints = [];
      getUnitByPointNames(this.serviceIds).then(res => {
        if (res.resultData) {
          this.pointUnit = res.resultData;
        }
      });

      this.multiPointIds = [...this.serviceIds];
      this.selectDev.forEach(item => {
        devicePoints.push({
          deviceId: item,
          points: this.serviceIds
        });
      });

      if (
        (this.selectDev && this.selectDev.length === 0) ||
        this.serviceIds.length === 0
      ) {
        this.tips = '请选择设备或者监测量！';
      } else {
        this.tips = '';
      }
      this.searchLineInfo = { ...this.searchLineInfo, devicePoints };
    },
    // 查询数据
    queryData() {
      if (
        (this.selectDev && this.selectDev.length === 0 ) ||
        this.serviceIds.length === 0
      ) {
        this.tips = '请选择设备或者监测量！';
      } else {
        this.tips = '';
      }

      this.searchLineInfo = {
        ...this.searchLineInfo,
        productCode: config.productCode
      };
    }
  }
};
</script>
<style scoped lang="less">
.pad {
  padding: 0 5px;
}

.flex-item {
  display: flex;
}

.history-con {
  display: flex;
  height: 100%;

  .left-tree {
    width: 220px;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-DEFAULT);
  }

  .center-con {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;

    .center-search {
      margin: 0 12px 12px;
      background-color: var(--supply-color-bg-card-DEFAULT);
      border-radius: 4px;

      .serch-down {
        padding: 8px 14px;
        border-top: 1px solid #dee2e7;
        .wpg-form-item {
          display: flex;
          margin: 0 0 2px;
          padding: 0 12px 0 0;
        }
        .wpg-form-item-label {
          margin-right: 8px;
        }
        .ant-radio-button-wrapper {
          min-width: 75px;
          text-align: center;
        }

        .time-select {
          width: 208px;
        }

        .search-item {
          display: flex;

          .active {
            color: #fff;
            background: #4285f4;
          }

          .time-tip-icon {
            height: 40px;
            margin-left: 8px;
            line-height: 40px;
            cursor: pointer;
          }

          .width-250 {
            width: 250px;
          }

          .lable {
            margin-left: 55px;
          }

          .spance {
            position: relative;
            top: 10px;
          }

          .ant-calendar-picker {
            width: 140px;
          }

          &:nth-child(2) {
            justify-content: space-between;
          }
        }
      }
    }

    .center-body {
      display: flex;
      height: calc(100% - 108px);
      margin: 0 12px;
      background-color: var(--supply-color-bg-card-DEFAULT);
      border-radius: 4px;
      .multi-chart {
        width: 100%;
      }

      .chart-block {
        overflow: auto;
      }

      .chart-block,
      .table-block {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;

        .single-chart {
          flex: 1;
          width: 100%;
        }

        .nodata-text {
          position: absolute;
          top: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 100%;
        }

        /deep/ .ant-table-content .ant-table-thead tr th {
          border-bottom-color: #e8e8e8;
        }

        /deep/ .even-row {
          background: #f9fafb !important;
        }

        /deep/.ant-table-tbody tr:nth-child(even) {
          background: transparent;
        }
      }

      .tableMin {
        height: calc(100% - 35px);
        overflow: hidden;
      }

      .tableMax {
        height: 2000px;
        overflow: auto;
      }

      .tree-block {
        width: 220px;
        height: 100%;
        border-left: 1px solid #ddd;
      }
    }
  }
}
</style>
<style lang="less">
.history .vc-tree-node__content {
  cursor: auto !important;
}

.history .vc-tree-node__label {
  cursor: auto !important;
}

.history-query-form {
  .ant-form-item {
    margin: 0 0 12px 0;
    padding: 0 12px;
  }

  .ant-form-item-control-wrapper {
    flex: 1;
  }
}

.chart {
  height: 100%;
}
</style>
