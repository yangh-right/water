<template>
  <div :class="['page-content wbgc-card', { autofill: heightAutofill }]">
    <div v-if="headerVisible" class="page-content__header">
      <div class="page-content__header-left">
        <!-- 标签 -->
        <tabs
          v-if="tabsVisible"
          :tabs="tabs"
          :current-tab="$attrs.currentTab"
          @change="$emit('tab:change', $event)"
        />
        <slot name="content-header-left" />
      </div>
      <div class="page-content__header-right">
        <slot name="content-header-right" />
      </div>
      <slot name="content-header" />
    </div>
    <div class="page-content__main">
      <!-- 表格 -->
      <page-table
        v-if="table"
        v-bind="table"
        @page-change="(page, size) => $emit('table:page-change', page, size)"
        @sort="(columnKey, order) => $emit('table:sort', columnKey, order)"
      >
        <template v-for="(scopedSlot, name) in $scopedSlots" v-slot:[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </page-table>
      <!-- 内容插槽 -->
      <slot name="content-main" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageContent',
  components: {
    Tabs: () => import('./tabs.vue'),
    PageTable: () => import('./table.vue'),
  },
  inheritAttrs: false,
  props: {
    tabs: Array,
    heightAutofill: Boolean,
    headerVisible: Boolean,
    table: Object,
  },
  computed: {
    tabsVisible() {
      return this.tabs && this.tabs.length > 0;
    },
  },
};
</script>

<style lang="less" scoped>
.page-content {
  display: flex;
  flex-direction: column;
  border-radius: 4px;

  &.autofill {
    flex: 1;
    overflow: hidden;

    .page-content__main {
      overflow: hidden;
    }
  }

  &__header {
    display: flex;
    flex: none;
    align-items: center;
    justify-content: space-between;
    height: 46px;
    padding: 0 20px;
  }

  &__main {
    flex: 1;
  }
}
</style>
