/** * @Date: 2019/11/5 17:04 * @Version: 0.0.1 * @Author: passerby * @Description: 折线图组件 *
@Update: 调整组件 by yunchangJia 2019-12-30 16:44 */

<template>
  <div :id="chartId" ref="chart" v-resize="resize" class="chart"></div>
</template>

<script>
import { deepObjectMerge } from '@/utils/util'; // 引入工具类
import { chartsMixins } from './mixins';

export default {
  name: 'PointChart',
  mixins: [chartsMixins],
  data() {
    return {
      baseOption: {
        title: {
          textStyle: {
            fontSize: 12
          }
        },
        tooltip: {
          // 提示框组件
          confine: true,
          trigger: 'axis' // 触发类型，axis表示坐标轴触发
        },
        legend: {
          normal: {
            itemWidth: 6,
            itemHeight: 6
          }
        },
        grid: [
          {
            left: '3%',
            right: '4%',
            bottom: '10%',
            containLabel: true
          }
        ],
        xAxis: [
          {
            type: 'category'
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            type: 'line'
          }
        ]
      }
    };
  },
  methods: {
    /**
     * 渲染图表
     */
    drawLine() {
      if (this.myChart) {
        this.myChart.clear();
        this.myChart.setOption(deepObjectMerge(this.baseOption, this.option));
        this.resize();
      }
    },

    /**
     * resize
     */
    resize() {
      this.$nextTick(() => {
        this.myChart.resize();
      });
    }
  }
};
</script>

<style scoped>
.chart {
  width: 100%;
  height: 100%;
}
</style>
