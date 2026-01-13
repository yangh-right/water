<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 右侧头部区域，包含时间选择按钮 -->
    <div slot="headerRight">
      <w-radio-group size="small" v-model="type" @change="typeChange">
        <w-radio-button v-for="(item, index) in goods" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-radio-button>
      </w-radio-group>
    </div>
    <!-- 折线图组件 -->
    <line-chart
      :darkTheme="'light'"
      powerType="powerSupply"
      :option="barOption"
      @myChartClick="handleBarClick"
      ref="inChart"
    ></line-chart>
  </unit-card>
</template>

<script>
import { getDateRange, formatDate } from './data';
import { getEnergyDayData } from '@/api/analysis';
export default {
  name: 'powerAnalysis',
  components: {
    // 异步加载折线图组件
    LineChart: () => import('@/components/chart/LineChart.vue'),
    // 异步加载单位卡片组件
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
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
      // 时间选择按钮配置
      goods: [
        { label: '日', value: 'day' },
        { label: '月', value: 'month' },
        { label: '年', value: 'year' }
      ],
      type: 'day', // 当前选择的时间类型
      // 图表配置项
      barOption: {
        title: [
          {
            left: 'center',
            text: 'Gradient along the y axis'
          }
        ],
        color: ['#28A8F3'], // 图表颜色
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
            axisLabel: {
              rotate: 40,
              formatter: value => {
                return value && value.length > 5
                  ? this.type === 'day'
                    ? value?.slice(11, 16)
                    : this.type === 'month'
                    ? value?.slice(5, 10)
                    : value?.slice(5, 7)
                  : value;
              }
            },
            data: [] // X轴数据
          }
        ],
        yAxis: [
          {
            name: 'kwh', // Y轴单位
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
            type: 'bar', // 柱状图
            name: '电量统计',
            data: [], // 数据
            barMaxWidth: '10',
            itemStyle: {
              borderRadius: [100, 100, 0, 0] // 柱状图圆角
            }
          }
        ]
      }
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData(); // 初始化数据
        }
      },
      immediate: true
    }
  },
  methods: {
    // 时间类型改变事件
    typeChange() {
      this.initData();
    },
    // 初始化数据
    async initData() {
      // 获取时间范围
      let { startDate, endDate } = getDateRange(this.type);
      const params = {
        dateType: this.getDateType(this.type),
        deviceIdList: [],
        endDate,
        startDate,
        ratioFlag: true,
        statType: 0,
        waterPlantIdList: [this.waterPlantId]
      };
      // 获取电量数据
      const { resultData, status } = await getEnergyDayData(params);
      if (status === 'complete') {
        this.getPointList(resultData || []);
      }
    },
    handleBarClick() {
      // this.drillDown({
      //   path: '/report/powerTable'
      // });
    },
    // 根据时间类型获取日期类型
    getDateType(type) {
      switch (type) {
        case 'day':
          return 'hour';
        case 'month':
          return 'day';
        case 'year':
          return 'month';
        default:
          return '';
      }
    },
    // 处理数据点列表
    async getPointList(val) {
      let dataTime = [],
        flowPvList = [];
      // 处理数据
      val.forEach(item => {
        dataTime.push(this.formatDate(item.dateTime || item.date, this.type));
        flowPvList.push(item.powerPv);
      });
      // 更新图表数据
      this.barOption.xAxis[0].data = dataTime;
      this.barOption.series[0].data = flowPvList;
    },
    formatDate(date, type) {
      if (!date) return '';
      switch (type) {
        case 'year':
          return this.$moment(date).format('YYYY-MM');
        default:
          return date;
      }
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
