<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-18 17:23:15
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="chart-wrapper">
        <div v-if="pointsArr.length > 0" class="card-inner">
          <div class="card-box">
            <div v-for="item in pointsArr" :key="item.statName" class="card-item">
              <p class="card-label">
                <i
                  :style="{
                    'background-image': `linear-gradient(140deg, ${generateRandomColor()} 0%, ${generateRandomColor()} 96%)`
                  }"
                  class="card-ico"
                ></i
                >{{ item.statName }}
              </p>
              <p class="card-num">{{ item.powerPv }} <span class="card-unit">kw·h</span></p>
            </div>
          </div>
        </div>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { getEnergyPlaceAnalysis } from '@/api/analysis.js';

export default {
  name: 'YearStatistics',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  components: {},
  data() {
    return {
      loading: false,
      pointsArr: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getPointList(val);
        }
      },
      immediate: true
    }
  },
  created() {},
  methods: {
    async getPointList() {
      this.loading = true;
      this.pointsArr = [];
      let param = {
        dateType: 'year',
        deviceIdList: [],
        endDate: this.$moment().format('YYYY-MM-DD'),
        ratioFlag: true,
        startDate: this.$moment()
          .startOf('year')
          .format('YYYY-MM-DD'),
        statType: 0,
        waterPlantIdList: [this.waterPlantId]
      };
      let { resultData, status } = await getEnergyPlaceAnalysis(param);
      this.loading = false;
      if (status === 'complete') {
        this.pointsArr = resultData;
      }
    },
    generateRandomColor() {
      // 生成三个随机数作为 RGB 值
      var r = Math.floor(Math.random() * 256);
      var g = Math.floor(Math.random() * 256);
      var b = Math.floor(Math.random() * 256);
      // 组装成颜色字符串
      var color = 'rgb(' + r + ',' + g + ',' + b + ')';
      return color;
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: 100%;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  &-header {
    width: 100%;
    padding: 15px 12px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
    height: 40px;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  .spin {
    width: 100%;
    height: calc(100% - 40px);
  }
  .card-inner {
    width: 100%;
    height: 100%;
    position: relative;
    padding: 0 12px;
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    .card-box {
      width: 100%;
      height: 100%;
      display: flex;
      justify-content: flex-start;
      flex-wrap: wrap;

      .card-item {
        width: calc(33.3% - 6px);
        height: 58px;
        border-radius: 4px;
        overflow: hidden;
        padding: 7px 8px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        justify-content: space-between;
        background: var(--supply-color-table-interval);
        margin-bottom: 8px;
        margin-right: 9px;

        &:nth-child(3n) {
          margin-right: 0;
        }
      }
      .card-num {
        font-weight: 700;
        font-size: 16px;
        color: var(--supply-color-main);
        letter-spacing: 0;
        margin-bottom: 0px;
        display: flex;
        align-items: center;

        .card-unit {
          font-family: PingFangSC-Regular, sans-serif;
          font-weight: 400;
          font-size: 12px;
          color: #666666;
          letter-spacing: 0;
          margin-left: 4px;
        }
      }
      .card-label {
        font-weight: 400;
        font-size: 14px;
        color: var(--supply-color-main);
        letter-spacing: 0;
        margin-bottom: 0px;
        display: flex;
        align-items: center;

        .card-ico {
          display: inline-block;
          width: 5px;
          height: 5px;
          // background-image: linear-gradient(140deg, #a8e6ff 0%, #1486f9 96%);
          border-radius: 100%;
          margin-right: 6px;
        }
      }
    }
  }
  .chart-wrapper {
    height: 100%;
    padding: 10px 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
