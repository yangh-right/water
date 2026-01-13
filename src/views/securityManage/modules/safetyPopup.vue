<!--
 * @Author: limz
 * @Date: 2022-07-12 16:07:21
 * @LastEditors: wangyr
 * @LastEditTime: 2024-12-10 16:56:08
 * @Description: popup
-->
<template>
  <div class="site-popup">
    <div class="site-popup-name">
      {{ site.entityName }}
    </div>
    <div class="site-popup-info">
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">用户</span>
        <span class="site-popup-info-list-value">{{ site.user_info.user_name }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">设备</span>
        <span class="site-popup-info-list-value">{{ site.user_info.device_id }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">信号强度</span>
        <span class="site-popup-info-list-value">{{
          handleGpsLevel(site.location_info.gps_level)
        }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">定位类型</span>
        <span class="site-popup-info-list-value">{{ handleGps(site.location_info.gps) }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">已用流量</span>
        <span class="site-popup-info-list-value">{{ site.location_info.sim_data_num }}MB</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SitePopup',
  computed: {},
  data() {
    return {
      address: ''
    };
  },
  methods: {
    handleGps(gps) {
      switch (gps) {
        case '0':
          return '基站';
        case '1':
          return 'gps';
        case '2':
          return 'wifi';
        default:
          return '其他';
      }
    },
    handleGpsLevel(gps_level) {
      switch (gps_level) {
        case '0':
          return '弱';
        case '1':
          return '强';
        case '-1':
          return '无信号';
        default:
          return '';
      }
    }
  }
};
</script>

<style lang="less" scoped>
.site-popup {
  width: 250px;
  &-name {
    width: 120px;
    height: 32px;
    background: url('~@/assets/images/default/hz/person_info_name_bg.png') no-repeat;
    line-height: 32px;
    text-align: center;
    font-style: oblique;
    font-weight: 700;
    font-size: 18px;
    color: #f5faff;
    letter-spacing: 0;
  }
  &-info {
    min-height: 220px;
    background: url('~@/assets/images/default/hz/person_info_bg.png') no-repeat;
    background-size: 100% 100%;
    background-attachment: fixed;
    padding: 8px 20px;
    &-list {
      margin-top: 8px;
      line-height: 20px;
      font-family: PingFangSC-Medium, sans-serif;
      font-weight: 500;
      font-size: 14px;
      color: #f5faff;
      letter-spacing: 0;
      &-label {
        width: 56px;
        margin-right: 16px;
        color: #eaf4ff;
      }
      &-value {
        color: #9bb9dc;
        max-width: 180px;
      }
      &-link {
        color: #86ccff;
        margin-left: 24px;
      }
    }
  }
}
</style>
