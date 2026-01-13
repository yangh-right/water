<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: wangyr
 * @LastEditTime: 2025-04-08 14:49:15
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
    <div class="card-inner">
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        ref="inChart"
      ></line-chart>
    </div>
  </unit-card>
</template>

<script>
import moment from 'moment';
import { getDateRange } from './data';
import { capacityAnalysis } from '@/api/cockpit.js';
export default {
  name: 'treatmentAnalysis',
  components: {
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue'),
    LineChart: () => import('@/components/chart/LineChart.vue')
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
      goods: [
        { label: '日', value: 'day' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' }
      ],
      type: 'year',
      barOption: {
        title: [
          {
            left: 'center',
            text: 'Gradient along the y axis'
          }
        ],
        color: ['#28A8F3', '#00cc9d', '#febe1c', '#F194F4'],
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
            min: 0,
            max: 100,
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
            name: '',
            data: [],
            barMaxWidth: '10',
            itemStyle: {
              borderRadius: [100, 100, 0, 0]
            }
          },
          {
            type: 'bar',
            name: '',
            data: [],
            barMaxWidth: '10',
            itemStyle: {
              borderRadius: [100, 100, 0, 0]
            }
          },
          {
            type: 'line',
            name: '',
            symbol: 'circle',
            symbolSize: 0,
            data: []
            //  smooth: true
          }
        ]
      }
    };
  },
  mounted() {
    this.initData();
  },
  methods: {
    typeChange() {
      this.initData();
    },
    async initData() {
      let { startDate, endDate } = getDateRange(this.type);
      let params = {
        endDate,
        queryType: this.type,
        startDate,
        waterPlantId: this.waterPlantId
      };
      const { status } = await capacityAnalysis(params);
      if (status === 'complete') {
        this.barOption.series[2].name = this.type === 'year' ? '同比增长率' : '环比增长率';
        switch (this.type) {
          case 'year':
            this.barOption.series[0].name = `${moment()
              .subtract(1, 'year')
              .format('YYYY')}年处理量`;
            this.barOption.series[1].name = `${moment().format('YYYY')}年处理量`;

            break;
          case 'month':
            this.barOption.series[0].name = `上个月处理量`;
            this.barOption.series[1].name = `本月处理量`;

            break;
          case 'day':
            this.barOption.series[0].name = `昨天处理量`;
            this.barOption.series[1].name = `今天处理量`;

            break;

          default:
            break;
        }
      }
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
