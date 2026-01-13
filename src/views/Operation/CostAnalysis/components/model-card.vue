<!--  -->
<template>
  <div class="model-card-view wbgc-card">
    <div class="card-title">
      <p class="title wfc1" v-if="title">{{ title }}</p>
      <slot name="title"></slot>
      <slot name="button"></slot>
    </div>
    <div class="card-content" :name="title" v-loading="loading">
      <slot v-if="empty" name="content"></slot>
      <w-empty v-else></w-empty>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ModelCard',
  data() {
    return {};
  },
  props: {
    title: {
      type: String,
      default: ''
    },
    loading: {
      type: Boolean,
      default: false
    },
    empty: {
      type: Boolean,
      default: false
    }
  }
};
</script>
<style lang="less" scoped>
.model-card-view {
  padding: 16px 24px;
  height: 100%;
  box-shadow: 0 0 6px 0 rgba(0, 0, 0, 0.1);
  .card-title {
    display: flex;
    justify-content: space-between;
    align-items: center;
    height: 20px;
    .title {
      margin-bottom: 0;
      font-family: PingFangSC-Regular, sans-serif;
      font-weight: 400;
      font-size: 14px;
      letter-spacing: 0;
    }
  }
  .card-content {
    width: 100%;
    height: calc(100% - 20px);
    display: flex;
    align-items: center;
    justify-content: center;
  }
}
</style>
