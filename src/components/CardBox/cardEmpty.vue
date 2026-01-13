<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-05-10 15:07:11
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-05-17 10:17:00
 * @Description: 
-->
<template>
  <div class="card__empty">
    <div class="notAvailable">
      <img src="@/assets/images/modules/discharge/notAvailable.png" alt="" />
      <span class="empty-description">{{ description }}</span>
    </div>
  </div>
</template>

<script>
export default {
  props: {
    description: {
      type: String,
      default: '暂无图表数据'
    }
  },
  data() {
    return {};
  }
};
</script>
<style lang="less" scoped>
.card__empty {
  width: 100%;
  height: 100%;
  position: relative;
  .notAvailable {
    height: 100%;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-direction: column;
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    img {
      height: 100%;
    }
    .empty-description {
      color: #bfd9f8;
      position: relative;
      top: -12px;
    }
  }
}
</style>
