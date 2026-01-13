<!-- 班组管理 -->
<template>
  <div class="team-manage-view">
    <w-form-table-page>
      <template #form>
        <w-form-header :fields="fields" :model="searchForm" :title="null" :layout="{ labelAuto: true }" :loading="loading" newLine @search="handleSearch" @cancel="handleReset" :neddRetain="false">
          <template #waterPlantId>
            <factory-select class="factory-select" v-model="searchForm.waterPlantId" autoSelect @input="handleSearch" :showAll="showAll"></factory-select>
          </template>
          <template #extra>
            <w-button type="primary" icon="ic_add" @click="handleAdd">新增</w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          showIndex
          :columns="columns"
          :data-source="tableData"
          :page="page"
          :loading="loading"
          @infoEdit="infoEdit"
          @infoDetail="infoDetail"
          @changeSwitch="changeSwitch"
          @changePage="changePage"
          style="height: 100%"
        >
        </w-info-table>
      </template>
    </w-form-table-page>
    <AddFormModel :visible.sync="visible" :title="modelTitle" :modelType="modelType" :AddForm="modalForm" />
    <DetailFormModel :visible.sync="detailVisible" :title="modelTitle" :modelType="modelType" :AddForm="modalForm" />
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select/index';
import AddFormModel from './model/add-form-model';
import DetailFormModel from './model/detail-form-model';
import { columns, fields, res } from './config.js';
import commonMixin from '@/views/Emergency/Practice/components/commonMixin';

export default {
  name: 'TeamManage',
  data() {
    return {
      fields,
      columns,
      res,
      visible: false,
      showAll:true,
      detailVisible: false,
      tableData: [],
      searchForm: {
        delFlag: 0,
        orderBy: '',
        pageFlag: true,
        validFlag: '',
        nameLike: '',
        waterPlantId: undefined
      },
      page: {
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      loading: false,
      modelTitle: '添加班组',
      modelType: 'add',
      modalForm: {}
    };
  },
  mixins: [commonMixin],
  components: { FactorySelect, AddFormModel, DetailFormModel },
  methods: {
    infoEdit(row) {
      if (!row.validFlag) {
        this.$message.error('无效班组');
        return;
      }
      this.modalForm = { ...row };
      let arr = []
      row.crew.split(',').forEach((item,index)=>{
        if(index % 2 === 0) {
          arr.push(row.crew.split(',')[index]+'-'+row.crew.split(',')[index+1])
        }
      })
      this.$set(this.modalForm, 'crews', arr);
      this.modelTitle = '修改班组';
      this.modelType = 'edit';
      this.visible = true;
    },
    infoDetail(row) {
      this.modalForm = { ...row };
      let arr = []
      row.crew.split(',').forEach((item,index)=>{
        if(index % 2 === 0) {
          arr.push(row.crew.split(',')[index]+'-'+row.crew.split(',')[index+1])
        }
      })
      let name = this.factoryName(row.waterPlantId);
      this.$set(this.modalForm, 'crews', arr);
      this.$set(this.modalForm, 'waterPlantName', name);
      this.modelTitle = '查看班组';
      this.modelType = 'check';
      this.detailVisible = true;
    },
    handleAdd() {
      this.modelTitle = '新增班组';
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
      this.getList();
    },
    async getList() {
      this.loading = true;
      try {
        let res = await this.$http.post('/team/list', { ...this.searchForm, ...this.page });
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
    async changeSwitch(checked, row, key) {
      checked ? (row[key] = 1) : (row[key] = 0);
      let postData = { ...row, crews: row.crew.split(',') };
      try {
       let res =  await this.$http.put('/team', postData);
       if(res.status === 'complete') {
         this.$message.success('修改成功');
       }
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
.team-manage-view {
  height: 100%;
}
</style>
