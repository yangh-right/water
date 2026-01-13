<template>
  <w-modal
    title="选择人员"
    :visible="visible"
    cancelText="取消"
    okText="确定"
    centered
    width="800px"
    @cancel="handleCancel"
    @ok="handleOk"
  >
    <w-spin v-if="loading"></w-spin>
    <w-transfer
      showSearch
      :data-source="dataSource"
      :target-keys="targetKeys"
      :render="item => item.title"
      :show-select-all="false"
      :disabled="transDisabled"
      :locale="locale"
      @change="onChange"
      @search="handleSearch"
    >
      <template
        slot="children"
        slot-scope="{ props: { direction, selectedKeys }, on: { itemSelect } }"
      >
        <w-tree
          v-if="direction === 'left'"
          blockNode
          checkable
          checkStrictly
          defaultExpandAll
          :checkedKeys="[...selectedKeys, ...targetKeys]"
          :treeData="treeData"
          @check="
            (_, props) => {
              onChecked(_, props, [...selectedKeys, ...targetKeys], itemSelect);
            }
          "
          @select="
            (_, props) => {
              onChecked(_, props, [...selectedKeys, ...targetKeys], itemSelect);
            }
          "
        />
      </template>
    </w-transfer>
  </w-modal>
</template>

<script>
import { searchUserTree as apiSearchUserTree } from '../api';

function treeTransform(tree) {
  let _tree = [];
  if (tree && tree.length) {
    tree.forEach(v => {
      let node = {
        key: v.id,
        title: v.name,
        checkable: false,
        selectable: false,
        children: treeTransform(v.children)
      };
      if (v.children.length === 0) {
        node.checkable = true;
        node.selectable = true;
      }
      _tree.push(node);
    });
  }
  return _tree;
}
// 从左侧添加到右侧需要扁平数据
let transferDataSource = [];
function flatten(list = []) {
  list.forEach(item => {
    transferDataSource.push(item);
    flatten(item.children);
  });
}

// 左侧选中
function isChecked(selectedKeys, eventKey) {
  return selectedKeys.indexOf(eventKey) !== -1;
}

// 穿梭到右侧左侧数据则禁用
function handleTreeData(data, targetKeys) {
  data.forEach(item => {
    item['disabled'] = targetKeys.includes(item.key);
    if (item.children) {
      handleTreeData(item.children, targetKeys);
    }
  });
  return data;
}

export default {
  props: {
    selectedIds: {
      type: Array,
      default: []
    },
    transDisabled: {
      type: Boolean,
      default: false
    },
    projectName: {
      type: Array,
      default: () => []
    },
    projectId: {
      type: Array,
      default: () => []
    },
    ticketNo: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      treeDataSource: [],
      targetKeys: [],
      dataSource: [],
      keyWord: '',
      locale: {
        itemUnit: '项',
        itemsUnit: '项',
        notFoundContent: '列表为空',
        searchPlaceholder: '请输入搜索内容'
      },
      loading: false //是否正在加载
    };
  },
  computed: {
    treeData() {
      return handleTreeData(this.treeDataSource, this.targetKeys);
    }
  },
  watch: {
    selectedIds: {
      immediate: true,
      handler(val) {
        this.targetKeys = val;
      }
    },
    projectId: {
      handler(val) {
        this.initData();
      },
      // immediate: true,
      deep: true
    },
    ticketNo: {
      handler(val) {
        this.initData();
      },
      // immediate: true,
      deep: true
    }
  },
  created() {
    this.initData();
  },
  methods: {
    // 初始化数据，避免后续搜索找不到targetkeys
    async initData() {
      await this.getUserTree();
      // transferDataSource = [];
      // flatten(JSON.parse(JSON.stringify(this.treeDataSource)));
      // this.dataSource = transferDataSource;
    },

    handleTreeData(data = []) {
      let transferDataSource = [];
      function flatten(list) {
        list.forEach(item => {
          transferDataSource.push({
            data: item.data,
            id: item.id,
            label: item.name,
            name: item.name,
            parentId: item.parentId,
            key: item.id,
            title: item.name,
            checkable: false,
            selectable: false
          });
          if (item.children.length > 0) flatten(item.children);
        });
      }
      flatten(data);
      return transferDataSource;
    },

    async getUserTree() {
      this.loading = true;
      let res = await apiSearchUserTree({
        flag: false,
        userName: this.keyWord,
        groupFlag: false,
        projectName: this.projectName,
        projectId: this.projectId,
        ticketNo: this.ticketNo
      });
      this.loading = false;
      if (res.status === 'complete') {
        this.treeDataSource = treeTransform(res.resultData);
        this.dataSource = this.handleTreeData([...res.resultData]);
      }
    },

    // 两栏穿梭
    onChange(targetKeys) {
      this.targetKeys = targetKeys;
    },

    // eslint-disable-next-line max-params
    onChecked(_, e, checkedKeys, itemSelect) {
      const { eventKey } = e.node;
      itemSelect(eventKey, !isChecked(checkedKeys, eventKey));
    },

    // 搜索
    async handleSearch(dir, val) {
      if (dir === 'left') {
        this.keyWord = val;
        this.getUserTree();
      }
    },
    handleCancel() {
      this.visible = false;
    },
    handleOk() {
      this.$emit('update:selected-ids', this.targetKeys);
      this.visible = false;
    }
  }
};
</script>
<style scoped lang="less">
/deep/.wpg-transfer-list {
  width: 344px;
  height: 400px;
}
.wpg-spin-spinning {
  position: absolute;
  display: inline-block;
  opacity: 1;
  left: 190px;
  top: 260px;
  z-index: 9999;
}
</style>
