<template>
  <div :data-wpg-theme="state.theme" class="supply-toolbar">
    <AutoComplete />
  </div>
</template>

<script>
import AutoComplete from '@/components/Toolbar/AutoComplete.vue'
export default {
  name: 'App',
  components: {
    AutoComplete,
  },
  props: ['state'],
  data() {
    return {};
  }
};
</script>

<style lang="less">
.supply-toolbar {
  ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
}
</style>
