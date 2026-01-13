<template>
  <label class="upload">
    <w-spin v-if="loading" tip="上传中..."> </w-spin>
    <div v-else class="upload">
      <input class="upload" type="file" :accept="accept" @change="change" />
      <w-icon type="plus" />
      <div class="ant-upload-text">
        <slot />
      </div>
    </div>
  </label>
</template>
<script>
import Vue from 'vue';

export default Vue.extend({
  props: {
    acceptList: {
      type: Array,
      default: () => []
    },
    loading: {
      type: Boolean,
      default: false
    }
  },
  computed: {
    accept() {
      return this.acceptList.join(', ') || '*';
    }
  },
  methods: {
    change(event) {
      this.$emit('change', event);
    }
  }
});
</script>

<style lang="less" scoped>
.upload {
  cursor: pointer;
  input {
    display: none;
  }
  border: 1px dashed var(--supply-color-icon-bg-default);
  background: var(--supply-color-bg-card-light);
  color: var(--supply-color-icon-bg-default);
  width: 150px;
  height: 120px;
  margin: 12px;
  display: flex;
  flex-flow: column;
  justify-content: center;
  align-items: center;
  flex: none;
  &:hover {
    border: 1px dashed var(--supply-color-primary-hover);
    color: var(--supply-color-primary-hover);
  }
  &:active {
    border: 1px dashed var(--supply-color-primary-active);
    color: var(--supply-color-primary-active);
  }
}
</style>
