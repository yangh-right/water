<template>
  <div class="chart-container">
    <div :id="chartId" class="chart" :ref="chartId"></div>
    <!-- 底座背景 -->
    <slot></slot>
  </div>
</template>

<script>
import * as echarts from 'echarts';
import 'echarts-gl';
import { deepObjectMerge } from '@/utils/util'; // 引入工具类
import { getPie3D, getParametricEquation } from './charts'; // 工具类js

export default {
  name: 'PieChart',
  data() {
    return {
      myChart: null,
      chartOptions: {},
      baseOption: {
        legend: {
          itemWidth: 6,
          itemHeight: 6,
          itemGap: 20,
          icon: 'circle',
          bottom: 15,
          left: 'center'
        },
        tooltip: {
          trigger: 'item',
          formatter: param => {
            return `${param.marker}${param.name} ${param.value} ${param.percent}%`;
          }
        },
        xAxis3D: { min: -1, max: 1 },
        yAxis3D: { min: -1, max: 1 },
        zAxis3D: { min: -1, max: 1 },
        series: []
      }
    };
  },
  props: {
    // 配置项
    option: {
      type: Object,
      default: () => {}
    },
    chartId: {
      type: String,
      default: 'chart'
    },
    /** 总数 */
    total: {
      type: Number,
      default: 0
    },
    chartView: {
      type: Object,
      default: () => {
        return {
          internalDiameterRatio: 0.8, // 透明的空心占比
          distance: 240, // 视角到主体的距离
          alpha: 28, // 旋转角度
          pieHeight: 18, //立体的高度
          opacity: 0.8 // 饼或者环的透明度
        };
      }
    }
  },
  inject: ['state'],
  watch: {
    'state.theme': {
      handler() {
        this.initChart();
      }
    },
  },
  mounted() {
    this.chartLoaded = true;
    this.$emit('load');
    this.init();
  },
  beforeDestory() {
    this.dispose();
  },
  activated() {
    this.init();
  },
  deactivated() {
    this.dispose();
  },
  methods: {
    initChart() {
      this.dispose();
      this.$nextTick(() => {
        this.init();
      });
    },
    // 图表绘制
    drawLine() {
      if (this.myChart) {
        this.myChart.clear();
        this.myChart.off('click')
        this.myChart.on('click', params => {
          this.$emit('click', params);
        });
        let _option = deepObjectMerge({}, this.option);
        if (this.option.data) {
          // 传入数据生成 chartOptions, 构建3d饼状图, 参数工具文件已经备注的很详细
          const { grid3D, series, tooltip } = getPie3D(this.option.data, this.chartView);
          _option = { ..._option, grid3D, series, tooltip };
          this.chartOptions = deepObjectMerge(this.baseOption, _option);
          this.myChart.setOption(this.chartOptions);
          this.resize();
          this.bindListen(this.myChart);
        }
      }
    },
    init() {
      if (!this.myChart) {
        if (this.$refs[this.chartId]) {
          this.myChart = echarts.init(this.$refs[this.chartId]);
          this.drawLine();
        }
      }
    },
    dispose() {
      if (this.myChart) {
        this.myChart.dispose();
        this.myChart = null
        clearInterval(this.$el.__vueSetInterval__);
      }
    },
    refreshTitle(text) {
      this.chartOptions.title.text = text;
      this.myChart.setOption(this.chartOptions);
    },

    resize() {
      this.$nextTick(() => {
        // if (this.myChart) this.myChart.resize();
      });
    },

    // 监听鼠标事件，实现饼图选中效果（单选），近似实现高亮（放大）效果。
    // optionName是防止有多个图表进行定向option传递，单个图表可以不传，默认是opiton
    bindListen(myChart, optionName = 'chartOptions') {
      let selectedIndex = '';
      let hoveredIndex = '';
      let that = this;
      let option = that[optionName]
      // 监听点击事件，实现选中效果（单选）
      // myChart.on('click', params => {
      //   // 从 chartOptions.series 中读取重新渲染扇形所需的参数，将是否选中取反。
      //   const isSelected = !that[optionName].series[params.seriesIndex].pieStatus.selected;
      //   const isHovered = that[optionName].series[params.seriesIndex].pieStatus.hovered;
      //   const k = that[optionName].series[params.seriesIndex].pieStatus.k;
      //   const startRatio = that[optionName].series[params.seriesIndex].pieData.startRatio;
      //   const endRatio = that[optionName].series[params.seriesIndex].pieData.endRatio;
      //   // 如果之前选中过其他扇形，将其取消选中（对 chartOptions 更新）
      //   if (selectedIndex && selectedIndex !== params.seriesIndex) {
      //     that[optionName].series[selectedIndex].parametricEquation = getParametricEquation(
      //       that[optionName].series[selectedIndex].pieData.startRatio,
      //       that[optionName].series[selectedIndex].pieData.endRatio,
      //       false,
      //       false,
      //       k,
      //       that.chartView.pieHeight // that[optionName].series[selectedIndex].pieData.value
      //     );
      //     that[optionName].series[selectedIndex].pieStatus.selected = false;
      //   }
      //   // 对当前点击的扇形，执行选中/取消选中操作（对 chartOptions 更新）
      //   that[optionName].series[params.seriesIndex].parametricEquation = getParametricEquation(
      //     startRatio,
      //     endRatio,
      //     isSelected,
      //     isHovered,
      //     k,
      //     that.chartView.pieHeight // that[optionName].series[params.seriesIndex].pieData.value
      //   );
      //   that[optionName].series[params.seriesIndex].pieStatus.selected = isSelected;
      //   // 如果本次是选中操作，记录上次选中的扇形对应的系列号 seriesIndex
      //   selectedIndex = isSelected ? params.seriesIndex : null;
      //   // 使用更新后的 option，渲染图表
      //   myChart.setOption(that[optionName]);
      // });
      // 监听 mouseover，近似实现高亮（放大）效果
      myChart.off('mouseover')
      myChart.on('mouseover', params => {
        // 准备重新渲染扇形所需的参数
        let isSelected;
        let isHovered;
        let startRatio;
        let endRatio;
        let k;
        // 如果触发 mouseover 的扇形当前已高亮，则不做操作
        if (hoveredIndex === params.seriesIndex) {
          // 否则进行高亮及必要的取消高亮操作
        } else {
          // 如果当前有高亮的扇形，取消其高亮状态（对 chartOptions 更新）
          if (hoveredIndex !== '') {
            // 从 chartOptions.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 false。
            isSelected = option.series[hoveredIndex].pieStatus.selected;
            isHovered = false;
            startRatio = option.series[hoveredIndex].pieData.startRatio;
            endRatio = option.series[hoveredIndex].pieData.endRatio;
            k = option.series[hoveredIndex].pieStatus.k;
            // 对当前点击的扇形，执行取消高亮操作（对 chartOptions 更新）
            option.series[hoveredIndex].parametricEquation = getParametricEquation(
              startRatio,
              endRatio,
              isSelected,
              isHovered,
              k,
              that.chartView.pieHeight // option.series[hoveredIndex].pieData.value
            );
            option.series[hoveredIndex].pieStatus.hovered = isHovered;
            // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
            hoveredIndex = '';
          }
          // 如果触发 mouseover 的扇形不是透明圆环，将其高亮（对 chartOptions 更新）
          if (params.seriesName !== 'mouseoutSeries' && params.seriesName !== 'pie2d') {
            // 从 chartOptions.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
            isSelected = option.series[params.seriesIndex].pieStatus.selected;
            isHovered = true;
            startRatio = option.series[params.seriesIndex].pieData.startRatio;
            endRatio = option.series[params.seriesIndex].pieData.endRatio;
            k = option.series[params.seriesIndex].pieStatus.k;
            // 对当前点击的扇形，执行高亮操作（对 chartOptions 更新）
            option.series[params.seriesIndex].parametricEquation = getParametricEquation(
              startRatio,
              endRatio,
              isSelected,
              isHovered,
              k,
              that.chartView.pieHeight * 1.2 //  option.series[params.seriesIndex].pieData.value + 60
            );
            option.series[params.seriesIndex].pieStatus.hovered = isHovered;
            // 记录上次高亮的扇形对应的系列号 seriesIndex
            hoveredIndex = params.seriesIndex;
          }
          // 使用更新后的 option，渲染图表
          let alarmNum = that.option.data.find(d => d.name === params.seriesName).value;
          // myChart.setOption(option);
          that.$emit('hover', { name: params.seriesName, value: alarmNum });
        }
      });
      // 修正取消高亮失败的 bug
      myChart.off('globalout')
      myChart.on('globalout', () => {
        // 准备重新渲染扇形所需的参数
        let isSelected;
        let isHovered;
        let startRatio;
        let endRatio;
        let k;
        if (hoveredIndex !== '') {
          // 从 chartOptions.series 中读取重新渲染扇形所需的参数，将是否高亮设置为 true。
          isSelected = option.series[hoveredIndex].pieStatus.selected;
          isHovered = false;
          k = option.series[hoveredIndex].pieStatus.k;
          startRatio = option.series[hoveredIndex].pieData.startRatio;
          endRatio = option.series[hoveredIndex].pieData.endRatio;
          // 对当前点击的扇形，执行取消高亮操作（对 chartOptions 更新）
          option.series[hoveredIndex].parametricEquation = getParametricEquation(
            startRatio,
            endRatio,
            isSelected,
            isHovered,
            k,
            that.chartView.pieHeight // option.series[hoveredIndex].pieData.value
          );
          option.series[hoveredIndex].pieStatus.hovered = isHovered;
          // 将此前记录的上次选中的扇形对应的系列号 seriesIndex 清空
          hoveredIndex = '';
          // option.title.text = ['{per|' + that.total + '}'];
          that.$emit('hover', '');
        }
        // 使用更新后的 option，渲染图表
        // myChart.setOption(option);
      });
    }
  }
};
</script>

<style lang="less" scoped>
.chart-container {
  position: relative;
  width: 100%;
  height: 100%;
  z-index: 0;

  .chart {
    width: 100%;
    height: 100%;
    top: -30px;
  }
}

// 旋转动画
@keyframes rotate {
  0% {
    transform: rotateZ(0deg); /*从0度开始*/
  }
  100% {
    transform: rotateZ(360deg); /*360度结束*/
  }
}
</style>
