<template>
  <div class="analysis-page">
    <div class="analysis-header">
      <div class="header-title">
        <div class="title-left">
          <img class="left-icon" src="@/assets/icons/drugIcon.png" alt="" />
          <span class="title-1">药剂库存</span>
          <span class="title-2">库存/阈值</span>
        </div>
        <div class="title-right">
          <span>选择污水厂：</span>
          <factory-select
            style="width: 180px;"
            v-model="waterPlantId"
            autoSelect
            :showAll="!autoSelect"
          ></factory-select>
          <span style="margin-left: 12px;">仓库名称：</span>
          <w-select v-model="depotId" @focus="checkFactory" allowClear style="width: 180px;">
            <w-select-option
              v-for="(item, i) in warehouseList"
              :key="item.id + '' + i"
              :value="item.id"
              >{{ item.depotName }}</w-select-option
            >
          </w-select>
        </div>
      </div>
      <div class="header-info">
        <div class="drug-item" v-for="item in drugsList" :key="item.id">
          <div class="item-name">
            {{ item.materielName }}{{ item.unit ? `(${item.unit})` : '' }}
          </div>
          <div v-if="item.existingQuantity || item.existingQuantity == '0'" class="item-num">
            <span class="drug-num">{{ item.existingQuantity }}</span
            >/<span>{{ item.minInventory }}</span>
          </div>
          <div>
            <span
              :class="
                item.stockAlarm === 0 ? 'item-status normal-status' : 'item-status low-status'
              "
            >
              {{ item.stockAlarm === 0 ? '库存充足' : '库存不足' }}
            </span>
          </div>
        </div>
      </div>
    </div>
    <div class="analysis-content">
      <w-row>
        <w-col :span="7">
          <div class="data-content wbgc-card mr-12 ht-310">
            <div class="card-title inline-title">
              <span class="title">药耗占比</span>
              <span class="title-sec">累计所有药剂消耗占比</span>
            </div>
            <div class="card-content">
              <pie-chart v-if="pieOptionClone" ref="card-chart" :option="pieOptionClone">
              </pie-chart>
              <w-empty v-else></w-empty>
            </div>
          </div>
        </w-col>
        <w-col :span="17">
          <div class="data-content wbgc-card ht-310">
            <div class="card-title wbdc">
              <span class="title">药耗曲线</span>
              <div class="drug-radio">
                <w-select
                  v-model="drugId"
                  style="width: 180px"
                  :allowClear="false"
                  @change="drugChange"
                >
                  <w-select-option
                    :value="item.value"
                    v-for="(item, index) of drugList"
                    :key="index"
                  >
                    {{ item.label }}
                  </w-select-option>
                </w-select>
                <div>
                  <a-radio-group v-model="dateType" @change="getLineData">
                    <a-radio-button value="month">
                      月
                    </a-radio-button>
                    <a-radio-button value="year">
                      年
                    </a-radio-button>
                  </a-radio-group>
                  <w-month-picker
                    v-if="dateType === 'month'"
                    v-model="monthTime"
                    placeholder="请选择月份"
                    :allowClear="false"
                    style="margin-left: 12px;"
                    :disabledDate="disabledDate"
                    @change="getLineData"
                  />
                  <w-date-picker
                    v-else
                    v-model="yearTime"
                    mode="year"
                    placeholder="请选择年份"
                    :disabledDate="disabledDate"
                    :allowClear="false"
                    format="YYYY"
                    style="margin-left: 12px;width: 160px;"
                    :open="yearShowOne"
                    @openChange="openChangeOne"
                    @panelChange="panelChangeOne"
                  />
                </div>
              </div>
            </div>
            <div class="card-content">
              <line-chart
                :darkTheme="'light'"
                v-if="drugConsumptionline"
                :option="drugConsumptionline"
                ref="inChart1"
              ></line-chart>
              <w-empty v-else></w-empty>
            </div>
          </div>
        </w-col>
        <w-col :span="7">
          <div key="waterPlantId" class="data-content wbgc-card mr-12 mb-0 mht-310">
            <div class="card-title">
              <span class="title">库存阈值比</span>
            </div>
            <div class="card-content">
              <div class="threshold-top">
                <span>库存</span>
                <span>阈值</span>
              </div>
              <div class="threshold-content" v-if="drugsList.length > 0">
                <div class="threshold-item" v-for="item in drugsList" :key="item.id">
                  <div class="item-title">{{ item.materielName }}</div>
                  <div class="item-num">
                    <span :style="{ width: getLength(1, item.thresholdToNum) }"></span>
                  </div>
                  <div class="item-threshold">
                    <span :style="{ width: getLength(2, item.thresholdToNum) }"></span>
                  </div>
                  <div class="item-status-box">
                    <span class="item-status-num">{{ item.thresholdToNum }}</span>
                    <span
                      :class="
                        item.thresholdToNum >= 1
                          ? 'item-status normal-status'
                          : 'item-status low-status'
                      "
                      >{{ item.thresholdToNum >= 1 ? '库存充足' : '库存不足' }}</span
                    >
                  </div>
                </div>
              </div>
              <w-empty v-else></w-empty>
            </div>
          </div>
        </w-col>
        <w-col :span="17">
          <div key="waterPlantId" class="data-content wbgc-card mb-0 mht-310 table-card">
            <div class="card-content">
              <w-table
                :key="waterPlantId"
                class="table-box"
                :columns="column"
                :dataSource="tableListData"
                :loading="tableLoading"
                :pagination="false"
              >
                <template #customTitle>
                  <div class="num-title" style="display: flex; align-items: center">
                    <span>现有库存</span>
                    <w-tooltip trigger="click" placement="right">
                      <template slot="title">
                        <span
                          >如果库存数量为负数，请检查药剂流量是否超过库存量，及时调整药剂库存</span
                        >
                      </template>
                      <img
                        src="@/assets/icons/wenhao.png"
                        alt=""
                        style="width: 16px; margin-left: 6px; cursor: pointer"
                      />
                    </w-tooltip>
                  </div>
                </template>
              </w-table>
            </div>
          </div>
        </w-col>
      </w-row>
    </div>
  </div>
