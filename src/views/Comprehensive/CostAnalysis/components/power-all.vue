<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-05-30 15:45:04
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div class="card-inner">
          <div class="card-box">
            <div class="card-item card1">
              <img class="card-img" src="@/assets/images/default/power/ico-day.png" alt="" />
              <p class="card-num">
                {{ (!!powerDayData || powerDayData == '0') ? powerDayData : '--' }}<span class="card-unit">kWh</span>
              </p>
              <p class="card-label">
                前一日累计
              </p>
            </div>
            <div class="card-item card2">
              <img class="card-img" src="@/assets/images/default/power/ico-month.png" alt="" />
              <p class="card-num">
                {{ (!!powerMonthData || powerMonthData == '0') ? powerMonthData : '--' }}<span
                  class="card-unit">kWh</span>
              </p>
              <p class="card-label">
                当月累计
              </p>
            </div>
          </div>
          <div class="card-box">
            <div class="card-item card-full">
              <img class="card-img" src="@/assets/images/default/power/ico-power.png" alt="" />
              <p class="card-num">
                {{ (!!powerKtWaterData || powerKtWaterData == '0') ? powerKtWaterData : '--' }}<span
                  class="card-unit">kWh</span>
              </p>
              <p class="card-label">
                千吨污水耗电率
              </p>
            </div>
          </div>
        </div>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getEnergyDayData } from '@/api/analysis.js';

export default {
  name: 'PowerAll',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
  },
  data() {
    return {
      loading: false,
      powerDayData: '',
      powerMonthData: '',
      powerKtWaterData: '',
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.queryLastDayData();
          this.queryMonthData();
        }
      }
    }
  },
  created() { },
  methods: {
    // 前一日
    async queryLastDayData() {
      this.loading = true;
      let param = {
        dateType: 'day',
        deviceIdList: [],
        endDate: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD'),
        statType: 0,
        waterPlantIdList: [this.waterPlantId]
      };
      let { resultData, status } = await getEnergyDayData(param);
      this.loading = false;
      if (status === 'complete' && resultData.length > 0) {
        this.powerDayData = resultData[0]?.powerPv
      }
    },
    // 当月
    async queryMonthData() {
      this.loading = true;
      let param = {
        dateType: 'month',
        deviceIdList: [],
        endDate: this.$moment().format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: this.$moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        statType: 0,
        waterPlantIdList: [this.waterPlantId]
      };
      let { resultData, status } = await getEnergyDayData(param);
      this.loading = false;
      if (status === 'complete') {
        this.powerMonthData = resultData[0]?.powerPv
        this.powerKtWaterData = resultData[0]?.energy
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;

  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }

  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }

  .spin {
    width: 100%;
    height: calc(100% - 40px);
  }

  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;

    .card-box {
      width: 100%;
      height: calc(50% - 6px);
      display: flex;
      justify-content: space-between;

      .card-item {
        width: calc(50% - 6px);
        height: 100%;
        border-radius: 4px;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }

      .card1 {
        background: radial-gradient(circle at 7% 42%, #62d0db1a 0%, #ffffff5e 123%), url('~@/assets/images/default/power/card-green.png');
        background-repeat: no-repeat;
        background-position: right center;
        background-size: auto 100%;
      }

      .card2 {
        background: radial-gradient(circle at 7% 42%, #6295db1a 0%, #ffffff5e 88%), url('~@/assets/images/default/power/card-blue.png');
        background-repeat: no-repeat;
        background-size: auto 100%;
        background-position: right center;
      }

      .card-full {
        width: 100% !important;
        background: radial-gradient(circle at 7% 42%, #9762db1a 0%, #ffffff5e 126%), url('~@/assets/images/default/power/card-purple.png');
        background-repeat: no-repeat;
        background-size: auto 100%;
        background-position: right center;
      }

      .card-img {
        width: 24px;
        height: 24px;
      }

      .card-num {
        font-weight: 700;
        font-size: 16px;
        color: var(--supply-color-main);
        letter-spacing: 0;
        margin-bottom: 0px;

        .card-unit {
          font-weight: 400;
          font-size: 12px;
          color: var(--supply-color-secondary);
          margin-left: 4px;
        }
      }

      .card-label {
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-secondary);
        letter-spacing: 0;
        margin-bottom: 0px;
      }
    }
  }

  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }

  /deep/ .wpg-select-selection--single {
    height: 32px;
  }

  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
