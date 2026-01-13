<!--
 * @Description:
 * @Author: limz
 * @Date: 2021-08-12 19:31:40
 * @LastEditTime: 2024-12-12 19:10:28
 * @LastEditors: yuan wenyu
-->
<template>
  <div class="inspect-list">
    <w-row class="inspect-header supply-bg-bg-card-DEFAULT">
      <w-form-model
        ref="formSearch"
        layout="inline"
        :model="formSearch"
        @submit="queryData"
        @submit.native.prevent
      >
        <w-col class="supply-float-left">
          <w-form-model-item label="" prop="inspectionStatus">
            <w-radio-group
              v-model="formSearch.inspectionStatus"
              button-style="solid"
              @change="changeStatus"
            >
              <w-radio-button :value="0">
                待巡检
              </w-radio-button>
              <w-radio-button :value="2">
                已巡检
              </w-radio-button>
              <w-radio-button :value="-1">
                未巡检
              </w-radio-button>
            </w-radio-group>
          </w-form-model-item>
        </w-col>
        <w-col
          v-show="formSearch.inspectionStatus === 2 || formSearch.inspectionStatus === -1"
          class="supply-float-left"
        >
          <w-form-model-item label="巡检日期" prop="date">
            <w-range-picker
              v-model="formSearch.date"
              style="width: 285px"
              :disabled-date="disabledDate"
              :allowClear="false"
              format="YYYY-MM-DD"
            />
          </w-form-model-item>
        </w-col>
        <w-col v-show="formSearch.inspectionStatus === 2" class="supply-float-left">
          <w-form-model-item label="巡检结果" prop="inspectionResult">
            <w-select v-model="formSearch.inspectionResult" style="width: 120px">
              <w-select-option value="">全部</w-select-option>
              <w-select-option :value="0">正常</w-select-option>
              <w-select-option :value="1">异常</w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col class="supply-float-left">
          <w-form-model-item
            :label="
              formSearch.inspectionStatus === 2 || formSearch.inspectionStatus === -1
                ? '巡检人'
                : '模糊搜索'
            "
            prop="keyWord"
          >
            <w-input
              v-model="formSearch.keyWord"
              :placeholder="
                formSearch.inspectionStatus === 2 || formSearch.inspectionStatus === -1
                  ? '巡检人'
                  : '巡检内容/巡检人'
              "
              style="min-width: 200px;"
            >
            </w-input>
          </w-form-model-item>
        </w-col>
        <w-col class="supply-float-left">
          <w-form-model-item>
            <w-button icon="reload" @click="reset">重置</w-button>
            <w-button icon="search" class="supply-ml-3" type="primary" html-type="submit"
              >查询</w-button
            >
          </w-form-model-item>
        </w-col>
        <w-col class="supply-float-right">
          <w-form-model-item>
            <return-control :is-drill-down="true"></return-control>
          </w-form-model-item>
        </w-col>
        <w-col
          v-show="formSearch.inspectionStatus === 2"
          class="supply-float-right"
          v-permission:button="'inspectList-ok-export'"
        >
          <w-form-model-item>
            <w-button @click="exportExcel">导出</w-button>
          </w-form-model-item>
        </w-col>
        <w-col
          v-show="formSearch.inspectionStatus === 0"
          class="supply-float-right"
          v-permission:button="'inspectList-wait-export'"
        >
          <w-form-model-item>
            <w-button @click="waitExportExcel">导出</w-button>
          </w-form-model-item>
        </w-col>

        <w-col
          v-show="formSearch.inspectionStatus === -1"
          class="supply-float-right"
          v-permission:button="'inspectList-un-export'"
        >
          <w-form-model-item>
            <w-button @click="unInspectionExportExcel">导出</w-button>
          </w-form-model-item>
        </w-col>

        <w-col class="supply-float-right" v-permission:button="'inspectList-template-export'">
          <w-form-model-item>
            <w-button @click="sheetModalVisible = true">线上巡检报表</w-button>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
    <w-config-provider>
      <template v-if="data.length <= 0" #renderEmpty>
        <w-empty></w-empty>
      </template>
      <div id="inspectBody" class="inspect-body supply-bg-bg-card-DEFAULT">
        <w-table
          :loading="loading"
          :columns="columns"
          :data-source="data"
          :pagination="false"
          :scroll="{ y: 'calc(100vh - 290px)', x: 1400 }"
          :rowKey="record => record.id"
        >
          <span slot="cycle" slot-scope="text, record">
            {{ record.everyCycleTimes }}
            {{ cycleType[record.cycleType] }}
            {{ record.cycleTimes }}次
          </span>
          <span slot="action" slot-scope="text, record">
            <a
              v-show="formSearch.inspectionStatus === 0"
              :class="{ 'supply-text-third unactive': timeOut(record.planEndTime) }"
              @click="startInspect(record)"
            >
              开始巡检
            </a>
            <a
              v-show="
                formSearch.inspectionStatus === 2 ||
                  (record.inspectionStatus === -1 && record.pumpOfflineSkip === 0)
              "
              @click="inspectReport(record.id, record.waterPlantName)"
            >
              巡检报告
            </a>
          </span>
          <span slot="inspectionResultName" slot-scope="text, record">
            <span
              v-if="text === '异常'"
              class="supply-text-primary curp"
              @click="anomalyDetails(record)"
            >
              {{ record.excCount }}项{{ text }}
            </span>
            <span v-else>{{ text }}</span>
          </span>

          <!-- 未巡检 巡检状态处理 -->
          <span slot="inspectionStatusName" slot-scope="text, record">
            <span
              v-if="record.pumpOfflineSkip === 0"
              class="supply-text-primary curp"
              @click="pumpOfflineDetail(record)"
            >
              离线，未巡检成功
            </span>
            <span
              v-else-if="record.pumpOfflineSkip === 1"
              class="supply-text-primary curp"
              @click="pumpOfflineDetail(record)"
            >
              离线，跳过
            </span>
            <span v-else>未巡检</span>
          </span>
        </w-table>
        <w-pagination
          v-show="total > 0"
          class="pagination"
          show-size-changer
          :current="page.current"
          :total="total"
          :pageSize="page.size"
          :show-total="total => `共 ${total} 条`"
          @change="pageChange"
          @showSizeChange="onShowSizeChange"
        />
      </div>
    </w-config-provider>

    <!-- 巡检报告 -->
    <inspect-report ref="reportModal" :planInfo="planInfo" @change="showImg" />

    <!-- 异常 -->
    <anomaly-details ref="anomalyDetails" :planId="planInfo.id" :planInfo="planInfo" />

    <!-- 泵房离线 -->
    <pump-offline-detail
      ref="pumpOfflineDetail"
      :planId="planInfo.id"
      :planInfo="planInfo"
    ></pump-offline-detail>

    <w-modal
      class="secondary-modal"
      v-if="bigImgVisible"
      v-model="bigImgVisible"
      wrapClassName="report-modal"
      title="预览"
      centered
      :width="720"
      :footer="false"
      @cancel="hideImgPreview"
    >
      <img class="big-img" style="width: 100%;" :src="previewImg" />
      <w-button class="hide-btn" type="primary" @click="hideImgPreview">返回</w-button>
    </w-modal>

    <inspect-sheet-modal
      v-if="sheetModalVisible"
      :visible.sync="sheetModalVisible"
    ></inspect-sheet-modal>
  </div>
