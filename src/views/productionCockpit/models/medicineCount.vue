<!--
 * @Author: wangyr
 * @Date: 2023-09-05 10:30:42
 * @LastEditors: fengtaotao
 * @LastEditTime: 2025-03-18 09:51:21
 * @Description:
-->
<template>
  <unit-card :cardTitle="cardTitle">
    <div slot="headerRight">
      <w-radio-group size="small" v-model="type" @change="typeChange">
        <w-radio-button v-for="(item, index) in goods" :key="item.value" :value="item.value">
          {{ item.label }}
        </w-radio-button>
      </w-radio-group>
    </div>
    <div :class="['list', themeConfig.className]" v-if="dataList.length">
      <div class="list__item" v-for="(item, index) in dataList" :key="item.dosageCode">
        <div class="icon">
          <div class="circle">
            <w-icon class="img" :type="item.icon"></w-icon>
          </div>
        </div>
        <div class="name">{{ item.dosageName }}</div>
        <div class="value">
          <span class="val">{{ item.amount }}</span>
          <span class="unit">{{ item.unit }}</span>
        </div>
        <div class="split"></div>
        <div class="rate">环比：{{ item.amountRate }}%</div>
      </div>
    </div>
    <empty v-else></empty>
  </unit-card>
</template>

<script>
import { getDateRange } from './data';
const icons = ['ic_colorize', 'ic_test_bulb', 'ic_beaker', 'ic_drip'];
import { themeMixin } from '@/core/mixins.ts';
import { dosageOfReagent } from '@/api/cockpit.js';
export default {
  name: 'medicineCount',
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
      dataList: [],
      goods: [
        { label: '日', value: 'day' },
        { label: '月', value: 'month' }
      ],
      type: 'month'
    };
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
  created() {},
  mounted() {},
  methods: {
    async initData() {
      let { startDate, endDate } = getDateRange(this.type);
      const params = {
        queryType: this.type,
        endDate,
        startDate,
        waterPlantId: this.waterPlantId
      };
      let { resultData, status } = await dosageOfReagent(params);
      if (status === 'complete') {
        this.dataList = resultData.map((item, index) => {
          // 取余运算实现图标循环使用
          const iconIndex = index % icons.length;
          return {
            ...item, // 保留原数据
            icon: icons[iconIndex] // 添加图标字段
          };
        });
      }
    },
    typeChange() {
      this.initData();
    }
  }
};
</script>

<style lang="less" scoped>
.list {
  width: 100%;
  height: 100%;
  padding-top: 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  &.card-dark {
    .list__item {
      background: url('~@/assets/productionCockpit/medicineCount-bg_dark.png') no-repeat;
      background-size: 100% 100%;
    }
  }
  &__item {
    width: calc(25% - 6px);
    height: 100%;
    border-radius: 6px;
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: 16px 10px 0;
    background: url('~@/assets/productionCockpit/medicineCount-bg.png') no-repeat;
    background-size: 100% 100%;
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
      width: 100%;
      height: 28px;
      background: var(--supply-color-bg-card-DEFAULT);
      border: 1px solid #00db89;
      border-radius: 12px;
      margin-bottom: 23px;
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