</template>
<script>
import { transMoneyNumber } from '@/utils/util';
import { cloneDeep } from 'lodash';
import { pieOption, drugConsumptionline, forecastColumn } from './config';
import FactorySelect from '@/components/factory-select/index';
import {
  getStockList,
  getBeseDepotList,
  getDrugCost,
  getDrugConsumeTrend,
  getPredicateDrugList
} from '@/api/warehouse.js';
import moment from 'moment';
export default {
  name: 'DrugsAnalusis',
  data() {
    return {
      waterPlantId: '',
      drugsList: [],
      pieOptionClone: null,
      dateType: 'month',
      monthTime: moment(),
      yearTime: moment(),
      yearShowOne: false, //年度打开关闭状态，true为打开，false为关闭
      drugList: [],
      drugId: '',
      drugConsumptionline: null,
      days: 1,
      depotId: '',
      warehouseList: [],
      loading1: false,
      loading2: false,
      drugForm: {
        drugId: undefined,
        searchTime: undefined
      },
      column: cloneDeep(forecastColumn),
      tableListData: [],
      tableLoading: false,
      checkedDrug: undefined,
      isPredicateInit: false,
      depotNo: 'cbjscck' // 默认仓库编号
    };
  },
  components: {
    PieChart: () => import('@/components/chart/PieChart.vue'),
    LineChart: () => import('@/components/chart/LineChart.vue'),
    FactorySelect
  },
  computed: {
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    }
  },

  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getBeseDepotList();
        } else {
          this.warehouseList = [];
        }
      },
      deep: true,
      immediate: true
    },
    depotId: {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      deep: true,
      immediate: true
    }
  },
  mounted() {
    this.drugForm.searchTime = moment().format('YYYY-MM-DD');
  },
  methods: {
    disabledDate(current) {
      // 禁用当前日期之后的所有日期
      return current && current > moment().endOf('day');
    },
    // 弹出日历和关闭日历的回调
    openChangeOne(status) {
      if (status) {
        this.yearShowOne = true;
      }
    },
    // 得到年份选择器的值
    panelChangeOne(value) {
      this.yearTime = value;
      this.yearShowOne = false;
      this.getLineData();
    },
    // 获取仓库列表
    getBeseDepotList() {
      const vo = {
        waterPlantId: this.waterPlantId
      };
      getBeseDepotList(vo).then(responst => {
        this.warehouseList = this.moveToFrontIfExists(
          responst.resultData.records,
          'depotNo',
          this.depotNo
        );

        this.depotId = responst.resultData.records.length ? responst.resultData.records[0].id : '';
      });
    },
    moveToFrontIfExists(arr, field, value) {
      const index = arr.findIndex(item => item[field] === value);

      if (index !== -1) {
        const item = arr.splice(index, 1)[0];
        arr.unshift(item);
      }

      return arr;
    },
    // 单位是否已选择
    checkFactory() {
      if (!this.waterPlantId) {
        this.$message.warn('请先选择污水厂');
      }
    },
    async initData() {
      await this.getStockList();
      this.checkedDrug = this.drugsList[0];
      this.getLineData();
      this.getPieData();
      this.getPredicateTableData();
      // 动态设置高度
      this.$nextTick(() => {
        let dom1 = document.querySelector('.threshold-content');
        let dom2 = document.querySelector('.table-card');
        dom2.style.height = dom1.scrollHeight + 118 + 'px';
      });
    },
    // 获取药剂列表
    async getStockList() {
      let params = {
        depotId: this.depotId,
        materielTypeNo: 'huaxueyaoji',
        page: { current: 1, size: 999 },
        waterPlantId: this.waterPlantId
      };
      try {
        let res = await getStockList(params);
        if (res.resultData && res.resultData.records) {
          res.resultData.records.forEach(item => {
            item.thresholdToNum = (item.existingQuantity / item.minInventory).toFixed(2);
          });
          this.$set(this, 'drugsList', res.resultData.records);
          this.drugList =
            res.resultData.records.map(item => ({
              ...item,
              label: item.materielName,
              value: item.id
            })) || [];
          this.drugId = this.drugList.length ? this.drugList[0].value : '';
        }
      } catch (err) {
        console.log(err);
      }
    },
    // 获取饼图数据
    async getPieData() {
      this.loading1 = true;
      let params = {
        depotId: this.depotId,
        materielTypeNo: 'huaxueyaoji',
        waterPlantId: this.waterPlantId
      };
      try {
        let res = await getDrugCost(params);
        if (res.resultData.length === 0) {
          this.pieOptionClone = null;
          return;
        }
        let seriesData = [];
        res.resultData.forEach(item => {
          seriesData.push({
            name: item.materielName,
            value: item.totalCost
          });
        });
        this.pieOptionClone = {
          ...cloneDeep(pieOption)
        };
        this.pieOptionClone.series[0].data = seriesData;
        this.pieOptionClone.legend = {
          right: '10%',
          orient: 'vertical',
          top: 'center',
          left: 'right',
          align: 'left',
          itemGap: 15,
          itemWidth: 10,
          itemHeight: 10,
          icon: 'rect',
          type: 'scroll',
          symbolKeepAspect: false,
          formatter: function(name, val) {
            let data = seriesData;
            let total = 0;
            let tarValue;
            for (let i = 0; i < data.length; i++) {
              total += data[i].value;
              if (data[i].name == name) {
                tarValue = data[i].value;
              }
            }
            let v = transMoneyNumber(tarValue) + '元';
            let p = ((tarValue / total) * 100).toFixed(2) + '%';
            return `${name}  ${v}  ${p}`;
          }
        };
      } catch (err) {
        console.log(err);
      } finally {
        this.loading1 = false;
      }
    },
    drugChange(val) {
      this.checkedDrug = this.drugsList.find(item => item.id === val);
      this.getLineData();
    },
    // 获取药耗折线图数据
    async getLineData() {
      if (!(this.drugId && this.waterPlantId)) {
        this.drugConsumptionline = null;
        return;
      }
      this.loading2 = true;
      try {
        let postData = {
          waterPlantId: this.waterPlantId,
          depotId: this.depotId,
          materielId: this.drugId,
          materielTypeNo: 'huaxueyaoji',
          searchTime:
            this.dateType === 'month'
              ? moment(this.monthTime).format('YYYY-MM-DD')
              : moment(this.yearTime).format('YYYY-MM-DD'),
          timeType: this.dateType === 'month' ? 0 : 1
        };
        let res = await getDrugConsumeTrend(postData);
        let resultData = res?.resultData || [];
        if (resultData.length === 0) {
          this.drugConsumptionline = null;
          return;
        }
        this.drugConsumptionline = {
          ...cloneDeep(drugConsumptionline)
        };
        this.drugConsumptionline.tooltip = {
          trigger: 'axis',
          formatter: `{b}<br />${this.checkedDrug.materielName}药耗量：{c} ` + this.checkedDrug.unit
        };
        this.drugConsumptionline.xAxis[0].data = resultData.map(item => item.outDepotDate);
        this.drugConsumptionline.yAxis[0].name = this.drugList[0].unit;
        this.drugConsumptionline.series = [
          {
            name: this.getDrugName(this.drugId),
            type: 'line',
            data: resultData.map(item => Number(item.totalQuantity))
          }
        ];
      } catch (err) {
        console.log(err);
      } finally {
        this.loading2 = false;
      }
    },
    // 通过药剂ID获取药剂名称
    getDrugName(id) {
      return this.drugsList.filter(item => item.id === id)[0].drugName;
    },
    // 阈值长度格式化
    getLength(type, thresholdToNum) {
      if (!thresholdToNum && type === 1) return 0;
      if (type === 1) {
        return thresholdToNum >= 1 ? '100%' : `${thresholdToNum * 100}%`;
      } else if (type === 2) {
        return thresholdToNum === 0
          ? '100%'
          : thresholdToNum < 1
          ? '100%'
          : `${(1 / thresholdToNum) * 100}%`;
      }
    },
    // 年月切换
    radioChange(val) {
      this.current = val.type;
      this.getLineData();
    },
    async getPredicateTableData() {
      this.tableLoading = true;
      let params = {
        depotId: this.depotId,
        materielTypeNo: 'huaxueyaoji',
        waterPlantId: this.waterPlantId
      };
      let res = await getPredicateDrugList(params);
      let resultData = res?.resultData || [];
      this.tableListData = resultData;
      this.tableLoading = false;
    }
  }
};
</script>
<style lang="less" scoped>
.analysis-page {
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: auto;
  .analysis-header {
    background: #ffffff;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    margin-bottom: 12px;
    padding: 16px;
    box-sizing: border-box;
    .header-title {
      width: 100%;
      display: flex;
      justify-content: space-between;
      .title-left {
        display: flex;
        align-items: center;
        .left-icon {
          width: 34px;
          height: 34px;
          margin-right: 16px;
        }
        .title-1 {
          font-size: 16px;
          color: #333333;
          font-weight: 700;
          margin-right: 16px;
        }
        .title-2 {
          font-size: 16px;
          color: #666;
        }
      }
      .title-right {
        display: flex;
        align-items: center;
      }
    }
    .header-info {
      display: flex;
      justify-content: space-between;
      margin-top: 14px;
      overflow: auto;
      .drug-item {
        display: flex;
        flex: 1;
        min-width: 130px;
        flex-direction: column;
        border-right: 1px solid #dee2e7;
        > div {
          text-align: center;
        }
        &:last-of-type {
          border-right: none;
        }
        .item-name {
          font-size: 16px;
          color: #999999;
        }
        .item-num {
          font-size: 16px;
          color: #333333;
          display: table-cell;
          vertical-align: bottom;
          .drug-num {
            font-size: 26px;
            font-weight: 700;
          }
        }
        .item-status {
          display: inline-block;
          color: #0acc9d;
          background-color: rgba(10, 204, 157, 0.1);
          border-radius: 4px;
          line-height: 22px;
          margin-top: 5px;
          padding: 2px 10px;
          &.low-status {
            background: rgba(246, 67, 87, 0.1);
            color: #f64357;
          }
        }
      }
    }
  }
  .data-content {
    display: flex;
    flex-direction: column;
    margin-bottom: 12px;
    padding: 14px 20px 20px 24px;
    box-sizing: border-box;
    background: #ffffff;
    box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.1);
    border-radius: 8px;
    .card-title {
      display: flex;
      justify-content: space-between;
      font-size: 16px;
      color: #333333;
      &.inline-title {
        display: block;
      }
      .title {
        font-weight: 700;
        line-height: 40px;
      }
      .title-sec {
        color: #999999;
        width: 100%;
        display: block;
      }
      .drug-radio {
        flex: 1;
        padding: 0;
        padding-left: 16px;
        display: flex;
        align-content: center;
        justify-content: space-between;
      }
      .yuce-btn {
        display: flex;
        align-items: center;
        cursor: pointer;
        .left-icon {
          margin-right: 8px;
          width: 18px;
          height: 18px;
        }
        span {
          color: #666666;
          font-size: 14px;
        }
      }
    }
    .card-content {
      flex: 1;
      overflow: auto;
      display: flex;
      flex-direction: column;
      /deep/ .info-table-view {
        flex: 1;
        min-height: 210px;
      }
      .threshold-top {
        margin-top: 18px;
        width: 100%;
        display: flex;
        span {
          flex: 5.5;
          font-size: 12px;
          color: #666666;
          padding: 0 8px;
          box-sizing: border-box;
          &:first-of-type {
            flex: 4.5;
            text-align: right;
            border-right: 1px solid #dee2e7;
          }
        }
      }
      .threshold-content {
        margin-top: 8px;
        .threshold-item {
          display: flex;
          margin-bottom: 18px;
          line-height: 20px;
          font-size: 14px;
          &:last-of-type {
            margin-bottom: 0;
          }
          .item-title {
            flex: 2.5;
          }
          .item-num {
            flex: 2;
            margin-right: 1px;
            display: flex;
            flex-direction: row-reverse;
            align-items: center;
            span {
              height: 12px;
              background-color: #2bcd53;
            }
          }
          .item-threshold {
            margin-left: 1px;
            flex: 2;
            display: flex;
            align-items: center;
            span {
              height: 12px;
              background-color: #ffa400;
            }
          }
          .item-status-box {
            flex: 3.5;
            box-sizing: border-box;
            display: flex;
            justify-content: space-between;
            line-height: 21px;
            font-size: 12px;
            .item-status-num {
              flex: 1;
              padding-right: 6px;
              text-align: right;
              box-sizing: border-box;
            }
            .item-status {
              width: 80px;
              text-align: center;
              color: #0acc9d;
              border-radius: 4px;
              padding: 2px 5px;
              &.normal-status {
                background: rgba(10, 204, 157, 0.1);
              }
              &.low-status {
                background: rgba(246, 67, 87, 0.1);
                color: #f64357;
              }
            }
          }
        }
      }
      .table-box {
        margin-top: 10px;
      }
    }
    &.mr-12 {
      margin-right: 12px;
    }
    &.mb-0 {
      margin-bottom: 0;
    }
    &.ht-310 {
      height: 310px;
    }
    &.mht-310 {
      min-height: 310px;
    }
  }
}
#info-form {
  .number-input {
    margin: 0 10px;
  }
  /deep/ .wpg-checkbox-wrapper {
    margin-bottom: 10px;
  }
}
[data-wpg-theme='dark'] {
  .analysis-page {
    .analysis-header {
      background-color: #12161d;
      .header-title .title-left .title-1 {
        color: #eee;
      }
      .header-info .item-num {
        color: #eee;
        .drug-num {
          color: #ccc;
        }
      }
    }
    .data-content {
      background-color: #12161d;
      .card-title {
        color: #eee;
      }
    }
  }
}
</style>
