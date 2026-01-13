<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-07-06 17:07:16
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-07 20:33:50
 * @Description: 
-->
<template>
  <div class="progress">
    <div
      :style="{ backgroundColor: color, width: setWidth(percent) }"
      class="progress__item"
    ></div>
  </div>
</template>

<script>
export default {
  name: 'CustomProgress',
  props: {
    percent: {
      type: Number,
      default: 0
    },
    color: {
      type: String,
      default: '#5B8FF9'
    }
  },
  data() {
    return {};
  },

  components: {},

  computed: {},

  mounted() {},

  methods: {
    setWidth(value) {
      let percent = value < 0 ? 0 : (value > 1 ? 1 : value)
      return percent * 100 + '%'
    },
  }
};
</script>
<style lang="less" scoped>
.progress {
  width: 100%;
  background-color: #e8ecf5;
  height: 8px;
  &__item {
    height: 100%;
  }
}
</style>
