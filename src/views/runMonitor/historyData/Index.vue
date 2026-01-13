<template>
  <div :class="['history-con', 'wbgc-seatbox', currentTab === 1 ? 'history' : '']">
    <div :class="[!isShowLeft ? 'hide-left-tree' : '']" class="left-tree wbgc-card">
      <device-tree
        ref="searchTree"
        :treeType="'device'"
        :isReturnObj="currentTab === 0 ? true : false"
        :pageSiteId.sync="pageSiteId"
        :checkedIds="checkDev"
        :checkable="currentTab === 1"
        @onTreeChecked="onSelect"
        @onCheck="onCheck"
      ></device-tree>
    </div>
    <div class="center-con" id="centerCon">
      <span
        class="supply-bg-bg-card-DEFAULT supply-text-base supply-flex supply-items-center supply-cursor-pointer toggle-icon-left"
        @click.stop="handleLeftControl"
      >
        <w-icon :type="isShowLeft ? 'ic_chevron_left_more' : 'ic_chevron_right_more'"></w-icon>
      </span>
      <span
        :class="[!isShowRight ? 'move-icon' : '']"
        class="supply-bg-bg-card-DEFAULT supply-text-base supply-flex supply-items-center supply-cursor-pointer toggle-icon-right"
        @click.stop="handleRightControl"
      >
        <w-icon :type="isShowRight ? 'ic_chevron_right_more' : 'ic_chevron_left_more'"></w-icon>
      </span>
      <div class="center-search wbgc-card">
        <div class="search-top">
          <return-control
            class="search-top__return"
            :keep="true"
            :is-drill-down="true"
          ></return-control>
          <div class="title-tab">
            <span
              v-for="(tab, i) in tabs"
              :key="i"
              :class="currentTab === i ? 'active' : ''"
              @click="changeTab(i)"
              >{{ tab }}</span
            >
          </div>
        </div>
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
          :showMark="true"
          type="multiple"
          :search-line-info="searchLineInfo"
          :allTreeData="allTreeData"
          :deviceInfo="itemData"
        >
        </chart-table>
        <div
          v-show="showServes"
          :class="[!isShowRight ? 'hide-right-tree' : '']"
          class="tree-block"
        >
          <!-- 单泵房 监测量可多选 -->
          <point-multi
            :isComposeInput="true"
            :visible.sync="visible"
            v-show="currentTab === 0"
            ref="multTree"
            :showDefault="showDefault"
            :defaultKeys="defaultKeys"
            @change="changeServices"
          ></point-multi>
          <!-- 多泵房 监测量单选 -->
          <point-single
            :showDefault="showDefault"
            :defaultKeys="defaultKeys"
            v-show="currentTab === 1"
            ref="singTree"
            @change="changeServices"
          ></point-single>
        </div>
      </div>
    </div>
    <DragModal
      ref="dragModal"
      :isDrag="false"
      :isShowFullBtn="false"
      title="监测量组合"
      :width="848"
      :mask="true"
      :height="483"
      @close="closeModal"
    >
      <indicator-center @changeList="changeList"></indicator-center>
    </DragModal>
  </div>
