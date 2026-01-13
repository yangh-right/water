/**
* @Date: 2019/11/5 17:04
* @Version: 0.0.1
* @Author: passerby
* @Description: 雷达图组件
* @Update: 调整组件 by hyq 2020/1/2 9:55
*/

<template>
  <div :id="chartId" class="chart" ref="chart" v-resize="resize"></div>
</template>

<script>
import { deepObjectMerge } from '@/utils/util'; // 引入工具类
import { chartsMixins } from './mixins';

export default {
  name: 'RadarChart',
  mixins: [chartsMixins],
  data() {
    return {
      baseOption: {
        tooltip: {
          //提示框组件
          trigger: 'item', //触发类型
          axisPointer: {
            //坐标轴指示器配置项
            type: 'cross'
          }
        },
        legend: {
          itemWidth: 6,
          itemHeight: 6,
          itemGap: 20,
          icon: 'circle',
          bottom: 15,
          padding: 0,
          left: 'center'
        },
        radar: [
          {
            indicator: [],
            radius: '70%', //雷达图半径
            center: ['50%', '45%'] //雷达图圆心位置
          }
        ],
        series: [
          {
            name: '',
            type: 'radar',
            data: []
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
