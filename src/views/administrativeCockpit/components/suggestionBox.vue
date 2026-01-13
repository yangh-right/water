<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-04-03 09:14:31
 * @Description:
-->
<template>
  <div class="content">
    <line-chart
      :darkTheme="'light'"
      powerType="powerSupply"
      :option="barOption"
      @myChartClick="myChartClick"
      ref="inChart"
    ></line-chart>
  </div>
</template>
<script>
import { suggestionBoxCount } from '@/api/cockpit';
export default {
  name: 'AdministrativeCockpit',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  mixins: [],
  data() {
    return {
      barOption: {
        title: [
          {
            left: 'center',
            text: 'Gradient along the y axis'
          }
        ],
        color: ['#28a8f3', '#febe1c'],
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
          data: ['意见数量'],
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
            data: []
          }
        ],
        yAxis: [
          {
            name: '个',
            nameTextStyle: {
              color: '#00000073',
              align: 'right'
            },
            type: 'value',
            minInterval: 1,
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
          {
            type: 'bar',
            name: '意见数量',
            data: [],
            barWidth: '10',
            itemStyle: {
              barBorderRadius: [10, 10, 0, 0]
            }
          }
        ]
      }
    };
  },
  computed: {},
  activated() {},
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      this.barOption.xAxis[0].data = [];
      this.barOption.series[0].data = [];
      let { resultData, status } = await suggestionBoxCount();
      if (status === 'complete') {
        resultData.forEach(item => {
          this.barOption.xAxis[0].data.push(item.key + '月');
          this.barOption.series[0].data.push(item.value);
        });
      }
    },
    myChartClick(param) {
      this.drillDown({
        path: '/suggestionBox'
      });
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  width: 100%;
  height: calc(100% - 28px);
}
</style>
