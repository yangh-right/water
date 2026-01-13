<!--
 * @Description: 请输入....
 * @Author: huhaiou
 * @Date: 2022-03-23 09:30:37
 * @LastEditTime: 2024-06-25 16:20:30
 * @LastEditors:  Do not edit
-->
<template>
  <div>
    <w-tree
      :expandedKeys="expandedKeys"
      :autoExpandParent="autoExpandParent"
      class="type-tree"
      :tree-data="treeData"
      :replaceFields="replaceFields"
      :selected-keys.sync="defaultSelect"
      @select="onSelect"
      @expand="openTree"
    ></w-tree>
  </div>
</template>

<script>
  import {getBaseMaterielType} from '@/api/warehouse.js';
  import Loop from '../base/levelLoop'
  export default {
    props: [''],
    data() {
      return {
        expandedKeys: [],
        autoExpandParent: true,
        replaceFields: {
          children:'children',
          title:'name',
          key:'id'
        },
        treeData: [
          {
            title: '物料类别',
            expand: true,
            id: 0,
            children: []
          }
        ],
        defaultSelect: []
      };
    },
    mounted() {
      this.getBaseMaterielType()
    },
    methods: {
      // 物料类别 - 获取物料类别
      getBaseMaterielType() {
        this.defaultSelect = [];
        getBaseMaterielType().then(response => {
          this.treeData = Loop.levelLoop(response.resultData) 
          const defaultNode = this.findFirstNode(this.treeData)
          const defaultId = defaultNode?.id || ''
          this.defaultSelect = [defaultId]
          this.expandedKeys = [defaultId]
          const target = {
            dataRef: defaultNode,
            ...defaultNode
          }
          this.$emit('address', target);
        });
      },
      findFirstNode(tree) {
        if (tree[0]?.children?.length) {
          return this.findFirstNode(tree[0].children)
        } else {
          return tree[0] || {}
        }
      },
      onSelect(selectedKeys, info) {
        if(!!info && info.selectedNodes.length) {
          const target = JSON.parse(JSON.stringify(info.selectedNodes[0].data.props))
          this.$emit('address', target);
        }
      },
      openTree(expandedKeys) {
        this.expandedKeys = expandedKeys;
        this.autoExpandParent = false;
      }
    }
  };
</script>
<style scoped lang="less">
/deep/ .wpg-tree li .wpg-tree-node-content-wrapper.wpg-tree-node-selected{
  color: #fff !important;
  background-color: var(--supply-color-primary-DEFAULT)
}
  /deep/ .wpg-tree {
    li.wpg-tree-treenode-selected,
    li.wpg-tree-treenode-selected:hover {
      background-color: var(--supply-color-primary-DEFAULT);
      color: #fff !important;
    }
    li .wpg-tree-switcher.wpg-tree-switcher-noop {
      width: 0;
    }
    li .wpg-tree-node-content-wrapper {
      padding-left: 29px;
      width: 100%;
    }
    li .wpg-tree-node-content-wrapper.wpg-tree-node-content-wrapper-open,
    li .wpg-tree-node-content-wrapper.wpg-tree-node-content-wrapper-close {
      padding-left: 5px;
      width: calc(100% - 24px);
    }
  }
</style>
