<!--货架详情--->
<template>
  <div class="baseinfo-keep-l">
    <div class="warehouse-common-top">
      <w-row :gutter="10">
        <w-col class="supply-float-right">
          <div class="f-right">
            <w-button type="primary" class="btn-light" @click="retreat">返回</w-button>
            <w-button type="primary" @click="addShelffBtm">
              <i class="wpgicon icon-ic_add"></i>新建
            </w-button>
          </div>
        </w-col>
      </w-row>
    </div>
    <w-table
      class="shelves-table"
      ref="table"
      :initLoadData="false"
      :columns="ShelfColumns"
      :rowKey="record => record.shelfNo"
      :data-source="ShelfList"
      :pagination="pageData"
      @change="handleTableChange"
      :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
    >
      <template slot="action" slot-scope="txt, row, index">
        <a style="margin-right:12px;" @click="editMaintain(row)">编辑</a>
        <a @click="removeMaintain(row.id, index)">删除</a>
      </template>

      <template slot="depotName" slot-scope="txt, row">
        {{ audit.depotName }}
      </template>
    </w-table>

    <w-modal
      class="secondary-modal"
      :visible="addShelfModel"
      :maskClosable="false"
      width="600px"
      @cancel="cancelAdd"
      @ok="modifyDepotShelf"
      title="货架维护"
    >
      <w-form-model ref="ruleShelf" :model="addShelf" :labelCol="labelColWidth" :rules="ruleShelf">
        <w-form-model-item label="货架号：" prop="shelfNo">
          <w-input v-model="addShelf.shelfNo" placeholder style="width: 300px"></w-input>
        </w-form-model-item>
        <w-form-model-item label="备注：">
          <w-input v-model="addShelf.memo" placeholder style="width: 300px"></w-input>
        </w-form-model-item>
      </w-form-model>
    </w-modal>
  </div>
</template>

<script>
import {
  deleteDepotShelf,
  getDepotShelfList,
  modifyDepotShelf,
  createDepotShelf
} from '@/api/warehouse.js';
export default {
  props: {
    audit: {
      type: Object,
      default: () => {}
    }
  },
  watch: {
    audit: {
      handler(newval, oldval) {
        this.getShelfList();
      }
    }
  },
  name: 'shelfDetail',
  data() {
    return {
      tableLoading: false,
      labelColWidth: {
        span: 5
        // offset: 12
      },
      pageData: {
        pageSize: 10, // 十条
        current: 1
      },
      shelfForm: {
        unit: '',
        placeholder: '',
        source: ''
      },

      addShelfModel: false,
      shelfModelFlag: 0, // 0 是新增 1是编辑
      ShelfColumns: [
        {
          title: '序号',
          align: 'center',
          dataIndex: 'index',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '货架号',
          key: 'shelfNo',
          dataIndex: 'shelfNo',
          tooltip: true
        },
        {
          title: '所属仓库',
          // key: 'depotName',
          key: 'depotId',
          dataIndex: 'depotId',
          scopedSlots: { customRender: 'depotName' },
          tooltip: true
        },
        {
          title: '备注',
          key: 'memo',
          dataIndex: 'memo',
          tooltip: true
        },
        {
          title: '操作',
          slot: 'action',
          scopedSlots: { customRender: 'action' },
          tooltip: true
        }
      ],
      ShelfList: [],
      ShelfLoading: false,
      addShelf: {
        id: '',
        shelfNo: '',
        memo: ''
      },
      ruleShelf: {
        shelfNo: [{ required: true, message: '货架号不能为空', trigger: 'blur' }]
      },
      shelCollapse: false,
      deletingRow: -1
    };
  },
  methods: {
    // 仓库维修 - 获取货架列表
    getShelfList() {
      const vo = {
        depotId: this.audit.id,
        page: {
          current: this.pageData.current,
          size: this.pageData.pageSize
        }
      };
      this.tableLoading = true;
      getDepotShelfList(vo).then(response => {
        this.tableLoading = false;
        this.ShelfList = response.resultData.records;
        const pagination = { ...this.pageData };
        pagination.total = response.resultData.total;
        this.pageData = pagination;
      });
    },
    // 仓库维修 - 新增
    addShelffBtm() {
      this.shelfModelFlag = 0;
      this.addShelf.id = '';
      this.addShelf.shelfNo = '';
      this.addShelf.memo = '';
      this.addShelfModel = true;
    },
    // 仓库维修 - 增改接口
    modifyDepotShelf() {
      this.$refs.ruleShelf.validate(valid => {
        if (valid) {
          const vo = {
            id: this.addShelf.id,
            depotId: this.audit.id,
            shelfNo: this.addShelf.shelfNo,
            memo: this.addShelf.memo
          };
          this.tableLoading = true;
          if (1 === this.shelfModelFlag) {
            modifyDepotShelf(vo).then(response => {
              this.tableLoading = false;
              if (response === 'complete') {
                this.$message.success('操作成功!');
              }
              this.addShelfModel = false;
              this.getShelfList();
            });
          } else {
            createDepotShelf(vo).then(response => {
              this.tableLoading = false;
              if (response === 'complete') {
                this.$message.success('操作成功!');
              }
              this.addShelfModel = false;
              this.getShelfList();
            });
          }
        }
      });
    },
    // 仓库维修 - 弹框取消
    cancelAdd() {
      this.addShelfModel = false;
    },
    // 仓库维修 - 编辑
    editMaintain(row) {
      this.shelfModelFlag = 1;
      // this.tableLoading = true
      // basicInformation.getDepotShelfById(id).then(Response => {
      //   this.tableLoading = false
      this.addShelf.id = row.id;
      this.addShelf.shelfNo = row.shelfNo;
      this.addShelf.memo = row.memo;
      this.addShelfModel = true;
      // })
    },
    // 仓库维修 - 删除
    removeMaintain(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          this.tableLoading = true;
          deleteDepotShelf(id).then(response => {
            this.tableLoading = false;
            if (response.status === 'complete') {
              this.$message.success('删除成功');
              this.deletingRow = -1;
              this.getShelfList();
            }
          });
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    },
    handleTableChange(pagination, filters, sorter) {
      console.log(pagination);
      const pager = { ...this.pageData };
      pager.current = pagination.current;
      this.pageData = pager;
      this.getShelfList();
    },
    retreat() {
      const obj = {
        isform: false,
        tablelist: true
      };
      this.$emit('isShow');
    }
  }
};
</script>

<style lang="less" scoped>
@import '../warehouse-top.less';
.baseinfo-keep-l {
  &.active {
    margin-left: 0;
    opacity: 1;
    transition: all 0.1s linear;
  }
  .btn-light {
    background-color: var(--supply-color-primary-DEFAULT) !important;
    margin-right: 20px;
  }
  .shelves-table {
    flex: 1;
    overflow: hidden;
    background-color: var(--supply-color-bg-card-component);
    border-radius: 4px;
  }
}
</style>
