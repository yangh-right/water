<!--
 * @Author: chenzh
 * @Date: 2021-01-12 10:24:09
 * @LastEditTime: 2024-07-26 11:22:31
 * @LastEditors:  Do not edit
 * @Description: 工单详情跳转到外业工单
 * @FilePath: /pump-station/src/views/order/orderCalendar.vue
-->
<template>
  <div class="table-search-layout">
    <div class="wbgc-card table-page-search-wrapper">
      <w-form layout="horizontal">
        <w-row :gutter="20">
          <w-col :span="6">
            <region-or-org-select
              ref="regionOrOrg"
              class="form-region-select"
              :item="{
                label: '选择组织',
                isShowType: false,
                type: 'orgUser',
                ids: options.orgIds
              }"
              @selectChange="handleOrgChange"
              @initLoaded="handleRegionLoaded"
            ></region-or-org-select>
          </w-col>
          <w-col :span="5">
            <w-form-item label="工单类型">
              <w-select v-model="options.ticketType" placeholder="工单类型" @change="handleSearch">
                <w-select-option value>全部</w-select-option>
                <w-select-option
                  v-for="item in templateTypeList"
                  :key="item.code"
                  :value="item.code"
                  >{{ item.name }}</w-select-option
                >
              </w-select>
            </w-form-item>
          </w-col>
          <w-col :span="3">
            <w-form-item>
              <w-month-picker
                v-model="options.date"
                :allowClear="false"
                format="YYYY年MM月"
                valueFormat="YYYY-MM"
                placeholder="选择月份"
                @change="handleMonthChange"
              />
            </w-form-item>
          </w-col>
          <w-col :span="8" class="table-page-search-submitButtons">
            <w-dropdown>
              <w-button type="primary" icon="ic_add">
                新增工单
              </w-button>

              <w-menu slot="overlay">
                <w-menu-item v-for="item in templateTypeList" :key="item.code">
                  <a @click="handleAdd(item.code)">{{ item.name }}</a>
                </w-menu-item>
              </w-menu>
            </w-dropdown>
            <w-button icon="reload" @click="handleReset">重置</w-button>
            <w-button type="primary" icon="search" @click="handleSearch">查询</w-button>
          </w-col>
        </w-row>
      </w-form>
    </div>

    <div class="table-page-list-wrapper">
      <div class="wbgc-card ticket-calendar-container">
        <w-calendar
          :header-render="() => {}"
          :value="monthValue"
          @select="handleCalendarChange"
          style="overflow-y:auto;height: 100%;"
        >
          <ul slot="dateCellRender" slot-scope="value" class="events">
            <li v-for="item in getListData(value)" :key="item.typeCode">
              <w-badge :status="item.type"></w-badge>
              <span class="ticket-type">{{ item.typeName }}({{ item.num }})</span>
            </li>
          </ul>
        </w-calendar>
      </div>
      <div class="wbgc-card ticket-list-container">
        <div class="ticket-list-title wfc-unusual">{{ dateTime }} 工单列表</div>
        <s-table
          ref="table"
          rowKey="id"
          :columns="columns"
          :canResize="true"
          :initLoadData="false"
          :pagination="{ showTotal: () => {}, showSizeChanger: false }"
          :showSizeChanger="false"
          :data="loadData"
          :dataKeys="dataKeys"
        >
          <template slot="smallType" slot-scope="text">{{
            templateTypeJson[text] ? templateTypeJson[text] : '--'
          }}</template>
          <template slot="ticketStatus" slot-scope="text">{{
            ticketStatusJson[text] ? ticketStatusJson[text] : '--'
          }}</template>
          <template slot="action" slot-scope="text, record">
            <a @click="toTicketDetail(record)">详情</a>
          </template>
        </s-table>
      </div>
    </div>

    <ticket-dialog ref="ticketDialog" :templateType="templateType" @update="handleSearch" />
  </div>
</template>

<script>
import moment from 'moment';
import { mapState } from 'vuex';
import TicketDialog from '@/components/TicketDialog/index';
import { getTicketCalendar, getTicketList } from '@/api/work';
import { arrToJson } from '@/utils/util';
import RegionOrOrgSelect from '@/components/SelectRegionOrOrg';

const MONTH_FORMAT = 'YYYY-MM';
const DATE_FORMAT = 'YYYY-MM-DD';
const TEMPLATE_TYPE_COLOR = {
  maintain: 'success',
  planInspect: 'error',
  repair: 'processing',
  planTankClear: 'warning'
};

