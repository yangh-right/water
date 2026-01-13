<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-31 14:44:22
 * @Description:
-->
<template>
  <div :class="['content', themeConfig.className]">
    <div class="content-top">
      <img src="@/assets/administrativeCockpit/total.png" alt="" />
      <div class="text">
        零星工程数量总计：<span class="value">{{ total }}项</span>
      </div>
    </div>
    <bar-chart
      class="chart"
      :darkTheme="'light'"
      :option="barOption"
      @callBack="myChartClick"
      ref="inChart"
    ></bar-chart>
  </div>
</template>
<script>
import { themeMixin } from '@/core/mixins.ts';
import { typeStageCount } from '@/api/cockpit';
export default {
  name: 'AdministrativeCockpit',
  components: {
    BarChart: () => import('@/components/chart/BarChart.vue')
  },
  mixins: [themeMixin],
  data() {
    return {
      total: 0,
      themeConfigMap: {
        default: {
          color: '#333',
          subColor: '#666',
          className: 'card-default'
        },
        dark: {
          color: '#fff',
          subColor: '#ADB5BD',
          className: 'card-dark'
        }
      },
      barOption: {
        tooltip: {
          trigger: 'axis',
          axisPointer: {
            // Use axis to trigger tooltip
            type: 'shadow' // 'shadow' as default; can also be 'line' or 'shadow'
          }
        },
        color: ['#0375ff', '#28a8f3', '#00cc9d'],
        legend: {
          top: 'bottom',
          itemWidth: 10,
          itemHeight: 10,
          itemGap: 20
        },
        grid: [
          {
            left: '2%',
            top: '0px',
            right: '2%',
            bottom: '20px',
            containLabel: true
          }
        ],
        xAxis: [
          {
            type: 'value',
            axisLine: { show: false },
            axisTick: { show: false },
            splitLine: { show: true },
            axisLabel: { color: '#999' }
          }
        ],
        yAxis: [
          {
            type: 'category',
            axisLine: { show: true, lineStyle: { color: '#ebedf0' } },
            axisTick: { show: false },
            data: []
          }
        ],
        series: [
          {
            name: '合同阶段',
            type: 'bar',
            stack: 'total',
            barWidth: '10',
            label: {
              // show: true
            },
            emphasis: {
              focus: 'series'
            },
            data: []
          },
          {
            name: '施工阶段',
            type: 'bar',
            stack: 'total',
            barWidth: '10',
            label: {
              // show: true
            },
            emphasis: {
              focus: 'series'
            },
            data: []
          },
          {
            name: '验收阶段',
            type: 'bar',
            stack: 'total',
            barWidth: '10',
            label: {
              // show: true
            },
            emphasis: {
              focus: 'series'
            },
            data: []
          }
        ]
      }
    };
  },
  computed: {},
  activated() {},
  created() {
    this.getData();
  },
  methods: {
    async getData() {
      let res = await typeStageCount();
      let { status, resultData } = res;
      if (status === 'complete') {
        let arr1 = [];
        let arr2 = [];
        let arr3 = [];
        this.total = 0;
        resultData.forEach(item => {
          this.barOption.yAxis[0].data.push(item.key);
          arr1.push(item.value[this.barOption.series[0].name] || 0);
          arr2.push(item.value[this.barOption.series[1].name] || 0);
          arr3.push(item.value[this.barOption.series[2].name] || 0);
        });
        this.barOption.series[0].data = arr1;
        this.barOption.series[1].data = arr2;
        this.barOption.series[2].data = arr3;
        this.total = arr1.reduce((pre, cur) => pre + cur, 0);
        this.total = arr2.reduce((pre, cur) => {
          return pre + cur;
        }, this.total);
        this.total = arr3.reduce((pre, cur) => {
          return pre + cur;
        }, this.total);
      }
    },
    myChartClick(param) {
      this.drillDown({
        path: '/engineering'
      });
    }
  }
};
</script>
<style lang="less" scoped>
.content {
  width: 100%;
  height: calc(100% - 28px);
  &.card-dark {
    .content-top {
      background: #212730;
    }
  }
  .content-top {
    display: flex;
    align-items: center;
    padding-left: 8px;
    margin: 6px 0;
    width: 100%;
    height: 36px;
    background: #f4f8fb;
    border-radius: 4px;
    img {
      width: 21px;
      height: 21px;
      margin-right: 8px;
    }
    .text {
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 13px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      .value {
        font-family: MiSans-Medium, sans-serif;
        font-weight: 600;
        font-size: 16px;
      }
    }
  }
  .chart {
    width: 100%;
    height: calc(100% - 48px);
  }
}
</style>
