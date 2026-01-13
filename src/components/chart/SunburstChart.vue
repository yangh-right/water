<template>
  <div :id="chartId" class="chart" ref="chart" v-resize="resize"></div>
</template>

<script>
import { deepObjectMerge } from '@/utils/util'; // 引入工具类
import { chartsMixins } from './mixins';

export default {
  name: 'SunburstChart',
  mixins: [chartsMixins],
  data() {
    return {
      baseOption: {
        title: {
          textStyle: {
            fontSize: 14,
            fontWeight: 'normal'
          }
        },
        series: {
          type: 'sunburst',
          data: [],
          radius: [0, '85%'],
          sort: undefined,
          emphasis: {
            focus: 'ancestor'
          },
          levels: [
            {},
            {
              r0: '-25%',
              r: '25%',
              label: {
                rotate: 0,
                formatter: ['{num|{c}}{unit|次}', '{b|{b}}'].join('\n'),
                // rich 里是文本片段的样式设置：
                rich: {
                  num: {
                    color: '#323333',
                    fontSize: 20,
                    lineHeight: 30
                  },
                  unit: {
                    color: '#969999',
                    fontSize: 10
                  },
                  b: {
                    color: '#646666',
                    fontSize: 14,
                    lineHeight: 20
                  }
                }
              }
            },
            {
              r0: '35%',
              r: '70%',
              itemStyle: {
                borderWidth: 2
              },
              label: {
                rotate: 'tangential'
              }
            },
            {
              r0: '70%',
              r: '80%',
              label: {
                align: 'right'
              }
            }
          ]
        }
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
