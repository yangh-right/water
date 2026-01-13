<!--
 * @Author: wangyr
 * @Date: 2023-05-30 13:40:08
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-12-05 15:52:11
 * @Description:
-->
<template>
  <div class="container">
    <div class="card-title">
      <div class="title-left">
        <img src="@/assets/safeCockpit/title_icon.png" alt="" />
        <div class="title-text">{{ cardTitle }}</div>
      </div>
      <div class="card-title__right">
        <slot name="headerRight"></slot>
      </div>
    </div>
    <div class="card-content">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CockpitCard',
  props: {
    cardTitle: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  methods: {}
};
</script>

<style lang="less" scoped>
.container {
  width: 100%;
  height: 100%;
  position: relative;

  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    .title-left {
      display: flex;
      align-items: center;
      justify-content: flex-start;
      .title-text {
        font-family: PingFangSC-Medium, sans-serif;
        font-weight: 500;
        font-size: 16px;
        color: var(--supply-color-main);
        letter-spacing: 0;
      }
      img {
        width: 22px;
        height: 22px;
        margin-right: 5px;
      }
    }
    &__right {
      position: absolute;
      right: 0;
    }
  }
  .card-content {
    width: 100%;
    height: calc(100% - 32px);
    position: relative;
  }
}
</style>
