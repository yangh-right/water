<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-18 09:51:21
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <div :class="['echart-wrap', themeConfig.className]">
      <div class="title">
        <div class="icon"></div>
        <div class="name">监测量总数：</div>
        <div class="total">{{ pointCount }}个</div>
      </div>
      <div class="info-box">
        <div class="echart-block">
          <pie-chart ref="chart" :defaultHighlight="false" :option="option" @click="myChartClick">
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
  </unit-card>
</template>

<script>
import { themeMixin } from '@/core/mixins.ts';
import { basicInformationOfTheProject } from '@/api/cockpit';
const colorList = ['#FFBB02', '#0375FF', '#00C07C'];
const pointsArr = [
  {
    name: '项目数量',
    value: 0
  },
  {
    name: '站点数量',
    value: 0
  },
  {
    name: '设备数量',
    value: 0
  }
];
export default {
  name: 'temperatureInfo',
  mixins: [themeMixin],
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
      pointCount: 0,
      option: {
        color: colorList,
        title: {
          text: '0',
          left: 'center',
          top: '35%',
          textStyle: {
            color: '#333',
            fontSize: '22.4px'
          },
          subtext: '在线数量(个)',
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
    this.$refs.chart?.resize();
  },
  methods: {
    async initData() {
      let res = await basicInformationOfTheProject(this.waterPlantId);
      let { status, resultData } = res;
      if (status === 'complete') {
        this.pointsArr[0].value = resultData?.projectNum || 0;
        this.pointsArr[1].value = resultData?.stationNum || 0;
        this.pointsArr[2].value = resultData?.deviceNum || 0;
        this.pointsArr = [...this.pointsArr];
        this.option.series[0].data = this.pointsArr;
        this.option.title.text = res.resultData?.totalPointNum || 0;
      }
    },
    myChartClick(params) {
      this.drillDown({
        path: '/Comprehensive/temperatureData'
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
.echart-wrap {
  margin-top: 20px;
  width: 100%;
  height: 100%;
  &.card-dark {
    .title {
      background: #212730;
    }
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
    background: #f4f8fb;
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
      background: url('~@/assets/safeCockpit/allPoint.png') no-repeat;
      background-size: 100% 100%;
      margin-right: 12px;
    }
    .total {
      font-weight: 600;
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
