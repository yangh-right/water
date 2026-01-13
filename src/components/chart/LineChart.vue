<!--
 * @Author: duyibo
 * @Date: 2023-04-13 11:29:55
 * @LastEditors: Do not edit
 * @LastEditTime: 2024-11-19 10:28:55
 * @Description:
-->
/** * @Date: 2019/11/5 17:04 * @Version: 0.0.1 * @Author: passerby * @Description: 折线图组件 *
@Update: 调整组件 by yunchangJia 2019-12-30 16:44 */

<template>
  <div :id="chartId" ref="chart" v-resize="resize" class="chart"></div>
</template>

<script>
import { deepObjectMerge } from '@/utils/util'; // 引入工具类
import { chartsMixins } from './mixins';

export default {
  name: 'LineChart',
  props: {
    isClick: {
      type: Boolean,
      default: false
    }
  },
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
            bottom: '2%',
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
        // this.myChart.setOption(this.baseOption);
        this.addClick();
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
    },
    addClick() {
      if (this.isClick) {
        this.myChart.getZr().off('click');
        this.myChart.getZr().on('click', async params => {
          const pointInPixel = [params.offsetX, params.offsetY];
          if (this.myChart.containPixel('grid', pointInPixel)) {
            /*此处添加具体执行代码*/
            const pointInGrid = this.myChart.convertFromPixel({ seriesIndex: 0 }, pointInPixel);
            //X轴序号
            const xIndex = pointInGrid[0];

            //获取当前图表的option
            const op = this.myChart.getOption();
            //获得图表中我们想要的数据
            const xDataItem = op.xAxis[0].data[xIndex];
            const yDataItem = op.series[0].data[xIndex];
            this.$emit('zrClick', xDataItem, yDataItem);
          }
        });
      }

      this.myChart.off('click');
      this.myChart.on('click', params => {
        this.$emit('myChartClick', params);
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
