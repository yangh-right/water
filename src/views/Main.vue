<template>
  <div class="basic">
    <!-- 内容模块 -->
    <keep-alive>
      <router-view />
    </keep-alive>
  </div>
</template>

<script>
export default {
  name: 'MainPage'
};
</script>

<style lang="less" scoped>
.basic {
  height: 100%;
}
</style>
