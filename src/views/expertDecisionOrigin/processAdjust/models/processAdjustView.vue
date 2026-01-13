<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-06-27 14:40:00
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-08-16 16:42:35
 * @Description: 
-->
<template>
  <div class="view-detail">
    <div class="detail-content">
      <div class="process__wrapper" v-for="(shiftData, index) in processData" :key="shiftData.id">
        <div class="shift">
          <div class="shift__date" v-if="shiftData.fillDate">{{ shiftData.fillDate }}</div>
          <div class="shift__text">{{ getDicName(classesList, shiftData.classes, 'label') }}</div>
        </div>
        <div class="circumstance" v-if="shiftData.sludgeDischargeCondition">
          <div class="name">排泥情况：</div>
          <div class="text" v-html="shiftData.sludgeDischargeCondition"></div>
        </div>
        <div class="circumstance" v-if="shiftData.waterQualitySituation">
          <div class="name">水质预警：</div>
          <div class="text" v-html="shiftData.waterQualitySituation"></div>
        </div>
        <div class="process">
          <div class="text" :style="{ color: shiftData.fontColor }" v-html="shiftData.remark"></div>
        </div>
        <div class="phase" v-for="(config, index) in processConfig" :key="config.key">
          <div class="phase__item">
            <div class="title">
              <double-square class="supply-mr-2"></double-square>
              <div class="name">{{ config.name }}</div>
            </div>
            <template v-if="shiftData[config.key] && shiftData[config.key].length">
              <div class="record" v-for="(item, index) in shiftData[config.key]" :key="index">
                <div class="time">{{ item.operateTime }}</div>
                <div v-if="item.operateContent" class="text" :style="{ color: item.fontColor }">
                  操作内容：{{ item.operateContent }}；
                </div>
                <div v-if="item.operatePosition" class="text" :style="{ color: item.fontColor }">
                  操作位置：{{ item.operatePosition }}；
                </div>
                <div v-if="item.operateValue" class="text" :style="{ color: item.fontColor }">
                  操作数值：{{ item.operateValue }}；
                </div>
              </div>
            </template>
            <w-empty v-else></w-empty>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import doubleSquare from './doubleSquare';
import { getDicName } from '@/utils/util';
import { processConfig, classesList } from './config';
export default {
  components: { doubleSquare },
  props: {
    processData: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      classesList,
      editLoading: false,
      processConfig
    };
  },

  methods: {
    getDicName,
    exportProcessAdjust() {
      this.$emit('exportProcessAdjust');
    },
    toEdit() {
      this.editLoading = true;
      setTimeout(() => {
        this.$emit('toEdit');
      }, 200);
    }
  }
};
</script>
<style lang="less" scoped>
.view-detail {
  height: calc(100%);
  overflow-y: auto;
  padding: 16px 12px;
  overflow-x: hidden;
  display: flex;
  flex-direction: column;
  .detail-content {
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    font-size: 14px;
    .process__wrapper {
      padding: 12px 16px 2px;
      border-radius: 4px;
      margin-bottom: 12px;
      background-color: var(--supply-color-table-hover);

      &:nth-last-child(1) {
        margin-bottom: 0px;
      }
      .shift {
        display: flex;
        align-items: center;
        font-size: 16px;
        margin-bottom: 8px;
        &__date {
          margin-right: 12px;
          color: var(--supply-color-main);
        }
        &__text {
          line-height: 22px;
          text-align: center;
          color: var(--supply-color-bg-card-DEFAULT);
          font-size: 14px;
          width: 22px;
          height: 22px;
          border-radius: 4px;
          background-color: var(--supply-color-primary-DEFAULT);
        }
      }
    }
    .circumstance {
      margin-bottom: 4px;
      display: flex;
      .name {
        color: var(--supply-color-primary-DEFAULT);
      }
      .text {
        white-space: pre-line;
      }
    }
    .process {
      margin-bottom: 5px;
      margin-top: 10px;
      .text {
        white-space: pre-line;
      }
    }
    .phase {
      &__item {
        margin-bottom: 10px;
        .title {
          margin-bottom: 4px;
          display: flex;
          align-items: center;
          .name {
            font-family: YouSheBiaoTiHei, sans-serif;
            color: var(--supply-color-main);
          }
        }
        .record {
          display: flex;
          align-items: center;
          margin-bottom: 2px;
          &:nth-last-child(1) {
            margin-bottom: 0px;
          }
          .time {
            color: var(--supply-color-primary-DEFAULT);
            margin-right: 10px;
          }
          .text {
          }
        }
      }
    }
  }
}
</style>
