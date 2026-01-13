<template>
  <div :class="['kpiCard', { canDrill }]" @click="kpiDrill">
    <!-- 指标信息 -->
    <p class="kpiCard-title" :title="block.chsName">{{ block.chsName }}</p>
    <p class="kpiCard-info">
      <span :class="['kpiCard-pv', { 'wfc-alarm': !block.healthFlag }]">{{ block.data }}</span>
      <span class="kpiCard-unit">{{ block.unit }}</span>
    </p>
    <template v-if="subVisible">
      <!-- 关联指标 -->
      <div v-if="block.relBlocks && block.relBlocks.length" class="kpiCard-summary">
        <p v-for="(item, idx) in block.relBlocks" :key="idx" class="kpiCard-summary__item">
          <span class="kpiCard-summary__name" :title="item.blockName">{{ item.blockName }}</span>
          <span class="kpiCard-summary__info">
            <strong>{{ item.data }}</strong>
            <span class="kpiCard-summary__unit">{{ item.unit }}</span>
          </span>
        </p>
      </div>
      <!-- 在线离线 -->
      <ul v-if="ratioList && ratioList.length" class="kpiCard-list">
        <li v-for="(item, idx) in ratioList" :key="idx" class="kpiCard-item">
          <span class="kpiCard-item__title" :title="item.name">{{ item.name }}</span>
          <span
            v-if="item.thb"
            :class="[
              'kpiCard-item__value',
              { 'wfc-success': item.status > 0, 'wfc-alarm': item.status < 0 },
            ]"
            >{{ item.data }}{{ item.unit }}
            <w-icon v-if="item.status > 0" type="ic_arrow_drop_up" />
            <w-icon v-if="item.status < 0" type="ic_arrow_drop_down" />
          </span>
          <span v-else class="kpiCard-item__value">{{ item.data }}{{ item.unit }}</span>
        </li>
      </ul>
    </template>
  </div>
</template>

<script>
import { ratio } from '@/enum';
import kpiDetailMixin from '@/utils/mixins/kpiDetailMixin';

export default {
  name: 'KpiCard',
  mixins: [kpiDetailMixin],
  inheritAttrs: false,
  props: {
    draggable: Boolean,
    moduleData: Object,
  },
  computed: {
    block() {
      return this.moduleData?.block ?? {};
    },
    subVisible() {
      const { showType } = this.block;
      return ['2', '4'].includes(showType);
    },
    ratioList() {
      const list = this.block?.blockDataList ?? [];

      return list.map((_v) => {
        const v = { ..._v };
        return v;
      });
    },
  },
};
</script>

<style lang="less" scoped>
p {
    margin-top: 0;
    margin-bottom: 0;
}
.kpiCard {
  min-height: 82px;
  padding: 8px 8px 9px;
  overflow: hidden;
  background-color: var(--bgc2);
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 var(--bsc2);

  &.canDrill {
    .kpiCardHover();
  }

  &-title {
    line-height: 18px;
    color: var(--fc1);
    .textOverflow();
  }

  &-info {
    margin-top: 4px;
    line-height: 20px;
  }

  &-pv {
    font-family: DIN-Black, sans-serif;
    font-size: 18px;
    font-weight: 900;
    color: var(--fc2);
    letter-spacing: 1.12px;
  }

  &-unit {
    margin-left: 2px;
    font-size: 12px;
    color: var(--fc3);
    opacity: 0.6;
  }

  &-summary {
    font-size: 12px;

    &__item {
      display: flex;
      overflow: hidden;
      white-space: nowrap;
    }

    &__name {
      margin-right: 4px;
      .textOverflow();
    }

    strong {
      color: var(--fc4);
    }

    &__unit {
      margin-left: 2px;
      color: var(--fc3);
      opacity: 0.6;
    }
  }

  &-list {
    margin-top: 2px;
    font-size: 12px;
  }

  &-item {
    display: flex;
    overflow: hidden;
    line-height: 18px;
    white-space: nowrap;

    &:not(:first-child) {
      margin-top: 2px;
    }

    &__title {
      margin-right: 4px;
      .textOverflow();
    }

    &__value {
      margin-left: 4px;

      .wpgicon {
        font-size: 14px;
      }
    }
  }
}
</style>
