<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-03-25 10:14:28
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-02-14 16:41:40
 * @Description: 
-->
<template>
  <RegionOrOrgSelect
    :hasTypeSwitch="true"
    @init="log"
    @update:type="log"
    @update:selectedKeys="log"
  ></RegionOrOrgSelect>
</template>
<script lang="ts">
import { defineComponent, reactive, toRefs } from '@vue/composition-api';
import RegionOrOrgSelect from '@/components/RegionOrOrgSelect/index.vue';

export default defineComponent({
  components: {
    RegionOrOrgSelect
  },
  setup() {
    const state = reactive({
      hello: 'world'
    });

    function log(msg) {
      console.log(msg);
    }
    return {
      ...toRefs(state),
      log
    };
  }
});
</script>
