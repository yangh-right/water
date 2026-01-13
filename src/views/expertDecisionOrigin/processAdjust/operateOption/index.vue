<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-11 09:53:04
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-10-09 15:46:38
 * @Description:施工服务清单
-->
<template>
  <div class="search-table">
    <w-form-table-page class="search-table__wrap">
      <template #form>
        <w-form-header
          :layout="layout"
          :model="searchForm"
          class="search-table__header"
          :fields="searchFields"
          @search="handleSearch"
          @cancel="handleReset"
        >
          <template #extra>
            <w-button @click="handleAdd">新增</w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          rowKey="id"
          v-on="tableEvent"
          v-bind="tableProps"
          :loading="tableLoading"
          :scroll="tableScroll"
          @detail="rowEdit"
          @delete="rowDelete"
          class="search-table__table"
          :columns="columns"
          :data-source="dataList"
          :page="page"
        >
          <template #action="{ text, row, index }">
            <a class="supply-mr-3" @click="rowEdit(row)">详情</a>
            <a class="supply-mr-3" @click="rowDelete(row)">删除</a>
          </template>
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
import { defaultMixin } from '@/components/SearchTable/option';
import { getConfig, fillTypeList } from './data';
import {
  getProcessControlEnum,
  deleteProcessControlEnum,
  addProcessControlEnum,
  editProcessControlEnum
} from '@/api/diagnosis';

export default {
  name: 'operateOption',
  mixins: [defaultMixin],
  data() {
    return {
      ...getConfig(this),
      tableListMeth: getProcessControlEnum,
      editMeth: editProcessControlEnum,
      delMeth: deleteProcessControlEnum,
      addMeth: addProcessControlEnum,
      detailWidth: 520,
      isUpdate: false,
      detailLayout: {
        span: 24,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      layout: {
        span: 10,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      }
    };
  },
  created() {
    this.setDictList();
  },
  methods: {
    setDictList() {
      //   this.sysDictListByCode("ProjectStatus", "projectStatusList");
      this.setFieldOptions(fillTypeList, 'fillType');
    },
    handleList() {
      if (this.isUpdate) {
        this.$emit('operateChange');
      } else {
        this.isUpdate = true;
      }
    }
  }
};
</script>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
</style>
