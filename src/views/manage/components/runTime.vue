<!--
 * @Description:泵组弹出层
 * @version:
 * @Author: liuct
 * @Date: 2021-08-16 15:01:58
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-12-02 15:03:26
-->

<template>
  <div class="pump-group-con">
    <div v-if="!!tips || chartData.length <= 0" class="tips">
      <w-empty :description="tips"></w-empty>
    </div>
    <div v-else class="data-body">
      <BarChart darkTheme="light" :option="chartOption"></BarChart>
    </div>
  </div>
</template>

<script>
import BarChart from '@/components/chart/BarChart.vue';
import { getRealDataByPointConfigCode } from '@/api/optimization';
export default {
  name: 'PumpGroup',
  components: { BarChart },
  props: {
    pumpId: {
      type: String,
      required: true
    },
    modleType: {
      type: String,
      required: true
    }
  },
  data() {
    return {
      chartOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: { type: 'cross', crossStyle: { color: '#999' } },
          formatter: params => {
            let html = '';
            params.forEach((item, i) => {
              let val =
                item.data !== null && typeof item.data === 'object' ? item.data.value : item.data;
              let unit = item.data !== null && typeof item.data === 'object' ? item.data.unit : '';
              if (i === 0) {
                html += `<span>${
                  item.name
                }</span><p style="margin-bottom: 8px"><span style="display:inline-block;vertical-align: middle;margin-right:4px;border-radius:6px;width:10px;height:10px;background-color:${
                  item.color
                };"></span>${item.name} ：${val ? val : '--'}${unit}</p>`;
              } else {
                html += `<p style="margin-bottom: 8px"><span style="display:inline-block;vertical-align: middle;margin-right:4px;border-radius:6px;width:10px;height:10px;background-color:${
                  item.color
                };"></span>${item.name} ：${val ? val : '--'}${unit}</p>`;
              }
            });
            return html;
          }
        },
        grid: {
          left: '3%',
          right: '4%',
          bottom: '3%',
          containLabel: true
        },
        xAxis: [
          {
            name: 'h',
            nameTextStyle: {
              fontSize: 14
            },
            axisLabel: {
              fontSize: 14
            },
            type: 'value',
            splitLine: {
              show: false
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            }
          }
        ],
        yAxis: [
          {
            type: 'category',
            splitLine: {
              show: false
            },
            axisLabel: {
              fontSize: 14
            },
            axisTick: {
              show: false
            },
            axisLine: {
              show: false
            },
            data: []
          }
        ],
        series: [
          {
            name: '',
            type: 'bar',
            barWidth: 12,
            barGap: '30%',
            itemStyle: {
              color: '#5B8FF9'
            },
            data: []
          }
        ]
      },
      tips: '请选择污水厂！',
      chartData: []
    };
  },
  watch: {
    pumpId: {
      handler(newValue) {
        if (newValue) this.getRealDataByPoint();
      }
    },
    modleType: {
      handler() {
        this.getRealDataByPoint();
      }
    }
  },
  methods: {
    getRealDataByPoint() {
      this.chartData = [];
      let params = {
        configcode: `${this.modleType}_runtime`,
        pumpHouseId: this.pumpId
      };
      getRealDataByPointConfigCode(params).then(res => {
        let { resultData, status } = res;
        if (status === 'complete') {
          this.tips = '';
          this.chartData = resultData;
          this.chartOption.yAxis[0].data = resultData.map(item => item.pointMemo);
          this.chartOption.series[0].data = resultData.map(item => item.pointValue);
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.pump-group-con {
  width: 100%;
  height: calc(100% - 50px);
  position: relative;

  .tips {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .data-body {
    height: 100%;
    overflow: hidden;
    display: flex;
  }
}
</style>
