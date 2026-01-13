<!--
 * @Date: 2021-08-02 11:02:01
 * @Version: 1.0.0
 * @Author: chenhengling
 * @Description:
 * @LastEditTime: 2021-10-26 15:41:39
 * @LastEditors: limz
-->
<template>
  <Wave :color="color" />
</template>

<script>
import Vue from "vue";
import Wave from "./Wave.vue";

export default Vue.extend({
  name: 'SiteMarker',
  components: {
    Wave
  },
  data() {
    return {
      color: ''
    };
  },
});
</script>
