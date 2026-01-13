<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="echart-block">
        <pie-chart ref="alarmChart" :option="option"> </pie-chart>
      </div>
      <div class="points-list">
        <div v-for="(item, i) in pointsArr" :key="item.label" class="point-tab">
          <div class="label">
            <span class="ico-react" :style="{ background: colors[i] }"></span>{{ item.label }}
          </div>
          <div class="value">{{ item.value }} <span class="unit">kwh/m³</span></div>
          <div class="precent">{{ item.percent }}%</div>
        </div>
      </div>
    </div>
  </bim-card>
</template>

<script>
import BimCard from './BimCard.vue';
export default {
  name: 'PowerAnalysis',
  components: {
    BimCard,
    PieChart: () => import('@/components/chart/PieChart.vue')
  },
  data() {
    return {
      cardTitle: '能耗分析',
      colors: ['#FF8C41', '#43F9C9', '#25C969', '#2EB1FF', '#4CEEF7'],
      pointsArr: [
        {
          label: '风机',
          value: 131,
          unit: 'kwh/m³',
          percent: '36.09'
        },
        {
          label: '提升泵',
          value: 39,
          unit: 'kwh/m³',
          percent: '10.74'
        },
        {
          label: '回流泵',
          value: 35,
          unit: 'kwh/m³',
          percent: '9.64'
        },
        {
          label: '排泥泵',
          value: 69,
          unit: 'kwh/m³',
          percent: '19.01'
        },
        {
          label: '其他',
          value: 89,
          unit: 'kwh/m³',
          percent: '24.52'
        }
      ],
      option: {
        tooltip: {
          trigger: 'item'
        },
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie',
            radius: ['50%', '80%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: false,
              position: 'center',
              formatter: '{name|{d}}{unit|%}\n{value|{b}}',
              rich: {
                name: { fontSize: 22, color: '#13E0FF', fontWeight: 600 },
                unit: { fontSize: 12, color: '#13E0FF' },
                value: { fontSize: 12, color: '#B2DFFF' }
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
            data: [
              { value: 131, name: '风机' },
              { value: 39, name: '提升泵' },
              { value: 35, name: '回流泵' },
              { value: 69, name: '排泥泵' },
              { value: 89, name: '其他' }
            ]
          }
        ]
      }
    };
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
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
  display: flex;

  .echart-block {
    width: 40%;
    height: 100%;
    text-align: center;
  }
  .points-list {
    width: 60%;
    height: 100%;

    .point-tab {
      width: 224px;
      height: 26px;
      background-image: linear-gradient(90deg, #0072ce33 0%, #006dce0d 48%, #0065ce36 100%);
      margin: 0 auto;
      margin-top: 6px;
      padding: 0 8px;
      display: flex;
      justify-content: space-between;
      align-items: center;

      .label {
        width: 70px;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #b2dfff;
        letter-spacing: 0;

        .ico-react {
          display: inline-block;
          width: 8px;
          height: 8px;
          border-radius: 1.76px;
          margin-right: 6px;
        }
      }

      .value {
        width: 90px;
        color: #ffffffff;
        font-size: 14px;
        font-weight: 700;
        line-height: 0;
        letter-spacing: 0;

        .unit {
          color: #ffffffff;
          font-size: 14px;
          line-height: 0;
          letter-spacing: 0;
        }
      }
      .precent {
        width: 48px;
        font-weight: 700;
        font-size: 14px;
        color: #6fc9ff;
        letter-spacing: 0;
        text-align: right;
      }
    }
  }
}
</style>
