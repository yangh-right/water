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
            <w-button @click="openAdd">新增</w-button>
            <w-button @click="handleExport" class="supply-ml-3">导出</w-button>
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
          @detail="openDetail"
          @edit="openEdit"
          @delete="rowDelete"
          class="search-table__table wbgc-card"
          :columns="columns"
          :data-source="dataList"
        >
        </w-info-table>
      </template>
    </w-form-table-page>
    <drag-modal
      ref="processAdjustView"
      :width="750"
      :height="464"
      :maskClosable="false"
      :mask="true"
      :isShowFullBtn="false"
      title="工艺调整详情"
    >
      <process-adjust-view class="supply-px-5" :processData="processData"></process-adjust-view>
    </drag-modal>
    <drag-modal
      ref="processAdjustEdit"
      :width="850"
      :height="634"
      :maskClosable="false"
      :mask="true"
      :isShowFullBtn="false"
      title="工艺调整编辑"
    >
      <process-adjust-Edit
        :isEdit="true"
        :value="processDataForm"
        @action="handleAction($event, 'processAdjustEdit')"
      ></process-adjust-Edit>
    </drag-modal>
  </div>
</template>
<script>
import moment from 'moment';
import DragModal from '@/components/DragModal';
import { defaultMixin } from '@/components/SearchTable/option';
import processAdjustEdit from './models/processAdjustEdit';
import processAdjustView from './models/processAdjustView';
import { getProcessAdjust, exportProcessAdjust, deleteProcessAdjust } from '@/api/diagnosis';
import { set, cloneDeep } from 'lodash-es';
import { getProcessAdjustConfig as getConfig, processConfig, classesList } from './models/config';
export default {
  name: 'processAdjust',
  mixins: [defaultMixin],
  components: {
    DragModal,
    processAdjustEdit,
    processAdjustView
  },
  props: {},
  data() {
    return {
      searchForm: {
        date: [moment().subtract(7, 'days'), moment()]
      },
      ...getConfig(this),
      processData: {},
      downName: '工艺调整',
      tableListMeth: getProcessAdjust,
      exportMeth: exportProcessAdjust,
      delMeth: deleteProcessAdjust,
      processDataForm: {},
      detailLayout: {
        gutter: [24, 0],
        span: 8,
        wrapperCol: { span: 16 },
        labelCol: { span: 8 }
      },
      dateParam: {
        date: {
          params: ['startTime', 'endTime'],
          dateFormat: 'YYYY-MM-DD'
        }
      },
      layout: {
        labelAuto: false,
        span: 6,
        wrapperCol: { span: 20 },
        labelCol: { span: 4 }
      }
    };
  },
  computed: {
    detailTitle() {
      return '编辑工艺调整';
    }
  },
  created() {
    this.setDictList();
  },
  methods: {
    setDictList() {
      this.setFieldOptions(classesList, "classes");
    },
    operateChange(isChange) {
      if (isChange) {
        this.updateDict();
      }
    },

    handleAction(isSubmit, ref) {
      if (isSubmit) {
        this.getList();
      }
      this.$refs[ref].visible = false;
    },
    async getList() {
      if (!this.tableListMeth) return;
      this.tableLoading = true;
      const { resultData, status } = await this.tableListMeth(
        this.handleApiParams(this.handleParams({ ...this.searchForm }))
      );
      if (status === 'complete') {
        this.dataList = resultData || [];
        this.dataList?.forEach(shift => {
          shift.fontColorObj = shift.fontColor || { rgba: {} };
          shift?.processControlOperateDetailList?.forEach(phase => {
            phase.fontColorObj = phase.fontColor || { rgba: {} };
          });
          processConfig.forEach(item => {
            shift[item.key] =
              shift?.processControlOperateDetailList?.filter(
                process => process.waterPlantType === item.waterPlantType
              ) || [];
          });
        });
      }
      this.tableLoading = false;
    },
    openDetail(row) {
      this.processData = [row];
      this.$refs.processAdjustView.visible = true;
    },
    openAdd() {
      this.processDataForm = {};
      this.$refs.processAdjustEdit.visible = true;
    },
    openEdit(row) {
      this.processDataForm = cloneDeep(row);
      this.$refs.processAdjustEdit.visible = true;
    }
  }
};
</script>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
.search-table {
  padding: 0;
}
</style>
