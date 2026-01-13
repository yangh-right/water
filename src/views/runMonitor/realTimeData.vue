<template>
  <div class="leakage-container">
    <div class="lt-tree">
      <!-- <search-tree
        v-if="showSearch"
        :isShowSort="true"
        ref="searchTree"
        :isReturnObj="true"
        :pageSiteId.sync="pageSiteId"
        :treeType="'device'"
        :nodeType="'pump'"
        sessionKey="deviceStatus"
        @onSelect="onSelect"
      ></search-tree> -->
      <device-tree
        :isReturnObj="true"
        :treeType="'device'"
        @onTreeChecked="onSelect"
        ref="device-tree"
      ></device-tree>
    </div>
    <div class="rg-content">
      <div class="rg-title">
        实时数据
      </div>
      <div class="table-header">
        <div class="btn-wrapper">
          <div class="fot-item">
            <div class="fot-label">监测量</div>
            <w-input
              v-model="pointName"
              style="width:224px"
              placeholder="请输入监测量/监测量名称"
              allowClear
              @change="handleSearch"
            ></w-input>
          </div>
          <div class="fot-item">
            <div class="fot-label">监测量类型</div>
            <w-select
              v-model="pointType"
              style="width:224px"
              placeholder="请选择监测量类型"
              :options="pointTypeOptions"
              allowClear
              @change="handleSearch"
            ></w-select>
          </div>
          <div class="fot-item">
            <div class="fot-label">刷新时间(s)</div>
            <w-input-number
              v-model="delayTime"
              style="width:84px"
              :min="0"
              :max="999999999"
              :precision="0"
              :step="1"
              placeholder="刷新时间(s)"
              allowClear
              @keyup.enter="setTimer"
            >
            </w-input-number>
          </div>
          <div class="fot-item">
            <div class="fot-label">停止刷新</div>
            <w-switch v-model="activeFlag" />
          </div>
        </div>
      </div>
      <div class="dev-info">
        <div class="table-warp">
          <w-table
            class="left-table"
            :columns="columns"
            :data-source="tableData"
            :pagination="false"
            :loading="loading"
            :rowKey="record => record.pointName"
            :scroll="scroll"
            :rowClassName="rowClassName"
            :customRow="clickRow"
          >
            <template slot="pointValue" slot-scope="text, record, index">
              <span
                v-if="
                  record.dataType === 'bool' &&
                    [0, 1].includes(text) && 
                    record.enumOneName != null &&
                    record.enumZeroName != null
                "
                :class="{ 'point-alarm': isAlarm(record) }"
              >
                {{ text === 0 ? record.enumZeroName : record.enumOneName }}
                <!-- <w-icon
                  :type="record.displayType === 5 ? 'warning' : 'play-circle'"
                  theme="filled"
                  :style="{
                    color:
                      text === 0 ? '#334766' : record.displayType === 5 ? '#ff0000' : '#3FD747',
                    fontSize: '14px'
                  }"
                ></w-icon> -->
              </span>
              <!-- <span v-else-if="selectDev.includes(lightDevId) && [0, 1].includes(text)">
                <w-switch
                  class="item-switch"
                  checked-children="开"
                  un-checked-children="关"
                  size="small"
                  :disabled="true"
                  :defaultChecked="record.pointBool"
                />
              </span> -->
              <span v-else :class="{ 'point-alarm': isAlarm(record) }">{{
                text == null ? '--' : text
              }}</span>
            </template>
            <template slot="action" slot-scope="action, record">
              <a href="javascript:;" class="delete-link" @click="editPoint(record)">编辑</a>
            </template>
          </w-table>
        </div>
        <div class="chart-warp">
          <div class="chart-active">
            <active-chart
              class="active-chart"
              :showToolBox="true"
              :tips="tips"
              :chartData="activePointData"
              @setLoadStatus="setLoadStatus"
            ></active-chart>
          </div>
          <div class="chart-history">
            <history-chart
              :search-line-info="deviceActiveInfo"
              :tips="tips"
              :activePoint="activePoint"
            ></history-chart>
          </div>
        </div>
      </div>
    </div>
    <!-- 编辑监测量 -->
    <edit-dialog :visible.sync="editDialogVisible" :form-data="editRow" @update="updateEditList" />
  </div>
