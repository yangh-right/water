<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: wangyr
 * @LastEditTime: 2025-04-08 15:02:33
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <div slot="headerRight">
      <w-radio-group size="small" v-model="type" @change="typeChange">
        <w-radio-button v-for="(item, index) in goods" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-radio-button>
      </w-radio-group>
    </div>
    <div :class="['card-inner', themeConfig.className]">
      <div class="header-card" @click="handleBarClick">
        <div class="header-icon"></div>
        <div class="header-text">{{ currentLable }}计划处理量： {{ complianceRate }}万吨</div>
      </div>
      <div class="chart-box">
        <div class="chart-label">
          {{ currentLable }}完成率：{{ plannedCapacityRate }} <span class="unit">%</span>
        </div>
        <div class="chart-line" @click="handleBarClick">
          <div class="chart-con">
            <line-chart :darkTheme="'light'" :option="options"></line-chart>
          </div>
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
import { themeMixin } from '@/core/mixins.ts';
import { completionRateOfTreatedWater } from '@/api/cockpit.js';
export default {
  name: 'completionRate',
  components: {
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue'),
    LineChart: () => import('@/components/chart/ProcessChart.vue')
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
      goods: [
        { label: '当月', value: 'month' },
        { label: '当年', value: 'year' }
      ],
      type: 'month',
      themeConfigMap: {
        default: {
          className: 'card-default'
        },
        dark: {
          className: 'card-dark'
        }
      },
      axis: {
        unit: '%',
        max: 100,
        colors: ['#00CC9D', '#00CC9D'],
        data: [
          {
            name: '比例',
            value: 0
          }
        ]
      },
      plannedCapacityRate: 0,
      complianceRate: 0
    };
  },
  computed: {
    currentLable() {
      return this.goods.find(item => item.value === this.type).label;
    },
    options() {
      return {
        tooltip: {
          trigger: 'none'
        },
        grid: [
          {
            left: '3%',
            right: '3%',
            bottom: '50%',
            containLabel: true
          }
        ],
        xAxis: [
          {
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            inverse: true,
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            data: this.axis.data.map(d => {
              return d.name;
            })
          }
        ],
        series: [
          {
            type: 'bar', //柱状图实现电量进度渐变效果
            barWidth: 20,
            legendHoverLink: false,
            symbolRepeat: true,
            silent: true,
            label: {
              normal: {
                show: false
              }
            },
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: this.axis.colors[0] // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: this.axis.colors[1] // 100% 处的颜色
                  }
                ]
              }
            },
            animationEasing: 'elasticOut',
            data: this.axis.data,
            z: 1
          },
          {
            //象形柱图--背景，“满电”效果
            type: 'pictorialBar',
            symbol: 'rect',
            symbolMargin: '4',
            symbolSize: [8, 20],
            symbolRepeat: 'fixed',
            label: {
              show: false
            },
            itemStyle: {
              normal: {
                color: '#E7ECF0'
              }
            },
            animationEasing: 'elasticOut',
            data: [this.axis.max],
            z: 0
          },
          {
            //象形柱图--分隔
            type: 'pictorialBar',
            symbol: 'rect',
            symbolMargin: '4',
            symbolSize: [8, 20],
            symbolOffset: [-8, 0],
            symbolRepeat: 'fixed',
            symbolClip: true,
            symbolPosition: 'start',
            itemStyle: {
              color: this.theme === 'dark' ? '#202F34' : '#ffffff'
            },
            animationEasing: 'elasticOut',
            data: this.axis.data,
            z: 2
          }
        ]
      };
    }
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      immediate: true
    }
  },
  methods: {
    typeChange() {
      this.initData();
    },
    async initData() {
      let params = {
        queryType: this.type,
        startDate: this.$moment()
          .startOf(this.type)
          .format('YYYY-MM-DD'),
        endDate: this.$moment()
          .endOf(this.type)
          .format('YYYY-MM-DD'),
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await completionRateOfTreatedWater(params);
      if (status === 'complete') {
        this.axis.data = [
          {
            name: '比例',
            value: resultData.plannedCapacityRate
          }
        ];
        this.plannedCapacityRate = resultData.plannedCapacityRate;
        this.complianceRate = resultData.plannedCapacity;
      } else {
        this.axis.data = [];
        this.complianceRate = 0;
        this.plannedCapacityRate = 0;
      }
    },
    handleBarClick() {
      this.drillDown({
        path: '/report/outflowReport'
      });
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
    cursor: pointer;

    .header-icon {
      width: 21px;
      height: 21px;
      background: url('~@/assets/images/modules/cockpit/ck-circle.png') no-repeat;
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

  .chart-box {
    width: 100%;
    margin-top: 28px;
  }

  .chart-label {
    color: var(--supply-color-main);
    font-size: 14px;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
  }

  .unit {
    color: var(--supply-color-third);
    font-size: 14px;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
  }
  .chart-line {
    width: 100%;
    height: 70px;
    border: 1px solid #dee2e7;
    margin-top: 10px;
    position: relative;
    .chart-con {
      height: 100%;
      width: 100%;
      position: absolute;
      top: -10px;
    }
  }
}
.card-dark {
  .header-card {
    background-color: #212730;
  }
  .chart-line {
    border: 1px solid #202f34;
    background: #202f34;
  }
}
</style>
