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
    <!-- 主要内容区域 -->
    <div :class="['echart-wrap', themeConfig.className]">
      <!-- 标题区域 -->
      <div class="title">
        <div class="icon"></div>
        <div class="name">总巡检总公里数：</div>
        <div class="total">{{ pointCount }}<span class="unit">km</span></div>
      </div>
      <!-- 信息展示区域 -->
      <div class="info-box">
        <!-- 饼图区域 -->
        <div class="echart-block">
          <pie-chart ref="chart" :defaultHighlight="false" :option="option" @click="goTeamManage">
          </pie-chart>
        </div>
        <!-- 巡检点列表 -->
        <div class="points-list">
          <div v-for="(item, i) in pointsArr" :key="item.name" class="point-tab">
            <div class="label">
              <div class="ico-react">
                <div class="ico-react_inner" :style="{ background: colorList[i] }"></div>
              </div>
              {{ item.name }}
            </div>
            <div class="value">{{ item.value }}个</div>
          </div>
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
import { getDateRange } from './data';
import { themeMixin } from '@/core/mixins.ts';
import { inspectionCompletionRate } from '@/api/cockpit';
// 颜色列表
const colorList = ['#0375FF', '#00C07C', '#FFBB02'];
// 巡检点数据
const pointsArr = [
  {
    name: '安全',
    value: 0
  },
  {
    name: '水质',
    value: 0
  },
  {
    name: '其他',
    value: 0
  }
];
export default {
  name: 'inspectRate',
  mixins: [themeMixin], // 使用主题混入
  components: {
    // 异步加载饼图组件
    PieChart: () => import('@/components/chart/PieChart.vue'),
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
        { label: '月', value: 'month' }
      ],
      type: 'month', // 当前选择的时间类型
      // 主题配置
      themeConfigMap: {
        default: {
          color: '#333',
          subColor: '#666',
          className: 'card-default'
        },
        dark: {
          color: '#fff',
          subColor: '#ADB5BD',
          className: 'card-dark'
        }
      },
      colorList, // 颜色列表
      pointsArr, // 巡检点数据
      pointCount: 0, // 总巡检公里数
      // 饼图配置
      option: {
        color: colorList,
        title: {
          text: '0',
          left: 'center',
          top: '35%',
          textStyle: {
            color: this.theme === 'dark' ? '#ffffff' : '#333333',
            fontSize: '22.4px'
          },
          subtext: '总计(个)',
          subtextStyle: {
            color: '#666666',
            fontSize: '14px'
          }
        },
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie', // 饼图
            radius: ['65%', '85%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: false
            },
            padAngle: 2,
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
          this.initData(); // 初始化数据
        }
      },
      immediate: true
    }
  },
  activated() {
    this.$refs.chart?.resize(); // 组件激活时重置图表大小
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
        queryType: this.type,
        endDate,
        startDate,
        waterPlantId: this.waterPlantId
      };
      // 获取巡检完成率数据
      let res = await inspectionCompletionRate(params);
      let { status, resultData } = res;
      if (status === 'complete') {
        // 更新数据
        this.pointCount = resultData?.totalCount || 0;
        this.pointsArr[0].value = resultData?.safetyInspectionCount || 0;
        this.pointsArr[1].value = resultData?.waterQualityInspectionCount || 0;
        this.pointsArr[2].value = resultData?.otherInspectionCount || 0;
        this.pointsArr = [...this.pointsArr];
        this.option.series[0].data = this.pointsArr;
        // 计算总数
        let total = this.pointsArr.reduce((pre, cur) => {
          return pre + (cur.value || 0);
        }, 0);
        this.option.title.text = total;
      }
    },
    // 主题改变事件
    themeChange() {
      this.option.title.textStyle.color = this.themeConfig.color;
      this.option.title.subtextStyle.color = this.themeConfig.subColor;
    },
    // 跳转到班组管理
    goTeamManage() {
      this.drillDown({
        path: '/manage/orderManage',
        query: {
          smallType: 'zhjs-xjgd'
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.echart-wrap {
  margin-top: 20px;
  width: 100%;
  height: 100%;
  &.card-dark {
    .info-box {
      .echart-block {
        background: url('~@/assets/safeCockpit/chart_bg_dark.png') center center no-repeat;
        background-size: 65% 65%;
      }
    }
  }
  .title {
    padding: 0 13px;
    width: 100%;
    height: 36px;
    background: var(--supply-cockpit-legend);
    border-radius: 4px;
    display: flex;
    align-items: center;
    font-weight: 400;
    font-size: 14px;
    color: var(--supply-color-main);
    letter-spacing: 0;
    .icon {
      width: 21px;
      height: 21px;
      background: url('~@/assets/productionCockpit/inspect.png') no-repeat;
      background-size: 100% 100%;
      margin-right: 12px;
    }
    .total {
      font-weight: 600;
      .unit {
        font-size: 12px;
        font-weight: 400;
        color: var(--supply-color-third);
      }
    }
  }
}
.info-box {
  flex-direction: row;
  display: flex;
  justify-content: space-evenly;
  align-items: center;
  width: 100%;
  height: calc(100% - 36px);

  .echart-block {
    width: 180px;
    height: 180px;
    text-align: center;
    background: url('~@/assets/safeCockpit/chart_bg.png') center center no-repeat;
    background-size: 65% 65%;
    .label-wrap {
      position: absolute;
    }
  }

  .points-list {
    width: 200px;
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
        width: 140px;
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
          margin-right: 10px;
        }
        .ico-react_inner {
          width: 8px;
          height: 8px;
          border-radius: 8px;
        }
      }

      .value {
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
}
</style>
