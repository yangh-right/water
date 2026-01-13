<!--解决a-tab的切换抖动问题-->
<template>
  <w-tabs @change="handleChange" :activeKey="activeKey" v-bind="$attrs">
    <w-tab-pane v-for="(item, index) of tabs" :key="item.key" :tab="item.name">
      <slot :name="`icon${index}`"></slot>
    </w-tab-pane>
  </w-tabs>
</template>

<script>
export default {
  name: 'ChTab',
  model: {
    prop: 'value',
    event: 'change'
  },
  props: {
    value: {
      type: [String, Number],
      default: ''
    },
    tabs: {
      type: Array,
      default() {
        return [
          {
            name: '选项一',
            key: 'name1'
          },
          {
            name: '选项二',
            key: 'name2'
          }
        ];
      }
    }
  },
  data() {
    return {};
  },
  computed: {
    activeKey() {
      return this.value ?? this.tabs[0]?.key;
    }
  },
  methods: {
    handleChange(key) {
      this.$emit('input', key);
      this.$emit('change', key);
    }
  }
};
</script>

<style scoped lang="less"></style>
