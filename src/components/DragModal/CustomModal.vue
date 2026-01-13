<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-24 14:07:11
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-10-13 17:27:08
 * @Description:
-->
<template>
  <w-modal
    class="select-dialog secondary-modal"
    :visible="visible"
    :mask-closable="maskClosable"
    centered
    :destroyOnClose="destroyOnClose"
    :width="width"
    v-bind="$attrs"
    @ok="handleOk"
    @cancel="cancel"
  >
    <slot></slot>
  </w-modal>
</template>

<script>
export default {
  props: {
    width: {
      type: Number,
      default: 1200
    },
    maskClosable: {
      type: Boolean,
      default: false
    },
    destroyOnClose: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      visible: false
    };
  },
  watch: {},
  methods: {
    handleOk() {
      this.$emit('ok');
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    }
  }
};
</script>

<style lang="less" scoped>
.select-dialog {
  position: relative;
  &__wrap {
    /deep/ .table-warp {
      flex: unset;
      height: 480px;
      .wpg-table-header {
        min-height: 40px;
      }
      .wpg-table {
        .wpg-table-placeholder {
          position: absolute;
          top: 50%;
          transform: translate(-50%, -50%);
          left: 50%;
        }
      }
      .wpg-table-body {
        min-height: 380px;
      }
    }
  }

  /deep/ .wpg-modal-body {
    padding: 0 28px;
  }
}
</style>
