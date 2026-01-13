<!-- 环形饼图 -->
<template>
  <ModelCard :title="titleName" :loading="loading" :empty="empty">
    <template #button>
      <p class="title-decs wfc3" v-if="information">
        共
        <span v-if="information.consumeUnit">
          {{ information.consume | changeData }} {{ information.consumeUnit }}
        </span>
        <span v-if="information.amountUnit">
          {{ information.amount | changeData }}{{ information.amountUnit }}
        </span>
      </p>
    </template>
    <template #content>
      <w-line
        :data="chartData"
        :themeName="themeObj.theme"
        :settings="settings"
        :extend="extend"
        :events="{ click: onEchartsClick }"
        height="100%"
        width="100%"
      ></w-line>
    </template>
  </ModelCard>
</template>

<script>
import ModelCard from './model-card';
import Mixin from './mixin';
import moment from 'moment';

export default {
  name: 'LineCard',
  inject: ['waterPlantIdObj', 'themeObj'],
  mixins: [Mixin],
  data() {
    return {
      loading: false,
      titleName: '',
      chartData: {
        columns: ['时间'],
        rows: []
      },
      settings: {},
      extend: {
        color: ['#5390f5', '#66dbdc', '#bdf252'],
        xAxis: {
          axisLabel: { rotate: -40, interval: 1, margin: 10 },
          axisTick: {
            show: false
          },
          boundaryGap: false
        },
        legend: {
          bottom: 5,
          itemWidth: 16,
          itemHeight: 2,
          icon: 'rect'
        },
        grid: { top: 20, bottom: 60, left: 40, right: 10 }
      },
      information: undefined
    };
  },
  props: { firstCostType: Object, secondaryCostId: String },
  components: { ModelCard },
  computed: {
    empty() {
      return Boolean(this.chartData.rows.length);
    }
  },
  filters: {
    changeData(val) {
      return val === null ? '--' : val;
    }
  },

  watch: {
    secondaryCostId: {
      deep: true,
      handler() {
        this.getList();
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
    async getList() {
      if (!this.secondaryCostId) return;
      this.loading = true;
      this.chartData = {
        columns: ['时间'],
        rows: []
      };
      try {
        let { resultData } = await this.$http.post(
          `/costAnalysis/getSmallTypeCostTrend?costTypeId=${this.firstCostType.id}&smallTypeId=${this.secondaryCostId}`,
          this.waterPlantIdObj
        );
        //处理标题
        this.titleName =
          this.firstCostType.name +
          '趋势' +
          `${resultData.unit ? '(' + resultData.unit + ')' : ''}`;
        //处理图例
        let timeColumns = this.changeDate(this.waterPlantIdObj);
        this.chartData.columns = this.chartData.columns.concat(timeColumns);
        //处理数据
        resultData.data.forEach(item => {
          this.chartData.rows.push({
            时间: moment(item.date).format(this.formData),
            [this.chartData.columns[1]]: item.now,
            [this.chartData.columns[2]]: item.lastMonth,
            [this.chartData.columns[3]]: item.lastYear
          });
        });
        //处理标题额外信息
        this.information = {
          consume: resultData.num,
          consumeUnit: resultData.unit,
          amount: resultData.cost,
          amountUnit: resultData.costUnit
        };
      } catch {
        this.chartData.rows = [];
        this.information = undefined;
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.title-decs {
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  font-size: 14px;
  letter-spacing: 0;
  margin-bottom: 0;
}
</style>
