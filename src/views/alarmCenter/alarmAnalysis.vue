<template>
  <div class="analysis-container">
    <!-- 标签页头部 -->
    <div class="tab-container">
      <w-tabs v-model="activeKey" @change="handleTabChange">
        <w-tab-pane key="analysis" tab="智能分析"></w-tab-pane>
        <w-tab-pane key="result" tab="分析结果" :disabled="!analysisCompleted"></w-tab-pane>
      </w-tabs>
      <div class="tab-callback">
        <return-control :keep="true" :is-drill-down="true"></return-control>
      </div>
    </div>

    <!-- 智能分析内容 -->
    <div v-if="activeKey === 'analysis'" class="analysis-content">
      <!-- 进度展示区域 -->
      <div class="progress-container">
        <div class="progress-circle">
          <w-progress type="circle" :percent="analysisProgress" :width="80" />
        </div>
        <div class="analysis-status">
          <h3>{{ analysisStatusTitle }}</h3>
          <p v-if="!isShowStatusName" class="analysis-desc">{{ analysisStatusName }}</p>
        </div>
        <w-button v-if="!analysisCompleted" class="cancel-btn" @click="handleCancelOrRestart">
          {{ cancelText }}
        </w-button>
        <w-button
          v-else
          type="primary"
          class="analysis-desc analysis-result-link"
          @click="activeKey = 'result'"
        >
          查看分析结果
        </w-button>
      </div>

      <!-- 进度条 -->
      <div class="progress-bar">
        <w-progress :percent="analysisProgress" status="active" />
      </div>

      <!-- 分析项目列表 -->
      <div class="analysis-items">
        <div v-for="(item, index) in guardianList" :key="`section-${index}`" class="item-section">
          <div class="section-header" @click="toggleSection(item)">
            <w-checkbox :checked="true" disabled></w-checkbox>
            <span class="section-title">
              {{ item.groupName }}-{{ item.waterPurificationGuardianList.length }}项
            </span>
            <w-icon :type="item.expanded ? 'up' : 'down'" />
          </div>
          <div v-if="item.expanded" class="section-content">
            <div
              v-for="guardian in item.waterPurificationGuardianList"
              :key="guardian.id"
              class="content-item"
              :class="{ analyzing: guardian.analyzing }"
            >
              <div class="item-name">{{ guardian.deviceName }}</div>
              <div class="item-desc">{{ guardian.title }}</div>
              <div class="item-status" :class="getStatusClass(guardian)">
                {{ guardian.status }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 分析结果内容 -->
    <div v-if="activeKey === 'result'" class="result-content">
      <!-- <div class="score-con">
        <div class="score-display">
          <div class="score-circle">
            <div class="score-number">{{ score }}</div>
            <div class="score-label">分</div>
          </div>
          <div class="score-info">
            <div class="score-title">综合评分</div>
            <div class="score-desc" :class="getScoreClass">{{ getScoreDesc }}</div>
          </div>
        </div>
      </div> -->
      <!-- 错误汇总 -->
      <div class="error-summary">
        <div class="error-icon">
          <w-icon type="warning" theme="filled" />
        </div>
        <div class="error-text">
          <h3>存在{{ errCount }}项问题，需要处理</h3>
          <p>对污水处理过程中{{ analysisTitles }}等进行了全面分析</p>
        </div>
      </div>

      <!-- 错误详情列表 -->
      <div class="error-items">
        <div v-for="(item, index) in waterQualityAnalysisList" :key="`error-${index}`">
          <div v-if="item.result" class="error-item">
            <div class="error-badge">
              <w-badge status="error" />
            </div>
            <div class="error-content">
              <div class="error-detail">
                <!-- <div class="detail-row">
                  <div class="detail-label">{{ item.groupName }}异常</div>
                </div> -->
                <div class="detail-row">
                  <div class="detail-label">{{ item.deviceName }}</div>
                  <div class="detail-value">{{ item.resultDesc }}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- 操作按钮 -->
      <div class="action-buttons">
        <w-button @click="handleClose" class="cancel-btn">取消</w-button>
        <w-button @click="handleAdd" type="primary">派单</w-button>
      </div>
    </div>

    <!-- 派单弹框 -->
    <ticket-dialog ref="ticketDialog" :templateType="'zhjs-xjgd'" :templateData="templateData" />
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import { getJudgmentRulesDevice, alarmHandlerData, getAlarmAnalysis } from '@/api/diagnosis';
import TicketDialog from '@/components/TicketDialog/index';

// 常量定义
const ANALYSIS_DELAY = 2000; // 分析每一项的延迟时间
const TRANSITION_DELAY = 200; // 项目之间的过渡时间
const STATUS_TYPES = {
  PENDING: '待分析',
  ANALYZING: '分析中',
  NORMAL: '正常',
  ERROR: '异常',
  CANCELED: '已取消'
};

export default {
  name: 'AlarmAnalysis',
  components: {
    TicketDialog
  },
  inject: {
    closeTab: {
      default: () => {}
    }
  },
  data() {
    return {
      // 基础数据
      waterPlantId: '',
      activeKey: 'analysis',

      // 分析状态
      isCanceled: false,
      currentAnalyzingItem: null,
      analysisCompleted: false,
      completedItems: 0,

      // 守护组列表
      deviceItems: [],
      guardianList: [],
      score: 100, //评分

      // 分析结果数据
      deviceAlarmsList: [],
      waterQualityAnalysisList: [],
      processControlAnalysisList: [],

      // 工单相关
      templateData: null,
      record: null
    };
  },
  computed: {
    // 错误数量统计
    errCount() {
      return (
        this.deviceAlarmsList.length +
        this.waterQualityAnalysisList.length +
        this.processControlAnalysisList.length
      );
    },

    // 总项目数
    totalItems() {
      if (!Array.isArray(this.guardianList)) {
        return 0;
      }
      return this.guardianList.reduce((total, item) => {
        if (item?.waterPurificationGuardianList?.length) {
          total += item.waterPurificationGuardianList.length;
        }
        return total;
      }, 0);
    },

    // 分析标题
    analysisTitles() {
      return this.guardianList
        .map(item => item.groupName)
        .filter(Boolean)
        .join('、');
    },

    // 分析进度百分比
    analysisProgress() {
      if (this.totalItems === 0) return 0;
      return Math.floor((this.completedItems / this.totalItems) * 100);
    },

    // 当前分析状态描述
    analysisStatusName() {
      if (this.currentAnalyzingItem) {
        return `正在分析${this.currentAnalyzingItem.deviceName}`;
      }
      return '正在准备分析...';
    },

    // 是否显示状态名称
    isShowStatusName() {
      return this.analysisCompleted || this.isCanceled;
    },

    // 分析状态标题
    analysisStatusTitle() {
      if (this.isCanceled) return '分析已取消';
      if (this.analysisCompleted) return '分析已完成';
      return '智能分析中';
    },

    // 取消按钮文本
    cancelText() {
      return this.isCanceled ? '重新分析' : '取消分析';
    },

    // 取消按钮是否禁用
    cancelDisabled() {
      return this.isCanceled || this.analysisCompleted;
    },

    // 获取评分等级描述
    getScoreDesc() {
      if (this.score >= 90) return '优秀';
      if (this.score >= 60) return '良好';
      return '建议优化';
    },

    // 获取评分样式类
    getScoreClass() {
      if (this.score >= 90) return 'score-excellent';
      if (this.score >= 60) return 'score-good';
      return 'score-poor';
    }
  },
  async mounted() {
    await this.getWaterPlant();
    await this.getGuardianList();
  },
  activated() {
    this.resetAllData();
  },
  deactivated() {
    this.resetAllData();
  },
  methods: {
    // ==================== 工具方法 ====================

    /**
     * 获取状态样式类
     * @param {Object} guardian - 守护项对象
     * @returns {Object} 样式类对象
     */
    getStatusClass(guardian) {
      return {
        analyzing: guardian.analyzing,
        canceled: guardian.status === STATUS_TYPES.CANCELED,
        pending: guardian.status === STATUS_TYPES.PENDING,
        error: guardian.status === STATUS_TYPES.ERROR
      };
    },

    /**
     * 初始化守护项状态
     * @param {Object} guardian - 守护项对象
     * @returns {Object} 初始化后的守护项
     */
    initGuardianStatus(guardian) {
      return {
        ...guardian,
        status: STATUS_TYPES.PENDING,
        analyzing: false,
        code: '',
        value: '0',
        isAlarm: guardian.result == '1' ? true : false,
        value: guardian.result + '',
        exceptionItem: guardian.resultDesc ? [guardian.resultDesc] : []
      };
    },

    /**
     * 重置守护项状态
     * @param {Object} guardian - 守护项对象
     */
    resetGuardianStatus(guardian) {
      guardian.status = STATUS_TYPES.PENDING;
      guardian.analyzing = false;
      guardian.value = '0';
    },

    /**
     * 滚动到指定元素
     * @param {String} selector - CSS选择器
     */
    async scrollToElement(selector) {
      await this.$nextTick();
      const element = document.querySelector(selector);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    },

    // ==================== 数据获取方法 ====================

    /**
     * 获取水厂信息
     */
    async getWaterPlant() {
      try {
        const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
        this.waterPlantId = resultData?.[0]?.id || '';
      } catch (error) {
        console.error('获取水厂信息失败:', error);
      }
    },
    /**
     * 获取守护组列表数据
     */
    async getGuardianList() {
      try {
        const res = await getJudgmentRulesDevice(this.waterPlantId);
        if (res.status === 'complete') {
          this.deviceItems = res.resultData;
          this.guardianList = [
            {
              createBy: '',
              createTime: '',
              groupCode: null,
              groupName: '污水处理设备检测',
              id: 1,
              updateBy: null,
              updateTime: null,
              isAlarm: false,
              expanded: true,
              waterPurificationGuardianList: res.resultData
                .filter(item => item.type === 0)
                .map(guardian => this.initGuardianStatus(guardian))
            },
            {
              createBy: '',
              createTime: '',
              groupCode: null,
              groupName: '水质范围检测',
              id: 2,
              updateBy: null,
              updateTime: null,
              isAlarm: false,
              expanded: true,
              waterPurificationGuardianList: res.resultData
                .filter(item => item.type === 1)
                .map(guardian => this.initGuardianStatus(guardian))
            }
          ];
          await this.getAlarmAnalysis();
        }
      } catch (error) {
        console.error('获取守护组列表失败:', error);
      }
    },

    /**
     * 获取报警分析数据
     */
    async getAlarmAnalysis() {
      try {
        // this.score = resultData.score;
        this.waterQualityAnalysisList = this.deviceItems.filter(item => item.result === 1);
        // this.updateGuardianAlarmStatus();
        this.startAnalysis();
      } catch (error) {
        console.error('获取报警分析数据失败:', error);
      }
    },

    /**
     * 更新守护项报警状态
     */
    updateGuardianAlarmStatus() {
      this.guardianList.forEach(item => {
        if (!item?.waterPurificationGuardianList) return;

        item.waterPurificationGuardianList.forEach(guardian => {
          const guardianItem = this.waterQualityAnalysisList.find(item => item.id === guardian.id);

          if (guardianItem) {
            item.isAlarm = true;
            guardian.value = '1';
            guardian.exceptionItem = guardianItem.exceptionItem || [];
          }
        });
      });
    },
    // ==================== 状态管理方法 ====================

    /**
     * 重置所有数据到初始状态
     */
    resetAllData() {
      // 重置分析状态
      this.isCanceled = false;
      this.currentAnalyzingItem = null;
      this.analysisCompleted = false;
      this.completedItems = 0;
      this.activeKey = 'analysis';

      // 重置列表数据
      this.deviceAlarmsList = [];
      this.waterQualityAnalysisList = [];
      this.processControlAnalysisList = [];

      // 重置所有项目状态
      this.resetAllGuardianStatus();
    },

    /**
     * 重置所有守护项状态
     */
    resetAllGuardianStatus() {
      if (!Array.isArray(this.guardianList)) return;

      this.guardianList.forEach(item => {
        if (item?.waterPurificationGuardianList) {
          item.waterPurificationGuardianList.forEach(guardian => {
            this.resetGuardianStatus(guardian);
          });
        }
      });
    },

    /**
     * 重置分析状态（用于重新分析）
     */
    resetAnalysis() {
      this.resetAllGuardianStatus();

      // 重置分析状态
      Object.assign(this.$data, {
        isCanceled: false,
        completedItems: 0,
        analysisCompleted: false,
        currentAnalyzingItem: null
      });
    },
    // ==================== 事件处理方法 ====================

    /**
     * 关闭页面
     */
    handleClose() {
      this.resetAllData();
      const {
        $route: { path }
      } = this;
      this.closeTab(path, '/alarmCenter');
    },

    /**
     * 标签页切换
     * @param {String} key - 标签页key
     */
    handleTabChange(key) {
      if (key === 'result' && !this.analysisCompleted && !this.isCanceled) {
        return;
      }
      this.activeKey = key;
    },

    /**
     * 切换分组展开状态
     * @param {Object} item - 分组项
     */
    toggleSection(item) {
      item.expanded = !item.expanded;
    },

    /**
     * 取消或重新分析
     */
    handleCancelOrRestart() {
      if (this.isCanceled) {
        this.resetAnalysis();
        this.getAlarmAnalysis();
      } else {
        this.cancelAnalysis();
      }
    },
    // ==================== 分析相关方法 ====================

    /**
     * 取消分析
     */
    cancelAnalysis() {
      this.isCanceled = true;
      this.currentAnalyzingItem = null;

      // 取消所有未完成的项目
      this.guardianList.forEach(item => {
        if (item?.waterPurificationGuardianList) {
          item.waterPurificationGuardianList.forEach(guardian => {
            if (guardian.analyzing || guardian.status === STATUS_TYPES.PENDING) {
              guardian.analyzing = false;
              guardian.status = STATUS_TYPES.CANCELED;
            }
          });
        }
      });

      this.$message.info('已取消分析');
    },

    /**
     * 开始分析
     */
    startAnalysis() {
      this.isCanceled = false;
      this.completedItems = 0;
      this.analysisCompleted = false;
      this.currentAnalyzingItem = null;
      this.analyzeMainItems();
    },
    /**
     * 分析单个项目
     * @param {Object} item - 守护项对象
     * @returns {Promise<boolean>} 分析是否成功
     */
    async analyzeItem(item) {
      if (this.isCanceled) return false;

      this.currentAnalyzingItem = item;
      item.status = STATUS_TYPES.ANALYZING;
      item.analyzing = true;

      // 滚动到当前分析项
      await this.scrollToElement('.content-item.analyzing');

      try {
        await new Promise(resolve => setTimeout(resolve, ANALYSIS_DELAY));

        if (!this.isCanceled) {
          // 根据value值设置状态
          item.status = item.value === '1' ? STATUS_TYPES.ERROR : STATUS_TYPES.NORMAL;
          item.analyzing = false;
          this.completedItems++;
          return true;
        }
      } catch (error) {
        console.error('分析项目失败:', error);
        item.analyzing = false;
        item.status = STATUS_TYPES.ERROR;
      }

      return false;
    },

    /**
     * 分析主项
     */
    async analyzeMainItems() {
      if (this.isCanceled) return;

      for (let i = 0; i < this.guardianList.length; i++) {
        const item = this.guardianList[i];
        if (item?.waterPurificationGuardianList) {
          await this.analyzeGuardianList(item.waterPurificationGuardianList, i);
        }
      }
    },

    /**
     * 分析守护项列表
     * @param {Array} guardianList - 守护项列表
     * @param {Number} idx - 当前主项索引
     */
    async analyzeGuardianList(guardianList, idx) {
      if (this.isCanceled) return;

      for (let i = 0; i < guardianList.length; i++) {
        const success = await this.analyzeItem(guardianList[i]);

        if (this.isCanceled) return;

        if (success) {
          await new Promise(resolve => setTimeout(resolve, TRANSITION_DELAY));
        }

        // 检查是否为最后一个项目
        if (idx === this.guardianList.length - 1 && i === guardianList.length - 1 && success) {
          this.analysisCompleted = true;
          this.currentAnalyzingItem = null;
          return;
        }
      }
    },

    // ==================== 工单相关方法 ====================

    /**
     * 处理派单
     */
    handleAdd() {
      const { alarmHandlerDataId, addr, deviceId, orgId, alarmName, pumpId, solutionId } =
        this.record || {};

      this.templateData = {
        id: alarmHandlerDataId,
        orgIds: orgId,
        deviceIds: deviceId,
        pumpId,
        solutionId,
        content: alarmName,
        ticketAddress: {
          address: addr || '',
          point: {}
        },
        type: 0,
        workSource: 'homeCall'
      };

      if (this.$refs.ticketDialog) {
        this.$refs.ticketDialog.visible = true;
      }
    }
  }
};
</script>

<style scoped>
.analysis-container {
  background-color: var(--supply-color-bg-card-DEFAULT);
  width: 100%;
  height: 100%;
}

:deep(.wpg-select-selection) {
  height: 33px !important;
  border: none !important;
}
:deep(.wpg-select-selection-selected-value) {
  font-size: 16px !important;
  color: var(--supply-color-main) !important;
  font-weight: 500 !important;
}

.tab-container {
  background-color: var(--supply-color-bg-card-DEFAULT);
  position: relative;
  .tab-callback {
    position: absolute;
    right: 3px;
    top: 0px;
  }
  .alarm-title {
    line-height: 36px;
    position: absolute;
    left: 50%;
    top: 0%;
    transform: translateX(-50%);
    font-size: 16px;
    color: var(--supply-color-main);
  }
}
.analysis-content {
  height: calc(100% - 52px);
}
.analysis-content,
.result-content {
  background-color: var(--supply-color-bg-card-DEFAULT);
  padding: 6px 20px 20px;
  border-radius: 4px;
}
.analysis-items {
  width: 100%;
  height: calc(100% - 142px);
  overflow-y: auto;
}

/* 智能分析样式 */
.progress-container {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
}

.progress-circle {
  margin-right: 20px;
}

.analysis-status {
  flex: 1;
}

.analysis-status h3 {
  margin: 0;
  font-size: 18px;
  color: var(--supply-color-main);
}

.analysis-status p {
  margin: 5px 0 0;
  color: var(--supply-color-secondary);
}

.cancel-btn {
  margin-left: auto;
}

.progress-bar {
  margin-bottom: 20px;
}

.item-section {
  margin-bottom: 15px;
  border: 1px solid #e8e8e8;
  border-radius: 4px;
}

.section-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  background-color: #f7f7f7;
  cursor: pointer;
}

