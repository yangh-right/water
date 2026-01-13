<template>
  <DeviceEdit :type="type"></DeviceEdit>
</template>

<script>
import DeviceEdit from '../edit/index'
export default {
  name: "DeviceAdd",
  components: { DeviceEdit },
  props: {},
  data() {
    return {
      type: this.$route.query.type,
    };
  },
  computed: {},
  methods: {},
  mounted() {
  },
};
</script>
<style lang="scss" scoped>
</style>
