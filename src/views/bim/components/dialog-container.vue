<!--
 * @Author: wangyr
 * @Date: 2023-07-12 09:31:07
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-12 10:48:20
 * @Description:
-->
<template>
  <div v-if="visible" class="my-dialog" :style="{ display: visible ? 'block' : 'none' }">
    <div class="my-dialog-header">
      <div>{{ title }}</div>
      <img class="close-img" @click="close" src="@/assets/images/default/close.png" />
    </div>
    <div class="my-dialog-body">
      <slot></slot>
    </div>
  </div>
</template>

<script>
export default {
  name: 'dialog-container',
  components: {},
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    title: {
      type: String,
      default: '标题'
    }
  },
  data() {
    return {};
  },
  computed: {},
  methods: {
    close() {
      this.$emit('update:visible', false);
    },
    repair() {
      this.$parent.creatTicket();
    },
    closeModalInrepair() {
      this.$parent.closeModelInrepair();
    },
    showCode(info) {
      this.$parent.showCode(info);
    }
  },
  mounted() {}
};
</script>
<style lang="less" scoped>
.my-dialog {
  position: fixed;
  width: 700px;
  height: 446px;
  top: 50%;
  left: 50%;
  margin-top: -220px;
  margin-left: -350px;
  backdrop-filter: blur(10px);
  border: 2px solid #0780a5;
  box-shadow: inset 0px 0px 20px 0px rgba(34, 150, 255, 0.6);
  background: rgba(2, 43, 67, 0.5);
  .my-dialog-header {
    background-image: url('~@/assets/images/default/tit_tk.png');
    background-size: 656px 100%;
    background-repeat: no-repeat;
    background-position: top left;
    margin-left: -2px;
    position: relative;
    height: 45px;
    font-size: 18px;
    color: #c9ecff;
    font-weight: 700;
    display: flex;
    align-items: center;
    padding-left: 36px;
    .close-img {
      width: 28px;
      height: 28px;
      cursor: pointer;
      position: absolute;
      right: 12px;
    }
  }
  .my-dialog-body {
    height: 400px;
    padding: 20px;
    position: relative;
    overflow: hidden;
  }
}

.repair-btn {
  position: absolute;
  top: 10px;
  right: 70px;
  z-index: 9;
}
</style>
