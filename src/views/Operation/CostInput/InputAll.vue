<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-04-12 09:16:11
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-04-18 17:08:27
 * @Description:
-->
<template>
  <section class="full-view">
    <template v-for="menu in menuList">
      <div class="full-view" :key="menu.id" v-if="$route.path === menu.path">
        <cost-list :title="menu.name" :outerTypeId="getOuterTypeId(menu.menuJson)"></cost-list>
      </div>
    </template>
  </section>
</template>

<script>
import CostList from '@/views/Operation/CostInput/components/CostList';
export default {
  name: 'InputAll',
  inject: ['state'],
  components: { CostList },
  data() {
    return { menuList: [] };
  },
  watch: {
    '$route.path': {
      immediate: true,
      handler() {
        this.findType();
      }
    }
  },
  methods: {
    // 寻找菜单对应的一级成本类型id
    findType() {
      let { menu } = this.state;
      let targetPath = this.$route.path.slice(0, this.$route.path.lastIndexOf('/'));
      console.log('tar',targetPath);

      // 获取成本录入下所有子菜单
      this.menuList = this.findItem(menu, targetPath);
    },
    findItem(menu, path) {
      for (let item of menu) {
        if (item.path === path) return item.children;
        let res = this.findItem(item.children, path);
        if (res.length !== 0) return res;
      }
      return [];
    },
    getOuterTypeId(json) {
      return json? JSON.parse(json).costTypeId : '';
    }
  }
};
</script>
<style lang="less" scoped></style>
