<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <div class="card-inner">
      <!-- 折线图组件，设置主题、类型和配置项 -->
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        :isClick="true"
        @zrClick="handleBarClick"
        ref="inChart"
      ></line-chart>
    </div>
  </unit-card>
</template>

<script>
import { getEnergyDayData } from '@/api/analysis.js';
export default {
  name: 'actualTreatment',
  components: {
    // 异步加载单位卡片组件
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue'),
    // 异步加载折线图组件
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
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
      // ECharts 配置项
      barOption: {
        color: ['#00cc9d', '#febe1c'], // 图表颜色
        grid: {
          // 图表布局
          left: '3%',
          right: '3%',
          top: '20%',
          bottom: '4%',
          containLabel: true
        },
        legend: {
          // 图例配置
          show: true,
          data: ['处理量', '设计水量'],
          itemWidth: 16,
          itemHeight: 8,
          right: 0,
          textStyle: {
            color: '#666',
            fontWeight: 400,
            fontSize: 12
          }
        },
        tooltip: {
          // 提示框配置
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        xAxis: [
          // X轴配置
          {
            data: [] // X轴数据
          }
        ],
        yAxis: [
          // Y轴配置
          {
            name: 'm³', // 单位
            nameTextStyle: {
              color: '#00000073',
              align: 'right'
            },
            type: 'value',
            axisTick: { show: false },
            axisLabel: {
              show: true,
              interval: 0,
              formatter: '{value}'
            },
            splitLine: { lineStyle: { type: 'solid' } }
          }
        ],
        series: [
          // 数据系列
          {
            type: 'bar', // 柱状图
            name: '处理量',
            barMaxWidth: '10',
            itemStyle: {
              borderRadius: [100, 100, 0, 0] // 柱状图圆角
            },
            data: [] // 数据
          },
          {
            type: 'line', // 折线图
            name: '设计水量',
            symbol: 'none', // 不显示数据点
            data: [
              // 固定设计水量数据
              100000,
              100000,
              100000,
              100000,
              100000,
              100000,
              100000,
              100000,
              100000,
              100000,
              100000,
              100000
            ],
            lineStyle: {
              type: 'dashed', // 虚线
              width: 2,
              color: '#febe1c'
            }
          }
        ]
      }
    };
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
     * 初始化数据
     */
    async initData() {
      try {
        // 请求参数
        let params = {
          dateType: 'day',
          statType: 0,
          deviceIdList: [],
          waterPlantId: this.waterPlantId,
          startDate: this.$moment()
            .subtract(10, 'days')
            .format('YYYY-MM-DD'),
          endDate: this.$moment().format('YYYY-MM-DD')
        };
        // 获取数据
        const { status, resultData } = await getEnergyDayData(params);
        if (status === 'complete') {
          this.updateChart(resultData); // 更新图表
        }
      } catch (error) {
        console.error('获取数据失败:', error);
      }
    },
    /**
     * 更新图表数据
     * @param {Array} data - 图表数据
     */
    updateChart(data) {
      // 处理X轴数据，截取日期后5位
      let xData = data.map(item => item.date.slice(-5));
      // 获取处理量数据
      let seriesData = data.map(item => item.flowPv);

      // 更新图表配置
      this.barOption.yAxis[0].name = 'm³/d';
      this.barOption.xAxis[0].data = xData;
      this.barOption.series[0].data = seriesData;
    },
    /**
     * 折线图点击事件处理函数
     */
    handleBarClick() {
      // this.drillDown({
      //   path: '/report/outflowReport'
      // });
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
}
</style>
