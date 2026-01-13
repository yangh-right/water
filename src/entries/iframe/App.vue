<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-28 12:11:00
 * @LastEditTime: 2023-01-31 09:42:37
 * @LastEditors: Do not edit
-->
<template>
  <w-config-provider :locale="locale">
    <div :id="`${APP_PREFIX}`" :class="[`microapp ${APP_PREFIX}-app`, mapBg ? 'map-bg' : '']">
      <wf-microapp />
    </div>
  </w-config-provider>
</template>
<script lang="ts">
import { appContext, EntrenceType } from '@/context';
import { defineComponent } from '@vue/composition-api';
// @ts-ignore
import locale from '@wpg/design-vue/es/locale/zh_CN';
import { APP_PREFIX } from '@/constants';
import { mapState } from 'vuex';
export default defineComponent({
  name: 'App',
  props: ['closeTab', 'state', 'setState', 'logout', 'setTheme', 'setLayout', 'linkToOther'],
  computed: {
    ...mapState('configure', ['mapBg'])
  },
  provide() {
    // eslint-disable-next-line no-unused-vars
    const { closeTab, state, setState, logout, setTheme, setLayout, linkToOther } = this;
    return {
      closeTab,
      state,
      setState,
      logout,
      setTheme,
      setLayout,
      linkToOther,
      isMicroApp: false
    };
  },
  setup() {
    appContext.provide(EntrenceType.SINGLE);
    return {
      locale,
      APP_PREFIX
    };
  }
});
</script>
<style lang="less">
body {
  background-color: transparent !important;
}
</style>
<style lang="less" scoped>
.microapp {
  height: 100%;
  overflow: hidden;
}
</style>
