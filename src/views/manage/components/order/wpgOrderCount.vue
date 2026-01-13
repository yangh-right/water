<template>
  <div class="count-wrapper">
    <div class="count-top">
      <div class="count-top-item">
        <div class="count-top-num" @click="search('ticketStatus', '')">
          {{ orderData.totalCount || 0 }}
        </div>
        <div class="count-top-title supply-text-main">工单总数</div>
      </div>
      <!-- {{ orderStatusList }} -->
      <div v-for="item in orderStatusList" :key="item.code" class="count-top-item">
        <div
          class="count-top-num"
          :style="`color: ${mapping[item.code].color}`"
          @click="search('ticketStatus', item.code)"
        >
          {{ orderData[`${mapping[item.code].code}`] || 0 }}
        </div>
        <div class="count-top-title supply-text-main">{{ item.name }}</div>
      </div>
    </div>
    <div class="count-chart-wrapper">
      <div class="chart-title">
        <img src="@/assets/images/default/order/file-text-line.png" alt="" />
        各组织工单情况
      </div>
      <bar-chart
        v-if="option1 && orderData.orgCount && orderData.orgCount.length"
        class="count-echarts"
        :darkTheme="'light'"
        :option="option1"
        @callBack="orgChartClick"
      ></bar-chart>
      <w-empty v-else></w-empty>
    </div>
    <div class="count-chart-wrapper">
      <div class="chart-title">
        <img src="@/assets/images/default/order/file-text-line.png" alt="" />
        各类型工单情况
      </div>
      <bar-chart
        v-if="option2 && orderData.typeCount && orderData.typeCount.length"
        class="count-echarts"
        :darkTheme="'light'"
        :option="option2"
        @callBack="typeChartClick"
      ></bar-chart>
      <w-empty v-else></w-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'OrderCount',
  components: {
    BarChart: () => import('@/components/chart/BarChart')
  },
  props: {
    orderData: {
      type: Object
    },
    smallType: {
      type: Array
    },
    orgTree: {
      type: Array
    },
    orderStatusList: {
      type: Array
    }
  },
  data() {
    return {
      option1: {},
      option2: {},
      mapping: {
        1: {
          color: '#4EA6FF',
          code: 'progressCount'
        },
        2: {
          color: '#1faaad',
          code: 'completeCount'
        },
        3: {
          color: '#ff922b',
          code: 'hangUp'
        },
        99: {
          color: '#ccc',
          code: 'voidCount'
        },
        '-1': {
          color: '#ccc',
          code: 'voidCount'
        }
      }
    };
  },
  watch: {
    orderData: {
      deep: true,
      handler() {
        let list1 = this.orderData.orgCount;
        let xData1 = [];
        let list2 = this.orderData.typeCount;
        let xData2 = [];
        const series = [];
        const series1 = [];

        this.orderStatusList.forEach((status, index) => {
          const data = [];
          const data1 = [];
          list1?.forEach(item => {
            if (index === 0) {
              const arr = [];
              let ids = [];
              try {
                ids = JSON.parse(item.name);
              } catch (error) {
                ids = [item.name];
              }
              this.recursion(this.orgTree, ids, arr);
              xData1.push(arr.join());
            }
            data.push(item[`${this.mapping[status.code].code}`]);
          });

          list2?.forEach(item => {
            this.smallType.forEach(t => {
              if (t.code === item.name) {
                item.name = t.name;
                item.code = t.code;
              }
            });

            if (index === 0) {
              xData2.push(item.name);
            }
            data1.push(item[`${this.mapping[status.code].code}`]);
          });

          series.push({
            name: status.name,
            type: 'bar',
            stack: 'total',
            barWidth: 8,
            data: data
          });
          series1.push({
            name: status.name,
            type: 'bar',
            stack: 'total',
            barWidth: 8,
            data: data1
          });
        });
        this.option1 = {
          tooltip: {
            trigger: 'axis'
          },
          grid: [
            {
              top: 10,
              containLabel: false,
              left: 90,
              bottom: 40
            }
          ],
          legend: {
            bottom: '0',
            left: 'center',
            icon: 'rect',
            itemWidth: 8,
            itemHeight: 8
          },
          calculable: true,
          xAxis: [
            {
              type: 'value',
              minInterval: 1,
              axisLabel: {
                fontSize: '14',
                color: '#969999'
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              }
            }
          ],
          color: ['#4EA6FF', '#37C2CE'],
          yAxis: [
            {
              type: 'category',
              data: xData1,
              splitLine: false,
              axisLabel: {
                fontSize: '12',
                color: '#646666',
                width: 80,
                overflow: 'truncate'
              }
            }
          ],
          series: series
        };

        this.option2 = {
          tooltip: {
            trigger: 'axis'
          },
          grid: [
            {
              top: 0,
              bottom: 40
            }
          ],
          legend: {
            bottom: '0',
            left: 'center',
            icon: 'rect',
            itemWidth: 8,
            itemHeight: 8
          },
          calculable: true,
          xAxis: [
            {
              type: 'value',
              minInterval: 1,
              axisLabel: {
                fontSize: '14',
                color: '#969999'
              },
              axisLine: {
                show: false
              },
              axisTick: {
                show: false
              }
            }
          ],
          color: ['#4EA6FF', '#37C2CE'],
          yAxis: [
            {
              type: 'category',
              data: xData2,
              splitLine: false,
              axisLabel: {
                fontSize: '12',
                color: '#646666'
                // interval: 0
              }
            }
          ],
          series: series1
        };
      },
      immediate: true
    }
  },
  methods: {
    recursion(data, ids, arr) {
      data.forEach(item => {
        if (ids?.includes(item.key)) {
          arr.push(item.title);
        } else if (item.children?.length > 0) {
          this.recursion(item.children, ids, arr);
        }
      });
    },
    // 点击与左侧table联动
    search(filterType, filterVal) {
      this.$emit('searchTable', filterType, filterVal);
    },
    orgChartClick(params) {
      const orgIds = this.orderData.orgCount[params.dataIndex].name.replace(/\[|]|\"/g, '');
      this.$emit('searchTable', 'orgIds', [orgIds]);
    },
    typeChartClick(params) {
      this.$emit('searchTable', 'smallType', this.orderData.typeCount[params.dataIndex].code);
    }
  }
};
</script>

<style lang="less" scoped>
.count-wrapper {
  width: 100%;
  height: 100%;
  padding: 16px;
  .count-top {
    display: flex;
    align-items: center;
    justify-content: space-between;
    .count-top-item {
      width: 71px;
      text-align: center;
      .count-top-num {
        padding-top: 3px;
        padding-bottom: 9px;
        font-size: 20px;
        font-weight: 600;
        cursor: pointer;
        color: var(--supply-color-title);
      }
      .count-top-title {
        font-size: 12px;
        color: var(--supply-color-main);
      }
    }
  }
  .count-chart-wrapper {
    margin-top: 24px;
    margin-bottom: 6px;
    .chart-title {
      display: flex;
      align-items: center;
      font-size: 16px;
      // color: #323333;
      color: var(--supply-color-main);
      img {
        width: 16px;
        margin-right: 6px;
      }
    }
    .count-echarts {
      width: 100%;
      height: 200px;
      margin-top: 8px;
    }
  }
}
</style>
