<!-- 污泥排放设备状态组件 -->
<template>
  <div class="content">
    <!-- 标题区域 -->
    <div class="content-title">
      <div class="title">{{ title }}</div>
    </div>
    <!-- 数据展示区域 -->
    <div v-if="data.length > 0" class="content-spin">
      <div v-for="item in data" :key="item.deviceId" class="point-list">
        <!-- 设备名称 -->
        <div class="point-filed">
          <div class="point-pump">{{ item.deviceName }}</div>
        </div>
        <!-- 设备状态 -->
        <div v-for="point in item.dataList" :key="point.pointName" class="point-filed">
          <div class="point-name">{{ point.pointMemo }}</div>
          <div v-if="point.pointName === 'onlineStatus'" class="point-val">
            <i :class="['i-icon', point.pointValue === '1' ? 'i-active' : 'i-stop']"></i>
            {{ point.pointValue === '1' ? '运行' : '停止' }}
          </div>
          <div v-else class="point-val">{{ point.pointValue }} {{ point.pointUnit }}</div>
        </div>
      </div>
      <!-- 加载状态 -->
      <w-spin v-show="isLoading" class="spin"></w-spin>
    </div>
    <!-- 空状态 -->
    <w-empty v-else class="empty"></w-empty>
  </div>
</template>

<script>
// 导入API
import { getSludgePumpData } from '@/api/optimization';

export default {
  name: 'SoilDischarging',
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    },
    waterPlantId: {
      type: String,
      required: true,
      default: ''
    }
  },
  data() {
    return {
      // 加载状态
      isLoading: false,
      // 数据列表
      data: []
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId(val) {
      if (val) {
        this.getPointList();
      }
    }
  },
  methods: {
    // 获取设备状态数据
    async getPointList() {
      this.isLoading = true;
      let { resultData, status } = await getSludgePumpData(this.waterPlantId);
      this.isLoading = false;
      if (status === 'complete') {
        this.data = resultData;
      }
    }
  }
};
</script>

<style lang="less" scoped>
/* 样式部分 */
.content {
  position: relative;
  width: calc(50% - 6px);
  height: 388px;
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;

  &-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 12px;
    height: 50px;
    .title {
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0;
    }
  }
  .content-spin {
    height: calc(100% - 50px);
    overflow: auto;
    padding: 0 12px;
    box-sizing: border-box;
    position: relative;

    .point-list {
      width: 100%;
      display: flex;
      justify-content: flex-start;
      margin-bottom: 12px;
      overflow-x: auto;
      overflow-y: none;
      .point-pump {
        height: 72px;
        justify-content: center;
        align-items: center;
        font-size: 14px;
        color: var(--supply-color-deviate);
        background: var(--supply-color-table-interval);
        display: flex;
      }
      .point-filed {
        min-width: 94px;
        height: 100%;
        text-align: center;
        border-right: 1px solid #e5e5e5;
        border-bottom: 1px solid #e5e5e5;
        flex: 1 0 94px;

        &:first-child {
          border-bottom: none;
        }
        &:last-child {
          border-right: none;
        }
        .point-name {
          padding: 0 12px;
          box-sizing: border-box;
          height: 36px;
          line-height: 36px;
          font-size: 14px;
          color: var(--supply-color-deviate);
          background-color: var(--supply-color-bg-card-dark);
        }
        .point-val {
          padding: 0 12px;
          box-sizing: border-box;
          height: 36px;
          line-height: 36px;
          font-size: 14px;
          color: var(--supply-color-main);
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .i-icon {
          width: 6px;
          height: 6px;
          border-radius: 50%;
          margin-right: 8px;
        }
        .i-active {
          background: #27dcb1;
        }
        .i-stop {
          background: var(--supply-color-offline-bg);
        }
      }
    }
    .spin {
      position: absolute;
      left: 50%;
      top: 50%;
      margin-top: -10px;
      margin-left: -10px;
    }
  }
  .empty {
    height: calc(100% - 50px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
