<template>
  <div class="search-box">
    <table-search>
      <w-row slot="form">
        <w-form-model
          ref="formSearch"
          layout="inline"
          :model="formSearch"
          :labelCol="{ span: 6 }"
          :wrapperCol="{ span: 18 }"
          class="supply-clear-both"
        >
          <w-col :span="5">
            <w-form-model-item name="waterPlantId" label="选择污水厂">
              <FactorySelect v-model.trim="formSearch.waterPlantId" autoSelect></FactorySelect>
            </w-form-model-item>
          </w-col>
        </w-form-model>
        <w-col :span="6">
          <w-form-model-item name="rangeTime" label="采样日期">
            <w-range-picker
              v-model="formSearch.rangeTime"
              :placeholder="['开始日期', '结束日期']"
              allowClear
            />
          </w-form-model-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-form-model-item>
            <w-button type="primary" class="supply-mr-3" icon="ic_add" @click="handleAdd"
              >常规填报</w-button
            >
            <w-button type="primary" class="supply-mr-3" @click="handleImport"
              ><w-icon type="ic_publish" />导入</w-button
            >
            <w-button type="primary" class="supply-mr-3" @click="handleExport"
              ><w-icon type="ic_file_download" />导出</w-button
            >
            <w-button class="supply-mr-3" icon="ic_autorenew" @click="handleReset">重置</w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">查询</w-button>
          </w-form-model-item>
        </w-col>
      </w-row>
      <div class="supply-h-full supply-flex supply-flex-col">
        <div
          class="assay-set-tap supply-bg-bg-card-DEFAULT supply-flex-none supply-overflow-hidden"
        >
          <span
            v-for="tab in manuallyDataList"
            :key="tab.dictValue"
            :class="tabVal === tab.dictValue ? 'active' : ''"
            @click="changeTab(tab.dictValue)"
          >
            {{ tab.dictName }}
          </span>
        </div>
        <div
          id="reportTableCon"
          ref="reportTableCon"
          class="report-table-con supply-bg-bg-card-component supply-flex-1 supply-overflow-hidden"
        >
          <PaginationTable
            class="supply-h-full"
            ref="table"
            bordered
            :columns="columns"
            :pagination="false"
            rowKey="uid"
            :loading="loading"
            :data-source="dataSource"
            :current.sync="params.page.current"
            :total.sync="total"
            :pageSize.sync="params.page.size"
            @change="onPageChange"
          >
            <template slot="action" slot-scope="text, record">
              <a @click="handleReview(record)">审核</a>
              <a class="supply-ml-3" @click="handleEdit(record)">修改</a>
              <a class="supply-ml-3" @click="handleDelete(record)">删除</a>
            </template>
          </PaginationTable>
        </div>
      </div>
      <div ref="fileCon" style="display: none">
        <input
          id="file"
          ref="file"
          type="file"
          name="fileUpload"
          style="display: none"
          accept=".xls,.xlsx,.XLS,.XLSX"
          @change="handleFile"
        />
      </div>
    </table-search>
    <AssayModal
      ref="assayModal"
      :fields="fields"
      :manuallyDataList="manuallyDataList"
      :visible.sync="visible"
      @refresh="getList"
    />
  </div>
</template>

