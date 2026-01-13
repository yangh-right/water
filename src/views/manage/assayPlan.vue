<!--
 * @Description: 运维加护
 * @Author: undefined
 * @Date: undefined
 * @LastEditTime: 2024-07-26 15:42:26
 * @LastEditors:  Do not edit
-->

<template>
  <div class="plan-manage">
    <table-search class="plan-manage-list supply-bg-bg">
      <w-row slot="form" :gutter="20">
        <w-col :span="5">
          <region-or-org-select
            ref="regionOrOrg"
            class="form-region-select"
            :item="{
              label: '选择组织',
              isShowType: false,
              type: 'org',
              ids: options.orgIds
            }"
            @selectChange="handleOrgChange"
            @initLoaded="handleRegionLoaded"
          ></region-or-org-select>
        </w-col>
        <w-col :span="5">
          <w-form-item label="计划状态">
            <w-select v-model="options.activeFlag" placeholder="请选择">
              <w-select-option value="">
                全部
              </w-select-option>
              <w-select-option v-for="item in planStatus" :key="item.code" :value="item.code">
                {{ item.name }}
              </w-select-option>
            </w-select>
          </w-form-item>
        </w-col>
        <w-col :span="5">
          <w-form-item label="计划名称">
            <w-input
              v-model="options.planName"
              placeholder="输入计划名称搜索"
              :maxLength="50"
              allowClear
              @keyup.enter="refresh"
            ></w-input>
          </w-form-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-button
            v-if="buttonCodes['planManageInspectPlanManage_add_order']"
            type="primary"
            @click="addOrder"
            class="supply-mr-3"
          >
            生成工单
          </w-button>
          <w-button
            v-if="buttonCodes['planManageInspectPlanManage_add']"
            type="primary"
            @click="handleAdd"
            class="supply-mr-3"
            icon="plus"
          >
            创建
          </w-button>
          <w-button class="supply-mr-3" @click="handleReset" icon="reload">
            重置
          </w-button>
          <w-button class="supply-mr-3" type="primary" @click="refresh" icon="search">
            查询
          </w-button>
          <return-control
            class="supply-mr-2 supply-ml-5"
            path="/devOps"
            :keep="true"
            :is-drill-down="true"
          ></return-control>
        </w-col>
      </w-row>
      <!-- 计划类型tab -->
      <!-- <w-tabs
        class="supply-bg-bg-card-component"
        slot="tabs"
        @change="callback"
        v-model="activeKey"
      >
        <w-tab-pane v-for="item in planTypeList" :key="item.code" :tab="item.name"></w-tab-pane>
      </w-tabs> -->
      <s-table
        ref="table"
        class="supply-bg-bg-card-component"
        :scroll="{ x: 1500 }"
        :columns="columns"
        :canResize="true"
        :initLoadData="false"
        :rowKey="record => record.id"
        :data="loadData"
      >
        <template slot="activeFlag" slot-scope="text">
          {{ planStatusFormat(text) }}
        </template>
        <template slot="cycleType" slot-scope="text">
          {{ cycleTypeFormat(text) }}
        </template>
        <template slot="totalNum" slot-scope="text, record">
          <a @click="handleNavigate(record)">{{ text }}</a>
        </template>
        <template slot="cycleDay" slot-scope="text, record">
          <w-tooltip>
            <template slot="title">
              {{ cycleDayFormat(text, record.cycleType) }}
            </template>
            <div class="cycle-day">{{ cycleDayFormat(text, record.cycleType) }}</div>
          </w-tooltip>
        </template>
        <template slot="planNo" slot-scope="text, record">
          <span class="plan-no" @click="handlePreview(record)">{{ text }}</span>
        </template>
        <template slot="pumpNum" slot-scope="text, record">
          <span class="pump-num" @click="showPumpDetail(record)">{{ text }}</span>
        </template>
        <template slot="action" slot-scope="text, record">
          <span class="actions">
            <span
              v-if="!record.activeFlag && buttonCodes['planManageInspectPlanManage_edit']"
              style="color:#999;cursor:not-allowed"
            >
              编辑
            </span>
            <a
              v-if="record.activeFlag && buttonCodes['planManageInspectPlanManage_edit']"
              @click="handleEdit(record)"
            >
              编辑
            </a>
            <w-divider type="vertical" />
            <a
              v-if="record.activeFlag && buttonCodes['planManageInspectPlanManage_stop']"
              @click="handleStopOrOpen(record.id, false)"
            >
              停用
            </a>
            <a
              v-else-if="buttonCodes['planManageInspectPlanManage_stop']"
              @click="handleStopOrOpen(record.id, true)"
            >
              启用
            </a>
            <w-divider type="vertical" />
            <a
              v-if="buttonCodes['planManageInspectPlanManage_delete']"
              @click="handleDelete(record)"
              >删除</a
            >
          </span>
        </template>
      </s-table>
    </table-search>

    <!-- 已加入计划污水厂详情弹窗 -->
    <w-modal
      v-model="pumpDetailShow"
      :width="720"
      class="pump-num-detail"
      :title="`查看计划${textReplace}`"
      centered
      :footer="null"
    >
      <pump-detail :list="pumpList"></pump-detail>
    </w-modal>

    <inspection-dialog
      ref="inspectDialog"
      :editType="editType"
      :editable="editable"
      initPlanType="5"
      :inspectData="inspectData"
      :planTypeList="planTypeList"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  getInspectPlanList,
  getInspectPlanListNew,
  inspectStopOrOpen,
  deleteInspectPlan,
  deleteInspectPlanNew,
  stopnspectPlanNew,
  getPumpNumDetail,
  generateTicket
} from '@/api/plan';
import { sysDictListByCode } from '@/api/manage';
import InspectionDialog from '@/views/order/models/InspectionDialog';
import RegionOrOrgSelect from '@/components/SelectRegionOrOrg';

