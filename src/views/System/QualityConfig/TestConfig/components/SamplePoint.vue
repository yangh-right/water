<template>
  <div class="full-view testconfig-wrap">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="pointFields"
          :model="searchForm"
          :layout="headerLayout"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
        >
          <template #waterPlantId>
            <factory-select
              autoSelect
              :showAll="!autoSelect"
              v-model="searchForm.waterPlantId"
              @change="getInit"
            ></factory-select>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">
              <span>新增采样点</span>
            </w-button>
            <w-button icon="reload" @click="resetPageChange">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="getList">
              <span>查询</span>
            </w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <div class="full-table-wrap">
          <w-info-table
            v-loading="loading"
            showIndex
            :columns="pointColumns"
            :data-source="data"
            :model="searchForm"
            :page="searchForm"
            :scroll="{ x: 1200 }"
            @changeSwitch="handleSwitchChange"
            @changePage="handlePageChange"
          >
            <template #testQuota="{ text, row }">
              <a v-if="text > 0" @click="showInfo(row)">{{ text }}项</a>
              <span v-else class="wfc2">0</span>
            </template>
            <template #action="{ row }">
              <a @click="handleDelete(row)">删除</a>
              <w-divider type="vertical"></w-divider>
              <a @click="handleEdit(row)">编辑</a>
            </template>
          </w-info-table>
        </div>
      </template>
    </w-form-table-page>
    <AddModal
      mode="Point"
      :title="title"
      :visible.sync="visible"
      :outerForm="form"
      :outerList="data"
      :waterPlantId="searchForm.waterPlantId"
      @getInit="getInit"
    />
    <QuotaAndFrequency :visible.sync="infoVisible" :form="infoForm" />
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select';
import AddModal from '@/views/System/QualityConfig/TestConfig/Modals/AddModal';
import QuotaAndFrequency from '@/views/System/QualityConfig/TestConfig/Modals/QuotaAndFrequency';
import { headerLayout, pointFields, pointColumns } from './config';
import { cloneDeep } from 'lodash-es';
import mixin from './mixin';
export default {
  name: 'SamplePoint',
  components: { FactorySelect, AddModal, QuotaAndFrequency },
  mixins: [mixin],
  data() {
    return {
      // 头部
      headerLayout,
      pointFields: cloneDeep(pointFields),
      // 采样点弹窗
      title: '新增采样点',
      visible: false,
      form: {},
      // 表格
      pointColumns,
      data: [],
      searchForm: {
        waterPlantId: undefined,
        structureIdList: [],
        name: '',
        // 分页
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      page: { size: 20, pages: 1, total: 0 },
      // 化验指标弹窗
      infoVisible: false,
      infoForm: {}
    };
  },
  computed: {
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    },
  },
  activated() {
    this.getInit();
  },
  methods: {
    async getInit() {
      // 水质指标配置页面的跳转
      if (this.$route.query.name) {
        this.searchForm.name = this.$route.query.name;
      }
      await this.getStructuresData();
      await this.getList();
    },
    async getStructuresData() {
      // 清空已选构筑物
      this.searchForm.structureIdList = [];
      let { resultData } = await this.$http.get(
        `/place/getStructureByStationId?waterPlantId=${this.searchForm.waterPlantId}`
      );

      // 只保留构筑物
      resultData = resultData.filter(v => v.type === 0);
      resultData = resultData.map(v => {
        return {
          coding: v.coding,
          id: v.id,
          name: v.name
        };
      });
      this.pointFields[1].attrs.treeData = [
        {
          name: '不限',
          id: this.searchForm.waterPlantId,
          children: resultData
        }
      ];
    },
    async getList() {
      this.loading = true;
      const { resultData } = await this.$http.post('/samplingPoint/list', {
        page: this.page,
        ...this.searchForm
      });

      this.data = resultData.records;
      this.searchForm.total = resultData.total;
      this.page.total = resultData.total;
      this.loading = false;
    },
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.pages = cur;
      this.page.size = size;
      this.getList();
    },
    async resetPageChange() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      this.page.pages = 1;
      this.page.size = 20;
      this.searchForm.structureIdList = [];
      await this.getList();
    },
    handleAdd() {
      this.title = '新增采样点';
      this.visible = true;
      this.form = {};
    },
    handleEdit(row) {
      this.title = '编辑采样点';
      this.visible = true;
      row.locationDict = JSON.stringify({
        locationId: row.locationId,
        locationType: row.locationType
      });
      this.form = row;
    },
    async handleDelete(row) {
      const { resultData: rowFlag } = await this.$http.get(
        `/samplingPoint/getRelationById?id=${row.id}`
      );
      // rowFlag - 0：无地方相关，1：化验工单，2：指标控制标准
      if (rowFlag === 0) {
        this.$confirm({
          title: '您确定要删除该采样点吗？',
          okText: '确定删除',
          cancelText: '取消',
          onOk: async () => {
            row.delFlag = 1;
            await this.$http.post('/samplingPoint/edit', row);
            await this.getList();
          },
          onCancel: () => {}
        });
      } else {
        this.$confirm({
          title:
            rowFlag === 1
              ? '该采样点已被化验工单关联，无法删除'
              : '该采样点已被指标控制标准关联，无法删除',
          cancelButtonProps: { style: { display: 'none' } },
          okButtonProps: { style: { 'margin-left': 0 } },
          okText: '关闭',
          centered: true
        });
      }
    },
    showInfo(row) {
      this.infoVisible = true;
      this.infoForm = row;
    },
    async handleSwitchChange(checked, row) {
      if (checked) {
        row.validFlag = checked;
        await this.$http.post('/samplingPoint/edit', row);
        return;
      }
      const { resultData: rowFlag } = await this.$http.get(
        `/samplingPoint/getRelationById?id=${row.id}`
      );
      // rowFlag - 0：无地方相关，1：化验工单，2：指标控制标准
      if (rowFlag === 0) {
        this.$confirm({
          title: '您确定要禁用该采样点吗？',
          okText: '确定禁用',
          cancelText: '取消',
          onOk: async () => {
            row.validFlag = checked;
            await this.$http.post('/samplingPoint/edit', row);
          },
          onCancel: () => {}
        });
      } else {
        this.$confirm({
          title:
            rowFlag === 1
              ? '该采样点已被化验工单关联，无法禁用'
              : '该采样点已被指标控制标准关联，无法禁用',
          cancelButtonProps: { style: { display: 'none' } },
          okButtonProps: { style: { 'margin-left': 0 } },
          okText: '关闭',
          centered: true
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/switch.less';
@import '/src/views/System/QualityConfig/TestConfig/style/ConfigSheet.less';
</style>
