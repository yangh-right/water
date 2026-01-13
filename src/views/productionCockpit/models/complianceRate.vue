<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: wangyr
 * @LastEditTime: 2025-04-08 15:07:41
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <div :class="['card-inner', themeConfig.className]">
      <div class="header-card">
        <div class="header-icon"></div>
        <div class="header-text">出水达标率: {{ complianceRate }}%</div>
      </div>
      <div class="metrics-container">
        <div class="metric-card">
          <div class="progress-wrapper">
            <w-progress
              type="circle"
              :percent="leftMetric.percent"
              :width="120"
              :stroke-color="progressColor"
              :stroke-width="8"
            >
              <template #format="percent">
                <div class="per-val">
                  <div class="val">{{ percent }}<span class="unit">%</span></div>
                </div>
              </template>
            </w-progress>
          </div>
          <div class="metric-footer">
            {{ leftMetric.label }}:
            <div class="days">{{ leftMetric.days }}天</div>
          </div>
        </div>

        <div class="metric-card">
          <div class="progress-wrapper">
            <a-progress
              type="circle"
              :percent="rightMetric.percent"
              :width="120"
              :stroke-color="progressColor"
              :stroke-width="8"
            >
              <template #format="percent">
                <div class="per-val">
                  <div class="val">{{ percent }}<span class="unit">%</span></div>
                </div>
              </template>
            </a-progress>
          </div>
          <div class="metric-footer">
            {{ rightMetric.label }}:
            <div class="days">{{ rightMetric.days }}天</div>
          </div>
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
import { themeMixin } from '@/core/mixins.ts';
import { queryProcessStructure } from '@/api/cockpit.js';
export default {
  name: 'complianceRate',
  components: {
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
  },
  mixins: [themeMixin],
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      themeConfigMap: {
        default: {
          className: 'card-default'
        },
        dark: {
          className: 'card-dark'
        }
      },
      complianceRate: 100,
      progressColor: {
        '0%': '#3CCAD7',
        '100%': '#00DB89'
      },
      qualityData: {},
      leftMetric: {
        percent: 0,
        label: '累计达标天数',
        days: 0
      },
      rightMetric: {
        percent: 0,
        label: '当年累计达标天数',
        days: 0
      }
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.initData();
        }
      }
    }
  },
  methods: {
    async initData() {
      let params = {
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await queryProcessStructure(params);
      if (status === 'complete') {
        this.qualityData = resultData;
        this.leftMetric = {
          percent: this.qualityData.quasiClassThreeRate,
          label: '累计达到准四类天数',
          days: this.qualityData.quasiClassThree || 0
        };
        this.rightMetric = {
          percent: this.qualityData.quasiClassThreeRateThisYear,
          label: '当年累计达到准四类天数',
          days: this.qualityData.quasiClassThreeThisYear || 0
        };
      }
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  .header-card {
    height: 36px;
    line-height: 36px;
    background-color: #f4f8fb;
    padding: 0 12px;
    border-radius: 4px;
    display: flex;
    align-items: center;

    .header-icon {
      width: 21px;
      height: 21px;
      background: url('~@/assets/images/modules/cockpit/ck-water.png') no-repeat;
      background-size: 100% 100%;
      font-size: 20px;
      margin-right: 10px;
    }

    .header-text {
      font-size: 14px;
      color: var(--supply-color-main);
      font-weight: 400;
    }
  }
  .metrics-container {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    gap: 16px;

    .metric-card {
      flex: 1;
      min-width: 200px;
      border-radius: 4px;
      padding: 20px 4px;
      display: flex;
      flex-direction: column;
      align-items: center;
      box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);

      .per-val {
        width: 90px;
        height: 90px;
        background: url('~@/assets/images/modules/cockpit/ck-process.png') no-repeat;
        background-size: 100% 100%;
        display: flex;
        justify-content: center;
        align-items: center;
        margin: 0 auto;
        .val {
          color: var(--supply-color-main);
          font-size: 24px;
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 500;
        }

        .unit {
          color: var(--supply-color-third);
          font-size: 12px;
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 500;
        }
      }

      .progress-wrapper {
        :deep(.ant-progress-text) {
          font-size: 24px;
          font-weight: 500;
        }
      }

      .metric-footer {
        background-color: #f6f8fa;
        padding: 10px 16px;
        width: 100%;
        text-align: center;
        border-radius: 4px;
        color: var(--supply-color-secondary);
        font-size: 14px;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-top: 8px;

        .days {
          color: var(--supply-color-main);
        }
      }
    }
  }
}
.card-dark {
  .header-card {
    background-color: #212730;
  }
  .per-val {
    background: url('~@/assets/images/modules/cockpit/ck-process-dark.png') no-repeat !important;
    background-size: 100% 100%;
  }
  .metric-footer {
    background-color: #212730 !important;
  }
}
</style>
