<!--
 * @Description:报警中心
 * @Author: limz
 * @Date: 2021-08-04 11:25:05
 * @LastEditTime: 2025-02-17 10:28:56
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
              <w-button type="primary" icon="upload" @click="download">
                导出
              </w-button>
              <w-button class="supply-mx-3" @click="reset" icon="reload">
                重置
              </w-button>
              <w-button type="primary" @click="refresh" icon="search">
                查询
              </w-button>
              <a class="supply-mx-3" @click="collapse = !collapse">
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
      </div>
    </table-search>
    <ticket-dialog ref="ticketDialog" :templateType="'purificationInspect'" :templateData="templateData" />
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
import { queryOrgPumpHouseTree } from '@/api/manage';
import TicketDialog from '@/components/TicketDialog/index';
import TicketConfirm from '@/components/TicketConfirm/index';
import TicketNotConfirmed from '@/components/TicketNotConfirmed/index';
import alarmDetail from '@/components/common/alarmDetail.vue';
import previseDetail from '@/components/common/previseDetail.vue';
import DragModal from '@/components/DragModal';
import {
  alarmHandlerData, // 报警分页
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
    title: '所属组织',
    dataIndex: 'orgName',
    ellipsis: true
  },
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
      visible: false,
      templateData: null,
      colors: ['#F15C6E', '#F47A00', '#F8B500', '#8C6CFF'],
      detailData: {},
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
    }
  },
  mounted() {
    this.getAlarmTypes();
    this.getOrgPumpTree();
  },
  activated() {},
  methods: {
    reset() {
      this.$refs.form.resetFields();
      this.form = {
        confirmStatus: '',
        orgIds: [],
        status: '1', //报警类型--报警中
        alarmTypeCode: '',
        alarmLevels: ['1', '2', '3', '4'],
        date: [moment().subtract(1, 'month'), moment()],
        keyWord: '',
        stationIds: ['allCheck', ...this.allpIds]
      };
      this.refresh();
    },

    /* 报警详情弹框 */
    showAlarmDetail(record) {
      this.detailData = {
        alarmId: record.alarmHandlerDataId,
        typeCode: record.typeCode,
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
        let { pumpName, startTime, endTime } = this.alarmCenterParams;
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
        status: '1', //报警类型--报警中
        startTime: sTime,
        endTime: eTime
      };
      delete this.params.date;
      if (this.$refs.table) this.$refs.table.refresh(bool);
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

    /* 确认报警 */
    confirmClose(id) {
      this.$confirm({
        title: '提示',
        content: '您确定要提交吗?',
        onOk: () => {
          alarmConfirm({ alarmIds: [id] }).then(res => {
            let { status } = res;
            if (status === 'complete') {
              this.$message.success('确认成功');
              this.refresh();
            }
          });
        }
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
  }
}
.alarm-name {
  cursor: pointer;
}
</style>