<script>
import { exportFile } from '@/utils/util';
import { handleColumns, handleFields } from './models/config';
import { sysDictListByCode } from '@/api/manage';
import { getStructureByStationId } from '@/api/optimization';
import {
  importAssayReport,
  exportAssayReport,
  exportDailyReporTemplatet,
  getAssayReportList,
  addAssayReport,
  deleteAssayReport,
  batchAddAssayReport
} from '@/api/report';
import PaginationTable from '@/components/PaginationTable/index.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import AssayModal from './models/assayModal.vue';
export default {
  name: 'AssaySet',
  components: {
    PaginationTable,
    FactorySelect,
    AssayModal
  },
  data() {
    return {
      formSearch: {
        waterPlantId: '',
        rangeTime: [this.$moment().subtract(30, 'days'), this.$moment()],
        configCode: undefined,
        samplingDateStart: undefined,
        samplingDateEnd: undefined
      },
      dataSource: [],
      loading: false,
      params: {
        page: { current: 1, size: 10 }
      },
      total: 0,
      manuallyDataList: [],
      manuallyDataName: {},
      visible: false
    };
  },
  computed: {
    tabVal() {
      return this.formSearch.configCode || this.manuallyDataList?.[0]?.dictValue || '';
    },
    columns() {
      return handleColumns(this, this.tabVal);
    },
    fields() {
      return handleFields(this, this.tabVal);
    }
  },
  watch: {
    'formSearch.waterPlantId': {
      handler(val) {
        if (val) {
          this.getList();
        }
      },
      immediate: true
    }
  },
  mounted() {
    this.sysDictListByCode('manually_data', 'manuallyData');
  },
  methods: {
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[`${data}List`] = res.resultData;
      this.formSearch.configCode = res.resultData[0].dictValue;
      let obj = {};
      res.resultData.forEach(item => {
        obj[item.dictValue] = item.dictName;
      });
      this[`${data}Name`] = obj;
    },
    getList() {
      this.loading = true;
      let params = {
        ...this.formSearch,
        configCode: this.tabVal,
        samplingDateStart: this.$moment(this.formSearch.rangeTime[0]).format('YYYY-MM-DD'),
        samplingDateEnd: this.$moment(this.formSearch.rangeTime[1]).format('YYYY-MM-DD'),
        page: this.params.page
      };
      getAssayReportList(params).then(res => {
        this.loading = false;
        let { status, resultData } = res;
        if (status === 'complete') {
          this.dataSource = resultData.records;
          this.total = resultData.total;
        }
      });
    },
    onPageChange(page, size) {
      this.params.page.current = page;
      this.params.page.size = size;
      this.getList();
    },
    handleSearch() {
      this.getList();
    },
    handleDelete(row) {
      this.$confirm({
        title: '确定要删除该项记录吗？',
        okText: '确定删除',
        type: 'warning',
        cancelText: '取消',
        onCancel: () => {},
        onOk: () => {
          getAssayReportList(row.id).then(res => {
            if (res.status === 'complete') {
              this.$message.success('删除成功');
              this.getList();
            }
          });
        }
      });
    },
    handleReview(row) {
      this.$confirm({
        title: '确定要审核该项记录吗？',
        okText: '确定审核',
        cancelText: '取消',
        type: 'warning',
        onCancel: () => {},
        onOk: () => {
          let params = {
            waterPlantId: this.formSearch.waterPlantId,
            samplingDate: row.samplingDate,
            manuallyDataList: [
              {
                ...row,
                reviewStatus: 1
              }
            ]
          };
          batchAddAssayReport(params).then(res => {
            if (res.status === 'complete') {
              this.$message.success('审核成功');
              this.getList();
            }
          });
        }
      });
    },
    handleEdit(row) {
      this.$refs.assayModal.show(row, 'edit', this.tabVal);
    },
    handleAdd() {
      this.$refs.assayModal.show({}, 'add', 'all');
    },
    handleImport() {
      this.$refs.file.click();
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importAssayReport(formData);
      if (res.size) {
        this.$message.success('导入失败');
        exportFile(res, '导入失败信息');
      } else {
        this.$message.success('导入成功');
      }
      this.getList();
      document.getElementById('file').value = '';
    },
    handleExport() {
      const vo = this.formSearch;
      exportAssayReport(vo).then(res => {
        exportFile(res, '常规填报');
      });
    },
    handleReset() {
      this.formSearch = {
        waterPlantId: '',
        rangeTime: [],
        samplingDateStart: undefined,
        samplingDateEnd: undefined
      };
    },
    changeTab(val) {
      this.formSearch.configCode = val;
      this.getList();
    }
  }
};
</script>

<style lang="less" scoped>
.search-box {
  width: 100%;
  height: 100%;
  overflow: auto;
  /deep/.table-page-search-wrapper {
    padding: 10px 20px;
  }
  /deep/.table-wrapper {
    margin-top: 0px !important;
  }
  .assay-set-tap {
    height: 42px;
    border-radius: 4px;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    align-items: center;
    /deep/ .ant-radio-group {
      display: flex;
      align-items: center;
    }
    span {
      display: inline-block;
      height: 100%;
      width: 120px;
      font-size: 14px;
      color: #999999;
      text-align: center;
      font-weight: 400;
      line-height: 42px;
      cursor: pointer;
      &.active {
        color: var(--supply-color-primary-DEFAULT);
        border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
      }
    }
    .ant-btn {
      height: 28px;
      margin-top: 10px;
      margin-right: 30px;
    }
  }
  .report-table-con {
    position: relative;
    padding: 0 12px;
    min-height: 160px;
    .spin-wrapper {
      position: absolute;
      height: 100%;
      width: calc(100% - 40px);
      max-height: 400px;
      .spin {
        z-index: 23;
        position: absolute;
        left: 50%;
        top: 50%;
        transform: translate(-50%, -50%);
      }
    }
    .curpor,
    .desc-box {
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    /deep/ .ant-table-wrapper {
      .ant-table-header th {
        vertical-align: middle;
        border-bottom: 1px solid #e8e8e8;
      }
      .ant-table-body {
        margin: 0;
        .ant-table-thead {
          background: transparent !important;
        }
      }
      .ant-table-tbody {
        > tr:nth-child(even) {
          background: transparent;
        }
        > tr.ant-table-row:hover,
        > tr.ant-table-row,
        > tr.ant-table-row-hover {
          background: transparent !important;
          &:hover > td,
          td {
            background: transparent !important;
            border-bottom: 1px solid #d6d6d6;
          }
        }
      }
    }
    .pagination {
      width: 100%;
      text-align: right;
      padding: 12px;
    }
  }
}
</style>
