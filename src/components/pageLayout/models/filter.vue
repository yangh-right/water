<template>
  <div class="page-filter wbgc-card">
    <search v-if="options" ref="search" :options="options" v-on="$listeners"></search>
    <div class="page-filter__right">
      <slot name="filter-right"></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageFilter',
  components: { Search: () => import('./search.vue') },
  inheritAttrs: false,
  props: {
    options: Object,
  },
  methods: {
    reset() {
      this.$refs.search?.handleReset();
    },
  },
};
</script>

<style lang="less" scoped>
.page-filter {
  display: flex;
  flex: none;
  justify-content: space-between;
  padding: 10px 25px;
  border-radius: 4px;

  &__right {
    display: flex;
    align-items: center;
  }
}
</style>
