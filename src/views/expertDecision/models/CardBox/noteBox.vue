<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:05:43
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-16 19:32:09
 * @Description: 
-->
<template>
  <div class="card-box">
    <div class="card-box__title" :text="title">
      <div class="text">
        <span class="text__content">{{ title }}</span>
      </div>
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
  padding: 8px 10px 7px;
  position: relative;
  overflow: hidden;
  background-color: var(--supply-color-bg-card-faint);
  height: 100%;
  width: 100%;
  &__title {
    height: 24px;
    display: flex;
    justify-content: space-between;
    .text {
      font-weight: 500;
      font-size: 14px;
      color: var(--supply-color-primary-DEFAULT);
      letter-spacing: 0;
      position: relative;
      &::after {
        position: absolute;
        bottom: 4px;
        z-index: 0;
        left: 0;
        opacity: 0.3;
        content: '';
        width: 100%;
        height: 7px;
        background-color: var(--supply-color-primary-hover);
      }
      &__content {
        position: relative;
        z-index: 10;
      }
    }
  }

  &__content {
    padding: 12px 8px;
    position: relative;
    height: calc(100% - 24px);
    background-color: var(--supply-color-bg-card-component);
    border-radius: 3px;
    overflow: hidden;
  }
}
</style>
