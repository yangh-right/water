<!--
 * @Author: wangyr
 * @Date: 2023-06-30 08:27:06
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-07-01 18:30:54
 * @Description:
-->
<!--
 * @Description:
 * @version:
 * @Author: liuct
 * @Date: 2021-09-18 14:09:07
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-30 16:33:58
-->
<template>
  <w-modal
    class="secondary-modal"
    title="配置控制项"
    :visible="visible"
    width="960px"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <w-row class="relevance-con">
      <w-col :span="11" class="modal-left supply-border-border-split">
        <!-- <div class="search-block">
          <w-input-search v-model="keyword" placeholder="设备名称" @search="getConfigTree">
          </w-input-search>
        </div> -->
        <div v-if="configTreeData.length > 0" class="tree-block">
          <w-tree
            v-model="checkedKeys"
            checkable
            :defaultExpandAll="true"
            :replace-fields="replaceFields"
            :tree-data="configTreeData"
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
          <span>当前已选（{{ selectNode.length }}）</span>
          <a @click="cancelSelect(false)">删除全部</a>
        </w-col>

        <w-col class="selected-rule-box" :span="24">
          <w-col class="supply-bg-bg-card-light supply-text-deviate selected-rule-title" :span="24">
            <w-col :span="20">
              设备
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
                {{ item.data.fullName }}
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
import { getConfigTree, getSaveBatch } from '@/api/debugTool';
export default {
  name: 'RelevanceModel',
  props: {
    dataList: {
      type: Array,
      default: () => []
    },
    waterPlantId: {
      type: String,
      default: ''
    },
    tabType: {
      type: String,
      default: '0'
    }
  },
  data() {
    return {
      visible: false,
      keyword: '',
      current: 0,
      configTreeData: [],
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
    visible(n) {
      if (n) {
        this.getConfigTree();
        //  this.getSiteIdByTemplate();
      }
    }
  },
  mounted() {
    // 获取泵房树
    // this.getConfigTree();
  },
  methods: {
    handleOk() {
      if (this.selectNode.length < 1) {
        this.$message.warning('请先选择设备');
        return;
      }
      this.$confirm({
        title: '提示',
        content: '您确认要进行此操作吗?',
        onOk: () => {
          let saveList = [];
          this.selectNode.forEach(item => {
            let list = item.data.fullId.split('-');
            let obj = {
              placeId: list[0],
             // structurePoolId: list[1],
              deviceId: list[1],
              dataKey: item.data.fullId,
              industryDeviceId: item.data.industryDeviceId,
              pointName: item.data.pointName
            };
            saveList.push(obj);
          });
          const params = {
            saveList: saveList,
            type: this.tabType,
            waterPlantId: this.waterPlantId
          };
          console.log(params);
          getSaveBatch(params).then(res => {
            if (res.status === 'complete') {
              this.visible = false;
              this.$message.success('保存成功');
              this.selectNode = [];
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
      if (this.dataList.length < 1) {
        return;
      }
      let list = [];
      this.dataList.forEach(item => {
        list.push(item.dataKey);
      });
      this.checkedKeys = list;

      let nodes = [];
      this.checkedKeys.forEach(item => {
        this.getPumpNode(this.configTreeData, item, nodes);
      });
      this.selectNode = nodes;
    },

    handleCheckChange(checkedKeys, e) {
      if (e.checked) {
        this.getCheckedItems(this.configTreeData, checkedKeys, this.selectNode);
      } else {
        this.deleteItems(this.configTreeData, e.node.eventKey, this.selectNode);
      }
    },
    getCheckedItems(arr, checkedKeys = [], target = []) {
      arr.forEach(item => {
        if (item.label === 'point') {
          if (
            checkedKeys.indexOf(item.id) > -1 &&
            target.filter(cur => cur.id === item.id).length <= 0
          ) {
            target.push(item);
          }
        }
        if (item.children && item.children.length > 0) {
          this.getCheckedItems(item.children, checkedKeys, target);
        }
      });
    },
    deleteItems(arr, key, target = []) {
      arr.forEach((item, i) => {
        if (item.id === key) {
          if (item.label === 'point') {
            target.forEach((cur, j) => {
              if (cur.id === key) {
                target.splice(j, 1);
              }
            });
          } else {
            let tempArr = [];
            this.getChildNodes(item.children, tempArr);
            for (let j = 0; j < target.length; j++) {
              if (tempArr.filter(temp => target[j].id === temp.id).length > 0) {
                target.splice(j, 1);
                j--;
              }
            }
          }
        }
        if (item.children && item.children.length > 0) {
          this.deleteItems(item.children, key, target);
        }
      });
    },
    getChildNodes(arr, tempArr) {
      arr.forEach(item => {
        if (item.label === 'point') {
          tempArr.push(item);
        }
        if (item.children && item.children.length > 0) {
          this.getChildNodes(item.children, tempArr);
        }
      });
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
      const label = 'point';
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
    async getConfigTree() {
      this.checkedKeys = [];
      // const method = getConfigTree;

      const params = { waterPlantId: this.waterPlantId, type: this.tabType };
      console.log(params);
      const res = await getConfigTree(params);
      // Promise.all([
      //   method(params),
      //   // getDisablePumpMap({ svgId: this.info.id, keyData: this.info.keyData })
      // ]);
      if (res.resultData.length) {
        this.handleData(res.resultData);
        this.setDisableCheck(res.resultData, Object.keys(res.resultData));
        this.configTreeData = res.resultData;
        this.getSiteIdByTemplate();
      } else {
        this.configTreeData = [];
        this.selectNode = [];
        this.checkedKeys = [];
      }
    },
    // 处理泵房树，去掉不必要的属性
    handleData(data) {
      data.forEach(item => {
        delete item.checkable;
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
