<!--
 * @Author: wangyr
 * @Date: 2022-10-09 08:38:36
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-03-16 16:52:19
 * @Description:
-->
<template>
  <div id="chartCon" class="chart-con">
    <div v-if="!!tips" class="empty-title">当前数据</div>
    <div v-if="!!tips" class="tips">
      <w-empty :description="tips"></w-empty>
    </div>
    <div v-else class="chart-body" :style="{ height: showToolBox ? 'calc(100% - 33px)' : '100%' }">
      <line-chart darkTheme="light" :option="option"></line-chart>
    </div>
  </div>
</template>

<script>
import { deepObjectMerge } from '@/utils/util'; // 引入工具类

const ColorMap = {
  dark: ['#4285F4'],
  green: ['#37c2ce'],
  red: ['#ce4c1c'],
  default: ['#4285F4']
};

export default {
  name: 'deviceTable',
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  props: {
    tips: {
      type: String,
      default: '请选择设备或者监测量！'
    },
    showToolBox: {
      type: Boolean,
      default: false
    },
    chartData: {
      type: Array,
      required: true
    }
  },
  data() {
    return {
      option: {
        title: {
          text: ''
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'cross',
            label: {
              backgroundColor: '#6a7985'
            }
          }
        },
        grid: [
          {
            left: '3%',
            right: '4%',
            bottom: '3%',
            containLabel: true
          }
        ],
        xAxis: [
          {
            type: 'category',
            boundaryGap: false,
            data: []
          }
        ],
        yAxis: [
          {
            type: 'value'
          }
        ],
        series: [
          {
            type: 'line',
            stack: 'Total',
            smooth: true,
            symbolSize: 4,
            showSymbol: true,
            emphasis: {
              focus: 'series'
            },
            data: []
          }
        ]
      }
    };
  },
  inject: ['state'],
  computed: {
    themeColor: {
      get() {
        return ColorMap[this.state.theme] || ColorMap['default'];
      },
      set() {}
    }
  },
  watch: {
    'state.theme': {
      handler(newValue) {
        this.themeColor = ColorMap[newValue] || ColorMap['default'];
      }
    },
    chartData: {
      immediate: true,
      deep: true,
      handler(val) {
        this.handleChartData(val);
      }
    }
  },
  methods: {
    handleChartData(data = []) {
      // 相同时间点去重
      let tempArr = this.uniqueArr(data);
      let tempObj = {
        title: {
          text: `当前数据`
        },
        legend: {
          left: '8%',
          top: '-0.5%'
        },
        xAxis: [
          {
            axisLabel: {
              interval: 'auto',
              rotate: 45,
              padding: [0, 8, 0, 0]
            },
            data: []
          }
        ],
        series: [
          {
            name: tempArr.length > 0 ? tempArr[0].pointMemo : '',
            lineStyle: {
              width: 1,
              type: 'dashed',
              color: this.themeColor[0]
            },
            areaStyle: {
              opacity: 0.5,
              color: {
                type: 'linear',
                x: 0,
                y: 0,
                x2: 0,
                y2: 1,
                colorStops: [
                  {
                    offset: 0,
                    color: this.colorRgb(this.themeColor[0], 0.7) // 0% 处的颜色
                  },
                  {
                    offset: 1,
                    color: this.colorRgb(this.themeColor[0], 0.1) // 100% 处的颜色
                  }
                ]
              }
            },
            data: []
          }
        ]
      };
      tempArr.forEach(item => {
        let time = this.$moment(item.timestamp).format('HH:mm:ss');
        tempObj.xAxis[0].data.push(time);
        tempObj.series[0].data.push(item.pointValue ?? '--');
      });

      this.option = deepObjectMerge(this.option, tempObj);
    },
    uniqueArr(tempArr) {
      let result = [];
      let obj = {};
      for (let i = 0; i < tempArr.length; i++) {
        if (!obj[tempArr[i].timestamp]) {
          result.push(tempArr[i]);
          obj[tempArr[i].timestamp] = true;
        }
      }
      return result;
    },
    colorRgb(str, opacity) {
      let sColor = str.toLowerCase();
      if (sColor) {
        if (sColor.length === 4) {
          let sColorNew = '#';
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
        }
        return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
      } else {
        return sColor;
      }
    }
  },
  mounted() {}
};
</script>

<style lang="less" scoped>
.chart-con {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: auto;
  .empty-title {
    padding: 0 12px;
    font-weight: 500;
    color: var(--supply-color-main);
  }
  .tips {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }

  .chart-body {
    width: 100%;
    height: 100%;
    border: 1px solid transparent;
    .bar-chart,
    .line-chart {
      width: 100%;
      height: 100%;
    }
    .line-chart {
      position: relative;
      .chart-block {
        position: relative;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        .chart {
          height: 100%;
        }
      }
      .table {
        position: absolute;
        width: 100%;
        height: 100%;
        top: 0;
        background: var(--supply-color-bg-card-DEFAULT);
      }
    }
  }
}
</style>
