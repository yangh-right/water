<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-10-17 11:31:16
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-10-18 17:07:38
 * @Description: 
-->
<template>
  <div
    @click.prevent.stop="selectClick"
    :class="['select-item', value === source.value ? 'select-item--selected' : '']"
  >
    {{ source && source.label }}
  </div>
</template>

<script>
export default {
  name: 'SelectOption',
  props: {
    value: {
      default: undefined
    },
    clickItem: {
      type: Function,
      default: null
    },
    index: {
      type: Number
    },
    source: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
  },
  methods: {
    selectClick() {
      this.clickItem(this.source);
    }
  }
};
</script>
<style lang="less" scoped>
.select-item {
  position: relative;
  display: block;
  padding: 10px 12px;
  overflow: hidden;
  color: #666666;
  font-weight: normal;
  font-size: 12px;
  line-height: 18px;
  white-space: nowrap;
  text-overflow: ellipsis;
  cursor: pointer;
  transition: background 0.3s ease;

  &--selected,
  &:hover {
    background-color: var(--supply-color-bg-DEFAULT);
  }

  &:hover {
    color: var(--supply-color-primary-DEFAULT);
    background-color: var(--supply-color-bg-DEFAULT);
  }
}
</style>
