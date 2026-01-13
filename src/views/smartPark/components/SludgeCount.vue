<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="tips-header">
        <div class="filed">
          <img src="@/assets/images/default/sludge1.png" alt="当月污泥累积外运量(T)" />
          <div class="filed-info">
            <div class="label">当月污泥累积外运量(T)</div>
            <div class="value">9867</div>
          </div>
        </div>
        <div class="filed">
          <img src="@/assets/images/default/sludge2.png" alt="吨水污泥产量(kg/m³)" />
          <div class="filed-info">
            <div class="label">吨水污泥产量(kg/m³)</div>
            <div class="value">1846</div>
          </div>
        </div>
      </div>
      <div class="echarts-block">
        <bar-chart :darkTheme="'light'" :option="barOption" ref="barChart"></bar-chart>
      </div>
    </div>
  </bim-card>
</template>

<script>
import * as echarts from 'echarts';
import BimCard from './BimCard.vue';
export default {
  name: 'SludgeCount',
  components: {
    BimCard,
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  data() {
    return {
      cardTitle: '污泥产量',
      barOption: {}
    };
  },
  computed: {},
  watch: {},
  methods: {
    initData() {
      let dataAxis = [];
      for (let i = 1; i <= 31; i++) {
        dataAxis.push(i);
      }
      let data = [
        220,
        182,
        191,
        234,
        290,
        330,
        310,
        123,
        442,
        321,
        90,
        149,
        210,
        122,
        133,
        334,
        198,
        123,
        125,
        220,
        132,
        233,
        354,
        287,
        98,
        119,
        68,
        321,
        260,
        229
      ];
      let option = {
        grid: [
          {
            top: '12%',
            left: '3%',
            right: '4%',
            bottom: '4%',
            containLabel: true
          }
        ],
        xAxis: [
          {
            data: dataAxis
          }
        ],
        yAxis: [
          {
            name: 'T',
            nameTextStyle: {
              padding: [0, 0, -12, -4]
            },
            splitLine: {
              lineStyle: {
                type: 'dashed'
              },
              show: true
            }
          }
        ],
        dataZoom: [
          {
            type: 'inside'
          }
        ],
        series: [
          {
            type: 'bar',
            itemStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                { offset: 0, color: 'rgba(53,185,255,0.9)' },
                { offset: 1, color: '	rgba(41,164,209,0)' }
              ])
            },
            data: data
          }
        ]
      };
      this.barOption = option;
    }
  },
  created() {
    this.initData();
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;

  .tips-header {
    width: 100%;
    height: 40px;
    display: flex;
    justify-content: flex-start;
    margin-top: 4px;

    .filed {
      width: 50%;
      display: flex;
      justify-content: center;
      align-items: center;

      img {
        margin-right: 8px;
      }
      .filed-info {
        .label {
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: #b2dfff;
          letter-spacing: 0;
        }
        .value {
          font-weight: 700;
          font-size: 18px;
          color: #e0f2ff;
          letter-spacing: 0;
          text-shadow: 0 1px 8px #51aaf2cf;
        }
      }
    }
  }
  .echarts-block {
    width: 100%;
    height: calc(100% - 44px);
  }
}
</style>
