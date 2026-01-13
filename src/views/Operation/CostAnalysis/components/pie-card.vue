<!-- 环形饼图 -->
<template>
  <ModelCard :title="titleName" :loading="loading" :empty="empty">
    <template #content>
      <w-ring
        :data="chartData"
        :themeName="themeObj.theme"
        :settings="settings"
        :extend="extend"
        :events="{ click: onEchartsClick }"
        height="100%"
        width="100%"
      ></w-ring>
    </template>
  </ModelCard>
</template>

<script>
import ModelCard from './model-card';
export default {
  name: 'PieCard',
  inject: ['waterPlantIdObj', 'themeObj'],
  data() {
    return {
      loading: false,
      titleName: '',
      chartData: {
        columns: ['类型', '金额'],
        rows: [],
      },
      settings: {
        offsetY: '45%',
        radius: ['35%', '55%'],
        label: {
          alignTo: 'edge',
          formatter: '{d}%\n{b}',
          minMargin: 5,
          edgeDistance: 10,
          lineHeight: 15,
        },
      },
      extend: {
        color: ['#4edced', '#b7f141', '#f7b500', '#f65e6f', '#5ea8ff', '#8c6cff', '#bdf252'],
        legend: {
          bottom: 5,
          icon: 'circle',
          type: 'scroll',
          itemWidth: 10,
          itemHeight: 10,
        },
        title: {
          text: '600',
          subtext: '总',
          textAlign: 'center',
          textVerticalAlign: 'middle',
          top: '40%',
          left: '49%',
          textStyle: {
            fontSize: 28,
            fontWeight: '400',
            fontFamily: 'PingFangSC-Regular',
            lineHeight: 20,
          },
          subtextStyle: {
            fontSize: 14,
            fontWeight: '400',
            fontFamily: 'PingFangSC-Regular',
            lineHeight: 20,
          },
        },
        tooltip: {
          position: function (point, params, dom, rect, size) {
            // 鼠标坐标和提示框位置的参考坐标系是：以外层div的左上角那一点为原点，x轴向右，y轴向下
            // 提示框位置
            var x = 0; // x坐标位置
            var y = 0; // y坐标位置 // 当前鼠标位置

            var pointX = point[0];
            var pointY = point[1]; // 外层div大小 // var viewWidth = size.viewSize[0]; // var viewHeight = size.viewSize[1]; // 提示框大小

            var boxWidth = size.contentSize[0];
            var boxHeight = size.contentSize[1]; // boxWidth > pointX 说明鼠标左边放不下提示框

            if (boxWidth > pointX) {
              x = pointX + 10;
            } else {
              // 左边放的下
              x = pointX - boxWidth - 10;
            } // boxHeight > pointY 说明鼠标上边放不下提示框

            if (boxHeight > pointY) {
              y = 5;
            } else {
              // 上边放得下
              y = pointY - boxHeight;
            }

            return [x, y];
          },
        },
      },
    };
  },
  props: {
    title: {
      type: String,
      default: '',
    },
    firstCostType: Object,
  },

  components: { ModelCard },
  computed: {
    empty() {
      return Boolean(this.chartData.rows.length);
    },
  },
  watch: {
    waterPlantIdObj: {
      deep: true,
      handler() {
        this.getList();
      },
    },
    firstCostType: {
      deep: true,
      handler() {
        this.getList();
      },
    },
  },
  methods: {
    // 点击echarts,将名字传出去
    onEchartsClick(e) {
      this.$emit('changeTab', e.name);
    },
    async getList() {
      this.loading = true;
      this.chartData.rows = [];
      try {
        if (this.title.includes('成本金额比例')) {
          let { resultData } = await this.$http.post('/costAnalysis/getCostRatio', this.waterPlantIdObj);
          this.titleName = this.title + `${resultData.unit ? '(' + resultData.unit + ')' : ''}`;
          this.extend.title.text = resultData.allCost;
          resultData.costList.forEach((item) => {
            this.chartData.rows.push({ 类型: item.unit, 金额: item.num });
          });
        } else {
          if (!this.firstCostType.id) return;
          let { resultData } = await this.$http.post(
            `/costAnalysis/getCostRatioByTypeId?costTypeId=${this.firstCostType.id}`,
            this.waterPlantIdObj
          );
          this.titleName =
            this.firstCostType.name +
            '分布' +
            `${resultData.unit ? '(' + resultData.unit + ')' : ''}`;
          this.extend.title.text = resultData.allCost;
          resultData.costList.forEach((item) => {
            this.chartData.rows.push({ 类型: item.unit, 金额: item.num });
          });
        }
      } catch {
        this.chartData.rows = [];
      } finally {
        this.loading = false;
      }
    },
  },
};
</script>
