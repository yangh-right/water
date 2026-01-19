<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-18 09:51:21
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <!-- 下钻详情 -->
    <!-- <div slot="headerRight" class="workforce" @click="goTeamManage">
      <span>详情</span>
      <w-icon type="right" style="margin-left:4px;font-size: 12px;"></w-icon>
    </div> -->
    <div class="title">
      <div class="icon"></div>
      <div class="name">本月计划排泥量：</div>
      <div class="planMonthNum">{{ planMonthNum }}<span class="unit">吨</span></div>
    </div>
    <div :class="['list', themeConfig.className]" v-if="dataList.length">
      <div class="list__item" v-for="(item, index) in dataList" :key="item.pointName">
        <div class="icon">
          <div class="circle">
            <w-icon class="img" :type="item.icon"></w-icon>
          </div>
        </div>
        <div class="name">{{ item.pointMemo }}</div>
        <div class="value">
          <span class="val">{{ item.pointValue }}</span>
          <span class="unit">{{ item.pointUnit }}</span>
        </div>
      </div>
    </div>
    <empty v-else></empty>
  </unit-card>
</template>

<script>
// 提取常量
const ICONS = [
  'ic_assignment_return',
  'ic_assignment_late',
  'ic_assignment_turned_in',
  'ic_assignment_24px'
];

const DATA_LIST_TEMPLATE = [
  {
    pointName: '本月污泥排泥量',
    pointMemo: '本月污泥排泥量',
    pointValue: 0,
    pointUnit: '吨',
    icon: ICONS[0]
  },
  {
    pointName: '上月污泥排泥量',
    pointMemo: '上月污泥排泥量',
    pointValue: 0,
    pointUnit: '吨',
    icon: ICONS[1]
  },
  {
    pointName: '本月污泥外运量',
    pointMemo: '本月污泥外运量',
    pointValue: 0,
    pointUnit: '吨',
    icon: ICONS[2]
  },
  {
    pointName: '上月污泥外运量',
    pointMemo: '上月污泥外运量',
    pointValue: 0,
    pointUnit: '吨',
    icon: ICONS[3]
  }
];

import { themeMixin } from '@/core/mixins.ts';
import { sludgeDischargePlan } from '@/api/cockpit.js';

export default {
  name: 'sludgeSituation',
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
      planMonthNum: '',
      data: {
        planMonthNum: '',
        monthNum: '',
        lastMonthNum: '',
        monthAvgNum: '',
        lastMonthAvgNum: ''
      },
      dataList: [...DATA_LIST_TEMPLATE]
    };
  },
  computed: {},
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
  created() {},
  mounted() {},
  methods: {
    async initData() {
      const params = {
        waterPlantId: this.waterPlantId
      };

      try {
        const { resultData, status } = await sludgeDischargePlan(params);
        if (status === 'complete') {
          this.data = resultData;
          this.planMonthNum = resultData.planMonthNum;
          this.dataList = DATA_LIST_TEMPLATE.map((item, index) => {
            const valueMap = {
              0: resultData.monthNum,
              1: resultData.lastMonthNum,
              2: resultData.monthExternalSludgeNum,
              3: resultData.lastMonthExternalSludgeNum
            };
            return {
              ...item,
              pointValue: valueMap[index] || 0
            };
          });
        }
      } catch (error) {
        console.error('数据获取失败:', error);
        // 可以添加更多错误处理逻辑，例如显示错误提示
      }
    },
    // 跳转称重管理
    goTeamManage() {
      this.drillDown({
        path: '/report/sludgeRecord'
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
.title {
  padding: 0 13px;
  width: 100%;
  height: 36px;
  background: var(--supply-cockpit-legend);
  border-radius: 4px;
  display: flex;
  align-items: center;
  font-weight: 400;
  font-size: 14px;
  margin-bottom: 12px;
  color: var(--supply-color-main);
  letter-spacing: 0;
  .icon {
    width: 21px;
    height: 21px;
    background: url('~@/assets/productionCockpit/time.png') no-repeat;
    background-size: 100% 100%;
    margin-right: 12px;
  }
  .total {
    font-weight: 600;
    .unit {
      font-size: 12px;
      font-weight: 400;
      color: var(--supply-color-third);
    }
  }
}
.list {
  width: 100%;
  height: calc(100% - 48px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.card-dark {
    .list__item {
      background: url('~@/assets/productionCockpit/medicineCount-bg_dark.png') no-repeat;
      background-size: 100% 100%;
      &:nth-child(odd) {
        background: url('~@/assets/productionCockpit/waterMedicine-bg_dark.png') no-repeat;
        background-size: 100% 100%;
      }
    }
  }
  &__item {
    width: calc(25% - 9px);
    height: 100%;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 0px 0;
    background: url('~@/assets/productionCockpit/medicineCount-bg.png') no-repeat;
    background-size: 100% 100%;
    &:nth-child(odd) {
      background: url('~@/assets/productionCockpit/waterMedicine-bg.png') no-repeat;
      background-size: 100% 100%;
      .icon {
        background-image: linear-gradient(32deg, #268ae61a 0%, #1ce0f11a 100%);
        .circle {
          background-image: linear-gradient(32deg, #268ae6 0%, #1ce0f1 100%);
        }
      }
      .value {
        border: 1px solid #268ae6;
      }
    }
    .icon {
      width: 52px;
      height: 52px;
      background-image: linear-gradient(32deg, #3ccad71a 0%, #00db891a 100%);
      border-radius: 50%;
      margin-bottom: 12px;
      padding: 10px;
      .circle {
        width: 100%;
        height: 100%;
        text-align: center;
        line-height: 36px;
        border-radius: 50%;
        background-image: linear-gradient(32deg, #3ccad7 0%, #00db89 100%);
        .img {
          color: #fff;
          font-size: 20px;
        }
      }
    }
    .name {
      font-weight: 400;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      margin-bottom: 11px;
    }
    .value {
      width: calc(100% - 20px);
      height: 28px;
      background: var(--supply-color-bg-card-DEFAULT);
      border: 1px solid #00db89;
      border-radius: 12px;
      margin: 0 0px 23px;
      font-size: 16px;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 500;
      letter-spacing: 0;
      color: var(--supply-color-main);
      line-height: 28px;
      text-align: center;
      .val {
        font-weight: 600;
        font-size: 16px;
        margin-right: 2px;
      }
      .unit {
        font-size: 12px;
        color: var(--supply-color-third);
        position: relative;
      }
    }
    .split {
      width: 100%;
      margin-bottom: 23px;
      height: 1px;
      background: linear-gradient(
        to left,
        transparent 0%,
        transparent 50%,
        #e1e8f0 50%,
        #e1e8f0 100%
      );
      background-size: 10px 1px;
      background-repeat: repeat-x;
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
