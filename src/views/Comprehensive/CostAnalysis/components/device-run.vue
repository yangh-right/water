<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-22 10:19:21
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
      <div class="form">
        <div class="form-item">
          <w-month-picker v-model="dateOption" style="width: 100px" placeholder="选择月份" size="small" :allowClear="false"
            :disabledDate="disabledDate" @change="getPointList" />
        </div>
      </div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="device-wrap">
        <div class="chart-wrapper">
          <div v-if="dataEchart.length > 0" class="card-inner">
            <div class="echart-block">
              <line-chart :darkTheme="'light'" :option="deviceOption" ref="alarmChart"></line-chart>
            </div>
          </div>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </div>
    </w-spin>
    <div class="info-box">
      <!-- 饼图区域 -->
      <div class="echart-block">
        <pie-chart ref="chart" :defaultHighlight="false" :option="option">
        </pie-chart>
      </div>
    </div>
  </div>
</template>
<script>
import { getElectricalDataProportion } from '@/api/analysis.js';
export default {
  name: 'DeviceRun',
  props: {
    title: {
      type: String,
      default: ''
    },
    classificationType: {
      type: Number,
      default: 1
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue'),
    PieChart: () => import('@/components/chart/PieChart.vue'), // 异步加载饼图组件
  },
  data() {
    return {
      loading: false,
      dateOption: this.$moment(),
      colors: [
        '#2F7FFF',
        '#FF6781',
        '#28D6FE',
        '#FFA66D',
        '#2BDEAB',
        '#FFD739',
        '#A259F5',
        '#F9D54A',
        '#0171CE'
      ],
      deviceOption: {
        grid: [
          {
            left: '16px',
            right: '100px',
            top: '10%',
            bottom: '5px',
            containLabel: true
          }
        ],
        color: ['#4285F4'],
        legend: {
          show: false,
          top: 'bottom',
          icon: 'rect',
          itemHeight: 2,
          itemWidth: 12
        },
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            type: 'shadow'
          }
        },
        yAxis: [
          {
            type: 'category',
            data: [],
            name: 'kWh',
            nameLocation: 'end',
            nameGap: 15,
            nameTextStyle: {
              align: 'right'
            }
          }
        ],
        xAxis: [
          {
            splitLine: {
              show: true
            },
            type: 'value',
            name: '',
            nameLocation: 'end',
            nameTextStyle: {
              verticalAlign: 'top',
              lineHeight: 26,
              color: '#00000073'
            },
            axisLabel: {
              formatter: function (value) {
                if (value >= 10000) {
                  return (value / 10000) + '万';
                }
                return value;
              }
            }
          }
        ],
        series: [
          {
            barMaxWidth: 12,
            data: [],
            type: 'bar',
            distance: 5,
            label: {
              show: true,
              position: 'right',
              color: '#330',     // 标签颜色
              fontSize: 12
            }
          }
        ]
      },
      dataEchart: [],
      // 饼图配置
      option: {
        color: this.colors, // 直接在这里定义颜色，避免引用未定义的变量
        legend: {
          show: false
        },
        series: [
          {
            type: 'pie', // 饼图
            radius: ['50%', '80%'],
            roseType: false,
            avoidLabelOverlap: true,
            label: {
              show: true,
              ellipsis: true,
              formatter: '{b}\n{c} %', // 显示「名称: 数值 单位」
              fontSize: 12,
              color: '#333',
              width: 180,
              overflow: 'truncate', // 超出宽度时截断
              suffix: '...',
              lineHeight: 16
            },
            labelLine: {
              show: true, // 显示引导线
              length: 40, // 引导线第一段长度
              length2: 15, // 引导线第二段长度
              lineStyle: {
                color: '#ccc',
                width: 1 // 引导线宽度
              },
              smooth: true
            },
            padAngle: 2,
            data: []
          }
        ]
      }
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getPointList(val);
        }
      },
      immediate: true
    }
  },
  created() { },
  methods: {
    async getPointList() {
      this.loading = true;
      this.dataEchart = [];
      let param = {
        startTime: this.$moment(this.dateOption)
          .startOf('month')
          .format('YYYY-MM-DD HH:mm:ss'),
        endTime: this.$moment(this.dateOption)
          .endOf('month')
          .format('YYYY-MM-DD HH:mm:ss'),
        waterPlantId: this.waterPlantId,
        classificationType: this.classificationType
      };
      let { resultData, status } = await getElectricalDataProportion(param);
      this.loading = false;
      if (status === 'complete') {
        let yAxisData = [];
        let seriesData = [];
        let pieSeriesData = [];
        this.dataEchart = resultData;
        this.dataEchart.forEach(item => {
          yAxisData.push(item.typeName);
          seriesData.push(item.powerPv);
          pieSeriesData.push({
            name: item.typeName,
            value: item.ratio
          });
        });
        this.deviceOption.yAxis[0].data = yAxisData.reverse();
        this.deviceOption.series[0].data = seriesData.reverse();
        this.option.series[0].data = pieSeriesData.reverse();
      }
    },
    disabledDate(current) {
      return current && current > this.$moment().endOf('month');
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  height: 100%;
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;

  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }

  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }

  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .spin {
    height: calc(60% - 20px);

    .device-wrap {
      padding: 0px 6px 6px;
      width: 100%;
      height: 100%;
      display: flex;
      flex-wrap: wrap;
      position: relative;

      .chart-wrapper {
        width: 100%;
        height: 100%;

        .card-inner {
          width: 100%;
          height: 100%;
          padding: 0 12px 0 0;
          box-sizing: border-box;
          display: flex;
          flex-direction: column;
          align-items: center;

          .echart-block {
            height: 100%;
            width: 100%;
            text-align: center;
          }

          .points-list {
            height: 68px;
            width: 100%;
            display: flex;
            overflow-y: auto;
            flex-flow: wrap;
            align-items: center;
            justify-content: flex-start;

            .point-tab {
              width: calc(50% - 14px);
              height: 26px;
              margin-top: 8px;
              padding: 0 8px;
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-right: 28px;

              &:nth-child(2n) {
                margin-right: 0px;
              }

              .label {
                font-family: PingFangSC-Regular, sans-serif;
                font-weight: 400;
                font-size: 14px;
                color: var(--supply-color-secondary);
                letter-spacing: 0;

                .ico-react {
                  display: inline-block;
                  width: 10px;
                  height: 10px;
                  border-radius: 1.76px;
                  margin-right: 6px;
                }
              }

              .precent {
                font-weight: 400;
                font-size: 14px;
                color: var(--supply-color-main);
                letter-spacing: 0;
                text-align: right;
              }
            }
          }
        }
      }
    }
  }

  .empty {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .info-box {
    flex-direction: row;
    display: flex;
    justify-content: space-evenly;
    align-items: center;
    width: 100%;
    padding-top: 10px;
    height: calc(40% - 36px);

    .echart-block {
      width: 100%;
      height: calc(100% - 40px);
      text-align: center;
      background: url('~@/assets/safeCockpit/chart_bg.png') center center no-repeat;
      background-size: 65% 65%;

      .label-wrap {
        position: absolute;
      }
    }
  }

  /deep/ .wpg-select-selection--single {
    height: 32px;
  }

  /deep/ .wpg-spin-container {
    height: 100%;
  }

  /deep/ .wpg-select {
    width: 120px !important;
  }
}
</style>
