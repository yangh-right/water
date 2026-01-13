<template>
  <w-form-item :label="item.label !== undefined ? item.label : '当前查询范围'">
    <w-radio-group v-if="item.isShowType" v-model="type" size="small" @change="handleTypeChange">
      <w-radio-button ghost value="region">区域</w-radio-button>
      <w-radio-button ghost value="org">组织</w-radio-button>
    </w-radio-group>
    <span style="margin-left: 8px;"></span>
    <div style="display: inline-block;">
      <w-select
        v-model="checkedNames[type]"
        placeholder="请选择"
        option-filter-prop="children"
        mode="multiple"
        :max-tag-count="1"
        style="width: 232px;"
        @search="onChange"
      >
        <div slot="dropdownRender">
          <div class="check_tree" @mousedown="e => e.preventDefault()">
            <w-tree
              checkable
              :tree-data="treeData"
              v-model="checkedKeys[type]"
              :expanded-keys="expandedKeys"
              :auto-expand-parent="autoExpandParent"
              @check="onCheck"
              @expand="onExpand"
            >
              <template slot="title" slot-scope="{ title }">
                <span v-if="title.indexOf(searchValue) > -1">
                  {{ title.substr(0, title.indexOf(searchValue)) }}
                  <span style="color: #f50">{{ searchValue }}</span>
                  {{ title.substr(title.indexOf(searchValue) + searchValue.length) }}
                </span>
                <span v-else>{{ title }}</span>
              </template>
            </w-tree>
          </div>
          <div class="tree-btns" @mousedown="e => e.preventDefault()">
            <w-checkbox
              v-model="isCheckedAll[type]"
              @change="handleAllChecked"
              >全选</w-checkbox
            >
          </div>
        </div>
      </w-select>
    </div>
  </w-form-item>
</template>
<script>
import { mapState } from 'vuex';

// 树数据的名称
function getName(_data, names) {
  _data.forEach((child) => {
    if (child.children && child.children.length) {
      getName(child.children, names);
    } else {
      names.push(child.title);
    }
  });
  return names;
}

// 父节点的key
const getParentKey = (key, tree) => {
  let parentKey;
  for (let i = 0; i < tree.length; i++) {
    const node = tree[i];
    if (node.children) {
      if (node.children.some(item => item.title.indexOf(key) > -1)) {
        parentKey = node.key;
      } else if (getParentKey(key, node.children)) {
        parentKey = getParentKey(key, node.children);
      }
    }
  }
  return parentKey;
};

export default {
  name: 'RegionOrOrg',
  props: {
    item: {
      // label: 表单项label, isShowType: 是否显示区域或组织切换按钮组, type: 弹出框数据是区域region或组织org, ids: 数据选中项（不管初始传入数据，默认全选，确认时会更改）
      type: Object,
      default: () => {}
    }
  },
  computed: {
    ...mapState('region', ['regionTree', 'orgTree', 'regionIds', 'orgIds'])
  },
  watch: {
    regionIds(val) {
      this.checkedKeys.region = this.regionIds;
      this.checkedNames.region = getName(this.regionTree, []);
      if (this.type === 'region') {
        this.treeData = this.regionTree;
        this.$emit('selectChange', val);
        this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
      }
    },
    orgIds(val) {
      this.checkedKeys.org = this.orgIds;
      this.checkedNames.org = getName(this.orgTree, []);
      if (this.type === 'org') {
        this.treeData = this.orgTree;
        this.$emit('selectChange', val);
        this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
      }
    }
  },
  data() {
    return {
      type: this.item.type || 'region',
      defaultType: this.item.type || 'region',
      checkedKeys: {
        region: [],
        org: []
      },
      checkedNames: {
        region: [],
        org: []
      },
      treeData: [],
      expandedKeys: [],
      searchValue: '',
      autoExpandParent: true,
      isCheckedAll: {
        region: true,
        org: true
      }
    };
  },
  methods: {
    refresh() {
      // 重置
      this.searchName = '';
      this.type = this.defaultType;
      this.treeData = this[this.type + 'Tree'];
      this.checkedKeys.region = this.regionIds;
      this.checkedKeys.org = this.orgIds;
      this.checkedNames.region = getName(this.regionTree, []);
      this.checkedNames.org = getName(this.orgTree, []);
      this.$emit('selectChange', this.checkedKeys[this.type]);
    },
    handleTypeChange(e) {
      this.type = e.target.value;
      this.treeData = this[this.type + 'Tree'];
      this.expandedKeys = [];
      this.searchValue = '';
      this.$emit('typeChange', e.target.value);
      this.$emit('selectChange', this.checkedKeys[this.type]);
    },
    // 搜索关键词变化事件
    onChange(inputValue) {
      const value = inputValue;
      const expandedKeys = this[this.type + 'Tree']
        .map(item => {
          if (item.title.indexOf(value) > -1) {
            return getParentKey(inputValue, this[this.type + 'Tree']);
          }
          return null;
        })
        .filter((item, i, self) => item && self.indexOf(item) === i);
      Object.assign(this, {
        expandedKeys,
        searchValue: value,
        autoExpandParent: true
      });
    },
    onExpand(expandedKeys) {
      this.expandedKeys = expandedKeys;
      this.autoExpandParent = false;
    },
    // 全选
    handleAllChecked(e) {
      const type = this.type;
      if (e.target.checked) {
        this.checkedKeys[type] = this[type + 'Ids'];
        this.checkedNames[type] = getName(this[type + 'Tree'], []);
      } else {
        this.checkedKeys[type] = [];
        this.checkedNames[type] = [];
      }
      this.$emit('selectChange', this.checkedKeys[this.type]);
    },
    // 选中事件
    onCheck(checkedKeys, e) {
      const type = this.type;
      let keys = [],
        names = [];
      e.checkedNodes.forEach(node => {
        if (node.data.props.isLeaf === true) {
          keys.push(node.data.props.dataRef.key);
          names.push(node.data.props.dataRef.title);
        }
      });
      this.checkedNames[type] = names;
      this.checkedKeys[type] = keys;
      if (e.checkedNodes.length !== this[type + 'Ids'].length) this.isCheckedAll[type] = false;
      this.$emit('selectChange', this.checkedKeys[this.type]);
    },
    handleConfirm() {
      this.$emit('selectChange', this.checkedKeys[this.type]);
    }
  },
  created() {
    let type = this.defaultType;
    if (this.item.isShowType) {
      this.$store.dispatch('region/GenerateRegions');
      this.$store.dispatch('region/GenerateOrgs');
    } else {
      this.$store.dispatch(type === 'region' ? 'region/GenerateRegions' : 'region/GenerateOrgs');
    }
    this.checkedKeys.region = this.regionIds;
    this.checkedKeys.org = this.orgIds;
    this.checkedNames.region = getName(this.regionTree, []);
    this.checkedNames.org = getName(this.orgTree, []);
    if (this[type + 'Ids'].length > 0) {
      // 如果已经有区域和组织树数据时可以直接去触发数据全选
      this.treeData = this[type + 'Tree'];
      this.$emit('selectChange', this[type + 'Ids']);
      this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
    }
  }
};
</script>
<style lang="less" scoped>
.check_tree {
  max-height: 300px;
  height: calc(100vh - 300px);
  overflow-y: auto;
  .ant-tree {
    width: 100%;
    overflow: hidden;
  }
}
.tree-btns {
  padding: 10px;
}
</style>
