<template>
  <div class="chart-box">
    <div class="chart-title">出水（mg/L）</div>
    <div class="tabs-box">
      <div class="tabs">
        <div
          v-for="item in displayedPoints"
          :key="item.pointName"
          :class="currentPoint === item.pointName ? 'tab active' : 'tab'"
          @click="handleChange(item)"
        >
          {{ item.pointMemo }}
        </div>
      </div>
      <w-dropdown v-if="pointsArr.length > pageSize" style="line-height: normal;">
        <a class="ant-dropdown-link" @click="e => e.preventDefault()">
          更多<w-icon type="right" />
        </a>
        <w-menu slot="overlay" @click="handleMenuClick">
          <w-menu-item key="1" v-for="i in menuPoints" :key="i.pointName">
            {{ i.pointMemo }}
          </w-menu-item>
        </w-menu>
      </w-dropdown>
    </div>
    <div class="chart-wrapper">
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        ref="inChart"
      ></line-chart>
    </div>
    <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import { mapState } from 'vuex';
import { getOutletWater } from '@/api/cockpit.js';

const dateList = [
  '0:00',
  '01:00',
  '02:00',
  '03:00',
  '04:00',
  '05:00',
  '06:00',
  '07:00',
  '08:00',
  '09:00',
  '10:00',
  '11:00',
  '12:00',
  '13:00',
  '14:00',
  '15:00',
  '16:00',
  '17:00',
  '18:00',
  '19:00',
  '20:00',
  '21:00',
  '22:00',
  '23:00',
  '24:00'
];

const ColorMap = {
  dark: ['#4285F4', '#FFAB00'],
  green: ['#09A8AB', '#FFAB00'],
  red: ['#CE4C1C', '#FFAB00'],
  default: ['#4285F4', '#FFAB00']
};

export default {
  name: 'OutWater',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  props: {
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false,
      pointsArr: [],
      currentPoint: '1',
      pageSize: 99, //显示多少tab
      displayedPoints: [], //显示部分
      menuPoints: [], //更多下拉
      barOption: {
        color: ['#3CFB99', '#4285F4', '#FFD23D', '#FF3379'],
        grid: [
          {
            left: '3%',
            right: '3%',
            top: '18%',
            bottom: '12%'
          }
        ],
        legend: {
          top: 'bottom',
          itemHeight: 2,
          itemWidth: 12,
          data: [
            { icon: 'rect', name: '实时' },
            { icon: 'rect', name: '预测' },
            {
              icon:
                'path://M234.666667 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM473.6 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM934.4 490.666667h-136.533333a25.6 25.6 0 1 0 0 51.2h136.533333a25.6 25.6 0 1 0 0-51.2zM712.533333 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2z',
              name: '内控'
            },
            {
              icon:
                'path://M234.666667 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM473.6 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2zM934.4 490.666667h-136.533333a25.6 25.6 0 1 0 0 51.2h136.533333a25.6 25.6 0 1 0 0-51.2zM712.533333 490.666667h-153.6a25.6 25.6 0 1 0 0 51.2h153.6a25.6 25.6 0 1 0 0-51.2z',
              name: '设计'
            }
          ]
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            data: dateList
          }
        ],
        yAxis: [
          {
            name: ''
          }
        ],
        series: [
          {
            name: '实时',
            type: 'line',
            showSymbol: false,
            data: [],
            smooth: true
          },
          {
            name: '预测',
            type: 'line',
            showSymbol: false,
            data: [],
            smooth: true
          },
          {
            name: '内控',
            type: 'line',
            showSymbol: false,
            data: [],
            lineStyle: {
              type: 'dashed'
            },
            smooth: true
          },
          {
            name: '设计',
            type: 'line',
            showSymbol: false,
            data: [],
            lineStyle: {
              type: 'dashed'
            },
            smooth: true
          }
        ]
      }
    };
  },
  inject: ['state'],
  computed: {
    ...mapState('dict', ['factory_standard', 'national_standard']),
    themeColor: {
      get() {
        return ColorMap[this.state.theme] || ColorMap['default'];
      },
      set() {}
    }
  },
  watch: {
    factoryId: {
      handler(val) {
        this.initData(val);
      },
      immediate: true
    },
    factory_standard: {
      handler(val) {
        if (val) {
          this.updateChartLegend();
        }
      },
      immediate: true
    },
    national_standard: {
      handler(val) {
        if (val) {
          this.updateChartLegend();
        }
      },
      immediate: true
    }
  },
  methods: {
    updateChartLegend() {
      // 更新图例名称
      this.barOption.legend.data[2].name = this.factory_standard || '内控';
      this.barOption.legend.data[3].name = this.national_standard || '设计';
      // 更新系列名称
      this.barOption.series[2].name = this.factory_standard || '内控';
      this.barOption.series[3].name = this.national_standard || '设计';
      // 如果图表已经初始化，则刷新
      if (this.$refs.inChart) {
        this.$refs.inChart.refreshChart();
      }
    },
    handleMenuClick(e) {
      let indexId = 0;
      let data = {};
      this.pointsArr.map((item, index) => {
        if (item.pointName === e.key) {
          indexId = index;
          data = { ...item };
        }
      });
      [this.pointsArr[2], this.pointsArr[indexId]] = [this.pointsArr[indexId], this.pointsArr[2]];
      this.displayedPoints = this.pointsArr.slice(0, this.pageSize);
      this.menuPoints = this.pointsArr.slice(this.pageSize);
      this.handleChange(data);
    },
    async initData(id) {
      this.isLoading = true;
      let startTime = this.$moment()
        .subtract(24, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      let endTime = this.$moment()
        .add(24, 'hours')
        .format('YYYY-MM-DD HH:mm:ss');
      let { status, resultData } = await getOutletWater(id, '', startTime, endTime);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        this.pointsArr = resultData;
        this.displayedPoints = this.pointsArr.slice(0, this.pageSize);
        this.menuPoints = this.pointsArr.slice(this.pageSize);
        this.handleChange(this.pointsArr[0]);
      }
      this.isLoading = false;
    },
    handleChange(item) {
      this.currentPoint = item.pointName;
      this.handleChart(item);
    },
    handleChart(pointData) {
      let { unit, dataAndTimeList = [] } = pointData;
      let valueList = dataAndTimeList.map(item => item.pv);
      this.barOption.xAxis[0].data = dataAndTimeList.map(item => item.date?.slice(11, 16));
      this.barOption.series[0].data = valueList;
      this.barOption.series[1].data = dataAndTimeList.map(item => item.simulatePv || '--');
      this.barOption.series[2].data = this.handleLimitVal(pointData.cb || 0);
      this.barOption.series[3].data = this.handleLimitVal(pointData.gb || 0);
    },
    handleLimitVal(val) {
      let tempArr = [];
      for (let i = 0; i < 24; i++) {
        tempArr.push(val);
      }
      return tempArr;
    }
  }
};
</script>

<style lang="less" scoped>
.chart-spin {
  position: absolute;
  left: 50%;
  top: 50%;
  z-index: 10;
  transform: translate(-50%, -50%);
}
.tabs-box {
  display: flex;
  margin-top: 8px;
  justify-content: flex-start;
  align-items: center;
  .tabs {
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      height: 24px;
      line-height: 24px;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 10px;
      background: var(--supply-color-bg-card-dark);
      border: 1px solid var(--supply-rgb-color-bg-DEFAULT);
      color: var(--supply-color-secondary);
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: var(--supply-color-online);
    }
  }
}
.ant-dropdown-link:hover {
  color: var(--supply-color-primary-DEFAULT);
  opacity: 0.7;
}
</style>
