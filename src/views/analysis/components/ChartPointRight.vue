<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 16:27:37
 * @Description:
-->
<template>
  <div class="card">
    <div class="card-module card-module-right">
      <div class="card__item">
        <card-box title="风量数据">
          <div class="supply-w-full supply-h-full">
            <div class="chart-wrapper">
              <line-chart :option="firstOption"></line-chart>
            </div>
          </div>
        </card-box>
      </div>
      <div class="card__item">
        <card-box title="DO数据区间占比分析">
          <div class="supply-w-full supply-h-full">
            <div class="metrics-container">
              <div class="metric-card">
                <div class="progress-wrapper">
                  <w-progress type="circle" :percent="doAnalysisData.northHitRangeRatio" :width="120"
                    :stroke-color="progressColor" :stroke-width="8">
                    <template #format="percent">
                      <div class="per-val">
                        <div class="val">{{ percent }}<span class="unit">%</span></div>
                      </div>
                    </template>
                  </w-progress>
                </div>
                <div class="metric-footer">
                  生物池北DO设定:
                  <div class="days">{{ doAnalysisData.northDoSetValue }}mg/L</div>
                </div>
              </div>

              <div class="metric-card">
                <div class="progress-wrapper">
                  <a-progress type="circle" :percent="doAnalysisData.northHitRangeRatio" :width="120"
                    :stroke-color="progressColor" :stroke-width="8">
                    <template #format="percent">
                      <div class="per-val">
                        <div class="val">{{ percent }}<span class="unit">%</span></div>
                      </div>
                    </template>
                  </a-progress>
                </div>
                <div class="metric-footer">
                  生物池南DO设定:
                  <div class="days">{{ doAnalysisData.southDoSetValue }}mg/L</div>
                </div>
              </div>
            </div>
          </div>
        </card-box>
      </div>
      <div class="card__item">
        <card-box title="能耗数据">
          <div class="supply-w-full supply-h-full">
            <div class="chart-wrapper">
              <line-chart :option="thirdOption"></line-chart>
            </div>
          </div>
        </card-box>
      </div>
    </div>
  </div>
</template>

