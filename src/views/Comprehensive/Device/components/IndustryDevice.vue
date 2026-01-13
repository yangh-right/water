<template>
  <w-modal
    title="选择行业设备"
    :visible="visible"
    :width="1200"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <w-form-table-page>
      <template #form>
        <w-row>
          <w-form-model
            ref="form"
            :model="searchForm"
            :labelCol="{ span: 8 }"
            :wrapperCol="{ span: 16 }"
          >
            <w-col span="6">
              <w-form-model-item label="行业设备名称" prop="keyWord">
                <w-input v-model="searchForm.keyWord" placeholder="行业设备名称/ID" />
              </w-form-model-item>
            </w-col>
            <w-col span="6">
              <w-form-model-item label="行业设备类型" prop="industryDeviceType">
                <w-select
                  v-model="searchForm.industryDeviceType"
                  allow-clear
                  placeholder="请选择行业设备类型"
                >
                  <w-select-option
                    v-for="item in fields[1].options"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </w-select-option>
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col span="6">
              <w-form-model-item label="行业类型" prop="templateType">
                <w-select
                  v-model="searchForm.templateType"
                  allow-clear
                  placeholder="请选择行业类型"
                >
                  <w-select-option
                    v-for="item in fields[2].options"
                    :key="item.value"
                    :value="item.value"
                  >
                    {{ item.label }}
                  </w-select-option>
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col span="6">
              <w-form-model-item class="supply-flex supply-justify-end" label="">
                <w-button class="supply-mr-3" type="primary" @click="handleSearch">查询</w-button>
                <w-button @click="resetPageChange">重置</w-button>
              </w-form-model-item>
            </w-col>
          </w-form-model>
        </w-row>
      </template>
      <template #table>
        <div class="industry-table-wrap">
          <w-info-table
            showIndex
            showRadio
            :loading="loading"
            :columns="columns"
            :data-source="data"
            :initSelectedRowKeys="initSelectedRowKeys"
            :page="searchForm"
            :disableCheck="disableCheck"
            :scroll="{ x: 600 }"
            @changeRadio="handleRadioChange"
            @changePage="handlePageChange"
          ></w-info-table>
        </div>
      </template>
    </w-form-table-page>
  </w-modal>
</template>

<script>
import { getIndustryDeviceByQuery } from '@/api/deviceManagement';
import { postDeviceTypeApi, postIndustryTemplateTypeApi } from '@/api/public';
export default {
  name: 'IndustryDevice',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    deviceId: {
      type: String,
      default: ''
    },
    placeId: {
      type: String,
      default: ''
    },
    industryDeviceItem: {
      type: Object,
      default() {
        return {};
      }
    }
  },
  data() {
    return {
      fields: [
        { label: '行业设备名称', name: 'keyWord', type: 'input', placeholder: '行业设备名称/ID' },
        {
          label: '行业设备类型',
          name: 'industryDeviceType',
          type: 'select',
          attrs: { 'allow-clear': true },
          options: []
        },
        {
          label: '行业类型',
          name: 'templateType',
          type: 'select',
          attrs: { 'allow-clear': true },
          options: []
        }
      ],
      layout: {
        span: 12,
        colon: true,
        labelAuto: true,
        labelCol: { span: 10 },
        wrapperCol: { span: 14 }
      },
      searchForm: {
        keyWord: undefined,
        industryDeviceType: undefined,
        templateType: undefined,
        // 分页
        currentPage: 1,
        pageSize: 10,
        total: 0
      },
      // table
      loading: false,
      columns: [
        { title: '行业设备名称', dataIndex: 'deviceName', ellipsis: true, width: 150 },
        { title: '行业设备ID', dataIndex: 'deviceId', ellipsis: true, width: 200 },
        { title: '行业类型', dataIndex: 'templateTypeName', ellipsis: true, width: 120 },
        { title: '行业设备类型', dataIndex: 'industryDeviceTypeName', ellipsis: true, width: 120 },
        { title: '标签', dataIndex: 'labelName', ellipsis: true, width: 120 }
      ],
      data: [],
      disableCheck: [],
      initSelectedRowKeys: [],
      selectedRows: [] // 选择的行数据
    };
  },
  watch: {
    visible(val) {
      if (!val) return;
      this.getDict();
      if (this.industryDeviceItem.id) {
        this.initSelectedRowKeys = [this.industryDeviceItem.id];
      } else {
        this.initSelectedRowKeys = [];
      }
      this.searchForm.currentPage = 1;
      this.getList();
    }
  },
  methods: {
    async getDict() {
      const { resultData: res } = await postDeviceTypeApi();
      this.fields[1].options = res.map(item => ({ value: item.dictCode, label: item.dictName }));
      const { resultData } = await postIndustryTemplateTypeApi();
      this.fields[2].options = resultData.map(item => ({
        value: item.dictCode,
        label: item.dictName
      }));
    },
    async getList() {
      this.loading = true;
      let params = {
        placeId: this.placeId,
        productCode: 'water_purification',
        dsAreaStationDeviceQueries: [
          {
            stationId: this.waterPlantId,
            productCode: 'water_purification',
            areaId: []
          }
        ],
        ...this.searchForm
      };
      const { resultData, count } = await getIndustryDeviceByQuery(params);
      this.searchForm.total = count;
      this.data = resultData;
      this.disableCheck = resultData.filter(item => item.hasRelated).map(item => item.id);
      this.loading = false;
    },
    handleRadioChange(selectedRowKeys, selectedRows) {
      if (selectedRows.length) this.selectedRows = selectedRows;
    },
    handleOk() {
      if (this.selectedRows[0]) {
        this.$emit('update:industryDeviceItem', this.selectedRows[0]);
      }
      this.handleCancel();
    },
    handleCancel() {
      this.$emit('update:visible', false);
    },
    // 分页
    async handleSearch() {
      this.searchForm.currentPage = 1;
      await this.getList();
    },
    async handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      await this.getList();
    },
    async resetPageChange() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 10;
      this.searchForm.keyWord = undefined;
      this.searchForm.industryDeviceType = undefined;
      this.searchForm.templateType = undefined;
      await this.getList();
    }
  }
};
</script>
<style lang="less" scoped>
/deep/ .wpg-info-form .wpg-form-item.label-auto .wpg-form-item-label {
  flex-basis: 100px;
}

/deep/ .wpg-form-table-warp .table-warp {
  box-shadow: none;
}
/deep/ .wpg-form-item {
  margin-bottom: 0 !important;
}

.industry-table-wrap {
  height: 400px;
  overflow: hidden, scroll;
}
</style>
