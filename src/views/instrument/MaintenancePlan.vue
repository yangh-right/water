<template>
  <div class="plan-manage">
    <table-search class="plan-manage-list supply-bg-bg">
      <w-row slot="form" :gutter="20">
        <w-col :span="6">
          <w-form-item label="选择污水厂">
            <factory-select
              class="factory-select"
              v-model="options.waterPlantId"
              autoSelect
              @input="handleSearch"
              :showAll="showAll"
            ></factory-select>
          </w-form-item>
        </w-col>
        <w-col :span="6">
          <w-form-item label="设备">
            <w-select
              v-model="options.deviceId"
              :options="deviceList"
              placeholder="请选择设备"
            ></w-select>
          </w-form-item>
        </w-col>
        <w-col :span="6">
          <w-form-item label="保养类型">
            <w-select
              v-model="options.operateType"
              :options="operateTypeList"
              placeholder="请选择保养类型"
            ></w-select>
          </w-form-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-button type="primary" @click="handleAdd" icon="plus">新增</w-button>
          <w-button class="supply-mx-3" @click="handleReset" icon="reload">重置</w-button>
          <w-button type="primary" @click="refresh('clearQuery')" icon="search">查询</w-button>
        </w-col>
        <w-col class="supply-float-left table-page-search-submitButtons">
          <return-control
            class="supply-mr-2 supply-ml-5"
            path="/devOps"
            :keep="true"
            :is-drill-down="true"
          ></return-control>
        </w-col>
      </w-row>
      <s-table
        ref="table"
        class="supply-bg-bg-card-component inspect-table"
        :scroll="{ x: 1500 }"
        :columns="columns"
        :canResize="true"
        :initLoadData="false"
        rowKey="id"
        :data="loadData"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="deviceId" slot-scope="text">
          <span>{{
            deviceList.length > 1 ? deviceList.find(item => item.value === text).label : ''
          }}</span>
        </template>
        <template slot="action" slot-scope="text, record">
          <span class="actions">
            <a @click="handleEdit(record)">编辑</a>
            <w-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
          </span>
        </template>
      </s-table>
    </table-search>

    <inspect-dialog
      ref="inspectDialog"
      :editType="editType"
      :inspectData="inspectData"
      :operateList="operateTypeList"
      @update="handleUpdate"
    />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import { ticketPlanConfig, ticketPlanDelete } from '@/api/plan';
