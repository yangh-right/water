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
            <w-button type="primary" icon="ic_search" :loading="loading" @click="handleSearchTable">
              <span>查询</span>
            </w-button>
            <w-button icon="ic_autorenew" :loading="loading" @click="handleReset">
              <span>重置</span>
            </w-button>
            <!-- <w-button type="primary" icon="ic_add" @click="handleAdd">
                <span>新增模型</span> -->
            <!-- </w-button> -->
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
          @changePage="handlePageChange"
        >
        </w-info-table>
      </template>
    </w-form-table-page>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import FactorySelect from '@/components/factory-select/index.vue';
import { headerFields, measureConfigColumns as columns, searchForm } from './models/options';
import { cloneDeep } from 'lodash';
export default {
  name: 'ModelConfig',
  components: { FactorySelect },
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
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      dataSource: [],
      headerFields
    };
  },
  computed: {
    ...mapState('dict', ['factory_standard', 'national_standard']),
    columns() {
      return columns({
        factory_standard: this.factory_standard,
        national_standard: this.national_standard
      });
    }
  },
  created() {},
  activated() {},

  methods: {
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    handleSearchTable() {},
    async getModelList() {
      // this.loading = true;
      // const { resultData } = await getParamConfiguration({ ...this.searchForm, page: this.page });
      // this.dataSource = resultData.records;
      // this.searchForm.total = resultData.total;
      // this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.handleSearch();
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
/deep/.table-warp {
  padding-top: 0px;
}
.model-config {
  width: 100%;
  height: 100%;
}
</style>
