<!--
 * @Author: 王永瑞 1637350822@qq.com
 * @Date: 2022-09-22 13:41:47
 * @LastEditors: wangyr
 * @LastEditTime: 2024-05-27 17:03:07
 * @FilePath: \supply-water\src\views\leakage\components\module.vue
 * @Description: 这是默认设置,请设置`customMade`, 打开koroFileHeader查看配置 进行设置: https://github.com/OBKoro1/koro1FileHeader/wiki/%E9%85%8D%E7%BD%AE
-->
<template>
  <div class="sub-content">
    <chart class="sub-chart" :option="lineOption" />
    <predict-table
      class="sub-tbl"
      :result="{ records: wpHourList }"
      :columns="columns"
      :tabKey="tabKey"
      :loading="loading"
    />
  </div>
</template>

<script>
import { minFlowCloumn, useWaterCloumn } from './data.js';

import chart from './chart';
import predictTable from './predictTable';

const _custom = {
  // 图表基础配置
  getSeries(type, key) {
    return {
      line: [
        {
          name: key === 'minFlowKey' ? '夜间预测最小流量' : '预测进水量',
          col: 'predictValue',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            width: 1,
            type: 'dashed',
            color: '#5790FB'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(87,144,251,.7)' // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: 'rgba(87,144,251,.1)' // 100% 处的颜色
                }
              ],
              global: false
            }
          }
        },
        {
          name: key === 'minFlowKey' ? '夜间实际最小流量' : '实际进水量',
          col: 'actualValue',
          type: 'line',
          showSymbol: false,
          lineStyle: {
            width: 1,
            color: '#A86DFB'
          },
          areaStyle: {
            color: {
              type: 'linear',
              x: 0,
              y: 0,
              x2: 0,
              y2: 1,
              colorStops: [
                {
                  offset: 0,
                  color: 'rgba(155,146,243,.7)' // 0% 处的颜色
                },
                {
                  offset: 1,
                  color: 'rgba(155,146,243,.1)' // 100% 处的颜色
                }
              ],
              global: false
            }
          }
        }
      ]
    }[type];
  },
  getBaseOpt(xAxisData, series, key, interval = 'auto') {
    // 基础的图表配置
    return {
      dataZoom: [{ show: false }],
      toolbox: { show: false },
      grid: { top: 30, bottom: 16, left: 54 },
      legend: {
        type: 'scroll',
        top: 0,
        right: 0,
        icon: 'rect',
        itemWidth: 8,
        itemHeight: 8,
        padding: [5, 20, 6, 0],
        itemGap: 20,
        data: series.map(v => v.name)
      },
      series,
      xAxis: [
        {
          data: xAxisData,
          type: 'category',
          axisLabel: {
            interval,
            width: 120,
            overflow: 'truncate'
          }
        }
      ],
      yAxis: [{ name: key === 'minFlowKey' ? '夜间最小流量（m³）' : '进水量（m³）', type: 'value' }]
    };
  }
};
export default {
  name: 'module',
  components: {
    chart,
    predictTable
  },
  props: {
    tabKey: {
      type: String,
      required: true
    },
    tableData: {
      type: Array,
      required: true
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      columns: [],
      wpHourList: [], // 单站点每小时预测数据
      lineOption: null
    };
  },
  computed: {},
  watch: {
    tableData: {
      immediate: true,
      deep: true,
      handler(val) {
        this.columns = this.tabKey === 'minFlowKey' ? minFlowCloumn : useWaterCloumn;
        this.getWPListByDateSta(val);
      }
    }
  },
  methods: {
    async getWPListByDateSta(data) {
      this.wpHourList = [...data];
      let xAxisData = this.wpHourList.map(val => val.dateTime);
      let _series = this.genChartOption('line', this.wpHourList);
      this.lineOption = _custom.getBaseOpt(xAxisData, _series, this.tabKey);
    },
    // 转换图表数据
    genChartOption(type, record) {
      if (!type || !record) return [];
      let isNull = 0;
      let data = _custom.getSeries(type, this.tabKey).map(v => {
        v.data = record.map(val => (val[v.col] === null ? '--' : val[v.col])) || [];
        if (!v.data.length) isNull++;
        return v;
      });
      return data.length === isNull ? [] : data;
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.sub-content {
  width: 100%;
  height: 100%;
  background-color: var(--supply-color-bg-card-DEFAULT);

  .sub-chart {
    width: 100%;
    height: 50%;
  }
  .sub-tbl {
    width: 100%;
    height: 50%;
  }
}
</style>
