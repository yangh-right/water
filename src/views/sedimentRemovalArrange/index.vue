<template>
  <!-- 仪表管理 -->
  <div class="model-config">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :title="null"
          newLine
          :neddRetain="false"
          :fields="fields"
          :model="searchForm"
          :layout="layout"
          :loading="loading"
        >
          <template #waterPlantId>
            <FactorySelect
              v-model.trim="searchForm.waterPlantId"
              :showAll="true"
              :autoSelect="true"
              @change="handleSearch"
            ></FactorySelect>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">
              <span>新增数据</span>
            </w-button>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
            <return-control :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          style="height: 100%"
          show-index
          :columns="columns"
          :data-source="dataSource"
          :page="searchForm"
          :loading="loading"
          :scroll="{ x: 1000 }"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
          @changePage="handlePageChange"
        >
          <template #bucketId="{ text }">
            <span>{{ sandBucketObj[text] }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail
      ref="modelEdit"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      :sand_bucket="sand_bucket"
      @cancel="closeModal"
    ></config-detail>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import FactorySelect from '@/components/factory-select/index.vue';
import { headerFields, columns, searchForm } from './models/options';
import configDetail from './models/dataRecordModal.vue';
import { getSedimentList, deletePointSediment, getSandBucketList } from '@/api/reportRecord';
export default {
  name: 'ModelConfig',
  components: { FactorySelect, configDetail },
  data() {
    return {
      fields: cloneDeep(headerFields),
      loading: false,
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      runTimeObj: 0,
      rowData: {},
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: [],
      headerFields,
      sand_bucket: [], //砂桶数组
      sandBucketObj: {} //桶对象
    };
  },
  watch: {
    'searchForm.waterPlantId': {
      immediate: true,
      handler: function(newVal, oldVal) {
        if (newVal) {
          this.getSandBucketList();
        }
      }
    }
  },
  mounted() {
    this.handleSearch();
  },
  activated() {
    this.handleSearch();
  },
  methods: {
    //获取砂桶
    async getSandBucketList() {
      const { resultData } = await getSandBucketList({
        waterPlantId: this.searchForm.waterPlantId
      });
      this.sand_bucket = resultData.records.map(item => {
        return {
          label: item.bucketName,
          value: item.id
        };
      });
      this.fields[1].options = this.sand_bucket;
      this.sand_bucket?.map(item => {
        this.sandBucketObj[item.value] = item.label;
      });
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    handleSearchTable() {},
    async getModelList() {
      this.loading = true;
      let params = {
        ...this.searchForm,
        page: this.page
      };
      const { resultData } = await getSedimentList(params);
      this.dataSource = resultData.records;
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.handleSearch();
    },
    handleAdd() {
      this.runTimeObj = 0;
      this.$nextTick(() => {
        if (this.$refs.modelEdit) {
          this.$refs.modelEdit.visible = true;
        }
      });
    },
    async handleDelete(row) {
      this.$confirm({
        title: '提示',
        content: '您确定要删除吗',
        onOk: async () => {
          let res = await deletePointSediment(row.id);
          if (res.status === 'complete') {
            this.$message.success('删除成功');
            this.handleSearch();
          }
        }
      });
    },
    handleEdit(row) {
      this.modalState = true;
      this.runTimeObj = 1;
      this.rowData = row;
      this.$nextTick(() => {
        if (this.$refs.modelEdit) {
          this.$refs.modelEdit.visible = true;
        }
      });
    },
    // 页码change
    handlePageChange(current, pageSize) {
      this.searchForm.currentPage = current;
      this.searchForm.pageSize = pageSize;
      this.page.current = current;
      this.page.size = pageSize;
      this.getModelList();
    },
    closeModal(flag) {
      flag && this.handleSearch();
    }
  }
};
</script>

<style lang="less" scoped>
/deep/.table-warp {
  padding-top: 0px;
}
.model-config {
  width: 100%;
  height: 100%;
}
</style>
