<template>
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
              <w-button
                class="mr_12"
                @click="
                  $refs.portIn.visible = true;
                  importType = 'pump';
                "
                ><w-icon type="import" />导入</w-button
              >
              <w-button class="mr_12 supply-mx-4" @click="handleExport"><w-icon type="export" />导出</w-button>
              <w-button type="primary" icon="ic_add" @click="handleAdd">
                <span>新增模型监测量</span>
              </w-button>
              <w-button icon="ic_autorenew" class="supply-mx-4" @click="handleReset">
                <span>重置</span>
              </w-button>
              <w-button type="primary" icon="ic_search" @click="getModelList">
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
          @changePage="handlePageChange"
          @handleDelete="handleDelete"
          @handleEdit="handleEdit"
        >
          <template #sensitiveData="{ text }">
            <span>{{ text ? '是' : '否' }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail
      ref="modelEdit"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      :structure-list="structureList"
      @cancel="closeModal"
    ></config-detail>
    <port-in ref="portIn" :option="pumpOption" @importSuccess="handleSearch"></port-in>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import { exportFile } from '@/utils/util';
import FactorySelect from '@/components/factory-select/index.vue';
import { fieldsList, columns, searchForm } from './modelMeasureOption';
import configDetail from './modelMeasureModal.vue';
import portIn from '@/components/portinDialog/index.vue';
import {
  getForecastCode,
  deleteForecastCode,
  importForecastCode,
  exportForecastCode
} from '@/api/runTime';
export default {
  name: 'PointConfig',
  components: { FactorySelect, configDetail, portIn },
  data() {
    return {
      fields: cloneDeep(fieldsList),
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
      fieldsList,
      structureList: [],
      runTimeObj: 0,
      rowData: {},
      pumpOption: {
        title: '模型监测量配置导入',
        download: exportForecastCode,
        upload: importForecastCode,
        name: '模型监测量配置模板'
      }
    };
  },
  computed: {},
  watch: {
    'searchForm.waterPlantId': {
      handler(val, old) {
        if (val) {
          this.getOptions();
          this.handleSearch();
        }
      },
      immediate: true
    }
  },
  created() {
    this.getModelList();
  },
  activated() {},

  methods: {
    //获取构筑物列表
    async getOptions() {
      //获取构筑物列表
      try {
        let { resultData: structureList } = await this.$http.post(`/place/list`, {
          currentPage: 1,
          delFlag: 0,
          ids: [],
          orderBy: '',
          page: {
            size: 9999,
            current: 1
          },
          tenantId: '',
          waterPlantIds: [],
          name: '',
          nameLike: '',
          coding: '',
          waterPlantId: this.searchForm.waterPlantId
        });

        this.structureList = structureList.records.map(item => {
          return {
            ...item,
            value: item.id,
            label: item.name
          };
        });
        this.fields[1].options = this.structureList;
      } catch (error) {
        console.log(error);
      }
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    async getModelList() {
      this.loading = true;
      const { resultData } = await getForecastCode({ ...this.searchForm, page: this.page });
      this.dataSource = resultData.records || [];
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
          let res = await deleteForecastCode(row.id);
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
    /* 导出 */
    handleExport() {
      const vo = {
        ...this.searchForm,
        templateFlag: false,
        page: this.page
      };
      exportForecastCode(vo).then(res => {
        exportFile(res, '模型监测量配置资料');
      });
    },
    closeModal(flag) {
      flag && this.handleSearch();
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
