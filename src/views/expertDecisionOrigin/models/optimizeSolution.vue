<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-22 13:43:30
 * @Description:
-->
<template>
  <card-box title="智慧决策">
    <div class="solution-box" id="expert-solution">
      <div class="action">
        <!-- 是否展示全部：<w-switch v-model="isShowAll" @change="handleApplied"></w-switch> -->
        <w-button :loading="!isTimeOut" @click="toModel" class="supply-ml-5">决策配置</w-button>
      </div>
      <div class="panel" v-if="alarmId" :style="{ backgroundImage: `url(${themeConfig.panel})` }">
        <div class="title" :title="handlePointName(alarmInfo.alarmContent)">
          {{ handlePointName(alarmInfo.alarmContent) }}
        </div>
        <div
          class="time"
          v-show="alarmInfo.startTime"
          :style="{ backgroundColor: themeConfig.timeBg }"
        >
          <img :src="themeConfig.date" class="time__icon" />
          <span class="time__str">{{ alarmInfo.startTime }}</span>
        </div>
        <div
          class="content"
          :style="{
            'justify-content': appliedPointList.length ? 'space-between' : 'flex-start'
          }"
        >
          <div class="text condition" v-html="conditionDesc"></div>
          <div v-if="realValue.length" class="box">
            <img :src="themeConfig.steer" class="box__icon" />
            <div class="text">实际值为</div>
            <div
              class="value__content real-content"
              v-for="(value, index) in realValue"
              :key="index"
            >
              <span class="text supply-mr-1.5">{{ value.devicePointName }}</span>
              <div class="value__num">{{ value.value }}</div>
            </div>
          </div>
          <div class="box point" v-if="appliedPointList.length">
            <img :src="themeConfig.steer" class="box__icon" />
            <div class="text">经系统研判</div>
            <div class="value__content">
              <div
                class="value__num"
                v-for="(item, index) in appliedPointList"
                :key="item.factorType"
              >
                {{ item.factorTypeName }}
              </div>
            </div>
            <div class="text supply-mt-1.5">
              {{ appliedPointList.length > 1 ? '等' : '' }}方面存在问题
            </div>
          </div>
        </div>
      </div>

      <div class="right">
        <w-radio-group class="point-radio" v-model="factorType">
          <w-radio-button
            :class="{ applied: item.applied }"
            v-for="(item, index) in filterPointList"
            :key="item.factorType"
            :value="item.factorType"
          >
            {{ item.factorTypeName }}
          </w-radio-button>
        </w-radio-group>

        <div class="solution-wrapper">
          <div v-if="!loading && planDataList.length" class="solution" v-resize="resize">
            <div
              :class="['solution__item', planData.applied ? 'plan-applied' : '']"
              v-for="(planData, index) in filterPlanDataList"
              :key="planData.id"
            >
              <note-box
                :titleIcon="themeConfig.title"
                v-if="planData.startRender"
                :title="getPlanDataTitle(planData)"
              >
                <template
                  v-if="
                    (planData.alarmDataList && planData.alarmDataList.length) ||
                      (planData.planList && planData.planList.length)
                  "
                >
                  <vue-typed-js
                    :strings="planData.htmlStr || ''"
                    :shuffle="false"
                    cursorChar=""
                    @onComplete="onComplete(index)"
                    :typeSpeed="14"
                    :fadeOutClass="'fadeOutClass'"
                    :loop="false"
                    :loopCount="1"
                    :startDelay="500"
                    :showCursor="true"
                    :contentType="'html'"
                  >
                    <div class="typing"></div>
                  </vue-typed-js>
                </template>
                <w-empty v-else></w-empty>
              </note-box>
            </div>
          </div>
          <empty
            v-if="planDataList.length === 0 && numData !== 1"
            class="data-empty"
            tip="二级因素均未命中，请深入排查"
          >
            <vue-typed-js
              :strings="['二级因素均未命中，请深入排查']"
              :shuffle="false"
              cursorChar=""
              :typeSpeed="50"
              :fadeOutClass="'fadeOutClass'"
              :loop="false"
              :loopCount="1"
              :startDelay="1000"
              :showCursor="true"
              :contentType="'html'"
            >
              <div class="typing"></div>
            </vue-typed-js>
          </empty>
        </div>
      </div>
    </div>
  </card-box>
</template>

