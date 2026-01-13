<template>
  <w-modal class="modle-info" :visible="visible" :width="680" :confirm-loading="confirmLoading">
    <div class="modle-head" slot="title">
      <div class="modle-title">请选择要展示的模块</div>
    </div>
    <w-spin :spinning="loading" class="user-load"></w-spin>
    <div @click="handleCancel" class="modle-close" slot="closeIcon">
      <img src="@/assets/images/default/integrated/ic_mclose.png" alt="关闭" />
    </div>
    <w-transfer
      class="tree-transfer"
      :data-source="dataSource"
      :titles="['所有模块', '当前展示模块']"
      :target-keys="targetKeys"
      :render="item => item.title"
      @change="onChange"
    >
      <template
        slot="children"
        slot-scope="{ props: { direction, selectedKeys }, on: { itemSelect } }"
      >
        <w-tree
          v-if="direction === 'left'"
          block-node
          checkable
          :draggable="true"
          :checked-keys="[...selectedKeys, ...targetKeys]"
          :tree-data="treeData"
          @check="
            (_, props) => {
              onChecked(_, props, [...selectedKeys, ...targetKeys], itemSelect);
            }
          "
        />
      </template>
    </w-transfer>
    <div class="modle-bot" slot="footer">
      <div @click="handleCancel" size="small" class="cancel-btn">取消</div>
      <div @click="handleOk" size="small" class="ok-btn" type="primary">确认</div>
    </div>
  </w-modal>
</template>

<script>
// import { sysDictListByCode } from '@/api/manage';
import { queryCockpitListAll } from '@/api/cockpit.js';

function isChecked(selectedKeys, eventKey) {
  return selectedKeys.includes(eventKey);
}

function handleTreeData(data, targetKeys = []) {
  data.forEach(item => {
    if (item.children) {
      handleTreeData(item.children, targetKeys);
    }
  });
  return data;
}
export default {
  name: 'modulesDialog',
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    keys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      loading: false,
      treeDataList: [],
      replaceFields: { children: 'children', title: 'name', key: 'id', value: 'id' },
      confirmLoading: false,
      allModules: [],
      targetKeys: [],
      targetLabel: [],
      dataSource: []
    };
  },
  computed: {
    treeData() {
      return handleTreeData(this.treeDataList, this.targetKeys);
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.targetKeys = this.keys;
      }
    }
  },
  created() {
    this.getSysDictListByCode();
  },
  methods: {
    async getSysDictListByCode() {
      this.loading = true;
      this.dataSource = [];
      this.allModules = [];
      const { resultData, status } = await queryCockpitListAll();
      if (status === 'complete') {
        this.treeDataList = resultData.map(item => {
          let obj = {};
          obj['key'] = item.buttonCode;
          obj['title'] = item.name;
          obj['children'] = [];
          return obj;
        });
        this.dataSource = this.treeDataList;
        this.allModules = resultData;
      }
      this.loading = false;
    },
    onChange(targetKeys) {
      this.targetKeys = targetKeys;
      this.targetLabel = this.targetKeys.map(item => {
        let label = '';
        for (let index = 0; index < this.dataSource.length; index++) {
          const element = this.dataSource[index];
          if (item === element.key) {
            label = element.title;
            break;
          }
        }
        return label;
      });
    },
    onChecked(_, e, checkedKeys, itemSelect) {
      const { eventKey, checked } = e.node;
      if (!checked && checkedKeys.length >= 8) {
        this.$message.warning('最多选择8项展示模块!');
        return;
      }
      itemSelect(eventKey, !isChecked(checkedKeys, eventKey));
    },

    handleOk() {
      if (this.targetKeys.length < 8) {
        this.$message.warning('请选择8项展示模块!');
        return;
      }
      this.allModules.forEach(item => {
        if (this.targetKeys.indexOf(item.buttonCode) > -1) {
          item['isShow'] = '1';
        } else {
          item['isShow'] = '0';
        }
      });
      this.$emit('rangeOK', this.targetKeys, this.allModules);
      console.log('ooo', this.allModules);
    },
    handleCancel() {
      this.$emit('rangeCancel');
    }
  }
};
</script>

