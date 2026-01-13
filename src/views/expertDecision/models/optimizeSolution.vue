<!-- 优化方案组件 -->
<template>
  <card-box title="优化方案">
    <div class="solution-box">
      <!-- 操作区域 -->
      <div class="action">
        <div class="control">
          <!-- 进水参数选择 -->
          <div class="target">
            进水参数：
            <span v-if="alarmInfo.conditionExpression">{{ conditionExpression }}</span>
            <w-select v-model="conditionExpression" v-else class="expression">
              <w-select-option
                v-for="(item, index) in conditionExpressions"
                :key="item"
                :value="item"
                :title="handleExpression(item)"
              >
                {{ handleExpression(item) }}
              </w-select-option>
            </w-select>
          </div>
          <!-- 出水控制目标选择 -->
          <div class="target">
            出水控制目标：<w-select v-model="targetExpression" class="expression">
              <w-select-option v-for="(item, index) in targetExpressions" :key="item" :value="item">
                <span :title="handleExpression(item)">{{ handleExpression(item) }}</span>
              </w-select-option>
            </w-select>
          </div>
        </div>
        <!-- 模拟按钮 -->
        <w-button type="primary" :loading="!isTimeOut" @click="handleMock" class="supply-ml-5"
          >模拟</w-button
        >
      </div>
      <!-- 方案展示区域 -->
      <div class="solution-wrapper">
        <div class="solution">
          <div class="solution__item" v-for="(item, index) in dataList" :key="item.key">
            <note-box :title="item.title">
              <div class="note">
                <w-checkbox-group
                  v-if="item.content.length"
                  class="note__wrapper"
                  v-model="item.noteValues"
                >
                  <div class="note__item" v-for="(note, index) in item.content" :key="note.id">
                    <w-checkbox :value="note.id"> </w-checkbox>
                    <span class="note__text">{{ note.measures }}</span>
                  </div>
                </w-checkbox-group>
                <w-empty v-else></w-empty>
              </div>
            </note-box>
          </div>
        </div>
      </div>
    </div>
  </card-box>
</template>

<script>
// 导入相关组件和API
import CardBox from './CardBox';
import noteBox from './CardBox/noteBox';
import { pollingResult } from '@/api/runTime';
import {
  getConditionExpressionList,
  getTargetExpressionList,
  getPageExpertProcessControl,
  alarmConfirm,
  saveModelParam
} from '@/api/diagnosis';

