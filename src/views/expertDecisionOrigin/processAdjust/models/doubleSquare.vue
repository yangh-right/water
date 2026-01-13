<template>
  <div class="icon">
    <div class="square square__left"></div>
    <div class="square square__right"></div>
  </div>
</template>

<script>
export default {
  components: {},
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.icon {
  position: relative;
  top: 6px;
  .square {
    width: 8px;
    height: 8px;
    &__left {
      background-color: var(--supply-color-online-bg);
    }
    &__right {
      position: relative;
      top: -11px;
      left: 3px;
      background-color: var(--supply-color-primary-DEFAULT);
    }
  }
}
</style>
