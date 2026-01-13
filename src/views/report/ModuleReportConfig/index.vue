<template>
  <div class="main-content-wrap page-layout-wrap">
    <w-form-header
      class="header-wrap"
      :fields="fields"
      :layout="{ span: 4, wrapperCol: { span: 18 }, labelCol: { span: 6 } }"
      :title="null"
      :model="headerForm"
      :neddRetain="false"
      :loading="searchLoading"
    >
      <template #footer>
        <w-button type="primary" @click="goJumpAdd" icon="ic_add"> 新增报表模板 </w-button>
        <w-button icon="reload" @click="handleReset">
          <span>重置</span>
        </w-button>
        <w-button type="primary" icon="ic_search" @click="handleSearch">
          <span>查询</span>
        </w-button>
      </template>
    </w-form-header>
    <w-info-table
      :columns="columns"
      :dataSource="tableList"
      show-index
      :rowKey="(record, index) => index"
      :loading="tableLoading"
      :page="page"
      :scroll="{ x: 0 }"
      @edit="goJumpEdit"
      @detail="goJumpDetail"
      @del="del"
    >
      <template #waterPlantId="{ text, row, index }">
        <span>{{ getWaterPlantName(text) }}</span>
      </template>
      <template #validFlag="{ text, row, index }">
        <w-switch :checked="text * 1 === 1" @change="handleChangeSwitch(row, index)" />
      </template>
    </w-info-table>
  </div>
</template>
<script>
import formTableMixin from '../models/form-table-mixin';
import { fields, columns } from './config';
import { reportModelList, changeEffective, removeById, createOrUpdate } from '@/api/report';
import { sysDictListByCode } from '@/api/manage';
export default {
  mixins: [formTableMixin],
  data() {
    return {
      fields,
      columns,
      waterPlantsList: [],
      headerForm: {
        waterPlantId: ''
      } // 查询条件
    };
  },
  watch: {
    'headerForm.waterPlantId': {
      handler(val, old) {
        if (val) {
          this.handleSearch();
        }
      },
      immediate: true
    }
  },
  filters: {
    validFlag(val) {
      return Number(val) === 1 ? '是' : '否';
    }
  },
  created() {
    this.fields[0].listeners.change = this.handleSearch;
    this.fields[2].listeners.change = this.handleSearch;
    this.fields[3].listeners.change = this.handleSearch;
  },
  mounted() {
    this.$nextTick(() => {
      this.getSysDictListByCodeType();
      this.getSysDictListByCodeCut();
      this.getFactoryList();
    });
  },
  activated() {
    // this.handleSearch();
  },
  methods: {
    handleReset() {
      this.handlePageReset();
      if (this.waterPlantsList.length > 0) {
        this.headerForm.waterPlantId = this.waterPlantsList[0].id;
      }
      this.getList();
    },
    getWaterPlantName(id) {
      let waterPlantsObj = this.waterPlantsList.find(item => item.id == id);
      return waterPlantsObj ? waterPlantsObj.stationName : '';
    },
    async getFactoryList() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantsList = resultData.map(a => ({ label: a.stationName, value: a.id, ...a }));
      if (Array.isArray(this.waterPlantsList) && this.waterPlantsList.length > 0) {
        this.fields[0].options = this.waterPlantsList;
        this.fields[0].value = this.waterPlantsList[0].id;
        this.headerForm.waterPlantId = this.waterPlantsList[0].id;
      }
    },
    // 获取报表分类字典
    async getSysDictListByCodeType() {
      let { resultData } = await sysDictListByCode('water_report_type');
      let options = resultData.map(a => ({ label: a.dictName, value: a.dictCode }));
      this.fields[2].options = [{ label: '全部', value: '' }, ...options];
    },
    // 获取报表类型字典
    async getSysDictListByCodeCut() {
      let { resultData } = await sysDictListByCode('water_report_form');
      let options = resultData.map(a => ({ label: a.dictName, value: a.dictCode }));
      this.fields[3].options = [{ label: '全部', value: '' }, ...options];
    },
    // 查询列表
    async getList() {
      try {
        this.tableLoading = true;
        const { resultData, count } = await reportModelList({
          ...this.headerForm,
          ...this.page
        });
        this.tableList = [...resultData.records];
        console.log('jjj', this.tableList);
        this.page.total = count;
      } catch (error) {
        this.tableList = [];
        this.page.total = 0;
      } finally {
        this.tableLoading = false;
      }
    },
    // 修改switch
    async handleChangeSwitch(row) {
      if (row.validFlag) {
        await changeEffective({ id: row.id, validFlag: 0 });
        this.$message.success('修改成功');
        this.getList();
      } else {
        await createOrUpdate({ ...row, validFlag: 1 });
        this.$message.success('修改成功');
        this.getList();
      }
    },
    // 删除
    del(row) {
      this.$confirm({
        title: '是否删除',
        onOk: async () => {
          await removeById({
            entityId: row.id
          });
          this.$message.success('删除成功');
          this.getList();
        },
        onCancel() {}
      });
    },
    goJumpAdd() {
      this.goto({
        path: '/report/ModuleReportAddConfig',
        query: {
          id: '',
          type: 'add',
          designName: '',
          designId: ''
        }
      });
    },
    goJumpEdit(record) {
      this.goto({
        path: '/report/ModuleReportAddConfig',
        query: {
          id: record.id,
          waterPlantId: record.waterPlantId,
          designName: record.name,
          designId: record.designId,
          type: 'edit'
        }
      });
    },
    goJumpDetail(record) {
      console.log('record', record);
      this.goto({
        path: '/report/ModuleReportAddConfig',
        query: {
          id: record.id,
          waterPlantId: record.waterPlantId,
          designName: record.name,
          designId: record.designId,
          type: 'detail'
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/switch.less';
.main-content-wrap {
  height: 100%;
  /deep/.wpg-info-table {
    height: calc(100% - 66px);
  }
}
.header-button {
  margin-left: 8px;
}
</style>
