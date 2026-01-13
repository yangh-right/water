<!--
 * @Description:报警中心
 * @Author: limz
 * @Date: 2021-08-04 11:25:05
 * @LastEditTime: 2025-02-17 10:26:40
 * @LastEditors: wangyr
-->

<template>
  <div class="alarm-center">
    <table-search>
      <w-form-model slot="form" layout="inline" ref="form" :model="form">
        <w-row :gutter="8" type="flex">
          <w-col v-bind="grid">
            <w-form-model-item
              :label="`选择${textReplace}`"
              prop="pumpIds"
              :wrapperCol="{ flex: 1 }"
            >
              <w-tree-select
                v-model="form.stationIds"
                :tree-data="treeData"
                :dropdown-style="{ 'max-height': '500px', 'max-width': '220px' }"
                tree-checkable
                :max-tag-count="1"
                :treeDefaultExpandedKeys="['allCheck']"
                :filterTreeNode="searchFilterTreeNode"
              />
            </w-form-model-item>
          </w-col>

          <w-col v-bind="grid">
            <w-form-model-item label="报警类型" prop="alarmTypeCode" :wrapperCol="{ flex: 1 }">
              <w-select v-model="form.alarmTypeCode">
                <w-select-option value="">全部</w-select-option>
                <w-select-option v-for="item in alarmTypeList" :key="item.code" :value="item.code">
                  {{ item.name }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <template v-if="collapse">
            <w-col v-bind="grid">
              <w-form-model-item label="报警等级" prop="alarmLevels">
                <w-select v-model="form.alarmLevels" mode="multiple">
                  <w-select-option value="1">一级</w-select-option>
                  <w-select-option value="2">二级</w-select-option>
                  <w-select-option value="3">三级</w-select-option>
                  <w-select-option value="4">四级</w-select-option>
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col v-bind="grid">
              <w-form-model-item label="报警处理" prop="confirmStatus">
                <w-select v-model="form.confirmStatus">
                  <!-- -1 延迟中， 1已确认  0 未确认 -->
                  <w-select-option value="">全部</w-select-option>
                  <w-select-option :value="-1">延迟中</w-select-option>
                  <w-select-option :value="1">已确认</w-select-option>
                  <w-select-option :value="0">未确认</w-select-option>
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col v-bind="grid">
              <w-form-model-item label="报警时间" prop="date">
                <w-range-picker
                  v-model="form.date"
                  :allowClear="false"
                  :disabled-date="disabledDate"
                  class="supply-w-full"
                />
              </w-form-model-item>
            </w-col>
            <w-col v-bind="grid">
              <w-form-model-item label="模糊查询" prop="keyWord">
                <w-input
                  v-model="form.keyWord"
                  :placeholder="`${textReplace}名称/报警名称`"
                  :maxLength="50"
                  allowClear
                  @keyup.enter="refresh"
                />
              </w-form-model-item>
            </w-col>
          </template>
          <w-col class="supply-ml-auto">
            <w-form-model-item>
              <w-button class="supply-mr-3" type="primary" icon="upload" @click="download">
                导出
              </w-button>
              <w-button class="supply-mr-3" @click="reset" icon="reload">
                重置
              </w-button>
              <w-button class="supply-mr-3" type="primary" @click="refresh" icon="search">
                查询
              </w-button>
              <a class="supply-mr-3" @click="collapse = !collapse">
                <template v-if="!collapse">
                  展开
                  <w-icon type="down" />
                </template>
                <template v-else>
                  收起
                  <w-icon type="up" />
                </template>
              </a>
              <return-control :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>

      <div class="alarm-con">
        <div class="table-wrapper">
          <STable
            v-if="columns.length"
            ref="table"
            :columns="columns"
            :rowKey="record => record.alarmHandlerDataId"
            :data="loadData"
            :scroll="scroll"
            class="supply-bg-bg-card-component"
            :options="{ reload: false, setting: true, export: false }"
          >
            <div slot="endTime" slot-scope="text">
              {{ text || '正在报警中' }}
            </div>
            <div
              slot="pumpName"
              slot-scope="text, record"
              class="supply-text-primary alarm-name"
              :title="text"
              @click="toPumpDetail(record.pumpId)"
            >
              {{ text }}
            </div>
            <div
              slot="alarmName"
              slot-scope="text, record"
              class="supply-text-primary alarm-name"
              :title="text"
              @click="showAlarmDetail(record)"
            >
              {{ text }}
            </div>
            <div slot="action" slot-scope="text, record" class="actions">
              <span
                v-if="record.confirmStatus === 1"
                style="cursor: pointer;"
                class="supply-text-third item1 supply-float-left"
                @click="confirmBrowse(record)"
                >已确认</span
              >
              <a v-else class="item1 supply-float-left" @click="confirmEdit(record)">
                确认
              </a>
              <w-divider class="supply-float-left" type="vertical" />
              <template v-if="record.confirmStatus !== 1">
                <span
                  v-if="record.confirmStatus === -1"
                  class="supply-text-third item2 supply-float-left"
                  >延迟中</span
                >
                <delay-alarm v-else :alarmId="record.alarmHandlerDataId" @change="refresh">
                  <a class="item2 supply-float-left">延迟处理</a>
                </delay-alarm>
                <w-divider type="vertical" />
              </template>
              <a v-if="!record.ticketId" class="item3 supply-float-right" @click="handleAdd(record)"
                >派单</a
              >
              <a v-else class="item3 supply-float-right" @click="ticketDetails(record)">工单详情</a>
            </div>
          </STable>
        </div>
        <div
          class="hide-btn supply-text-third supply-bg-bg-card-component hover:supply-text-primary-hover supply-flex supply-items-center supply-justify-center"
          :style="{ right: showChart ? '338px' : '0' }"
          @click="hideChart"
        >
          <w-icon :type="`ic_chevron_${showChart ? 'right' : 'left'}_more`" />
        </div>
        <div class="chart-wrapper" :class="{ hide: !showChart }">
          <w-row class="alarm-num supply-bg-bg-card-DEFAULT">
            <w-col
              v-for="t in alarmTypeNum"
              :key="t.key"
              :span="8"
              @click="handleSearch(t)"
              class="alarm-classify"
            >
              <div
                class="num supply-text-xl"
                :style="{ color: t.key === 'totalNum' ? 'var(--supply-color-main)' : t.color }"
              >
                {{ t.value }}
              </div>
              <div class="label supply-text-third supply-text-xs">{{ t.title }}</div>
            </w-col>
          </w-row>
          <div class="org-alarm supply-bg-bg-card-DEFAULT">
            <w-tabs v-model="activeTab_bar" size="small">
              <w-tab-pane key="1" tab="各组织报警情况">
                <div class="chart">
                  <BarChart v-if="activeTab_bar === '1'" :option="orgBarOption"> </BarChart>
                </div>
              </w-tab-pane>
              <w-tab-pane key="2" :tab="`各${textReplace}报警排名`">
                <BarChart v-if="activeTab_bar === '2'" :option="pumpBarOption"></BarChart>
              </w-tab-pane>
            </w-tabs>
          </div>
          <div class="pump-alarm supply-bg-bg-card-DEFAULT">
            <w-tabs v-model="activeTab_pie" size="small">
              <w-tab-pane key="1" tab="各报警类型占比">
                <div class="chart">
                  <PieChart
                    v-if="activeTab_pie === '1' && pumpPieOption && pumpPieOption.title.text"
                    :defaultHighlight="false"
                    :option="pumpPieOption"
                  ></PieChart>
                </div>
                <w-empty :id="'vcEmpty1'" size="small" />
              </w-tab-pane>
              <w-tab-pane key="2" tab="各报警等级占比">
                <div class="chart">
                  <PieChart
                    v-if="activeTab_pie === '2' && orgPieOption && orgPieOption.title.text"
                    :defaultHighlight="false"
                    :option="orgPieOption"
                  ></PieChart>
                </div>
                <w-empty :id="'vcEmpty2'" size="small" />
              </w-tab-pane>
            </w-tabs>
          </div>
        </div>
      </div>
    </table-search>
    <ticket-dialog
      ref="ticketDialog"
      :templateType="'purificationInspect'"
      :templateData="templateData"
    />
    <!-- 确认弹窗 -->
    <Ticket-confirm ref="ticketConfirm" :rowData="rowData" @refresh="refresh"></Ticket-confirm>
    <!-- 已确认弹窗 -->
    <Ticket-not-confirmed ref="TicketNotConfirmed" :rowData="rowData"></Ticket-not-confirmed>
    <!-- 报警详情 -->
    <drag-modal ref="alarmDetail" :width="1140" :mask="true" title="报警详情">
      <alarm-detail :detailData="detailData"></alarm-detail>
    </drag-modal>
    <!-- 报警详情 -->
    <drag-modal ref="previseDetail" :width="1140" :mask="true" title="报警详情">
      <previse-detail :detailData="detailData"></previse-detail>
    </drag-modal>
  </div>
</template>

<script>
import RegionOrOrgSelect from '@/components/SelectRegionOrOrg';
import moment from 'moment';
import { ORG_BAR_OPTION, PUMP_BAR_OPTION, GET_ORG_PIE_OPTION, GET_PUMP_PIE_OPTION } from './alarm';
import { queryOrgPumpHouseTree } from '@/api/manage';
import BarChart from '@/components/chart/BarChart.vue';
import TicketDialog from '@/components/TicketDialog/index';
import TicketConfirm from '@/components/TicketConfirm/index';
import TicketNotConfirmed from '@/components/TicketNotConfirmed/index';
import PieChart from '@/components/chart/PieChart.vue';
import alarmDetail from '@/components/common/alarmDetail.vue';
import previseDetail from '@/components/common/previseDetail.vue';
import DragModal from '@/components/DragModal';
import {
  alarmHandlerData, // 报警分页
  GetCommonAlarmLevelInfo, // 报警等级饼图
  AlarmNameCount, // 报警类型数
  AlarmCommonIdCount, //污水厂/组织获取报警数
  alarmConfirm, // 确认报警
  ExportAlarmExcel, // 导出
  GetAlarmTypeList
} from '@/api/diagnosis';
import { exportFile } from '@/utils/util';
import DelayAlarm from './DelayAlarm/index.vue';
import { mapState } from 'vuex';

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 60,
    fixed: 'left',
    align: 'center',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '污水厂名称',
    dataIndex: 'pumpName',
    fixed: 'left',
    width: 100,
    ellipsis: true,
    scopedSlots: { customRender: 'pumpName' }
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    ellipsis: true
  },
  // {
  //   title: '所属组织',
  //   dataIndex: 'orgName',
  //   ellipsis: true
  // },
  {
    title: '报警类型',
    dataIndex: 'alarmTypeName',
    ellipsis: true
  },
  {
    title: '报警名称',
    dataIndex: 'alarmName',
    ellipsis: true,
    scopedSlots: { customRender: 'alarmName' }
  },
  {
    title: '报警状态',
    dataIndex: 'alarmStatusStr', // [1处于报警状态,0结束报警]
    ellipsis: true
  },
  {
    title: '报警时长',
    dataIndex: 'lastTime',
    width: 100,
    ellipsis: true
  },
  {
    title: '报警等级',
    width: 100,
    dataIndex: 'alarmLevelStr',
    ellipsis: true
  },
  {
    title: '开始时间',
    dataIndex: 'startTime',
    ellipsis: true
  },
  {
    title: '结束时间',
    dataIndex: 'endTime',
    ellipsis: true,
    scopedSlots: { customRender: 'endTime' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 180,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
];
const ColorMap = {
  dark: { nameColor: '#868E96', valueColor: '#FFF' },
  default: { nameColor: '#999', valueColor: '#333' }
};
export default {
  name: 'AlarmCenter',
  components: {
    RegionOrOrgSelect,
    BarChart,
    PieChart,
    TicketDialog,
    alarmDetail,
    previseDetail,
    DragModal,
    DelayAlarm,
    TicketConfirm,
    TicketNotConfirmed
  },
  inject: ['state', 'linkToOther'],
  data() {
    return {
      form: {
        confirmStatus: '',
        orgIds: [],
        alarmTypeCode: '',
        status: 0,
        alarmLevels: ['1', '2', '3', '4'],
        date: [moment().subtract(1, 'month'), moment()],
        keyWord: '',
        stationIds: []
      },
      grid: {
        xl: 8,
        lg: 6,
        md: 12,
        sm: 24,
        xs: 24
      },

      moreGrid: {
        xl: 8,
        lg: 6,
        md: 12,
        sm: 24,
        xs: 24
      },

      collapse: false,
      dataKeys: {
        total: 'total',
        records: 'records',
        current: 'current'
      },
      params: {},
      alarmTypeNum: [
        {
          title: '报警总数',
          key: 'totalNum',
          value: '0',
          color: '#323333'
        },
        {
          title: '报警中',
          key: 'underway',
          value: '0',
          color: '#FFBF00'
        },
        {
          title: '已结束',
          key: 'finished',
          value: '0',
          color: '#969999'
        }
      ],
      tabsValue: 'all',
      orgBarOption: null,
      orgPieOption: null,
      pumpPieOption: null,
      pumpBarOption: null,
      activeTab_pie: '1',
      activeTab_bar: '1',
      visible: false,
      templateData: null,
      colors: ['#F15C6E', '#F47A00', '#F8B500', '#8C6CFF'],
      detailData: {},
      showChart: true,
      orgList: [],
      alarmTypeList: [],
      scroll: {
        x: columns.length * 120
        // y: 'calc(100vh - 275px)'
      },
      type: 'wpg',
      treeData: [],
      rowData: null
    };
  },
  computed: {
    ...mapState('configure', ['textReplace']),
    columns() {
      return columns.map(item => {
        if (item.title.includes('泵站')) {
          item.title = item.title.replace('泵站', this.textReplace);
        }
        return item;
      });
    }
  },
  watch: {
    collapse(val) {
      this.$refs.table.calcTableHeight();
    },
    'state.theme': {
      handler(newValue) {
        let theme = newValue === 'dark' ? 'dark' : 'default';
        if (this.pumpPieOption) {
          this.pumpPieOption.title.textStyle.rich.value.color = ColorMap[theme].valueColor;
          this.pumpPieOption.title.textStyle.rich.name.color = ColorMap[theme].nameColor;
        }
        if (this.orgPieOption) {
          this.orgPieOption.title.textStyle.rich.value.color = ColorMap[theme].valueColor;
          this.orgPieOption.title.textStyle.rich.name.color = ColorMap[theme].nameColor;
        }
      }
    }
  },
  mounted() {
    // 接收url query参数
    // 参数处理顺序,sessionStorageId >> query >> type 由后向前覆盖

    let {
      sessionStorageId,
      confirmStatus,
      alarmTypeCode,
      status,
      date,
      keyword,
      stationIds,
      alarmLevels,
      siteId
    } = this.$route.query;
    // 处理sessionStorageId
    if (sessionStorageId) {
      let param = JSON.parse(sessionStorage.getItem(sessionStorageId) || '{}');
      this.form = {
        ...this.form,
        ...param
      };
    }
    // 处理 query可能带的参数
    // 兼容处理query数组传参数可能被转成“,”分割的问题
    if (stationIds) {
      if (stationIds instanceof String) {
        stationIds = stationIds.split(',');
      }
      this.form.stationIds = stationIds;
    }
    if (date) {
      if (date instanceof String) {
        date = date.split(',');
      }
      this.form.date = [this.$moment(date[0]), this.$moment(date[1])];
    }
    if (alarmLevels) {
      if (alarmLevels instanceof String) {
        alarmLevels = alarmLevels.split(',');
      }
      this.form.alarmLevels = alarmLevels;
    }
    if (confirmStatus) {
      this.form.confirmStatus = confirmStatus;
    }
    if (alarmTypeCode) {
      this.form.alarmTypeCode = alarmTypeCode;
    }
    if (status) {
      this.form.status = status;
    }
    if (keyword) {
      this.form.keyword = keyword;
    }
    if (siteId) {
      this.form.stationIds = [siteId];
    }

    this.getAlarmTypes();
    this.getOrgPumpTree();
    // this.refresh();
  },
  activated() {
    // this.alarmCenterParams = JSON.parse(sessionStorage.getItem('alarmCenterParams'));
    // sessionStorage.removeItem('alarmCenterParams');
    // if (this.alarmCenterParams) {
    // this.reset();
    // }
    // this.reset();
  },
  methods: {
    init() {
      this.getAlarmTypeNum();
      this.getOrgAlarmNum();
      this.getPumpAlarmNum();
      this.getAlarmLevelNum();
    },

    hideChart() {
      this.showChart = !this.showChart;
    },

    reset() {
      this.$refs.form.resetFields();
      this.form = {
        confirmStatus: '',
        orgIds: [],
        alarmTypeCode: '',
        status: 0,
        alarmLevels: ['1', '2', '3', '4'],
        date: [moment().subtract(1, 'month'), moment()],
        keyWord: '',
        stationIds: ['allCheck', ...this.allpIds]
      };
      // this.$refs.regionOrOrg.refresh(); // 区域组织选择重置
      this.refresh();
    },

    /* 报警详情弹框 */
    showAlarmDetail(record) {
      this.detailData = {
        alarmId: record.alarmHandlerDataId,
        typeCode: record.alarmType,
        ticketId: record.ticketId,
        deviceId: record.deviceId,
        startTime: record.startTime,
        record: JSON.stringify(record)
      };
      if (record.alarmTypeName === '预警类型') {
        this.$refs.previseDetail.visible = true;
      } else {
        this.$refs.alarmDetail.visible = true;
      }
    },

    /* 跳转工单详情 */
    ticketDetails(record) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: record.ticketId
        }
      });
    },

    refresh(bool = true) {
      let sTime = this.form.date[0]
        ? this.$moment(this.form.date[0]).format('YYYY-MM-DD') + ' 00:00:00'
        : '';
      let eTime = this.form.date[1]
        ? this.$moment(this.form.date[1]).format('YYYY-MM-DD') + ' 23:59:59'
        : '';
      eTime =
        eTime > this.$moment().format('YYYY-MM-DD HH:mm:ss')
          ? this.$moment().format('YYYY-MM-DD HH:mm:ss')
          : eTime;
      if (this.alarmCenterParams) {
        let { type, pumpName, startTime, endTime } = this.alarmCenterParams;
        if (type) this.form.status = String(type);
        this.form.keyWord = pumpName || '';
        if (startTime) {
          sTime = startTime;
          eTime = endTime;
        }
        this.form.date = startTime
          ? [moment(sTime), moment(eTime)]
          : [moment().subtract(1, 'month'), moment()];
      }
      this.alarmCenterParams = null;
      this.params = {
        ...this.form,
        startTime: sTime,
        endTime: eTime
      };
      delete this.params.date;
      if (this.$refs.table) this.$refs.table.refresh(bool);
      this.init();
    },
    handleSearch(parameter) {
      if (parameter.key === 'underway') {
        this.form.status = '1';
        this.refresh();
      }
    },
    /* 导出 */
    download() {
      ExportAlarmExcel(this.params).then(res => {
        exportFile(res, '报警列表');
      });
    },

    /** 报警类型 */
    async getAlarmTypes() {
      let { status, resultData } = await GetAlarmTypeList();
      this.alarmTypeList = status === 'complete' ? resultData : [];
    },

    async loadData(parameter) {
      if (!this.canLoad) {
        return;
      }
      this.params = {
        ...this.params,
        currentPage: parameter.pageNo,
        pageSize: parameter.pageSize
      };
      return await alarmHandlerData(this.params).then(res => {
        let arr = ['一', '二', '三', '四'];
        let records =
          res.resultData.records.map(r => {
            return {
              ...r,
              alarmStatusStr: r.alarmStatus === 0 ? '已结束' : '报警中',
              alarmLevelStr: `${arr[r.alarmLevel - 1]}级`
            };
          }) || [];
        return {
          total: res.resultData.total,
          records: records,
          current: res.resultData.current
        };
      });
    },

    handleOrgChange(value) {
      this.form.orgIds = value.filter(v => v !== 'allCheck');
    },

    /* 禁止选择日期 */
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    },

    /* 报警各等级数 */
    getAlarmLevelNum() {
      let params = {
        ...this.params,
        alarmSortType: 'org'
      };
      // this.orgPieOption = { ...ORG_PIE_OPTION };
      this.orgPieOption = { ...GET_ORG_PIE_OPTION(this.state.theme) };
      // this.orgPieOption.title.textStyle.rich.value.color = ColorMap[this.state.theme].valueColor;
      // this.orgPieOption.title.textStyle.rich.name.color = ColorMap[this.state.theme].nameColor;
      GetCommonAlarmLevelInfo(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          if (resultData.length > 0) {
            let total = 0;
            let sData = resultData.map(r => {
              total += Number(r.count);
              return {
                value: r.count,
                name: r.name,
                itemStyle: {
                  color: this.colors[r.level - 1]
                }
              };
            });
            this.orgPieOption.title.text = ['{value|' + total + '}', '{name|总数}'].join('\n');
            this.orgPieOption.series[0].data = sData;
          } else {
            this.orgPieOption.title.text = '';
          }
        }
      });
    },

    /* 报警各类型数 */
    getAlarmTypeNum() {
      let params = {
        ...this.params,
        alarmSortType: 'org'
      };
      // this.pumpPieOption = { ...PUMP_PIE_OPTION };
      this.pumpPieOption = { ...GET_PUMP_PIE_OPTION(this.state.theme) };

      AlarmNameCount(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          if (resultData.length > 0) {
            let total = 0;
            let sData = resultData.map(r => {
              total += Number(r.count);
              return {
                value: r.count,
                name: r.name
              };
            });
            this.pumpPieOption.title.text = ['{value|' + total + '}', '{name|总数}'].join('\n');
            this.pumpPieOption.series[0].data = sData;
          } else {
            this.pumpPieOption.title.text = '';
          }
        }
      });
    },

    /* 污水厂报警数 */
    getPumpAlarmNum() {
      let params = {
        ...this.params,
        alarmSortType: 'station'
      };
      this.pumpBarOption = { ...PUMP_BAR_OPTION };
      AlarmCommonIdCount(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          let yData = [];
          let sData = [];
          resultData.forEach(r => {
            yData.push(r.name);
            sData.push(r.count);
          });
          this.pumpBarOption.yAxis[0].data = yData;
          this.pumpBarOption.series[0].data = sData;
        }
      });
    },

    /* 组织报警数 */
    async getOrgAlarmNum() {
      // 0已结束 1报警中
      let params0 = {
        ...this.params,
        status: 1,
        alarmSortType: 'org'
      };
      let params1 = {
        ...params0,
        status: 0
      };
      this.orgBarOption = { ...ORG_BAR_OPTION };
      let yData = [];
      let sData0 = [];
      let sData1 = [];
      let num = 0;
      let aNum = 0;
      await Promise.all([AlarmCommonIdCount(params0), AlarmCommonIdCount(params1)]).then(res => {
        let data0 = res[0];
        let data1 = res[1];
        if (data0.status === 'complete') {
          data0.resultData.forEach(r => {
            if (!yData.find(d => d.text === r.name)) {
              yData.push({ text: r.name, value: r.id });
            }
            sData0.push(r.count);
            num += Number(r.count);
            data1.resultData.forEach(r1 => {
              if (r.id === r1.id) {
                sData1.push(r1.count);
                aNum += Number(r1.count);
              }
            });
          });
        }
        if (data1.status === 'complete') {
          data1.resultData.forEach(r => {
            if (!yData.find(d => d.text === r.name)) {
              yData.push({ text: r.name, value: r.id });
              sData1.push(r.count);
              aNum += Number(r.count);
            }
          });
        }
        this.alarmTypeNum[2].value = aNum;
        this.alarmTypeNum[1].value = num;
        this.alarmTypeNum[0].value = aNum + num;
        this.orgList = yData;
        this.orgBarOption.yAxis[0].data = yData.map(d => d.text);
        this.orgBarOption.series[1].data = sData1;
        this.orgBarOption.series[0].data = sData0;
      });
    },
    /* 确认弹窗 */
    confirmEdit(data) {
      this.$refs.ticketConfirm.visible = true;
      this.rowData = data;
    },
    /* 已确认弹窗 */
    confirmBrowse(data) {
      this.$refs.TicketNotConfirmed.visible = true;
      this.rowData = data;
    },

    /* 创建工单 */
    handleAdd(record) {
      let { alarmHandlerDataId, addr, deviceId, orgId, alarmName, pumpId, solutionId } = record;
      this.templateData = {
        id: alarmHandlerDataId,
        orgIds: orgId,
        deviceIds: deviceId,
        pumpId,
        solutionId,
        content: alarmName,
        ticketAddress: {
          address: addr || '',
          point: {}
        },
        type: 0,
        workSource: 'homeCall'
      };
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    },

    /** 跳转到污水厂详情 */
    toPumpDetail(pumpId) {
      this.drillDown({
        path: '/runMonitor/pumpDetail',
        query: {
          pumpId
        }
      });
    },

    /* 多选搜索过滤 */
    searchFilterTreeNode(inputValue, treeNode) {
      return (
        treeNode.componentOptions.propsData.title.toLowerCase().indexOf(inputValue.toLowerCase()) >=
        0
      );
    },
    /** 组织污水厂树 */
    getOrgPumpTree() {
      queryOrgPumpHouseTree({ keyword: '' }).then(res => {
        let ids = [];
        this.treeData = [
          {
            value: 'allCheck',
            key: 'allCheck',
            title: '全选',
            children: this.handleData(res.resultData, ids)
          }
        ];
        this.allpIds = ids;
        if (this.form.stationIds.length <= 0) {
          this.form.stationIds = ['allCheck', ...this.allpIds];
        }
        // 是否可加载数据
        this.canLoad = true;
        this.refresh();
      });
    },
    /** 处理数据 */
    handleData(data, ids = []) {
      if (data.length <= 0) return [];
      return data.map(item => {
        let {
          children,
          name,
          id,
          data: { stationFlag }
        } = item;
        if (stationFlag) ids.push(id);
        return {
          children: children.length > 0 ? this.handleData(children, ids) : [],
          title: name,
          key: id,
          value: id
        };
      });
    }
  },

  // 清除keep-live 缓存
  beforeRouteLeave(to, from, next) {
    this.$destroy();
    next();
  }
};
</script>

