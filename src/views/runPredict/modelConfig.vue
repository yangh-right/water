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
              :showAll="false"
              :autoSelect="true"
              @change="handleSearch"
            ></FactorySelect>
          </template>
          <template #action>
            <div class="supply-flex supply-justify-end">
              <w-button type="primary" icon="ic_add" @click="handleAdd">
                <span>新增模型</span>
              </w-button>
              <w-button icon="ic_autorenew" class="supply-mx-4" :loading="loading" @click="handleReset">
                <span>重置</span>
              </w-button>
              <w-button type="primary" icon="ic_search" @click="handleSearch">
                <span>查询</span>
              </w-button>
            </div>
          </template>
          <template #footer></template>
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
          @handleDelete="handleDelete"
          @handleEdit="handleEdit"
          @changePage="handlePageChange"
        >
          <template #waterPlantId="{ text }">
            <span>{{ getWater(text) }}</span>
          </template>
          <template #modelTypeCode="{ text }">
            <span>{{ modelTypeMap[text] }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail ref="modelEdit" :run-time-obj="runTimeObj" @cancel="closeModal"></config-detail>
  </div>
</template>

<script>
import { sysDictListByCode } from '@/api/manage';
import FactorySelect from '@/components/factory-select/index.vue';
import { headerFields, configColumns as columns, searchForm } from './models/options';
import { cloneDeep } from 'lodash';
import configDetail from './models/runTimeModal';
import { getParamConfiguration, delParamConfiguration } from '@/api/runTime';
export default {
  name: 'ModelConfig',
  components: { configDetail, FactorySelect },
  data() {
    return {
      modelTypeMap: {},
      fields: cloneDeep(headerFields),
      runTimeObj: {
        type: 0,
        modelList: [],
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
    },
  },
  created () {
    this.getModelTypeDict()
  },
  activated() {
    this.handleSearch();
  },

  methods: {
    async getModelTypeDict() {
      const { resultData } = await sysDictListByCode('model_type_code');
      this.runTimeObj.modelList = resultData || [];
      this.runTimeObj.modelList.forEach(item => {
        this.modelTypeMap[item.dictValue] = item.dictName
      })
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    async getModelList() {
      this.loading = true;
      const { resultData } = await getParamConfiguration({ ...this.searchForm, page: this.page });
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
          let res = await delParamConfiguration(row.id);
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
/deep/ .wpg-form-header{
  padding: 8px 24px !important;
}
.model-config {
  width: 100%;
  height: 100%;
}
</style>
