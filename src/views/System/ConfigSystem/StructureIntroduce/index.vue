<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          newLine
          :model="searchForm"
          :layout="layout"
          :loading="tableLoading"
          :neddRetain="false"
          :title="null"
        >
          <template #waterPlantId>
            <factory-select
              v-model="searchForm.waterPlantId"
              autoSelect
              :showAll="true"
              @input="handleSearch"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="addStructure('addStructure')"
              >新增构筑物介绍</w-button
            >
            <w-button icon="ic_autorenew" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
          </template>
        </w-form-header>
      </template>

      <template #table>
        <div class="content-title wfc2">
          共有<span style="color: #4285f4">{{ count }}</span
          >个构筑物介绍
        </div>
        <w-info-table
          :columns="columns"
          class="tableWidth"
          :data-source="tableData"
          :loading="tableLoading"
          :page="searchForm"
          :scroll="{ x: 1240 }"
          @changePage="handlePageChange"
          :rowKey="id"
        >
          <template #operation="{ row }">
            <template>
              <w-button type="link" size="small" @click.stop="handleEdit(row)">编辑</w-button>
              <w-divider type="vertical" />
              <w-button type="link" size="small" @click.stop="handleDelete(row)">删除</w-button>
            </template>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>

    <ModalStructure
      :processList="processList"
      :type.sync="type"
      :structure="seletedStructure"
      :waterPlantId="searchForm.waterPlantId"
      :title="modalTitle"
      @submit="handleSubmit"
      @cancel="handleCancel"
    ></ModalStructure>
  </div>
</template>
<script>
import { mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index';
import ModalStructure from './components/TheModalStructure.vue';
import { fieldsList, columnsData } from './config';
import { sysDictListByCode } from '@/api/manage';
import { getStructureIntroduce, deleteStructureIntroduce } from '@/api/optimization';

export default {
  name: 'structureConfig',
  components: {
    FactorySelect,
    ModalStructure
  },
  data() {
    return {
      processList: [],
      tableData: [],
      count: 0,
      columns: columnsData,
      layout: {
        colon: true,
        labelAuto: true
      },
      searchForm: { waterPlantId: undefined, pageSize: 10, currentPage: 1, total: 0 },
      page: { size: 10, current: 1, total: 0 },
      fields: fieldsList,
      tableLoading: false,
      type: undefined,
      seletedStructure: undefined
    };
  },
  computed: {
    ...mapState('dict', ['line_list']),
    modalTitle() {
      let dic = {
        addPool: '添加水池',
        editPool: '编辑水池',
        editStructure: '编辑构筑物介绍',
        addStructure: '新增构筑物介绍'
      };
      return dic[this.type];
    }
  },
  created() {
    this.fields[1].listeners.pressEnter = this.handleSearch;
  },
  methods: {
    //点击查询时
    async handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      await this.getStructureList();
    },
    //点击重置
    handleReset() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.searchForm.keyword = '';
      this.getStructureList();
    },
    //获取构筑物列表
    async getStructureList() {
      this.tableData = [];
      try {
        this.tableLoading = true;
        const res = await getStructureIntroduce({
          ...this.searchForm,
          page: this.page
        });
        //处理表格数据
        this.tableData = res.resultData.records;
        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
        this.count = res.resultData.total;
      } catch (error) {
        console.log(error);
        this.count = 0;
      } finally {
        this.tableLoading = false;
      }
    },
    //分页
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.current = cur;
      this.page.size = size;
      this.getStructureList();
    },
    //添加构筑物
    addStructure(type) {
      this.type = type;
      this.seletedStructure = null;
    },
    //删除
    async handleDelete(data) {
      try {
        this.$confirm({
          title: '确定删除吗?',
          okText: '确定',
          cancelText: '取消',
          onOk: async () => {
            let res = await deleteStructureIntroduce(data.id);
            if (res.status === 'complete') {
              this.getStructureList();
              this.$message.success('删除成功');
            }
          }
        });
      } catch (error) {
        console.log(error);
      }
    },
    //编辑
    handleEdit(data) {
      this.type = 'editStructure';
      this.seletedStructure = data;
    },
    // 提交模态框
    async handleSubmit(type, flag) {
      try {
        this.getStructureList();
        this.type = '';
      } catch (error) {
        console.log(error);
      }
    },
    //取消模态框
    handleCancel() {
      this.getStructureList();
    },
    rowKey(record) {
      if (record?.children?.length) {
        return record.key;
      } else {
        return record.id;
      }
    }
  }
};
</script>
<style lang="less" scoped>
/deep/.wpg-form-header .wpg-info-form .wpg-form-item {
  margin-bottom: 0;
}
.wpg-info-form-footer .reset + button {
  margin-left: 24px !important;
}
.content {
  &-title {
    padding: 4px 24px 16px 24px;
    &-count {
      color: #8f40ff;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: Regular;
    }
  }
}
.tableWidth {
  height: calc(100% - 41px);
}
/deep/ .wpg-table-thead > tr > th:first-child {
  padding-left: 24px;
}
/deep/ .wpg-table-tbody > tr > td {
  position: relative;
}
/deep/ .wpg-table-tbody > tr > td:first-child {
  padding-left: 24px;
}
/deep/ .wpg-btn-sm {
  padding: 0;
}
</style>
