<template>
  <div class="page">
    <!-- 头部 -->
    <page-header class="page__module" v-if="config.header" v-bind="config.header" v-on="$listeners">
      <template v-for="(scopedSlot, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </page-header>
    <!-- 筛选模块 -->
    <page-filter class="page__module" v-if="config.filter" v-bind="config.filter" ref="filter" v-on="$listeners">
      <template v-for="(scopedSlot, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </page-filter>
    <!-- 内容区 -->
    <page-content class="page__module" v-bind="config.content" v-on="$listeners">
      <template v-for="(scopedSlot, name) in $scopedSlots" v-slot:[name]="data">
        <slot :name="name" v-bind="data" />
      </template>
    </page-content>
    <!-- 弹窗 -->
    <template v-if="config.dialogs">
      <page-dialog
        v-for="dialog in config.dialogs"
        v-bind="dialog"
        :key="dialog.name"
        :ref="dialog.name"
      >
        <template v-for="(scopedSlot, name) in $scopedSlots" v-slot:[name]="data">
          <slot :name="name" v-bind="data" />
        </template>
      </page-dialog>
    </template>
    <!-- 额外插槽 -->
    <slot />
  </div>
</template>

<script>
import PageDialog from './models/dialog.vue';

export default {
  name: 'Page',
  components: {
    PageHeader: () => import('./models/header.vue'),
    PageFilter: () => import('./models/filter.vue'),
    PageContent: () => import('./models/content.vue'),
    PageDialog,
  },
  props: {
    config: {
      type: Object,
      default: () => ({}),
    },
  },
  mounted() {
    this.initDialogs();
    
  },
  methods: {
    initDialogs() {
      let refs = {};

      if (this.config.dialogs) {
        refs = this.config.dialogs.reduce((refs, dialog) => {
          const dialogRef = this.$refs[dialog.name][0];

          refs[dialog.name] = {
            open: () => {
              if (dialogRef) {
                dialogRef.visible = true;
              }
            },
            close: () => {
              if (dialogRef) {
                dialogRef.handleCancel();
              }
            },
            vm: dialogRef, // 暴露实例，以应对更多需求
          };
          return refs;
        }, {});
      }

      this.$emit('dialog:loaded', refs);
    },

    /**
     * @description: 过滤表单重置
     * @return {*}
     */
    filterReset() {
      this.$refs.filter?.reset();
    },
  },
};
</script>

<style lang="less" scoped>
.page {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 12px;
  overflow: auto;
  &__module {
    background-color: var(--supply-color-bg-card-component);
  }
  & > div:not(:first-child) {
    margin-top: 12px;
  }
}
</style>
