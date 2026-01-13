<template>
  <div class="order-list">
    <table-search class="plan-manage-list">
      <w-row slot="form" :gutter="12">
        <w-col :span="8">
          <w-form-item :label="`选择${textReplace}`">
            <FactorySelect
              v-model="options.pumpId"
              :showAll="!autoSelect"
              autoSelect
              @input="pumpSearch"
            ></FactorySelect>
          </w-form-item>
        </w-col>
        <w-col :span="8">
          <w-form-item label="紧急程度">
            <w-select v-model="options.priority" placeholder="请选择紧急程度">
              <w-select-option value="">全部</w-select-option>
              <w-select-option
                v-for="item of priorityList"
                :key="item.code"
                :value="Number(item.code)"
                >{{ item.name }}</w-select-option
              >
            </w-select>
          </w-form-item>
        </w-col>
        <w-col :span="8">
          <w-form-item label="工单状态">
            <w-select v-model="options.ticketStatus" placeholder="请选择工单状态">
              <w-select-option value="">全部</w-select-option>
              <w-select-option
                v-for="item of orderStatusList"
                :key="item.code"
                :value="item.code"
                >{{ item.name }}</w-select-option
              >
            </w-select>
          </w-form-item>
        </w-col>
        <w-col :span="8">
          <w-form-item label="时间范围">
            <w-range-picker v-model="rangeTime" format="YYYY-MM-DD" />
          </w-form-item>
        </w-col>
        <w-col :span="6">
          <w-form-item label="模糊搜索">
            <w-input
              v-model="options.keyword"
              placeholder="编号/标题"
              :maxLength="50"
              allowClear
              @keyup.enter="search"
            ></w-input>
          </w-form-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-form-item>
            <w-dropdown>
              <w-button class="search-head-btn" type="primary">
                <w-icon type="ic_add" class="supply-text-l "></w-icon>
                发起变更
              </w-button>
              <w-menu slot="overlay">
                <w-menu-item v-for="item in selectTypeList" :key="item.code">
                  <a @click="handleAdd(item.code)">{{ item.name }}</a>
                </w-menu-item>
              </w-menu>
            </w-dropdown>
            <w-button @click="handleReset" class="supply-mx-3" icon="reload">重置</w-button>
            <w-button type="primary" @click="search" icon="search">查询</w-button>
          </w-form-item>
        </w-col>
        <w-col :span="6" class="more-fun supply-float-right">
          <return-control
            :path="this.$route.query.from || '/devOps'"
            :keep="true"
            :is-drill-down="true"
          ></return-control>
        </w-col>
      </w-row>

      <div class="order-flex">
        <div
          class="order-table supply-h-full supply-flex-1 supply-overflow-hidden supply-bg-bg-card-component"
        >
          <PaginationTable
            class="supply-h-full"
            :columns="columns"
            :loading="tableLoading"
            :pagination="false"
            :data-source="orderList"
            :rowKey="
              (record, index) => {
                return record.id || 'ticket' + index;
              }
            "
            @change="changePage"
            :current.sync="page.current"
            :total.sync="page.total"
            :pageSize.sync="page.pageSize"
          >
            <span slot="action" slot-scope="text, record">
              <a @click="showDetail(record)">查看详情</a>
            </span>
            <template slot="status" slot-scope="text, record">
              <span :class="`status-item status${text}`">
                {{ record.ticketStatusName }}
              </span>
            </template>
            <template slot="priority" slot-scope="text">
              <img
                v-if="text && text < 4"
                :src="require(`@/assets/images/default/cockpit/priority${text}.png`)"
              />
              <span>{{ getPriorityName(text) || '--' }}</span>
            </template>
          </PaginationTable>
        </div>
      </div>
    </table-search>
    <!-- 创建工单弹窗 -->
    <ticket-dialog
      :typeDisabled="true"
      ref="ticketDialog"
      :templateType="templateType"
      :templateData="templateData"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