const WEEK_DAYS = ['', '一', '二', '三', '四', '五', '六', '日'];
const CYCLE_TYPE = {
  0: '周',
  '-1': '天',
  1: '月',
  2: '季',
  3: '年',
  9: '周期'
};

export default {
  name: 'assayPlan',
  components: {
    InspectionDialog,
    RegionOrOrgSelect,
    PumpDetail: () => import('@/views/order/models/PumpDetail.vue')
  },

  data() {
    return {
      options: {
        activeFlag: '',
        orgIds: [],
        planName: '',
        planType: '5'
      },
      planType: [],
      planTypeList: [], //计划类型
      planTypeObj: {}, //计划类型
      editable: false,
      editType: 1,
      inspectData: {},
      pumpDetailShow: false,
      pumpList: [],
      activeKey: '1'
    };
  },

  computed: {
    ...mapState('dict', {
      planStatus: state => state.plan_status
    }),
    ...mapState('setting', ['buttonCodes']),
    ...mapState('configure', ['textReplace']),
    columns() {
      let columns = [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          width: 80,
          align: 'center',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '计划编号',
          dataIndex: 'planNo',
          width: 120,
          ellipsis: true,
          scopedSlots: { customRender: 'planNo' }
        },
        {
          title: '计划名称',
          dataIndex: 'planName',
          width: 120,
          ellipsis: true
        },
        {
          title: '计划周期',
          customRender: record => {
            if (record.planType === '1') {
              return `${record.everyCycleTimes}${CYCLE_TYPE[record.cycleType]}${
                record.cycleTimes
              }次`;
            } else {
              let len;
              if (record.cycleType === 9) {
                return '自定义';
              }

              if (record.cycleDay) {
                len = record.cycleDay.split(',').length;
              } else {
                len = 0;
              }
              return `1${CYCLE_TYPE[record.cycleType]}${len}次`;
            }
          },
          width: 100,
          ellipsis: true
        },
        {
          title: '计划时间',
          customRender: record => {
            const sampleNum = `${record.startTime}~${record.endTime}`;
            return sampleNum;
          },
          width: 200,
          ellipsis: true
        },
        {
          title: '计划负责人',
          dataIndex: 'userName',
          width: 100,
          ellipsis: true
        },
        {
          title: '计划描述',
          dataIndex: 'remark',
          width: 100,
          ellipsis: true
        },
        {
          title: '所属组织',
          dataIndex: 'orgName',
          width: 100,
          ellipsis: true
        },
        {
          title: `计划${this.textReplace}数量`,
          dataIndex: 'planPumpNum',
          width: 120,
          ellipsis: true,
          scopedSlots: { customRender: 'pumpNum' }
        },
        {
          title: '计划状态',
          dataIndex: 'activeFlag',
          customRender: record => {
            if (record) {
              return '启用';
            } else {
              return '停用';
            }
          },
          width: 100,
          ellipsis: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          width: 220,
          fixed: 'right'
        }
      ];
      let columns2 = [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          width: 80,
          align: 'center',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '计划编号',
          dataIndex: 'planNo',
          width: 120,
          ellipsis: true,
          scopedSlots: { customRender: 'planNo' }
        },
        {
          title: '计划名称',
          dataIndex: 'planName',
          width: 120,
          ellipsis: true
        },
        {
          title: '计划类型',
          dataIndex: 'planType',
          scopedSlots: { customRender: 'planType' },
          width: 120,
          ellipsis: true
        },
        {
          title: '计划周期',
          customRender: record => {
            if (record.planType === '1') {
              return `${record.everyCycleTimes}${CYCLE_TYPE[record.cycleType]}${
                record.cycleTimes
              }次`;
            } else {
              let len;
              // if (record.cycleType === 9) {
              //   return '自定义';
              // }

              if (record.cycleDay) {
                len = record.cycleDay.split(',').length;
              } else {
                len = 0;
              }
              return `1${CYCLE_TYPE[record.cycleType]}${len}次`;
            }
          },
          width: 100,
          ellipsis: true
        },
        {
          title: '计划时间',
          customRender: record => {
            const sampleNum = `${record.startTime}~${record.endTime}`;
            return sampleNum;
          },
          width: 200,
          ellipsis: true
        },
        {
          title: '计划描述',
          dataIndex: 'remark',
          width: 100,
          ellipsis: true
        },
        {
          title: '所属组织',
          dataIndex: 'orgName',
          width: 100,
          ellipsis: true
        },
        {
          title: `计划${this.textReplace}数量`,
          dataIndex: 'planPumpNum',
          width: 120,
          ellipsis: true,
          scopedSlots: { customRender: 'pumpNum' }
        },
        {
          title: '计划状态',
          dataIndex: 'activeFlag',
          customRender: record => {
            if (record) {
              return '启用';
            } else {
              return '停用';
            }
          },
          width: 100,
          ellipsis: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          width: 220,
          fixed: 'right'
        }
      ];
      if (this.options.planType != 1) {
        return columns2;
      } else {
        return columns;
      }
    }
  },

  created() {
    sysDictListByCode('purification_planType').then(res => {
      if (res.status === 'complete') {
        this.planTypeList = res.resultData?.map(item => {
          this.planTypeObj[item.dictValue] = item.dictName;
          return {
            name: item.dictName,
            value: item.dictCode,
            code: item.dictCode,
            ...item
          };
        });
      }
    });
  },
  activated() {
    // this.options.planType = this.activeKey;
    if (this.$route.query.orgId) {
      this.options.orgIds = [this.$route.query.orgId];
      this.$refs.regionOrOrg.checkedKeys.org = this.options.orgIds;
    } else {
      this.$refs.regionOrOrg.refresh();
    }
    this.refresh();
  },
  mounted() {
    this.refresh(true, false);
  },

  methods: {
    loadData(parameter) {
      const params = {
        ...this.options,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };
      return getInspectPlanListNew(params).then(res => {
        return res.resultData;
      });
      // return getInspectPlanList(params).then(res => {
      //   return res.resultData;
      // });
    },

    refresh(bool = true, flage = true) {
      // if (flage && this.options.orgIds.length <= 0) {
      //   this.$message.info('请至少选择一个组织');
      //   return false;
      // }
      if (this.$refs.table && !this.$refs.table.localLoading && this.pageSearchLoaded) {
        this.$refs.table.refresh(bool);
      }
    },

    // 查询组织/区域范围改变
    handleOrgChange(value) {
      this.options.orgIds = value;
    },

    handleRegionLoaded() {
      this.pageSearchLoaded = true;
      this.refresh();
    },

    handleReset() {
      this.options = {
        activeFlag: '',
        orgIds: [],
        planName: '',
        planType: '5'
      };
      this.$refs.regionOrOrg.refresh(); // 区域组织选择重置
      this.refresh();
      this.activeKey = '1';
    },

    planStatusFormat(status) {
      const item = this.planStatus.find(v => v.code === status);
      return item ? item.name : '--';
    },

    showPumpDetail(record) {
      this.pumpDetailShow = true;
      this.getPumpDetail(record.id);
    },

    getPumpDetail(id) {
      getPumpNumDetail(id).then(res => {
        if (res.status === 'complete') {
          this.pumpList = res.resultData;
        }
      });
    },

    // 计划类型数据字典值
    getPlanTypeList() {
      sysDictListByCode('planType').then(res => {
        if (res.status === 'complete') {
          this.planType = res.resultData;
        }
      });
    },

    cycleTypeFormat(cycleType) {
      return CYCLE_TYPE[cycleType];
    },

    cycleDayFormat(cycleDay, cycleType) {
      let days = cycleDay ? cycleDay.split(',') : [];
      if (cycleType === '0') {
        let ret = days.map(day => {
          return `${day}号`;
        });

        return ret.join(',');
      }

      if (cycleType === '1') {
        let ret = days.map(day => {
          return `周${WEEK_DAYS[day]}`;
        });

        return ret.join(',');
      }

      return days.join(',');
    },

    handleNavigate(record) {
      this.drillDown({
        path: '/order/planManage/taskPerformance',
        query: {
          startDate: record.startDate,
          endDate: record.endDate,
          orgId: record.orgId,
          planType: record.planType
        }
      });
    },

    handleEdit(record) {
      this.editType = 2;
      this.editable = true;
      this.inspectData = record;

      this.$refs.inspectDialog && (this.$refs.inspectDialog.visible = true);
    },

    handlePreview(record) {
      this.editType = 3;
      this.editable = false;
      this.inspectData = record;

      this.$refs.inspectDialog && (this.$refs.inspectDialog.visible = true);
    },

    handleUpdate() {
      this.refresh(false);
    },

    handleAdd() {
      this.editType = 1;
      this.editable = true;
      this.inspectData = {};

      this.$refs.inspectDialog && (this.$refs.inspectDialog.visible = true);
    },

    handleDelete(record) {
      this.$confirm({
        title: '确认要删除此条数据吗？',
        closable: true,
        okText: '删除',
        cancelText: '取消',
        onOk: () => {
          this.delete(record);
        }
      });
    },

    async handleStopOrOpen(id, flag) {
      let res = await stopnspectPlanNew({ id, flag });

      if (res.status === 'complete') {
        this.$message.success(`${flag ? '启用' : '停用'}成功`);
        this.refresh(false);
      }
    },

    async delete(record) {
      let res = await deleteInspectPlanNew(record.id);

      if (res.status === 'complete') {
        this.$message.success('删除成功');
        this.refresh(false);
      } else {
        // this.$message.error(res.errorMessage || '删除失败');
      }
    },

    // 生成工单
    addOrder() {
      generateTicket({}).then(res => {
        if (res.status === 'complete') {
          this.$message.success('生成工单成功');
        } else {
          this.$message.error('生成工单失败，' + res.errorMessage);
        }
      });
    }

    // tabs切换事件回调
    // callback(key) {
    //   if (key) {
    //     this.options.planType = key;
    //     this.refresh();
    //   }
    // }
  }
};
</script>

<style lang="less" scoped>
.plan-manage {
  width: 100%;
  height: 100%;
}

.form-region-select {
  /deep/ .wpg-form-item-control-wrapper {
    align-items: center;
    display: flex;
  }
  /deep/ .wpg-form-item-children {
    display: flex;

    .region-org-tree-container {
      flex: 1;
      margin-left: 0 !important;

      .wpg-select,
      .wpg-select-selection {
        width: 100% !important;
      }
    }
  }
}

.cycle-day {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}
.plan-no,
.pump-num {
  color: var(--supply-color-primary-DEFAULT);
  // color: #008184;
  cursor: pointer;
}
.pump-num-detail {
  /deep/.wpg-modal {
    .wpg-modal-content {
      .wpg-modal-header {
        // background: #f6f6f6;
        background: var(--supply-color-bg-card-component);
        height: 41px;
        padding: 0;
        .wpg-modal-title {
          line-height: 41px;
        }
        &::after {
          display: none;
        }
      }
      .wpg-modal-body {
        padding: 26px 30px;
      }
    }
  }
}
</style>
