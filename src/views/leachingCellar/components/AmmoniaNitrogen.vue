<!--
 * @Author: wangyr
 * @Date: 2023-06-15 15:56:01
 * @LastEditors: wangyr
 * @LastEditTime: 2024-08-12 18:34:52
 * @Description:
-->
<template>
  <cockpit-card :cardTitle="cardTitle">
    <div class="content">
      <line-chart
        :darkTheme="'light'"
        powerType="powerSupply"
        :option="barOption"
        ref="inChart"
      ></line-chart>
      <w-spin :spinning="isLoading" class="chart-spin"></w-spin>
    </div>
  </cockpit-card>
</template>

<script>
import CockpitCard from './CockpitCard.vue';
import { ammoniaNitrogen } from '@/api/cockpit.js';

export default {
  name: 'AmmoniaNitrogen',
  components: {
    CockpitCard,
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
      cardTitle: '氨氮控制曲线',
      barOption: {
        color: ['#3CFB99', '#4285F4', '#FFD23D', '#CF48F7', '#FF4F3D'],
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
              name: '1级'
            }
          ]
        },
        tooltip: {
          trigger: 'axis'
        },
        xAxis: [
          {
            data: []
          }
        ],
        yAxis: [
          {
            name: '',
            splitLine: {
              lineStyle: {
                type: 'dashed'
              },
              show: true
            }
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
            name: '1级',
            type: 'line',
            showSymbol: false,
            data: [
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5,
              0.5
            ],
            smooth: true,
            lineStyle: {
              type: 'dashed',
              width: 1
            }
          }
        ]
      },
      isLoading: false
    };
  },
  computed: {},
  watch: {
    factoryId: {
      handler(val) {
        if (!!val) {
          this.initData(val);
        }
      }
    }
  },
  activated() {
    if (this.factoryId) {
      this.initData(this.factoryId);
    }
  },
  methods: {
    async initData(id) {
      this.isLoading = true;
      let { status, resultData } = await ammoniaNitrogen(id);
      if (status === 'complete' && Array.isArray(resultData) && resultData.length > 0) {
        let { unit, dataAndTimeList, cb } = resultData[0];
        let dateList = dataAndTimeList.map(item => item.date?.slice(11, 16));
        let valueList = dataAndTimeList.map(item => item.pv);
        let simulatePvList = dataAndTimeList.map(item => item.simulatePv);
        this.barOption.yAxis[0].name = unit;
        this.barOption.xAxis[0].data = dateList;
        this.barOption.series[0].data = valueList;
        this.barOption.series[1].data = simulatePvList;
        this.barOption.series[2].data = dateList.map(() => cb);
      }
      this.isLoading = false;
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  height: 100%;
  position: relative;
  .chart-spin {
    position: absolute;
    left: 50%;
    top: 50%;
    z-index: 10;
    transform: translate(-50%, -50%);
  }
}
</style>
