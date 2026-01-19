<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: wangyr
 * @LastEditTime: 2025-04-08 13:17:42
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <!-- 下钻详情 -->
    <div slot="headerRight" class="workforce" @click="goTeamManage">
      <span>详情</span>
      <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
    </div>
    <div :class="['list', themeConfig.className]" v-if="dataList.length">
      <div class="list__item" v-for="(item, index) in dataList" :key="item.pointName">
        <div class="name">{{ item.pointMemo }}</div>
        <div class="chart">
          <w-progress
            :stroke-color="{
              '0%': '#31CEF7',
              '100%': '#16A0ED'
            }"
            type="circle"
            :percent="item.percent"
            :width="96"
          >
            <template #format="percent">
              <div class="percent-content">
                <div class="percent">{{ percent }}<span class="unit">%</span></div>
                <div class="title">完好率</div>
              </div>
            </template>
          </w-progress>
        </div>
      </div>
    </div>
    <empty v-else></empty>
  </unit-card>
</template>

<script>
const EQUIPMENT_TYPES = [
  { name: '仪表类', key: 'instrumentRate' },
  { name: '电气类', key: 'electricalRate' },
  { name: '机械类', key: 'mechanicalRate' }
];
import { themeMixin } from '@/core/mixins.ts';
import { deviceIntegrityRate } from '@/api/cockpit.js';
export default {
  name: 'equipmentRate',
  mixins: [themeMixin],
  components: {
    empty: () => import('../components/empty.vue'),
    UnitCard: () => import('@/components/CardBox/CockpitCard.vue')
  },
  props: {
    waterPlantId: {
      type: String,
      default: ''
    },
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      themeConfigMap: {
        default: {
          className: 'card-default'
        },
        dark: {
          className: 'card-dark'
        }
      },
      loading: false,
      deviceData: []
    };
  },
  computed: {
    dataList() {
      if (!this.deviceData) return [];
      return this.deviceData.slice(0, 3).map((data, index) => ({
        pointName: data.type,
        pointMemo: data.typeName,
        percent: data.rate || 0,
        pointUnit: '%'
      }));
    }
  },

  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initData();
        }
      },
      immediate: true
    }
  },
  methods: {
    async initData() {
      if (!this.waterPlantId) return;

      this.loading = true;
      try {
        const { status, resultData } = await deviceIntegrityRate({
          waterPlantId: this.waterPlantId
        });

        if (status === 'complete') {
          this.deviceData = resultData;
        }
      } catch (error) {
        console.error('设备概览数据获取失败:', error);
      } finally {
        this.loading = false;
      }
    },
    // 跳转
    goTeamManage() {
      this.drillDown({
        path: '/manage/RepaireList'
      });
    }
  }
};
</script>

<style lang="less" scoped>
.workforce {
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #999999;
  letter-spacing: 0;
  cursor: pointer;
}
.list {
  width: 100%;
  height: calc(100%);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.card-dark {
    .list__item {
      background: url('~@/assets/productionCockpit/blue-bg_dark.png') no-repeat;
      background-size: 100% 100%;
    }
  }
  &__item {
    width: calc(33.33% - 8px);
    height: 100%;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 0px 10px 0;
    background: url('~@/assets/productionCockpit/blue-bg.png') no-repeat;
    background-size: 100% 100%;
    .name {
      height: 40px;
      width: 100%;
      text-align: center;
      line-height: 40px;
      font-weight: 600;
      font-size: 14px;
      color: var(--supply-color-bg-card-DEFAULT);
      letter-spacing: 0;
      margin-bottom: 11px;
      margin-bottom: 33px;
    }
    .chart {
      .percent-content {
        display: flex;
        flex-direction: column;
        .percent {
          color: var(--supply-color-main);
          font-size: 24px;
          font-weight: 600;
          letter-spacing: 0;
          .unit {
            color: var(--supply-color-third);
            font-size: 12px;
            font-weight: 400;
            margin-left: 1px;
          }
        }
        .title {
          font-size: 14px;
          color: var(--supply-color-secondary);
          letter-spacing: 0;
        }
      }
    }
    .split {
      margin: 16px 0;
    }
    .rate {
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
    }
  }
}
</style>
