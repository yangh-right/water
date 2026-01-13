<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-31 15:42:04
 * @Description:
-->
<template>
  <div class="content">
    <radar-Chart
      :lightTheme="'light'"
      :chartId="chartId"
      :option="baseOption"
      @myChartClick="myChartClick"
    ></radar-Chart>
  </div>
</template>
<script>
import { getAbilityByUser } from '@/api/cockpit';
import RadarChart from '@/components/chart/RadarChart1';
const colorArr = ['#558cf8', '#60daae']; //颜色
export default {
  name: 'AdministrativeCockpit',
  components: {
    RadarChart
  },
  mixins: [],
  data() {
    return {
      baseOption: {
        color: colorArr,
        grid: [
          {
            top: 50
          }
        ],
        radar: {
          // shape: 'circle',
          name: {
            textStyle: {
              color: '#666',
              fontSize: 14
            }
          },
          indicator: [],
          splitArea: {
            // 坐标轴在 grid 区域中的分隔区域，默认不显示。
            show: true,
            areaStyle: {
              // 分隔区域的样式设置。
              color: ['rgba(255,255,255,0)', 'rgba(255,255,255,0)'] // 分隔区域颜色。分隔区域会按数组中颜色的顺序依次循环设置颜色。默认是一个深浅的间隔色。
            }
          },
          label: {
            show: true,
            color: 'red'
          },
          axisLine: {
            //指向外圈文本的分隔线样式
            lineStyle: {
              color: '#fafbfb'
            }
          },
          splitLine: {
            lineStyle: {
              color: '#d6dce2', // 分隔线颜色
              width: 1 // 分隔线线宽
            }
          }
        },
        series: [
          {
            name: '胜任力分析',
            type: 'radar',
            symbolSize: 4,
            data: []
          }
        ]
      }
    };
  },
  computed: {
    chartId() {
      return 'chart' + Date.now() + Math.random() * 9999;
    }
  },
  props: {
    userId: {
      default: '',
      type: String
    }
  },
  watch: {
    userId: {
      handler(val) {
        if (val) {
          this.getData();
        }
      },
      immediate: true
    }
  },
  activated() {},
  methods: {
    async getData() {
      let { resultData, status } = await getAbilityByUser(this.userId);
      if (status === 'complete') {
        let data = [];
        this.indicator =
          resultData.map(item => {
            data.push(item.score);
            return {
              text: item.dimensionName,
              max: 100
            };
          }) || [];
        this.baseOption.radar.indicator = this.indicator;
        this.baseOption.series[0].data = [
          {
            value: data,
            itemStyle: {
              normal: {
                lineStyle: {
                  color: '#558cf8'
                },
                shadowColor: '#558cf8',
                shadowBlur: 10
              }
            },
            areaStyle: {
              normal: {
                // 单项区域填充样式
                color: {
                  type: 'linear',
                  x: 0, //右
                  y: 0, //下
                  x2: 1, //左
                  y2: 1, //上
                  colorStops: [
                    {
                      offset: 0,
                      color: '#558cf8'
                    },
                    {
                      offset: 0.5,
                      color: 'rgba(0,0,0,0)'
                    },
                    {
                      offset: 1,
                      color: '#558cf8'
                    }
                  ],
                  globalCoord: false
                },
                opacity: 1 // 区域透明度
              }
            }
          }
        ];
      }
    },
    myChartClick(param) {
      this.drillDown({
        path: '/examineeAnalysis'
      });
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  width: 100%;
  height: calc(100% - 24px);
}
</style>
