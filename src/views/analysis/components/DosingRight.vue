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
        <card-box title="出水数据">
          <div class="supply-w-full supply-h-full">
            <div class="chart-wrapper">
              <line-chart :option="firstOption"></line-chart>
            </div>
          </div>
        </card-box>
      </div>
      <div class="card__item">
        <card-box title="碳源投加数据分析">
          <div class="supply-w-full supply-h-full">
            <div class="chart-wrapper">
              <line-chart :option="secondOption"></line-chart>
            </div>
          </div>
        </card-box>
      </div>
      <div class="card__item">
        <card-box title="千吨水碳源投加数据">
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
import { getModelHistoryData, getCarbonSourceDosingEnergyData } from '@/api/diagnosis';
import { getEnergyDayData } from '@/api/analysis'
import * as echarts from 'echarts';
import { cloneDeep } from 'lodash';
import { deepClone } from '@/utils/util';
export default {
  data() {
    return {
      firstOption: {},
      firstConfigCode: 'carbon_source_dosing_out_water_quality',

      secondOption: {},

      thirdOption: {},

      doAnalysisData: {
        northDoSetValue: '',
        southDoSetValue: '',
        northHitRangeRatio: '',
        southHitRangeRatio: ''
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
          },
          {
            type: 'value',
            name: '',
            min: 0,
            max: 1,
            position: 'right',
            nameTextStyle: {
              align: 'left'
            },
            axisLine: {
              show: true
            },
            splitLine: {
              show: false
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
      let params = {
        endDate: this.$moment().subtract(1, 'days')
          .format('YYYY-MM-DD'),
        startDate: this.$moment().subtract(8, 'days')
          .format('YYYY-MM-DD'),
        waterPlantIdList: [this.waterPlantId]
      };
      let { resultData, status } = await getEnergyDayData(params);
      let tmpOption = deepClone(this.option);
      if (status === 'complete') {
        let xData = resultData?.map(data => {
          const dateStr = `${data.date}` || '';
          return dateStr.slice(-5);
        }) || [];
        let yData = resultData?.map(data => {
          return data.sodiumAcetatePv == null ? 0 : Number(data.sodiumAcetatePv) || 0;
        }) || [];
        let series = [{
          name: '碳源消耗量',
          data: yData || [],
          type: 'line',
          smooth: true,
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: colorRgb('#BD5D00', 0.5) },
              { offset: 1, color: colorRgb('#BD5D00', 0.1) }
            ])
          }
        }];

        tmpOption.series = series;
        tmpOption.xAxis[0].data = xData;
        tmpOption.xAxis[0].axisLabel.rotate = 0;
        tmpOption.yAxis[0] = {
          type: 'value',
          name: 'm³',
          nameTextStyle: {
            align: 'right'
          }
        };
        // 右侧Y轴保持0-1范围
        tmpOption.yAxis[1] = {
          type: 'value',
          name: '',
          min: 0,
          max: 1,
          position: 'right',
          nameTextStyle: {
            align: 'left'
          },
          axisLine: {
            show: true
          },
          splitLine: {
            show: false
          }
        };
        tmpOption.color = ['#BD5D00', 'FF9A00'];
        this.secondOption = tmpOption;
      }
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
      const { resultData, status } = (await getCarbonSourceDosingEnergyData(params)) || {};
      let tmpOption = cloneDeep(this.option);
      if (status === 'complete') {
        let xData = resultData?.[0]?.timeDataList?.map(data => {
          const dateStr = `${data.dateTimeStr}` || '';
          return dateStr.slice(-5);
        }) || [];
        let series = resultData?.map(item => {
          let yData = item.timeDataList?.map(data => data.historyPointValue);
          return {
            name: item.pointMemo,
            data: yData || [],
            type: 'line',
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: colorRgb('#BD5DF0', 0.5) },
                { offset: 1, color: colorRgb('#BD5DF0', 0.1) }
              ])
            }
          }
        });
        tmpOption.series = series;
        tmpOption.xAxis[0].data = xData;
        tmpOption.xAxis[0].axisLabel.rotate = 0;
        // 保留左侧Y轴配置
        if (resultData && resultData.length > 0) {
          tmpOption.yAxis[0] = {
            type: 'value',
            name: resultData[0].pointUnit || '',
            nameTextStyle: {
              align: 'right'
            }
          };
        }
        // 右侧Y轴保持0-1范围
        tmpOption.yAxis[1] = {
          type: 'value',
          name: '',
          min: 0,
          max: 1,
          position: 'right',
          nameTextStyle: {
            align: 'left'
          },
          axisLine: {
            show: true
          },
          splitLine: {
            show: false
          }
        };
      }
      this.thirdOption = tmpOption;
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
        // 保留左侧Y轴配置
        if (resultData && resultData.length > 0) {
          tmpOption.yAxis[0] = {
            type: 'value',
            name: resultData[0].pointUnit || '',
            nameTextStyle: {
              align: 'right'
            }
          };
        }
        // 右侧Y轴保持0-1范围
        tmpOption.yAxis[1] = {
          type: 'value',
          name: '',
          min: 0,
          max: 1,
          position: 'right',
          nameTextStyle: {
            align: 'left'
          },
          axisLine: {
            show: true
          },
          splitLine: {
            show: false
          }
        };
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
