<template>
  <wpg-frame
    :token="token"
    :sys-code="sysCode"
    :frame-host="frameHost"
    :frame-mapping="frameMapping"
    @closeTab="handleCloseTab"
    @goto="handleGoto"
    @logout="handleLogout"
  />
</template>

<script>
import { mapState } from 'vuex';
import WpgFrame from './frame.vue';
import { accessToken } from '@wpg/framework-vue';
import { APP_PREFIX } from '@/constants';

export default {
  name: 'index',
  components: { WpgFrame },
  inject: ['closeTab', 'logout'],
  data() {
    return {
      token: accessToken.get(),
      sysCode: APP_PREFIX,
      frameHost: '10.10.102.39:8877'
    };
  },
  computed: {
    ...mapState('setting', ['frameMapping'])
  },
  methods: {
    /**
     * @description: 处理closeTab
     * @return {*}
     */
    handleCloseTab() {
      this.closeTab(this.$route.path, false);
    },

    /**
     * @description: 处理goto
     * @param {*} data
     * @return {*}
     */
    handleGoto(data) {
      this.goto(data);
    },

    /**
     * @description: 处理logout
     * @return {*}
     */
    handleLogout() {
      this.logout();
    }
  }
};
</script>