<script>
import CardBox from './CardBox';
import Empty from './empty.vue';
import { themeMixin } from '@/core/mixins';
import noteBox from './CardBox/noteBox';
import { themeConfigMap, handlePointName } from './config';
import { pollingResult } from '@/api/runTime';
import {
  alarmConfirm,
  alarmDetailInfo,
  getExpertProcessControlList,
  getExpertProcessData
} from '@/api/diagnosis';
export default {
  mixins: [themeMixin],
  props: {
    alarmInfo: {
      type: Object,
      default: () => ({})
    },
    alarmId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      themeConfigMap,
      isTimeOut: true,
      isShowAll: false,
      timeOut: null,
      expertControlId: undefined,
      factorType: '',
      pointList: [],
      planDataList: [],
      loading: false,
      numData: 1
    };
  },

  components: { CardBox, noteBox, Empty },
  computed: {
    filterPointList() {
      return this.pointList.filter(item => this.isShowAll || item.applied);
    },
    appliedPointList() {
      return this.pointList.filter(item => item.applied);
    },
    filterPlanDataList() {
      return this.planDataList
        .filter(item => this.isShowAll || item.applied)
        .map((item, index) => {
          if (index === 0) {
            item.startRender = true;
          }
          return item;
        });
    },
    conditionDesc() {
      return this.alarmInfo?.expertProcessControl?.conditionDescShow || '';
    },
    realValue() {
      return this.alarmInfo?.expertProcessControl?.advanceAlarmRealDataList || [];
    },
    params() {
      return {
        controlId: this.alarmInfo?.expertProcessControl?.id,
        alarmTime: this.alarmInfo?.startTime,
        factorType: this.factorType
      };
    }
  },
  watch: {
    params: {
      handler(val) {
        this.getExpertProcessData();
      },
      immediate: true
    },
    alarmInfo: {
      handler(val) {
        this.getPointList();
      },
      immediate: true
    }
  },
  methods: {
    handlePointName,
    getAlarmName(alarm) {
      return (alarm?.[0]?.deviceName || '') + (alarm?.[0]?.pointMemo || '');
    },
    async getExpertProcessData() {
      this.loading = true;
      if (
        this.alarmInfo?.expertProcessControl?.id != null &&
        this.alarmInfo.startTime &&
        this.factorType
      ) {
        this.globalLoading.show({ domId: 'expert-solution' });
        const { resultData, status } = await getExpertProcessData(this.params);
        if (status === 'complete') {
          this.numData = this.numData + 1;
          this.planDataList = resultData || [];
          this.planDataList.forEach((item, index) => {
            item.title = item.decisionConditionExpressionShow || '';
            item.htmlStr = [this.getNoteHtmlStr(item)];
          });
        }
        this.globalLoading.hide({ domId: 'expert-solution' });
      } else {
        this.planDataList = [];
      }
      this.loading = false;
    },
    resize() {
      if (!this.filterPlanDataList.every(item => item.completeRender)) {
        this.$nextTick(() => {
          let solutionWrapper = document.querySelector('.solution-wrapper');
          solutionWrapper?.scrollTo({ top: solutionWrapper.scrollHeight, behavior: 'smooth' });
        });
      }
    },
    onComplete(index) {
      this.filterPlanDataList[index].completeRender = true;
      if (this.filterPlanDataList[index + 1]) {
        this.$set(this.filterPlanDataList[index + 1], 'startRender', true);
      }
    },
    getPlanDataTitle(data) {
      let title = data.title || '';
      let alarmValue = data?.alarmDataList?.[0]?.[0]?.pvAfterRatio;
      return alarmValue == undefined
        ? title
        : `${title}实际值是<span class="point_value">${alarmValue}</span>，建议采取措施如下：`;
    },
    getNoteHtmlStr(data) {
      let str = '';
      if (data.planList?.length) {
        let noteItems = '';
        data.planList.map((note, index) => {
          noteItems += `<div class="note__item"><span class="note__text">
            <span class="status-point"></span>
            <span class="note__text-name">${note.measuresTypeName + '：'}</span>
           ${note.measures}
            </span></div>`;
        });
        str += `<div class="note">${noteItems}</div>
         `;
      }
      return str;
    },
    async getPointList() {
      if (this.alarmInfo?.expertProcessControl?.id != null && this.alarmInfo.startTime) {
        let params = {
          controlId: this.alarmInfo.expertProcessControl.id,
          alarmTime: this.alarmInfo.startTime
        };
        const { resultData, status } = await getExpertProcessControlList(params);
        if (status === 'complete') {
          this.pointList = resultData || [];
          this.factorType =
            this.pointList?.find(item => this.isShowAll || item.applied)?.factorType || '';
        }
      } else {
        this.pointList = [];
        this.factorType = '';
      }
    },
    handleMock() {
      this.alarmConfirm();
    },
    handleApplied() {
      if (!this.isShowAll) {
        if (!this.pointList?.find(item => item.factorType === this.factorType)?.applied) {
          this.factorType = this.pointList?.find(item => item.applied)?.factorType || '';
        }
      } else if (!this.factorType) {
        this.factorType = this.pointList?.[0]?.factorType || '';
      }
    },
    toModel() {
      this.drillDown({
        path: '/expertProcessControl',
        query: {
          tab: this.alarmInfo?.expertDecisionType ?? '',
          id: this.alarmInfo?.expertProcessControl?.id ?? ''
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
@import '@/views/debugTool/style/design.less';

.expression {
  min-width: 100px;
}
/deep/ .point_value {
  color: var(--supply-color-main);
  font-size: 18px;
}
.solution-box {
  height: 100%;
  display: flex;
  .panel {
    width: 204px;
    height: 100%;
    margin-right: 12px;
    background-size: 100% 100%;
    padding: 12px 10px 10px;
    display: flex;
    flex-direction: column;
    .title {
      width: 72%;
      margin-left: 2px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-weight: 500;
      font-size: 15px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      margin-bottom: 10px;
    }
    .time {
      background: #ffffff66;
      border-radius: 14px;
      height: 28px;
      line-height: 28px;
      padding: 0 10px;
      margin-bottom: 12px;
      display: flex;
      align-items: center;
      .time__icon {
        width: 13.33px;
        margin-right: 2.7px;
      }
      .time__str {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
    .content {
      flex: 1;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      overflow: auto;
      padding: 12px;
      .text {
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
        &.condition {
          margin-bottom: 15px;
        }
      }
      .box {
        &__icon {
          width: 20px;
          margin-bottom: 6px;
        }
        .value__content {
          display: flex;
          align-items: center;
          flex-wrap: wrap;
          .text {
            color: var(--supply-color-secondary);
          }
          .value__num {
            border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
            text-align: center;
            line-height: 30px;
            font-weight: 500;
            font-size: 18px;
            color: var(--supply-color-primary-DEFAULT);
            letter-spacing: 0;
            margin-right: 7px;
            &:nth-last-child(1) {
              margin-right: 0px;
            }
          }
          &.real-content {
            margin-bottom: 6px;
            &:nth-last-child(1) {
              margin-bottom: 0px;
            }
          }
        }
        &.point {
          margin-top: 10px;
        }
      }
    }
  }
  .right {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
  }
}
.action {
  position: absolute;
  top: -24px;
  z-index: 3;
  right: 16px;
}
/deep/ .point-radio {
  margin-top: 10px;
  .wpg-radio-button-wrapper:not(:first-child)::before {
    display: none;
  }
  .wpg-radio-button-wrapper:last-child {
    margin-right: 0;
  }
  .wpg-radio-button-wrapper {
    margin-bottom: 8px;
    margin-right: 8px;
    border-radius: 13px;
    color: var(--supply-color-secondary);
    padding: 5px 15px !important;
    height: 26px;
    position: relative;
    font-size: 12px;
    line-height: 16px;
    border: 1px solid transparent;
    background: var(--supply-color-bg-card-dark);
    &.wpg-radio-button-wrapper-checked {
      border: 1px solid var(--supply-color-primary-hover);
      color: var(--supply-color-secondary);
      box-shadow: none !important;
      outline: none !important;
    }
    &.applied {
      color: var(--supply-color-online);
    }
  }
}
.control {
  margin-bottom: 6px;
  display: flex;
  align-items: center;
  .target {
    display: flex;
    align-items: center;
    margin-right: 12px;
  }
}
.solution-wrapper {
  flex: 1;
  overflow: auto;
}
.data-empty {
  position: absolute;
  left: 58%;
  top: 50%;
  transform: translate(-50%, -50%);
  /deep/.typing {
    color: var(--supply-color-main);
  }
}
.solution {
  width: 100%;
  &__item {
    margin-bottom: 10px;
    width: 100%;
    &.plan-applied {
      /deep/.card-box__title {
        .text {
          color: var(--supply-color-primary-DEFAULT);
          &::after {
            background-color: var(--supply-color-primary-hover);
          }
        }
      }
    }
    /deep/.card-box {
      border-radius: 4px;
      &__content {
        padding: 8px;
      }
    }
    &:nth-last-child(1) {
      margin-bottom: 0;
    }
    /deep/.typing {
      .note__title {
        color: var(--supply-color-primary-DEFAULT);
        font-size: 14px;
        margin-bottom: 8px;
      }
      .note {
        overflow: auto;
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
        height: 100%;
        &__text {
          margin-left: 6px;
          position: relative;
          top: -2px;
          .status-point {
            position: relative;
            top: -2px;
            display: inline-block;
            background-color: var(--supply-color-primary-DEFAULT);
            width: 4px;
            height: 4px;
            margin-right: 6px;
            border-radius: 50%;
          }
          &-name {
            font-weight: 400;
            color: var(--supply-color-secondary);
          }
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
}
</style>
