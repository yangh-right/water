<template>
  <w-form-item class="region-org-select" :label="label">
    <div class="supply-flex supply-items-center">
      <w-radio-group
        v-if="hasTypeSwitch"
        v-model="type"
        class="region-org-select-radio"
        size="small"
        @change="onTypeChange"
      >
        <w-radio-button ghost value="region">区域</w-radio-button>
        <w-radio-button ghost value="org">组织</w-radio-button>
      </w-radio-group>
      <div class="region-org-select-tree">
        <w-tree-select
          :value="checkedKeys"
          class="supply-w-full"
          :dropdown-style="{ 'max-height': '300px' }"
          :tree-data="treeData"
          :filterTreeNode="searchFilterTreeNode"
          :showCheckedStrategy="showCheckedStrategy"
          :treeDefaultExpandedKeys="['allCheck']"
          tree-checkable
          :max-tag-count="2"
          placeholder="请选择"
          :search-value="searchKey"
          @change="onChecked"
          @search="onSearch"
        />
      </div>
    </div>
  </w-form-item>
</template>
<script>
import { GetAreaTree, GetOrgTreeByUser } from '@/api/home';
import { defineComponent } from '@vue/composition-api';
import { TreeSelect } from '@wpg/design-vue';

const all = {
  isLeaf: false,
  key: 'allCheck',
  title: '全选',
  value: 'allCheck'
};

function transformNode(node) {
  if (node.children && node.children.length > 0) {
    return {
      children: node.children?.map(transformNode),
      title: node.name,
      key: node.id,
      value: node.id,
      isLeaf: false,
      scopedSlots: { title: 'title' }
    };
  } else {
    return {
      title: node.name,
      key: node.id,
      value: node.id,
      isLeaf: true,
      scopedSlots: { title: 'title' }
    };
  }
}

function getTree(type = 'region') {
  const fetchTree = type === 'region' ? GetAreaTree : GetOrgTreeByUser;
  return fetchTree(
    type
      ? {
          keyword: '',
          productCode: '',
          tenantId: ''
        }
      : undefined
  )
    .then(res => {
      let { status, resultData } = res;
      if (status === 'complete') {
        return resultData;
      } else {
        return [];
      }
    })
    .catch(e => {
      return [];
    });
}

export default defineComponent({
  name: 'RegionOrOrgSelect',
  props: {
    defaultCheckAll: {
      type: Boolean,
      default: true
    },
    showAllCheckedStrategy: {
      type: Boolean,
      default: true
    },
    hasTypeSwitch: {
      type: Boolean,
      default: false
    },
    label: {
      type: String,
      default: ''
    },
    checkedKeys: {
      type: Array,
      default: () => []
    },
    defaultType: {
      type: String,
      default: 'region'
    }
  },
  emits: ['init', 'update:checkedKeys', 'update:type'],
  data() {
    return {
      type: this.defaultType,
      searchKey: '',
      regionTree: [],
      orgTree: [],
    };
  },
  computed: {
    showCheckedStrategy() {
      return this.showAllCheckedStrategy ? TreeSelect.SHOW_ALL : TreeSelect.SHOW_CHILD;
    },
    treeData() {
      return [
        {
          ...all,
          children: this[`${this.type}Tree`]?.map(transformNode)
        }
      ];
    },
    treeIds() {
      const keys = [];
      function traverseNodeAndGetId(node) {
        if (node.children) {
          node.children.forEach(traverseNodeAndGetId);
        } else {
          keys.push(node.value);
        }
      }
      this.treeData.forEach(traverseNodeAndGetId);

      return keys;
    }
  },

  async mounted() {
    await this.initTrees();
    this.resetCheckedKeys();
    this.$emit('init');
  },
  methods: {
    async initTrees() {
      if (this.hasTypeSwitch) {
        await Promise.all([getTree('region'), getTree('org')]).then(([regionTree, orgTree]) => {
          this.regionTree = regionTree;
          this.orgTree = orgTree;
        });
      } else {
        if (this.type === 'region') {
          this.regionTree = await getTree('region');
        } else {
          this.orgTree = await getTree('org');
        }
      }
    },
    // 重置
    reset() {
      this.type = this.defaultType;
      this.searchKey = '';
      this.resetCheckedKeys();
    },

    resetCheckedKeys() {
      if (this.defaultCheckAll) {
        this.$emit('update:checkedKeys', [...this.treeIds]);
      } else {
        this.$emit('update:checkedKeys', []);
      }
    },
    onTypeChange(e) {
      this.type = e.target.value;
      this.resetCheckedKeys();
      this.$emit('update:type', e.target.value);
    },
    onChecked(value) {
      this.$emit('update:checkedKeys', [...value]);
    },
    onSearch(val) {
      this.searchKey = val;
    },
    // 多选搜索过滤
    searchFilterTreeNode(inputValue, treeNode) {
      return (
        treeNode.componentOptions.propsData.title.toLowerCase().indexOf(inputValue.toLowerCase()) >=
        0
      );
    }
  }
});
</script>
<style lang="less" scoped>
.region-org-select {
  .region-org-select-radio.ant-radio-group {
    margin: 0 8px;
    .ant-radio-button-wrapper {
      height: 32px;
      line-height: 32px;
      padding: 0 14px;
    }
  }

  .region-org-select-tree {
    // width: 250px;
    height: 40px;
    overflow: hidden;
    /deep/ .ant-select-selection {
      ul.ant-select-selection__rendered {
        .ant-select-selection__choice {
          max-width: 72px;
        }
        > li {
          margin-top: 5px;
        }
      }
    }
  }
}
</style>
