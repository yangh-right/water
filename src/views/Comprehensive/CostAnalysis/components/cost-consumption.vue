<!--  -->
<template>
  <div class="cost-consumption-view wbgc-card">
    <div class="tab">
      <w-tabs v-model="defaultSecondaryCost" @change="onChange">
        <w-tab-pane v-for="item in secondaryCostList" :key="item.id" :tab="item.name" />
      </w-tabs>
    </div>
    <div class="content">
      <LineCard class="card" :firstCostType="firstCostType" v-on="$listeners" :secondaryCostId="defaultSecondaryCost" />
      <div class="card" v-loading="loading">
        <w-info-table v-if="showTable" :columns="columns" :data-source="dataList" :scroll="{ x: 360 }">
          <template #placeName="{ text, row }">
            <w-tooltip placement="topLeft">
              <template slot="title"> {{ text }}</template>
              <span @click="changeShowItem(false, row)" class="table-title">{{ text }}</span>
            </w-tooltip>
          </template>
          <template #lastYear="{ text, row }">
            <span :style="{ color: row.lastYearType === 1 ? 'red' : row.lastYearType === 2 ? 'green' : '' }">{{ text | symbolData }}</span>
          </template>
          <template #lastMonth="{ text, row }">
            <span :style="{ color: row.lastMonthType === 1 ? 'red' : row.lastMonthType === 2 ? 'green' : '' }">{{ text | symbolData }}</span>
          </template>
        </w-info-table>
        <DetailCard v-else @back="changeShowItem" v-on="$listeners" :rowData="rowData" />
      </div>
    </div>
  </div>
</template>

<script>
import LineCard from './line-card';
import DetailCard from './detail-card';
export default {
  name: 'CostConsumption',
  inject: ['waterPlantIdObj'],
  props: { secondaryCostList: Array, firstCostType: Object },
  data() {
    return {
      defaultSecondaryCost: '',
      columns: [
        {
          title: '成本点',
          ellipsis: true,
          dataIndex: 'placeName',
          width: 120
        },
        {
          title: '',
          dataIndex: 'now',
          sorter: (a, b) => {
            return a.now - b.now;
          },
          ellipsis: true,
          width: 120
        },
        {
          title: '同比',
          ellipsis: true,
          dataIndex: 'lastYear',
          width: 80,
          sorter: (a, b) => {
            return a.lastYear - b.lastYear;
          }
        },
        {
          title: '环比',
          ellipsis: true,
          dataIndex: 'lastMonth',
          width: 80,
          sorter: (a, b) => {
            return a.lastMonth - b.lastMonth;
          }
        }
      ],
      dataList: [],
      showTable: true,
      loading: false,
      rowData: {}, //获取当前所点击行的对象
      rowUnit: null
    };
  },
  filters: {
    symbolData(val) {
      if (val === null) return '--';
      else return val + '%';
    }
  },
  components: { LineCard, DetailCard },
  watch: {
    secondaryCostList: {
      deep: true,
      handler(val) {
        this.defaultSecondaryCost = val[0]?.id || '';
        this.onChange();
      }
    },
    waterPlantIdObj: {
      deep: true,
      handler() {
        this.getList();
      }
    }
  },

  methods: {
    onChange() {
      this.showTable = true;
      this.getList();
    },

    async getList() {
      //如果当前情况下表格不显示则不获取接口
      if (!this.showTable) return;
      if (!this.defaultSecondaryCost) return;
      this.loading = true;
      try {
        let { resultData } = await this.$http.post(`/costAnalysis/getPlaceRatioList?costTypeId=${this.firstCostType.id}&smallTypeId=${this.defaultSecondaryCost}`, this.waterPlantIdObj);
        //处理标题
        this.rowUnit = resultData.unit ? '(' + resultData.unit + ')' : '';
        this.columns[1].title = this.firstCostType.name + this.rowUnit;
        this.dataList = resultData.dataList;
      } catch {
        console.log('error');
        this.dataList = [];
      } finally {
        this.loading = false;
      }
    },
    //判断当前应该显示的内容
    changeShowItem(val, row) {
      this.showTable = val;
      if (val) this.getList();
      else this.rowData = { ...row, unit: this.rowUnit };
    }
  }
};
</script>
<style lang="less" scoped>
.cost-consumption-view {
  .tab {
    height: 40px;
    background: #f2f6fc;
    padding: 0 20px;
    margin-bottom: 10px;
    display: flex;
    align-items: center;
    /deep/.wpg-tabs-ink-bar {
      display: none !important;
    }
    /deep/.wpg-tabs-bar {
      margin: 0;
      border-bottom: 0;
    }
  }
  .content {
    display: flex;
    height: calc(100% - 50px);
    justify-content: space-between;
    .card {
      width: 50%;
      border-radius: 4px;
      box-shadow: 0 0 4px 0 rgba(114, 114, 114, 0);
      height: 100%;
      &:last-child {
        padding: 0 0 16px 16px;
      }
      /deep/.model-card-view {
        padding: 10px 16px 0 0;
      }
    }
    /deep/.model-card-view {
      box-shadow: 0 0 4px 0 rgba(114, 114, 114, 0);
      padding: 10px 16px 16px;
    }

    .table-title {
      color: #4285f4;
      cursor: pointer;
    }
  }
}

html[data-wpg-theme='green'] {
  .cost-consumption-view {
    .tab {
      background: #ddf3f0;
    }
  }
}
html[data-wpg-theme='red'] {
  .cost-consumption-view {
    .tab {
      background: #fcf3f2;
    }
  }
}

html[data-wpg-theme='dark'] {
  .cost-consumption-view {
    .tab {
      background: #181c24;
    }
  }
}
</style>
