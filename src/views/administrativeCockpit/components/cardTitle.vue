<!--
 * @Author: wangyr
 * @Date: 2023-06-15 10:59:17
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-18 14:26:21
 * @Description:
-->
<template>
  <div class="title">
    <div class="title-left">
      <img src="@/assets/administrativeCockpit/title_icon.png" alt="" />
      <div class="title-text">{{ title }}</div>
    </div>
    <div class="title__right">
      <slot name="headerRight"></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'CardTitle',
  components: {},
  props: {
    title: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  computed: {},
  activated() {},
  created() {},
  methods: {}
};
</script>
<style lang="less" scoped>
.title {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 4px;
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
}
</style>