.section-title {
  margin-left: 8px;
  flex: 1;
  font-weight: 500;
}

.section-content {
  padding: 0;
}

.content-item {
  display: flex;
  padding: 12px 16px;
  border-top: 1px solid #f0f0f0;
  transition: all 0.3s ease;
}

.content-item.analyzing {
  background-color: rgba(24, 144, 255, 0.1);
  border-left: 3px solid #1890ff;
  padding-left: 13px; /* 补偿边框宽度，保持内容对齐 */
}

.item-name {
  flex: 1;
  color: var(--supply-color-main);
}

.item-desc {
  flex: 1;
  color: var(--supply-color-secondary);
}

.item-status {
  width: 92px;
  text-align: center;
  color: #52c41a;
  position: relative;
  padding-right: 24px; /* 为动画图标留出空间 */
}

.item-status.analyzing {
  color: #1890ff;
}

.item-status.canceled {
  color: #999;
}

.item-status.pending {
  color: #999999;
}

.item-status.error {
  color: #f5222d;
}

/* 修改选择器特异性，确保只在状态元素上显示动画 */
.item-status.analyzing::after {
  content: '';
  position: absolute;
  top: 50%;
  right: 0;
  width: 16px;
  height: 16px;
  margin-top: -8px;
  border: 2px solid #1890ff;
  border-top-color: transparent;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}

