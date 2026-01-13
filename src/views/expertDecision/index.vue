<!-- 专家决策页面 -->
<template>
  <div class="search-table">
    <!-- 布局容器 -->
    <con-layout class="search-table__wrap" :config="config">
      <!-- 表单区域 -->
      <template #form>
        <w-form-header
          :footerNewLine="false"
          :layout="layout"
          :neddRetain="false"
          :model="searchForm"
          class="search-table__header wbgc-card supply-w-full"
          :fields="searchFields"
          @search="handleSearch"
          @cancel="handleReset"
        >
          <!-- 返回控制 -->
          <template #extra>
            <return-control :is-drill-down="true"></return-control>
          </template>
        </w-form-header>
      </template>
      <!-- 表格区域 -->
      <template #table>
        <card-box class="table-box" title="预警列表">
          <PaginationTable
            class="supply-w-full decision-table"
            v-on="tableEvent"
            v-bind="tableProps"
            :pagination="{ showLessItems: true }"
            :columns="columns"
            :scroll="tableScroll"
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
            <!-- 报警状态 -->
            <template slot="alarmStatus" slot-scope="text, record">
              <div :class="{ alarmclose: text === 0, alarming: text === 1 }">
                {{ text === 0 ? '已结束' : text === 1 ? '预警中' : '' }}
              </div>
            </template>
          </PaginationTable>
        </card-box>
      </template>
      <!-- 报警诊断区域 -->
      <template #bar>
        <warn-diagnosis :alarmInfo="alarmDetail"></warn-diagnosis>
      </template>
      <!-- 采纳统计区域 -->
      <template #pie>
        <adoption-statistics
          :defaultPredictionId="defaultPredictionId"
          :alarmInfo="alarmDetail"
          :predictionId.sync="predictionId"
          :controlId="controlId"
          ref="adoptionStatistics"
          :alarmId="alarmId"
          :searchForm="searchForm"
        ></adoption-statistics>
      </template>
      <!-- 优化方案区域 -->
      <template #solution>
        <optimize-solution
          @controlId="setControlId"
          @mock="updateChart"
          :alarmId="alarmId"
          :alarmInfo="alarmDetail"
        ></optimize-solution>
      </template>
    </con-layout>
  </div>
</template>

<script>
// 导入相关依赖
import DragModal from '@/components/DragModal';
import moment from 'moment';
import { downloadDocument } from '@/api';
import {
  doConfirm,
  alarmHandlerData, // 报警分页
  alarmConfirm, // 确认报警
  alarmDetailInfo
} from '@/api/diagnosis';
import { programmeList } from '@/api/optimization';
import { Base64 } from 'js-base64';
import storage from '@/utils/storage';
import { USER_INFO } from '@/store/mutation-types';
import ConLayout from '@/components/ConLayout/ConLayout';
import CardBox from './models/CardBox';
import warnDiagnosis from './models/warnDiagnosis';
import adoptionStatistics from './models/adoptionStatistics';
import optimizeSolution from './models/optimizeSolution';
import { defaultMixin } from '@/components/SearchTable/option';
import PaginationTable from '@/components/PaginationTable/index.vue';
import {
  getContractRetrievalConfig,
  confirmStatusList,
  alarmLevelsList,
  config
} from './models/config';
import { mapState } from 'vuex';

export default {
  name: 'contractRetrieval',
  components: {
    DragModal,
    warnDiagnosis,
    optimizeSolution,
    adoptionStatistics,
    ConLayout,
    CardBox,
    PaginationTable
  },
  mixins: [defaultMixin],
  data() {
    return {
      ...getContractRetrievalConfig(this),
      config,
      predictionId: '', // 预测ID
      tableListMeth: alarmHandlerData, // 表格数据获取方法
      currentAlarm: {}, // 当前选中的报警
      dateParam: {
        date: {
          params: ['startTime', 'endTime'],
          dateFormat: 'YYYY-MM-DD'
        }
      },
      searchForm: {
        date: [moment().subtract(1, 'months'), moment()]
      },
      controlId: undefined, // 控制ID
      remarks: '', // 备注
      alarmId: '', // 报警ID
      formItem: {
        labelCol: { span: 2 },
        wrapperCol: { span: 22 }
      },
      defaultPredictionId: '', // 默认预测ID
      confirmLoading: false, // 确认加载状态
      layout: {
        span: 4,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      alarmDetail: {} // 报警详情
    };
  },
  computed: {
    // 表格滚动配置
    tableScroll() {
      return {
        x: '100%'
      };
    }
  },
  watch: {
    // 监听报警ID变化
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
    // 获取模型列表
    async getModelList() {
      let params = {
        waterPlantId: this.currentAlarm.pumpId,
        solutionType: '1'
      };
      const { resultData, status } = await programmeList(params);
      if (status === 'complete') {
        const programmeList = resultData;
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
    // 设置控制ID
    setControlId(id) {
      this.controlId = id;
    },
    // 更新图表
    updateChart(id) {
      this.predictionId = id;
      this.getList()
    },
    // 设置字典列表
    setDictList() {
      this.setFieldOptions(alarmLevelsList, 'alarmLevels');
      this.setSearchFieldOptions(confirmStatusList, 'confirmStatus');
    },
    // 搜索
    handleSearch() {
      this.page.currentPage = 1;
      this.alarmId = '';
      this.getList();
    },
    // 重置
    handleReset() {
      this.remarks = '';
      this.searchForm.alarmLevels = [];
      this.alarmId = '';
      this.getList();
    },
    // 获取报警详情
    async getAlarmDetail() {
      if (!this.alarmId) return;
      const { resultData, status } = await alarmDetailInfo(this.alarmId);
      if (status === 'complete') {
        this.alarmDetail = resultData;
      }
    },
    // 确认报警
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
    // 处理API参数
    handleApiParams(params) {
      params.currentPage = params.page.current;
      params.pageSize = params.page.size;
      params.alarmTypeCode = 'water_purification_zjjc';
      params.ruleType = '2';
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
    // 自定义行点击事件
    customRow(record, rowIndex) {
      this.currentAlarm = { ...record };
      this.alarmId = this.currentAlarm.alarmHandlerDataId;
    },
    // 处理列表数据
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
  }
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
