<!--
 * @Description: echart
 * @Author: zhangtianwen
 * @LastEditTime: 2020-09-08 08:27:56
-->
<template>
  <div ref="chart" class="chart-box"></div>
</template>
<script>
import * as echarts from 'echarts';
import ResizeObserver from 'resize-observer-polyfill';
import { mapState } from 'vuex';
import { debounce } from '@/utils/js/tool/tools';
export default {
  name: 'EChart',
  computed: mapState('setting', ['menuCollapsed']),
  props: {
    option: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      chart: null,
      observer: null
    };
  },
  watch: {
    option() {
      this.drawChart();
    },
    baseTheme() {
      this.initChart();
    }
  },
  mounted() {
    this.initChart();
  },
  methods: {
    initChart() {
      this.$nextTick(() => {
        this.chart = echarts.init(this.$refs.chart, this.baseTheme);
        // 绑定点击事件前先解绑之前的，否则会出现叠加，导致点击一次调用多次请求
        this.chart.off('click');
        this.chart.on(
          'click',
          debounce((params) => {
            this.$emit('series-click', params);
          }, 200)
        );
        this.chart.on('restore', (params) => {
          // echarts v5.2会出现点击还原事件图表变空白的情况
          // 先用此方法捕获restore事件，重新对图表进行渲染
          this.drawChart();
        });
        this.chart.getZr().on('click', (params) => {
          const pointInPixel = [params.offsetX, params.offsetY];
          const pointInGrid = this.chart.convertFromPixel({ seriesIndex: 0 }, pointInPixel);
          this.$emit('chart-click', pointInGrid);
        });
        this.drawChart();
        this.echartResize();
      });
    },
    echartResize() {
      let fn = function () {
        this.chart.resize();
      }.bind(this);
      this.observer = new ResizeObserver(debounce(fn));
      this.observer.observe(this.$refs.chart);
    },
    // 绘制图表
    drawChart() {
      this.chart.clear();
      this.chart.setOption(this.option);
    },
    beforeDestroy() {
      this.observer.unobserve(this.$refs.chart);
    }
  }
};
</script>

<style scoped>
.chart-box {
  width: 100%;
  height: 100%;
}
</style>
