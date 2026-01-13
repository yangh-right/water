<template>
  <div class="point">
    <div class="card card0">
      <sandBucketInfo v-bind="$attrs"></sandBucketInfo>
    </div>
    <div class="card card1">
      <optimizeSuggest v-bind="$attrs"></optimizeSuggest>
    </div>
  </div>
</template>

<script>
import sandBucketInfo from './sandBucketInfo';
import optimizeSuggest from './optimizeSuggest';
export default {
  components: { sandBucketInfo, optimizeSuggest },
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.point {
  height: 100%;
  width: 100%;
  display: flex;
  justify-content: space-between;
  .card {
    height: 100%;
    width: calc(50% - 6px);
  }
}
</style>
