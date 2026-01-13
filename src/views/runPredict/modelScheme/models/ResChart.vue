<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-15 20:28:10
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-24 10:05:13
 * @Description: 
-->
<template>
  <div class="chart-content">
    <slot></slot>
    <div class="chart-wrap">
      <template v-if="chartList.length">
        <div class="right-item" v-for="(item, index) in chartList" :key="item.title">
          <chart-item
            :key="item.title"
            :initOption="item.initOption"
            :config="item"
            class="chart-wrapper"
          ></chart-item>
        </div>
      </template>
      <w-empty class="predict-empty" v-else></w-empty>
    </div>
  </div>
</template>

<script>
import chartItem from './chartItem.vue';
import cloneDeep from 'lodash.clonedeep';

export default {
  name: 'SchemeChart',
  props: {
    schemeList: {
      type: Array,
      default: () => []
    },
    showType: {
      type: String,
      default: '0'
    },
    isCompare: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      chartList: []
    };
  },

  components: { chartItem },

  computed: {
    filterData() {
      return this.isDiff ? this.data.filter(item => item.isDiff) : this.data;
    }
  },
  watch: {
    schemeList: {
      handler(val) {
        this.handleCompareChartList(val);
      }
    }
  },

  mounted() {},

  methods: {
    handleCompareChartList(list) {
      if (!this.isCompare) {
        this.chartList = list[0].chartList;
        return;
      }
      let chartMap = {};
      list.forEach(item => {
        item.chartList.forEach(chart => {
          if (chartMap[chart.title]) {
            chartMap[chart.title].data.push(chart);
          } else {
            chartMap[chart.title] = { type: chart.type, data: [chart] };
          }
        });
      });
      let optionList = [];
      Object.values(chartMap).forEach(item => {
        const chartList = item.data;
        if (item.type === '0') {
          let chartObj = {
            ...chartList[0],
            seriesConfig: [],
            axisLabel: chartList[0].axisLabel,
            data: [],
            legend: [],
            title: chartList[0].title
          };
          chartList.forEach((chart, i) => {
            chartObj.data = chartObj.data.concat(chart.data);
            if (chart.legendSuffix) {
              chartObj.legend = chartObj.legend.concat(
                chart.legendSuffix.map(item => (item ? chart.solutionName + '-' + item : ''))
              );
            } else {
              chartObj.legend.push(chart.solutionName);
            }
            chartObj.seriesConfig = chartObj.seriesConfig.concat(
              chart.seriesConfig || new Array(chart.data).fill({})
            );
          });
          optionList.push(chartObj);
        } else {
          chartList.sort(this.sortBy('time', 1));
          let totalLen = 0;
          let xList = [];
          chartList.forEach((item, i) => {
            totalLen += item.len;
            if (!item.beforeLen) {
              item.beforeLen = 0;
            }
            xList = xList.concat(item.data[0].xList);
            if (chartList[i + 1]) {
              chartList[i + 1].beforeLen = item.beforeLen + item.len;
            }
          });
          let chartObj = {
            ...chartList[0],
            seriesConfig: [],
            axisLabel: chartList[0].axisLabel,
            data: [],
            legend: [],
            title: chartList[0].title
          };
          chartList.forEach((chart, i) => {
            let data = {
              xList,
              yList: new Array(chart.beforeLen)
                .fill(null)
                .concat(
                  chart.data[0].yList,
                  new Array(totalLen - chart.len - chart.beforeLen).fill(null)
                )
            };
            chartObj.data.push(data);
            chartObj.legend.push(chart.solutionName);
            chartObj.seriesConfig.push(chart.seriesConfig?.[0] || {});
          });
          optionList.push(chartObj);
        }
      });
      this.chartList = optionList;
    },
    sortBy(attr, rev) {
      if (rev == undefined) {
        rev = 1;
      } else {
        rev = -1;
      }
      return function(a, b) {
        a = a[attr];
        b = b[attr];
        if (a.isBefore(b)) {
          return rev * -1;
        } else {
          return rev * 1;
        }
      };
    }
  }
};
</script>
<style lang="less" scoped>
.chart-content {
  .search {
    padding: 0 0 8px 12px;
    &__select {
      min-width: 100px;
      /deep/ .wpg-select-selection--single {
        height: 36px;
      }
    }
  }
  .chart-wrap {
    height: 302px;
    display: flex;
    flex-wrap: wrap;
    overflow: auto;
  }
  .predict-empty {
    flex-direction: column;
    align-items: center;
    justify-content: center;
    top: -30px;
    display: flex;
    position: relative;
    width: 100%;
    height: 100%;
  }
  .right-item {
    padding: 0 0 0 12px;
    width: calc(100% / 3);
    height: 302px;
    .chart-wrapper {
      padding: 0;
      border-radius: 4px;
    }
  }
}
</style>
