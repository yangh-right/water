<!--
 * @Description:
 * @version:
 * @Author: fengtaotao
 * @Date: 2023-05-23 14:29:38
 * @LastEditors: fengtaotao
 * @LastEditTime: 2023-05-30 13:49:12
-->
<template>
  <div :class="currentStep === data[index].dictValue ? 'step active' : 'step'" @click="changeStep">
    <div v-if="index !== 0" :class=" isDark ? 'left dark' : 'left'"></div>
    <div :class="currentStep === data[index].dictValue ? 'active-middle middle' : 'middle'">
      <div :class="currentStep === data[index].dictValue ? 'active-order order' : 'order'">{{ index+1 }}</div>
      <div
        :class="currentStep === data[index].dictValue ? 'active-text text' : 'text'"
      >{{ data[index].dictName }}</div>
    </div>
    <div v-if="index !== data.length-1" :class="currentStep === data[index].dictValue ? 'active-right right' : 'right'"></div>
  </div>
</template>
<script>
export default {
  name: 'Step',
  inject: ['state'],
  props: {
    index: {
      type: Number,
      default: 0,
    },
    currentStep: {
      type: String,
      default: '1',
    },
    data: {
      type: Array,
      default: () => [],
    },
  },
  computed: {
    isDark() {
      return this.state.theme === 'dark';
    },
  },
  data() {
    return {};
  },
  created() {
  },
  methods: {
    changeStep() {
      this.$emit('changeStep', this.data[this.index].dictValue);
    },
  },
};
</script>

<style lang="less" scoped>
.step {
  width: 236px;
  margin-bottom: 10px;
  position: relative;
  display: flex;
  cursor: pointer;
}
.active {
  //border:1px solid #4285f4;
}
.middle {
  width: 220px;
  height: 40px;
  background: #f7f7f7;
  display: flex;
  align-items: center;
  justify-content: center;
  .order {
    width: 20px;
    height: 20px;
    border-radius: 20px;
    background: #cccccc;
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  }
  .active-order {
    background: #4285f4;
    color: #fff;
  }
}
.active-middle{
  background:#eaf1fb;
}
.text {
  margin-left: 6px;
  display: inline-block;
  color: #333;
}
.active-text {
  color: #4285f4;
}
.right {
  width: 0;
  height: 0;
  border: 20px solid transparent;
  border-left: 15px solid #f7f7f7;
}
.active-right{
  border-left: 15px solid #eaf1fb;
}

.left {
  position: absolute;
  width: 0;
  height: 0;
  border: 20px solid transparent;
  border-left: 15px solid #fff;
}
.dark{
  border-left: 15px solid #181c24;
}
.step:hover {
  .middle {
    background: #eaf1fb;
  }
  .right {
    border-left: 15px solid #eaf1fb;
  }
}
</style>
