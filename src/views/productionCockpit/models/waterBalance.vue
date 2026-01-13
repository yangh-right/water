<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 如果有图表数据，显示图表 -->
    <div v-if="hasChartData" class="card-inner">
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        ref="inChart"
      ></line-chart>
    </div>
    <!-- 如果没有数据，显示空状态 -->
    <empty v-else></empty>
  </unit-card>
</template>

<script>
import { queryPointHistoryData } from '@/api/cockpit.js';
export default {
  name: 'waterBalance',
  components: {
    // 异步加载空状态组件
    empty: () => import('../components/empty.vue'),
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
      chartData: [], // 图表数据
      // 图表配置项
      barOption: {
        color: ['#00cc9d', '#febe1c'], // 图表颜色
        grid: [
          {
            left: '3%',
            right: '3%',
            top: '18%',
            bottom: '4%'
          }
        ],
        legend: {
          show: true,
          itemWidth: 16,
          itemHeight: 8,
          right: 0,
          textStyle: {
            color: '#666666',
            fontWeight: 400,
            fontSize: 12
          }
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            data: [] // X轴数据
          }
        ],
        yAxis: [
          {
            name: '', // Y轴单位
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
        series: [] // 数据系列
      }
    };
  },
  computed: {
    // 判断是否有图表数据
    hasChartData() {
      return Array.isArray(this.chartData) && this.chartData.length > 0;
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
    // 初始化数据
    async initData() {
      const params = {
        startDateTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00'),
        endDateTime: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        timePeriod: 'HOURS',
        waterPlantId: this.waterPlantId,
        configCode: 'water_dynamic_balance'
      };
      // 获取历史数据
      const { resultData, status } = await queryPointHistoryData(params);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        this.chartData = resultData;
        this.updateChartOptions(); // 更新图表配置
      } else {
        this.resetChart(); // 重置图表
      }
    },
    // 重置图表数据
    resetChart() {
      this.chartData = [];
      this.updateChartOptions();
    },
    // 格式化时间数据
    formatTimeData(dataList) {
      return dataList.map(v => this.$moment(v.date).format('HH:00'));
    },
    // 格式化系列数据
    formatSeriesData(item) {
      return {
        type: 'line',
        smooth: false,
        name: item.deviceName,
        data: item.dataAndTimeList.map(v => v.pv)
      };
    },
    // 更新图表配置
    updateChartOptions() {
      if (!this.hasChartData) return;
      const firstItem = this.chartData[0];
      if (!firstItem) return;

      // 更新Y轴单位
      this.barOption.yAxis[0].name = firstItem.unit;
      // 更新X轴数据
      this.barOption.xAxis[0].data = this.formatTimeData(firstItem.dataAndTimeList);

      // 更新系列数据
      this.barOption.series = this.chartData.map(this.formatSeriesData);
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
