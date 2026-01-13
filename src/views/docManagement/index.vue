<!--
 * @Description: 
 * @Author: JianYue
 * @Date: 2024-04-10 11:10:07
 * @LastEditTime: 2024-07-25 17:33:52
 * @LastEditors:  Do not edit
-->
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
        <template #placeId="{ text }">
          <span>{{ structureObj[text] }}</span>
        </template>
        <template #riskLevel="{ text }">
          <span>{{ riskLevelObj[text] }}</span>
        </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <config-modal
      ref="modelEdit"
      :structureList="structureList"
      :riskLevelList="riskLevelList"
      :run-time-obj="runTimeObj"
      :row-data="rowData"
      @cancel="closeModal"
    ></config-modal>
  </div>
</template>

<script>
import { cloneDeep } from 'lodash';
import FactorySelect from '@/components/factory-select/index.vue';
import { headerFields,columns, searchForm } from './models/options';
import configModal from './models/configModal.vue';
import { getPage, deleteFile} from '@/api/riskManagement';
import { sysDictListByCode } from '@/api/manage.js'
export default {
  name: 'docManage',
  components: { FactorySelect, configModal },
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
      structureList:[],//构筑物列表
      structureObj:{},//构筑物列表
      riskLevelList:[],//风险等级列表
      riskLevelObj:[],//风险等级列表
      headerFields,
      initWaterPlantId:'',
    };
  },
  computed: {},
  mounted() {
      this.getOptions();
      this.getRiskLevel();
  },
  activated(){
    this.searchForm.rangeTime = [this.$moment().subtract(1, 'month'), this.$moment()];
     this.initWaterPlantId = this.searchForm.waterPlantId;
     this.handleSearch();
  },
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
    }},
    //获取风险等级列表
    async getRiskLevel() {
      let { success, resultData } = await sysDictListByCode('risk_level');
      if (success) {
        this.riskLevelList = resultData.map(item => {
          this.riskLevelObj[item.dictValue] = item.dictName;
          return {
            ...item,
            value: Number(item.dictValue),
            label: item.dictName
          };
        });;
      }
      this.fields[2].options = this.riskLevelList;
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
        page: this.page,
      };
      const { resultData } = await getPage(params);
      this.dataSource = resultData.records;
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.searchForm.rangeTime = [this.$moment().subtract(1, 'month'), this.$moment()];
      this.searchForm.waterPlantId =this.initWaterPlantId;
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
          let res = await deleteFile(row.id);
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
