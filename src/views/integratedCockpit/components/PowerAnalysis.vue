<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="echart-block">
        <pie-chart ref="alarmChart" :option="option"> </pie-chart>
      </div>
      <div class="points-list">
        <div v-for="(item, i) in pointsArr" :key="item.statName" class="point-tab">
          <div class="label">
            <span class="ico-react" :style="{ background: colors[i] }"></span>{{ item.statName }}
          </div>
          <div class="value">{{ item.powerPv }} <span class="unit">kwh</span></div>
          <!-- <div class="precent">{{ item.powerPvRatio }}%</div> -->
        </div>
      </div>
    </div>
  </cockpit-card>
</template>

<script>
import { getEnergyDeviceAnalysis } from '@/api/analysis.js';
import CockpitCard from './CockpitCard.vue';
export default {
  name: 'PowerAnalysis',
  components: {
    CockpitCard,
    PieChart: () => import('@/components/chart/PieChart.vue')
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
      cardTitle: '能耗分析',
      colors: ['#FF8C41', '#43F9C9', '#25C969', '#2EB1FF', '#4CEEF7'],
      pointsArr: [],
      option: {
        tooltip: {
          trigger: 'item',
          confine: true
        },
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie',
            radius: ['56%', '80%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: false,
              position: 'center',
              formatter: '{name|{d}}{unit|%}\n{value|{b}}',
              rich: {
                name: {
                  fontSize: 22,
                  color: '#FAFCFF',
                  fontFamily: 'AlibabaPuHuiTi_2_55',
                  fontWeight: 600
                },
                unit: { fontSize: 12, color: '#FAFCFF', fontFamily: 'AlibabaPuHuiTi_2_55' },
                value: {
                  fontSize: 12,
                  lineHeight: 16,
                  color: '#B2DFFF',
                  fontFamily: 'AlibabaPuHuiTi_2_55'
                }
              }
            },
            emphasis: {
              label: {
                show: true,
                color: '#13E0FF',
                fontSize: 22,
                fontWeight: 600
              }
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
  watch: {
    factoryId: {
      handler(val) {
        if (val) {
          this.getRegionEngineerChart();
        }
      }
    }
  },
  methods: {
    async getRegionEngineerChart() {
      let param = {
        dateType: 'day',
        deviceIdList: [],
        endDate: this.$moment()
          .endOf('month')
          .format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: this.$moment()
          .startOf('month')
          .format('YYYY-MM-DD'),
        statType: 0,
        waterPlantIdList: [this.factoryId]
      };
      let res = await getEnergyDeviceAnalysis(param);
      let { status, resultData } = res;
      if (status === 'complete') {
        this.pointsArr = resultData;
        this.dataList = resultData.map((item, index) => {
          item.value = item.powerPvRatio;
          item.name = item.statName || '--';
          item.color = this.colors[index];
          return item;
        });
        this.option.series[0].data = this.dataList;
        this.option.series[0].color = this.colors;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;
  display: flex;

  .echart-block {
    width: 40%;
    height: 100%;
    text-align: center;
    position: relative;

    &::after {
      content: '';
      position: absolute;
      top: 7px;
      left: 0;
      width: 142px;
      height: 142px;
      background: url('~@/assets/images/default/integrated/ck-circle.png') no-repeat center center;
      background-size: 100% 100%;
      z-index: -1;
    }
  }
  .points-list {
    width: 60%;
    height: 100%;

    .point-tab {
      width: 224px;
      height: 26px;
      background-image: linear-gradient(90deg, #0072ce33 0%, #006dce0d 48%, #0065ce36 100%);
      margin: 0 auto;
      margin-top: 4px;
      padding: 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .label {
        font-family: AlibabaPuHuiTi_2_55, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #b2dfff;
        letter-spacing: 0;
        .ico-react {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 2%;
          margin-right: 6px;
        }
      }
      .value {
        color: #ffffffff;
        font-family: AlibabaPuHuiTi_2_55, sans-serif;
        font-size: 14px;
        font-weight: 700;
        letter-spacing: 0;
        .unit {
          color: #ffffffff;
          font-size: 12px;
          letter-spacing: 0;
        }
      }
      .precent {
        font-family: MiSans-Regular, sans-serif;
        width: 48px;
        font-weight: 700;
        font-size: 14px;
        color: #6fc9ff;
        text-align: right;
      }
    }
  }
}
</style>
