<!--
 * @Description: 供应商维护
 * @version:
 * @Author: yuanwenyu
 * @Date: 2021-08-03 09:39:08
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-21 15:42:00
-->
<template>
  <div @click="isPointSelectOpen = false" class="page-wrapper">
    <div class="supply-relative table-box">
      <w-button class="supply-self-end supply-mb-2" type="primary" @click="toAddLine">
        新增线路
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
        :data="getLineList"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="dictName" slot-scope="text, record">
          <w-input v-if="isEdit === record.id" v-model="dictName"></w-input>
          <span v-else>{{ text }}</span>
        </template>
        <template slot="dictCode" slot-scope="text, record">
            <w-input v-if="isEdit === record.id" v-model="dictCode"></w-input>
            <span v-else>{{ text }}</span>
          </template>
        <template slot="dictValue" slot-scope="text, record">
            <w-input v-if="isEdit === record.id" v-model="dictValue"></w-input>
            <span v-else>{{ text }}</span>
          </template>
          <template slot="sort" slot-scope="text, record">
            <w-input v-if="isEdit === record.id" v-model="sort"></w-input>
            <span v-else>{{ text }}</span>
          </template>
        <template slot="action" slot-scope="text, record, index">
          <a v-show="isEdit === record.id" @click="historyAdd(record)">保存</a>
          <w-divider v-show="isEdit === record.id" type="vertical" />
          <a v-show="isEdit === record.id" @click="isEdit = false">取消</a>
          <a v-show="isEdit !== record.id" @click="editPoint(record)">修改</a>
          <w-divider v-show="isEdit !== record.id" type="vertical" />
          <a v-show="isEdit !== record.id" @click="deleteLine(record.id, index)">删除</a>
        </template>
      </s-table>
    </div>
  </div>
</template>
<script>
import { sysDictListByCode ,getSysDictInfo,insertSysDict,updateSysDict,deleteSysDict} from '@/api/manage';
export default {
  name: 'LineEdit',
  data() {
    return {
      dictName: '',
      ifAddPoints: 0,
      isPointSelectOpen: false,
      dictValue: '',
      sort:'',
      dictCode:'',
      isEdit: false,
      parentId:'',//线路字典父级id
      columns: [
        {
          title: '序号',
          dataIndex: 'index',
          width: 110,
          ellipsis: true,
        },
        {
          title: '线路名称',
          dataIndex: 'dictName',
          width: 110,
          ellipsis: true,
          scopedSlots: { customRender: 'dictName' }
        },
        {
          title: '线路编码',
          dataIndex: 'dictCode',
          width: 110,
          ellipsis: true,
          scopedSlots: { customRender: 'dictCode' }
        },
        {
          title: '线路值',
          dataIndex: 'dictValue',
          width: 110,
          ellipsis: true,
          scopedSlots: { customRender: 'dictValue' }
        },
        {
          title: '排序',
          dataIndex: 'sort',
          width: 110,
          ellipsis: true,
          scopedSlots: { customRender: 'sort' }
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          width: 110,
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
  mounted(){
    this.getLineParentId();
  },
  methods: {
    //获取线路字典id
    async getLineParentId() {
         await getSysDictInfo('purification_line').then(res => {
          this.parentId = res.resultData.id;
        });
    },
    //修改
    editPoint(record) {
      this.isPointSelectOpen = false;
      this.isEdit = record.id;
      this.dictValue = record.dictValue;
      this.sort = record.sort;
      this.dictCode = record.dictCode;
      this.dictName = record.dictName;
    },
    //新增
    toAddLine() {
      this.dictValue = '';
      this.sort = '';
      this.dictCode = '';
      this.dictName = '';
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
      if (!this.dictValue) {
        this.$message.error('线路值不能为空');
      } else if (!this.dictName) {
        this.$message.error('线路名称不能为空');
      }else if (!this.dictCode) {
        this.$message.error('线路名称不能为空');
      }else if (!this.sort) {
        this.$message.error('线路排序不能为空');
      } else {
        if (record.id === 'addPoint') {
          this.addLine(record);
        } else {
          this.editLine(record);
        }
      }
    },
    async addLine() {
      this.isEdit = false;
      this.isPointSelectOpen = false;
      let param = {
        activateFlag:1,
        type:1,
        parentId: this.parentId,
        dictValue: this.dictValue,
        sort: this.sort,
        dictCode:this.dictCode,
        dictName: this.dictName
      };
      await insertSysDict(param);
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async getLineList() {
      if (this.ifAddPoints === 1) {
        let tableData = [{ dictName: '', dictValue: '', dictCode: '',sort:'', id: 'addPoint' }, ...this.tableData];
        this.ifAddPoints = 2;
        return { records: tableData, current: 1, size: 1000 };
      } else {
        return await sysDictListByCode('purification_line').then(res => {
          this.isEdit = false;
          this.tableData = [...res.resultData];
          this.$store.commit('dict/SET_LINE_TYPE', res.resultData || []);
          this.ifAddPoints = 0;
          return { records: [...res.resultData], current: 1, size: 1000 };
        });
      }
    },
    async editLine(record) {
      await updateSysDict({
        ...record,
        dictName: this.dictName,
        dictValue: this.dictValue,
        sort: this.sort,
        dictCode: this.dictCode
      });
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async deleteLine(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          if (id !== 'addPoint') {
            await deleteSysDict('purification_line',id);
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
