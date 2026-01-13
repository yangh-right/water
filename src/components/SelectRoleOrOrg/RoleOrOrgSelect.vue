<template>
  <w-form-item :label="item.label !== undefined ? item.label : '当前查询范围'">
    <w-radio-group
      v-if="item.isShowType"
      v-model="type"
      @change="handleTypeChange"
    >
      <w-radio-button ghost value="org">组织</w-radio-button>
      <w-radio-button ghost value="role">角色</w-radio-button>
    </w-radio-group>
    <div class="tree-select-container">
      <w-tree-select
        v-model="checkedKeys[type]"
        style="width: 232px"
        :dropdown-style="{ 'max-height': '300px' }"
        :tree-data="treeData"
        :filterTreeNode="searchFilterTreeNode"
        tree-checkable
        showCheckedStrategy="SHOW_ALL"
        :max-tag-count="1"
        placeholder="请选择"
        :search-value="searchKey"
        @change="onSelect"
        @search="onSearch"
      />
    </div>
  </w-form-item>
</template>
<script>
import { mapState } from 'vuex';

export default {
  name: 'RoleOrOrgSelect',
  props: {
    defaultCheckAll: {
      type: Boolean,
      default: true
    },
    item: {
      /**
       * label: 表单项label
       * isShowType: 是否显示区域或组织切换按钮组
       * type: 弹出框数据是角色role或组织org
       * ids: 数据选中项（不用传，不管初始传入数据，默认全选，确认时会更改）
       *  */
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      type: this.item.type,
      defaultType: this.item.type,
      checkedKeys: {
        role: [],
        org: []
      },
      treeData: [],
      allCheckObj: {
        isLeaf: true,
        key: 'all',
        title: '全选',
        value: 'allCheck'
      },
      searchKey: ''
    };
  },
  computed: {
    ...mapState('region', [
      'orgUserTree',
      'orgUserIds',
      'orgTree',
      'orgIds',
      'roleTree',
      'roleIds'
    ])
  },
  watch: {
    roleIds(val) {
      let idsLen = 0;
      if (this.item.isFeedback) {
        idsLen = this.item.ids.length;
      }
      const roleLen = this.roleIds.length;
      this.checkedKeys.role = (this.item.isFeedback && this.item.type === 'role') ?
      (idsLen === roleLen ? ['allCheck', ...this.item.ids] : this.item.ids) :
      (this.defaultCheckAll ? ['allCheck', ...this.roleIds] : []);
      if (this.type === 'role') {
        this.treeData = [this.allCheckObj, ...this.roleTree];
        this.$emit('selectChange',
          this.item.isFeedback ?
            (idsLen === roleLen ? ['allCheck', ...this.item.ids] : this.item.ids) :
            (this.defaultCheckAll ? val : []));
        this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
      }
    },
    orgIds(val) {
      let idsLen = 0;
      if (this.item.isFeedback) {
        idsLen = this.item.ids.length;
      }
      const orgLen = this.orgIds.length;
      this.checkedKeys.org = (this.item.isFeedback && this.item.type === 'org') ?
        (idsLen === orgLen ? ['allCheck', ...this.item.ids] : this.item.ids) :
        (this.defaultCheckAll ? ['allCheck', ...this.orgIds] : []);
      if (this.type === 'org') {
        this.treeData = [this.allCheckObj, ...this.orgTree];
        this.$emit('selectChange',
          this.item.isFeedback ?
            (idsLen === orgLen ? ['allCheck', ...this.item.ids] : this.item.ids) :
            (this.defaultCheckAll ? val : []));
        this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
      }
    },
  },

  created() {
    let type = this.item.type || this.defaultType;
    if (this.item.isShowType) {
      this.$store.dispatch('region/GenerateRoles');
      this.$store.dispatch('region/GenerateOrgs');
    } else {
      this.$store.dispatch(
        type === 'role'
          ? 'region/GenerateRoles'
          : 'region/GenerateOrgs'
      );
    }
    let idsLen = 0;
    if (this.item.isFeedback) {
      idsLen = this.item.ids.length;
    }
    const roleLen = this.roleIds.length;
    const orgLen = this.orgIds.length;
    this.checkedKeys.role = (this.item.isFeedback && this.item.type === 'role') ?
      (idsLen === roleLen ? ['allCheck', ...this.item.ids] : this.item.ids) :
      (this.defaultCheckAll ? ['allCheck', ...this.roleIds] : []);
    this.checkedKeys.org = (this.item.isFeedback && this.item.type === 'org') ?
      (idsLen === orgLen ? ['allCheck', ...this.item.ids] : this.item.ids) :
      (this.defaultCheckAll ? ['allCheck', ...this.orgIds] : []);
    // console.log(this.checkedKeys);
    if (this[type + 'Ids'].length > 0) {
      // 如果已经有区域和组织树数据时可以直接去触发数据全选
      this.treeData = [this.allCheckObj, ...this[type + 'Tree']];
      this.$emit('selectChange',
        this.item.isFeedback ?
        (idsLen === this[type + 'Ids'].length ? ['allCheck', ...this.item.ids] : this.item.ids) :
        (this.defaultCheckAll ? this[type + 'Ids'] : []));
      this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
    }
  },
  methods: {
    onSearch(val) {
      this.searchKey = val;
    },
    refresh() {
      // 重置
      this.searchKey = '';
      this.type = this.defaultType;
      this.treeData = [this.allCheckObj, ...this[this.type + 'Tree']];
      this.checkedKeys.role = this.defaultCheckAll ? ['allCheck', ...this.roleIds] : [];
      this.checkedKeys.org = this.defaultCheckAll ? ['allCheck', ...this.orgIds] : [];
      // this.checkedKeys.orgUser = this.defaultCheckAll ? ['allCheck', ...this.orgUserIds] : [];
      this.$emit('selectChange', this.checkedKeys[this.type]);
    },
    handleTypeChange(e) {
      this.type = e.target.value;
      this.treeData = [this.allCheckObj, ...this[this.type + 'Tree']];
      this.$emit('typeChange', e.target.value);
      this.$emit('selectChange', this.checkedKeys[this.type]);
    },
    onSelect(value, label, extra) {
      let arr = value;
      let { checked, triggerValue } = extra;
      if (triggerValue === 'allCheck') {
        arr = checked ? ['allCheck', ...this[this.type + 'Ids']] : [];
      } else {
        let idx = arr.indexOf('allCheck');
        if (idx > -1) arr.splice(idx, 1);
        if (arr.length === this[this.type + 'Ids'].length) {
          arr = ['allCheck', ...arr];
        }
      }
      this.checkedKeys[this.type] = arr;
      this.$emit('selectChange', arr);
    },
    // 多选搜索过滤
    searchFilterTreeNode(inputValue, treeNode) {
      return (
        treeNode.componentOptions.propsData.title.toLowerCase().indexOf(inputValue.toLowerCase()) >=
        0
      );
    }
  }
};
</script>
<style lang="less" scoped>
.tree-select-container {
  display: inline-block;
  height: 36px;
  margin-left: 8px !important;
  vertical-align: top;

  /deep/ .ant-select-selection {
    width: 225px !important;
    height: 36px;
    padding: 0;
    overflow: hidden;

    .ant-select-selection__rendered {
      display: flex;
      width: 225px;
      height: 36px;

      li:first-child {
        width: auto;
        max-width: 90px;
        overflow: hidden;
        white-space: nowrap;
        text-overflow: ellipsis;
      }

      li:nth-child(2) {
        width: auto;
        max-width: 90px;
        overflow: hidden;

        .ant-select-selection__choice__content {
          max-width: unset;
        }
      }

      .ant-select-search--inline {
        flex: 1;

        .ant-select-search__field__mirror {
          width: calc(100% - 10px);
          overflow: hidden;
        }
      }
    }

    .ant-select-selection__choice {
      margin-top: 5px;
    }
  }
}
</style>
