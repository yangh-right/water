<template>
  <component
    :is="type === 'model' ? 'w-form-model' : 'w-form'"
    class="supply-bg-bg supply-p-2 query-form"
    layout="inline"
    v-bind="$attrs"
    v-on="$listeners"
  >
    <w-row
      type="flex"
      :gutter="10"
    >
      <slot></slot>
    </w-row>
  </component>
</template>
<script lang="ts">
import { defineComponent, PropType } from "@vue/composition-api";

export default defineComponent({
  props: {
    type: {
      type: String as PropType<"model">,
      required: false
    },
  },
  setup() {
    return {}
  },
});
</script>
