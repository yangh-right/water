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
            <w-button v-if="showAddBtn" @click="handleAdd" class="extraBtn">新增</w-button>
            <return-control :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          v-on="tableEvent"
          v-bind="tableProps"
          :loading="tableLoading"
          :showRadio="showRadio"
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
      <template #file>
        <div class="form-item">
          <div class="form-item__label">图片：</div>
          <div class="form-item__content">
            <upload-file
              :multiple="true"
              :limit="10"
              v-model="detailForm.file"
              placeholder="请选择"
            />
          </div>
        </div>
      </template>
    </w-form-modal>
  </div>
</template>
<script>
import UploadFile from '@/components/UploadFile/UploadFile';
import { defaultMixin } from '@/components/SearchTable/option';
import {
  addHazardRecords,
  deleteHazardRecords,
  editHazardRecords,
  getHazardRecordsPage
} from '@/api/manage';
import { set, cloneDeep } from 'lodash-es';
import { getDangerConfig as getConfig } from './data';
export default {
  components: { UploadFile },
  mixins: [defaultMixin],
  props: {
    id: {
      type: [String, Number],
      default: ''
    },
    showRadio: {
      type: Boolean,
      default: false
    },
    hideAction: {
      type: Boolean,
      default: false
    },
    dataConfig: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      ...getConfig(this),
      originDetailFields: null,
      tableListMeth: getHazardRecordsPage,
      addMeth: addHazardRecords,
      editMeth: editHazardRecords,
      delMeth: deleteHazardRecords,
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
        discoveryDate: {
          dateFormat: 'YYYY-MM-DD'
        },
        resolutionDate: {
          dateFormat: 'YYYY-MM-DD'
        },
        resolutionDeadline: {
          dateFormat: 'YYYY-MM-DD'
        }
      },
      ...this.dataConfig
    };
  },
  computed: {
    detailTitle() {
      return this.modalType ? '编辑隐患' : '新增隐患';
    }
  },
  created() {
    this.setDictList();
  },
  methods: {
    handleList() {
      this.dataList.forEach(item => {
        if (item.photos) {
          item.file = item.photos.map(file => JSON.parse(file));
        } else {
          item.file = [];
        }
      });
    },
    handleAdd(row) {
      this.modalType = 0;
      this.updateDetailFields();
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.detailModal.$refs['info-form'].resetFields();
        this.detailForm = this.getInitDetailForm();
        this.handleForm({});
        this.initDetailForm = cloneDeep(this.detailForm);
      });
    },
    updateDetailFields() {
      if (!this.originDetailFields) {
        this.originDetailFields = [...this.detailFields];
      }
      if (!this.modalType) {
        this.detailFields = this.originDetailFields.filter(
          item => !['status', 'resolutionDate'].includes(item.name)
        );
      } else {
        this.detailFields = [...this.originDetailFields];
      }
    },
    rowEdit(row) {
      this.modalType = 1;
      this.updateDetailFields();
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.detailModal.$refs['info-form'].resetFields();
        this.setForm(this.detailForm, this.handleParams(row, false));
        this.handleForm(row);
        this.initDetailForm = cloneDeep(this.detailForm);
      });
    },
    handleDetailApiParams(params) {
      let photos = this.detailForm?.file?.map(item =>
        JSON.stringify({ url: item.url, name: item.name, uid: item.uid })
      );
      let newParams = { ...params, photos };
      delete newParams.file;
      return newParams;
    },
    setDictList() {
      this.sysDictListByCode('hazardStatus', 'status');
    }
  }
};
</script>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
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
