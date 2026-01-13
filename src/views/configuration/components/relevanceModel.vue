<!--
 * @Description:
 * @version:
 * @Author: liuct
 * @Date: 2021-09-18 14:09:07
 * @LastEditors: fengtaotao
 * @LastEditTime: 2024-12-13 12:02:43
-->
<template>
  <w-modal
    class="secondary-modal"
    title="关联泵房"
    :visible="visible"
    width="960px"
    centered
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <w-row class="relevance-con">
      <w-col :span="11" class="modal-left supply-border-border-split">
        <div class="search-block">
          <w-input-search v-model="keyword" placeholder="泵房名称" @search="getPumpTree">
          </w-input-search>
        </div>
        <div v-if="pumpTreeData.length > 0" class="tree-block">
          <w-tree
            v-model="checkedKeys"
            checkable
            :defaultExpandAll="true"
            :replace-fields="replaceFields"
            :tree-data="pumpTreeData"
            @check="handleCheckChange"
          />
        </div>
        <w-empty v-else></w-empty>
      </w-col>
      <w-col :span="2" class="modal-center">
        <w-icon type="double-right" class="supply-cursor-pointer" />
      </w-col>
      <w-col :span="11" class="modal-right supply-border-border-split">
        <w-col
          class="selected-label supply-text-sm supply-text-main supply-border-border-split"
          :span="24"
        >
          <span>当前已选泵房（{{ selectNode.length }}）</span>
          <a @click="cancelSelect(false)">删除全部</a>
        </w-col>

        <w-col class="selected-rule-box" :span="24">
          <w-col class="supply-bg-bg-card-light supply-text-deviate selected-rule-title" :span="24">
            <w-col :span="20">
              泵房
            </w-col>
            <w-col :span="4">
              操作
            </w-col>
          </w-col>
          <w-col v-if="selectNode.length" class="selected-rule-content" :span="24">
            <w-col
              v-for="item in selectNode"
              :key="item.id"
              class="supply-bg-bg-invalid supply-text-secondary selected-rule"
              :span="24"
            >
              <w-col :span="20">
                {{ item.name }}
              </w-col>
              <w-col :span="4">
                <w-icon type="ic_clear" @click="cancelSelect(item.id)"></w-icon>
              </w-col>
            </w-col>
          </w-col>
        </w-col>
      </w-col>
    </w-row>
  </w-modal>
</template>