</template>
<script>
import chartTable from '@/components/HistoryMultiChart/chartTable.vue';
import { exportFile } from '@/utils/util';
import DragModal from '@/components/DragModal/index.vue';
import DeviceTree from '@/components/Tree/deviceTree';
import LineChart from '@/components/chart/LineChart';
import search from './search.vue';
import PointMulti from './pointMulti';
import PointSingle from './pointSingle';
import indicatorCenter from '@/views/report/indicatorCenter';
import { historyExcel, getUnitByPointNames } from '@/api/analysis';
import config from '@/config/setting.config';
import * as echarts from 'echarts';
export default {
  name: 'historyAnalyse',
  components: {
    DeviceTree,
    LineChart,
    PointMulti,
    indicatorCenter,
    DragModal,
    PointSingle,
    search,
    chartTable
  },
  data() {
    return {
      tips: '请选择设备或者监测量！',
      isShowLeft: true,
      isShowRight: true,
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
      disabledList: {
        '01': false,
        hour: false,
        '05': false,
        15: false,
        30: false,
        day: false,
        real: false
      },
      itemData: {},
      treeDataObj: null,
      showSearch: false,
      pageSiteId: '',
      chartHeight: 1,
      timeType: '1',
      showServes: true,
      tabs: ['单构筑物对比', '多构筑物对比'],
      currentTab: 0, // 当前选中tab
      selectDev: [], // 单选树设备ids
      checkDev: [], // 多选树设备ids
      multiPointIds: [], //多选监测量ids
      singlePointIds: [], //单选监测量ids
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
      allTreeData: [],
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
        if (val.backPath) {
          if (val.pumpTab) {
            this.currentTab = Number(this.$route.query.pumpTab);
          } else {
            this.currentTab = 0;
          }
        }
        if (
          this.$route.path === '/runMonitor/historyData' ||
          this.$route.path.includes('/runMonitor/historyData')
        ) {
          if (this.$route.query.pointCode) {
            this.isDrillDown = true;
            this.showDefault = false;
            // setTimeout(() => {
            this.defaultKeys = JSON.parse(this.$route.query.pointCode);
            // this.serviceIds = [this.$route.query.pointCode];
            // }, 500);
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
    handleLeftControl() {
      this.isShowLeft = !this.isShowLeft;
    },
    handleRightControl() {
      this.isShowRight = !this.isShowRight;
      this.showServes = !this.showServes;
    },
    exportExcel() {
      const params = {
        ...this.searchLineInfo,
        // crossFlag: this.toolIcon[1].icon.includes('1')
        // 这里设置为false,将crossFlag修改为false,行列转换,超过255导出excel报错
        crossFlag: false
      };
      // 导出xls格式文件
      historyExcel(params).then(res => {
        exportFile(res, '历史数据分析', 'xls');
      });
    },
    closeModal() {
      this.visible = false;
    },
    // 更新左側組合
    changeList() {
      console.log('eeee');
      this.$refs.multTree.getHistoryList();
    },
    onSearch(val) {
      this.searchLineInfo = { ...this.searchLineInfo, ...val };
      this.queryData();
    },
    // 重置查询条件
    reStart() {
      this.searchLineInfo = {
        devicePoints: [],
        deviceType: 'INDUSTRY_DEVICE', // 设备类型
        displayType: [], // 监测量类型
        dates: [
          {
            startTime: this.$moment()
              .subtract(2, 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
          }
        ],
        period: '1',
        timeEnum: 'MINUTES'
      };
      if (this.currentTab === 0) {
        this.$refs.multTree.getPointData(this.selectDev, this.itemData.parentId);
        this.serviceIds = this.$refs.multTree.checkedKeys;
      } else {
        this.checkDev = [];
        this.$refs.singTree.getPointData(this.checkDev);
        this.serviceIds = this.$refs.singTree.selectedKeys;
      }
      this.queryData();
    },
    setLoadStatus(status) {
      // this.globalLoading[status ? 'show' : 'hide']({ domId: 'centerCon' });
    },
    // 左侧树多选选中
    async onCheck(data, treeData = []) {
      if (this.isDrillDown) {
        this.isDrillDown = false;
      } else {
        this.showDefault = true;
      }
      this.treeDataObj = treeData;
      if (data.length > 10) {
        this.$message.error('您最多只能选择十个设备');
        return;
      }
      this.checkDev = data;
      if (!data.length) {
        this.allOption = [];
      }
      await this.$refs.singTree.getPointData(data);
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
    // 切换tab
    changeTab(i) {
      this.currentTab = i;
      if (this.isInitTab) {
        this.showDefault = true;
        this.isInitTab = false;
      } else {
        this.showDefault = false;
      }
      if (this.currentTab === 0) {
        this.$refs.searchTree.currentNodeKey = this.selectDev[0];
        this.defaultKeys = [...this.multiPointIds];
        if (this.$refs.multTree) {
          this.$refs.multTree.getPointData(this.selectDev, this.itemData.parentId);
          this.serviceIds = this.$refs.multTree.checkedKeys;
        }
      } else {
        this.$refs.searchTree.currentNodeKey = '';
        this.defaultKeys = [...this.singlePointIds];
        this.checkDev = Array.from(new Set(this.checkDev.concat(this.selectDev)));
        if (this.$refs.singTree) {
          this.$refs.singTree.getPointData(this.checkDev);
          this.serviceIds = this.$refs.singTree.selectedKeys;
        }
      }
    },
    // 改变监测量数据
    changeServices(data) {
      if (data.length == 0) {
        this.serviceIds = [];
        this.currentSev = [];
      } else {
        this.serviceIds = data.key.filter(item => typeof item === 'string');
        this.currentSev = data.name;
        this.allTreeData = data.treeData;
      }
      let devicePoints = [];
      getUnitByPointNames(this.serviceIds).then(res => {
        if (res.resultData) {
          this.pointUnit = res.resultData;
        }
      });

      if (this.currentTab) {
        this.singlePointIds = [...this.serviceIds];
        this.checkDev.forEach(item => {
          devicePoints.push({
            deviceId: item,
            points: this.serviceIds
          });
        });
      } else {
        this.multiPointIds = [...this.serviceIds];
        this.selectDev.forEach(item => {
          devicePoints.push({
            deviceId: item,
            points: this.serviceIds
          });
        });
      }
      if (
        (this.selectDev && this.selectDev.length === 0 && this.currentTab === 0) ||
        (this.checkDev && this.checkDev.length === 0 && this.currentTab === 1) ||
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
        (this.selectDev && this.selectDev.length === 0 && this.currentTab === 0) ||
        (this.checkDev && this.checkDev.length === 0 && this.currentTab === 1) ||
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
    margin-right: 12px;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    position: relative;
    transition: all 0.3s;
  }
  .hide-left-tree {
    width: 0 !important;
    padding: 0 !important;
    margin-right: 0px !important;
  }

  .center-con {
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;

    .toggle-icon-left {
      padding: 3px 0;
      border-radius: 2px;
      margin-left: 6px;
      box-shadow: 1px 1px 12px 1px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(2px);
      position: absolute;
      left: -8px;
      top: 50%;
      z-index: 100;
      &:hover i {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
    .toggle-icon-right {
      padding: 3px 0;
      border-radius: 2px;
      margin-left: 6px;
      box-shadow: 1px 1px 12px 1px rgba(0, 0, 0, 0.15);
      backdrop-filter: blur(2px);
      position: absolute;
      right: 272px;
      top: 50%;
      z-index: 100;
      &:hover i {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
    .move-icon {
      position: absolute;
      right: 12px !important;
      top: 50%;
    }

    .center-search {
      margin: 0 12px 12px 0px;
      background-color: var(--supply-color-bg-card-DEFAULT);
      border-radius: 4px;

      .search-top {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 46px;
        &__return {
          position: absolute;
          right: 12px;
        }
        .title-tab {
          display: flex;
          height: 46px;
          font-size: 14px;

          span {
            width: 140px;
            padding: 14px 0 2px;
            color: #999;
            text-align: center;
            border-bottom: 2px solid #d6d6d6;
            cursor: pointer;
          }

          .active {
            color: #4285f4;
            border-bottom: 2px solid #4285f4;
          }
        }

        .control-switch {
          padding-right: 12px;
          color: #666;

          span {
            margin-left: 24px;
          }
        }
      }

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
      height: calc(100% - 150px);
      margin: 0 12px 0 0;
      background-color: var(--supply-color-bg-card-DEFAULT);
      border-radius: 4px;
      position: relative;
      .multi-chart {
        /* width: calc(100% - 220px); */
        flex: 1;
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
        width: 260px;
        height: 100%;
        border-left: 1px solid #ddd;
        transition: all 0.3s;
      }
      .hide-right-tree {
        width: 0px !important;
        border-left: none !important;
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
