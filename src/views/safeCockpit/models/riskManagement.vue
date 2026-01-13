<!-- 风险管理监控组件 -->
<template>
  <!-- 使用UnitCard组件作为容器 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 内容区域 -->
    <div :class="['info-box', themeConfig.className]">
      <!-- 饼图区域 -->
      <div class="echart-block">
        <pie-chart
          ref="chart"
          :defaultHighlight="false"
          :option="option"
          @click="goTeamManage"
        ></pie-chart>
      </div>
      <!-- 数据列表区域 -->
      <div class="points-list">
        <div v-for="(item, i) in pointsArr" :key="item.name" class="point-tab">
          <div class="label">
            <div class="ico-react">
              <div
                class="ico-react_inner"
                :style="{ background: colorList[i % colorList.length] }"
              ></div>
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
import moment from 'moment';
import { keepDecimal } from '@/utils/js/tool/tools';
import { riskManagement } from '@/api/cockpit';

// 颜色列表
const colorList = ['#6758FF', '#C064EF', '#00C07C', '#20B0FF', '#FFC343'];
// 初始数据
const pointsArr = [];

export default {
  name: 'riskManagement',
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
      colorList,
      pointsArr,
      total: 823,
      // 图表配置
      option: {
        title: {
          text: '0',
          left: 'center',
          top: '35%',
          textStyle: {
            color: '#333',
            fontSize: '22.4px'
          },
          subtext: '总数(个)',
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
            type: 'pie',
            radius: ['75%', '90%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: false
            },
            padAngle: 2,
            itemStyle: {
              borderRadius: '50%'
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
      let params = {
        waterPlantId: this.waterPlantId,
        startTime: moment()
          .startOf('month')
          .format('YYYY-MM-DD 00:00:00'),
        endTime: moment().format('YYYY-MM-DD 23:59:59')
      };

      let { resultData, status } = await riskManagement(params);
      if (status === 'complete') {
        let data = resultData || [];
        if (data.length === 0) {
          // 默认数据
          this.pointsArr = [
            {
              name: '暂无数据',
              value: 0,
              percent: 100,
              itemStyle: {
                color: this.colorList[0]
              }
            }
          ];
          this.option.series[0].data = this.pointsArr;
          this.option.title.text = 0;
        } else {
          let total = data.reduce((total, item) => {
            return total + item.riskNum;
          }, 0);
          let levelStr = ['零', '一', '二', '三', '四', '五', '六', '七', '八', '九', '十'];
          this.pointsArr = data.map((item, i) => {
            return {
              name: levelStr?.[item.riskLevel]
                ? levelStr[item.riskLevel] + '级风险'
                : item.riskLevel,
              value: item.riskNum,
              percent: total ? keepDecimal((item.riskNum / total) * 100, 1) : 0,
              itemStyle: {
                color: this.colorList[i % this.colorList.length]
              }
            };
          });
          this.option.series[0].data = this.pointsArr;
          this.option.title.text = total || 0;
        }
      }
    },
    goTeamManage() {
      this.drillDown({
        path: '/riskManage/riskList'
      });
    },
    // 主题切换事件
    themeChange() {
      this.option.title.textStyle.color = this.themeConfig.color;
      this.option.title.subtextStyle.color = this.themeConfig.subColor;
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.info-box {
  display: flex;
  align-items: center;
  justify-content: space-evenly;
  width: 100%;
  height: 100%;
  &.card-dark {
    .echart-block {
      background: url('~@/assets/safeCockpit/pie-bg_dark.png') center center no-repeat;
      background-size: 65% 65%;
    }
  }
  .echart-block {
    width: 180px;
    height: 180px;
    text-align: center;
    background: url('~@/assets/safeCockpit/pie-bg.png') center center no-repeat;
    background-size: 65% 65%;
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
      .percent,
      .value {
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
}
</style>