<script>
import { queryOrgPumpHouseTree } from '@/api/manage';
import { getSiteIdByTemplate, addSiteSvgsLock, getDisablePumpMap } from '@/api/configuration';
export default {
  name: 'RelevanceModel',
  props: {
    info: {
      type: Object,
      default: () => {
        return { id: '60', keyData: 'pump_info_svg' };
      }
    }
  },
  data() {
    return {
      visible: false,
      keyword: '',
      current: 0,
      pumpTreeData: [],
      allPumpTreeData: [],
      replaceFields: {
        children: 'children',
        title: 'name',
        key: 'id'
      },
      selectNode: [], // 选中的泵房节点
      checkedKeys: [] // 选中的泵房id
    };
  },
  watch: {
    info: {
      handler: function(newVal) {
        // 获取已关联泵房
        this.keyword = '';
      }
    },
    visible(n) {
      if (n) {
        this.getPumpTree();
        this.getSiteIdByTemplate();
      }
    }
  },
  mounted() {
    // 获取泵房树
    this.getPumpTree();
  },
  methods: {
    handleOk() {
      this.$confirm({
        title: '提示',
        content: '您确认要进行此操作吗?',
        type: 'warning',
        onOk: () => {
          const params = {
            keyData: this.info.keyData,
            siteCodes: this.selectNode.map(v => v.id),
            svgId: this.info.id
          };
          addSiteSvgsLock(params).then(res => {
            if (res.status === 'complete') {
              this.visible = false;
              this.$message.success(
                res.resultData && typeof res.resultData === 'string' ? res.resultData : '关联成功'
              );
              this.$emit('update:info', { ...this.info });
              this.$emit('relateChange');
            }
          });
        }
      });
    },

    handleCancel() {
      this.visible = false;
      this.$emit('update:info', { ...this.info });
    },
    getSiteIdByTemplate() {
      getSiteIdByTemplate({ svgId: this.info.id, keyData: this.info.keyData }).then(res => {
        this.checkedKeys = res.resultData;

        let nodes = [];
        this.checkedKeys.forEach(item => {
          this.getPumpNode(this.allPumpTreeData, item, nodes);
        });
        this.selectNode = nodes;
      });
    },

    // 选择要关联的泵房
    handleCheckChange(checkedKeys, e) {
      if(e.checked){
        this.getCheckedItems(this.pumpTreeData,checkedKeys,this.selectNode);
      }else{
        this.deleteItems(this.pumpTreeData,e.node.eventKey,this.selectNode);
      }
    },
        //获取非泵房id
    getCheckedItems(arr,checkedKeys = [],target = []){
      arr.forEach(item => {
        if (!item.disabled && item.label === 'station') {
          if(checkedKeys.indexOf(item.id) > -1 && target.filter(cur => cur.id === item.id).length <= 0){
            target.push(item)
          }
        }
        if (item.children && item.children.length > 0) {
          this.getCheckedItems(item.children,checkedKeys,target);
        }
      });
    },
    deleteItems(arr,key,target = []){
      arr.forEach((item, i) => {
        if (item.id === key) {
          if(item.label === 'station'){
            target.forEach((cur, j) => {
              if (cur.id === key) {
                target.splice(j, 1);
              }
            });
          }else{
            let tempArr = [];
            this.getChildNodes(item.children, tempArr);
            for(let j = 0;j<target.length;j++){
              if (tempArr.filter(temp => target[j].id === temp.id).length > 0) {
                target.splice(j, 1);
                j--;
              }
            }
          }
        }
        if (item.children && item.children.length > 0) {
          this.deleteItems(item.children,key,target);
        }
      });
    },
    getChildNodes(arr,tempArr){
      arr.forEach(item => {
        if(item.label === 'station'){
          tempArr.push(item);
        }
        if (item.children && item.children.length > 0) {
          this.getChildNodes(item.children,tempArr);
        }
      })
    },
    deletePumpNode(key, list) {
      list.forEach((item, index) => {
        if (item.id === key) {
          list.splice(index, 1);
        }
      });
    },

    // 设置禁止check
    setDisableCheck(arr, ids) {
      //
      if (!ids) {
        return;
      }
      arr.forEach(item => {
        if (ids.includes(item.id)) {
          item.disableCheckbox = true;
        }
        if (item.children && item.children.length > 0) {
          //

          this.setDisableCheck(item.children, ids);
        }
      });
    },
    // 根据id返回泵房数据
    getPumpNode(arr, pumpId, target) {
      const label = 'station';
      arr.forEach(item => {
        if (!item.disabled && item.label === label) {
          if (item.id === pumpId) {
            target.push(item);
          }
        }
        if (item.children && item.children.length > 0) {
          this.getPumpNode(item.children, pumpId, target);
        }
      });
    },

    // 根据类型获取泵房树
    async getPumpTree() {
      this.checkedKeys = [];
      const method = queryOrgPumpHouseTree;
      const params = { keyword: this.keyword };
      const res = await Promise.all([
        method(params),
        getDisablePumpMap({ svgId: this.info.id, keyData: this.info.keyData })
      ]);
      this.handleData(res[0].resultData);
      this.setDisableCheck(res[0].resultData, Object.keys(res[1].resultData));
      this.pumpTreeData = res[0].resultData;
      if (this.keyword === '') {
        this.allPumpTreeData = res[0].resultData;
      }
      let select = JSON.parse(JSON.stringify(this.selectNode));
      if (this.currentSelectItem) this.handleNodeClick(this.currentSelectItem);
      this.$nextTick(() => {
        select.forEach(item => {
          this.checkedKeys.push(item.id);
        });
      });
    },
    // 处理泵房树，去掉不必要的属性
    handleData(data) {
      data.forEach(item => {
        delete item.checkable;
        delete item.data;
        delete item.parentId;
        delete item.scopedSlots;
        if (item.children.length > 0) {
          this.handleData(item.children);
        }
      });
    },

    /**
     * 取消选中的关联泵房
     */
    cancelSelect(id) {
      if (id) {
        this.selectNode = this.selectNode.filter(item => item.id !== id);
        this.checkedKeys = this.selectNode.map(item => item.id);
      } else {
        this.checkedKeys = [];
        this.selectNode = [];
      }
    }
  }
};
</script>

<style lang="less" scoped>
.relevance-con {
  height: 574px;
  display: flex;
  .search-block {
    padding: 12px 12px 0 12px;
  }
  .modal-center {
    display: flex;
    align-items: center;
    justify-content: center;
    max-width: 60px;
    .anticon {
      width: 100%;
      line-height: 40px;
    }
  }
  .modal-left,
  .modal-right {
    border: 1px solid #ccc;
    border-radius: 4px;
    .selected-label {
      height: 52px;
      padding: 0 12px;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom-width: 1px;
      border-bottom-style: solid;
    }
    .selected-rule-box {
      padding: 12px;
      height: calc(100% - 52px);
      .selected-rule-title {
        height: 40px;
        line-height: 40px;
        padding-left: 12px;
      }
      .selected-rule-content {
        overflow-y: auto;
        height: calc(100% - 40px);
        .selected-rule {
          height: 32px;
          border-radius: 4px;
          margin: 6px 0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          padding-left: 12px;
        }
      }
    }
    .tree-block {
      overflow: hidden auto;
      margin-top: 8px;
      height: calc(100% - 44px);
    }
    .title {
      padding: 12px 16px;
      display: flex;
      justify-content: space-between;
      font-size: 14px;
    }
    .node-con {
      height: calc(100% - 50px);
      overflow: auto;
      ul {
        margin: 10px 16px;
        li {
          height: 32px;
          line-height: 32px;
          padding: 0 8px;
          font-size: 14px;
          color: #666666;
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 10px;
          cursor: pointer;
          i {
            font-size: 18px;
            color: rgb(180, 180, 180);
          }
        }
        li:hover {
          background: #b1f8d721;
        }
      }
    }
  }
}
</style>
