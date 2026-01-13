<template>
  <div class="chart-box">
    <div class="chart-title">进水（mg/L）</div>
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
import { getInletWater } from '@/api/cockpit.js';

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
  name: 'InWater',
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
      currentPoint: '',
      pageSize: 99, //显示多少tab
      displayedPoints: [], //显示部分
      menuPoints: [], //更多下拉
      barOption: {
        visualMap: [
          {
            show: false,
            type: 'continuous',
            seriesIndex: 0,
            min: 0,
            max: 400,
            color: ['#2EDDF9', '#3582FF']
          }
        ],
        grid: [
          {
            left: '3%',
            right: '3%',
            top: '18%',
            bottom: '4%'
          }
        ],
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
            type: 'line',
            showSymbol: false,
            data: [],
            smooth: true,
            areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: this.colorRgb('#2EDDF9', 0.8) },
                { offset: 1, color: this.colorRgb('#3582FF', 0.1) }
              ])
            }
          }
        ]
      }
    };
  },
  inject: ['state'],
  computed: {
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
      }
    }
  },
  methods: {
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
      let { status, resultData } = await getInletWater(id);
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
    },
    colorRgb(str, opacity) {
      let sColor = str.toLowerCase();
      if (sColor) {
        if (sColor.length === 4) {
          let sColorNew = '#';
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
        }
        return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
      } else {
        return sColor;
      }
    }
  },
  created() {},
  mounted() {}
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
