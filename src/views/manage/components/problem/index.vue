<!--
 * @Description:问题上报组件
 * @Author: limz
 * @Date: 2021-08-04 11:25:05
 * @LastEditTime: 2024-12-24 09:11:38
 * @LastEditors: yuan wenyu
-->

<template>
  <div class="problem-center">
    <table-search>
      <w-form-model slot="form" layout="inline" ref="form" :model="form">
        <w-row :gutter="38" type="flex">
          <w-col v-bind="grid">
            <w-form-model-item label="严重程度" prop="severity" :wrapperCol="{ flex: 1 }">
              <w-tree-select
                v-model="form.severity"
                :maxTagCount="1"
                style="width: 100%"
                :replaceFields="{ title: 'name', key: 'value' }"
                :tree-data="seriousLevel"
                tree-checkable
              />
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid">
            <w-form-model-item label="问题状态" prop="status" :wrapperCol="{ flex: 1 }">
              <w-tree-select
                v-model="form.status"
                :maxTagCount="1"
                style="width: 100%"
                :replaceFields="{ title: 'name', key: 'value' }"
                :tree-data="problemStatus"
                tree-checkable
              />
            </w-form-model-item>
          </w-col>

          <w-col v-bind="grid">
            <w-form-model-item label="模糊搜索" prop="keyWord">
              <w-input
                v-model="form.keyWord"
                placeholder="上报内容"
                :maxLength="50"
                allowClear
                @keyup.enter="refresh"
              />
            </w-form-model-item>
          </w-col>
          <w-col v-bind="grid">
            <w-form-model-item label="上报时间" prop="date" :wrapperCol="{ flex: 1 }">
              <w-range-picker style="width: 100%" v-model="form.date" />
            </w-form-model-item>
          </w-col>
          <w-col :style="{ textAlign: 'right' }" class="supply-ml-auto">
            <w-form-model-item>
              <w-button class="supply-mx-3" @click="reset" icon="reload">
                重置
              </w-button>
              <w-button type="primary" @click="refresh" icon="search">
                查询
              </w-button>
              <w-button v-if="roleType === 1" class="supply-ml-3" @click="goToPage">
                我的上报
              </w-button>
              <return-control class="supply-ml-3" :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>

      <div class="problem-con">
        <div class="table-wrapper">
          <STable
            v-if="columns.length"
            ref="table"
            :columns="columns"
            :rowKey="record => record.id"
            :data="loadData"
            :scroll="scroll"
            class="supply-bg-bg-card-component"
          >
            <template slot="tableToolbar" class="follow-oper">
              <w-button
                v-permission:button="'problem_report_manager'"
                v-if="roleType === 1"
                class="supply-ml-1"
                @click="download"
              >
                导出
              </w-button>
              <w-button v-permission:button="'problem_report'" v-else @click="download">
                导出
              </w-button>
              <w-button
                v-if="roleType === 2"
                type="primary"
                class="supply-ml-3"
                @click="addProblem"
              >
                问题上报
              </w-button>
            </template>
            <div slot="problemContent" slot-scope="text, record" @click="handleDetails(record)">
              <span>
                <a class="item3 " @click="handleDetails(record)">{{ text }}</a>
              </span>
            </div>
            <div slot="problemType" slot-scope="text, record">
              <span>
                {{ getDicName('questionType', text) }}
              </span>
            </div>
            <div slot="severity" slot-scope="text, record">
              <span
                class="table-tab"
                :style="{
                  color: themeConfig.severityColor[text].fontColor,
                  backgroundColor: themeConfig.severityColor[text].bgColor,
                  border: '1px solid ' + themeConfig.severityColor[text].fontColor
                }"
              >
                {{ getDicName('seriousLevel', text) }}
              </span>
            </div>
            <div slot="status" slot-scope="text, record">
              <span
                class="table-tab"
                :style="{
                  color: themeConfig.statusColor[text].fontColor,
                  backgroundColor: themeConfig.statusColor[text].bgColor,
                  border: '1px solid ' + themeConfig.statusColor[text].borderColor
                }"
              >
                {{ getDicName('problemStatus', text) }}
              </span>
            </div>
            <div slot="deviceType" slot-scope="text, record">
              <span>
                {{ getDicName('deviceType', text) }}
              </span>
            </div>
            <div slot="action" slot-scope="text, record" class="actions">
              <a v-if="!record.status" class="item3" @click="handleAdd(record)">派单</a>
              <a v-else class="item3 " @click="ticketDetails(record)">工单详情</a>
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
          <w-row class="problem-num supply-bg-bg-card-DEFAULT">
            <w-col v-for="t in issueTypeConfig" :key="t.title" :span="6">
              <div
                class="num supply-text-xl"
                :style="{ color: t.key === 'totalNum' ? 'var(--supply-color-main)' : t.color }"
              >
                {{ t.value }}
              </div>
              <div class="label supply-text-third supply-text-xs">{{ t.title }}</div>
            </w-col>
          </w-row>
          <div class="pump-problem supply-bg-bg-card-DEFAULT">
            <w-tabs value="1" size="small">
              <w-tab-pane key="1" tab="严重程度分布">
                <div class="chart">
                  <PieChart
                    v-if="orgPieOption && orgPieOption.title.text"
                    :defaultHighlight="false"
                    :option="orgPieOption"
                  ></PieChart>
                </div>
                <w-empty :id="'vcEmpty2'" size="small" />
              </w-tab-pane>
            </w-tabs>
          </div>
          <div class="org-issue supply-bg-bg-card-DEFAULT">
            <w-tabs value="1" size="small">
              <w-tab-pane key="1" tab="故障类型分布">
                <div class="chart">
                  <PieChart
                    v-if="pumpPieOption && pumpPieOption.title.text"
                    :defaultHighlight="false"
                    :option="pumpPieOption"
                  ></PieChart>
                </div>
                <w-empty :id="'vcEmpty1'" size="small" />
              </w-tab-pane>
            </w-tabs>
          </div>
        </div>
      </div>
    </table-search>
    <drag-modal
      :width="1152"
      :height="600"
      title="问题上报"
      ref="addDialog"
      :isShowFullBtn="false"
      :mask="true"
    >
      <problem-add @cancelSubmit="handleCancel" @complete="handleComplete"></problem-add>
    </drag-modal>
    <drag-modal
      ref="problemDetail"
      :isShowFullBtn="false"
      :mask="true"
      :width="720"
      title="上报内容详情"
    >
      <problem-detail
        @toDispatch="toDispatch"
        :waterPlantId="waterPlantId"
        :detailData="detailData"
      ></problem-detail>
    </drag-modal>
    <ticket-dialog
      :noType="true"
      :orderTemplateId="orderTemplateId"
      @createTicket="createTicket"
      ref="ticketDialog"
      :templateType="templateType"
      :templateData="templateData"
    />
  </div>
