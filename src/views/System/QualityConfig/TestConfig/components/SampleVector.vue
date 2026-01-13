<template>
  <div class="full-view testconfig-wrap">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="vectorFields"
          :model="searchForm"
          :layout="headerLayout"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
        >
          <template #footer>
            <w-button type="primary" style="margin-left: 8px" icon="ic_add" @click="handleAdd">
              <span>新增采样容器</span>
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
            :columns="vectorColumns"
            :data-source="data"
            :model="searchForm"
            :page="searchForm"
            :scroll="{ x: 1200 }"
            @changeSwitch="handleSwitchChange"
            @changePage="handlePageChange"
          >
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
      mode="Vector"
      :title="title"
      :visible.sync="visible"
      :outerForm="vectorForm"
      :outerList="data"
      @getInit="getInit"
    />
  </div>
</template>

<script>
import AddModal from '@/views/System/QualityConfig/TestConfig/Modals/AddModal';
import { vectorFields, vectorColumns, headerLayout } from './config';
import mixin from './mixin';
export default {
  name: 'SampleVector',
  components: { AddModal },
  mixins: [mixin],
  data() {
    return {
      // 头部
      vectorFields,
      headerLayout,
      // 弹窗
      title: '新增采样容器',
      visible: false,
      vectorForm: {},
      // 表格
      vectorColumns,
      data: [],
      searchForm: {
        keywords: '',
        // 分页
        currentPage: 1,
        pageSize: 20,
        total: 0
      },
      page: { size: 20, pages: 1, total: 0 }
    };
  },
  created() {
    this.vectorFields[0].listeners = { pressEnter: this.getList };
  },
  methods: {
    getInit() {
      this.vectorFields[0].listeners = { pressEnter: this.getList };
      this.getList();
    },
    async getList() {
      this.loading = true;
      const { resultData } = await this.$http.post('/samplingContainer/list', {
        page: this.page,
        ...this.searchForm
      });

      this.data = resultData.records;
      this.searchForm.total = resultData.total;
      this.page.total = resultData.total;
      this.loading = false;
    },
    async resetPageChange() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      this.page.pages = 1;
      this.page.size = 20;
      this.searchForm.keywords = '';
      await this.getList();
    },
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.pages = cur;
      this.page.size = size;
      this.getList();
    },
    handleAdd() {
      this.title = '新增采样容器';
      this.visible = true;
      this.vectorForm = {};
    },
    handleEdit(row) {
      this.title = '编辑采样容器';
      this.visible = true;
      this.vectorForm = row;
    },
    async handleDelete(row) {
      const { resultData: rowFlag } = await this.$http.get(
        `/samplingContainer/getDeleteFlag?id=${row.id}`
      );
      if (rowFlag) {
        // 未被水质指标关联
        this.$confirm({
          title: '删除后无法找回，您确定要删除该容器吗？',
          okText: '确定删除',
          cancelText: '取消',
          onOk: async () => {
            row.delFlag = 1;
            await this.$http.post('/samplingContainer/edit', row);
            await this.getList();
          },
          onCancel: () => {}
        });
      } else {
        // 被水质指标关联
        this.$confirm({
          title: '该容器已被水质指标关联，无法删除',
          cancelButtonProps: { style: { display: 'none' } },
          okButtonProps: { style: { 'margin-left': 0 } },
          okText: '关闭',
          centered: true
        });
      }
    },
    async handleSwitchChange(checked, row) {
      if (checked) {
        row.validFlag = checked;
        await this.$http.post('/samplingContainer/edit', row);
        return;
      }
      const { resultData: rowFlag } = await this.$http.get(
        `/samplingContainer/getDeleteFlag?id=${row.id}`
      );
      if (rowFlag) {
        // 未被水质指标关联
        this.$confirm({
          title: '您确定要禁用该容器吗？',
          okText: '确定禁用',
          cancelText: '取消',
          onOk: async () => {
            row.validFlag = checked;
            await this.$http.post('/samplingContainer/edit', row);
          },
          onCancel: () => {}
        });
      } else {
        // 被水质指标关联
        this.$confirm({
          title: '该容器已被水质指标关联，无法禁用',
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
@import '/src/views/System/QualityConfig/TestConfig/style/ConfigSheet.less';
</style>