export default {
  components: {
    TicketDialog,
    RegionOrOrgSelect
  },

  data() {
    let currentDate = moment();

    return {
      planType: 'area',
      templateType: '',
      columns: [
        {
          title: '工单标题',
          dataIndex: 'title',
          ellipsis: true,
          width: 150
        },
        {
          title: '工单类型',
          dataIndex: 'smallType',
          ellipsis: true,
          width: 100,
          scopedSlots: { customRender: 'smallType' }
        },
        {
          title: '工单状态',
          dataIndex: 'ticketStatus',
          ellipsis: true,
          width: 80,
          scopedSlots: { customRender: 'ticketStatus' }
        },
        {
          title: '操作',
          dataIndex: 'action',
          ellipsis: true,
          width: 80,
          scopedSlots: { customRender: 'action' }
        }
      ],
      dataKeys: {
        total: 'total',
        records: 'records',
        current: 'current'
      },
      monthValue: currentDate,
      options: {
        orgIds: [],
        ticketType: '',
        date: currentDate.format(MONTH_FORMAT)
      },
      dateTime: currentDate.format(DATE_FORMAT),
      calendarTicketList: [], // 工单日历列表
      ticketList: []
    };
  },

  computed: {
    ...mapState('dict', {
      templateTypeList: state => state.dictory.template_type,
      templateTypeJson: state => arrToJson(state.dictory.template_type),
      ticketStatusJson: state => arrToJson(state.dictory.ticket_status)
    })
  },

  inject: ['linkToOther'],

  mounted() {
    this.$store.dispatch('dict/GenerateDictory');
    this.refresh();
  },

  methods: {
    async getTicketCalendar() {
      let startDate = this.monthValue.add(0, 'month').format(MONTH_FORMAT) + '-01';
      let endDate = moment(startDate)
        .add(1, 'month')
        .add(-1, 'days')
        .format(DATE_FORMAT);
      let option = {
        ...this.options,
        startDate,
        endDate
      };
      delete option.date;
      let res = await getTicketCalendar(option);

      let ret = res.resultData || [];

      this.calendarTicketList = ret.map(v => {
        let list = v.list || [];
        return {
          dateTime: v.dateTime,
          list: list.map(o => {
            return {
              ...o,
              type: TEMPLATE_TYPE_COLOR[o.typeCode]
            };
          })
        };
      });
    },

    loadData(parameter) {
      let params = {
        orgIds: this.options.orgIds,
        endDate: this.dateTime,
        startDate: this.dateTime,
        // endDate: moment(this.dateTime).add('day', 1).format(DATE_FORMAT),
        ticketType: this.options.ticketType,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };

      return getTicketList(params).then(res => {
        let ret = res.resultData || [];

        return ret;
      });
    },

    getListData(value) {
      let dateTime = value.format(DATE_FORMAT);
      let item = this.calendarTicketList.find(item => item.dateTime === dateTime);
      let list = item ? item.list : [];

      return list || [];
    },

    // 查询组织/区域范围改变
    handleOrgChange(value) {
      this.options.orgIds = value;
    },

    handleRegionLoaded() {
      this.pageSearchLoaded = true;
      this.handleSearch();
    },

    handleCalendarChange(value) {
      let dateTime = value.format(DATE_FORMAT);

      this.dateTime = dateTime;
      this.monthValue = dateTime;
      this.options.date = value.format(MONTH_FORMAT);

      this.refresh();
    },

    handleMonthChange(value) {
      this.monthValue = moment(value);
      this.dateTime = this.monthValue.format(DATE_FORMAT);

      this.handleSearch();
    },

    handleRadioChange() {
      if (this.planType === 'area') {
        this.options.org = '';
      } else if (this.planType === 'org') {
        this.options.rangeId = '';
      }
    },

    handleSearch() {
      if (this.options.orgIds.length <= 0) {
        this.$message.info('请至少选择一个组织');
        return false;
      }
      this.getTicketCalendar();
      this.refresh();
    },

    refresh(bool = true) {
      if (this.$refs.table && !this.$refs.table.localLoading && this.pageSearchLoaded) {
        this.$refs.table.refresh(bool);
      }
    },

    handleReset() {
      let currentDate = moment();

      this.options = {
        orgIds: [],
        ticketType: '',
        date: currentDate.format(MONTH_FORMAT)
      };

      this.dateTime = currentDate.format(DATE_FORMAT);
      this.monthValue = currentDate;

      this.$refs.regionOrOrg.refresh(); // 区域组织选择重置

      this.handleSearch();
    },

    toTicketDetail(record) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: record.id
        }
      });
    },

    handleAdd(templateType) {
      this.templateType = templateType;

      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
    }
  }
};
</script>

<style lang="less" scoped>
.form-group-select {
  /deep/ .wpg-form-item-children {
    display: flex;

    .wpg-select {
      flex: 1;
      width: auto;
      margin-left: 20px;
    }
  }
}

/deep/.region-org-tree-container {
  width: 100%;
  margin-top: 3px;
}

// fixbug: #16933 ie11 晃动
.table-page-search-wrapper {
  height: 56px;
  background: var(--supply-color-bg-card-DEFAULT);
  .wpg-btn {
    margin-left: 12px;
  }
}

.table-page-list-wrapper {
  display: flex;
  flex-direction: row !important;

  .ticket-calendar-container {
    flex: 1;
    padding-top: 16px;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);

    /deep/ .wpg-fullcalendar-fullscreen {
      // .ant-fullcalendar-header {
      //   display: none;
      // }

      .wpg-fullcalendar-calendar-body {
        padding: 0;
      }
    }

    /deep/ .wpg-badge {
      .wpg-badge-status-text {
        margin-left: 4px;
      }
    }

    .ticket-type {
      font-size: 12px;
    }
  }

  .ticket-list-container {
    display: flex;
    flex-direction: column;
    width: 420px;
    margin-left: 12px;
    overflow: hidden;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);

    .ticket-list-title {
      height: 48px;
      padding-left: 20px;
      font-size: 16px;
      line-height: 48px;
    }

    /deep/ .wpg-pro-table-wrapper {
      flex: 1;
      overflow: hidden;
    }
  }
}
</style>
