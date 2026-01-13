<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-18 09:51:21
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <line-chart
      :darkTheme="'light'"
      powerType="powerSupply"
      :option="barOption"
      @myChartClick="myChartClick"
      ref="inChart"
    ></line-chart>
  </unit-card>
</template>

<script>
import { newTicketLineChart } from '@/api/cockpit';
import moment from 'moment';
export default {
  name: 'hazardousOrder',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
  },
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
      barOption: {
        title: [
          {
            left: 'center',
            text: 'Gradient along the y axis'
          }
        ],
        color: ['#28A8F3'],
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
          itemWidth: 8,
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
            minInterval: 1,
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
            name: '工单数',
            data: [],
            barMaxWidth: '10',
            itemStyle: {
              borderRadius: [100, 100, 0, 0]
            }
          }
        ]
      }
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    async initData() {
      let params = {
        dateType: 'day',
        typeList: ['zhjs-fxgl'],
        startTime: moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        endTime: moment()
          .add(1, 'day')
          .format('YYYY-MM-DD')
      };
      const { resultData, status } = await newTicketLineChart(params);
      if (status === 'complete') {
        this.barOption.xAxis[0].data = (resultData?.xAxis || [])
          .map(item => (item ? item.replace('/', '-') : null))
          .slice(0, -1);
        let yAxis = resultData?.handleData[0]?.yAxis || [];
        this.barOption.series[0].data = yAxis
          .map(item => (item ? Number(item) : null))
          .slice(0, -1);
      }
    },
    myChartClick() {
      this.drillDown({
        path: '/specialOperationWork',
        query: {
          smallType: 'tzzy'
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  padding: 10px 0px 0;
  display: flex;
  flex-direction: column;
  .chart {
    flex: 1;
    overflow: hidden;
  }
}
</style>
