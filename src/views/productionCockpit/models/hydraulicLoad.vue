<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <div :class="['card-inner', themeConfig.className]">
      <!-- 仪表盘图表 -->
      <div class="chart-box">
        <gauge-chart :option="options" />
      </div>
      <!-- 数据描述区域 -->
      <div class="chart-desc">
        <div
          v-for="item in dataList"
          :key="item.label"
          class="chart-bar"
          @click="handleBarClick(item)"
        >
          <div class="bar-label">{{ item.label }}</div>
          <div class="bar-value">
            <span>{{ item.value }}</span>
            <span class="unit">m³</span>
          </div>
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
import { themeMixin } from '@/core/mixins.ts';
import { flowTreatmentAnalysis } from '@/api/cockpit.js';
export default {
  name: 'hydraulicLoad',
  components: {
    // 异步加载单位卡片组件
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue'),
    // 异步加载仪表盘组件
    GaugeChart: () => import('@/components/chart/GaugeChart.vue')
  },
  mixins: [themeMixin], // 使用主题混入
  props: {
    // 水厂ID
    waterPlantId: {
      type: String,
      default: ''
    },
    // 卡片标题
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      themeConfigMap: {
        // 主题配置
        default: {
          className: 'card-default'
        },
        dark: {
          className: 'card-dark'
        }
      },
      percent: 0, // 水量负荷率
      dataList: [
        // 数据列表
        {
          label: '今日污水处理量',
          value: 0
        },
        {
          label: '昨日污水处理量',
          value: 0
        },
        {
          label: '当月污水处理量',
          value: 0
        },
        {
          label: '当年污水处理量',
          value: 0
        }
      ]
    };
  },

  computed: {
    /**
     * 仪表盘配置项
     */
    options() {
      // 根据主题设置颜色
      let titleColor = this.theme === 'dark' ? '#ffffff' : '#333333';
      let detailColor = this.theme === 'dark' ? '#ADB5BD' : '#666666';
      let axisColor = this.theme === 'dark' ? '#ADB5BD' : '#999999';
      return {
        series: [
          {
            name: '',
            type: 'gauge',
            splitNumber: 2,
            min: 0,
            max: 100,
            radius: '100%',
            center: ['50%', '50%'],
            startAngle: 215,
            endAngle: -35,
            axisLine: {
              show: true,
              lineStyle: {
                width: 0,
                shadowBlur: 0,
                color: this.colorFormatOnChart(this.percent, 100)
              }
            },
            axisTick: {
              show: true,
              lineStyle: {
                color: 'auto',
                width: 2
              },
              length: 16,
              splitNumber: 18
            },
            splitLine: {
              show: false,
              length: 4,
              lineStyle: {
                color: 'auto'
              }
            },
            axisLabel: {
              show: true,
              color: axisColor,
              fontSize: 12,
              distance: 20
            },
            anchor: {
              show: false
            },
            progress: {
              show: false
            },
            pointer: {
              show: false
            },
            title: {
              show: true,
              offsetCenter: [0, '55%'],
              textStyle: {
                color: detailColor,
                fontSize: 14
              }
            },
            detail: {
              shadowBlur: 2,
              offsetCenter: [0, '-15%'],
              backgroundColor: 'transparent',
              textStyle: {
                color: titleColor,
                fontSize: 26
              },
              formatter: '{value}%'
            },
            data: [
              {
                name: '水量负荷率',
                value: this.percent
              }
            ]
          }
        ]
      };
    }
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.initData(); // 初始化数据
        }
      }
    }
  },
  methods: {
    /**
     * 初始化数据，获取处理量分析数据
     */
    async initData() {
      let { status, resultData } = await flowTreatmentAnalysis(this.waterPlantId);
      if (status === 'complete') {
        // 更新数据列表
        this.dataList = [
          {
            label: '今日污水处理量',
            value: resultData?.todayFlowPv || 0
          },
          {
            label: '昨日污水处理量',
            value: resultData?.yesterdayFlowPv || 0
          },
          {
            label: '当月污水处理量',
            value: resultData?.currentMonthFlowPv || 0
          },
          {
            label: '当年污水处理量',
            value: resultData?.currentYearFlowPv || 0
          }
        ];
        // 更新负荷率
        this.percent = resultData?.loadRate || 0;
      }
    },
    handleBarClick(param) {
      // this.drillDown({
      //   path: '/report/outflowReport'
      // });
    },

    /**
     * 根据值和最大值生成颜色格式
     * @param {number} value - 当前值
     * @param {number} max - 最大值
     * @returns {Array} 颜色配置数组
     */
    colorFormatOnChart(value, max) {
      const percent = value / max;
      const result = [];
      if (percent === 0) {
        result.push([1, '#E7ECF0']);
      } else {
        const colorStops = [
          { threshold: 0.1, color: '#17D5F7' },
          { threshold: 0.2, color: '#1BF0AC' },
          { threshold: 0.3, color: '#3ED25E' },
          { threshold: 0.4, color: '#A2DA2A' },
          { threshold: 0.5, color: '#DBF743' },
          { threshold: 0.6, color: '#F4DE48' },
          { threshold: 0.7, color: '#F3B92F' },
          { threshold: 0.8, color: '#F5841F' },
          { threshold: 0.9, color: '#F15041' }
        ];

        for (const stop of colorStops) {
          if (percent > stop.threshold) {
            result.push([stop.threshold, stop.color]);
          } else {
            result.push([stop.threshold, stop.color]);
            break;
          }
        }

        result.push([1, percent > 0.9 ? '#F12C2C' : '#E7ECF0']);
      }
      return result;
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;

  .chart-box {
    width: 42%;
    height: 100%;
    margin-right: 20px;
  }
  .chart-desc {
    flex: 1;
    .chart-bar {
      display: flex;
      align-items: center;
      margin-bottom: 20px;
      /* cursor: pointer; */
      .bar-label {
        width: 60%;
        color: var(--supply-color-main);
      }
      .bar-value {
        width: 40%;
        display: flex;
        align-items: center;
        color: var(--supply-color-main);
      }
      .unit {
        margin-left: 4px;
      }
    }
  }
}
</style>
