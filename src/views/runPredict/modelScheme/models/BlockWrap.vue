<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-15 10:20:47
-->
<template>
  <div class="content">
    <div class="content-header">
      <div>
        <span class="content-title">{{ title }}</span
        ><slot name="left" />
      </div>
      <slot name="right" />
    </div>
    <div class="content-body">
      <slot></slot>
    </div>
  </div>
</template>
<script>
export default {
  name: 'BlockWrap',
  props: {
    title: {
      type: String,
      default: ''
    },
    showDate: {
      type: Boolean,
      default: false
    }
  },
  components: {},
  data() {
    return {};
  },
  methods: {}
};
</script>

<style lang="less" scoped>
.content {
  background: var(--supply-color-bg-card-DEFAULT);
  border-radius: 4px;
  margin-bottom: 12px;
  padding: 15px 12px 12px;
  &-header {
    width: 100%;
    padding-bottom: 8px;
    display: inline-flex;
    justify-content: space-between;
    align-items: center;
  }
  &-title {
    font-weight: 600;
    font-size: 16px;
    line-height: 22px;
    color: var(--supply-color-main);
    letter-spacing: 0;
  }
  &-body {
    height: calc(100% - 40px);
  }
  .form-item {
    margin-top: 10px;
    width: 80px;
    display: flex;
    justify-content: space-between;
    align-items: center;
  }

  .tabs {
    padding: 0 12px;
    display: flex;
    justify-content: flex-start;
    align-items: center;
    cursor: pointer;
    .tab {
      height: 24px;
      line-height: 24px;
      margin-right: 8px;
      display: flex;
      justify-content: center;
      align-items: center;
      padding: 0 15px;
      background: #f4f6f8;
      color: #666666;
      border-radius: 12px;
      font-size: 14px;
    }
    .active {
      color: #5b8ff9;
      background: #5b8ff91a;
    }
  }
  .spin {
    height: calc(100% - 44px);
  }
  .chart-wrapper {
    height: 100%;
    padding: 0 0 10px;
  }
  .table-wrapper {
    padding: 0 12px;
    box-sizing: border-box;
    margin: 0;
  }
  .empty {
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
  }
  /deep/ .wpg-select-selection--single {
    height: 32px;
  }
  /deep/ .wpg-spin-container {
    height: 100%;
  }
}
</style>
