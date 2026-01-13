w-info-table<!--
  * @Author: yuan wenyu
  * @Version: 1.0.1
  * @Date: 2023-08-11 09:53:04
  * @LastEditors: yuan wenyu
  * @LastEditTime: 2024-06-16 09:38:22
  * @Description:施工服务清单
 -->
<template>
  <div class="search-table">
    <con-layout class="search-table__wrap" :config="config">
      <template #form>
        <w-form-model
          :labelCol="{ span: 6 }"
          :wrapperCol="{ span: 18 }"
          :model="searchForm"
          class="search-table__header wbgc-card supply-w-full"
        >
          <w-row :gutter="8" type="flex">
            <w-col v-bind="grid">
              <w-form-model-item name="date" label="预警时间">
                <w-range-picker
                  v-model="searchForm.date"
                  :placeholder="['开始时间', '结束时间']"
                  :disabledDate="disabledDate"
                />
              </w-form-model-item>
            </w-col>
            <w-col v-bind="grid">
              <w-form-model-item name="keyWord" label="模糊查询">
                <w-input v-model="searchForm.keyWord" placeholder="请输入" />
              </w-form-model-item>
            </w-col>
            <w-col v-bind="grid">
              <w-form-model-item name="status" label="预警状态">
                <w-select v-model="searchForm.status" :options="confirmStatusList" />
              </w-form-model-item>
            </w-col>
            <w-col v-bind="grid">
              <w-form-model-item class="supply-float-right" :wrapperCol="{ flex: 1 }">
                <w-button class="supply-mr-3" icon="reload" @click="handleReset">
                  <span>重置</span>
                </w-button>
                <w-button type="primary" icon="ic_search" @click="handleSearch">
                  <span>查询</span>
                </w-button>
                <return-control :is-drill-down="true"></return-control>
              </w-form-model-item>
            </w-col>
          </w-row>
        </w-form-model>
      </template>
      <template #chart1>
        <in-Water :alarmInfo="alarmDetail"></in-Water>
      </template>
      <template #chart2>
        <point-chart pointName="NH3N" :alarmInfo="alarmDetail"></point-chart>
      </template>
      <template #chart3>
        <point-chart pointName="TN" :alarmInfo="alarmDetail"></point-chart>
      </template>
      <template #chart4>
        <point-chart pointName="TP" :alarmInfo="alarmDetail"></point-chart>
      </template>
      <template #table>
        <card-box class="table-box" title="预警管理">
          <w-button
            class="supply-relative supply-top-2.5 supply-right-4"
            @click="download"
            slot="titleRight"
            >导出</w-button
          >
          <PaginationTable
            class="supply-w-full decision-table"
            v-on="tableEvent"
            v-bind="tableProps"
            :pagination="{ showLessItems: true }"
            :columns="columns"
            :scroll="tableScroll"
            @change="handleTableChange"
            :loading="tableLoading"
            :data-source="dataList"
            rowKey="alarmHandlerDataId"
            :page="page"
            :current.sync="page.currentPage"
            :total.sync="page.total"
            :pageSize.sync="page.pageSize"
            :rowClassName="
              record => (record.alarmHandlerDataId === alarmId ? 'table-row-selected' : '')
            "
            @rowClick="customRow"
          >
            <template slot="alarmStatus" slot-scope="text, record">
              <div class="status-wrapper">
                <div :class="{ alarmclose: text === 0, alarming: text === 1 }">
                  {{ text === 0 ? '已结束' : text === 1 ? '预警中' : '' }}
                </div>
              </div>
            </template>
            <div
              slot="alarmName"
              slot-scope="text, record"
              class="supply-text-primary alarm-name"
              @click.stop="gotoPage(record)"
              :title="handlePointName(text)"
            >
              {{ handlePointName(text) }}
            </div>
            <template slot="history" slot-scope="text, record">
              <w-icon
                @click.stop="downloadHistory(record)"
                class="supply-text-primary action-icon"
                type="download"
              ></w-icon>
            </template>
          </PaginationTable>
        </card-box>
      </template>
      <template #decision>
        <optimize-solution
          @mock="updateChart"
          :alarmId="alarmId"
          :solutionList="solutionList"
          :alarmInfo="alarmDetail"
        ></optimize-solution>
      </template>
    </con-layout>
    <drag-modal ref="previseDetail" :width="1140" :mask="true" title="报警详情">
      <previse-detail :detailData="detailData"></previse-detail>
    </drag-modal>
    <!-- <drag-modal
      ref="processAdjust"
      :width="750"
      :height="634"
      :maskClosable="false"
      :mask="true"
      :isShowFullBtn="false"
      title="工艺调整"
    >
      <process-adjust @exportProcessAdjust="exportProcessAdjust" :controlId="alarmId"></process-adjust>
    </drag-modal> -->
  </div>
