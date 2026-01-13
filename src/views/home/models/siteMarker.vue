<!--
 * @Date: 2021-08-02 11:02:01
 * @Version: 1.0.0
 * @Author: chenhengling
 * @Description:
 * @LastEditTime: 2021-10-26 15:41:39
 * @LastEditors: limz
-->
<template>
  <div class="siteMarker">
    <p class="siteMarker-icon">
      <img :src="siteIcon" alt="" />
    </p>
    <!-- <div class="siteMarker-name supply-text-xs supply-text-primary">{{site.siteName}}</div> -->
  </div>
</template>

<script>
import serverConfig from '@/config/server.config';

export default {
  name: 'SiteMarker',
  data() {
    return {
      site: {},
      siteLegend: []
    };
  },
  computed: {
    siteIcon() {
      const site = this.site;
      const item = this.siteLegend.find(v => v.id === site.siteTypeId);

      if (item) {
        return site.isOff
          ? require('@/assets/images/default/map/offline_site.png')
          : site.isAlarm
          ? serverConfig.IMG_BASE_URL + item.alarmIcon
          : serverConfig.IMG_BASE_URL + item.normalIcon;
      }
      return null;
    }
  }
};
</script>

<style scoped lang="less">
.siteMarker {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  flex-direction: column;
  justify-content: center;
  font-size: 24px;
  position: relative;

  &-icon {
    width: 100%;
    height: 100%;
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;

    img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }
  }
  &-name {
    // width: 85px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
}
</style>
