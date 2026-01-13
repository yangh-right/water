<!--
 * @Author: limz
 * @Date: 2022-07-12 16:07:21
 * @LastEditors:  Do not edit
 * @LastEditTime: 2024-09-27 09:16:10
 * @Description: popup
-->
<template>
  <div class="site-popup">
    <div class="site-popup-name">
      {{ site.entityName }}
    </div>
    <div class="site-popup-info">
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">定位卡ID</span>
        <span class="site-popup-info-list-value">{{ site.cardId }}</span>
        <a @click="viewTracks" class="site-popup-info-list-link">查看轨迹</a>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">定位卡地址</span>
        <span class="site-popup-info-list-value">{{ site.cardAddr }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">人员姓名</span>
        <span class="site-popup-info-list-value">{{ site.entityName }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">人员类型</span>
        <span class="site-popup-info-list-value">{{ site.entityType }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">班组名称</span>
        <span class="site-popup-info-list-value">{{ site.groupName }}</span>
      </div>
      <div class="site-popup-info-list">
        <span class="site-popup-info-list-label">电量</span>
        <span class="site-popup-info-list-value">{{ site.electricity }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SitePopup',
  computed: {},
  data() {
    return {};
  },
  methods: {}
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
