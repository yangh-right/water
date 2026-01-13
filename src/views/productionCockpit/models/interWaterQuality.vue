<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: wangyr
 * @LastEditTime: 2025-04-08 09:46:52
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
    <div v-if="pointsArr.length" class="tabs-box">
      <w-radio-group size="small" v-model="currentPoint">
        <w-radio-button
          v-for="(item, index) in pointsArr"
          :key="item.pointMemo"
          :value="item.pointMemo"
          @click="handlePointChange(item)"
        >
          {{ item.pointMemo }}
        </w-radio-button>
      </w-radio-group>
    </div>
    <div v-if="pointsArr.length" class="card-inner">
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        :isClick="true"
        @zrClick="handleBarClick"
        ref="inChart"
      ></line-chart>
    </div>
    <empty v-else></empty>
  </unit-card>
</template>

<script>
import { getOutWaterQualityOption } from './data';
import { queryPointHistoryData } from '@/api/cockpit.js';

const TIME_FORMATS = {
  day: {
    format: 'HH:mm',
    startTime: { days: 1, hour: 8 },
    timePeriod: 'HOURS'
  },
  month: {
    format: 'DD日',
    startTime: { month: 'start', days: 1, hour: 8 },
    timePeriod: 'DAYS'
  },
  year: {
    format: 'MM月',
    startTime: { year: 'start', days: 1, hour: 8 },
    timePeriod: 'MONTHS'
  }
};
export default {
  name: 'interWaterQuality',
  components: {
    empty: () => import('../components/empty.vue'),
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
        { value: 'day', label: '日' },
        { value: 'month', label: '月' },
        { value: 'year', label: '年' }
      ],
      type: 'day',
      historyData: [],
      qualityData: [],
      pointsArr: [],
      currentPoint: '',
      chartData: null,
      barOption: {
        color: ['#28A8F3', '#00cc9d', '#febe1c'],
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
            name: '',
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
            type: 'line',
            name: '日均值',
            data: [],
            barWidth: '10',
            emphasis: {
              itemStyle: {
                borderRadius: 10
              }
            }
          },
          {
            type: 'line',
            name: '化验值',
            symbol: 'circle',
            symbolSize: 0,
            data: []
          }
        ]
      }
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(newVal) {
        if (newVal) {
          this.initData();
        }
      }
    }
  },
  methods: {
    typeChange() {
      this.initData();
    },
    handleBarClick() {
      // this.drillDown({
      //   path: '/report/waterPlant'
      // });
    },
    getTimeRange() {
      const now = this.$moment();
      const timeConfig = TIME_FORMATS[this.type];
      let startTime = now.clone();

      if (timeConfig) {
        if (timeConfig.startTime.year === 'start') {
          startTime.startOf('year');
        } else if (timeConfig.startTime.month === 'start') {
          startTime.startOf('month');
        }

        if (timeConfig.startTime.days) {
          startTime.subtract(timeConfig.startTime.days, 'days');
        }

        startTime.set({
          hour: timeConfig.startTime.hour || 0,
          minute: 0,
          second: 0
        });
      }

      return {
        startDateTime: startTime.format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: now.format('YYYY-MM-DD HH:mm:ss'),
        timePeriod: timeConfig?.timePeriod || 'HOURS'
      };
    },
    async initData() {
      if (!this.waterPlantId) return;

      try {
        const timeOptions = this.getTimeRange();
        const params = {
          ...timeOptions,
          waterPlantId: this.waterPlantId,
          configCode: 'inflow'
        };
        const params2 = {
          startDate: timeOptions.startDateTime,
          endDate: timeOptions.endDateTime,
          waterPlantId: this.waterPlantId,
          queryType: this.type
        };

        if (this.type === 'day') {
          const result = await queryPointHistoryData(params);
          this.historyData = result.resultData;
        } else {
          const [historyData] = await Promise.all([queryPointHistoryData(params)]);
          this.historyData = historyData.resultData;
        }

        // 重置数据
        this.pointsArr = [];
        this.currentPoint = '';
        this.chartData = null;

        // 处理返回数据
        if (Array.isArray(this.historyData) && this.historyData.length > 0) {
          this.pointsArr = this.historyData;
          this.handlePointChange(this.pointsArr[0]);
        }
      } catch (error) {
        console.error('获取出水水质数据失败:', error);
        this.pointsArr = [];
        this.currentPoint = '';
        this.chartData = null;
      }
    },
    handlePointChange(data) {
      if (!data) return;

      this.currentPoint = data.pointMemo;
      this.chartData = data;

      this.handleOption();
    },

    handleOption() {
      const { unit, dataAndTimeList, pointName } = this.chartData;
      const timeFormat = TIME_FORMATS[this.type]?.format || 'HH:mm';

      const xData = dataAndTimeList.map(item => this.$moment(item.date).format(timeFormat));
      // 根据时间维度选择使用的数值字段
      const valueField = ['month', 'year'].includes(this.type) ? 'avgPv' : 'pv';
      const data = dataAndTimeList.map(item => item[valueField]);
      const option = getOutWaterQualityOption({
        xData,
        yAxisName: unit || 'mg/L',
        cb: null,
        gb: null,
        data
      });
      // 根据时间维度选择使用的数值字段
      if (this.type === 'day') {
        //option.legend.data = ['实时值', '预测值'];
        option.legend.data = ['实时值'];
        // 实时值
        option.series[0].name = '实时值';
        option.series[0].data = dataAndTimeList.map(item => item[valueField]);

        // 预测值
        //option.series[1].name = '预测值';
        //option.series[1].data = dataAndTimeList.map(item => item[`simulatePv`]?.toFixed(2));
      }

      if (this.type === 'month') {
        option.legend.data = ['日均值'];
        // option.legend.data = ['日均值', '化验值'];
        // 实时值
        option.series[0].name = '日均值';
        option.series[0].data = dataAndTimeList.map(item => item[valueField]);
      }

      if (this.type === 'year') {
        option.legend.data = ['月均值'];
        // option.legend.data = ['月均值', '化验值'];
        // 实时值
        option.series[0].name = '月均值';
        option.series[0].data = dataAndTimeList.map(item => item[valueField]);
      }

      this.barOption = option;
    }
  }
};
</script>

<style lang="less" scoped>
.tabs-box {
  width: 100%;
  height: 40px;
  display: flex;
}
.card-inner {
  width: 100%;
  height: calc(100% - 40px);
}
</style>
