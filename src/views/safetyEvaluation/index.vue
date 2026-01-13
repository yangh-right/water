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
            <w-button type="primary" icon="search" @click="handleSearch">
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
          <template #evaluationType="{ text }">
            <span>{{ evaluationObj[text] }}</span>
          </template>
          <template #placeId="{ text }">
            <span>{{ structureObj[text] }}</span>
          </template>
          <template #l="{ text }">
            <span>{{ frequencyObj[text] }}</span>
          </template>
          <template #s="{ text }">
            <span>{{ consequenceObj[text] }}</span>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-detail
      ref="modelEdit"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      :structureList="structureList"
      :frequencyList="frequencyList"
      :consequenceList="consequenceList"
      @cancel="closeModal"
    ></config-detail>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import FactorySelect from '@/components/factory-select/index.vue';
import { headerFields, columns, searchForm, evaluationObj } from './models/options';
import configDetail from './models/configModel.vue';
import { getSafetyEvaluation, deleteSafetyEvaluation } from '@/api/safetyEvaluation';
import { number } from 'echarts';
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
      structureList: [], //构筑物列表
      structureObj: {}, //构筑物对象
      evaluationObj, //评价对象
      frequencyObj: {}, //发生频率对象
      frequencyList: [], //发生频率下拉选项
      consequenceObj: {}, //后果分析对象
      consequenceList: [] //后果分析下拉选项
    };
  },
  computed: {},
  mounted() {
    this.searchForm.rangeTime = [
      this.$moment()
        .subtract(1, 'month')
        .format('YYYY-MM-DD 00:00:00'),
      this.$moment().format('YYYY-MM-DD 23:59:59')
    ];
    this.getOptions();
    this.handleSearch();
    this.getFrequency();
    this.getConsequence();
  },
  methods: {
    //获取构筑物列表
    async getOptions() {
      try {
        let { resultData: structureList } = await this.$http.post(`/place/list`, {
          currentPage: 1,
          delFlag: 0,
          ids: [],
          orderBy: '',
          pageFlag: false,
          pageSize: 10,
          tenantId: '',
          waterPlantIds: [],
          name: '',
          nameLike: '',
          coding: '',
          waterPlantId: this.searchForm.waterPlantId
        });

        this.structureList = structureList.records.map(item => {
          this.structureObj[item.id] = item.name;
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
    //获取字典-后果分析
    async getConsequence() {
      let { status, resultData } = await this.$http.get(`/sysDict/sysDictListByCode/s`);
      if (status) {
        this.consequenceList = resultData?.map(item => {
          let value = Number(item.dictCode);
          this.consequenceObj[value] = item.dictName;
          return {
            label: item.dictName,
            value: value
          };
        });
      }
    },
    //获取字典-频率
    async getFrequency() {
      let { status, resultData } = await this.$http.get(`/sysDict/sysDictListByCode/l`);
      if (status) {
        this.frequencyList = resultData?.map(item => {
          let value = Number(item.dictCode);
          this.frequencyObj[value] = item.dictName;
          return {
            label: item.dictName,
            value: value
          };
        });
      }
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getModelList();
    },
    async getModelList() {
      this.loading = true;
      let params = {
        ...this.searchForm,
        startDateTime: this.searchForm.rangeTime[0],
        endDateTime: this.searchForm.rangeTime[1],
        page: this.page
      };
      const { resultData } = await getSafetyEvaluation(params);
      this.dataSource = resultData.records || [];
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
          let res = await deleteSafetyEvaluation(row.id);
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
