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
            <w-button type="primary" icon="ic_search" :loading="loading" @click="handleSearch">
              <span>查询</span>
            </w-button>
            <w-button class="supply-ml-3" @click="handleReset">
              重置
            </w-button>
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
          :scroll="{ x: 850 }"
          @handleDelete="handleDelete"
          @changePage="handlePageChange"
        >
          <template #waterPlantId="{ text }">
            <span>{{ getWater(text) }}</span>
          </template>
          <template #optionName="{ row, text }">
            <a class="supply-cursor-pointer" :title="text" @click="toPredict(row)">{{ text }}</a>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail ref="modelEdit" :run-time-obj="runTimeObj" @cancel="closeModal"></config-detail>
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select/index.vue';
import { headerFields, schemeColumns as columns, searchForm } from './models/options';
import { cloneDeep } from 'lodash';
import configDetail from './models/runTimeModal';
import { getPollingResult, delPollingResult } from '@/api/runTime';
export default {
  name: 'ModelScheme',
  components: { configDetail, FactorySelect },
  data() {
    return {
      fields: cloneDeep(headerFields),
      runTimeObj: {
        type: 0,
        deviceBigTypeList: [],
        brandList: []
      },
      isCommonScreen: true,
      loading: false,
      layout: {
        colon: true, // 冒号
        span: 8,
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: [],
      headerFields
    };
  },
  computed: {
    getWater() {
      return val => {
        return this.$store.state.factoryMap[val]?.stationName || '--';
      };
    }
  },

  activated() {
    this.handleSearch();
  },
  methods: {
    toPredict(row) {
      let { paramId, modelId, waterPlantId, id, optionName } = row;
      this.drillDown({
        path: '/runPredict',
        query: { modelId, optionName, predictionId: row.paramId, waterPlantId, schemeId: id }
      });
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    async getModelList() {
      this.loading = true;
      const { resultData } = await getPollingResult({ ...this.searchForm, page: this.page });
      this.dataSource = resultData.records;
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.handleSearch();
    },
    closeModal(flag) {
      flag && this.handleSearch();
    },
    handleAdd() {
      this.runTimeObj = {
        ...this.runTimeObj,
        type: 0,
        obj: ''
      };
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
          let res = await delPollingResult(row.id);
          if (res.status === 'complete') {
            this.$message.success('删除成功');
            this.handleSearch();
          }
        }
      });
    },
    handleEdit(row) {
      this.modalState = true;
      this.runTimeObj = {
        ...this.runTimeObj,
        type: 1,
        obj: row
      };
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
    }
  }
};
</script>

<style lang="less" scoped>
.model-config {
  width: 100%;
  height: 100%;
}
</style>
