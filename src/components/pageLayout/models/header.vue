<template>
  <div class="page-header wbgc-card">
    <div class="page-header__left">
      <p v-if="title" class="page-header__title wfc-unusual wfs16">{{ title }}</p>
      <slot name="header-left" />
    </div>
    <div class="page-header__right">
      <slot name="header-right" />
    </div>
  </div>
</template>

<script>
export default {
  name: 'PageHeader',
  inheritAttrs: false,
  props: {
    title: String,
  },
};
</script>

<style lang="less" scoped>
.page-header {
  display: flex;
  flex: none;
  align-items: center;
  justify-content: space-between;
  height: 56px;
  padding: 0 25px;
  border-radius: 4px;

  &__left,
  &__right {
    display: flex;
    align-items: center;
  }

  &__title {
    &::before {
      display: inline-block;
      width: 5px;
      height: 14px;
      margin-right: 8px;
      vertical-align: -1px;
      content: '';
      background-color: #87ce40;
    }
  }
}
</style>
