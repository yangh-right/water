<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 09:53:17
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-11 15:30:34
 * @Description: 
-->
<template>
  <div class="card">
    <div class="card-module card-module-left">
      <div class="card__item">
        <card-box title="进水数据">
          <div class="supply-w-full supply-h-full">
            <div class="chart-wrapper">
              <line-chart :option="oneOption"></line-chart>
            </div>
          </div>
        </card-box>
      </div>
      <div class="card__item">
        <card-box title="生物池北侧水质">
          <div class="supply-w-full supply-h-full">
            <div class="chart-wrapper">
              <line-chart :option="twoOption"></line-chart>
            </div>
          </div>
        </card-box>
      </div>
      <div class="card__item">
        <card-box title="生物池南侧水质">
          <div class="supply-w-full supply-h-full">
            <div class="chart-wrapper">
              <line-chart :option="threeOption"></line-chart>
            </div>
          </div>
        </card-box>
      </div>
    </div>
  </div>
</template>

<script>
import CardBox from '@/components/CardBox';
import { genOption, colorRgb, genCommonOption } from '../configData';
import { getModelHistoryData } from '@/api/diagnosis';
import * as echarts from 'echarts';
import { cloneDeep } from 'lodash';
export default {
  data() {
    return {
      oneOption: {},
      oneConfigCode: 'carbon_source_dosing_in_water_quality',

      twoOption: {},
      twoConfigCode: 'carbon_source_dosing_bio_pool_north_water_quality',

      threeOption: {},
      threeConfigCode: 'carbon_source_dosing_bio_pool_south_water_quality',

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

  computed: {},

  watch: {
    waterPlantId: {
      handler(val) {
        this.getLeftOneData();
        this.getLeftTwoData();
        this.getLeftThreeData();
      },
      immediate: true
    }
  },

  mounted() { },

  methods: {
    async getLeftOneData() {
      if (!this.waterPlantId) return;
      this.oneOption = await this.getSingleCommonData(this.oneConfigCode);
    },

    async getLeftTwoData() {
      if (!this.waterPlantId) return;
      this.twoOption = await this.getSingleCommonData(this.twoConfigCode);
    },

    async getLeftThreeData() {
      if (!this.waterPlantId) return;
      this.threeOption = await this.getSingleCommonData(this.threeConfigCode);
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

    async getCommonData(configCode) {
      let params = {
        endDateTime: this.$moment().format('YYYY-MM-DD 08:00:00'),
        startDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00'),
        waterPlantId: this.waterPlantId,
        configCode: configCode
      };
      const { resultData, status } = (await getModelHistoryData(params)) || {};
      if (status === 'complete') {
        return resultData?.map(item => {
          let xData = item.timeDataList?.map(data => `${data.dateTimeStr}:00`);
          let yData = item.timeDataList?.map(data => data.historyPointValue);
          let option = genOption({
            xData,
            yData,
            yAxisName: item.pointUnit,
            xAxisRotate: 40
          });
          let isNoData = yData?.some(data => data != null);
          if (!isNoData) {
            option.yAxis[0].min = 0;
            option.yAxis[0].max = 5;
          } else {
            delete option.yAxis[0].min;
            delete option.yAxis[0].max;
          }
          return {
            value: item.pointName,
            label: item.pointMemo,
            option
          };
        }) || [];
      }
      return [];
    }
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
</style>