const columns = [
  {
    title: '序号',
    key: 'index',
    dataIndex: 'index',
    width: 80,
    align: 'center',
    fixed: 'left',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '工单编号',
    dataIndex: 'ticketNo',
    key: 'ticketNo',
    width: 120,
    ellipsis: true
  },
  {
    title: '工单类型',
    dataIndex: 'smallTypeName',
    key: 'smallTypeName',
    width: 120,
    ellipsis: true
  },
  {
    title: '选择污水厂',
    dataIndex: 'pumpHouseName',
    key: 'pumpHouseName',
    width: 120,
    ellipsis: true
  },
  {
    title: '工单标题',
    key: 'title',
    dataIndex: 'title',
    width: 120,
    ellipsis: true
  },
  {
    title: '紧急程度',
    key: 'priority',
    dataIndex: 'priority',
    width: 120,
    scopedSlots: { customRender: 'priority' }
  },
  {
    title: '工单状态',
    key: 'ticketStatus',
    width: 120,
    dataIndex: 'ticketStatus',
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '创建人',
    key: 'createByName',
    dataIndex: 'createByName',
    width: 120,
    ellipsis: true
  },
  {
    title: '创建时间',
    key: 'createTime',
    dataIndex: 'createTime',
    width: 150,
    ellipsis: true,
    customRender: (text, row, index) => {
      return text.replace(/T/g, ' ');
    }
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    scopedSlots: { customRender: 'action' }
  }
];
import { mapState, mapActions } from 'vuex';

