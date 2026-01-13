<!--
 * @Author: wangyr
 * @Date: 2023-02-28 08:51:49
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-22 13:33:30
 * @Description:
-->
<template>
  <div class="empty">
    <p class="empty-pic">
      <img :src="$require(`@/assets/images/{{theme}}/deci-em.png`)" alt="暂无数据图片" />
    </p>
    <!-- <p class="empty-tip wfc3">{{ tip }}</p> -->
    <slot></slot>
  </div>
</template>

<script>
import { assetsRequire } from '@/core/mixins';
export default {
  name: 'Empty',
  props: {
    tip: {
      type: String,
      default: '暂无数据'
    }
  },
  inject: ['state'],
  mixins: [assetsRequire]
};
</script>

<style scoped lang="less">
.empty {
  display: flex;
  flex: 1;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 30px 0;

  &-pic {
    height: 190px;
    overflow: hidden;

    img {
      height: 100%;
    }
  }

  &-tip {
    margin-top: 12px;
    font-size: 14px;
  }
}
</style>
