<template>
  <div class="ticket-signin">
    <div v-if="readonly" class="ticket-sign-status">
      <div v-if="value">已签到 <a @click="showMap">查看位置</a></div>
      <div v-else></div>
    </div>
    <div v-else></div>

    <map-dialog ref="mapDialog" :point="point" />
  </div>
</template>

<script>
import MapDialog from '@/components/InputAddress/MapDialog';

export default {
  name: 'TicketSignin',

  components: {
    MapDialog
  },

  props: {
    value: {
      type: Object,
      default: null
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      point: null
    };
  },

  methods: {
    handleSignIn() {},

    handleUpdate(value) {
      console.log(value);
    },

    showMap() {
      this.point = {
        lng: this.value.appealLng,
        lat: this.value.appealLat
      };
      this.$refs.mapDialog && (this.$refs.mapDialog.visible = true);
    }
  }
};
</script>

<style lang="less" scoped>
.ticket-signin {
  &-status {
    a {
      margin-left: 12px;
    }
  }
}
</style>