</template>

<script>
import { getSysParamByCode } from '@/api';
import RegionOrOrgSelect from '@/components/SelectRegionOrOrg';
import moment from 'moment';
import {
  PeiColors,
  ORG_BAR_OPTION,
  PUMP_BAR_OPTION,
  GET_ORG_PIE_OPTION,
  GET_PUMP_PIE_OPTION
} from './problem';
import {
  sysDictListByCode,
  selectDictEnumByCode,
  getProblemStatus, //组织问题统计
  problemReportType, //故障类型统计
  problemReportPump, //水厂问题排名
  problemReportSeverity, //严重程度统计
  problemReportExport, //问题列表导出
  problemReportGet, //查看问题详情
  problemReportList //问题列表
} from '@/api/manage';
import BarChart from '@/components/chart/BarChart.vue';
import TicketDialog from '@/components/TicketDialog/index';
import PieChart from '@/components/chart/PieChart.vue';
import DragModal from '@/components/DragModal';
import ProblemDetail from './ProblemDetail';
import ProblemAdd from './ProblemAdd';
import { exportFile } from '@/utils/util';
import { themeMixin } from '@/core/mixins.ts';
import { getDeviceTypeApi } from '@/api/public';

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
    title: '设备类型',
    dataIndex: 'deviceType',
    fixed: 'left',
    width: 160,
    ellipsis: true,
    scopedSlots: { customRender: 'deviceType' }
  },
  {
    title: '设备名称',
    dataIndex: 'deviceName',
    fixed: 'left',
    width: 160,
    ellipsis: true
  },
  {
    title: '故障类型',
    dataIndex: 'problemType',
    ellipsis: true,
    scopedSlots: { customRender: 'problemType' }
  },
  {
    title: '上报内容',
    dataIndex: 'problemContent',
    ellipsis: true,
    scopedSlots: { customRender: 'problemContent' }
  },
  {
    title: '严重程度',
    dataIndex: 'severity',
    width: 120,
    ellipsis: true,
    scopedSlots: { customRender: 'severity' }
  },
  {
    title: '上报时间',
    dataIndex: 'createTime',
    width: 180,
    ellipsis: true
  },
  {
    title: '问题状态',
    dataIndex: 'status',
    ellipsis: true,
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '处理时间',
    width: 180,
    dataIndex: 'dealTime',
    ellipsis: true
  },
  {
    title: '处理人',
    dataIndex: 'dealByName',
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 100,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
];
const ColorMap = {
  dark: { nameColor: '#868E96', valueColor: '#FFF' },
  default: { nameColor: '#999', valueColor: '#333' }
};
export default {
  name: 'ProblemReport',
  mixins: [themeMixin],
  components: {
    RegionOrOrgSelect,
    BarChart,
    PieChart,
    TicketDialog,
    ProblemDetail,
    ProblemAdd,
    DragModal
  },
  props: {
    roleType: {
      type: Number
    }
  },
  inject: ['state', 'linkToOther'],
  data() {
    return {
      templateType: 'purificationRepair',
      orderTemplateId: '',
      themeConfigMap: {
        default: {
          severityColor: {
            '1': { fontColor: '#F05557', bgColor: '#FFCFD0' },
            '2': { fontColor: '#FF922B', bgColor: '#FFC895' },
            '3': { fontColor: '#9C73FB', bgColor: '#D9C8FF' }
          },
          statusColor: {
            '0': { fontColor: '#FFBF00', bgColor: '#FFF4D6', borderColor: '#FBDF87' },
            '1': { fontColor: '#4EA6FF', bgColor: 'rgba(78,166,255,0.10)', borderColor: '#99CCFF' },
            '2': { fontColor: '#008184', bgColor: '#E0F4F4', borderColor: '#37C2CE' }
          }
        },
        dark: {
          severityColor: {
            '1': { fontColor: '#F05557', bgColor: 'rgba(255, 207, 208, 0.16)' },
            '2': { fontColor: '#FF922B', bgColor: 'rgba(255, 200, 149, 0.16)' },
            '3': { fontColor: '#9C73FB', bgColor: 'rgba(217, 200, 255, 0.16)' }
          },
          statusColor: {
            '0': {
              fontColor: 'rgba(255, 146, 43, 1)',
              bgColor: 'rgba(255, 146, 43, 0.16)',
              borderColor: 'rgba(255, 146, 43, 1)'
            },
            '1': {
              fontColor: 'rgba(78, 166, 255, 1)',
              bgColor: 'rgba(78, 166, 255, 0.16)',
              borderColor: 'rgba(78, 166, 255, 1)'
            },
            '2': {
              fontColor: 'rgba(26, 201, 205, 1)',
              bgColor: 'rgba(26, 201, 205, 0.16)',
              borderColor: 'rgba(26, 201, 205, 1)'
            }
          }
        }
      },
      curRecord: {},
      problemStatus: [],
      seriousLevel: [],
      questionType: [],
      form: {
        orgIds: [],
        date: [moment().subtract(1, 'month'), moment().endOf('day')]
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
      columns,
      dataKeys: {
        total: 'total',
        records: 'records',
        current: 'current'
      },
      params: {},
      issueTypeConfig: [
        {
          title: '问题总数',
          value: '--',
          color: '#333333'
        },
        {
          title: '待处理',
          value: '--',
          color: '#FFBF00'
        },
        {
          title: '处理中',
          value: '--',
          color: '#4EA6FF'
        },
        {
          title: '已处理',
          value: '--',
          color: '#008184'
        }
      ],
      orgBarOption: null,
      orgPieOption: null,
      pumpPieOption: null,
      pumpBarOption: null,
      activeTab_pie: '2',
      equipmentType: [],
      activeTab_bar: '1',
      visible: false,
      templateData: null,
      detailData: {},
      showChart: true,
      scroll: {
        x: columns.length * 120
        // y: 'calc(100vh - 275px)'
      },
      waterPlantId: '',
      type: 'wpg',
      treeData: [],
      hasMounted: true
    };
  },
  watch: {
    seriousLevel(n) {
      if (n.length) {
        this.$set(
          this.form,
          'severity',
          n.map(item => item.value)
        );
      }
    },
    problemStatus(n) {
      if (n.length) {
        this.$set(
          this.form,
          'status',
          n.map(item => item.value)
        );
      }
    },
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
    this.getWaterPlant();
    // 接收url query参数
    // 参数处理顺序,sessionStorageId >> query >> type 由后向前覆盖
    if (this.roleType === 2) {
      this.activeTab_bar = '2';
    }
    let { sessionStorageId, confirmStatus, status, date, keyword, stationIds } = this.$route.query;
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
      if (typeof date === 'string') {
        date = date.split(',');
      }

      this.form.date = [this.$moment(date[0]), this.$moment(date[1])];
    }
    if (date === '') {
      this.form.date = undefined;
    }
    if (confirmStatus) {
      this.form.confirmStatus = confirmStatus;
    }
    if (status) {
      this.form.status = status;
    }
    if (keyword) {
      this.form.keyword = keyword;
    }

    this.sysDictListByCode('question_type', 'questionType');
    this.sysDictListByCode('serious_level', 'seriousLevel');
    this.selectDictEnumByCode('PROBLEM_STATUS', 'problemStatus');
    this.getDeviceTypeList('deviceType');
    this.refresh();
  },
  activated() {
    this.getIssueSysParam();
    if (this.hasMounted) {
      this.hasMounted = false;
    } else {
      this.refresh();
    }
  },
  methods: {
    async getWaterPlant() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantId = resultData?.[0]?.id || '';
    },
    goToPage() {
      this.drillDown({
        path: '/manage/problemInspect'
      });
    },
    init() {
      this.getIssueTypeNum();
      this.getOrgIssueNum();
      this.getIssueLevelNum();
    },
    async createTicket() {
      this.refresh();
    },
    handleCancel() {
      this.$refs.addDialog && (this.$refs.addDialog.visible = false);
    },
    handleComplete() {
      this.$refs.addDialog && (this.$refs.addDialog.visible = false);
      this.refresh();
    },
    addProblem() {
      this.$refs.addDialog && (this.$refs.addDialog.visible = true);
    },
    getIssueSysParam() {
      getSysParamByCode('problem_report_ticket_template_type_code').then(res => {
        const { status, resultData } = res;
        if (status === 'complete' && resultData) {
          if (resultData.split(',')[0]) {
            this.templateType = resultData.split(',')[0];
          }
          if (resultData.split(',')[1]) {
            this.orderTemplateId = resultData.split(',')[1];
          }
        }
      });
    },
    getDicName(dicName, text) {
      return this[dicName].length
        ? this[dicName].find(item => {
            return item.value == text || item.code == text;
          })?.name || ''
        : '';
    },
    hideChart() {
      this.showChart = !this.showChart;
    },

    reset() {
      this.$refs.form.resetFields();
      this.form = {
        severity: this.seriousLevel.map(item => item.value),
        status: this.problemStatus.map(item => item.value),
        date: [moment().subtract(1, 'month'), moment()]
      };
      if (this.roleType === 1) {
        this.form.orgIds = [...this.allpOrg];
      }
      this.refresh();
    },
    // 组织列表请求完毕
    handleRegionLoaded(params) {
      this.allpOrg = [...this.form.orgIds];
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
        ? this.$moment(this.form.date[0]).format('YYYY-MM-DD 00:00:00')
        : '';
      let eTime = this.form.date[1]
        ? this.$moment(this.form.date[1]).format('YYYY-MM-DD 23:59:59')
        : '';

      this.params = {
        ...this.form,
        roleType: this.roleType,
        startTime: sTime,
        endTime: eTime
      };
      if (this.roleType === 2) {
        delete this.params.orgIds;
      }
      delete this.params.date;
      if (this.$refs.table) this.$refs.table.refresh(bool);
      this.init();
    },

    /* 导出 */
    download() {
      problemReportExport(this.params).then(res => {
        exportFile(res, '问题列表');
      });
    },

    async loadData(parameter) {
      if (!this.params.roleType) {
        return;
      }
      this.params = {
        ...this.params,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };
      return await problemReportList(this.params).then(res => {
        return {
          total: res.count,
          records: res.resultData,
          current: parameter.pageNo
        };
      });
    },
    toDispatch() {
      if (this.$refs.problemDetail) this.$refs.problemDetail.visible = false;
      this.handleAdd(this.curRecord);
    },
    /** 上报内容详细 */
    async handleDetails(record) {
      this.curRecord = record;
      let res = await problemReportGet(record.id);

      res.resultData.severityName = this.getDicName('seriousLevel', res.resultData.severity);
      res.resultData.statusName = this.getDicName('problemStatus', res.resultData.status);
      this.detailData = res.resultData;
      if (this.$refs.problemDetail) this.$refs.problemDetail.visible = true;
    },
    handleOrgChange(value) {
      this.form.orgIds = value;
    },

    /* 禁止选择日期 */
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    },

    /* 严重程度分布 */
    getIssueLevelNum() {
      this.orgPieOption = { ...GET_ORG_PIE_OPTION(this.state.theme) };
      problemReportSeverity(this.params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          if (resultData.length > 0) {
            let total = 0;
            let sData = resultData.map((r, i) => {
              total += Number(r.value);
              return {
                value: r.value,
                name: this.getDicName('seriousLevel', r.key),
                itemStyle: {
                  color: this.getColor(PeiColors[0], i)
                }
              };
            });
            this.orgPieOption.title.text = ['{value|' + total + '}', '{name|总数}'].join('\n');
            this.orgPieOption.series[0].data = sData;
            sData.forEach((item, i) => {
              this.orgPieOption.series[0].label.rich['point' + i] = {
                align: 'left',
                width: 7.76,
                height: 7.76,
                backgroundColor: this.getColor(PeiColors[0], i),
                borderRadius: 3.88
              };
            });
          } else {
            this.orgPieOption.title.text = '';
          }
        }
      });
    },

    /* 故障类型分布 */
    getIssueTypeNum() {
      this.pumpPieOption = { ...GET_PUMP_PIE_OPTION(this.state.theme) };
      problemReportType(this.params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          if (resultData.length > 0) {
            let total = 0;
            let sData = resultData.map((r, i) => {
              total += Number(r.value);
              return {
                value: r.value,
                name: this.getDicName('questionType', r.key),
                itemStyle: {
                  color: this.getColor(PeiColors[1], i)
                }
              };
            });
            this.pumpPieOption.title.text = ['{value|' + total + '}', '{name|总数}'].join('\n');
            this.pumpPieOption.series[0].data = sData;
            sData.forEach((item, i) => {
              this.pumpPieOption.series[0].label.rich['point' + i] = {
                align: 'left',
                width: 7.76,
                height: 7.76,
                backgroundColor: this.getColor(PeiColors[1], i),
                borderRadius: 3.88
              };
            });
          } else {
            this.pumpPieOption.title.text = '';
          }
        }
      });
    },
    getColor(colorList, i) {
      if (i < colorList.length) {
        return colorList[i];
      }
      return 'rgb(' + ((i * 80) % 255) + ',' + ((i * 100) % 255) + ',' + ((i * 60) % 255) + ')';
    },
    /* 水厂问题排名情况 */
    getPumpIssueNum() {
      this.pumpBarOption = { ...PUMP_BAR_OPTION };
      problemReportPump(this.params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          let yData = [];
          let sData = [];
          resultData.forEach(r => {
            yData.push(r.key);
            sData.push(r.value);
          });
          this.pumpBarOption.yAxis[0].data = yData;
          this.pumpBarOption.series[0].data = sData;
        }
      });
    },
    async sysDictListByCode(code, data) {
      let dicts = ['serious_level', 'question_type'];
      const res = await sysDictListByCode(code);
      if (res.status === 'complete') {
        res.resultData.map(item => {
          item.value = dicts.includes(code) ? Number(item.dictValue) : item.dictValue;
          item.name = item.dictName;
        });
        this[data] = res.resultData;
      }
    },
    async getDeviceTypeList(data) {
      const {resultData, status} = await getDeviceTypeApi();
      if (status === 'complete') {
        let deviceTypeList = [];
        resultData.map(item => {
          item.children.map(childData => {
            deviceTypeList.push({
              value: childData.data.dictCode,
              name: childData.data.dictName
            });
          });
        });
        this[data] = deviceTypeList;
      }
    },
    async selectDictEnumByCode(code, data) {
      const res = await selectDictEnumByCode(code);

      this[data] = res.resultData || [];
    },
    /* 各组织问题情况 */
    async getOrgIssueNum() {
      this.orgBarOption = { ...ORG_BAR_OPTION };
      let data = await getProblemStatus(this.params);
      let yData = [];
      let sData = [];
      let issueTypeNum = {};
      if (data.status === 'complete') {
        let seriesData = {};
        data.resultData.forEach((item, index) => {
          if (!yData.find(d => d.text === item.dimension)) {
            yData.push({ text: item.dimension });
          }
          this.problemStatus.map((status, statusI) => {
            let ishave = false;
            if (item.key === status.value) {
              ishave = true;

              if (issueTypeNum[item.key] === undefined) {
                issueTypeNum[item.key] = {
                  title: status.name,
                  value: item.value
                };
              } else {
                issueTypeNum[item.key].value += item.value;
              }
              if (seriesData[item.key] === undefined) {
                seriesData[item.key] = [item.value];
              } else {
                seriesData[item.key].push(item.value);
              }
              if (!ishave) {
                if (seriesData[item.key] === undefined) {
                  seriesData[item.key] = [null];
                } else {
                  seriesData[item.key].push(null);
                }
              }
            }
          });
        });
        this.problemStatus.map((item, index) => {
          sData.push({
            name: item.name,
            type: 'bar',
            barGap: 0,
            barWidth: 8,
            data: seriesData[index]
          });
        });
      }
      let issueTypeNumList = Object.values(issueTypeNum);
      let sum = 0;
      if (issueTypeNumList.length) {
        issueTypeNumList.forEach(num => {
          sum += num.value;
        });
      } else {
        sum = '--';
      }

      issueTypeNumList.unshift({
        title: '问题总数',
        value: sum
      });
      this.issueTypeConfig.forEach(item => {
        let numObj = issueTypeNumList.find(num => num.title === item.title);
        item.value = numObj ? numObj.value : '--';
      });
      this.orgBarOption.yAxis[0].data = yData.map(d => d.text);
      this.orgBarOption.series = sData;
    },

    /* 创建工单 */
    handleAdd(record) {
      this.curRecord = record;
      let { orgId, id, problemContent, pumpAddress, severity, pumpHouseId, problemType } = record;
      this.templateData = {
        ticketAddress: {
          address: pumpAddress || '',
          point: {}
        },
        // orgId: orgId,
        orgIds: orgId,
        pumpId: pumpHouseId,
        severity: severity + '',
        scene: '1',
        sceneId: id,
        content: this.getDicName('questionType', problemType),
        question_type: problemType + '',
        problem_content: problemContent
      };
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    },

    /** 跳转到水厂详情 */
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
.problem-center {
  width: 100%;
  height: 100%;
  .chart {
    height: 100%;
  }
  .supply-text-right {
    text-align: right;
  }
  /deep/ .table-page-search-wrapper {
    padding-bottom: 10px !important;
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
  .problem-con {
    display: flex;
    height: 100%;
    position: relative;
    > .table-wrapper {
      margin-top: 0;
      flex: 1;
      min-width: 1px;
      position: relative;
      border-radius: 4px;
      overflow: hidden;
      .table-tab {
        line-height: 20px;
        text-align: center;
        vertical-align: middle;
        padding: 0 6px;
      }
      .status-item {
        display: inline-block;
        height: 20px;
        width: 56px;
        text-align: center;
        font-size: 12px;
        &.status1 {
          color: #4ea6ff;
          border: 1px solid #b4daff;
          background: #edf6ff;
        }
        &.status2 {
          color: #ffd8a8;
          border: 1px solid #ff922b;
          background: #fff8f0;
        }
        &.status3 {
          color: #1faaad;
          border: 1px solid #a6e5e9;
          background: #ebfafb;
        }
        &.status-1 {
          color: #969999;
          border: 1px solid #dce0df;
          background: #f7fafa;
        }
      }
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
      /deep/ .actions {
        display: flex;
        .item1,
        .item2,
        .item3 {
          display: flex;
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
      border-radius: 4px;
      overflow: hidden;
      height: 100%;
      transition: width 0.2s;
      &.hide {
        width: 0;
        overflow: hidden;
      }

      .problem-num {
        text-align: center;
        padding: 20px 0;
        border-radius: 4px 4px 0 0;
      }
      .org-issue,
      .pump-problem {
        padding: 0 4px 10px;
        height: calc(50% - 44px);
        /deep/ .wpg-tabs {
          height: 100%;
          .wpg-tabs-content {
            height: calc(100% - 45px);
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
      .org-issue {
        margin: 4px 0 0;
      }
      .pump-problem {
        border-radius: 0 0 4px 4px;
      }
    }
  }
}
</style>