import { getOrderList, getUserSetting } from '@/api/manage';
import moment from 'moment';
import PaginationTable from '@/components/PaginationTable/index.vue';
import TicketDialog from '@/components/TicketDialog/index.vue';
import FactorySelect from '@/components/factory-select/index';
export default {
  name: 'OrderManage',
  components: {
    FactorySelect,
    PaginationTable,
    TicketDialog
  },
  inject: ['linkToOther'],
  // props:{
  //     //工单类型
  //     ticketType:{
  //         type: Array,
  //         default: () => []
  //     }
  // },
  data() {
    return {
      options: {
        priority: '',
        ticketStatus: '',
        keyword: '',
        createTimeStart: '',
        createTimeEnd: '',
        pumpId: ''
      },
      ticketType: [], //工单类型
      selectTypeList: [], //工单类型
      rangeTime: [
        moment()
          .subtract(1, 'month')
          .format('YYYY-MM-DD'),
        moment().format('YYYY-MM-DD')
      ],
      page: {
        total: 0,
        current: 1,
        pageSize: 20,
        pageSizeOptions: ['10', '20', '30', '40'],
        showSizeChanger: true
      },
      orderList: [],
      tableLoading: false,
      // 增加工单
      templateType: '',
      addShow: false,
      addOrderForm: {
        createTicketFormDTO: {
          address: '',
          createType: '',
          latitude: '',
          longitude: '',
          priority: 0,
          questionDescribe: '',
          sysSource: '',
          title: ''
        },
        formJson: {
          department: '',
          equipment: '',
          dealLevel: '',
          orderPerson: '',
          remark: ''
        },
        templateId: ''
      },
      templateData: null,
      pumpListParams: {
        currentPage: 1,
        keyword: '',
        pageSize: 20
      }
    };
  },
  computed: {
    ...mapState('map', ['center']),
    ...mapState('configure', ['textReplace']),
    ...mapState('dict', {
      orderTypeList: state => state.dictory.template_type || [], //所有工单类型
      orderStatusList: state => state.dictory.ticket_status || [],
      priorityList: state => state.dictory.ticket_priority || []
    }),
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    },
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
    rangeTime: {
      handler(val) {
        this.options.createTimeStart = val[0] ? moment(val[0]).format('YYYY-MM-DD 00:00:00') : '';
        this.options.createTimeEnd = val[1] ? moment(val[1]).format('YYYY-MM-DD 23:59:59') : '';
      },
      immediate: true,
      deep: true
    }
  },
  mounted() {
    window.top.addEventListener('message', this.addIframeListener);
    this.getSelectTypeList();
  },
  beforeDestroy() {
    window.top.removeEventListener('message', this.addIframeListener);
  },
  created() {
    this.$store.dispatch('dict/GenerateDictory');
  },
  activated() {
    if (this.$route.query) {
      // 组织初始化会清空，延后请求
      setTimeout(() => {
        this.options.ticketStatus = this.$route.query.ticketStatus || '';
        this.options.keyword = this.$route.query.pumpName || '';
        if (this.$route.query.pumpId) {
          this.options.pumpId = this.$route.query.pumpId;
        }
        this.getList();
      }, 1000);
    }
    if (this.$route.query.patch === 'true') {
      setTimeout(() => {
        this.handleAdd();
      }, 600);
    }
  },
  methods: {
    ...mapActions('map', ['update_center']),
    //获取工单类型
    async getSelectTypeList() {
      const { success, resultData } = await this.$http.get('/ticket/getListByType/sbbg');
      if (success) {
        this.selectTypeList = resultData;
        this.ticketType = resultData.map(item => item.code);
      }
    },
    addIframeListener({ data }) {
      if (data.type === 'activated' && data.value.currentRoute.includes('manage/orderManage')) {
        if (this.$route.query.patch === 'true') {
          this.handleAdd();
        }
      }
    },
    handleAdd(templateType) {
      this.templateType = templateType;
      this.templateData = {
        id: new Date().valueOf()
      };
      this.$refs.ticketDialog && (this.$refs.ticketDialog.visible = true);
      if (!this.center) {
        // 储存地图中心点
        this.getMapLocation();
      }
    },
    async getMapLocation() {
      let { status, resultData } = await getUserSetting('mapCenter');
      if (status === 'complete' && resultData) {
        if (!resultData.value) return;
        const {
          point: { lat, lng },
          mapLevel
        } = JSON.parse(resultData.value);
        let center = [lat, lng];
        this.update_center(center);
      }
    },
    handleUpdate() {
      this.getList();
    },
    // 分页
    onShowSizeChange(current, pageSize) {
      this.page.current = 1;
      this.page.pageSize = pageSize;
      this.getList();
    },
    changePage(page, pageSize) {
      this.getList();
    },
    // 重置
    handleReset() {
      this.options = {
        keyword: '',
        orderBy: ''
      };
      this.page.current = 1;
      this.page.pageSize = 20;
      this.rangeTime = [];
      this.getList();
    },
    getPriorityName(text) {
      let sName = '--';
      this.priorityList.forEach(item => {
        if (String(text) === item.code) {
          sName = item.name;
        }
      });
      return sName;
    },
    getList() {
      this.tableLoading = true;
      let params = {
        ...this.options,
        typeList: this.ticketType,
        page: {
          current: this.page.current,
          size: this.page.pageSize
        }
      };
      getOrderList(params).then(res => {
        this.tableLoading = false;
        if (res.status === 'complete') {
          this.orderList = res.resultData.records;
          this.page.current = res.resultData.current;
          this.page.pageSize = res.resultData.size;
          this.page.total = res.resultData.total;
        }
      });
    },
    search() {
      this.page.current = 1;
      this.getList();
    },

    showDetail(record) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: record.id
        }
      });
    },
    pumpSearch(val) {
      this.pumpListParams.keyword = val;
      this.pumpListParams.currentPage = 1;
    }
  }
};
</script>