<style lang="less" scoped>
.user-load {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 20;
}
.info-tip {
  font-family: PingFangSC-Regular, sans-serif;
  font-weight: 400;
  font-size: 14px;
  color: #323233;
  margin: 0 0 20px 0;
}
/deep/ .wpg-form-item {
  .wpg-form-item-label {
    width: 100px;
  }
}

.tree-transfer {
  /deep/ .wpg-transfer-list {
    width: 45%;
    height: 350px;
    border: 1px solid #6695f9;
  }
  /deep/ .wpg-transfer-list-header {
    background: transparent;
    border: 1px solid #6695f9;
  }
  /deep/.wpg-transfer-list-header-selected {
    span {
      font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
      font-size: 20px;
      color: #dfe7f8;
      letter-spacing: 0;
    }
  }
  /deep/.wpg-transfer-list-body {
    position: relative;
    overflow: auto;
    flex: 1;
    font-size: 14px;
    border-radius: 0 0 4px 4px;
    background: transparent !important;
  }
  .wpg-tree li span.wpg-tree-switcher {
    display: none;
  }
  /deep/ .wpg-transfer-customize-list .wpg-transfer-list-body-customize-wrapper {
    overflow: auto;
    height: 100%;
  }
  /deep/.wpg-transfer-operation {
    button:first-child {
      width: 42px;
      height: 42px !important;
      background: url('~@/assets/images/default/integrated/ck-right.png') no-repeat !important;
      background-size: 100% 100% !important;
    }
    button:last-child {
      width: 42px;
      height: 42px !important;
      background: url('~@/assets/images/default/integrated/ck-left.png') no-repeat !important;
      background-size: 100% 100% !important;
    }
    button i {
      display: none;
    }
  }
  /deep/.wpg-empty-description {
    color: #dfe7f8;
  }
  /deep/.wpg-tree-title {
    font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
    font-size: 22px;
    color: #a8bae0;
    letter-spacing: 0;
    font-weight: 400;
  }
  /deep/.wpg-transfer-list-content-item {
    padding: 0 18px !important;
  }
  /deep/.wpg-transfer-list-content-item-text {
    font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
    font-size: 22px;
    color: #a8bae0;
    letter-spacing: 0;
    font-weight: 400;
  }
}
</style>
<style lang="less">
.modle-info {
  .wpg-modal-content {
    background: url('~@/assets/images/default/integrated/ck-modal.png') no-repeat !important;
    background-size: 100% 100% !important;
    border-bottom: none !important;
  }
  .wpg-modal-header {
    padding: 8px 40px 20px 40px;
    color: #333333;
    background: transparent !important;
    border-radius: 4px 4px 0 0;
    position: relative;
  }
  .wpg-modal-header::after {
    display: none !important;
  }
  .modle-head {
    font-family: PangMenZhengDao, sans-serif;
    font-size: 28px;
    background-image: linear-gradient(to bottom, #ffffff, #ffffff, #61acff, #61acff);
    -webkit-background-clip: text;
    color: transparent;
    letter-spacing: 0;
    text-align: center;
  }
  .wpg-modal-title {
    line-height: 47px !important;
  }
  .modle-close {
    width: 32px;
    height: 32px;
    margin-top: 10px;
    margin-right: 38px;
  }
  .wpg-modal-content {
    background: linear-gradient(to bottom, #0a1c3f, #183c73);
  }
  .wpg-modal-footer {
    border-top: none !important;

    .modle-bot {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .cancel-btn {
      width: 80px;
      height: 42px;
      margin-right: 25px;
      background: transparent !important;
      border: 1px solid #6695f9 !important;
      border-radius: 4px;
      font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
      font-size: 20px;
      color: #dfe7f8;
      letter-spacing: 0;
      font-weight: 400;
      transition: all 0.5s;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover {
        color: #40a9ff;
      }
    }
    .ok-btn {
      width: 80px;
      height: 42px !important;
      background: #1962ff;
      border-radius: 4px;
      font-family: AlibabaPuHuiTi_2_55_Regular, sans-serif;
      font-size: 20px;
      color: #dfe7f8;
      letter-spacing: 0;
      font-weight: 400;
      transition: all 0.5s;
      display: flex;
      justify-content: center;
      align-items: center;
      cursor: pointer;

      &:hover {
        background-color: #40a9ff;
        border-color: #40a9ff;
      }
    }
  }
}
</style>
