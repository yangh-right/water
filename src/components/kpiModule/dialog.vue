<template>
  <w-modal v-model="visible" title="指标分析形式预览" :width="794" okText="确认" :footer="null">
    <kpi-module />
  </w-modal>
</template>

<script>
export default {
  name: 'KpiPreviewDialog',
  components: {
    KpiModule: () => import('./index.vue'),
  },
  props: {
    showType: {
      type: String,
      default: '1',
    },
  },
  data() {
    return {
      visible: false,
    };
  },
  watch: {
    visible(val) {
      if (val) {
      }
    },
  },
  methods: {},
};
</script>

<style lang="less" scoped></style>