</template>

<script>
import moment from 'moment';
import {
  GetInspectioRecord, // 分页查询
  ExportReportExcel, // 已巡检导出
  getOfflineStatus, //获取是否离线
  waitExport, // 待巡检导出
  unInspectionExport, // 未巡检导出
  autoInspection // 自动巡检
} from '@/api/home';
import { exportFile } from '@/utils/util';

const columns0 = [
  {
    title: '序号',
    dataIndex: 'num',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '巡检内容',
    dataIndex: 'inspectionContent',
    ellipsis: true
  },
  {
    title: '计划开始日期',
    dataIndex: 'planStartTime',
    ellipsis: true
  },
  {
    title: '计划截止日期',
    dataIndex: 'planEndTime',
    ellipsis: true
  },
  {
    title: '巡检状态',
    dataIndex: 'inspectionStatusName',
    customRender: (text, row, index) => {
      return row.ifOffline ? row.ifOffline + '-待巡检' : '待巡检';
    }
  },
  {
    title: '巡检人',
    dataIndex: 'userNames',
    ellipsis: true
  },
  {
    title: '操作',
    fixed: 'right',
    width: 90,
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
];
const columns_1 = [
  {
    title: '序号',
    dataIndex: 'num',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '巡检内容',
    dataIndex: 'inspectionContent',
    ellipsis: true
  },
  {
    title: '计划开始日期',
    dataIndex: 'planStartTime',
    ellipsis: true
  },
  {
    title: '计划截止日期',
    dataIndex: 'planEndTime',
    ellipsis: true
  },
  {
    title: '巡检状态',
    dataIndex: 'inspectionStatusName',
    scopedSlots: { customRender: 'inspectionStatusName' }
  },
  {
    title: '巡检人',
    dataIndex: 'userNames',
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 90,
    scopedSlots: { customRender: 'action' }
  }
];
const columns2 = [
  {
    title: '序号',
    dataIndex: 'num',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '巡检周期',
    dataIndex: 'cycle',
    ellipsis: true,
    scopedSlots: { customRender: 'cycle' }
  },
  {
    title: '巡检开始日期',
    dataIndex: 'planStartTime',
    ellipsis: true
  },
  {
    title: '巡检完成日期',
    dataIndex: 'inspectionFinishTime',
    ellipsis: true
  },
  {
    title: '巡检结果',
    dataIndex: 'inspectionResultName',
    ellipsis: true,
    scopedSlots: { customRender: 'inspectionResultName' }
  },
  {
    title: '巡检人',
    dataIndex: 'inspectionUserName',
    ellipsis: true
  },
  {
    title: '操作',
    fixed: 'right',
    dataIndex: 'action',
    width: 90,
    scopedSlots: { customRender: 'action' }
  }
];
export default {
  name: 'InspectList',
  components: {
    InspectReport: () => import('./components/InspectReport.vue'),
    AnomalyDetails: () => import('./components/AnomalyDetails.vue'),
    InspectSheetModal: () => import('./components/InspectSheetModal.vue'),
    pumpOfflineDetail: () => import('./components/pumpOfflineDetail.vue')
  },
  data() {
    return {
      loading: false,
      moment,
      formSearch: {
        inspectionResult: '',
        inspectionStatus: 0, // 0:未巡检 1:巡检中 2:巡检结束 -1:巡检超时
        keyWord: '',
        date: undefined
      },
      columns0,
      columns2,
      columns_1,
      data: [],
      total: 0,
      page: {
        size: 20,
        current: 1
      },
      cycleType: ['周', '月', '季', '年'],
      planInfo: {
        id: ''
      },
      bigImgVisible: false,
      previewImg: '',
      domStr: '',
      sheetModalVisible: false
    };
  },
  computed: {
    columns() {
      return this[('columns' + this.formSearch.inspectionStatus).replace('-', '_')];
    },
    timeOut() {
      return time => {
        return moment().diff(moment(time), 'days') > 0;
      };
    }
  },
  mounted() {
    this.init();
  },

  activated() {
    if (this.$route.query.drillDownTime && this.drillDownTime !== this.$route.query.drillDownTime) {
      this.resetOptions();
      this.init();
    }
  },

  methods: {
    init() {
      // 接收url query参数
      let {
        sessionStorageId,
        inspectionResult,
        inspectionStatus,
        keyWord,
        date,
        drillDownTime
      } = this.$route.query;
      this.drillDownTime = drillDownTime;
      // 处理sessionStorageId
      if (sessionStorageId) {
        let param = JSON.parse(sessionStorage.getItem(sessionStorageId) || '{}');
        if (param.date) {
          param.date = [
            this.$moment(param.date.split(',')[0]),
            this.$moment(param.date.split(',')[1])
          ];
        }
        if (param.inspectionStatus) {
          param.inspectionStatus = Number(param.inspectionStatus);
        }
        if (param.inspectionResult) {
          param.inspectionResult = Number(param.inspectionResult);
        }
        this.formSearch = {
          ...this.formSearch,
          ...param
        };
      }
      if (inspectionResult) {
        this.formSearch.inspectionResult = Number(inspectionResult);
      }
      if (inspectionResult === '') {
        this.formSearch.inspectionResult = inspectionResult;
      }
      if (inspectionStatus) {
        this.formSearch.inspectionStatus = Number(inspectionStatus);
      }
      if (date) {
        this.formSearch.date = [this.$moment(date.split(',')[0]), this.$moment(date.split(',')[1])];
      }
      if (keyWord) {
        this.formSearch.keyWord = keyWord;
      }

      this.queryData();
    },

    hideImgPreview() {
      this.bigImgVisible = false;
      this.$refs[this.domStr].visible = true;
    },

    showImg(status, url, domStr) {
      this.bigImgVisible = status;
      this.previewImg = url;
      this.domStr = domStr || '';
    },

    /* 查看异常信息 */
    anomalyDetails(record) {
      this.planInfo = record;
      this.$refs.anomalyDetails.visible = true;
    },

    // 查看泵房离线信息
    pumpOfflineDetail(record) {
      this.planInfo = record;
      this.$refs.pumpOfflineDetail.visible = true;
    },
    /* 已巡检导出 */
    exportExcel() {
      let params = this.setParams();
      ExportReportExcel(params).then(res => {
        exportFile(res, '已巡检列表');
      });
    },
    /* 待巡检导出 */
    waitExportExcel() {
      let params = this.setParams();
      waitExport(params).then(res => {
        exportFile(res, '待巡检列表');
      });
    },

    /* 未巡检导出 */
    unInspectionExportExcel() {
      let params = this.setParams();
      unInspectionExport(params).then(res => {
        exportFile(res, '未巡检列表');
      });
    },

    /* 查看巡检报告 */
    inspectReport(id, name) {
      this.$refs.reportModal.visible = true;
      this.planInfo = { id, name };
    },

    /* 重置 */
    reset() {
      this.resetOptions();
      this.queryData();
    },
    resetOptions() {
      let obj = {
        formSearch: {
          inspectionStatus: this.formSearch.inspectionStatus,
          inspectionResult: '',
          keyWord: '',
          date: undefined
        },
        page: {
          size: 20,
          current: 1
        }
      };
      Object.assign(this, obj);
    },

    /* 查询参数 */
    setParams() {
      let { inspectionStatus, keyWord, date, inspectionResult } = this.formSearch;
      // 待巡检不需要传递日期参数
      let dateFlag = date && inspectionStatus !== 0;
      let params = {
        inspectionStatus,
        page: this.page,
        keyWord,
        startDateStr: dateFlag ? moment(date[0]).format('YYYY-MM-DD 00:00:00') : '',
        endDateStr: dateFlag ? moment(date[1]).format('YYYY-MM-DD 23:59:59') : ''
      };
      if (inspectionStatus === 2) {
        params.inspectionResult = inspectionResult;
      }
      return params;
    },

    async queryData() {
      this.loading = true;
      let params = this.setParams();
      let res = await GetInspectioRecord(params);
      let {
        status,
        resultData: { records, total }
      } = res;
      if (status === 'complete') {
        if (params.inspectionStatus === 0) {
          let offlineStatusList = await getOfflineStatus({ ids: records.map(item => item.pumpId) });
          if (offlineStatusList.resultData) {
            records.map(item => {
              item.ifOffline =
                offlineStatusList.resultData.find(itemStatus => itemStatus.nodeId === item.pumpId)
                  ?.status === '0'
                  ? '离线'
                  : '';
            });
          }
        }
        this.data = records;
        this.total = total;
        this.loading = false;
      } else {
        this.loading = false;
      }
    },
    disabledDate(current) {
      return current && current > moment().endOf('day');
    },

    startInspect(data) {
      console.log('data', data);
      this.$confirm({
        title: '提示',
        content: '您确定要进行此操作吗',
        onOk: () => {
          autoInspection(data.id).then(res => {
            if (res.status === 'complete') {
              this.$message.success('自动巡检成功');
            }
          });
        }
      });
    },
    onShowSizeChange(page, pageSize) {
      this.page.current = 1;
      this.page.size = pageSize;
      this.queryData();
    },

    pageChange(page, pageSize) {
      this.page.current = page;
      this.queryData();
    },

    changeStatus(e) {
      this.queryData();
    }
  }
};
</script>

<style scoped lang="less">
/deep/ .ant-modal {
  .ant-modal-header {
    background-color: #f6f6f6 !important;
    padding: 12px 24px;
    .ant-modal-title {
      font-size: 16px;
    }
  }
  .ant-modal-body {
    padding: 0 0 60px 0;
    font-size: 14px;
  }
}
/deep/ .report-modal {
  .ant-modal-body {
    padding: 24px 20px 70px;
    position: relative;
    .hide-btn {
      width: 92px;
      height: 28px;
      position: absolute;
      right: 20px;
      bottom: 20px;
    }
  }
}
.inspect-list {
  width: 100%;
  height: 100%;
  padding: 0 12px 12px;
  .inspect-header {
    padding: 8px 16px;
    border-radius: 4px;
    margin-bottom: 10px;
    .ant-form-inline .ant-form-item {
      margin-right: 10px;
    }
  }
  .inspect-body {
    border-radius: 4px;
    height: calc(100% - 66px);
    .pagination {
      width: 100%;
      text-align: right;
      padding: 12px;
    }
    .curp {
      cursor: pointer;
    }
    .unactive {
      cursor: auto;
    }
  }
}
</style>
