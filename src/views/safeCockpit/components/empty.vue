<template>
  <div class="emtpy-wrapper">
    <w-empty class="empty"></w-empty>
  </div>
</template>

<script>
export default {
  data() {
    return {};
  },
};
</script>
<style lang="less" scoped>
.emtpy-wrapper {
  width: 100%;
  height: 100%;
  position: relative;
  .empty {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
}
</style>
