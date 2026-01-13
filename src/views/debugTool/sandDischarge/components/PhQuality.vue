<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:58:05
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-19 17:57:31
 * @Description:
-->
<template>
  <card-box :title="cardTitle">
    <div class="supply-w-full supply-h-full">
      <line-chart ref="inChart" :option="barOption" :darkTheme="'light'"></line-chart>
    </div>
  </card-box>
</template>

<script>
import * as echarts from 'echarts';
import { queryWaterQuality } from '@/api/cockpit.js';
import CardBox from '@/components/CardBox';

// 添加图表颜色配置常量
const CHART_COLORS = [
  {
    lineColor: '#5DFFDF',
    areaColor: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
      { offset: 0, color: 'rgba(93,255,223,0.1)' },
      { offset: 1, color: 'rgba(93,255,223,0.5)' }
    ])
  },
  {
    lineColor: '#00d4c7',
    areaColor: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
      { offset: 0, color: 'rgba(7,44,90,0.1)' },
      { offset: 1, color: 'rgba(0,212,199,0.5)' }
    ])
  },
  {
    lineColor: '#aecb56',
    areaColor: new echarts.graphic.LinearGradient(0, 1, 0, 0, [
      { offset: 0, color: 'rgba(7,44,90,0.1)' },
      { offset: 1, color: 'rgba(114,144,89,0.5)' }
    ])
  }
];

export default {
  name: 'PhQuality',
  components: {
    CardBox,
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  props: {
    // 水厂ID
    waterPlantId: {
      type: String,
      default: ''
    },
    cardTitle: {
      type: String,
      default: '进水PH'
    }
  },
  data() {
    // 生成昨天早8点到今天早8点的整点时间
    const defaultXAxis = [];
    const yesterday = this.$moment()
      .subtract(1, 'days')
      .startOf('day')
      .add(8, 'hours');
    const today = this.$moment()
      .startOf('day')
      .add(8, 'hours');

    let currentTime = yesterday.clone();
    while (currentTime.isBefore(today) || currentTime.isSame(today)) {
      defaultXAxis.push(currentTime.format('YYYY-MM-DD HH:00:00'));
      currentTime.add(1, 'hour');
    }

    return {
      defaultXAxis,
      chartData: [], // 图表数据
      // 图表配置项
      barOption: {
        grid: [
          {
            left: '16px',
            right: '12px',
            top: '40px',
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
              rotate: 40,
              formatter: value => {
                return value && value.length > 5 ? value?.slice(11, 16) : value;
              }
            },
            axisLine: {
              show: false,
              lineStyle: {}
            },
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
    waterPlantId: {
      handler(newVal) {
        if (newVal) {
          this.initData(); // 初始化数据
        }
      },
      immediate: true
    }
  },

  methods: {
    // 初始化数据
    async initData() {
      const params = {
        startTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD 08:00:00'),
        endTime: this.$moment().format('YYYY-MM-DD HH:mm:ss'),
        queryType: 'HOURS',
        waterPlantId: this.waterPlantId,
        pointConfigCode: 'PH',
        secondPointConfigCode: 'PH'
      };
      // 获取历史数据
      const { resultData, status } = await queryWaterQuality(params);
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
      // 设置默认X轴和空series
      this.barOption.yAxis = [
        {
          name: '',
          nameTextStyle: {
            color: '#00000073',
            align: 'right'
          },
          type: 'value',
          min: 0,
          max: 5,
          axisTick: { show: false },
          axisLabel: {
            show: true,
            interval: 0,
            formatter: '{value}'
          },
          splitLine: { lineStyle: { type: 'solid' } }
        }
      ];
      this.barOption.xAxis[0].data = this.defaultXAxis;
      this.barOption.series = [
        {
          name: '',
          type: 'line',
          smooth: true,
          showSymbol: false,
          data: Array(this.defaultXAxis.length).fill(null), // 或0
          itemStyle: {
            normal: {
              color: '#ccc',
              lineStyle: {
                color: '#ccc',
                width: 1
              },
              areaStyle: {
                color: 'rgba(200,200,200,0.1)'
              }
            }
          }
        }
      ];
      this.barOption.yAxis[0].name = ''; // 默认单位
    },
    // 格式化时间数据
    formatTimeData(dataList) {
      return dataList.map(v => v.date);
    },
    // 格式化系列数据
    formatSeriesData(item, i) {
      return {
        name: item.pointMemo,
        type: 'line',
        smooth: true,
        showSymbol: false,
        itemStyle: {
          normal: {
            color: CHART_COLORS[i].lineColor,
            lineStyle: {
              color: CHART_COLORS[i].lineColor
            },
            areaStyle: {
              color: CHART_COLORS[i].areaColor
            }
          }
        },
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

<style lang="less" scoped></style>
