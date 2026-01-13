<template>
  <div class="kpiChart">
    <p v-if="showTitle" class="kpiChart-title">
      <span :title="block.chsName">{{ block.chsName }}</span>
      {{ block.unit ? `(${block.unit})` : '' }}
    </p>
    <div class="kpiChart-main">
      <slot v-if="moduleData.records && moduleData.records.length" />
      <empty v-else />
    </div>
  </div>
</template>

<script>
export default {
  name: 'ChartBox',
  components: {
    Empty: () => import('@/components/empty.vue'),
  },
  props: {
    moduleData: Object,
    showTitle: Boolean,
  },
  data() {
    return {};
  },
  computed: {
    block() {
      return this.moduleData?.block ?? {};
    },
  },
};
</script>

<style lang="less" scoped>
.kpiChart {
  grid-column: 1 / span 2;

  &-title {
    display: flex;
    padding-left: 26px;
    margin-top: 6px;
    margin-left: 8px;
    font-size: 12px;
    line-height: 16px;
    background: url('~@/assets/cockpit/ic_arrows_light.svg') left center/contain no-repeat;

    span {
      margin-right: 4px;
      .textOverflow();
    }
  }

  &-main {
    height: 160px;
    padding: 0 4px;
  }
}

:root[data-wpg-theme='dark'] .box {
  &-title {
    background-image: url('~@/assets/cockpit/ic_arrows.svg');
  }
}
</style>
