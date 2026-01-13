<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-09-07 14:27:25
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">设备运行KPI</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="device-wrap">
        <div class="chart-wrapper">
          <div v-if="pointsArr.length > 0" class="card-inner">
            <div class="echart-block">
              <line-chart :darkTheme="'light'" :option="deviceOption" ref="alarmChart"></line-chart>
            </div>
          </div>
          <w-empty v-else class="empty"></w-empty>
        </div>
        <div class="device-progress">
          <div class="progress__title">
            设备完好率
          </div>
          <w-progress
            :stroke-color="{
              '0%': '#5CB6FF',
              '100%': '#2F7FFF'
            }"
            type="circle"
            :strokeWidth="10"
            :format="percent => `${percent.toFixed(2)} %`"
            :percent="onlineAndNotAlarmCnt"
          />
        </div>
        <div class="device-progress">
          <div class="progress__title">
            设备在线率
          </div>
          <w-progress
            :stroke-color="{
              '0%': '#52EFCA',
              '100%': '#0ACC9D'
            }"
            type="circle"
            :strokeWidth="10"
            :format="percent => `${percent.toFixed(2)} %`"
            :percent="onlineCnt"
          />
        </div>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getDeviceKPI, statusStatistics } from '@/api/optimization';
import { deviceOption } from './data';
export default {
  name: 'DeviceRun',
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
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      loading: false,
      colors: [
        '#2F7FFF',
        '#FF6781',
        '#28D6FE',
        '#FFA66D',
        '#2BDEAB',
        '#FFD739',
        '#A259F5',
        '#F9D54A',
        '#0171CE'
      ],
      pointsArr: [
        { name: '设备运行', value: 125 },
        { name: '故障设备', value: 8 },
        { name: '停机设备', value: 13 },
        { name: '维修设备', value: 24 }
      ],
      deviceOption,
      type: '1',
      onlineCnt: 0,
      onlineAndNotAlarmCnt: 0
    };
  },
  watch: {
    waterPlantId: {
      handler() {
        this.getAlarmType();
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    async getAlarmType() {
      this.loading = true;
      let params = {
        queryType: 'month',
        startTime: this.$moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        endTime: this.$moment()
          .endOf('month')
          .format('YYYY-MM-DD'),
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await statusStatistics(params);
      this.loading = false;
      if (status === 'complete') {
        this.pointsArr = [
          { name: '设备运行', value: resultData.online },
          { name: '故障设备', value: resultData.breakdown },
          { name: '完好设备', value: resultData.normal },
          { name: '停机设备', value: resultData.shutDown },
          { name: '维修设备', value: resultData.repair },
          { name: '离线设备', value: resultData.offline }
        ];

        this.deviceOption.yAxis[0].data = this.pointsArr.map(item => item.name);
        this.deviceOption.series[0].data = this.pointsArr.map(item => item.value);

        this.onlineCnt =
          parseFloat(Number(resultData.online) * 100) / Number(resultData.total).toFixed(2);
        this.onlineAndNotAlarmCnt =
          parseFloat(Number(resultData.normal) * 100) / Number(resultData.total).toFixed(2);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  height: 268px;
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
  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  .spin {
    height: calc(100% - 40px);
    .device-wrap {
      padding: 0 12px 12px;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      .chart-wrapper {
        width: 50%;
        .card-inner {
          width: 100%;
          height: 100%;
          position: relative;
          padding: 0 12px 0 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;

          .echart-block {
            height: 100%;
            width: 100%;
            text-align: center;
          }
          .points-list {
            height: 68px;
            width: 100%;
            display: flex;
            overflow-y: auto;
            flex-flow: wrap;
            align-items: center;
            justify-content: flex-start;

            .point-tab {
              width: calc(50% - 14px);
              height: 26px;
              margin-top: 8px;
              padding: 0 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-right: 28px;
              &:nth-child(2n) {
                margin-right: 0px;
              }

              .label {
                font-family: PingFangSC-Regular, sans-serif;
                font-weight: 400;
                font-size: 14px;
                color: var(--supply-color-secondary);
                letter-spacing: 0;

                .ico-react {
                  display: inline-block;
                  width: 10px;
                  height: 10px;
                  border-radius: 1.76px;
                  margin-right: 6px;
                }
              }
              .precent {
                font-weight: 400;
                font-size: 14px;
                color: var(--supply-color-main);
                letter-spacing: 0;
                text-align: right;
              }
            }
          }
        }
      }
      .device-progress {
        align-items: center;
        flex-direction: column;
        display: flex;
        padding: 12px;
        height: 100%;
        width: calc(25% - 6px);
        .progress__title {
          align-self: flex-start;
          font-weight: 400;
          font-size: 14px;
          margin-bottom: 30px;
          color: var(--supply-color-main);
          letter-spacing: 0;
        }
        &:nth-last-child(1) {
          margin-left: 12px;
        }
      }
    }
  }

  .chart-wrapper {
    height: 100%;
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
  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
