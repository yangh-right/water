<template>
  <w-form-item :label="item.label || '选择组织'">
    <span style="margin-left: 8px;"></span>
    <w-select
      v-model="selectId"
      :filter-option="filterOption"
      show-search
      option-filter-prop="children"
      style="width: 232px;"
      :size="item.size || 'default'"
      @change="handleChange"
    >
      <w-select-option value="">
        全部
      </w-select-option>
      <w-select-option v-for="item in orgList" :key="item.orgId" :value="item.orgId">
        {{ item.orgName }}
      </w-select-option>
    </w-select>
  </w-form-item>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'OrgSelect',
  props: {
    item: {
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapState('dict', {
      orgList: state => state.user_orgs
    })
  },
  data() {
    return {
      selectId: this.item.id
    }
  },
  methods: {
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    handleChange(value) {
      this.$emit('selectChange', value.toString());
    }
  },
  created() {
    this.$store.dispatch('dict/GenerateUserOrgs');
  }
}
</script>
<style lang="less" scoped>

</style>
