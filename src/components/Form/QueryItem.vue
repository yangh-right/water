<template>
  <w-col class="query-item supply-my-1" :span="span">
    <component
      :is="!isModel ? 'w-form-item' : 'w-form-model-item'"
      class="query-form-item"
      v-bind="$attrs"
      labelAlign="right"
      :wrapperCol="{ flex: 1 }"
    >
      <slot></slot>
    </component>
  </w-col>
</template>
<script lang="ts">
import { computed, defineComponent } from '@vue/composition-api';

export default defineComponent({
  props: {
    span: {
      type: Number,
      default: 6
    }
  },
  setup(props, ctx) {
    const isModel = computed(() => {
      return ctx.parent?.$props.type === 'model';
    });
    return {
      isModel
    };
  }
});
</script>
<style lang="less" scoped>
.query-form-item {
  @apply supply-w-full;
  margin-right: 0 !important;
  display: flex !important;
  /deep/ .wpg-form-item-label {
    flex-shrink: 0;
  }
}
</style>
