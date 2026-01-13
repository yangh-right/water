<!--
 * @Description:
 * @version:
 * @Author: liuct
 * @Date: 2021-08-20 09:35:03
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-09-14 14:43:17
-->
<template>
  <div v-if="background" class="configuration-toolbar">
    <w-icon v-if="showAside" type="double-right" @click="toggleRightAside" />
    <w-icon v-else type="double-left" @click="toggleRightAside" />
    <w-icon type="edit" @click="showSvgElementDialog" />
    <w-icon v-if="!isComponentEdit" type="highlight" @click="drawLine" />
    <w-icon v-if="!isComponentEdit" type="minus-square" @click="stopDraw" /> 
  </div>
</template>

<script>
import Bus from '../Bus.js';
export default {
  name: 'ConfigurationToolbar',
  inject: ['isComponentEdit'],
  props: {
    showAside: {
      type: Boolean
    },
    background: {
      type: String,
      default: ''
    }
  },
  data() {
    return {};
  },
  methods: {
    toggleRightAside() {
      this.$emit('toggleAside');
    },

    showSvgElementDialog() {
      this.$emit('btnClick', 'showSvgElementDialog', '');
    },

    drawLine() {
      Bus.$emit('drawLine', '');
    },

    stopDraw() {
      Bus.$emit('stopDraw', '');
    },


  }
};
</script>

<style lang="less" scoped>
.configuration-toolbar {
  text-align: center;

  .anticon {
    margin: 8px 0;
    font-size: 20px;
    cursor: pointer;
  }
}
</style>