<style lang="less" scoped>
.order-list {
  width: 100%;
  height: 100%;
  /deep/.table-page-list-container {
    // background: #edf0f0;
    .order-flex {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: space-between;
      .order-table {
        // flex: auto;
        // height: 100%;
        // background: #fff;
        // .wpg-table-wrapper {
        //   height: calc(100% - 50px);
        // }
        .wpg-pagination {
          float: right;
          height: 42px;
          margin: 0px;
          padding: 9px 14px;
        }
      }
    }
  }
}
.form-region-select {
  /deep/ .wpg-form-item-control-wrapper {
    align-items: center;
    display: flex;
  }
  /deep/ .wpg-form-item-children {
    display: flex;
    .region-org-tree-container {
      margin-left: 0 !important;
      // height: 28px;
      // overflow: hidden;
      // .wpg-select,
      // .wpg-select-selection {
      //   width: 100% !important;
      //   height: 28px !important;
      //   min-height: 28px !important;
      // }
    }
  }
}

.wpg-calendar-picker {
  width: 100% !important;
}

.more-fun {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  line-height: 40px;
}

.status-item {
  display: inline-block;
  height: 20px;
  width: 56px;
  text-align: center;
  font-size: 12px;
  &.status1 {
    color: var(--supply-color-primary-DEFAULT);
    // color: #4ea6ff;
    border: 1px solid var(--supply-color-border-DEFAULT);
    // border: 1px solid #b4daff;
    background: var(--supply-color-bg-card-light);
    // background: #edf6ff;
  }
  &.status3 {
    // color: #ffd8a8;
    border: 1px solid #ff922b;
    // background: #fff8f0;
    color: var(--supply-color-primary-DEFAULT);
    // border:1px solid var(--supply-color-border-DEFAULT);
    background: var(--supply-color-bg-card-light);
  }
  &.status2 {
    color: #1faaad;
    // border: 1px solid #a6e5e9;
    // background: #ebfafb;
    border: 1px solid var(--supply-color-border-DEFAULT);
    background: var(--supply-color-bg-card-light);
  }
  &.status-1 {
    // color: #969999;
    border: 1px solid #dce0df;
    // background: #f7fafa;
    color: var(--supply-color-primary-DEFAULT);
    // border:1px solid var(--supply-color-border-DEFAULT);
    background: var(--supply-color-bg-card-light);
  }
}

.add-order-popup {
  /deep/.wpg-modal-content {
    .wpg-modal-header {
      padding: 0;
      height: 44px;
      background: #f6f6f6;
      .wpg-modal-title {
        line-height: 44px;
        font-size: 16px;
      }
      &::after {
        display: none;
      }
    }
    .wpg-modal-body {
      padding: 22px 46px 0px 23px;
      .wpg-form {
        .wpg-form-item {
          width: 100%;
          .wpg-form-item-label {
            width: 80px;
          }
          .wpg-form-item-control-wrapper {
            width: calc(100% - 80px);
            .wpg-form-item-control {
              .wpg-form-item-children {
                .upload-file {
                  display: block;
                  width: 100%;
                  height: 146px;
                  margin-top: 8px;
                  overflow: hidden;
                  border: 1px dashed #d6d6d6;
                  .wpg-upload-list {
                    display: none;
                  }
                  .wpg-upload.wpg-upload-select {
                    width: 100%;
                    height: 100%;
                    text-align: center;
                    .wpg-upload {
                      .upload-box {
                        height: 146px;
                        img {
                          margin-top: 24px;
                        }
                        .upload-title {
                          color: #666666;
                          margin: 12px 0;
                        }
                        .upload-sub {
                          color: #969999;
                          font-size: 12px;
                        }
                      }
                    }
                  }
                }
                .wpg-input {
                  height: 28px;
                  border-radius: 1px;
                }
                .wpg-select {
                  .wpg-select-selection {
                    height: 28px;
                    border-radius: 1px;
                    .wpg-select-selection__rendered {
                      line-height: 26px;
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    .wpg-modal-footer {
      padding: 16px 46px 20px 0px;
      div {
        button {
          min-width: 0;
          height: 28px;
          border-radius: 0;
        }
      }
    }
  }
}
.order-table {
  td {
    img {
      vertical-align: middle;
    }
    span {
      vertical-align: middle;
    }
  }
}
</style>