</template>

<script>
import config from '@/config/setting.config';
import debounce from 'lodash.debounce';
import { getDeviceRealTimeData } from '@/api/analysis';

import DeviceTree from '@/components/Tree/deviceTree';
import activeChart from '@/components/DeviceChart/deviceChart.vue';
import historyChart from '@/components/DeviceChart/historyChart.vue';

let columns = [
  {
    title: '监测量名称',
    ellipsis: true,
    dataIndex: 'pointMemo',
    customRender: (val, row) => {
      return row['pointMemo'];
    }
  },
  {
    title: '当前值',
    ellipsis: true,
    dataIndex: 'pointValue',
    width: 100,
    scopedSlots: { customRender: 'pointValue' }
  },
  {
    title: '单位',
    ellipsis: true,
    width: 80,
    dataIndex: 'pointUnit'
  },
  {
    title: '更新时间',
    ellipsis: true,
    dataIndex: 'timestamp',
    width: 200
  },
  {
    title: '操作',
    width: 80,
    type: 'action',
    scopedSlots: { customRender: 'action' }
  }
];
export default {
  name: 'deviceStatus',
  components: {
    DeviceTree,
    activeChart,
    historyChart,
    EditDialog: () => import('./components/jclEditParamsDialog.vue')
  },
  data() {
    this.handleSearch = debounce(this.getDevicePoints, 500);
    return {
      showSearch: true,
      itemData: {},
      selectDev: [], // 单选树设备ids
      lightDevId: '2025022501', // 照明系统设备id
      loading: false,
      columns,
      tableData: [],
      copyTableData: [],
      activePoint: {}, // 默认监测量
      activePointData: [],
      tips: '请选择设备或者监测量！',
      activeDeviceTimer: null,
      activePonitTimer: null,
      deviceActiveInfo: {},
      editRow: null,
      editDialogVisible: false,
      pageSiteId: '',
      pointName: '',
      pointType: null,
      pointTypeOptions: [],
      delayTime: 2,
      activeFlag: false
    };
  },
  computed: {
    scroll() {
      if (this.tableData.length < 21) {
        return {};
      } else {
        return { y: 'calc( 100vh - 280px )' };
      }
    }
  },
  watch: {
    delayTime: {
      handler(val) {
        if (!this.activeFlag) {
          if (this.activeDeviceTimer) {
            clearInterval(this.activeDeviceTimer);
          }
          this.activeDeviceTimer = setInterval(() => {
            this.getTableData();
          }, val * 1000);

          if (this.activePonitTimer) {
            clearInterval(this.activePonitTimer);
            this.activePonitTimer = null;
          }
          this.activePonitTimer = setInterval(() => {
            this.getRealData(this.activePointData);
          }, val * 1000);
        }
      }
    },
    activeFlag: {
      handler(val) {
        if (val) {
          if (this.activeDeviceTimer) {
            clearInterval(this.activeDeviceTimer);
            this.activeDeviceTimer = null;
          }
          if (this.activePonitTimer) {
            clearInterval(this.activePonitTimer);
            this.activePonitTimer = null;
          }
        } else {
          // 表格监测量数据查询
          this.activeDeviceTimer = setInterval(() => {
            this.getTableData();
          }, this.delayTime * 1000);
          // 图表监测量数据查询
          this.activePonitTimer = setInterval(() => {
            this.getRealData(this.activePointData);
          }, this.delayTime * 1000);
        }
      }
    }
  },
  methods: {
    async onSelect(data) {
      // 重置当前数据图表
      this.pointName = '';
      this.pointType = null;
      this.pointTypeOptions = [];
      if (this.activePonitTimer) {
        clearInterval(this.activePonitTimer);
        this.activePonitTimer = null;
      }

      this.itemData = data.itemData;
      this.selectDev = data.selectedKeys;

      this.getTableData();
      // 每隔2s获取一次设备监测量;
      if (!this.activeFlag) {
        if (this.activeDeviceTimer) {
          clearInterval(this.activeDeviceTimer);
        }
        this.activeDeviceTimer = setInterval(() => {
          this.getTableData();
        }, this.delayTime * 1000);
      }
    },
    editPoint(record) {
      this.editRow = record;
      this.editDialogVisible = true;
    },
    updateEditList(values) {
      this.editRow = null;
      this.editDialogVisible = false;
    },
    isAlarm(record) {
      const pv =
        record?.pointValue || typeof record?.pointValue === 'number' ? record.pointValue : '--';
      const max =
        record?.maxValue || typeof record?.maxValue === 'number' ? record.maxValue : undefined;
      const min =
        record?.minValue || typeof record?.minValue === 'number' ? record.minValue : undefined;
      return (
        pv !== '--' &&
        (Number(pv) > Number(max) || Number(pv) < Number(min)) &&
        record.dataType !== 'bool'
      );
    },
    // 获取设备监测量数据
    async getTableData() {
      let params = {
        devicePoints: [
          {
            deviceId: this.selectDev.join(','),
            points: []
          }
        ],
        deviceType: 'INDUSTRY_DEVICE',
        productCode: config.productCode
      };

      let res = await getDeviceRealTimeData(params);
      if (res.status === 'complete') {
        if (this.pointTypeOptions.length == 0) {
          this.pointTypeOptions = Array.from(
            res.resultData.reduce((map, item) => 
              map.set(item.pointType, { label: item.pointType, value: item.pointType }), 
            new Map()).values()
          );
          console.log(this.pointTypeOptions);
        }
        this.copyTableData = res.resultData.map(item => {
          return {
            ...item,
            pointBool: item.pointValue == '1' ? true : false
          };
        });
        if (this.copyTableData.length <= 0) {
          this.tips = '请选择设备或者监测量！';
        }
        this.getDevicePoints();
        if (!this.activePonitTimer && this.copyTableData.length > 0) {
          this.activePoint = this.copyTableData[0];
          this.changePoint();
        }
      }
    },
    getDevicePoints() {
      let val = this.pointName.trim();
      let tmpTableData = [];
      if (!!val) {
        tmpTableData = this.copyTableData.filter(item => {
          return (item['pointMemo'] + item['pointName']).indexOf(val) > -1;
        });
      } else {
        tmpTableData = this.copyTableData;
      }
      if (this.pointType) {
        this.tableData = tmpTableData.filter(item => {
          return item.pointType === this.pointType;
        });
      } else {
        this.tableData = tmpTableData;
      }
    },
    clickRow(record) {
      return {
        on: {
          click: () => {
            this.activePoint = record;
            this.changePoint();
          }
        }
      };
    },
    rowClassName(record, index) {
      return record.pointName === this.activePoint.pointName ? 'blue' : '';
    },
    changePoint() {
      this.activePointData = [];
      this.getRealData(this.activePointData);
      if (!this.activeFlag) {
        if (this.activePonitTimer) {
          clearInterval(this.activePonitTimer);
        }
        this.activePonitTimer = setInterval(() => {
          this.getRealData(this.activePointData);
        }, this.delayTime * 1000);
      }
    },
    async getRealData(arr) {
      let params = {
        deviceType: 'INDUSTRY_DEVICE', // 设备类型
        dates: [
          {
            startTime: this.$moment()
              .subtract(this.delayTime, 'seconds')
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss')
          }
        ],
        period: '1',
        productCode: config.productCode,
        devicePoints: [
          {
            deviceId: this.activePoint.deviceId,
            points: [this.activePoint.pointName]
          }
        ]
      };
      let res = await getDeviceRealTimeData(params);
      if (res.status === 'complete') {
        if (Array.isArray(res.resultData) && res.resultData.length > 0) {
          this.tips = '';
          arr.push(res.resultData[0]);
        }
      }
    },
    setLoadStatus(status) {
      this.globalLoading[status ? 'show' : 'hide']({ domId: 'centerCon' });
    }
  },
  mounted() {},
  deactivated() {
    // console.log('kkkk')
    // 清除定时器
    // if (this.activeDeviceTimer) {
    //   clearInterval(this.activeDeviceTimer);
    // }
    // if (this.activePonitTimer) {
    //   clearInterval(this.activePonitTimer);
    // }
  },
  beforeDestroy() {
    // 清除定时器
    if (this.activeDeviceTimer) {
      clearInterval(this.activeDeviceTimer);
    }
    if (this.activePonitTimer) {
      clearInterval(this.activePonitTimer);
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/switch.less';
.leakage-container {
  display: flex;
  height: 100%;

  .lt-tree {
    width: 220px;
    height: 100%;
    padding: 12px;
    box-sizing: border-box;
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-DEFAULT);
  }
  .rg-content {
    padding-left: 12px;
    border-radius: 4px;
    position: relative;
    flex: 1;
    height: 100%;
    overflow: hidden;

    .rg-title {
      color: var(--supply-color-primary-DEFAULT);
      padding: 6px 10px;
      font-size: 20px;
      font-weight: 400;
    }

    .table-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 6px 12px;
      background: var(--supply-color-bg-card-DEFAULT);
      margin-bottom: 12px;
      border-radius: 4px;

      .btn-wrapper {
        display: flex;
        justify-content: flex-end;

        .fot-item {
          display: flex;
          justify-content: flex-start;
          align-items: center;
          margin-right: 28px;

          .fot-label {
            margin-right: 6px;
          }
        }
      }
    }

    .dev-info {
      width: 100%;
      height: calc(100% - 92px);
      display: flex;
      justify-content: space-between;
      flex-direction: row;
    }
    .table-warp {
      width: calc(50% - 6px);
      border-radius: 4px;
      background: var(--supply-color-bg-card-DEFAULT);
      @-webkit-keyframes point_alarm {
        0% {
          color: #ff0000;
        }
        100% {
          color: rgba(255, 0, 0, 0.3);
        }
      }
      @keyframes point_alarm {
        0% {
          color: #ff0000;
        }
        100% {
          color: rgba(255, 0, 0, 0.3);
        }
      }
      .point-alarm {
        -webkit-animation: point_alarm 1s ease-in infinite;
        animation: point_alarm 1s ease-in infinite;
      }
      /deep/.wpg-table-tbody .blue {
        background-color: var(--supply-color-bg-DEFAULT) !important;
      }
      /deep/.wpg-table-placeholder {
        padding: 25% 16px !important;
      }
    }
    .chart-warp {
      width: calc(50% - 6px);
      height: 100%;
      display: flex;
      justify-content: space-between;
      flex-direction: column;

      .chart-active {
        width: 100%;
        height: calc(50% - 6px);
        padding-top: 10px;
        border-radius: 4px;
        background: var(--supply-color-bg-card-DEFAULT);
      }
      .chart-history {
        width: 100%;
        height: calc(50% - 6px);
        border-radius: 4px;
        background: var(--supply-color-bg-card-DEFAULT);
      }
    }

    .report-table-con {
      position: relative;
      padding: 0 20px;
      min-height: 160px;
      .spin-wrapper {
        position: absolute;
        height: 100%;
        width: calc(100% - 40px);
        max-height: 400px;
        .spin {
          z-index: 23;
          position: absolute;
          left: 50%;
          top: 50%;
          transform: translate(-50%, -50%);
        }
      }
      .curpor {
        cursor: pointer;
      }
      /deep/ .ant-table-wrapper {
        .ant-table-header th {
          vertical-align: middle;
          border-bottom: 1px solid #e8e8e8;
        }
        .ant-table-body {
          margin: 0;
          .ant-table-thead {
            background: transparent !important;
          }
        }
        .ant-table-tbody {
          > tr:nth-child(even) {
            background: transparent;
          }
          > tr.ant-table-row:hover,
          > tr.ant-table-row,
          > tr.ant-table-row-hover {
            background: transparent !important;
            &:hover > td,
            td {
              background: transparent !important;
              border-bottom: 1px solid #d6d6d6;
            }
          }
        }
      }
      .pagination {
        width: 100%;
        text-align: right;
        padding: 12px;
      }
    }
    /deep/ .item-switch {
      .wpg-switch-inner {
        color: #ffffff;
      }
    }
  }
}
</style>
