<!--
 * @Author: chenzh
 * @Date: 2021-01-20 14:06:23
 * @LastEditTime: 2022-06-24 14:20:17
 * @LastEditors: yuan wenyu
 * @Description:
 * @FilePath: /wisdomwatervue/src/views/order/models/PumpDialog.vue
-->
<template>
  <w-modal
    class="device-component-dialog secondary-modal"
    title="查看污水厂"
    :visible="visible"
    :confirm-loading="confirmLoading"
    :width="800"
    okText="确认"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div class="pump-table">
      <pump-tree :value="pumpData.value" :readonly="true" />
    </div>
  </w-modal>
</template>

<script>
export default {
  props: {
    pumpData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      confirmLoading: false,
      visible: false
    };
  },

  watch: {
    visible(val) {}
  },

  methods: {
    handleOk() {
      this.visible = false;
    },

    handleCancel() {
      this.visible = false;
    }
  }
};
</script>

<style lang="less" scoped>
.device-component-dialog {
}
</style>
