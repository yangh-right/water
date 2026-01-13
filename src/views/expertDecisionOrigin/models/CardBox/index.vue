<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:05:43
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-06-26 19:37:53
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
    padding-left: 16px;
    height: 34px;
    display: flex;
    justify-content: space-between;
    .text {
      color: var(--supply-color-deviate);
      font-weight: 500;
      line-height: 16px;
      margin-top: 16px;
      font-size: 16px;
    }
  }

  &__content {
    padding: 12px 16px 12px;
    position: relative;
    height: calc(100% - 34px);
  }
}
</style>
