<template>
  <div class="rectangle-title">
    <div class="text" :title="title">{{ title }}</div>
  </div>
</template>

<script>
export default {
  name: "rectangleTitle",
  props: {
    title: {
      type: String,
      default: "",
    },
  },
  data() {
    return {};
  },
};
</script>
<style lang="less" scoped>
.rectangle-title {
  line-height: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  .text {
    color: var(--supply-color-main);
    font-weight: 500;
    font-size: 16px;
    &::before {
      content: "";
      background-color: #87ce40;
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
</style>
