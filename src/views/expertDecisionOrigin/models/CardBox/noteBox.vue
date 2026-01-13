<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-07 15:05:43
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-09-20 10:57:57
 * @Description: 
-->
<template>
  <div class="card-box">
    <div class="card-box__title" :text="title">
      <div class="title-left">
        <img v-if="titleIcon" :src="titleIcon" class="text__icon" />
        <div class="text">
          <span :title="titleTip" class="text__content" v-html="title"></span>
        </div>
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
    titleIcon: {
      type: Object | String,
      default: ''
    },
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
  },
  computed: {
    titleTip() {
      return this.title?.replace(/<[^>]*>|<\/[^>]*>/gm, '') || '';
    }
  }
};
</script>
<style lang="less" scoped>
.card-box {
  padding: 0px 10px 7px;
  position: relative;
  overflow: hidden;
  background-color: var(--supply-color-bg-card-faint);
  height: 100%;
  width: 100%;
  &__title {
    height: 40px;
    display: flex;
    justify-content: space-between;
    .title-left {
      position: relative;
      display: flex;
      align-items: center;
    }
    .text {
      font-weight: 500;
      max-width: 100%;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      font-size: 14px;
      color: var(--supply-color-main);
      letter-spacing: 0;
      position: relative;
      &__icon {
        width: 18px;
        height: 18px;
        margin-right: 5px;
      }
      &::after {
        position: absolute;
        bottom: 4px;
        z-index: 0;
        left: 0;
        opacity: 0.3;
        content: '';
        width: 100%;
        height: 7px;
        background-color: var(--supply-color-invalid);
      }
      &__content {
        position: relative;
        z-index: 10;
        top: -2px;
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
