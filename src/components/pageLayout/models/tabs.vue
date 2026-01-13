<template>
  <w-tabs v-model="curTab" @change="$emit('change', $event)">
    <w-tab-pane v-for="tab in tabs" :key="tab.value" :tab="tab.label"></w-tab-pane>
  </w-tabs>
</template>

<script>
export default {
  name: 'Tabs',
  inheritAttrs: false,
  props: {
    tabs: Array,
    currentTab: [Number, String],
  },
  data() {
    return {
      curTab: this.currentTab,
    };
  },
  watch: {
    currentTab(val) {
      this.curTab = val;
    },
  },
};
</script>

<style lang="less" scoped>
.wpg-tabs {
  padding-bottom: 4px;

  :deep(&) {
    &-bar {
      display: flex;
      margin: 0;
      border-width: 2px;
    }

    &-nav-container {
      margin-bottom: -2px;
      line-height: 25px;
    }

    &-tab {
      padding: 9px 35px;
      margin-right: 0;
    }
  }
}
</style>
