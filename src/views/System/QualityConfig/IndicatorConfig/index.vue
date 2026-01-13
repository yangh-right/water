<template>
  <div class="full-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :title="null"
          :layout="layout"
          :loading="tableLoading"
          :neddRetain="false"
          newLine
        >
          <template #footer>
            <w-button type="primary" icon="ic_add" @click="handleAdd">新增指标</w-button>
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
          :columns="columns"
          :data-source="tableData"
          :loading="tableLoading"
          :page="searchForm"
          :scroll="{ x: 1500 }"
          showIndex
          @changePage="handlePageChange"
          @delete="handleDelete"
          @edit="handleEdit"
          @jumpStandard="handleJumpStandard"
          @jumpPoint="handleJumpPoint"
          @changeSwitch="handleSwitch"
        >
          <template #range="{ row }">
            <span v-if="row.dataType === 1 && !['bt', 'nb'].includes(row.opt)">
              {{ operatorsDict[row.opt] }}{{ row.value }}
            </span>
            <span v-else-if="row.dataType === 1 && ['bt', 'nb'].includes(row.opt)">
              {{ operatorsDict[row.opt] }}{{ row.rangeMin }}~{{ row.rangeMax }}
            </span>

            <w-tooltip v-else>
              <template slot="title">
                {{ row.range }}
              </template>
              <span class="optionText">
                选项
                <span class="wfc2">（{{ row.range }}）</span>
              </span>
            </w-tooltip>
          </template>
          <template #methods="{ row }">
            <a v-for="(item, i) in row.methodList" :key="item.id" @click="openPreview(item)"
              ><a v-if="i !== 0">，</a>{{ item.name }}</a
            >
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>

    <preview ref="preview"> </preview>
    <Modal
      :type="type"
      :indicatorObj="selectedIndicatorObj"
      @submit="handleSubmit"
      @cancel="handleCancel"
    ></Modal>
  </div>
</template>

