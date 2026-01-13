<template>
  <div class="system-param supply-h-full">
    <w-row class="supply-h-full supply-flex supply-flex-col">
      <w-col :span="24" class="query-wrapper supply-bg-bg-card-DEFAULT">
        <w-form class="query-form">
          <w-col :span="14" class="supply-float-left">
            <w-form-model-item label="选择日期：" label-for="useFlowTime">
              <w-range-picker :allowClear="false" v-model="useFlowTime" format="YYYY-MM-DD" />
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-item>
              <w-button class="supply-self-end" type="primary" @click="addPoint" icon="plus">
                新增含水率
              </w-button>
              <w-button class="supply-mx-2" @click="handleReset" icon="reload">重置</w-button>
              <w-button type="primary" @click="queryData" icon="search">查询</w-button>
            </w-form-item>
          </w-col>
        </w-form>
      </w-col>
      <w-col :span="24" class="con-wrapper supply-flex-1 supply-bg-bg-card-DEFAULT">
        <s-table
          ref="table"
          class="supply-bg-bg-card-component"
          row-key="addPoint"
          :scroll="{ x: 500 }"
          :columns="columns"
          :data="getHistoryList"
          :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
        >
          <template slot="moistureContent" slot-scope="text, record">
            <w-input-number
              v-if="record.isAdd || record.isEdit"
              v-model="record.moistureContent"
            ></w-input-number>
            <span v-else>{{ text }}</span>
          </template>
          <template slot="createTime" slot-scope="text, record">
            <w-date-picker
              v-if="record.isAdd || record.isEdit"
              v-model="record.createTime"
            ></w-date-picker>
            <span v-else>{{ text }}</span>
          </template>
          <template slot="action" slot-scope="text, record, index">
            <a v-show="record.isAdd || record.isEdit" @click="historyAdd(record)">保存</a>
            <w-divider v-show="record.isAdd || record.isEdit" type="vertical" />
            <a v-show="record.isAdd || record.isEdit" @click="handleCanel(record)">取消</a>

            <a v-show="!record.isAdd && !record.isEdit" @click="editPoint(record)">修改</a>
            <w-divider v-show="!record.isAdd && !record.isEdit" type="vertical" />
            <a v-show="!record.isAdd && !record.isEdit" @click="getHistoryDelete(record.id, index)"
              >删除</a
            >
          </template>
        </s-table>
      </w-col>
    </w-row>
  </div>
</template>
<script>
import {
  getMoistureContent,
  editMoistureContent,
  deleteMoistureContent,
  addMoistureContent
} from '@/api/optimization';
import { mapState, mapMutations } from 'vuex';
export default {
  name: 'moistureContent',
  components: {},
  data() {
    return {
      waterPlantId: '',
      autoSelect: true,
      ifAddPoints: 0,
      tableData: [],
      useFlowTime: [this.$moment().subtract(8, 'days'), this.$moment()],
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          width: 80,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '含水率',
          dataIndex: 'moistureContent',
          width: 130,
          ellipsis: true,
          scopedSlots: { customRender: 'moistureContent' }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 220,
          scopedSlots: { customRender: 'createTime' }
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          width: 130,
          defaultChecked: true,
          scopedSlots: { customRender: 'action' }
        }
      ],
      deletingRow: -1
    };
  },
  mounted() {},
  computed: {
    ...mapState('account', ['user'])
  },
  watch: {
    params(n) {
      if (JSON.stringify(n) !== '{}') {
        if (this.$refs.table) this.$refs.table.refresh(true);
      }
    }
  },
  methods: {
    handleCanel(record) {
      record.isAdd = false;
      record.isEdit = false;
    },
    //修改
    editPoint(record) {
      record.isAdd = false;
      record.isEdit = true;
    },
    handleReset() {
      this.useFlowTime = [this.$moment().subtract(8, 'days'), this.$moment()];
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    queryData() {
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    //新增
    addPoint() {
      if (this.ifAddPoints === 2) {
        this.$message.error('已新增一空白行，请填选并保存');
      } else {
        this.ifAddPoints = 1;
        if (this.$refs.table) this.$refs.table.loadData(true);
      }
    },
    //保存
    async historyAdd(record) {
      if (!record.moistureContent) {
        this.$message.error('请输入净水率');
        return;
      }
      if (!record.createTime) {
        this.$message.error('请选择创建时间');
        return;
      }
      if (record.isAdd) {
        let { moistureContent, createTime } = record;
        await addMoistureContent({
          createTime: this.$moment(createTime).format('YYYY-MM-DD HH:mm:ss'),
          moistureContent
        });
      }
      if (record.isEdit) {
        let { id, moistureContent, createTime } = record;
        await editMoistureContent({
          id,
          createTime,
          createBy: this.user.userId,
          moistureContent
        });
      }
      this.$emit('changeList');
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async getHistoryList() {
      if (this.ifAddPoints === 1) {
        let tableData = [
          {
            moistureContent: '',
            id: undefined,
            isAdd: true,
            isEdit: false,
            addPoint: 'addPoint'
          },
          ...this.tableData
        ];
        this.ifAddPoints = 2;
        return { records: tableData, current: 1, size: 20 };
      } else {
        let params = {
          page: {
            current: 1,
            size: 20
          },
          startTime: this.useFlowTime[0].format('YYYY-MM-DD 00:00:00'),
          endTime: this.useFlowTime[1].format('YYYY-MM-DD 23:59:59')
        };
        return await getMoistureContent(params).then(res => {
          let records = res.resultData.records.map(item => {
            return {
              isAdd: false,
              isEdit: false,
              moistureContent: item.moistureContent,
              id: item.id,
              createBy: item.createBy,
              createTime: item.createTime
            };
          });
          this.tableData = [...records];
          this.ifAddPoints = 0;
          return { ...res.resultData, records: this.tableData };
        });
      }
    },
    async getHistoryDelete(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          if (id !== 'addPoint') {
            let composeList = await deleteMoistureContent(id);
            this.$emit('changeList');
          } else {
            this.ifAddPoints = 0;
          }
          if (this.$refs.table) this.$refs.table.loadData(true);
          this.deletingRow = -1;
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.system-param {
  position: relative;
  /deep/ .wpg-table-title {
    display: none;
  }
  .query-wrapper {
    padding: 8px 0px;
    border-radius: 4px;
    .query-form .wpg-form-item {
      display: flex;
      margin: 0;
      padding: 0 12px;
    }
    .supply-text-right .wpg-form-item {
      display: inline-block;
    }
  }
  .con-wrapper {
    border-radius: 4px;
    margin-top: 10px;
  }
}
</style>
