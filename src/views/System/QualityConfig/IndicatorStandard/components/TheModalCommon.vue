<template>
  <div>
    <w-modal
      :visible="visible"
      :title="title"
      :confirm-loading="confirmLoading"
      width="1000px"
      @ok="handleSubmit"
      :zIndex="zIndex"
      :maskClosable="false"
      @cancel="handleCancel"
    >
      <slot name="header"></slot>
      <div class="top">
        <span class="wfc2 top-item"
          >水质指标：<span class="wfc1">{{ info && info.indexName }}</span></span
        >
        <span class="wfc2 top-item"
          >构筑物：<span class="wfc1">{{ info && info.structureName }}</span></span
        >
        <span class="wfc2 top-item"
          >点位：<span class="wfc1">{{ info && info.pointLocation }}</span></span
        >
        <slot name="topExtra"></slot>
      </div>

      <slot name="content"></slot>
    </w-modal>
  </div>
</template>

<script>
export default {
  props: {
    /* 模态框属性 */
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: undefined
    },
    confirmLoading: {
      type: Boolean,
      default: false
    },
    zIndex: {
      type: Number,
      default: 1000
    },
    info: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {};
  },
  methods: {
    /* 模态框方法 */
    handleSubmit() {
      this.$emit('submit');
    },
    handleCancel() {
      this.$emit('cancel');
    }
  }
};
</script>

<style lang="less" scoped>
.top {
  background: #f9fafb;
  border-radius: 4px;
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  padding: 24px;
  display: flex;
  flex-wrap: wrap;
  &-item {
    width: 32%;
  }
}
</style>
