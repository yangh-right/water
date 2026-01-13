<!--
 * @Author: wangyr
 * @Date: 2023-07-28 20:22:14
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-19 15:22:45
 * @Description:
-->
<template>
  <div class="content">
    <div class="form">
      <div class="form-item">
        <w-select
          class="select-item"
          style="width: 122px"
          placeholder="请选择构筑物"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
          v-model="paramsOption"
          :options="paramsOptions"
          @change="paramsChange"
        ></w-select>
      </div>
    </div>
    <template v-if="dataList.length > 0">
      <w-spin v-for="(item, i) in dataList" :key="item.pointMemo" :spinning="loading" class="spin">
        <div class="content-title">{{ item.pointMemo }}</div>
        <div class="chart-wrapper" :style="{ height: '180px' }">
          <line-chart
            v-if="item.timeDataList.length > 0"
            :darkTheme="'light'"
            :option="item.options"
            :ref="`echart${i}`"
          ></line-chart>
          <w-empty v-else class="empty"></w-empty>
        </div>
      </w-spin>
    </template>
    <template v-else>
      <div class="empty-box">
        <w-empty v-for="item in 4" :key="item" class="spin"></w-empty>
      </div>
    </template>
    <div class="vercial-line"></div>
    <div class="row-line"></div>
  </div>
</template>
<script>
import * as echarts from 'echarts';
import { getPlacesByPointConfigCode } from '@/api/analysis.js';
import { getSludgeDischargeData } from '@/api/optimization';
export default {
  name: 'ChartPoint',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {
    LineChart: () => import('@/components/chart/LineChart.vue')
  },
  data() {
    return {
      loading: false,
      paramsOption: undefined,
      paramsOptions: [],
      dataList: []
    };
  },
  watch: {
    waterPlantId: {
      immediate: true,
      handler(val) {
        if (val) {
          this.initStructure();
        }
      }
    }
  },
  created() {},
  methods: {
    async initStructure() {
      let { status, resultData } = await getPlacesByPointConfigCode({
        configCode: 'sludge_discharge_sludge_data',
        pumpHouseId: this.waterPlantId,
        type: 0
      });
      if (status === 'complete' && Array.isArray(resultData)) {
        this.paramsOptions = resultData.map(item => {
          return {
            label: item.name,
            value: item.id
          };
        });
        this.paramsOption = resultData[0].id;
        // 获取图表数据
        setTimeout(() => {
          this.getHistoryData();
        }, 200);
      }
    },
    async getHistoryData() {
      if (!this.paramsOption) {
        return false;
      }
      let params = {
        waterPlantId: this.waterPlantId,
        placeId: this.paramsOption,
        // startDateTime: this.$moment().format('YYYY-MM-DD 00:00:00'),
        // endDateTime: this.$moment().format('YYYY-MM-DD 23:59:59'),
        configCode: 'sludge_discharge_sludge_data'
      };
      this.loading = true;
      let res = null;
      try {
        res = await getSludgeDischargeData(params);
        this.loading = false;
        if (res.status === 'complete') {
          res.resultData.forEach(item => {
            let xData = [];
            let realData = [];
            let preData = [];
            item.timeDataList.forEach(v => {
              xData.push(v.dateTimeStr);
              realData.push(v.historyPointValue);
              preData.push(v.modelPointValue);
            });

            item['options'] = {
              grid: [
                {
                  left: '16px',
                  right: '12px',
                  top: '18%',
                  bottom: '15%',
                  containLabel: true
                }
              ],
              color: ['#5B8FF9', '#FF9A3B'],
              legend: {
                show: false,
                top: 'bottom',
                icon: 'rect',
                itemHeight: 2,
                itemWidth: 12,
                textStyle: {
                  fontSize: '12px',
                  color: '#000000'
                }
              },
              tooltip: {
                trigger: 'axis'
              },
              xAxis: [
                {
                  data: xData
                }
              ],
              yAxis: [
                {
                  type: 'value',
                  name: item.pointUnit,
                  nameTextStyle: {
                    color: '#00000073',
                    padding: [0, 0, 0, 16]
                  }
                }
              ],
              series: [
                {
                  name: '实际值',
                  data: realData,
                  type: 'line',
                  smooth: true,
                  areaStyle: {
                    color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
                      { offset: 0, color: this.colorRgb('#c1dffd', 0.8) },
                      { offset: 1, color: this.colorRgb('#c1dffd', 0.1) }
                    ])
                  }
                },
                {
                  name: '预测值',
                  data: preData,
                  type: 'line',
                  smooth: true
                }
              ]
            };
          });
          this.dataList = res.resultData;
          console.log('pppp', this.dataList);
        }
      } catch (error) {
        this.dataList = [];
      }
    },
    colorRgb(str, opacity) {
      let sColor = str.toLowerCase();
      if (sColor) {
        if (sColor.length === 4) {
          let sColorNew = '#';
          for (let i = 1; i < 4; i += 1) {
            sColorNew += sColor.slice(i, i + 1).concat(sColor.slice(i, i + 1));
          }
          sColor = sColorNew;
        }
        //处理六位的颜色值
        let sColorChange = [];
        for (let i = 1; i < 7; i += 2) {
          sColorChange.push(parseInt('0x' + sColor.slice(i, i + 2)));
        }
        return 'rgba(' + sColorChange.join(',') + ',' + opacity + ')';
      } else {
        return sColor;
      }
    },
    paramsChange(data) {
      this.paramsOption = data;
      this.getHistoryData();
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  margin-bottom: 12px;
  width: 100%;
  height: 414px;
  display: flex;
  justify-content: space-between;
  flex-wrap: wrap;
  position: relative;
  &-title {
    padding: 15px 12px 10px;
    font-weight: 600;
    font-size: 16px;
    color: #333333;
    letter-spacing: 0;
  }
  .spin {
    height: 50%;
    width: calc(50% - 6px);
  }
  .vercial-line {
    height: calc(100% - 60px);
    border-right: 1px solid #e5e5e5;
    position: absolute;
    left: 50%;
    top: 40px;
  }
  .row-line {
    width: calc(100% - 24px);
    border-top: 1px solid #e5e5e5;
    position: absolute;
    left: 12px;
    top: 50%;
  }
  .chart-wrapper {
    padding: 10px 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  .empty-box {
    display: flex;
    justify-content: space-between;
    flex-wrap: wrap;
    width: 100%;
    height: 414px;

    .spin {
      height: 50%;
      width: calc(50% - 20px);
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }

  .form {
    display: flex;
    justify-content: space-between;
    align-items: center;
    position: absolute;
    top: 0px;
    right: 12px;
    z-index: 99;
  }
  .form-item {
    margin-top: 10px;
    margin-left: 8px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
}
</style>
