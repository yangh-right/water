<template>
  <!-- 周界报警 -->
  <div class="region-alarm">
    <con-layout class="search-table__wrap" :config="config">
      <template #form>
        <w-form-model
          :labelCol="layout.labelCol"
          :model="searchForm"
          :wrapperCol="layout.wrapperCol"
          class="supply-w-full"
        >
          <w-row :gutter="8">
            <w-col :span="6">
              <w-form-model-item name="waterPlantId" label="选择污水厂">
                <FactorySelect
                  v-model.trim="searchForm.waterPlantId"
                  :showAll="true"
                  :autoSelect="true"
                  @change="handleSearch"
                ></FactorySelect>
              </w-form-model-item>
            </w-col>
            <w-col class="supply-float-right" :span="6">
              <w-form-model-item class="supply-float-right" :wrapperCol="{ flex: 1 }">
                <w-button class="supply-mr-3" type="primary" icon="ic_search" @click="handleSearch">
                  <span>查询</span>
                </w-button>
                <w-button class="supply-mr-3" icon="reload" @click="handleReset">
                  <span>重置</span>
                </w-button>
                <return-control
                  class="supply-ml-3"
                  :keep="true"
                  :is-drill-down="true"
                ></return-control>
              </w-form-model-item>
            </w-col>
          </w-row>
        </w-form-model>
        <!-- <w-form-header
          class="supply-w-full"
          :title="null"
          newLine
          :neddRetain="false"
          :fields="fields"
          :model="searchForm"
          :layout="layout"
          :loading="loading"
        >
          <template #waterPlantId>
            <FactorySelect
              v-model.trim="searchForm.waterPlantId"
              :showAll="true"
              :autoSelect="true"
              @change="handleSearch"
            ></FactorySelect>
          </template>
          <template #footer>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <return-control class="supply-ml-3" :keep="true" :is-drill-down="true"></return-control>
          </template>
        </w-form-header> -->
      </template>
      <template #table>
        <w-info-table
          class="supply-w-full supply-h-full"
          show-index
          :columns="columns"
          :data-source="dataSource"
          :page="searchForm"
          :scroll="{ x: 1000 }"
          :loading="loading"
        >
          <template #paymentStatus="{ text }">
            <span>{{ paymentsStatusObj[text] || '' }}</span>
          </template>
          <template #status="{ text }">
            <span>{{ projectManagementStatusObj[text] || '' }}</span>
          </template>
        </w-info-table>
      </template>
      <template #log>
        <alarm-log ref="alarmLog"></alarm-log>
      </template>
    </con-layout>
  </div>
</template>

<script>
import alarmLog from './alarmLog';
import ConLayout from '@/components/ConLayout/ConLayout';
import { headerFields, columns, searchForm } from './config';
import { cloneDeep } from 'lodash';
import { regionAlarm } from '@/api/diagnosis';
import FactorySelect from '@/components/factory-select/index.vue';
export default {
  name: 'RegionAlarm',
  components: { FactorySelect, ConLayout, alarmLog },
  data() {
    return {
      isCommonScreen: true,
      loading: false,
      layout: {
        colon: true, // 冒号
        span: 7,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      config: {
        class: ['supply-flex-col'],
        children: [
          {
            class: ['supply-overflow-visible'],
            slots: ['form']
          },
          {
            class: ['supply-flex-1'],
            children: [
              {
                slots: ['table'],
                class: ['supply-flex-1', 'supply-overflow-hidden'],
                children: []
              },
              {
                slots: ['log'],
                class: ['supply-overflow-hidden'],
                style: { width: '520px' },
                children: []
              }
            ]
          }
        ]
      },
      labelColWidth: {
        span: 7
      },
      labelColWidth1: {
        span: 3
      },
      wrapperCol: {
        span: 21
      },
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: [],
      fields: cloneDeep(headerFields)
    };
  },
  activated() {
    this.handleSearch();
  },
  methods: {
    handleSearch() {
      if (this.$refs.alarmLog) {
        this.$refs.alarmLog.getAlarmLog();
        this.$refs.alarmLog.getOperateLog();
      }
      this.page.current = 1;
      this.getAlarmList();
    },
    async getAlarmList() {
      this.loading = true;
      const { resultData, status } = await regionAlarm();
      if (status === 'complete') {
        setTimeout(() => {
          this.dataSource = resultData || [];
          this.searchForm.total = resultData?.length || 0;
        }, 500);
      }
      this.loading = false;
    },
    handleReset() {
      this.searchForm = {
        rangeTime: [this.$moment().subtract(8, 'days'), this.$moment().subtract(1, 'days')],
        waterPlantId: this.initWaterPlantId,
        queryType: 'hour',
        currentPage: 1,
        pageSize: 999,
        total: 0
      };
      this.handleSearch();
    }
  }
};
</script>

<style lang="less" scoped>
.region-alarm {
  width: 100%;
  height: 100%;
  /deep/.wpg-form {
    padding: 5px 20px;
    background: var(--supply-color-bg-card-DEFAULT);
  }
  .wpg-form-item {
    margin-bottom: 0 !important;
  }
  .search-table__wrap {
    padding: 0;
  }
  /deep/ .wpg-pagination {
    display: none;
  }
  /deep/ .table-warp {
    padding: 0px 0px 0px !important;
  }
}
</style>