export default {
  props: {
    // 报警信息
    alarmInfo: {
      type: Object,
      default: () => ({})
    },
    // 报警ID
    alarmId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      isTimeOut: true, // 是否超时
      timeOut: null, // 超时计时器
      conditionExpression: '', // 进水参数表达式
      conditionExpressions: [], // 进水参数表达式列表
      targetExpression: '', // 出水控制目标表达式
      expertControlId: undefined, // 专家控制ID
      targetExpressions: [], // 出水控制目标表达式列表
      dataList: [
        { title: '调控措施', content: [], key: 'ruleDesc', noteValues: [] },
        { title: '投加条件', content: [], key: 'solution', noteValues: [] }
      ]
    };
  },
  components: { CardBox, noteBox },
  computed: {
    // 请求参数
    params() {
      return {
        waterPlantId: this.alarmInfo.pumpHouseId,
        type: this.alarmInfo.expertDecisionType
      };
    },
    // 带进水参数的请求参数
    params1() {
      return {
        ...this.params,
        conditionExpression: this.conditionExpression
      };
    },
    // 带目标表达式的请求参数
    params2() {
      return {
        ...this.params1,
        alarmTime: this.alarmInfo.startTime,
        targetExpression: this.targetExpression
      };
    }
  },
  watch: {
    // 监听报警信息变化
    alarmInfo: {
      handler(val) {
        if (val.pointName === 'TN') {
          this.dataList[1].title = '碳源投加';
        } else if (val.pointName === 'TP') {
          this.dataList[1].title = '除磷剂投加';
        } else {
          this.dataList[1].title = '投加条件';
        }
        this.dataList[0].noteValues = [...(val?.alarmExpertVO?.adoptPlanIdList || [])];
        this.dataList[1].noteValues = [...(val?.alarmExpertVO?.adoptPlanIdList || [])];
        this.conditionExpression = val?.conditionExpression || '';
      },
      immediate: true
    },
    // 监听参数变化
    params: {
      handler(val) {
        this.getConditionExpressionList();
      },
      immediate: true
    },
    // 监听带进水参数的请求参数变化
    params1: {
      handler(val) {
        this.getTargetExpressionList();
      },
      immediate: true
    },
    // 监听带目标表达式的请求参数变化
    params2: {
      handler(val) {
        this.getPageExpertProcessControl();
      },
      immediate: true
    },
    // 监听进水参数表达式变化
    conditionExpression: {
      handler(val) {
        this.getTargetExpressionList();
      },
      immediate: true
    }
  },
  methods: {
    // 处理表达式显示
    handleExpression(str) {
      return str?.replace(/\&\&/g, '且') || str;
    },
    // 模拟操作
    handleMock() {
      this.saveModelParam();
    },
    // 报警确认
    async alarmConfirm(predictionId) {
      this.handleNoteValue();
      let params = {
        alarmId: this.alarmId,
        confirmDesc: {
          predictionId: predictionId,
          waterPlantId: this.alarmInfo.pumpHouseId,
          expertControlId: this.expertControlId,
          planIdList: [
            ...(this.dataList[0]?.content || []).map(item => item.id),
            ...(this.dataList[1]?.content || []).map(item => item.id)
          ],
          adoptPlanIdList: [...this.dataList[0].noteValues, ...this.dataList[1].noteValues]
        },
        confirmType: '0000'
      };
      const { resultData, status } = await alarmConfirm(params);
    },
    // 保存模型参数
    async saveModelParam() {
      this.handleNoteValue();
      let params = {
        alarmTime: this.alarmInfo.startTime,
        waterPlantId: this.alarmInfo.pumpHouseId,
        measuresPlanList: this.getPlanList(this.dataList[0].content, this.dataList[0].noteValues),
        conditionPlanList: this.getPlanList(this.dataList[1].content, this.dataList[1].noteValues)
      };
      const { resultData, status } = await saveModelParam(params);
      if (status === 'complete') {
        this.alarmConfirm(resultData.id);
        this.isTimeOut = false;
        this.timeOut = setTimeout(() => {
          this.isTimeOut = true;
        }, 90000);
        this.pollingResult(resultData.id);
      }
    },
    // 轮询结果
    async pollingResult(predictionId) {
      const { resultData, status } = await pollingResult(ppredictionId);
      if (status === 'complete' && resultData > 0) {
        clearTimeout(this.timeOut);
        setTimeout(() => {
          this.isTimeOut = true;
          this.$message.success('模拟完成');
          this.$emit('mock', predictionId);
        }, 5000);
      } else {
        if (!this.isTimeOut) {
          setTimeout(() => {
            this.pollingResult(predictionId);
          }, 1000);
        } else {
          clearTimeout(this.timeOut);
          if (this.isTimeOut) {
            this.$emit('mock', predictionId);
            this.$message.success('预测超时');
          }
        }
      }
    },
    // 获取计划列表
    getPlanList(list, value) {
      let data = [];
      value?.forEach(item => {
        let curItem = list.find(i => i.id === item);
        if (curItem) {
          data.push({ modelPoint: curItem.modelPoint, modelValue: curItem.modelValue });
        }
      });
      return data;
    },
    // 获取进水参数表达式列表
    async getConditionExpressionList() {
      if (this.paramsEmpty(this.params)) {
        this.conditionExpressions = [];
      } else {
        const { resultData, status } = await getConditionExpressionList(this.params);
        if (status === 'complete') {
          this.conditionExpressions = resultData || [];
          if (!this.conditionExpressions.includes(this.conditionExpression)) {
            this.conditionExpression = '';
          }
        }
      }
    },
    // 获取目标表达式列表
    async getTargetExpressionList() {
      if (this.paramsEmpty(this.params1)) {
        this.targetExpressions = [];
        this.targetExpression = '';
      } else {
        const { resultData, status } = await getTargetExpressionList(this.params1);
        if (status === 'complete') {
          this.targetExpressions = resultData || [];
          if (!this.targetExpressions.includes(this.targetExpression)) {
            this.targetExpression = '';
          }
          if (!this.targetExpression) {
            this.targetExpression = this.targetExpressions[0] || '';
          }
        }
      }
    },
    // 获取专家过程控制页面数据
    async getPageExpertProcessControl() {
      if (this.paramsEmpty(this.params2)) {
        this.conditionExpressions = [];
      } else {
        const { resultData, status } = await getPageExpertProcessControl(this.params2);
        if (status === 'complete') {
          let data = resultData?.records?.[0] || {};
          this.expertControlId = data.id ?? undefined;
          this.$emit('controlId', this.expertControlId);
          this.dataList[0].content = data.measuresPlanList || [];
          this.dataList[1].content = data.conditionPlanList || [];
          this.dataList[0].noteValues = [...(this.alarmInfo?.alarmExpertVO?.adoptPlanIdList || [])];
          this.dataList[1].noteValues = [...(this.alarmInfo?.alarmExpertVO?.adoptPlanIdList || [])];
          this.handleNoteValue();
        }
      }
    },
    // 处理选中值
    handleNoteValue() {
      this.dataList.forEach(item => {
        if (item.noteValues.length) {
          item.noteValues = item.noteValues.filter(value =>
            item.content.find(plan => value === plan.id)
          );
        }
      });
    },
    // 判断参数是否为空
    paramsEmpty(params) {
      return Object.values(params).some(item => !item && item !== 0);
    }
  }
};
</script>
<style lang="less" scoped>
.expression {
  min-width: 100px;
}
.solution-box {
  height: 100%;
  display: flex;
  flex-direction: column;
}
.action {
  padding: 0px 0 10px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  .control {
    display: flex;
    align-items: center;
    .target {
      display: flex;
      align-items: center;
      margin-right: 12px;
    }
  }
}
.solution-wrapper {
  flex: 1;
  overflow: hidden;
}
.solution {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &__item {
    width: calc(50% - 5px);
    height: 100%;
    .note {
      overflow: auto;
      font-weight: 400;
      font-size: 12px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      height: 100%;
      &__text {
        margin-left: 6px;
        position: relative;
        top: -2px;
      }
      &__wrapper {
        width: 100%;
        height: 100%;
        display: flex;
        flex-direction: column;
        padding: 2px 6px;
      }
      &__item {
        margin-left: 0;
        margin-bottom: 6px;
        display: flex;

        &:last-child {
          margin-bottom: 0;
        }
      }
    }
  }
}
</style>
