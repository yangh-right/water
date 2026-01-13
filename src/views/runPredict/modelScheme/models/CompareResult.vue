<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-07-28 18:58:21
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-23 11:17:04
 * @Description: 
-->
<template>
  <div class="box">
    <div v-if="!isEmpty" class="chart-wrapper">
      <w-table
        :pagination="false"
        class="compare-table"
        :data-source="dataList"
        :columns="columns"
        :scroll="{ y: scrollY, x: columns.length * 160 }"
      >
      </w-table>
    </div>
    <w-empty v-else description="暂无数据" />
  </div>
</template>

<script>
const ThemeColor = {
  red: 'rgb(206, 76, 28)',
  green: 'rgb(0, 133, 131)',
  default: '#4285F4'
};
export default {
  inject: ['state'],
  props: {
    schemeMap: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      columns: [],
      dataList: [],
      isEmpty: true
    };
  },
  computed: {
    scrollY() {
      return this.dataList.length < 5 ? this.dataList.length * 37 + 10 : 5 * 37 + 10;
    }
  },
  mounted() {
    this.setOption();
  },
  methods: {
    setOption() {
      let pointMap = {};
      this.columns = [
        {
          dataIndex: 'point',
          title: '监测量',
          width: 194
        }
      ];
      Object.values(this.schemeMap).forEach(scheme => {
        this.columns.push({
          dataIndex: scheme.solutionId,
          title: scheme.solutionName
        });
        if (scheme.compareData) {
          Object.keys(scheme.compareData).forEach(pointKey => {
            if (!pointMap[pointKey]) pointMap[pointKey] = { yData: [], key: pointKey };
            pointMap[pointKey].yData.push({
              name: scheme.solutionName,
              solutionId: scheme.solutionId,
              totalVal: scheme.compareData[pointKey].totalSubtract
            });
          });
        }
      });
      this.columns.push({
        dataIndex: 'bestSchemeName',
        title: '最优方案',
        width: 160,
        fixed: 'right'
      });
      this.dataList = Object.values(pointMap).map(point => {
        let data = {
          point: point.key,
          bestSchemeName: this.getBestSchemeName(point.yData)
        };
        point.yData?.forEach(item => {
          data[item.solutionId] = item.totalVal;
        });
        return data;
      });
      if (this.dataList.length) {
        this.isEmpty = false;
      } else {
        this.isEmpty = true;
      }
    },
    getBestSchemeName(list) {
      let minVal = '';
      let minScheme = {};
      list?.forEach(item => {
        if (item.totalVal !== '' && item.totalVal != null) {
          if (item.totalVal !== '') {
            minVal = Number(item.totalVal);
            minScheme = item;
          }
          if (Number(minVal) > Number(item.totalVal)) {
            minVal = Number(item.totalVal);
            minScheme = item;
          }
        }
      });
      if (minVal !== '') {
        return minScheme.name;
      } else {
        return '';
      }
    }
  }
};
</script>
<style lang="less" scoped>
.compare-table {
  /deep/ .wpg-table-tbody > .wpg-table-row.even {
    background-color: unset;
  }
  /deep/ .wpg-table-row {
    > td {
      border-bottom: 1px solid var(--supply-color-border-split);
    }
  }
  /deep/ .header-row {
    > th {
      color: var(--supply-color-main);
      font-weight: 500;
      white-space: wrap;
      font-size: 16px;
    }
  }
}
.box {
  width: 100%;
  height: 100%;
  position: relative;
  .top {
    display: flex;
    justify-content: space-between;
    &__left {
      flex: 1;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .result {
      width: 100%;
      color: rgb(247, 25, 25);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 15px;
    }
  }
  .chart-wrapper {
    min-height: 144px;
  }
}
</style>
