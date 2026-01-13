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
            <return-control :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          v-on="tableEvent"
          v-bind="tableProps"
          :loading="tableLoading"
          :scroll="tableScroll"
          class="search-table__table wbgc-card"
          :columns="columns"
          :data-source="dataList"
          :page="page"
        >
          <template #ticketNo="{ text, row, index }">
            <a @click="goWorkDetail(row)">{{ text }}</a>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
  </div>
</template>
<script>
import { defaultMixin } from '@/components/SearchTable/option';
import { waterQualitySampleReport } from '@/api/manage';
import { getDangerConfig as getConfig } from './data';
export default {
  name: 'sampleRecord',
  mixins: [defaultMixin],
  props: {},
  data() {
    return {
      ...getConfig(this),
      originDetailFields: null,
      tableListMeth: waterQualitySampleReport,
      detailWidth: 1000,
      detailLayout: {
        gutter: [24, 0],
        span: 8,
        wrapperCol: { span: 16 },
        labelCol: { span: 8 }
      },
      layout: {
        labelAuto: false,
        span: 6,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      dateParam: {
        date: {
          params: ['startTime', 'endTime'],
          dateFormat: 'YYYY-MM-DD'
        }
      },
      ...this.dataConfig
    };
  },
  computed: {
    detailTitle() {
      return this.modalType ? '编辑采样' : '新增采样';
    }
  },
  created() {},
  methods: {
    goWorkDetail(order) {
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: order.ticketId
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
.search-table {
  padding: 12px 0 0;
}
.form-item {
  display: flex;
  &__label {
    width: 10.5%;
    text-align: right;
  }
  &__content {
    flex: 1;
    overflow: hidden;
  }
}
</style>
