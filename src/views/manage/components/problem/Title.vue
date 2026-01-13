<template>
  <div class="block-title">
    <i class="title-icon"></i>
    <span><slot></slot></span>
  </div>
</template>
<style lang="less" scoped>
.block-title {
  color: var(--supply-color-main);
  .title-icon {
    width: 4px;
    height: 12px;
    display: inline-block;
    margin-right: 5px;
    background-color: var(--supply-color-primary-DEFAULT);
  }
}
</style>
