<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: wangyr
 * @LastEditTime: 2024-04-08 09:11:52
-->
<template>
  <div class="content">
    <div class="content-header">
      <div class="content-title">{{ title }}</div>
    </div>
    <w-spin :spinning="loading" class="content-body">
      <div v-if="pointsList.length > 0" class="point-list">
        <div v-for="item in pointsList" :key="item.pointMemo" class="carbon-list">
          <span class="point-name">{{ item.pointMemo }}</span>
          <div class="point-box">
            <span v-if="moduleType !== 'startParameter'" class="value">{{ item.pointValue }}</span>
            <w-input-number v-else class="list__input" v-model="item.pointValue"></w-input-number>
            <!-- <span class="unit" :title="item.pointUnit">{{ item.pointUnit }}</span> -->
          </div>
        </div>
      </div>
      <w-empty v-else class="empty"></w-empty>
    </w-spin>
  </div>
</template>
<script>
import { getForecastValue } from '@/api/optimization';
export default {
  name: 'PalcesData',
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    moduleType: {
      type: String,
      default: ''
    },
    palcesInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      loading: false,
      dataList: [],
      pointsList: [],
      startParameter: []
    };
  },
  watch: {
    waterPlantId(val) {
      if (
        this.moduleType === 'operateParam' ||
        this.moduleType === 'influenceQuality' ||
        this.moduleType === 'initialParameter'
      ) {
        this.getPointList();
      }
    },
    palcesInfo: {
      handler(val) {
        if (Object.keys(val).length > 0) {
          this.getPointList();
        }
      },
      deep: true
    }
  },
  created() {},
  methods: {
    async getPointList() {
      this.loading = true;
      let { resultData, status } = await getForecastValue(this.palcesInfo?.id);
      this.loading = false;
      if (status === 'complete') {
        if (resultData.length) {
          this.flag = true;
          this.pointsList = resultData;
        } else {
          this.pointsList = [];
          this.flag = false;
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.content {
  width: calc(25% - 8px);
  height: 100%;
  margin-bottom: 12px;
  background-color: var(--supply-color-bg-card-component);
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
  &-body {
    width: 100%;
    height: calc(100% - 40px);
    /deep/.wpg-spin-container {
      height: 100%;
    }
    .point-list {
      width: 100%;
      height: 100%;
      padding: 0 12px;
      box-sizing: border-box;
      overflow: auto;
    }
    .carbon-list {
      display: flex;
      align-items: center;
      justify-content: space-between;
      height: 30px;
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-main);
      margin-bottom: 4px;
      .point-name {
        width: 220px;
      }
      .point-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
      }
      .unit {
        margin-left: 10px;
        width: 72px;
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }
      .value {
        display: flex;
        margin-left: 40px;
        padding: 0 15px;
        text-align: left;
        box-sizing: border-box;
        width: 88px;
        height: 28px;
        line-height: 28px;
        background: var(--supply-color-bg-card-dark);
        border: 1px solid var(--supply-color-border-DEFAULT);
        color: var(--supply-color-secondary);
        border-radius: 4px;
      }
      /deep/ .list__input {
        display: flex;
        justify-content: center;
        align-items: flex-start;
        width: 88px;
        height: 28px;
        line-height: 28px;
        padding: 0 4px;
        box-sizing: border-box;
        background: #f3f6f8;
        border: 1px solid #e9e8e8;
        color: var(--supply-color-secondary);
        .wpg-input-number-handler-up,
        .wpg-input-number-handler-down {
          visibility: hidden;
        }
        .wpg-input-number-input-wrap input {
          height: 28px;
        }
      }
    }
    .split {
      height: calc(100% - 10px);
    }

    .empty {
      height: 100%;
      display: flex;
      justify-content: center;
      align-items: center;
    }
  }
}
</style>
