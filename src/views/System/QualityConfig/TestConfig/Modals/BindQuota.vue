<template>
  <div>
    <w-modal title="绑定水质指标" :visible="visible" @ok="handleOk" @cancel="handleCancel">
      <div style="padding: 0 24px">水质指标组合: {{ compoTitle }}</div>
      <w-form-table-page>
        <template #form>
          <w-form-header
            :fields="quotaFields"
            :model="searchForm"
            :layout="layout"
            :title="null"
            :loading="loading"
            newLine
            :neddRetain="false"
            @search="getList"
            @cancel="getList"
          >
          </w-form-header>
        </template>
        <template #table>
          <div class="full-table-wrap">
            <w-info-table
              v-loading="loading"
              showIndex
              showCheckbox
              rowKey="id"
              :initSelectedRowKeys="selectedRows"
              :columns="quotaInfoColumns"
              :data-source="data"
              :model="searchForm"
              :page="searchForm"
              :scroll="{ x: 700 }"
              @changeCheckbox="handleCheckboxChange"
              @changePage="handlePageChange"
            >
            </w-info-table>
          </div>
        </template>
      </w-form-table-page>
    </w-modal>
  </div>
</template>

<script>
import { quotaInfoColumns, quotaFields } from '../components/config';
import mixin from '../components/mixin';
import { cloneDeep } from 'lodash-es';
export default {
  name: 'BindQuota',
  mixins: [mixin],
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    form: {
      type: Object,
      default: () => {}
    },
    compoId: {
      type: String,
      default: ''
    },
    compoTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      quotaFields,
      layout: { span: 16, colon: true, labelAuto: true, wrapperCol: { span: 18 } },
      quotaInfoColumns,
      data: [],
      selectedRows: [],
      preSelected: [],
      searchForm: {
        nameLike: undefined,
        // 分页
        currentPage: 1,
        pageSize: 10,
        total: 0
      }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.getInit();
      }
    }
  },
  methods: {
    async getInit() {
      this.quotaFields[0].listeners = { pressEnter: this.getList };
      this.selectedRows = [];
      await this.getList();
    },
    async getList() {
      this.loading = true;
      const { resultData } = await this.$http.post(
        `/indexCombination/queryIndexPage?indexCombinationId=${this.compoId}`,
        this.searchForm
      );
      this.data = cloneDeep(resultData.records);
      // 记录发生修改前已经选择的水质指标id
      this.preSelected = resultData.records.filter(v => v.pickFlag).map(v => v.id);
      this.selectedRows = cloneDeep(this.preSelected);
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleCheckboxChange(selectedRowKeys) {
      this.selectedRows = selectedRowKeys;
    },
    async handleOk() {
      let submitForm = {
        createList: [],
        deleteList: []
      };
      // 新增选择列表
      this.selectedRows.forEach(rowkey => {
        if (!this.preSelected.includes(rowkey)) {
          submitForm.createList.push({
            indexCombinationId: this.compoId,
            indexId: rowkey
          });
        }
      });
      // 取消选择列表
      this.preSelected.forEach(rowkey => {
        if (!this.selectedRows.includes(rowkey))
          submitForm.deleteList.push({
            indexCombinationId: this.compoId,
            indexId: rowkey
          });
      });
      await this.$http.post('/indexCombination/relationIndex', submitForm);
      this.handleCancel();
    },
    handleCancel() {
      this.$emit('update:visible', false);
      this.$emit('getList');
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-modal {
  width: 800px !important;
}

/deep/ .wpg-modal-content {
  height: 600px;
}

/deep/ .wpg-modal-body {
  height: 75%;
}

/deep/ .info-table-view {
  height: 100%;
}

/deep/ .wpg-form-item-label {
  overflow: visible;
}

/deep/ .wpg-form-item-control {
  margin-left: 12px;
}

/deep/ .form-warp .wbgc-card,
/deep/ .form-wrap .wbgc-card {
  box-shadow: none;
}

/deep/ .form-table-warp .table-warp,
/deep/ .form-table-warp .table-wrap {
  box-shadow: none;
  padding: 0;
}
</style>
