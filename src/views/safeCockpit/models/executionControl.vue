<!-- 执行控制监控组件 -->
<template>
  <!-- 使用UnitCard组件作为容器 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 图表和数据展示区域 -->
    <div class="echart-wrap">
      <!-- 饼图区域 -->
      <div class="echart-block">
        <pie-chart
          ref="chart"
          :defaultHighlight="false"
          :option="option"
          @click="myChartClick"
        ></pie-chart>
      </div>
      <!-- 数据列表区域 -->
      <div class="points-list">
        <div v-for="(item, i) in pointsArr" :key="item.name" class="point-tab">
          <div class="label">
            <div class="ico-react">
              <div class="ico-react_inner" :style="{ background: colorList[i] }"></div>
            </div>
            {{ item.name }}
          </div>
          <div class="percent">{{ item.percent }}%</div>
          <div class="value">{{ item.value }}个</div>
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
// 导入主题mixin、工具函数和API
import { themeMixin } from '@/core/mixins.ts';
import { keepDecimal } from '@/utils/js/tool/tools';
import { executiveControl } from '@/api/cockpit';

// 颜色列表
const colorList = ['#20B0FF', '#FFC343', '#00C8B7', '#6758FF', '#C064EF', '#00C07C'];
// 初始数据
const pointsArr = [
  {
    name: '合规操作数',
    value: 0,
    percent: 0
  },
  {
    name: '违规操作数',
    value: 0,
    percent: 0
  }
];

export default {
  name: 'executionControl',
  mixins: [themeMixin], // 使用主题mixin
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue'),
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
      colorList,
      pointsArr,
      // 图表配置
      option: {
        color: colorList,
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie',
            radius: ['0%', '70%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: false
            },
            labelLine: {
              show: false
            },
            data: pointsArr
          }
        ]
      }
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      immediate: true
    }
  },
  activated() {
    // 组件激活时调整图表大小
    this.$refs.chart?.resize();
  },
  methods: {
    // 初始化数据
    async initData() {
      let { resultData, status } = await executiveControl(this.waterPlantId);
      if (status === 'complete') {
        let data = resultData || {};
        // 处理 null 值，默认为 0
        const compliance = data.compliance ?? 0;
        const unCompliance = data.unCompliance ?? 0;
        let total = compliance + unCompliance;
        // 更新合规操作数据
        this.pointsArr[0] = {
          ...this.pointsArr[0],
          value: compliance,
          percent: total ? keepDecimal((compliance / total) * 100, 1) : 0
        };
        // 更新违规操作数据
        this.pointsArr[1] = {
          ...this.pointsArr[1],
          value: unCompliance,
          percent: total ? keepDecimal((unCompliance / total) * 100, 1) : 0
        };
        this.pointsArr = [...this.pointsArr];
        this.option.series[0].data = this.pointsArr;
      }
    },
    myChartClick(params) {
      this.drillDown({
        path: '/ticketAnalyse'
      });
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.echart-wrap {
  margin-top: 20px;
  width: 100%;
  height: calc(100% - 40px);
  flex-direction: row;
  display: flex;
  align-items: center;
}
.echart-block {
  width: 40%;
  height: 100%;
  text-align: center;
  .label-wrap {
    position: absolute;
  }
}

.points-list {
  width: 50%;
  height: 100%;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  .point-tab {
    width: 100%;
    height: 32px;
    background: var(--supply-cockpit-legend);
    margin-top: 8px;
    padding: 0 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-radius: 2px;

    .label {
      width: 120px;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      line-height: 18px;

      .ico-react {
        display: inline-flex;
        justify-content: center;
        align-items: center;
        width: 12px;
        height: 12px;
        background: #fff;
        border-radius: 12px;
        position: relative;
        top: -1px;
        box-shadow: 0 2px 4px 0 #0000001f;
      }
      .ico-react_inner {
        width: 8px;
        height: 8px;
        border-radius: 8px;
      }
    }

    .value,
    .percent {
      width: 70px;
      text-align: right;
      font-family: MiSans-Medium, sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;

      .unit {
        font-family: Aliba, sans-serif;
        color: #ffffffff;
        font-size: 16px;
        line-height: 0;
        letter-spacing: 0;
      }
    }
  }
}
</style>
