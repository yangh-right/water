<!--
 * @Author: wangyr
 * @Date: 2022-08-01 14:20:23
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-10 16:59:50
 * @Description:
-->
<template>
  <w-config-provider :locale="locale">
    <div id="secondary_water_supply" :class="[APP_PREFIX, mapBg ? 'map-bg' : '']">
      <wf-app class="test-class" />
    </div>
  </w-config-provider>
</template>
<script lang="ts">
// @ts-ignore
import locale from '@wpg/design-vue/es/locale/zh_CN';
import 'moment/locale/zh-cn';
import { defineComponent, onActivated } from '@vue/composition-api';
import { APP_PREFIX } from '@/constants';
import { appContext, EntrenceType } from '@/context';
import { mapState } from 'vuex';
export default defineComponent({
  name: 'App',
  props: ['linkToOther', 'closeTab'],
  computed: {
    ...mapState('configure', ['mapBg'])
  },
  provide() {
    const { linkToOther, closeTab } = this;
    return {
      linkToOther,
      closeTab,
      isMicroApp: false,
      systemCode: APP_PREFIX
    };
  },
  setup() {
    appContext.provide(EntrenceType.SINGLE);

    onActivated(() => {});
    return {
      locale,
      APP_PREFIX
    };
  }
});
</script>
<style lang="less">
#secondary_water_supply {
  height: 100%;
  overflow: hidden;
}
@font-face {
  font-family: PingFangSC-Regular;
  src: url(../../assets/fonts/PingFangSC-Regular.woff2);
}

@font-face {
  font-family: PingFangSC-Light;
  src: url(../../assets/fonts/PingFangSC-Light.woff2);
}

@font-face {
  font-family: PingFangSC-Medium;
  src: url(../../assets/fonts/PingFangSC-Medium.woff2);
}

@font-face {
  font-family: PingFangSC-Semibold, sans-serif;
  src: url(../../assets/fonts/PingFangSC-Semibold.woff2);
}
@font-face {
  font-family: Furore;
  src: url(../../assets/fonts/Furore-2.otf);
}
@font-face {
  font-family: YouSheBiaoTiHei;
  src: url(../../assets/fonts/YouSheBiaoTiHei.ttf);
}
</style>