<script>
import Modal from './components/TheModal.vue';
import preview from './components/ThePreview.vue';
import { fieldsList, columns, operators } from './config.js';
export default {
  name: 'indicatorConfig',
  components: {
    Modal,
    preview
  },
  data() {
    return {
      //头部表单参数
      searchForm: { nameLike: undefined, pageSize: 20, currentPage: 1, total: 0 },
      page: { size: 20, pages: 1, total: 0 },
      fields: fieldsList,
      layout: {
        colon: true,
        labelAuto: true
        // gutter: [12, 8],
      },

      //表格参数
      columns: columns,
      tableData: [],
      tableLoading: false,

      //模态框相关参数
      type: undefined, //编辑或者删除并控制模态框的显隐
      selectedIndicatorObj: undefined // 传入模态框的指标信息 新增时为undefined
    };
  },
  computed: {
    operatorsDict() {
      let temp = {};
      operators.forEach(item => {
        temp[[item.key]] = item.label;
      });
      return temp;
    }
  },
  mounted() {
    this.fields[0].listeners.pressEnter = this.handleSearch;
    this.getTableList();
  },
  methods: {
    //获取表格列表
    async getTableList() {
      try {
        this.tableLoading = true;
        let res = await this.$http.post(`/waterIndex/page`, {
          name: '',
          tenantId: '',
          delFlag: 0,
          orderBy: '',
          pageFlag: true,
          ...this.searchForm,
          page: this.page
        });

        this.tableData = res.resultData.records;
        this.searchForm.total = res.resultData.total;
        this.page.total = res.resultData.total;
      } catch (error) {
        this.$message.error(error);
      } finally {
        this.tableLoading = false;
      }
    },

    //头部表单操作
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.pages = 1;
      this.getTableList();
    },
    handleReset() {
      this.searchForm.pageSize = 20;
      this.searchForm.nameLike = '';
      this.page.size = 20;
      this.handleSearch();
    },
    handleAdd() {
      this.type = 'add';
      this.selectedIndicatorObj = undefined;
    },
    //表格操作
    handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      this.page.pages = cur;
      this.page.size = size;
      this.getTableList();
    },
    async handleDelete(row) {
      console.log('handleDelete ', row);
      // let msg = await this.getIfDeleteOrDisable(row.id);
      // if (msg) {
      //   this.$confirm({
      //     title: `${msg}无法删除`,
      //     cancelButtonProps: { style: { display: 'none' } },
      //     okButtonProps: { style: { 'margin-left': 0 } },
      //     okText: '关闭',
      //     centered: true
      //   });
      // } else {
      this.$confirm({
        title: '删除后无法找回，您确定要删除该水质指标吗？',
        okText: '删除指标',
        cancelText: '取消',
        centered: true,
        onOk: async () => {
          row.delFlag = 1;
          await this.deleteIndicator(row);
        }
      });
      // }
    },
    async deleteIndicator(data) {
      try {
        await this.$http.delete(`/waterIndex/delete/${data.id}`);
        this.getTableList();
        this.$message.success('删除成功');
      } catch (error) {
        console.log(error);
      }
    },
    handleEdit(row) {
      this.type = 'edit';
      this.selectedIndicatorObj = row;
    },
    handleJumpStandard(row) {
      this.goto({
        path: '/System/QualityConfig/IndicatorStandard',
        query: { indexIds: `${row.id}` }
      });
    },
    //跳转 采样点 暂时不做
    handleJumpPoint(row) {
      // this.goto({
      //   path: " /System/QualityConfig/TestConfig",
      //   query: { name: `${row.indicatorName}` },
      // });
      console.log('跳转采样点', row);
    },
    async handleSwitch(checked, row) {
      //禁用->启动
      if (checked) {
        row.validFlag = checked ? 1 : 0;
        await this.postEditInfo(row);
      }
      //启动->禁用
      else {
        let msg = await this.getIfDeleteOrDisable(row.id);
        //无法禁用的情况
        if (msg) {
          this.$confirm({
            title: `${msg}无法禁用`,
            cancelButtonProps: { style: { display: 'none' } },
            okButtonProps: { style: { 'margin-left': 0 } },
            okText: '关闭',
            centered: true
          });
        } else {
          row.validFlag = checked ? 1 : 0;
          await this.postEditInfo(row);
        }
      }
    },
    /* 公共 */
    // 提交编辑后的信息
    async postEditInfo(info) {
      try {
        await this.$http.put(`/waterIndex`, info);
        this.$message.success('操作成功');
      } catch (error) {
        console.log(error);
      }
    },
    //判断是否能够删除 或着 禁用
    async getIfDeleteOrDisable(id) {
      let msg = '';
      try {
        let { resultData: status } = await this.$http(`/waterIndex/getRelationById?id=${id}`);
        switch (status) {
          case 0:
            msg = '';
            break;
          case 1:
            msg = '该指标已被采样点关联，';
            break;
          case 2:
            msg = '该指标已创建指标控制标准，';
            break;
          case 3:
            msg = '该指标已被指标组合关联，';
            break;
          default:
            break;
        }
      } catch (error) {
        console.log(error);
        msg = '';
      }

      return msg;
    },

    //模态框操作
    //提交
    async handleSubmit(params) {
      let dict = {
        edit: 'post',
        add: 'post'
      };
      try {
        await this.$http[dict[this.type]](`/waterIndex/addOrUpdate`, params);
        this.$message.success('操作成功');
        await this.getTableList();
        this.type = '';
      } catch (error) {
        console.log(error);
      }
    },
    //取消
    handleCancel() {
      this.type = '';
      this.getTableList();
    },

    //其他操作
    //点击预览
    openPreview(file) {
      this.$refs['preview'].openPreview(file);
    }
  }
};
</script>

<style lang="less" scoped>
@import '@/styles/switch.less';
.wrapper {
  font-family: PingFangSC-Regular, sans-serif;
}
.header {
  width: 100%;
  margin-bottom: 12px;
  box-shadow: 0 2px 6px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
}
header {
  padding: 10px 24px;
}
.content {
  height: calc(100% - 74px);
  padding-top: 4px;
  &-table {
    height: 100%;
  }
}
//表格中文字省略
.optionText {
  display: inline-block;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  vertical-align: middle;
  width: 100%;
}
//解决field名称大于六个字显示不全的问题
/deep/.wpg-info-form .wpg-form-item.label-auto .wpg-form-item-label {
  flex-basis: 100px;
}
</style>