/* 评分显示样式 */
.score-con {
  margin-bottom: 20px;
}

.score-display {
  display: flex;
  align-items: center;
  padding: 24px;
  background-color: #ffffff;
  border-radius: 12px;
  border: 1px solid #f0f0f0;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
}

.score-circle {
  position: relative;
  width: 100px;
  height: 100px;
  margin-right: 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #8b5cf6 0%, #a855f7 50%, #c084fc 100%);
  border-radius: 50%;
  color: white;
  box-shadow: 0 8px 24px rgba(139, 92, 246, 0.25);
}

.score-number {
  font-size: 32px;
  font-weight: 700;
  line-height: 1;
  margin-bottom: 2px;
}

.score-label {
  font-size: 14px;
  font-weight: 500;
  opacity: 0.9;
}

.score-info {
  flex: 1;
}

.score-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--supply-color-main);
  margin-bottom: 12px;
}

.score-desc {
  font-size: 14px;
  font-weight: 500;
  padding: 8px 16px;
  border-radius: 20px;
  display: inline-block;
  transition: all 0.3s ease;
}

.score-excellent {
  background-color: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.score-good {
  background-color: #f0fdf4;
  color: #16a34a;
  border: 1px solid #bbf7d0;
}

.score-poor {
  background-color: #fff7ed;
  color: #ea580c;
  border: 1px solid #fed7aa;
}

/* 分析结果样式 */
.error-summary {
  display: flex;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px;
  background-color: #fff1f0;
  border: 1px solid #ffccc7;
  border-radius: 4px;
}

.error-icon {
  font-size: 32px;
  color: #f5222d;
  margin-right: 16px;
}

.error-text h3 {
  margin: 0;
  color: #f5222d;
  font-size: 16px;
}

.error-text p {
  margin: 5px 0 0;
  color: #666;
}

.error-items {
  margin-bottom: 20px;
}

.error-item {
  display: flex;
  margin-bottom: 16px;
  padding-bottom: 16px;
  border-bottom: 1px solid #f0f0f0;
}

.error-badge {
  margin-right: 12px;
  padding-top: 4px;
}

.error-content {
  flex: 1;
}

.error-title {
  font-weight: 500;
  margin-bottom: 8px;
}

.detail-row {
  display: flex;
  margin-bottom: 4px;
}

.detail-label {
  width: 120px;
  color: var(--supply-color-secondary);
}

.detail-value {
  flex: 1;
}

.action-buttons {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .content-item {
    flex-direction: column;
  }

  .item-name,
  .item-desc {
    margin-bottom: 8px;
  }

  .item-status {
    width: 100%;
    text-align: left;
  }

  .detail-row {
    flex-direction: column;
  }

  .detail-label {
    width: 100%;
    margin-bottom: 4px;
  }
}

.analysis-desc {
  margin: 5px 0 0;
  color: var(--supply-color-secondary);
}

.analysis-result-link {
  color: #ffffff;
  cursor: pointer;
}
</style>
