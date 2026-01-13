<template>
  <w-form-item class="region-org-select-form" :label="item.label !== undefined ? item.label : ''">
    <!-- <w-form-item :label="item.label !== undefined ? item.label : '当前查询范围'"> -->
    <w-radio-group
      v-if="item.isShowType"
      v-model="type"
      class="region-org-select-radio supply-mr-2"
      @change="handleTypeChange"
    >
      <w-radio-button ghost value="region">区域</w-radio-button>
      <w-radio-button v-if="item.isShowOrgUser" ghost value="orgUser">组织</w-radio-button>
      <w-radio-button v-else ghost value="org">组织</w-radio-button>
    </w-radio-group>
    <div class="region-org-tree-container">
      <w-tree-select
        v-model="checkedKeys[type]"
        :dropdown-style="{ 'max-height': '300px' }"
        :tree-data="treeData"
        :filterTreeNode="searchFilterTreeNode"
        :showCheckedStrategy="showCheckedStrategy"
        tree-checkable
        :max-tag-count="checkedKeys[type].length > 2 ? 1 : 2"
        placeholder="请选择"
        :search-value="searchKey"
        @change="onSelect"
        @search="onSearch"
      />
    </div>
  </w-form-item>
</template>
<script>
import { TreeSelect } from '@wpg/design-vue';
import { mapState } from 'vuex';

export default {
  name: 'RegionOrOrgSelect',
  props: {
    defaultCheckAll: {
      type: Boolean,
      default: true
    },
    showAll: {
      type: Boolean,
      default: true
    },
    item: {
      /**
       * label: 表单项label
       * isShowType: 是否显示区域或组织切换按钮组
       * type: 弹出框数据是区域region或组织org
       * ids: 数据选中项（不用传，不管初始传入数据，默认全选，确认时会更改）
       *  */
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      type: this.item.type || 'region',
      defaultType: this.item.type || 'region',
      searchKey: '',
      checkedKeys: {
        region: [],
        org: [],
        orgUser: []
      },
      treeData: [],
      allCheckObj: {
        isLeaf: true,
        key: 'all',
        title: '全选',
        value: 'allCheck'
      }
    };
  },
  computed: {
    ...mapState('region', [
      'regionTree',
      'orgUserTree',
      'orgUserIds',
      'orgTree',
      'regionIds',
      'orgIds'
    ]),
    allCheck() {
      let idx = this.checkedKeys[this.type].indexOf('allCheck');
      return () => (idx > -1 ? '' : '...');
    },
    showCheckedStrategy() {
      return this.showAll ? TreeSelect.SHOW_ALL : TreeSelect.SHOW_CHILD;
    }
  },
  watch: {
    regionIds(val) {
      this.checkedKeys.region = this.defaultCheckAll ? ['allCheck', ...this.regionIds] : [];
      if (this.type === 'region') {
        this.treeData = [this.allCheckObj, ...this.regionTree];
        this.$emit('selectChange', this.defaultCheckAll ? val : [], this.type, this.searchKey);
        this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
      }
    },
    orgIds(val) {
      if (this.item && this.item.ids && this.item.ids.length && this.item.ids.join(',') !== 'allCheck' && this.type === 'org') {
        this.checkedKeys.org = [...this.item.ids];
      } else {
        this.checkedKeys.org = this.defaultCheckAll ? ['allCheck', ...this.orgIds] : [];
      }
      if (this.type === 'org') {
        this.treeData = [this.allCheckObj, ...this.orgTree];
        this.$emit('selectChange', this.checkedKeys.org, this.type, this.searchKey);
        this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
      }
    },
    orgUserIds(val) {
      this.checkedKeys.orgUser = this.defaultCheckAll ? ['allCheck', ...this.orgUserIds] : [];
      if (this.type === 'orgUser') {
        this.treeData = [this.allCheckObj, ...this.orgUserTree];
        this.$emit('selectChange', this.defaultCheckAll ? val : [], this.type, this.searchKey);
        this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
      }
    },
    searchKey(val) {
      this.$emit('selectChange', this.checkedKeys[this.type], this.type, val);
    },
    item() {
      if (this.item.ids && this.item.ids.length) {
        if (this.type === 'org') {
          this.checkedKeys.org = [...this.item.ids];
        }
      } else if (this.item.ids && this.item.ids.length === 0) {
        if (this.type === 'org') {
          this.checkedKeys.org = [];
        }
      }
    }
  },

  created() {
    let type = this.item.type || this.defaultType;
    if (this.item.isShowType) {
      this.$store.dispatch('region/GenerateRegions');
      this.$store.dispatch('region/GenerateOrgs');
      // this.$store.dispatch('region/GenerateOrgsByUser');
    } else {
      this.$store.dispatch(
        type === 'region'
          ? 'region/GenerateRegions'
          : type === 'org'
          ? 'region/GenerateOrgs'
          : 'region/GenerateOrgsByUser'
      );
    }
    this.checkedKeys.region = this.defaultCheckAll ? ['allCheck', ...this.regionIds] : [];
    this.checkedKeys.org = this.defaultCheckAll ? ['allCheck', ...this.orgIds] : [];
    this.checkedKeys.orgUser = this.defaultCheckAll ? ['allCheck', ...this.orgUserIds] : [];
    if (this[type + 'Ids'].length > 0) {
      // 如果已经有区域和组织树数据时可以直接去触发数据全选
      this.treeData = [this.allCheckObj, ...this[type + 'Tree']];
      this.$emit('selectChange', this.defaultCheckAll ? this[type + 'Ids'] : [], this.type, this.searchKey);
      this.$emit('initLoaded'); // 触发组织默认数据加载并全选成功
    }
  },
  methods: {
    refresh() {
      // 重置
      this.type = this.defaultType;
      this.searchKey = '';
      this.treeData = [this.allCheckObj, ...this[this.type + 'Tree']];
      this.checkedKeys.region = this.defaultCheckAll ? ['allCheck', ...this.regionIds] : [];
      this.checkedKeys.org = this.defaultCheckAll ? ['allCheck', ...this.orgIds] : [];
      this.checkedKeys.orgUser = this.defaultCheckAll ? ['allCheck', ...this.orgUserIds] : [];
      this.$emit('selectChange', this.checkedKeys[this.type], this.type, this.searchKey);
    },
    handleTypeChange(e) {
      this.type = e.target.value;

      this.treeData = [this.allCheckObj, ...this[this.type + 'Tree']];
      this.$emit('typeChange', e.target.value);
      this.$emit('selectChange', this.checkedKeys[this.type], this.type, this.searchKey);
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
      this.$emit('selectChange', arr, this.type, this.searchKey);
    },
    onSearch(val) {
      this.searchKey = val;
    },
    onBlur() {
      console.log('blur');
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
.region-org-select-form {
    .region-org-select-radio.wpg-radio-group {
        min-width: 125px;

        vertical-align: top;

        .wpg-radio-button-wrapper {
            line-height: 36px;

            width: 60px;
            min-width: 60px;
            height: 36px;
            padding: 0;

            text-align: center;
            }
        }

    .region-org-tree-container {
        display: inline-block;
        flex: 1;

        height: 36px;

// width: 250px;
        margin-left: 0 !important;

        vertical-align: top;

        /deep/ .wpg-select-selection {
            overflow: hidden;

// width: 250px !important;

            height: 36px;
            padding: 0;

            ul.wpg-select-selection__rendered {
                // width: 250px !important;

                .wpg-select-selection__choice {
                    max-width: 80px;
                    }

                .wpg-select-search {
                    max-width: 65px;
                    }
                }
            }
        }
    }

</style>
