<template>
    <form-model :type="type"></form-model>
</template>

<script>
import formModel from './formModel.vue';
export default {
  name: 'sludgeAnalyse',
  components: { formModel },
  data() {
    return {
      type: '2'
    };
  },
  computed: {},
  mounted() {
  }
};
</script>

<style lang="less" scoped>
</style>
