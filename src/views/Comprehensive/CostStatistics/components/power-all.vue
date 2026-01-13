<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-12 16:01:33
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div v-if="pointsArr.length > 0" class="card-inner">
          <div class="card-box">
            <div class="card-item card1">
              <img class="card-img" src="@/assets/images/default/power/ico-day.png" alt="" />
              <p class="card-num">
                125.82
              </p>
              <p class="card-label">
                前一日累计
              </p>
            </div>
            <div class="card-item card2">
              <img class="card-img" src="@/assets/images/default/power/ico-month.png" alt="" />
              <p class="card-num">
                125.82
              </p>
              <p class="card-label">
                前一日累计
              </p>
            </div>
          </div>
          <div class="card-box">
            <div class="card-item card-full">
              <img class="card-img" src="@/assets/images/default/power/ico-power.png" alt="" />
              <p class="card-num">
                125.82
              </p>
              <p class="card-label">
                前一日累计
              </p>
            </div>
          </div>
        </div>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getAlarmTypeCount } from '@/api/optimization';

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
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  data() {
    return {
      loading: false,
      pointsArr: [{ x: 0 }]
    };
  },
  watch: {
    waterPlantId() {
      this.getAlarmType();
    }
  },
  created() {},
  methods: {
    async getAlarmType() {
      this.loading = true;
      let param = {
        waterPlantId: this.waterPlantId,
        startTime: this.startTime,
        endTime: this.endTime
      };
      let { resultData, status } = await getAlarmTypeCount(param);
      this.loading = false;
      if (status === 'complete') {
        // this.pointsArr = resultData;
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
        overflow: hidden;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
      }
      .card1 {
        background: url('~@/assets/images/default/power/card-green.png') no-repeat;
        background-size: 100% 100%;
      }
      .card2 {
        background: url('~@/assets/images/default/power/card-blue.png') no-repeat;
        background-size: 100% 100%;
      }
      .card-full {
        width: 100% !important;
        background: url('~@/assets/images/default/power/card-purple.png') no-repeat;
        background-size: 100% 100%;
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
      }
      .card-label {
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
        margin-bottom: 0px;
      }
    }
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
