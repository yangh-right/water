<template>
  <w-drawer
    width="600"
    :title="$t('knowledge.workspace.advancedSearch')"
    placement="right"
    wrap-class-name="assign-setting-drawer"
    :closable="false"
    :visible="visible"
    :after-visible-change="afterVisibleChange"
    @close="handleClose"
  >
    <div class="knowledge-advanced-rules">
      <div class="outwork-titlebar wbgc-card">
        <span class="outwork-titlebar-name wfc-unusual wfs16">
          {{ $t('knowledge.workspace.advancedRule') }}
        </span>
      </div>

      <div class="advanced-rules-content">
        <w-form-model ref="form" v-model="form" class="wpg-form--horizontal wpg-form--label-right">
          <w-form-model-item :label="$t('knowledge.workspace.createTime')">
            <w-range-picker v-model="form.time" @change="timeChange" />
          </w-form-model-item>
          <w-form-model-item :label="$t('knowledge.workspace.createUser')">
            <w-tree-select
              :dropdownStyle="{ maxHeight: '270px' }"
              v-model="form.userIds"
              style="width: 100%"
              :tree-data="treeData"
              :filterTreeNode="searchFilterTreeNode"
              tree-checkable
              :replace-fields="replaceFields"
              :placeholder="$t('knowledge.workspace.select')"
              @change="createChange"
            />
          </w-form-model-item>
          <w-form-model-item :label="$t('knowledge.workspace.tag')" prop="knowledgeTag">
            <w-select
              v-model="form.knowledgeTag"
              mode="multiple"
              style="width: 100%"
              :placeholder="$t('knowledge.workspace.select')"
              :max-tag-count="5"
              @change="handleLabel"
            >
              <w-select-option v-for="item in knowledgeTag" :key="item.value" :value="item.value">
                {{ item.label }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
        </w-form-model>
      </div>

      <div class="advanced-rules-action wbgc-card">
        <w-button type="primary" ghost @click="handleClose">
          {{ $t('knowledge.workspace.cancel') }}
        </w-button>
        <w-button type="primary" ghost @click="handleReset">{{
          $t('knowledge.workspace.reset')
        }}</w-button>
        <w-button type="primary" @click="saveRules">{{ $t('knowledge.workspace.sure') }}</w-button>
      </div>
    </div>
  </w-drawer>
</template>

<script>
import { searchUserTree as apiSearchUserTree } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';
import { mapState } from 'vuex';

export default {
  name: 'AdvancedRules',
  data() {
    return {
      visible: false,
      knowledge_tag: [],
      form: {
        startTime: '',
        endTime: '',
        time: [],
        userIds: [],
        createByName: [],
        knowledgeTag: [],
        labelName: []
      },
      treeData: [],
      replaceFields: { children: 'children', title: 'name', key: 'id', value: 'id' }
    };
  },
  computed: {
    ...mapState('dict', ['knowledgeTag']),
    labelDictory() {
      let labelDictory = {};
      this.knowledgeTag?.forEach(element => {
        labelDictory[element.value] = element.label;
      });
      return labelDictory;
    }
  },
  created() {
    this.getUserTree();
  },

  mounted() {},
  methods: {
    async getUserTree() {
      let res = await apiSearchUserTree({
        pageFlag: false
      });
      let { resultData, status } = res;
      let treeData = this.flattenTree(resultData);
      this.treeData = treeData;
    },

    // 初始化树的每一个节点内容
    flattenTree(tree) {
      let _tree = [];
      if (tree && tree.length) {
        tree.forEach(v => {
          let node = {
            id: v.id,
            name: v.userName,
            children: this.flattenTree(v.children)
          };
          _tree.push(node);
        });
      }
      return _tree;
    },

    afterVisibleChange(val) {
      // console.log('visible', val);
    },
    showDrawer() {
      this.visible = true;
    },
    handleClose() {
      this.visible = false;
    },
    saveRules() {
      this.$emit('changeFilter', this.form);
      this.visible = false;
    },
    handleReset() {
      this.form = {
        startTime: '',
        endTime: '',
        time: [],
        userIds: [],
        createByName: [],
        knowledgeTag: [],
        labelName: []
      };
    },
    // 多选搜索过滤
    searchFilterTreeNode(inputValue, treeNode) {
      return (
        treeNode.componentOptions.propsData.title.toLowerCase().indexOf(inputValue.toLowerCase()) >=
        0
      );
    },
    timeChange(date, dateString) {
      this.form.time = date;
      this.form.startTime = dateString[0];
      this.form.endTime = dateString[1];
    },

    createChange(value, label, extra) {
      this.form.createByName = label;
    },

    handleLabel(value) {
      this.form.labelName = value.map(item => this.labelDictory[item]);
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-advanced-rules {
  position: relative;
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 0 12px 12px;
  overflow: hidden;
  background: var(--supply-color-bg-card-light);

  .outwork-titlebar {
    margin: 25px 0 0;
    background: var(--supply-color-bg-card-DEFAULT);
  }

  .advanced-rules-content {
    background: var(--supply-color-bg-card-DEFAULT);
    margin-top: 12px;
    padding: 12px;
    /deep/ .wpg-form--horizontal {
      .wpg-form-item {
        display: flex;
        .wpg-form-item-control-wrapper {
          flex: 1;
        }
      }
    }
    /deep/ .wpg-form-item {
      .wpg-form-item-label {
        width: 80px;
      }
    }

    .rules-action {
      margin-top: 50px;
    }
  }

  .advanced-rules-action {
    background: var(--supply-color-bg-card-DEFAULT);
    position: absolute;
    bottom: 0;
    left: 0;
    display: flex;
    justify-content: flex-end;
    width: 100%;
    padding: 12px 40px;
    box-shadow: 0 -2px 20px 0 rgba(0, 0, 0, 0.1);

    /deep/ .wpg-btn {
      width: 80px;
      margin-left: 20px;
    }
  }
}
</style>

<style lang="less">
.assign-setting-drawer {
  .wpg-drawer-header {
    display: none;
  }

  .wpg-drawer-wrapper-body {
    overflow: hidden;
  }

  .wpg-drawer-close {
    width: 28px;
    height: 28px;
    line-height: 28px;
  }

  .wpg-drawer-body {
    height: 100%;
    padding: 0;
  }
}
</style>
