<template>
  <div :id="chartId" class="chart" ref="chart" v-resize="resize"></div>
</template>

<script>
import { deepObjectMerge } from '@/utils/util'; // 引入工具类
import { chartsMixins } from './mixins';

export default {
  name: 'BarChart',
  mixins: [chartsMixins],
  props: {
    powerType: {
      type: String
    }
  },
  data() {
    return {
      baseOption: {
        title: {
          textStyle: {
            fontSize: 12
          }
        },
        tooltip: {
          //提示框组件
          trigger: 'axis', //触发类型axis为坐标轴触发
          axisPointer: {
            //坐标轴指示器配置
            type: 'shadow'
          },
          textStyle: {
            fontSize: 10
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
        dataZoom: [
          {
            type: 'inside'
          }
        ],
        xAxis: [
          {
            type: 'category',
            splitLine: {
              //坐标轴在grid区域的分割线
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'value',
            axisLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLabel: {
              fontSize: '10'
            }
          }
        ],
        series: []
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
        // console.log(JSON.stringify(this.baseOption))
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
      if (this.powerType === 'waterSupply' || this.powerType === 'powerSupply') {
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
            const month = op.xAxis[0].data[xIndex];
            this.$emit('zrClick', month);
          }
        });
      }

      this.myChart.off('click');
      this.myChart.on('click', params => {
        this.$emit('callBack', params);
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
