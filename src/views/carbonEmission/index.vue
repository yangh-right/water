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
          <template #gasType="{ text }">
            <span>{{ text === 0 ? '--' : gasTypeMap[text] }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail
      ref="modelEdit"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      :gasTypeList="gasTypeList"
      :sourceTypeList="sourceTypeList"
      :deviceIdList="deviceIdList"
      @cancel="closeModal"
    ></config-detail>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import FactorySelect from '@/components/factory-select/index.vue';
import { headerFields, columns, searchForm } from './models/options';
import configDetail from './models/dataRecordModal.vue';
import { getCarbonEmission, deleteCarbonEmission } from '@/api/reportRecord';
import { queryList, sysDictListByCode } from '@/api/deviceManagement';
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
      gasTypeList: [],
      sourceTypeList: [],
      deviceIdList: [],
      sourceTypeMap: {},
      gasTypeMap: {}
    };
  },
  computed: {},
  watch: {
    'searchForm.sourceTypeList': {
      handler(val) {
        //当碳排放源为电耗时才显示
        this.fields[3].ifRender = val.includes(2);
      }
    }
  },
  mounted() {
    this.getSysDictListByCode('carbon_emission_source_type', 'sourceType');
    this.getSysDictListByCode('carbon_emission_gas_type', 'gasType');
    this.getDeviceList();
    this.searchForm.rangeTime = [
      this.$moment()
        .subtract(1, 'month')
        .format('YYYY-MM-DD 00:00:00'),
      this.$moment().format('YYYY-MM-DD 23:59:59')
    ];
    this.handleSearch();
  },
  methods: {
    async getSysDictListByCode(code, type) {
      await sysDictListByCode(code).then(res => {
        const fieldToUpdate = this.fields.find(field => field.name === `${type}List`);
        if (fieldToUpdate) {
          fieldToUpdate.options = res.resultData.map(item => {
            this[`${type}Map`][Number(item.dictValue)] = item.dictName;
            return {
              key: Number(item.dictValue),
              label: item.dictName
            };
          });
          this[`${type}List`] = fieldToUpdate.options;
        }
      });
    },
    async getDeviceList() {
      let params = {
        waterPlantId: this.searchForm.waterPlantId,
        page: {
          current: 1,
          size: 1000
        }
      };
      await queryList(params).then(res => {
        this.fields[3].options = res.resultData.records.map(item => {
          return {
            key: item.deviceId,
            label: item.deviceName
          };
        });
        this.deviceIdList = this.fields[3].options;
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
        startDateTime: this.searchForm.rangeTime[0],
        endDateTime: this.searchForm.rangeTime[1],
        page: this.page
      };
      const { resultData } = await getCarbonEmission(params);
      this.dataSource = resultData.records;
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.searchForm.rangeTime = [
        this.$moment()
          .subtract(1, 'month')
          .format('YYYY-MM-DD 00:00:00'),
        this.$moment().format('YYYY-MM-DD 23:59:59')
      ];
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
          let res = await deleteCarbonEmission(row.id);
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
@/api/reportRecord