</template>
<script>
import DragModal from '@/components/DragModal';
import moment from 'moment';
import { downloadDocument } from '@/api';
import {
  doConfirm,
  ExportAlarmExcel,
  alarmHandlerData, // 报警分页
  alarmConfirm, // 确认报警
  expertDecisionDetail as alarmDetailInfo,
  exportProcessAdjust
} from '@/api/diagnosis';
import { programmeList } from '@/api/optimization';
import { Base64 } from 'js-base64';
import { merge } from 'lodash';
import storage from '@/utils/storage';
import { historyExcel } from '@/api/analysis';
import { USER_INFO } from '@/store/mutation-types';
import ConLayout from '@/components/ConLayout/ConLayout';
import CardBox from './models/CardBox';
import pointChart from './models/pointChart';
import inWater from './models/inWater';
import solution from './models/solution';
import optimizeSolution from './models/optimizeSolution';
import { defaultMixin } from '@/components/SearchTable/option';
import PaginationTable from '@/components/PaginationTable/index.vue';
import previseDetail from '@/components/common/previseDetail.vue';
import { exportFile } from '@/utils/util';
import {
  getContractRetrievalConfig,
  confirmStatusList,
  alarmLevelsList,
  config,
  handlePointName
} from './models/config';
import settingConfig from '@/config/setting.config';
import { mapState } from 'vuex';
export default {
  name: 'expertDecisionOrigin',
  components: {
    DragModal,
    optimizeSolution,
    ConLayout,
    CardBox,
    previseDetail,
    PaginationTable,
    solution,
    pointChart,
    inWater
  },
  mixins: [defaultMixin],
  data() {
    return {
      ...getContractRetrievalConfig(this),
      config,
      predictionId: '',
      tableListMeth: alarmHandlerData,
      currentAlarm: {},
      dateParam: {
        date: {
          params: ['startTime', 'endTime'],
          dateFormat: 'YYYY-MM-DD'
        }
      },
      grid: {
        xl: 6,
        lg: 6,
        md: 12,
        sm: 24,
        xs: 24
      },
      confirmStatusList: [
        { label: '全部', value: '' },
        { label: '预警中', value: 1 },
        { label: '已结束', value: 0 }
      ],
      searchForm: {
        status: '',
        date: [moment().subtract(1, 'months'), moment()]
      },
      detailData: {},
      remarks: '',
      alarmId: '',
      formItem: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      },
      solutionList: [],
      defaultPredictionId: '',
      confirmLoading: false,
      layout: {
        span: 6,
        gutter: [12, 0],
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      alarmDetail: {}
    };
  },
  computed: {
    tableScroll() {
      return {
        x: '100%'
      };
    },
    controlId() {
      return this.alarmDetail?.expertProcessControl?.id;
    }
  },
  watch: {
    alarmId: {
      handler(val) {
        this.getAlarmDetail();
      },
      immediate: true
    }
  },
  created() {
    this.setDictList();
    this.getModelList();
  },
  methods: {
    disabledDate(current) {
      return current && current > moment().endOf('day');
    },
    handlePointName,
    async showAlarmDetail(record) {
      const { resultData, status } = await alarmDetailInfo(record.alarmHandlerDataId);
      if (status === 'complete' && resultData?.ruleDetailVO?.ruleId) {
        this.drillDown({
          path: '/ruleFlow/design',
          query: { id: resultData.ruleDetailVO.ruleId }
        });
      }
    },
    /* 导出 */
    download() {
      let params = {
        page: {
          current: this.page.currentPage,
          size: this.page.pageSize
        },
        ...this.searchForm
      };
      ExportAlarmExcel(this.handleApiParams(this.handleParams(params))).then(res => {
        exportFile(res, '预警列表');
      });
    },
    statusChange() {
      if (typeof this.searchForm.status === 'number') {
        this.columns[2].filteredValue = [this.searchForm.status];
      } else if (this.searchForm.status === '') {
        this.columns[2].filteredValue = [0, 1];
      } else {
        this.columns[2].filteredValue = [];
      }
    },
    handleTableChange(page, filters) {
      if (typeof page === 'number') {
        this.getList();
        return;
      }
      let alarmStatus = filters?.alarmStatus || [];
      this.columns[2].filteredValue = alarmStatus;
      if (alarmStatus.length === 1) {
        this.searchForm.status = alarmStatus[0];
      } else if (alarmStatus.length === 2) {
        this.searchForm.status = '';
      } else {
        this.searchForm.status = undefined;
      }
      this.handleSearch();
    },
    async downloadHistory(record) {
      let dates = [];
      if (record.startTime) {
        dates = [
          {
            startTime: this.$moment(record.startTime)
              .subtract(2, 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment(record.startTime)
              .add(2, 'hours')
              .format('YYYY-MM-DD HH:mm:ss')
          }
        ];
      }
      const { resultData, status } = await alarmDetailInfo(record.alarmHandlerDataId);
      if (status === 'complete') {
        const alarmDetail = resultData || {};
        const devicePointsMap = {};
        let conditionExpressionValue = resultData.expertProcessControl?.conditionExpressionValue;
        conditionExpressionValue = conditionExpressionValue
          ? JSON.parse(conditionExpressionValue)
          : {};
        Object.keys(conditionExpressionValue).forEach(key => {
          if (key.includes('_p') && conditionExpressionValue[key].includes('_')) {
            let data = conditionExpressionValue[key].split('_');
            if (!devicePointsMap[data[0]]) {
              devicePointsMap[data[0]] = [];
            }
            devicePointsMap[data[0]].push(data[1]);
          }
        });
        const devicePoints = Object.keys(devicePointsMap).map(key => ({
          deviceId: key,
          points: Array.from(new Set(devicePointsMap[key]))
        }));
        const params = {
          dates,
          devicePoints,
          deviceType: 'INDUSTRY_DEVICE',
          displayType: [],
          period: '1',
          productCode: settingConfig.productCode,
          timeEnum: 'MINUTES',
          crossFlag: false
        };
        // 导出xls格式文件
        historyExcel(params).then(res => {
          exportFile(res, '预警历史数据', 'xls');
        });
      }
    },
    getSolutions(list) {
      this.solutionList = list;
    },
    async getModelList() {
      let params = {
        waterPlantId: this.currentAlarm.pumpId,
        solutionType: '1'
      };
      const { resultData, status } = await programmeList(params);
      if (status === 'complete') {
        const programmeList = resultData || [];
        let activeModule = {};
        let activeProgrammeArr = programmeList.filter(item => item.runningFlag);
        if (activeProgrammeArr.length > 0) {
          activeModule = activeProgrammeArr[0];
        } else {
          activeModule = programmeList[0];
        }
        this.defaultPredictionId = activeModule?.predictionId || '';
        this.predictionId = this.predictionId || activeModule?.predictionId || '';
      }
    },
    updateChart(id) {
      this.predictionId = id;
      this.getList();
    },
    setDictList() {
      this.setSearchFieldOptions(confirmStatusList, 'confirmStatus');
    },
    handleSearch() {
      this.page.currentPage = 1;
      this.alarmId = '';
      this.getList();
    },
    exportProcessAdjust() {
      const params = {
        controlId: this.alarmId
      };
      exportProcessAdjust(params).then(res => {
        exportFile(res, '工艺调整');
      });
    },
    handleReset() {
      this.remarks = '';
      this.searchForm = {
        date: [moment().subtract(1, 'months'), moment()]
      };
      this.columns[2].filteredValue = [];
      this.searchForm.alarmLevels = [];
      this.alarmId = '';
      this.getList();
    },
    async getAlarmDetail() {
      if (!this.alarmId) return;
      const { resultData, status } = await alarmDetailInfo(this.alarmId);
      if (status === 'complete') {
        this.alarmDetail = resultData;
      }
    },
    confirmAlarm(e) {
      this.$confirm({
        title: '提示',
        content: `确定采纳该方案吗？`,
        onOk: () => {
          let params = {
            confirmDesc: '已采纳',
            confirmType: '已采纳',
            alarmId: this.alarmId
          };
          alarmConfirm(params).then(res => {
            if (res.status === 'complete') {
              this.$message.success('操作成功');
              this.getAlarmDetail();
              this.getList();
            }
          });
        }
      });
    },
    async gotoPage(record) {
      let dates = [];
      if (record.startTime) {
        dates = [
          {
            startTime: this.$moment(record.startTime)
              .subtract(2, 'hours')
              .format('YYYY-MM-DD HH:mm:ss'),
            endTime: this.$moment(record.startTime)
              .add(2, 'hours')
              .format('YYYY-MM-DD HH:mm:ss')
          }
        ];
      }
      const { resultData, status } = await alarmDetailInfo(record.alarmHandlerDataId);
      if (status === 'complete') {
        const devicePointsMap = {};
        let conditionExpressionValue = resultData.expertProcessControl?.conditionExpressionValue;
        conditionExpressionValue = conditionExpressionValue
          ? JSON.parse(conditionExpressionValue)
          : {};
        Object.keys(conditionExpressionValue).forEach(key => {
          if (key.includes('_p') && conditionExpressionValue[key].includes('_')) {
            let data = conditionExpressionValue[key].split('_');
            if (!devicePointsMap[data[0]]) {
              devicePointsMap[data[0]] = [];
            }
            devicePointsMap[data[0]].push(data[1]);
          }
        });
        const devicePoints = [];
        let deviceIds = Object.keys(devicePointsMap);
        deviceIds.forEach((key, i) => {
          if (i === 0) {
            devicePoints.push(...devicePointsMap[key]);
          }
        });
        this.drillDown({
          path: '/runMonitor/historyData',
          query: {
            siteId: deviceIds.length ? deviceIds[0] : '',
            pointCode: JSON.stringify(Array.from(new Set(devicePoints)))
          }
        });
      }
    },
    handleApiParams(params) {
      params.currentPage = params.page.current;
      params.pageSize = params.page.size;
      params.alarmTypeCode = 'water_purification_zjjc';
      params.ruleType = '3';
      let sTime = params?.date?.[0]
        ? this.$moment(params.date[0]).format('YYYY-MM-DD') + ' 00:00:00'
        : '';
      let eTime = params?.date?.[1]
        ? this.$moment(params.date[1]).format('YYYY-MM-DD') + ' 23:59:59'
        : '';
      eTime =
        eTime > this.$moment().format('YYYY-MM-DD HH:mm:ss')
          ? this.$moment().format('YYYY-MM-DD HH:mm:ss')
          : eTime;
      params.startTime = sTime;
      params.endTime = eTime;
      setTimeout(() => {
        this.$refs.adoptionStatistics && this.$refs.adoptionStatistics.getData(params);
      }, 1000);
      return params;
    },
    customRow(record, rowIndex) {
      this.currentAlarm = { ...record };
      this.alarmId = this.currentAlarm.alarmHandlerDataId;
    },
    handleList() {
      if (!this.alarmId) {
        this.currentAlarm = this.dataList?.[0] || {};
        this.alarmId = this.currentAlarm.alarmHandlerDataId;
      }
    }
  }
};
</script>
<style lang="less">
.wpg-table-header {
  &::-webkit-scrollbar {
    width: 12px !important;
  }
}
</style>
<style lang="less" scoped>
@import url('@/components/SearchTable/index.less');
/deep/ .table-row-selected {
  background-color: var(--supply-color-primary-DEFAULT) !important;
  td {
    color: var(--supply-color-bg-card-DEFAULT);
    background-color: var(--supply-color-primary-DEFAULT) !important;
    .alarming {
      color: var(--supply-color-bg-card-DEFAULT) !important;
    }
    .action-icon {
      color: var(--supply-color-bg-card-DEFAULT);
    }
    .alarm-name {
      color: var(--supply-color-bg-card-DEFAULT);
    }
  }
}
/deep/ .wpg-form-item {
  margin-bottom: 0 !important;
}
.action-icon {
  cursor: pointer;
}
.alarm-name {
  cursor: pointer;
}
.search-table {
  height: 100%;
  padding: 0px;
  /deep/ .layout_1_1 {
    overflow: unset;
  }
  /deep/ .search-table__wrap {
    height: 100%;
    padding: 0;
  }
  /deep/ .table-box {
    .card-box__content {
      padding-bottom: 4px;
    }
  }
  /deep/.decision-table {
    height: 100%;
    .wpg-table-thead > tr > th {
      padding: 10px;
    }
    .wpg-table-tbody > tr > td {
      padding: 8px 10px;
    }
    .wpg-pagination-options {
      display: none;
    }
    .wpg-pagination-total-text {
      display: none;
    }
  }
  .status-wrapper {
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .alarmclose {
    width: 56px;
    height: 24px;
    background: #eeeeee;
    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    color: var(--supply-color-third);
  }
  .alarming {
    width: 56px;
    height: 24px;
    background: #f643571a;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;

    border-radius: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #f64357;
  }
  .sure {
    padding-left: 16px;
    display: flex;
    align-items: center;
  }
}
</style>
