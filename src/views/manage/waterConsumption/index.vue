<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-11 09:53:04
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-09-13 11:24:17
 * @Description:
-->
<template>
  <div class="search-table">
    <div class="tabs supply-bg-bg-card-DEFAULT">
      <w-tabs v-model="type" @change="changeTab">
        <w-tab-pane v-for="tab in tabList" :key="tab.value" :tab="tab.label"></w-tab-pane>
      </w-tabs>
    </div>
    <w-form-table-page class="search-table__wrap">
      <template #form>
        <w-form-header
          :layout="layout"
          :neddRetain="false"
          :model="searchForm"
          class="search-table__header wbgc-card"
          :fields="searchFields"
          @search="handleSearch"
          @cancel="handleReset"
        >
          <template #footer>
            <w-button type="primary" @click="handleAdd" class="extraBtn">新增</w-button>
            <w-button @click="openUploadDialog" class="extraBtn">导入</w-button>
            <w-button @click="handleExport" class="extraBtn">导出</w-button>
            <return-control :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          v-on="tableEvent"
          v-bind="tableProps"
          :loading="tableLoading"
          @changeRadio="tableChangeRadio"
          :scroll="tableScroll"
          @detail="rowEdit"
          @delete="rowDelete"
          class="search-table__table wbgc-card"
          :columns="columns"
          :data-source="dataList"
          :page="page"
        >
        </w-info-table>
      </template>
    </w-form-table-page>
    <w-form-modal
      class="search-table__modal secondary-modal"
      ref="detailModal"
      :title="detailTitle"
      :layout="detailLayout"
      :width="detailWidth"
      :model="detailForm"
      :fields="detailFields"
      :visible="visible"
      :confirm-loading="detailLoading"
      @submit="handleDetailSubmit"
      @cancel="hide"
    >
    </w-form-modal>
    <upload-dialog ref="uploadDialog" :importMeth="handleImport" />
  </div>
</template>
<script>
function isExcel(value) {
  const pattern = /^.*\.(?:xls|xlsx)$/;
  return pattern.test(value);
}
import UploadDialog from '@/components/UploadFile/UploadDraggerDialog';
import { defaultMixin } from '@/components/SearchTable/option';
import {
  addWaterRecord,
  deleteWaterRecord,
  editWaterRecord,
  getWaterRecord,
  importWaterRecord,
  exportWaterRecord
} from '@/api/manage';
import { getConsumptionConfig as getConfig } from './data';
export default {
  name: 'waterConsumption',
  mixins: [defaultMixin],
  components: { UploadDialog },
  props: {},
  data() {
    return {
      ...getConfig(this),
      tabList: [
        { label: '进水', value: 0 },
        { label: '市政用水', value: 2 }
      ],
      type: 0,
      searchForm: {
        type: 0
      },
      originDetailFields: null,
      addMeth: addWaterRecord,
      editMeth: editWaterRecord,
      delMeth: deleteWaterRecord,
      tableListMeth: getWaterRecord,
      importMeth: importWaterRecord,
      exportMeth: exportWaterRecord,
      detailWidth: 480,
      detailLayout: {
        gutter: [24, 0],
        span: 24,
        wrapperCol: { span: 20 },
        labelCol: { span: 4 }
      },
      layout: {
        labelAuto: false,
        span: 6,
        wrapperCol: { span: 20 },
        labelCol: { span: 4 }
      },
      dateParam: {
        date: {
          dateFormat: 'YYYY-MM-DD'
        },
        time: {
          dateFormat: 'YYYY-MM-DD HH:mm:ss'
        }
      },
      page: {
        pageSize: 20,
        currentPage: 1,
        total: 0
      },
      ...this.dataConfig
    };
  },
  computed: {
    detailTitle() {
      return this.modalType ? '编辑记录' : '新增记录';
    }
  },
  watch: {
    type: {
      handler(val) {
        this.downName = this.type === 0 ? '进水记录' : '回水记录';
      },
      immediate: true
    }
  },
  activated() {
    let { tabIndex } = this.$route.query;
    if (tabIndex) {
      this.type = Number(tabIndex);
      setTimeout(() => {
        this.changeTab();
      }, 300);
    }
  },
  methods: {
    handleDetailApiParams(params) {
      params.type = this.type;
      return params;
    },
    changeTab() {
      this.searchForm.type = this.type;
      this.handleSearch();
    },
    async handleImport(fileList, callback) {
      const formData = new FormData();
      for (let file of fileList) {
        if (!isExcel(file.name)) {
          this.$message.error('请选择Excel文件进行上传');
          callback && callback({ status: 0 });
          return;
        }
        formData.append('file', file);
      }
      if (!this.importMeth) {
        callback && callback({ status: 0 });
        return;
      }
      const res = await this.importMeth(formData, this.type);
      if (res.status === 'complete') {
        this.$message.success('导入成功！');
        callback && callback({ status: 1, data: res });
        this.getList();
      } else if (res?.status === 'error' || res.size) {
        callback && callback({ status: 0, data: res });
      } else {
        callback && callback({ status: 1, data: res });
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
.tabs {
  margin-bottom: 10px;
  border-radius: 4px;
  position: relative;
  /deep/ .ant-tabs-bar {
    margin-bottom: 0;
    .ant-tabs-nav {
      height: 50px;
    }
  }
  .goback-btn {
    position: absolute;
    top: 6px;
    right: 20px;
  }
}
.search-table {
  padding: 12px 0 0 !important;
}
.search-table__wrap {
  margin-top: 12px;
  height: calc(100% - 60px);
}
</style>
