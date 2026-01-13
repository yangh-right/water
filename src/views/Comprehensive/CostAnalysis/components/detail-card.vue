<!-- 柱状图 -->
<template>
  <ModelCard :loading="loading" :empty="empty">
    <template #title>
      <p @click="goBack" class="back wfc3"><w-icon type="ic_chevron_left"></w-icon></p
    ></template>
    <template #button>
      <span class="wfc3 decs">{{ detailTitle }} </span>
    </template>
    <template #content>
      <div class="tableStyle" v-if="waterPlantIdObj.dateType === 'date'">
        <w-info-table :columns="columns" :data-source="dataList" @linkClick="goToDetail" :scroll="{ x: 350 }"></w-info-table>
      </div>
      <w-histogram v-else :data="chartData" :extend="extend" :themeName="themeObj.theme" :events="{ click: onEchartsClick }" height="100%" width="100%"></w-histogram>
    </template>
  </ModelCard>
</template>

<script>
import ModelCard from './model-card';
import Mixin from './mixin';
import moment from 'moment';

export default {
  name: 'BarCard',
  inject: ['waterPlantIdObj', 'themeObj'],
  mixins: [Mixin],
  data() {
    return {
      chartData: {
        columns: ['时间'],
        rows: []
      },
      extend: {
        color: ['#5390f5', '#66dbdc', '#bdf252'],
        xAxis: {
          axisLabel: { rotate: -40, interval: 1 },
          axisTick: {
            show: false
          }
        },
        series: {
          stack: 'Ad'
        },
        legend: {
          bottom: 5,
          itemWidth: 8,
          itemHeight: 8,
          icon: 'rect'
        },
        grid: { top: 20, bottom: 55, left: 40, right: 10 }
      },
      dataList: [],
      loading: false,
      detailTitle: ''
    };
  },
  props: {
    rowData: Object
  },
  watch: {
    waterPlantIdObj: {
      deep: true,
      handler() {
        this.getList();
      }
    },
    rowData: {
      deep: true,
      immediate: true,
      handler(val) {
        this.detailTitle = val.placeName + val.unit;
        this.getList();
      }
    }
  },
  components: { ModelCard },

  computed: {
    columns() {
      if (this.rowData.firstCostName === '维修成本') {
        return [
          {
            title: '发生时间',
            ellipsis: true,
            dataIndex: 'name'
          },
          {
            title: '维修成本' + this.rowData.unit,
            ellipsis: true,
            dataIndex: 'type'
          },
          {
            title: '工单名称',
            ellipsis: true,
            dataIndex: 'endDate',
            type: 'link'
          }
        ];
      } else {
        return [
          {
            title: '发生时间',
            ellipsis: true,
            dataIndex: 'name'
          },
          {
            title: '成本消耗' + this.rowData.unit,
            ellipsis: true,
            dataIndex: 'type'
          },
          {
            title: '成本金额（元）',
            ellipsis: true,
            dataIndex: 'endDate'
          }
        ];
      }
    },
    empty() {
      return Boolean(this.chartData.rows.length);
    }
  },

  methods: {
    //处理表格第一行
    handleData() {
      this.dataList.unshift({
        id: 0,
        name: '合计',
        type: '201.5',
        endDate: '210.6'
      });
    },
    async getList() {
      this.loading = true;
      try {
        if (this.waterPlantIdObj.dateType === 'date') {
          this.dataList = [];
        } else {
          this.chartData = {
            columns: ['时间'],
            rows: []
          };
          let { resultData } = await this.$http.post(`/costAnalysis/getCostTrendByPlaceId?costPlaceId=${this.rowData.id}`, this.waterPlantIdObj);
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
        }
      } catch {
        this.dataList = [];
        this.chartData.rows = [];
      } finally {
        this.loading = false;
      }
    },
    goBack() {
      this.$emit('back', true);
    },
    //跳转至工单详情
    goToDetail(row) {
      console.log(row, '单元行内容');
    }
  }
};
</script>
<style lang="less" scoped>
p {
  margin-bottom: 0;
}
.back {
  cursor: pointer;
  font-size: 20px;
}
.decs {
  font-size: 14px;
}
.tableStyle {
  width: 100%;
  height: 100%;
  margin-top: 20px;
}
</style>
