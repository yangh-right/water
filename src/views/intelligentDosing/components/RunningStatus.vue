<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-10 13:17:15
-->
<template>
  <div class="content">
    <div class="content-title">
      <div class="title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="spin">
      <div class="content-body">
        <div v-if="carbonList.length > 0" class="left">
          <div v-for="(item, index) in carbonList" :key="item.name + index" class="carbon-list">
            <span class="name">{{ item.name }}</span>
            <span class="value">{{ item.value }}</span>
            <span class="unit">{{ item.unit }}</span>
          </div>
        </div>
        <w-empty v-else class="empty"></w-empty>
        <a-divider type="vertical" class="split" />
        <div v-if="drugList.length" class="right">
          <div v-for="(item, index) in drugList" :key="item.name + index" class="drug-list">
            <span class="name">{{ item.name }}</span>
            <span class="value">{{ item.value1 }}</span>
            <span class="unit">{{ item.unit1 }}</span>
            <span class="value">{{ item.value2 }}</span>
            <span class="unit">{{ item.unit2 }}</span>
          </div>
        </div>
        <w-empty v-else class="empty"></w-empty>
      </div>
    </w-spin>
  </div>
</template>
<script>
import { operatingStatus } from '@/api/analysis';
export default {
  name: 'RunningStatus',
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      loading: false,
      dataList: [],
      carbonList: [],
      drugList: []
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getOperatingStatus();
        }
      },
      immediate: true
    }
  },
  methods: {
    async getOperatingStatus() {
      this.loading = true;
      let res = await operatingStatus(this.waterPlantId);
      let { status, resultData } = res;
      this.carbonList = [];
      this.drugList = [];
      this.loading = false;
      if (status === 'complete') {
        resultData.feedPointList.forEach(item => {
          this.carbonList.push({
            name: item.pointName,
            value: item.flow,
            unit: 'L/H'
          });
        });
        this.carbonList.push({
          name: '碳源实际流量',
          value: resultData.totalValue,
          unit: 'L/H'
        });
        resultData.pumpPointList.forEach(item => {
          this.drugList.push({
            name: item.pointName,
            value1: item.flow || '',
            unit1: 'Hz',
            value2: item.frequency || '',
            unit2: 'L/H'
          });
        });
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(50% - 6px);
  height: 240px;
  background-color: var(--supply-color-bg-card-component);
  &-title {
    padding: 15px 12px;
    height: 50px;
    .title {
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0;
      margin-right: 20px;
    }
  }
  .spin {
    height: calc(100% - 50px);
  }
  &-body {
    display: flex;
    justify-content: space-evenly;
    width: 100%;
    height: 100%;
    .left,
    .right {
      margin: 0 12px;
      width: calc(50% - 4px);
      height: 180px;
      overflow-y: auto;
    }
    .carbon-list {
      display: flex;
      // justify-content: space-between;
      align-items: center;
      height: 30px;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      .name {
        width: 180px;
      }
      .unit {
        margin-left: 10px;
        width: 30px;
      }
      .value {
        display: flex;
        justify-content: center;
        align-items: center;
        margin-left: 40px;
        width: 80px;
        height: 28px;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        border-radius: 4px;
      }
    }
    .drug-list {
      display: flex;
      justify-content: space-between;
      align-items: center;
      height: 30px;
      font-weight: 400;
      font-size: 14px;
      color: #333333;
      .name {
        width: 140px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }
      .unit {
        width: 30px;
      }
      .value {
        display: flex;
        justify-content: center;
        align-items: center;
        width: 80px;
        height: 28px;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        border-radius: 4px;
      }
    }
    .split {
      height: 180px;
    }
  }
}
</style>
