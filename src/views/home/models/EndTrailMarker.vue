<template>
  <div :class="['start-marker', `icon-${index}`]">
  </div>
</template>

<script>
import { TRAIL_COLOR } from '../const';

export default {
  name: 'EndMarker',
  data() {
    return {
      color: '',
    };
  },
  computed: {
    index() {
      return TRAIL_COLOR.findIndex((color) => color === this.color)
    }
  }
};
</script>
<style lang="less" scoped>
.start-marker {
  width: 100%;
  height: 100%;
  background-repeat: no-repeat;
  background-size: contain;
  background-position: center;
  pointer-events: none;
  &.icon-0 {
    background-image: url(./assets/blue.png);
  }
  &.icon-1 {
    background-image: url(./assets/green.png);
  }
  &.icon-2 {
    background-image: url(./assets/yellow.png);
  }
  &.icon-3 {
    background-image: url(./assets/blue-dark.png);
  }
  &.icon-4 {
    background-image: url(./assets/orange.png);
  }
}
</style>
