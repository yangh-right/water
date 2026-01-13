<template>
  <w-modal
    class="monitor"
    :width="width"
    :title="title"
    :visible="visible"
    v-loading="loading"
    :maskClosable="false"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <w-form-header
      ref="form-header"
      :title="null"
      newLine
      :neddRetain="false"
      :fields="monitorFields"
      :model="searchForm"
      :layout="layout"
      :loading="loading"
    >
      <template #footer>
        <div class="form-footer">
          <w-button type="primary" icon="ic_search" :loading="loading" @click="handleSearch">
            <span>查询</span>
          </w-button>
          <w-button
            icon="ic_autorenew"
            :loading="loading"
            style="margin-left: 8px"
            @click="handleReset"
          >
            <span>重置</span>
          </w-button>
        </div>
      </template>
    </w-form-header>
    <div class="table-wrapper">
      <w-info-table
        :scroll="{ x: 500 }"
        show-index
        showTotal
        showCheckbox
        :loading="loading"
        :page="searchForm"
        :columns="addMonitorColumns"
        :data-source="dataSource"
        :initSelectedRowKeys="selectedKeys"
        @changePage="handlePageChange"
        @changeCheckbox="changeCheckbox"
      >
        <template #pointType="{ row }">
          <span>{{ handlePointType(row.pointType) }}</span>
        </template>
      </w-info-table>
    </div>
  </w-modal>
</template>

<script>
import { getPointTypeApi } from '@/api/public';
import { monitorColumns } from './config';
import { mapState } from 'vuex';
import {
pointPageList
} from '@/api/public';
export default {
  name: 'SelectMonitor',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '选择监测量'
    },
    width: {
      type: String,
      default: '950px'
    }
  },
  data() {
    return {
      loading: false,
      monitorFields: [
        {
          label: '监测量关键词',
          name: 'keyWord',
          type: 'input',
          placeholder: '名称/代码'
        },
        {
          label: '监测量类型',
          name: 'pointType',
          type: 'select',
          placeholder: '请选择监测量类型',
          options: [],
          extraOption: [
            {
              label: '不限',
              value: ''
            }
          ]
        }
      ],
      searchForm: {
        keyWord: undefined,
        pointType: '',
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      layout: { span: 9, labelCol: { span: 6 }, wrapperCol: { span: 18 }, justify: 'start' },
      dataSource: [],
      selectedKeys: [],
      selectedRows: []
    };
  },
  computed: {
       ...mapState('account', ['user']),
    addMonitorColumns() {
      return monitorColumns.filter(
        item => item.type !== 'action' && item.key !== 'pointAlias' && item.key !== 'pointNumber'
      );
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.selectedKeys = [];
        this.selectedRows = [];
        this.handleReset();
      }
    }
  },
  created() {
    this.getPointType();
    this.handleSearch();
  },
  methods: {
    // 获取监测量类型
    async getPointType() {
      const { resultData } = await getPointTypeApi();
      this.monitorFields[1].options = resultData.map(item => {
        return {
          label: item.dictName,
          value: item.dictCode
        };
      });
    },
    async handleSearch() {
      let params = {
             tenantId: this.user.tenantId,
        ...this.searchForm
      };
      this.loading = true;
      const { count, resultData } = await pointPageList(params);
      this.dataSource = resultData;
      this.searchForm.total = count;
      this.loading = false;
    },
    handleReset() {
      // this.$refs["form-header"].handleReset();
      this.searchForm = {
        keyWord: undefined,
        pointType: '',
        currentPage: 1,
        pageSize: 10,
        total: 0
      };
      this.handleSearch();
    },
    handleCancel() {
      this.$emit('update:visible', false);
    },
    async handleOk() {
      this.$emit('handleSelectMonitor', this.selectedRows);
      this.handleCancel();
    },
    // 页码change
    handlePageChange(current, pageSize) {
      this.searchForm.currentPage = current;
      this.searchForm.pageSize = pageSize;
      this.handleSearch();
    },
    // 选择框
    changeCheckbox(selectedKeys, selectedRows) {
      this.selectedKeys = selectedKeys;
      this.selectedRows = selectedRows;
    },
    handlePointType(pointType) {
      if (pointType) {
        return this.monitorFields[1].options.find(item => {
          return item.value === pointType;
        }).label;
      }
      return '';
    }
  }
};
</script>

<style lang="less" scoped>
.monitor {
  width: 100%;
  position: relative;
  .table-wrapper {
    margin-top: 10px;
    .info-table-view {
      height: 460px;
    }
  }
}
//解决field名称大于六个字显示不全的问题
/deep/.wpg-info-form .wpg-form-item.label-auto .wpg-form-item-label {
  flex-basis: 100px;
}
</style>
