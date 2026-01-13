<template>
  <div :class="['kpiCard', { canDrill }]" @click="kpiDrill">
    <p class="kpiCard-title">
      {{ block.chsName }}<span v-if="block.unit">({{ block.unit }})</span>
    </p>
    <div class="kpiCard-info">
      <span :class="['kpiCard-pv', { 'wfc-alarm': !block.healthFlag }]">{{ block.data }}</span>
      <div class="kpiCard-info__main">
        <!-- 同环比 -->
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
      </div>
    </div>
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
    ratioList() {
      const list = this.block?.blockDataList ?? [];

      return list.map((_v) => {
        const v = { ..._v };
        // 同环比特殊显示
        if (v.type === ratio.tb || v.type === ratio.hb) {
          v.thb = true;
          v.status = v.data > 0 ? 1 : v.data < 0 ? -1 : 0; // 同环比状态
        }

        return v;
      });
    },
  },
};
</script>

<style lang="less" scoped>
.kpiCard {
  grid-column: 1 / span 2;
  // height: 90px;
  padding: 16px 16px 13px;
  overflow: hidden;
  background-color: var(--bgc2);
  border-radius: 4px;
  box-shadow: 0 2px 4px 0 var(--bsc2);

  &.canDrill {
    .kpiCardHover();
  }

  &-title {
    line-height: 18px;
    .textOverflow();
  }

  &-info {
    display: flex;
    align-items: center;
    margin-top: 7px;

    &__main {
      margin-left: 20px;
      overflow: hidden;
    }
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

  &-list {
    font-size: 12px;
  }

  &-item {
    display: flex;
    overflow: hidden;
    white-space: nowrap;

    &__title {
      .textOverflow();
    }

    &__value {
      margin-left: 8px;

      .wpgicon {
        font-size: 14px;
      }
    }
  }

  &-summary {
    font-size: 12px;

    &__item {
      display: flex;
      overflow: hidden;
      white-space: nowrap;
    }

    &__name {
      .textOverflow();
    }

    &__info {
      margin-left: 8px;
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
}
</style>
