<!--
 * @Description: 供应商维护
 * @version:
 * @Author: yuanwenyu
 * @Date: 2021-08-03 09:39:08
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-11-10 09:30:11
-->
<template>
  <div @click="isPointSelectOpen = false" class="page-wrapper">
    <div class="supply-relative table-box">
      <w-button class="supply-self-end supply-mb-2" type="primary" @click="toAddSupplier">
        新增供应商
      </w-button>
      <s-table
        :showPagination="false"
        :page-size="10"
        :scroll="{ x: 640 }"
        ref="table"
        style="max-height:350px"
        class="supply-bg-bg-card-component"
        row-key="id"
        :columns="columns"
        :data="getSupplierList"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="code" slot-scope="text, record">
          <w-input v-if="isEdit === record.id" v-model="supplierCode"></w-input>
          <span v-else>{{ text }}</span>
        </template>
        <template slot="name" slot-scope="text, record">
          <w-input v-if="isEdit === record.id" v-model="supplierName"></w-input>
          <span v-if="isEdit !== record.id">{{ text }}</span>
        </template>
        <template slot="delFlag" slot-scope="text, record">
          <w-switch v-model="!record.delFlag" @change="changeDelFlag(record)"></w-switch>
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a v-show="isEdit === record.id" @click="historyAdd(record)">保存</a>
          <w-divider v-show="isEdit === record.id" type="vertical" />
          <a v-show="isEdit === record.id" @click="isEdit = false">取消</a>
          <a v-show="isEdit !== record.id" @click="editPoint(record)">修改</a>
          <w-divider v-show="isEdit !== record.id" type="vertical" />
          <a v-show="isEdit !== record.id" @click="deleteSupplier(record.id, index)">删除</a>
        </template>
      </s-table>
    </div>
  </div>
</template>
<script>
import {
  getSupplierList,
  editSupplier,
  addSupplier,
  deleteSupplier
} from '@/api/warehouse.js';
import { mapState, mapMutations } from 'vuex';
import { exportFile } from '@/utils/util';
export default {
  name: 'SupplierEdit',
  data() {
    return {
      supplierName: '',
      ifAddPoints: 0,
      isPointSelectOpen: false,
      supplierCode: '',
      isEdit: false,
      columns: [
        {
          title: '供应商编码',
          dataIndex: 'code',
          width: 110,
          ellipsis: true,
          scopedSlots: { customRender: 'code' }
        },
        {
          title: '供应商名称',
          dataIndex: 'name',
          width: 210,
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '是否启用',
          dataIndex: 'delFlag',
          width: 70,
          scopedSlots: { customRender: 'delFlag' }
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          width: 80,
          defaultChecked: true,
          scopedSlots: { customRender: 'action' }
        }
      ],
      deletingRow: -1
    };
  },
  watch: {
    params(n) {
      if (JSON.stringify(n) !== '{}') {
        if (this.$refs.table) this.$refs.table.refresh(true);
      }
    },
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.refresh(false, false);
    });
  },
  methods: {
    //修改
    editPoint(record) {
      this.isPointSelectOpen = false;
      this.isEdit = record.id;
      this.supplierCode = record.code;
      this.supplierName = record.name;
    },
    //新增
    toAddSupplier() {
      this.supplierCode = '';
      this.supplierName = '';
      if (this.ifAddPoints === 2) {
        this.$message.error('已新增一空白组合，请填选并保存');
      } else {
        this.ifAddPoints = 1;
        this.isEdit = 'addPoint';
        if (this.$refs.table) this.$refs.table.loadData(true);
      }
    },
    //保存
    async historyAdd(record) {
      if (!this.supplierCode) {
        this.$message.error('供应商编码不能为空');
      } else if (!this.supplierName) {
        this.$message.error('供应商名称不能为空');
      } else {
        if (record.id === 'addPoint') {
          this.addSupplier(record);
        } else {
          this.editSupplier(record);
        }
      }
    },
    async addSupplier() {
      this.isEdit = false;
      this.isPointSelectOpen = false;
      let param = {
        delFlag: false,
        code: this.supplierCode,
        name: this.supplierName,
      };
      await addSupplier(param);
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async getSupplierList() {
      if (this.ifAddPoints === 1) {
        let tableData = [
          { name: '', code: '', id: 'addPoint', delFlag: false },
          ...this.tableData
        ];
        this.ifAddPoints = 2;
        return { records: tableData, current: 1, size: 1000 };
      } else {
        return await getSupplierList({ current: 1, size: 1000 }).then(res => {
          this.isEdit = false;
          this.tableData = [...res.resultData];
          this.ifAddPoints = 0;
          this.$emit('changeSupplierList', res.resultData || [])
          return { records:[...res.resultData], current: 1, size: 1000 };
        });
      }
    },
    async changeDelFlag(record) {
      record.delFlag = !record.delFlag
      if (record.id === 'addPoint') {
        if (!record.delFlag) {
            this.$message.success('启用成功');
          }else {
            this.$message.success('禁用成功');
          }
      } else {
        let res = await editSupplier({
          ...record
        });
        let { status } = res
        if (status === 'complete') {
          if (!record.delFlag) {
            this.$message.success('启用成功');
          }else {
            this.$message.success('禁用成功');
          }
        }
        this.$emit('changeSupplierList', null)
      }
    },
    async editSupplier(record) {
      await editSupplier({
        ...record,
        name: this.supplierName,
        code: this.supplierCode
      });
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async deleteSupplier(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          if (id !== 'addPoint') {
            let composeList = await deleteSupplier(id);
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
    },
  }
};
</script>
<style lang="less" scoped>
@import '@/styles/switch.less';
.compose-content {
  overflow: hidden;
  display: flex;
  max-height: 298px;
  max-width: 266px;
  min-width: 100%;
  flex-direction: column;
  position: absolute;
  right: 0;
  box-shadow: 0 0 15px #a9a9a9;
  background-color: var(--supply-color-bg-select-DEFAULT);
  /deep/ .point-con {
    .point-Multi {
      max-height: 298px;
    }
  }
}
.page-wrapper {
  width: 100%;
  height: 100%;
  /* padding: 8px 20px 20px; */
  display: flex;
  .table-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 30px;
    /* align-items: center; */
    height: 100%;
    .point-compose__select {
    }
    /deep/ .wpg-pagination {
      display: none;
    }
    /deep/ .table-page-search-wrapper {
      padding: 0;
    }
    /deep/ .table-page-list-wrapper {
      margin-top: 0;
    }
    /deep/ .wpg-table-placeholder {
      padding: unset;
    }
  }

  .point-select {
    border: 1px solid #dce0df;
    border-radius: 1px;
    width: 206px;
    background-color: var(--supply-color-bg-select-DEFAULT);
  }
}
</style>
