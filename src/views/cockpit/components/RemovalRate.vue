<template>
  <div class="chart-box">
    <!-- 图表标题，包含帮助提示 -->
    <div class="chart-title">
      去除率（%）
      <w-tooltip placement="topLeft">
        <template slot="title">
          去除率 = (进水污染物浓度 - 出水污染物浓度) / 进水污染物浓度 × 100%
        </template>
        <img src="@/assets/cockpit/ic_help.png" alt="" style="width: 20px; cursor: pointer;" />
      </w-tooltip>
    </div>
    <!-- 选项卡区域 -->
    <div class="tabs-box">
      <div class="tabs">
        <!-- 遍历显示的监测量 -->
        <div
          v-for="item in displayedPoints"
          :key="item.pointName"
          :class="currentPoint === item.pointName ? 'tab active' : 'tab'"
          @click="handleChange(item)"
        >
          {{ item.pointMemo }}
        </div>
      </div>
      <!-- 更多监测量下拉菜单 -->
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
    <!-- 图表区域 -->
    <div class="chart-wrapper">
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        ref="inChart"
      ></line-chart>
    </div>
    <!-- 加载中 -->
    <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
  </div>
</template>

<script>
import { removalRate } from '@/api/cockpit.js';

// 时间列表
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

// 颜色映射
const ColorMap = {
  dark: ['#4285F4', '#FFAB00'],
  green: ['#09A8AB', '#FFAB00'],
  red: ['#CE4C1C', '#FFAB00'],
  default: ['#4285F4', '#FFAB00']
};

export default {
  name: 'RemovalRate',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  props: {
    // 水厂ID
    factoryId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      isLoading: false, // 加载状态
      pointsArr: [], // 监测量列表
      currentPoint: '1', // 当前选中的监测量
      pageSize: 99, // 显示的监测量数量
      displayedPoints: [], // 显示的监测量
      menuPoints: [], // 更多下拉菜单中的监测量
      // 图表配置
      barOption: {
        title: [
          {
            left: 'center',
            text: 'Gradient along the y axis'
          }
        ],
        color: ['#F57A13'],
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
            name: '%',
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
            splitLine: { lineStyle: { type: 'dashed' } }
          }
        ],
        series: [
          {
            type: 'line',
            symbol: 'circle',
            symbolSize: 8,
            data: [],
            smooth: true
          }
        ]
      }
    };
  },
  inject: ['state'],
  computed: {
    // 根据主题设置颜色
    themeColor: {
      get() {
        return ColorMap[this.state.theme] || ColorMap['default'];
      },
      set() {}
    }
  },
  watch: {
    // 监听水厂ID变化
    factoryId: {
      handler(val) {
        this.initData(val);
      }
    }
  },
  methods: {
    // 处理更多监测量点击
    handleMenuClick(e) {
      let indexId = 0;
      let data = {};
      this.pointsArr.map((item, index) => {
        if (item.pointName === e.key) {
          indexId = index;
          data = { ...item };
        }
      });
      [this.pointsArr[this.pageSize - 1], this.pointsArr[indexId]] = [
        this.pointsArr[indexId],
        this.pointsArr[this.pageSize - 1]
      ];
      this.displayedPoints = this.pointsArr.slice(0, this.pageSize);
      this.menuPoints = this.pointsArr.slice(this.pageSize);
      this.handleChange(data);
    },
    // 初始化数据，获取去除率数据
    async initData(id) {
      this.isLoading = true;
      let { status, resultData } = await removalRate(id);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        this.pointsArr = resultData;
        this.displayedPoints = this.pointsArr?.slice(0, this.pageSize);
        this.menuPoints =
          this.pointsArr.length > this.pageSize ? this.pointsArr.slice(this.pageSize) : [];
        this.handleChange(this.pointsArr[0]);
      }
      this.isLoading = false;
    },
    // 处理监测量变化
    handleChange(item) {
      this.currentPoint = item.pointName;
      this.handleChart(item);
    },
    // 处理图表数据
    handleChart(pointData) {
      let { unit, dataAndTimeList = [] } = pointData;
      let valueList = dataAndTimeList.map(item => (item.pv * 100).toFixed(2));
      this.barOption.xAxis[0].data = dataAndTimeList.map(item => item.date?.slice(11, 16));
      this.barOption.series[0].data = valueList;
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
      background: var(--supply-rgb-color-bg-DEFAULT);
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
