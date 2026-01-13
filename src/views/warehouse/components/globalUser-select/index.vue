<template>
  <div class="global-user-select">
    <w-tree-select
      v-model="userId"
      :defaultValue="value"
      :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
      :tree-data="orgUsers"
      allowClear
      :replaceFields="replaceFields"
      :disabled="disabled"
      :show-search="true"
      tree-node-filter-prop="title"
      @change="checkTreeSelect"
    >
    <w-icon
      type="user"
      slot="suffixIcon"
      :size="24"
    ></w-icon>
    </w-tree-select>
  </div>
</template>
<script>
import { getOrgUserList } from '@/api/map';

export default {
  name: 'GlobalUserSelect',
  props: {
    value: {
      type: [String, Array],
      default: ''
    },
    disabled: {
      type: Boolean,
      default: false
    },
    orgId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id',
        value: 'id'
      },
      orgUsers: [],
      userId: '',
      values: [],
    }
  },

  watch: {
    value: {
      handler(val) {
        this.userId = val
      },
      immediate: true
    },

    orgId: {
      handler(val) {
        if (val) {
          this.getData(val);
        } else {
          this.orgUsers = this.$store.state.account.orgusertree;
        }
      },
      immediate: true
    }
  },

  methods: {
    checkTreeSelect(value, label, extra) {
      let user = ''
      let userId = ''
      if(value) {
        user = label[0]
        userId = value
      }
      let p = {
        user,
        userId
      }
      this.$emit('on-change', p)
    },

    async getData(orgId) {
      let param = { orgId }
      let res = await getOrgUserList(param);

      this.orgUsers = res.map(item => {
        return {
          ...item,
          label: item.userName
        }
      })
    }
  }
}
</script>
