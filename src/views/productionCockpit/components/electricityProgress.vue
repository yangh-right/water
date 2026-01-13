<template>
  <div class="chart-con">
    <line-chart :darkTheme="'light'" :option="options"></line-chart>
  </div>
</template>
<script>
import { themeMixin } from '@/core/mixins.ts';
export default {
  name: 'electricityProgress',
  components: {
    LineChart: () => import('@/components/chart/ProcessChart.vue')
  },
  mixins: [themeMixin],
  props: {
    axis: {
      type: Object,
      required: true,
      default() {
        return {
          unit: '',
          max: 0,
          data: [],
          colors: []
        };
      }
    }
  },
  computed: {
    options() {
      return {
        tooltip: {
          trigger: 'none'
        },
         grid: [
          {
            left: '3%',
            right: '3%',
            bottom: '0%',
            top: '0%',
            containLabel: true
          }
        ],
        xAxis: [{
          axisLine: {
            show: false
          },
          axisLabel: {
            show: false
          },
          axisTick: {
            show: false
          },
          splitLine: {
            show: false
          }
        }],
        yAxis: [
          {
            inverse: true,
            axisLine: {
              show: false
            },
            axisLabel: {
              show: false,
            },
            axisTick: {
              show: false
            },
            splitLine: {
              show: false
            },
            data: this.axis.data.map(d => {
              return d.name;
            })
          }
        ],
        series: [
          {
            type: 'bar', //柱状图实现电量进度渐变效果
            barWidth: 16,
            legendHoverLink: false,
            symbolRepeat: true,
            silent: true,
            label: {
              normal: {
                show: false,
              }
            },
            itemStyle: {
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 1,
                y2: 0,
                colorStops: [
                  {
                    offset: 0,
                    color: this.axis.colors[0] // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: this.axis.colors[1] // 100% 处的颜色
                  }
                ]
              }
            },
            animationEasing: 'elasticOut',
            data: this.axis.data,
            z: 1
          },
          {
            //象形柱图--背景，“满电”效果
            type: 'pictorialBar',
            symbol: 'rect',
            symbolMargin: '4',
            symbolSize: [8, 16],
            symbolRepeat: 'fixed',
            label: {
              show: false,
            },
            itemStyle: {
              normal: {
                color: '#E7ECF0'
              }
            },
            animationEasing: 'elasticOut',
            data: [this.axis.max],
            z: 0
          },
          {
            //象形柱图--分隔
            type: 'pictorialBar',
            symbol: 'rect',
            symbolMargin: '4',
            symbolSize: [8, 16],
            symbolOffset: [-8, 0],
            symbolRepeat: 'fixed',
            symbolClip: true,
            symbolPosition: 'start',
            itemStyle: {
              color: this.theme === 'dark' ? '#202F34' : '#ffffff'},
            animationEasing: 'elasticOut',
            data: this.axis.data,
            z: 2
          }
        ]
      };
    }
  }
};
</script>
<style scoped lang="less">
.chart-con {
  height: 70px;
  width: 100%;
  position: absolute;
  top: -20px;
}
</style>
