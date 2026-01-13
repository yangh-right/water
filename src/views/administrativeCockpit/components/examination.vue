<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-18 14:26:21
 * @Description:
-->
<template>
  <div class="content">
    <line-chart
      :darkTheme="'light'"
      powerType="powerSupply"
      :option="barOption"
      ref="inChart"
      @myChartClick="myChartClick"
    ></line-chart>
  </div>
</template>
<script>
import { testMonthCount } from '@/api/cockpit';
export default {
  name: 'AdministrativeCockpit',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  mixins: [],
  data() {
    return {
      barOption: {
        color: ['#00cc9d', '#febe1c'],
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
          data: ['计划考试数量', '实际考试数量'],
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
            name: '计划考试数量',
            data: [],
            barWidth: '10',
            itemStyle: {
              barBorderRadius: [10, 10, 0, 0]
            }
          },
          {
            type: 'line',
            name: '实际考试数量',
            symbol: 'circle',
            symbolSize: 0,
            data: []
            //  smooth: true
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
      this.barOption.series[1].data = [];
      let { resultData, status } = await testMonthCount();
      if (status === 'complete') {
        resultData.forEach(item => {
          this.barOption.xAxis[0].data.push(item.key + '月');
          this.barOption.series[0].data.push(item.value[0]);
          this.barOption.series[1].data.push(item.value[1]);
        });
      }
    },
    myChartClick(param, index) {
      this.drillDown({
        path: '/PlanManagement/ExamPlan'
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
