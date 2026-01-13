<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <div class="process-box">
        <div class="rate">负荷率</div>
        <div class="circle">
          <div class="per-val">{{ percent || '--' }}%</div>
        </div>
        <!-- <w-progress
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
              <p class="per-val">{{ percent || '--' }}%</p>
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
        </w-progress> -->
        <div class="real-flow">
          <div class="label">实时流量</div>
          <div class="val">{{ realTimeTraffic || '--' }} <span class="unit">(m³/h)</span></div>
        </div>
      </div>
      <div class="line"></div>
      <div class="points-box">
        <div
          v-for="(item, i) in sludgeList"
          :key="item.label"
          :class="['point-field', 'point-field' + (i + 1)]"
        >
          <div class="point-info">
            <span class="val">{{ item.value || '--' }}</span>
            <span class="unit">m³</span>
          </div>
          <div class="label">{{ item.label }}</div>
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
  justify-content: space-around;
  align-items: center;

  .process-box {
    width: calc(50% - 38px);
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-around;
    .rate {
      width: 100%;
      height: 24px;
      line-height: 24px;
      text-align: center;
      color: #e1f0ff;
      font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
      font-size: 16px;
      background: url('~@/assets/images/default/integrated/ck-rate-title.png') no-repeat center
        center;
      background-size: 100% 100%;
    }
    .circle {
      width: 90%;
      height: 78px;
      background: url('~@/assets/images/default/integrated/ck-rate.png') no-repeat center center;
      background-size: 100% 100%;
      display: flex;
      justify-content: center;
      align-items: center;

      .per-val {
        font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
        font-weight: 700;
        font-size: 20px;
        color: #f0f6ff;
        letter-spacing: 0;
        text-align: center;
      }
    }
    .real-flow {
      width: 100%;
      height: 44px;
      background: url('~@/assets/images/default/integrated/ck-atim.png') no-repeat center center;
      background-size: 100% 100%;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;

      .label {
        height: 20px;
        font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #f0f6ff;
        letter-spacing: 0;
      }
      .val {
        font-family: MiSans-Bold, sans-serif;
        font-weight: 700;
        font-size: 16px;
        color: #f0f6ff;
        letter-spacing: 0;
        .unit {
          font-family: MiSans-Regular, sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: #85b6ff;
          letter-spacing: 0;
        }
      }
    }
  }
  .line {
    width: 68px;
    height: 126px;
    background: url('~@/assets/images/default/integrated/ck-line.png') no-repeat center center;
    background-size: 100% 100%;
    margin: 0 2px;
  }
  .points-box {
    width: calc(50% - 38px);
    height: 100%;
    display: flex;
    align-items: center;
    flex-direction: column;
    justify-content: space-around;

    .point-field {
      width: 100%;
      height: calc(33.3% - 8px);
      padding-left: 48px;
      box-sizing: border-box;
      &.point-field1 {
        background: url('~@/assets/images/default/integrated/ck-day-sludge.png') no-repeat center
          center;
        background-size: 100% 100%;
      }
      &.point-field2 {
        background: url('~@/assets/images/default/integrated/ck-ysludge.png') no-repeat center
          center;
        background-size: 100% 100%;
      }
      &.point-field3 {
        background: url('~@/assets/images/default/integrated/ck-lmonth-sludge.png') no-repeat center
          center;
        background-size: 100% 100%;
      }
      .label {
        font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #e1f0ff;
        letter-spacing: 0;
      }
      .point-info {
        .val {
          font-family: MiSans-Bold, sans-serif;
          font-weight: 500;
          font-size: 16px;
          color: #f0f6ff;
          letter-spacing: 0;
        }
        .unit {
          font-family: MiSans-Regular, sans-serif;
          font-weight: 400;
          font-size: 14px;
          color: #f0f6ff;
          letter-spacing: 0;
        }
      }
    }
  }
}
</style>
