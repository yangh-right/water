<template>
  <div class="wave">
    <div
      class="circle outer"
      :style="{
        background: color
      }"
    ></div>
    <div
      class="circle middle"
      :style="{
        background: color
      }"
    ></div>
    <div
      class="circle inner"
      :style="{
        background: color
      }"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'Wate',
  props: ['color'],
};
</script>
<style lang="less" scoped>
.wave {
  width: 100%;
  height: 100%;
  position: relative;
  pointer-events: none;
  .circle {
    position: absolute;
    width: 5px;
    height: 5px;
    border-radius: 50%;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    animation-name: wave;
    animation-duration: 3s;
    animation-iteration-count: infinite;
  }

  .inner {
    animation-delay: 0s;
  }
  .middle {
    animation-delay: 1s;
  }
  .outer {
    animation-delay: 2s;
  }
}

@keyframes wave {
  0% {
    width: 5px;
    height: 5px;
    opacity: 1;
  }
  100% {
    width: 100%;
    height: 100%;
    opacity: 0;
  }
}
</style>
