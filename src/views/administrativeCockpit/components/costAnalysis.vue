<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-04-03 09:21:17
 * @Description:
-->
<template>
  <div :class="['content', themeConfig.className]">
    <div class="echart-wrap">
      <div class="echart-block">
        <pie-chart
          ref="alarmChart"
          :defaultHighlight="false"
          :option="option"
          @click="myChartClick"
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
          <div class="value">{{ item.value }}元</div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { themeMixin } from '@/core/mixins.ts';
const colorList = ['#20B0FF', '#ffc343', '#00C8B7', '#4B79F2', '#7DEBCE'];
import { getCostAnalysePage } from '@/api/manage';
const pointsArr = [
  {
    name: '水费',
    value: 0,
    itemStyle: {
      color: '#20B0FF'
    }
  },
  {
    name: '药剂费',
    value: 0,
    itemStyle: {
      color: '#ffc343'
    }
  },
  {
    name: '电费',
    value: 0,
    itemStyle: {
      color: '#00C8B7'
    }
  },
  {
    name: '污泥处置费',
    value: 0,
    itemStyle: {
      color: '#4B79F2'
    }
  },
  {
    name: '其他费用',
    value: 0,
    itemStyle: {
      color: '#7DEBCE'
    }
  }
];
export default {
  name: 'AdministrativeCockpit',
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  mixins: [themeMixin],
  props: {
    costTime: {
      type: String,
      default: '3'
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
      waterPlantId: '',
      colorList,
      pointsArr,
      option: {
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
    costTime() {
      this.getList();
    }
  },
  created() {
    this.getWaterPlant();
  },
  methods: {
    // 获取水厂信息
    async getWaterPlant() {
      const { resultData } = await this.$http.post('waterPlantClient/getWaterPlants');
      this.waterPlantId = resultData?.[0]?.id || '';
      this.getList();
    },
    async getList() {
      if (!this.waterPlantId) return;
      let params = {
        endTime: this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD'),
        waterPlantId: this.waterPlantId
      };
      if (this.costTime === '3') {
        params.startTime = this.$moment()
          .subtract('months', 12)
          .format('YYYY-MM-DD');
      } else if (this.costTime === '2') {
        params.startTime = this.$moment()
          .subtract('months', 1)
          .format('YYYY-MM-DD');
      } else {
        params.startTime = this.$moment()
          .subtract(1, 'days')
          .format('YYYY-MM-DD');
      }
      const { resultData, status } = await getCostAnalysePage(params);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        let dataObj = resultData[0];
        let dataArr = [
          {
            name: '水费',
            value: Number((dataObj.flowPv ?? 0).toFixed(2)),
            itemStyle: {
              color: '#20B0FF'
            }
          },
          {
            name: '药剂费',
            value: Number((dataObj.dosagePv ?? 0).toFixed(2)),
            itemStyle: {
              color: '#ffc343'
            }
          },
          {
            name: '电费',
            value: Number((dataObj.powerPv ?? 0).toFixed(2)),
            itemStyle: {
              color: '#00C8B7'
            }
          },
          {
            name: '污泥处置费',
            value: Number((dataObj.sludgePv ?? 0).toFixed(2)),
            itemStyle: {
              color: '#4B79F2'
            }
          },
          {
            name: '其他费用',
            value: Number(
              (
                (dataObj.pacPv ? dataObj.pacPv : 0) +
                (dataObj.sodiumAcetatePv ? dataObj.sodiumAcetatePv : 0) +
                (dataObj.sodiumHypochloritePv ? dataObj.sodiumHypochloritePv : 0)
              ).toFixed(2)
            )
          }
        ];
        this.option.series[0].data = dataArr;
        this.pointsArr = dataArr || [];
      }
    },
    myChartClick(param) {
      this.drillDown({
        path: '/analysis/costAnalysis'
      });
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
  .label-wrap {
    position: absolute;
  }
}

.points-list {
  width: 54%;
  height: 100%;
  padding-left: 12px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

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
      /* width: 80px; */
      font-family: MiSans-Medium, sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
    }
  }
}
</style>
