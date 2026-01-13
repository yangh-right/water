<template>
  <!-- 使用单位卡片组件，传递卡片标题 -->
  <unit-card :cardTitle="cardTitle">
    <!-- 主要内容区域，根据主题设置样式 -->
    <div :class="['card-inner', themeConfig.className]">
      <!-- 遍历维保项 -->
      <div v-for="(item, index) in maintenanceItems" :key="index" class="chart-box">
        <!-- 维保标签 -->
        <div class="chart-label">仪表维保: {{ item.days }} <span class="unit">天</span></div>
        <!-- 进度条 -->
        <div class="chart-line">
          <electricity-progress :axis="item.option" />
        </div>
      </div>
    </div>
  </unit-card>
</template>

<script>
import { themeMixin } from '@/core/mixins.ts';
import { getMaintenancePlan } from '@/api/cockpit.js';
import electricityProgress from '../components/electricityProgress.vue';
export default {
  name: 'maintenancePlan',
  components: {
    // 异步加载单位卡片组件
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue'),
    // 加载进度条组件
    electricityProgress
  },
  mixins: [themeMixin], // 使用主题混入
  props: {
    // 水厂ID
    waterPlantId: {
      type: String,
      default: ''
    },
    // 卡片标题
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      // 主题配置
      themeConfigMap: {
        default: {
          className: 'card-default'
        },
        dark: {
          className: 'card-dark'
        }
      },
      loading: false, // 加载状态
      equipmentData: null, // 设备数据
      // 维保项数据
      maintenanceItems: [
        {
          days: 2,
          completedSegments: 3,
          color: 'red',
          option: {
            unit: '%',
            max: 100,
            colors: ['#F64357', '#F64357'],
            data: [
              {
                name: '比例',
                value: 48
              }
            ]
          }
        },
        {
          days: 6,
          completedSegments: 13,
          color: 'blue',
          option: {
            unit: '%',
            max: 100,
            colors: ['#28A8F3', '#28A8F3'],
            data: [
              {
                name: '比例',
                value: 48
              }
            ]
          }
        },
        {
          days: 15,
          completedSegments: 25,
          color: 'green',
          option: {
            unit: '%',
            max: 100,
            colors: ['#00CC9D', '#00CC9D'],
            data: [
              {
                name: '比例',
                value: 48
              }
            ]
          }
        }
      ]
    };
  },
  watch: {
    // 监听水厂ID变化
    waterPlantId: {
      handler: 'initData',
      immediate: true
    }
  },
  methods: {
    // 初始化数据
    async initData() {
      if (!this.waterPlantId) return;

      this.loading = true;
      try {
        // 获取维保计划数据
        const { status, resultData } = await getMaintenancePlan({
          waterPlantId: this.waterPlantId
        });

        if (status === 'complete') {
          this.equipmentData = resultData;
        }
      } catch (error) {
        console.error('设备概览数据获取失败:', error);
      } finally {
        this.loading = false;
      }
    }
  }
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;

  .chart-box {
    width: 100%;
    height: calc(33.3% - 16px);
  }

  .chart-label {
    color: var(--supply-color-main);
    font-size: 14px;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
  }

  .unit {
    color: var(--supply-color-third);
    font-size: 14px;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
  }
  .chart-line {
    width: 100%;
    height: 32px;
    border: 1px solid #dee2e7;
    margin-top: 10px;
    position: relative;
  }
}
.card-dark {
  .chart-line {
    border: 1px solid #202f34;
    background: #202f34;
  }
}
</style>