<style scoped lang="less">
.alarm-center {
  width: 100%;
  height: 100%;
  .chart {
    height: 100%;
  }
  .supply-text-right {
    text-align: right;
  }
  /deep/ .table-page-search-wrapper {
    padding-top: 8px !important;
    padding-bottom: 8px !important;
    .form-region-select {
      margin: 0;
      .wpg-form-item-children {
        display: flex;
        width: 100%;
        .region-org-tree-container {
          flex: 1;
          min-width: 200px !important;
          .wpg-select,
          .wpg-select-selection {
            width: 100% !important;
          }
        }
      }
    }
  }
  .alarm-con {
    display: flex;
    height: 100%;
    position: relative;
    > .table-wrapper {
      flex: 1;
      min-width: 1px;
      position: relative;
      margin-top: 0px;
      .action-btn {
        margin-right: 8px;
      }
      /deep/ .wpg-divider-vertical {
        margin: 0 4px;
      }
      /deep/.wpg-table-column-has-filters {
        .anticon-filter {
          position: relative;
          top: -7px;
          width: 20px;
        }
      }
      .alarm-tabs {
        margin-left: -24px;
        height: 38px;
      }
      /deep/ .actions {
        width: 160px;
        display: flex;
        justify-content: space-evenly;
        .item1,
        .item2,
        .item3 {
          display: flex;
          justify-content: space-around;
        }
      }
    }
    .hide-btn {
      width: 22px;
      height: 22px;
      border-radius: 50%;
      position: absolute;
      top: 50%;
      z-index: 1;
      cursor: pointer;
      box-shadow: 0 2px 4px 0 rgba(0, 0, 0, 0.15);
    }
    > .chart-wrapper {
      width: 350px;
      margin-left: 12px;
      height: 100%;
      transition: width 0.2s;
      &.hide {
        width: 0;
        overflow: hidden;
      }
      .alarm-num {
        text-align: center;
        padding: 20px 0;
        border-radius: 4px 4px 0 0;
        .alarm-classify:nth-child(2n) {
          cursor: pointer;
        }
      }
      .org-alarm,
      .pump-alarm {
        padding: 0 8px;
        height: calc(50% - 49px);
        /deep/ .wpg-tabs {
          height: 100%;
          .wpg-tabs-content {
            height: calc(100% - 60px);
            .chart {
              height: 100%;
            }
          }
          .wpg-tabs-bar {
            .wpg-tabs-nav-scroll {
              display: flex;
              justify-content: center;
              width: 100%;
              > div {
                width: 100%;
                overflow: hidden;
              }
            }
            .wpg-tabs-tab {
              width: 50%;
              padding: 8px 0;
              margin: 0 !important;
              text-align: center;
            }
          }
        }
      }
      .org-alarm {
        margin: 8px 0px;
      }
    }
  }
}
.alarm-name {
  cursor: pointer;
}
</style>
