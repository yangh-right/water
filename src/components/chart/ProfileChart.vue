<template>
  <div :id="chartId" class="chart" ref="chart"></div>
</template>
<script>
import * as echarts from 'echarts';
import { deepObjectMerge } from '@/utils/js/tool/tools.js'; // 引入工具类
import { chartsMixins } from './mixins';

export default {
  name: 'BarChart',
  mixins: [chartsMixins],
  data() {
    return {
      baseOption: {
        tooltip: {
          formatter: function(params) {
            return params.marker + params.name + ': ' + params.value[3] / 1000 + ' s';
          }
        },
        legend: {
          bottom: 0, //图例组件离容器下侧的距离
          selectedMode: false
        },
        dataZoom: [
          {
            type: 'slider', //滑动条组件
            filterMode: 'weakFilter', //运行原理
            showDataShadow: false, //组件中显示走势阴影
            // top:10,//距底部距离
            height: 5, //组件高度
            start: 0,
            end: 100,
            borderColor: 'transparent', //边框颜色
            backgroundColor: '#233551',
            fillerColor: 'rgba(64, 121, 207, 0.3)',
            handleIcon:
              'M10.7,11.9v-1.3H9.3v1.3c-4.9,0.3-8.8,4.4-8.8,9.4c0,5,3.9,9.1,8.8,9.4v1.3h1.3v-1.3c4.9-0.3,8.8-4.4,8.8-9.4C19.5,16.3,15.6,12.2,10.7,11.9z M13.3,24.4H6.7V23h6.6V24.4z M13.3,19.6H6.7v-1.4h6.6V19.6z',
            handleSize: 15, //手柄大小
            handleStyle: {
              //手柄样式
              color: '#529EFF',
              shadowColor: 'rgba(0,0,0,0.8)',
              shadowBlur: 3
            },
            labelFormatter: ''
            // labelFormatter: function (value) {  //拉动显示的数据
            //     return new Date(value);
            // },
            // textStyle: { //手柄字体样式
            //   color: "#ffffff",
            // },
          },
          {
            type: 'inside',
            filterMode: 'weakFilter'
          }
        ],
        grid: {
          height: 120,
          bottom: 70
        },
        xAxis: {
          type: 'time',
          scale: true,
          axisLabel: {
            color: 'rgba(159,201,255,1)', // x轴字体颜色
            formatter: function(val) {
              let date = new Date(val);
              let h = date.getHours();
              let m = date.getMinutes();
              let HHmm = (h < 10 ? '0' : '') + h + ':' + (m < 10 ? '0' : '') + m;
              return HHmm;
            }
          },
          axisLine: {
            show: false
            //lineStyle: { color: "rgba(159,201,255,1)" }, // x轴坐标轴颜色
          },
          splitArea: { show: false }, //去除网格区域
          splitLine: {
            //x轴网格线样式
            show: true,
            lineStyle: { color: ['#8796B0'], type: 'dotted' }
          }
        },
        yAxis: {
          axisLabel: { color: 'rgba(149,177,197,1)' }, //y轴字体颜色
          splitArea: { show: false }, //去除网格区域
          splitLine: { show: false }, //去除网格线
          axisLine: {
            show: false
            //lineStyle: { color: "rgba(149,177,197,1)" }, //y轴坐标轴颜色
          }
        },
        series: [
          {
            type: 'custom',
            renderItem: function(params, api) {
              var categoryIndex = api.value(0);
              var start = api.coord([api.value(1), categoryIndex]);
              var end = api.coord([api.value(2), categoryIndex]);
              var height = 8; //图形条的高度;api.size([0, 1])[1] * 0.3;
              let shape = echarts.graphic.clipRectByRect(
                {
                  x: start[0],
                  y: start[1] - height / 2,
                  width: end[0] - start[0],
                  height: height
                },
                {
                  x: params.coordSys.x,
                  y: params.coordSys.y,
                  width: params.coordSys.width,
                  height: params.coordSys.height
                }
              );
              return {
                type: 'rect',
                shape: { ...shape, r: 4 },
                style: api.style()
              };
            },
            itemStyle: {
              // normal: { //带图条透明度
              //     opacity: 0.8
              // }
            },
            encode: {
              x: [1, 2],
              y: 0
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
        if (Object.keys(this.option).length > 0) {
          this.myChart.setOption(deepObjectMerge(this.baseOption, this.option));
        }
        this.$nextTick(() => {
          this.myChart.resize();
        });
        this.listenerWindow();
      }
    },

    /**
     * 监听窗体变化重置图表大小
     */
    listenerWindow() {
      window.addEventListener('resize', () => {
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
