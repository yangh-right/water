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
          <w-form-item label="选择污水厂">
            <FactorySelect
              v-model.trim="options.waterPlantId"
              :showAll="false"
              :autoSelect="true"
              @change="refresh"
            ></FactorySelect>
          </w-form-item>
        </w-col>
        <w-col :span="5">
          <w-form-item label="关键字">
            <w-input
              v-model="options.keyword"
              placeholder="输入计划名称/编号"
              :maxLength="50"
              allowClear
              @keyup.enter="refresh"
            ></w-input>
          </w-form-item>
        </w-col>
        <w-col class="supply-float-right">
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
      <!-- 巡检配置类型 -->
      <w-tabs
        class="supply-bg-bg-card-component"
        slot="tabs"
        @change="callback"
        v-model="activeKey"
      >
        <w-tab-pane v-for="item in lineTypeList" :key="item.code" :tab="item.name"></w-tab-pane>
      </w-tabs>
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
        <template slot="action" slot-scope="text, record">
          <span class="actions">
            <a @click="handleEdit(record)">
              编辑
            </a>
            <w-divider type="vertical" />
            <a @click="handleDelete(record)">删除</a>
            <w-divider v-if="activeKey === '2'" type="vertical" />
            <a v-if="activeKey === '2'" @click.stop="handleInspect(record)">巡检项</a>
          </span>
        </template>
      </s-table>
    </table-search>

    <!-- 巡检路线弹窗 -->
    <inspection-line
      ref="inspectionLine"
      :editType="editType"
      :inspectionLineData="inspectionLineData"
      @update="handleUpdate"
    />

    <!-- 巡检点弹窗 -->
    <inspection-point
      ref="inspectionPoint"
      :editType="editType"
      :inspectionPointData="inspectionPointData"
      @update="handleUpdate"
    />
    <!-- 巡检项弹窗 -->
    <InspDetails ref="inspDetails" :editInfo="editInfo" @change="handleUpdate" />
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  getInspectionLinePage,
  deleteInspectionLine,
  getInspectionPointPage,
  deleteInspectionPoint
} from '@/api/plan';
import InspectionLine from './models/InspectionLine';
import InspectionPoint from './models/InspectionPoint';
import InspDetails from './models/InspDetails';
import FactorySelect from '@/components/factory-select/index.vue';

const lineColumns = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    width: 80,
    align: 'center',
    customRender: (text, row, index) => index + 1
  },
  {
    title: '巡检线路编号',
    dataIndex: 'code',
    width: 120,
    ellipsis: true
  },
  {
    title: '巡检名称',
    dataIndex: 'inspectionType',
    width: 160,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 200,
    ellipsis: true
  },
  {
    title: '计划状态',
    dataIndex: 'status',
    customRender: record => (record === 1 ? '启用' : '未启用'),
    width: 120,
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    width: 200
  }
];

const pointColumns = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    width: 80,
    align: 'center',
    customRender: (text, row, index) => index + 1
  },
  {
    title: '净水厂名称',
    dataIndex: 'waterPlantName',
    width: 120,
    ellipsis: true
  },
  {
    title: '构筑物名称',
    dataIndex: 'placeName',
    width: 140,
    ellipsis: true
  },
  {
    title: '巡检点位编号',
    dataIndex: 'inspectionPointCode',
    width: 120,
    ellipsis: true
  },
  {
    title: '巡检点位名称',
    dataIndex: 'inspectionPointName',
    width: 120,
    ellipsis: true
  },
  {
    title: '注意事项',
    dataIndex: 'attention',
    width: 160,
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 200,
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
    width: 200
  }
];

export default {
  components: {
    InspectionLine,
    InspectionPoint,
    InspDetails,
    FactorySelect
  },

  data() {
    return {
      options: {
        waterPlantId: '',
        keyword: ''
      },
      lineTypeList: [
        {
          code: '1',
          name: '巡检路线'
        },
        {
          code: '2',
          name: '巡检点'
        }
      ],
      editType: 1,
      inspectionPointData: {},
      inspectionLineData: {},
      editInfo: {},
      activeKey: '1'
    };
  },
  watch: {
    'options.waterPlantId'(val) {
      if (val) {
        this.refresh(true);
      }
    }
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),
    columns() {
      return this.activeKey === '2' ? pointColumns : lineColumns;
    }
  },

  created() {},
  activated() {
    if (this.$route.query.waterPlantId) {
      this.options.waterPlantId = this.$route.query.waterPlantId;
    }
    this.refresh();
  },
  mounted() {
    this.refresh(true);
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
      if (!params.waterPlantId || params.waterPlantId === '') {
        return;
      }
      const method = this.activeKey === '1' ? getInspectionLinePage : getInspectionPointPage;
      return method(params).then(res => {
        return res.resultData;
      });
    },

    refresh(bool = true) {
      if (this.$refs.table) {
        this.$refs.table.refresh(bool);
      }
    },

    handleReset() {
      this.options.keyword = '';
      this.activeKey = '1';
      this.refresh();
    },

    handleEdit(record) {
      this.editType = 2;
      if (this.activeKey === '1') {
        this.inspectionLineData = record;
        this.$refs.inspectionLine && (this.$refs.inspectionLine.visible = true);
      } else {
        this.inspectionPointData = record;
        this.$refs.inspectionPoint && (this.$refs.inspectionPoint.visible = true);
      }
    },

    handleUpdate() {
      this.refresh(false);
    },

    handleAdd() {
      this.editType = 1;
      if (this.activeKey === '1') {
        this.inspectionLineData = {};
        this.$refs.inspectionLine && (this.$refs.inspectionLine.visible = true);
      } else {
        this.inspectionPointData = {};
        this.$refs.inspectionPoint && (this.$refs.inspectionPoint.visible = true);
      }
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

    handleInspect(record) {
      this.editInfo = record;
      this.$refs.inspectionPoint && (this.$refs.inspDetails.visible = true);
    },
    async delete(record) {
      const method = this.activeKey === '1' ? deleteInspectionLine : deleteInspectionPoint;
      let res = await method(record.id);
      if (res.status === 'complete') {
        this.$message.success('删除成功');
        this.refresh(false);
      }
    },

    // tabs切换事件回调
    callback(key) {
      if (key) {
        this.activeKey = key;
        this.refresh();
      }
    }
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
