<template>
  <div
    class="org-tree supply-overflow-auto"
  >
    <w-tree
      v-model="checkedKeys"
      checkable
      :default-expanded-keys="expandedKeys"
      :tree-data="tree"
      @check="onCheck"
    />
  </div>
</template>
<script>
import { defineComponent } from '@vue/composition-api'
import { mapState } from 'vuex'

export default defineComponent({
  computed: {
    ...mapState('region', [
      'orgTree',
      'orgIds'
    ]),
    tree() {
      console.log(this.orgTree)
      return [
        {
          title: '全选',
          key: 'all',
          children: this.orgTree
        }
      ]
    }
  },
  data() {
    return {
      checkedKeys: ['all'],
      expandedKeys: ['all'],
      autoExpandParent: true,
      selectedKeys: []
    }
  },
  mounted() {
    this.$store.dispatch('region/GenerateOrgs');
  },
  methods: {
    onCheck(keys, e) {
      console.log('check', keys, e);
      this.$emit('change', keys)
    }
  }
});
</script>
<style lang="less" scoped>
.org-tree {
  height: 200px;
  width: 150px;
}
</style>