import { queryList, sysDictListByCode } from '@/api/deviceManagement';
import InspectDialog from './components/InspectDialog';
import FactorySelect from '@/components/factory-select/index';
export default {
  components: {
    InspectDialog,
    FactorySelect
  },
  data() {
    return {
      showAll: true,
      options: {
        waterPlantId: '',
        smallType: 'ybby',
        deviceId: '',
        operateType: ''
      },
      editType: 1,
      inspectData: {},
      deletingRow: -1,
      deviceList: [], // 设备列表
      operateTypeList: [], // 保养类型数据字典
      pumpList: []
    };
  },

  computed: {
    ...mapState('setting', ['buttonCodes']),
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
          title: '污水厂名称',
          dataIndex: 'waterPlantName',
          width: 100,
          ellipsis: true
        },
        {
          title: '设备名称',
          dataIndex: 'deviceId',
          width: 160,
          ellipsis: true,
          scopedSlots: { customRender: 'deviceId' }
        },
        {
          title: '保养人员',
          dataIndex: 'transactorName',
          width: 140,
          ellipsis: true
        },
        {
          title: '保养日期',
          dataIndex: 'cycleDay',
          customRender: text => {
            return text ? `每月${text}号` : '';
          },
          width: 180,
          ellipsis: true
        },
        {
          title: '周期内保养次数(按月)',
          dataIndex: 'cycleTimes',
          customRender: text => {
            return text ? `每月${text}次` : '';
          },
          width: 180,
          ellipsis: true
        },
        {
          title: '保养类型',
          dataIndex: 'operateTypeName',
          width: 180,
          ellipsis: true
        },
        {
          title: '下次保养日期',
          dataIndex: 'nextOperateDate',
          width: 180,
          ellipsis: true
        },
        {
          title: '更新人',
          dataIndex: 'updateBy',
          width: 180,
          ellipsis: true
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          width: 180,
          ellipsis: true
        },
        {
          title: '创建人',
          dataIndex: 'createBy',
          width: 180,
          ellipsis: true
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 180,
          ellipsis: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' },
          width: 120,
          fixed: 'right'
        }
      ];
      return columns;
    }
  },
  activated() {
    this.refresh();
  },
  mounted() {
    this.init();
  },

  methods: {
    init() {
      Promise.allSettled([this.getDeviceList(), this.getOperateTypeList()]).then(() => {
        this.pageSearchLoaded = true;
        this.refresh(true, false);
      });
    },
    loadData(parameter) {
      const params = {
        ...this.options,
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        }
      };
      return ticketPlanConfig(params).then(res => {
        this.pumpList = res.resultData?.records || [];
        return res.resultData;
      });
    },
    handleSearch() {
      this.init();
    },
    refresh(bool = true) {
      // 点击查询/重置 清空路由参数

      if (bool === 'clearQuery') {
        bool = true;
        this.$router.push({});
      }
      if (this.$refs.table && !this.$refs.table.localLoading && this.pageSearchLoaded) {
        this.$refs.table.refresh(bool);
      }
    },
    // 删除
    handleDelete(data) {
      this.$confirm({
        title: '您确定要删除该条计划吗？',
        okText: '确定删除',
        cancelText: '取消',
        onCancel: () => {},
        onOk: () => {
          this.deleteById(data.id);
        }
      });
    },
    async deleteById(id) {
      let res = await ticketPlanDelete(id);
      let { status, resultData, errorMessage } = res;
      if (status === 'complete') {
        this.$message.success('删除成功');
        this.refresh();
      }
    },
    handleReset() {
      this.options = {
        waterPlantId: '',
        smallType: 'ybby',
        deviceId: '',
        operateType: ''
      };
      this.refresh();
    },

    handleEdit(record) {
      this.inspectData = record;
      this.editType = 2;
      this.$refs.inspectDialog && (this.$refs.inspectDialog.visible = true);
    },
    handleAdd() {
      this.inspectData = {};
      this.editType = 1;
      this.$refs.inspectDialog && (this.$refs.inspectDialog.visible = true);
    },
    handleUpdate() {
      this.refresh(false);
    },

    /** 设备列表 */
    async getDeviceList() {
      let params = {
        deviceParentType: 'purification_Y',
        waterPlantId: this.options.waterPlantId
      };
      let { status, resultData } = await queryList(params);
      if (status === 'complete') {
        let list = resultData.records.map(v => {
          return {
            label: v.deviceName,
            value: v.deviceId
          };
        });
        this.deviceList = [{ label: '全部', value: '' }].concat(list);
      }
    },
    /** 保养类型数据字典 */
    async getOperateTypeList() {
      let { status, resultData } = await sysDictListByCode('instrument_maintenance_type');
      if (status === 'complete') {
        let list = resultData.map(v => {
          return {
            label: v.dictName,
            value: v.dictValue
          };
        });
        this.operateTypeList = [{ label: '全部', value: '' }].concat(list);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.plan-manage {
  width: 100%;
  height: 100%;
  .inspect-table /deep/ .supply-pro-table-title__toolbar {
    justify-content: space-between;
    width: 100%;
  }
  &-list {
    .wpg-calendar-picker {
      width: 100%;
    }
  }
}
.historyModal {
  /deep/.wpg-modal-body {
    height: calc(100vh - 200px);
  }
  /deep/ .wpg-form-item {
    display: flex !important;
    width: 100%;
    .wpg-form-item-label {
      flex-shrink: 0;
    }
    .wpg-form-item-control-wrapper {
      flex: 1 1 auto;
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
        background-color: var(--supply-color-bg-card-dark);
        padding: 12px 4px;
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
