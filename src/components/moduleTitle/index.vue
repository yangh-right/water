<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-02-10 11:49:30
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-10 16:16:56
 * @Description: 
-->
<template>
  <p class="moduleTitle">
    <slot />
  </p>
</template>

<script>
export default {
  name: 'ModuleTitle',
  props: {
    title: String,
  },
};
</script>

<style lang="less" scoped>
.moduleTitle {
  color: var(--mft-5-cls);

  .prefixBlock();
}
</style>
