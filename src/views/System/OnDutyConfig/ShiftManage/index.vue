<!-- 班次管理 -->
<template>
  <div class="shift-manage-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :title="null"
          :layout="{ labelAuto: true }"
          :loading="loading"
          newLine
          :neddRetain="false"
        >
          <template #waterPlantId>
            <factory-select
              class="factory-select"
              v-model="searchForm.waterPlantId"
              autoSelect
              @input="handleSearch"
              :showAll="showAll"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">新增</w-button>
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
          :columns="columns"
          :data-source="tableData"
          :page="page"
          :loading="loading"
          showIndex
          @infoEdit="infoEdit"
          @infoDetail="infoDetail"
          @changeSwitch="changeSwitch"
          @changePage="changePage"
          style="height: 100%"
        >
          <template #startTime="{ row }">
            <span>{{ row.startTime | formatTime }} - {{ row.endTime | formatTime }}</span>
          </template>
          <template #teamId="{ row }">
            <span>{{ getTeamName(row.teamId) }}</span>
          </template>
          <template #color="{ text }">
            <div class="colorBlock" :style="{ backgroundColor: text }"></div>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
    <AddFormModel
      ref="shift-model"
      :visible.sync="visible"
      :title="modelTitle"
      :translateData="translateData"
      :modelType="modelType"
      :AddForm="modalForm"
    />
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select/index';
import AddFormModel from './model/add-form-model';
import { columns, fields, res } from './config.js';
import commonMixin from '@/views/Emergency/Practice/components/commonMixin';

export default {
  name: 'ShiftManage',
  data() {
    return {
      fields,
      res,
      columns,
      tableData: [],
      visible: false,
      showAll: false,
      searchForm: {
        delFlag: 0,
        orderBy: '',
        pageFlag: true,
        tenantId: '',
        validFlag: '',
        nameLike: '',
        waterPlantId: '',
        teamId: ''
      },
      page: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      loading: false,
      modelTitle: '添加班次',
      modelType: 'add',
      translateData: [],
      modalForm: {}
    };
  },
  filters: {
    formatTime(val) {
      return val.substring(0, 5);
    }
  },
  components: { FactorySelect, AddFormModel },
  mixins: [commonMixin],
  created() {
    this.getTranslateList();
  },
  methods: {
    async getTranslateList() {
      try {
        let res = await this.$http.post('/team/list', { currentPage: 1, pageSize: 999 });
        this.translateData = res.resultData.records;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    getTeamName(teamId) {
      let teamGrounp = this.translateData.find(item => item.id == teamId);
      return teamGrounp ? teamGrounp.name : '';
    },
    handleAdd() {
      this.modelTitle = '新增班次';
      this.modelType = 'add';
      this.modalForm = {};
      this.visible = true;
    },
    handleSearch() {
      this.page.currentPage = 1;
      this.getList();
    },
    handleReset() {
      this.page.currentPage = 1;
      this.page.pageSize = 20;
      this.searchForm.nameLike = '';
      this.getList();
    },
    async getList() {
      this.loading = true;
      try {
        let res = await this.$http.post('/shift/list', { ...this.searchForm, ...this.page });
        this.page.total = res.count;
        this.tableData = res.resultData.records;
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    changePage(current, pageSize) {
      this.page.currentPage = current;
      this.page.pageSize = pageSize;
      this.getList();
    },
    infoEdit(row) {
      if (!row.validFlag) {
        this.$message.error('无效班次');
        return;
      }
      let startTime = this.$moment(this.$moment().format('YYYY-MM-DD') + ' ' + row.startTime);
      let endTime = this.$moment(this.$moment().format('YYYY-MM-DD') + ' ' + row.endTime);
      this.modalForm = { ...row, startTime, endTime };
      this.modelTitle = '修改班次';
      this.modelType = 'edit';
      this.visible = true;
    },
    infoDetail(row) {
      let name = this.factoryName(row.waterPlantId);
      this.modalForm = { ...row };
      this.$set(this.modalForm, 'waterPlantName', name);
      this.modelTitle = '查看班次';
      this.modelType = 'check';
      this.visible = true;
    },
    async changeSwitch(checked, row, key) {
      checked ? (row[key] = 1) : (row[key] = 0);
      try {
        await this.$http.put('/shift', row);
        this.$message.success('修改成功');
      } catch (e) {
        console.log(e);
      } finally {
        this.getList();
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/styles/switch.less';
.shift-manage-view {
  height: 100%;
}
.colorBlock {
  width: 30px;
  height: 20px;
  border-radius: 4px;
}
</style>
