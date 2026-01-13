<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-04-03 09:07:08
 * @Description:
-->
<template>
  <div :class="['content', themeConfig.className]">
    <div class="echart-wrap">
      <div class="echart-block">
        <pie-chart
          ref="alarmChart"
          @click="myChartClick"
          :defaultHighlight="false"
          :option="option"
        >
        </pie-chart>
      </div>
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
</template>
<script>
import { themeMixin } from '@/core/mixins.ts';
import { questionCategoryCount } from '@/api/cockpit';
const colorList = [
  '#FF6E2A',
  '#0375FF',
  '#FFBB02',
  '#00C07C',
  '#20B0FF',
  '#72f0ff',
  '#0e0e4a',
  'red',
  '#ecf0f1',
  'pink'
];
export default {
  name: 'AdministrativeCockpit',
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  mixins: [themeMixin],
  data() {
    return {
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
      pointsArr: [],
      option: {
        title: {
          text: '',
          left: 'center',
          top: '35%',
          textStyle: {
            color: this.state.theme === 'dark' ? '#fff' : '#333333',
            fontSize: '22.4px'
          },
          subtext: '总数(个)',
          subtextStyle: {
            color: this.state.theme === 'dark' ? '#ADB5BD' : '#666666',
            fontSize: '14px'
          }
        },
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie',
            radius: ['70%', '90%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: false
            },

            labelLine: {
              show: false
            },
            data: []
          }
        ]
      }
    };
  },
  computed: {},
  activated() {},
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      this.pointsArr = [];
      let { resultData, status } = await questionCategoryCount();
      if (status === 'complete') {
        let total = resultData.reduce((pre, cur) => {
          return pre + cur.value;
        }, 0);
        this.pointsArr = resultData.map((item, i) => {
          return {
            name: item.key,
            value: item.value,
            itemStyle: {
              color: colorList[i]
            }
          };
        });
        this.option.title.text = total;
        this.option.series[0].data = this.pointsArr;
      }
    },
    myChartClick(param, index) {
      this.drillDown({
        path: '/QuestionManagement/TestQuestion'
      });
    },
    themeChange() {
      this.option.title.textStyle.color = this.themeConfig.color;
      this.option.title.subtextStyle.color = this.themeConfig.subColor;
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  width: 100%;
  height: calc(100% - 28px);
  &.card-dark {
    .point-tab {
      background: #212730;
    }
    .echart-block {
      background: url('~@/assets/safeCockpit/chart_bg_dark.png') center center no-repeat;
      background-size: 66% 64%;
    }
  }
}
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
  background: url('~@/assets/administrativeCockpit/chart_bg.png') center center no-repeat;
  background-size: 66% 64%;
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
  overflow: auto;
  .point-tab {
    width: 100%;
    height: 32px;
    background: #f6f8fa;
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
      width: 53px;
      font-family: MiSans-Medium, sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
    }
  }
}
</style>
