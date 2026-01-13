<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :layout="extraLayout"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
        >
          <template #waterPlantId>
            <factory-select
              showAll
              autoSelect
              v-model="searchForm.waterPlantId"
              @change="getList"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">新增成本点</w-button>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <div class="full-table-wrap">
          <w-info-table
            v-loading="loading"
            showIndex
            :columns="columns"
            :data-source="data"
            :model="searchForm"
            :page="searchForm"
            :scroll="{ x: 1200 }"
            @changePage="handlePageChange"
          >
            <template #waterPlantId="{ text }">
              <span :title="factoryName(text)">{{ factoryName(text) }}</span>
            </template>
            <template #calculateType="{ text }">
              <span
                :title="text === '1' ? '成本金额' : '成本消耗'"
                :style="text === '1' ? 'color:red' : ''"
              >
                {{ text === '1' ? '成本金额' : '成本消耗' }}
              </span>
            </template>
            <template #costTypeId="{ text }">
              <span :title="costTypeTitle(text)">{{ costTypeTitle(text) }}</span>
            </template>
            <template #placeId="{ row }">
              <span :title="row.structureName"> {{ row.structureName }}</span>
            </template>
            <template #calculation="{ row }">
              <span :title="row.calculationShowName"> {{ row.calculationShowName }}</span>
            </template>
            <template #action="{ text, row }">
              <a @click="handleDelete(row)">删除</a>
              <w-divider type="vertical"></w-divider>
              <a @click="handleEdit(text, row)">编辑</a>
            </template>
          </w-info-table>
        </div>
      </template>
    </w-form-table-page>
    <AddPoint
      :title="addTitle"
      :visible.sync="addVisible"
      :outerForm="addForm"
      :outerList="data"
      @getList="getList"
    />
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select';
import AddPoint from '@/views/System/CostConfig/components/AddPoint';
import { pointFields, pointColumns } from '../components/config';
import mixin from '../components/mixin';
export default {
  name: 'CostPoint',
  components: { FactorySelect, AddPoint },
  mixins: [mixin],
  props: {},
  data() {
    return {
      // 头部
      fields: pointFields,
      searchForm: {
        waterPlantId: undefined,
        nameLike: '',
        costTypeIds: [],
        // 分页
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      // 表格
      columns: pointColumns,
      data: [],
      // 弹窗
      addTitle: '新增成本点',
      addForm: {},
      addVisible: false
    };
  },
  created() {
    this.fields[2].listeners = { pressEnter: this.handleSearch };
  },
  activated() {
    this.getInit();
  },
  methods: {
    async getInit() {
      if (this.$route.query.costTypeIds && this.$route.query.costTypeIds.length) {
        this.searchForm.costTypeIds = this.$route.query.costTypeIds;
      }
      this.fields[2].listeners = { pressEnter: this.getList };
      await this.getOptions();
      await this.getList();
    },
    async getOptions() {
      const { resultData } = await this.$http.post('/costType/list', { pageFlag: false });
      this.fields[1].attrs.treeData = [
        {
          name: '不限',
          id: '',
          children: resultData.records
        }
      ];
    },
    handleReset() {
      this.searchForm.nameLike = '';
      this.searchForm.costTypeIds = [];
      this.searchForm.currentPage = 1;
      this.searchForm.pagesize = 20;
      this.getList();
    },
    async getList() {
      let { currentPage, pageSize, nameLike } = this.searchForm;
      let params = {
        ...this.searchForm,
        keyword: nameLike,
        page: {
          current: currentPage,
          size: pageSize
        }
      };
      const { resultData } = await this.$http.post('/costPlace/list', params);
      this.data = resultData.records;
      this.searchForm.total = resultData.total;
    },
    handleAdd() {
      this.addTitle = '新增成本点';
      this.addForm = {};
      this.addVisible = true;
    },
    handleEdit(text, row) {
      this.addTitle = '编辑成本点';
      this.addForm = row;
      this.addVisible = true;
    },
    handleDelete(row) {
      this.$confirm({
        title: '删除后该成本点将无法继续应用，且无法找回，您确定要删除该成本点吗？',
        okText: '确定删除',
        cancelText: '取消',
        onOk: async () => {
          await this.$http.delete(`/costPlace?entityId=${row.id}`);
          await this.getList();
        },
        onCancel: () => {}
      });
    },
    // 表格column处理
    factoryName(id) {
      let list = this.$store.state.factoryList;
      return list.length <= 0 ? '' : list.filter(v => v.id === id)[0]?.stationName || '';
    },
    costTypeTitle(id) {
      let res = '';
      let list = this.fields[1].attrs.treeData[0].children;
      for (let item of list) {
        if (item.id === id) {
          res = item.name;
          break;
        }
        for (let child of item.children) {
          if (child.id === id) {
            res = item.name + '-' + child.name;
            break;
          }
        }
      }
      return res;
    }
  }
};
</script>
<style lang="less" scoped></style>
