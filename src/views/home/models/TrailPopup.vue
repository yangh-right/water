<template>
  <div v-if="visible" class="trail-popup supply-bg-white supply-p-2">
    <div class="trail-title" :style="{ backgroundColor: trail.color }"></div>
    <div>{{ trail.name }}</div>
    <div class="supply-text-gray-400 supply-my-2">{{ trail.address }}</div>
    <div class="supply-text-gray-400 supply-my-2">{{ showDate }}</div>
  </div>
</template>

<script>
import Vue from 'vue';
import moment from "moment";

export default Vue.extend({
  name: 'TrailPopup',
  data() {
    return {
      visible: false,
      trail: {
        address: '',
        date: '',
        color: '',
        name: '',
      }
    };
  },
  computed: {
    showDate() {
      return moment(this.trail.date).format('YYYY-MM-DD HH:mm')
    }
  },
  methods: {
  }
});
</script>
<style lang="less" scoped>
.trail-popup {
  transform: translateY(-100%);
  width: 140px;
  border-radius: 4px;
  overflow: hidden;
  .trail-title {
    height: 4px;
    position: absolute;
    width: 100%;
    top: 0;
    left: 0;
  }
}
</style>
