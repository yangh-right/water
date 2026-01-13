<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-11 09:53:04
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-14 13:07:01
 * @Description: 
-->
<template>
  <div class="search-table">
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
          <template #extra>
            <w-button v-if="showAddBtn" @click="handleAdd" class="extraBtn">新增</w-button>
            <w-button v-if="showImportBtn" @click="handleImport" class="extraBtn">导入</w-button>
            <w-button v-if="showExportBtn" @click="handleExport" class="extraBtn">导出</w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          :scroll="{ y: 670 }"
          :rowKey="(record, i) => i"
          @detail="rowEdit"
          @delete="rowDelete"
          @changePage="changePage"
          class="search-table__table wbgc-card"
          :columns="columns"
          :data-source="dataList"
          :page="page"
        >
          <!-- <template #num="{ text, row }">
          <span v-if="text">
            {{ `${text} ${row.numUnit}` }}
          </span>
          <span v-else></span>
        </template> -->
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
    />
  </div>
</template>
<script>
import { exportFile, importFile, defaultMixin } from '@/components/SearchTable/option';
import { config } from './option';
export default {
  mixins: [defaultMixin],
  data() {
    return {
      ...config
    };
  }
};
</script>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
</style>
