<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:05:43
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-05 14:55:14
 * @Description: 
-->
<template>
  <div class="card-box">
    <div class="card-box__title" :text="title">
      <div class="text">{{ title }}</div>
      <div class="title-right">
        <slot name="titleRight"></slot>
      </div>
    </div>
    <div class="card-box__content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: {
      type: String,
      default: ''
    },
    isEmpty: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.card-box {
  position: relative;
  overflow: hidden;
  background-color: var(--supply-color-bg-card-component);
  height: 100%;
  width: 100%;
  &__title {
    line-height: 44px;
    padding-left: 12px;
    height: 34px;
    display: flex;
    justify-content: space-between;
    .text {
      color: var(--supply-color-main);
      font-weight: 500;
      font-size: 16px;
      &::before {
        content: '';
        background-color: #08d193;
        width: 4px;
        margin-right: 6px;
        height: 14px;
        position: relative;
        display: inline-block;
        left: 0;
        top: 1px;
      }
    }
  }

  &__content {
    position: relative;
    height: calc(100% - 34px);
  }
}
</style>
