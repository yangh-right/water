<template>
  <div>
    <w-tooltip placement="bottom">
      <span slot="title">{{ isPlayAudio ? '关闭语音' : '打开语音' }}</span>
      <w-icon class="supply-text-white" style="font-size: 24px;" :type="iconType" @click="togglePlayAudio" />
    </w-tooltip>
  </div>
</template>
<script>
import { mapState, mapActions } from 'vuex';
export default {
  name: 'TabPlayAudio',
  data() {
    return {};
  },
  computed: {
    iconType() {
      return this.isPlayAudio ? 'ic_volume_up' : 'ic_volume_off';
    },
    ...mapState('page', ['isPlayAudio'])
  },
  methods: {
    ...mapActions('page', ['opened2db']),
    togglePlayAudio() {
      this.$store.commit('page/setPlayAudio', !this.isPlayAudio);
      this.opened2db();
    }
  }
};
</script>