<script>
import CardBox from '@/components/CardBox';
import { colorRgb } from '../configData';
import { getModelHistoryData, getDoReasonableRangeRatio, getPrecisionAerationEnergyData } from '@/api/diagnosis';
import * as echarts from 'echarts';
import { cloneDeep } from 'lodash';
export default {
  data() {
    return {
      firstOption: {},
      firstConfigCode: 'bio_reactor_aeration_flow',

      secondOption: {},
      secondConfigCode: 'bio_reactor_main_pipe_precise_aeration',

      thirdOption: {},

      doAnalysisData: {
        northDoSetValue: '',
        southDoSetValue: '',
        northHitRangeRatio: 0,
        southHitRangeRatio: 0
      },

      progressColor: {
        '0%': '#3CCAD7',
        '100%': '#00DB89'
      },

      option: {
        color: ['#BD5DFF', '#FF9A3B'],
        series: [],
        grid: [
          {
            left: '16px',
            right: '12px',
            top: '60px',
            bottom: '12px',
            containLabel: true
          }
        ],
        legend: {
          show: true,
          top: 6,
          right: 6,
          icon: 'rect',
          itemHeight: 2,
          itemWidth: 12
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            axisLabel: {
              rotate: 40
            },
            axisLine: {
              show: false,
            },
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value',
            name: '',
            nameTextStyle: {
              align: 'right'
            }
          }
        ]
      }
    };
  },

  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },

  components: { CardBox, LineChart: () => import('@/components/CardBox/chartBox.vue') },

  watch: {
    waterPlantId: {
      handler(val) {
        this.getFirstData();
        this.getSecondData();
        this.getThirdData();
      },
      immediate: true
    }
  },

  methods: {
    async getFirstData() {
      if (!this.waterPlantId) return;
      this.firstOption = await this.getSingleCommonData(this.firstConfigCode);
    },

    async getSecondData() {
      if (!this.waterPlantId) return;
      this.getDoAnalysisData();
    },

    async getThirdData() {
      if (!this.waterPlantId) return;
      let params = {
        startDateTime: this.$moment()
          .subtract(8, 'days')
          .format('YYYY-MM-DD 00:00:00'),
        endDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 00:00:00'),
        waterPlantId: this.waterPlantId
      };
      const { resultData, status } = (await getPrecisionAerationEnergyData(params)) || {};
      let tmpOption = cloneDeep(this.option);
      if (status === 'complete') {
        let xData = resultData?.[0]?.timeDataList?.map(data => `${data.dateTimeStr}`) || [];
        
        // 找出风机能耗和千吨水风机能耗的数据
        let fanEnergyData = null;
        let perThousandData = null;
        resultData?.forEach(item => {
          if (item.pointMemo && item.pointMemo.includes('千吨')) {
            perThousandData = item;
          } else if (item.pointMemo && item.pointMemo.includes('风机')) {
            fanEnergyData = item;
          }
        });

        let series = [];
        // 风机能耗使用左侧 Y 轴 (yAxisIndex: 0)
        if (fanEnergyData) {
          let yData = fanEnergyData.timeDataList?.map(data => data.historyPointValue);
          series.push({
            name: fanEnergyData.pointMemo,
            data: yData || [],
            type: 'line',
            smooth: true,
            yAxisIndex: 0,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colorRgb('#BD5DFF', 0.5) },
                { offset: 1, color: colorRgb('#BD5DFF', 0.1) }
              ])
            }
          });
        }
        // 千吨水风机能耗使用右侧 Y 轴 (yAxisIndex: 1)
        if (perThousandData) {
          let yData = perThousandData.timeDataList?.map(data => data.historyPointValue);
          series.push({
            name: perThousandData.pointMemo,
            data: yData || [],
            type: 'line',
            smooth: true,
            yAxisIndex: 1,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colorRgb('#FF9A3B', 0.5) },
                { offset: 1, color: colorRgb('#FF9A3B', 0.1) }
              ])
            }
          });
        }

        tmpOption.series = series;
        tmpOption.xAxis[0].data = xData;
        tmpOption.xAxis[0].axisLabel.rotate = 0;
        tmpOption.color = ['#BD5DFF', '#FF9A3B'];
        
        // 左侧Y轴配置 - 风机能耗 (动态范围)
        tmpOption.yAxis = [
          {
            type: 'value',
            name: fanEnergyData?.pointUnit || 'kWh',
            nameTextStyle: {
              align: 'right'
            }
          },
          // 右侧Y轴配置 - 千吨水风机能耗 (动态范围)
          {
            type: 'value',
            name: perThousandData?.pointUnit || 'kWh/kt',
            show: true,
            position: 'right',
            nameTextStyle: {
              align: 'left'
            },
            axisLine: {
              show: false
            },
            splitLine: {
              show: false
            }
          }
        ];
      }
      this.thirdOption = tmpOption;
    },

    async getDoAnalysisData() {
      let params = {
        endDateTime: this.$moment().format('YYYY-MM-DD 08:00:00'),
        startDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00'),
        waterPlantId: this.waterPlantId,
        timePeriod: 'SECONDS'
      };
      let { resultData, status } = await getDoReasonableRangeRatio(params);
      if (status === 'complete') {
        this.doAnalysisData = {
          ...resultData,
          northHitRangeRatio: Number(resultData.northHitRangeRatio) || 0,
          southHitRangeRatio: Number(resultData.southHitRangeRatio) || 0
        };
      }
    },

    async getSingleCommonData(configCode) {
      let params = {
        endDateTime: this.$moment().format('YYYY-MM-DD 08:00:00'),
        startDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00'),
        waterPlantId: this.waterPlantId,
        configCode: configCode
      };
      const { resultData, status } = (await getModelHistoryData(params)) || {};
      let tmpOption = cloneDeep(this.option);
      if (status === 'complete') {
        let xData = xData = resultData?.[0]?.timeDataList?.map(data => `${data.dateTimeStr}:00`) || [];
        let series = resultData?.map(item => {
          let yData = item.timeDataList?.map(data => data.historyPointValue);
          return {
            name: item.pointMemo,
            data: yData || [],
            type: 'line',
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colorRgb('#BD5DFF', 0.5) },
                { offset: 1, color: colorRgb('#BD5DFF', 0.1) }
              ])
            }
          }
        });

        tmpOption.series = series;
        tmpOption.xAxis[0].data = xData;
        tmpOption.yAxis = resultData?.map(item => {
          return {
            type: 'value',
            name: item.pointUnit || '',
            nameTextStyle: {
              align: 'right'
            }
          }
        });
      }
      return tmpOption;
    },
  }
};
</script>
<style lang="less" scoped>
@import '@/views/analysis/style/design.less';

.card {
  overflow-y: auto;
  overflow-x: hidden;
  height: 100%;
  display: flex;
  justify-content: space-between;

  .card-module {
    width: 100%;

    &.card-module-left {
      height: 100%;
    }
  }

  &__item {
    height: 33.3%;
  }
}

/deep/ .chart-wrapper {
  height: calc(100% - 2px);
}

/deep/ .metrics-container {
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
  padding: 16px 0px;

  .metric-card {
    flex: 1;
    min-width: 120px;
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
      padding: 10px 8px;
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
</style>
