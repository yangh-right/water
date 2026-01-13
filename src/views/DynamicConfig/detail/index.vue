<!--
 * @Author: 张苗苗
 * @Date: 2022-09-19 08:59:22
 * @LastEditors: 张苗苗
 * @LastEditTime: 2022-09-29 10:00:18
 * @FilePath: /water-work-front/src/views/DynamicConfig/detail/index.vue
 * @Description:
-->
<template>
  <div>
    <template v-for="item of currentMenu">
      <common :key="item.path" v-if="$route.path === item.path" :path="item.path" />
    </template>
  </div>
</template>
<script>
import common from './common.vue';
import { mapGetters } from 'vuex';
export default {
  components: { common },
  inject: ['state'],
  computed: {
    ...mapGetters('user', ['allMenus']),
    currentMenu() {
      // 获取全部的 菜单
      const allList = this.allMenus.filter((item) => item.component === 'DynamicConfig/detail');
      // 过滤掉只打开tab的
      console.log('allList', allList);
      return allList.filter((item) => this.state.tabs.some((tab) => tab.key === item.path));
    }
  }
};
</script>
