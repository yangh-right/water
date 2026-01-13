<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <div class="process-box">
        <w-progress
          :strokeColor="
            percent === '--'
              ? 'var(--supply-color-third) !important'
              : 'var(--supply-color-primary-DEFAULT) !important'
          "
          :width="112"
          :strokeWidth="10"
          :percent="percent === '--' ? 0 : percent"
          :show-info="percent !== '--'"
          type="dashboard"
        >
          <template #format="percent">
            <div class="per-box">
              <p class="per-val">{{ loadRate || '--' }}%</p>
              <p class="per-label">
                <w-tooltip placement="topLeft" style="cursor: pointer;">
                  <template slot="title">
                    负荷率 = 每日实际进水量 / 每日设计处理量
                  </template>
                  负荷率<img src="@/assets/cockpit/ic_help.png" alt="" style="width: 12px;" />
                </w-tooltip>
              </p>
            </div>
          </template>
        </w-progress>
        <div class="real-flow">
          <div class="label">实时流量(m³/h)</div>
          <div class="val">{{ realTimeTraffic || '--' }}</div>
        </div>
      </div>
      <div class="points-box">
        <div class="point-field" v-for="item in sludgeList" :key="item.label">
          <div class="label">{{ item.label }}</div>
          <div class="point-info">
            <span class="val">{{ item.value || item.value == '0' ? item.value : '--' }}</span>
            <span class="unit">m³</span>
          </div>
        </div>
      </div>
    </div>
  </cockpit-card>
</template>

<script>
import CockpitCard from './CockpitCard.vue';
import { flowTreatmentAnalysis } from '@/api/cockpit.js';
export default {
  name: 'Sewage',
  components: {
    CockpitCard
  },
  props: {
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      cardTitle: '污水处理情况',
      percent: 0,
      loadRate: 0,
      realTimeTraffic: 0,
      sludgeList: [
        {
          label: '今日污水处理量',
          value: 0
        },
        {
          label: '昨日污水处理量',
          value: 0
        },
        {
          label: '上月污水处理量',
          value: 0
        }
      ]
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        if (!!val) {
          this.initData(val);
        }
      }
    }
  },
  activated() {
    if (this.factoryId) {
      this.initData(this.factoryId);
    }
  },
  methods: {
    async initData(id) {
      this.sludgeList = [
        {
          label: '今日污水处理量',
          value: 0
        },
        {
          label: '昨日污水处理量',
          value: 0
        },
        {
          label: '上月污水处理量',
          value: 0
        }
      ];
      this.isLoading = true;
      let { status, resultData } = await flowTreatmentAnalysis(id);
      if (status === 'complete') {
        this.sludgeList = [
          {
            label: '今日污水处理量',
            value: resultData?.todayFlowPv
          },
          {
            label: '昨日污水处理量',
            value: resultData?.yesterdayFlowPv
          },
          {
            label: '上月污水处理量',
            value: resultData?.lastMonthFlowPv
          }
        ];
        this.percent = resultData?.loadRate;
        this.loadRate = resultData?.loadRate;
        this.realTimeTraffic = resultData?.instantaneousFlow;
      }
      this.isLoading = false;
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .process-box {
    width: calc(50% - 6px);
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;
    .per-box {
      .per-val {
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 18px;
        color: var(--supply-color-primary-DEFAULT);
        margin: 0;
      }
      .per-label {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 12px;
        color: var(--supply-color-third);
        margin: 0;
        margin-top: 6px;
      }
    }

    .real-flow {
      margin-top: 12px;
      padding-left: 10px;

      .label {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 12px;
        color: #6a87a8;
      }
      .val {
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 14px;
        color: var(--supply-color-main);
      }
    }
  }
  .points-box {
    width: calc(50% - 6px);
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: center;

    .point-field {
      width: 100%;
      margin-bottom: 7px;
      .label {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 12px;
        color: var(--supply-color-secondary);
        margin-bottom: 4px;
      }
      .point-info {
        width: 100%;
        height: 24px;
        line-height: 24px;
        background: var(--supply-color-bg-DEFAULT);
        padding: 0 8px;
        box-sizing: border-box;
        .val {
          font-family: PingFangSC-Medium, sans-serif;
          font-weight: 500;
          font-size: 14px;
          color: var(--supply-color-main);
          margin-right: 4px;
        }
        .unit {
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: var(--supply-color-third);
        }
      }
    }
  }
}
</style>
