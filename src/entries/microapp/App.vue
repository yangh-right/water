<!--
 * @Author: wangyr
 * @Date: 2023-04-11 11:33:16
 * @LastEditors: wangyr
 * @LastEditTime: 2024-09-06 18:16:31
 * @Description:
-->
<template>
  <w-config-provider :locale="locale">
    <div
      id="secondary_water_supply"
      :class="['microapp', 'secondary_water_supply', mapBg ? 'map-bg' : '']"
    >
      <wf-microapp />
      <!-- 此处插入frame节点 -->
      <wpg-frame />
    </div>
  </w-config-provider>
</template>
<script lang="ts">
import { defineComponent } from '@vue/composition-api';
// @ts-ignore
import locale from '@wpg/design-vue/es/locale/zh_CN';
import WpgFrame from '@/views/Iframe/index.vue';
import 'moment/locale/zh-cn';
import { appContext, EntrenceType } from '@/context';
import { mapState } from 'vuex';

export default defineComponent({
  name: 'App',
  props: ['closeTab', 'state', 'setState', 'logout', 'setTheme', 'setLayout', 'linkToOther'],
  components: { WpgFrame },
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
      isMicroApp: true
    };
  },
  setup() {
    appContext.provide(EntrenceType.MICRO_APP);
    return {
      locale
    };
  }
});
</script>
<style lang="less" scoped>
.microapp {
  height: 100%;
  overflow: hidden;
}
#secondary_water_supply {
  padding: 0 12px 12px;
}
</style>
