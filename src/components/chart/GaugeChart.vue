<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-06-14 17:09:32
 * @LastEditTime: 2022-06-15 16:57:50
 * @LastEditors: huhaiou
-->
<template>
  <div :id="chartId" class="chart" ref="chart" v-resize="resize"></div>
</template>

<script>
import { deepObjectMerge } from '@/utils/util'; // 引入工具类
import { chartsMixins } from './mixins';

export default {
  name: 'BarChart',
  mixins: [chartsMixins],
  data() {
    return {
      baseOption: {
        series: [
          {
            type: 'gauge',
            anchor: {
              show: true,
              showAbove: true,
              size: 18,
              itemStyle: {
                color: '#FAC858'
              }
            },
            pointer: {
              icon:
                'path://M2.9,0.7L2.9,0.7c1.4,0,2.6,1.2,2.6,2.6v115c0,1.4-1.2,2.6-2.6,2.6l0,0c-1.4,0-2.6-1.2-2.6-2.6V3.3C0.3,1.9,1.4,0.7,2.9,0.7z',
              width: 8,
              length: '80%',
              offsetCenter: [0, '8%']
            },
            progress: {
              show: true,
              overlap: true,
              roundCap: true
            },
            axisLine: {
              roundCap: true
            },
            data: [],
            title: {
              fontSize: 14
            },
            detail: {
              width: 40,
              height: 14,
              fontSize: 14,
              color: '#fff',
              backgroundColor: 'auto',
              borderRadius: 3,
              formatter: '{value}%'
            }
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
        if (this.myChart) this.myChart.resize();
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
