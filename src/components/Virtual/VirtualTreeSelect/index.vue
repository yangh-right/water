<template>
  <div class="meetingTree" v-click-outside="onClickOutside">
    <div @mouseenter="tagsinputMouseEnter" @mouseleave="tagsinputMouseLeave">
      <vue-tags-input
        :tags="tags"
        :placeholder="inputPlaceholder"
        ref="vuetagsinput"
        v-model="selectTag"
        @before-deleting-tag="deleteTagHandle"
        @focus="enjoyMeetingOpenHandle"
        @input="vuetagsInputHandle"
        :add-only-from-autocomplete="true"
        :delete-on-backspace="false"
      />
      <w-icon
        v-show="allowClear && tagsinputFlag"
        class="close-icon"
        theme="filled"
        type="close-circle"
        @click="clearTagsHandle"
      />
    </div>
    <div class="ctree-search" v-if="ctreeSearchFlag">
      <div class="tree-select" :style="{ height: treeHeight }">
        <virtual-tree
          class="search-tree"
          :key="treeKey"
          :data="treeData"
          v-model="selectKeys"
          :node-key="nodeKey"
          height="400px"
          :replaceFields="replaceFields"
          v-bind="$attrs"
          @check="treeCheck"
          ref="ctreeSearch"
        >
          <template slot="empty">
            <div class="empty"><w-empty></w-empty></div>
          </template>
        </virtual-tree>
      </div>
    </div>
  </div>
</template>
<script>
import { findItemFromTree } from '@/utils/js/tool/tools';
import VirtualTree from '../VirtualTree';
import VueTagsInput from '@johmun/vue-tags-input';
export default {
  name: 'VirtualTreeSelect',
  props: {
    value: {
      type: Array,
      default: () => []
    },
    treeData: {
      type: Array,
      default: () => []
    },
    allowClear: {
      type: Boolean,
      default: true
    },
    renderAmount: {
      type: Number,
      default: 100
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    selectLeaf: {
      type: Boolean,
      default: true
    },
    // 展开和隐藏，emit父组件改变父组件的isTag
    isTag: {
      type: Boolean,
      default: true
    },
    nodeKey: {
      type: String,
      default: 'value'
    },
    replaceFields: {
      type: Object,
      default: () => ({ label: 'name', children: 'children' })
    },
    maxTagCount: {
      type: Number,
      default: 2
    }
  },
  data() {
    return {
      selectKeys: [],
      enjoyTags: [],
      selectTag: '',
      nameMap: {},
      nodeNum: 0,
      treeKey: 0,
      isInit: true,
      tagsParents: [],
      tagsinputFlag: false,
      ctreeSearchFlag: false
    };
  },
  components: { VueTagsInput, VirtualTree },
  computed: {
    treeHeight() {
      return this.treeData.length ? Math.min(12 + this.nodeNum * 26, 400) + 'px' : 'fit-content';
    },
    inputPlaceholder() {
      return this.enjoyTags.length ? '' : this.placeholder;
    },
    tags() {
      return this.enjoyTags.length <= this.maxTagCount || !this.maxTagCount
        ? [...this.enjoyTags]
        : [
            ...this.enjoyTags.slice(0, this.maxTagCount),
            {
              text: `+${this.enjoyTags.length - this.maxTagCount}...`,
              classes: 'more-tag',
              id: 'otherTag'
            }
          ];
    }
  },
  watch: {
    treeData: {
      handler(val) {
        let ids = [];
        this.nodeNum = 0;
        this.getAllParentsId(val, ids);
        this.tagsParents = ids;
      },
      immediate: true
    },
    value: {
      handler(val) {
        this.selectKeys = val;
      },
      immediate: true
    },
    tagsParents: {
      handler(val) {
        this.updateEnjoyTags();
      }
    },
    selectKeys: {
      handler(val) {
        this.updateEnjoyTags();
        this.$emit('input', this.selectKeys);
        this.$emit('change', this.selectKeys);
      },
      immediate: true
    }
  },
  methods: {
    getAllParentsId(list, ids) {
      list?.forEach(item => {
        this.nodeNum += 1;
        this.nameMap[item[this.nodeKey]] = item[this.replaceFields.label];
        if (item?.children?.length) {
          ids.push(item[this.nodeKey]);
          this.getAllParentsId(item.children, ids);
        } else {
          item.isLeaf = true;
        }
      });
    },
    // 勾选的时候触发
    treeCheck(value) {
      this.$refs.vuetagsinput.newTag = '';
      this.reRender();
    },

    updateEnjoyTags() {
      this.enjoyTags = [];
      this.selectKeys?.forEach(item => {
        if (!this.tagsParents.includes(item)) {
          this.enjoyTags.push({ id: item, text: this.nameMap[item] });
        }
      });
    },

    // 删除tags标签中的数据
    deleteTagHandle(value) {
      if (value.tag.id || typeof value.tag.id === 'number') {
        let selectKeys = this.selectKeys.filter(item => {
          return !this.tagsParents.includes(item) && item !== value.tag.id;
        });
        this.selectKeys = selectKeys;
        this.reRender();
      }
    },

    tagsinputMouseEnter() {
      if (this.selectKeys.length > 0) {
        this.tagsinputFlag = true;
      }
    },
    reRender() {
      if (this.nodeNum > 1000) {
        this.treeKey += 1;
      }
    },

    tagsinputMouseLeave() {
      this.tagsinputFlag = false;
    },
    // 清空数据
    clearTagsHandle() {
      this.enjoyTags = [];
      this.selectKeys = [];
      this.reRender();
    },
    enjoyMeetingOpenHandle() {
      this.ctreeSearchFlag = true;
    },
    // 触发点击外部div
    onClickOutside(event) {
      this.ctreeSearchFlag = false;
    },
    // tagsinput框搜索触发
    vuetagsInputHandle(value) {
      this.debounce(this.$refs?.ctreeSearch?.search(value), 500);
    },
    //防抖
    debounce(fn, delay) {
      let timer = null; //借助闭包
      return function() {
        if (timer) {
          clearTimeout(timer);
        }
        timer = setTimeout(fn, delay); // 简化写法
      };
    }
  }
};
</script>
<style scoped lang="less">
/deep/ .more-tag {
  padding-right: 20px !important;
  .ti-actions {
    display: none;
  }
}
.meetingTree {
  display: inline-block;
  position: relative;
  .ctree-search {
    position: absolute;
    margin-top: 3px;
    z-index: 1050;
    border-radius: 4px;
    outline: none;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    background: var(--supply-color-bg-card-DEFAULT);
    padding-bottom: 10px;
    width: 100%;
    .tree-select {
      max-height: 400px;
      overflow: hidden;
    }
    .empty {
      top: 50px;
      position: relative;
      /deep/.wpg-empty-description {
        font-size: 12px;
      }
      /deep/.wpg-empty-image {
        height: 60px;
      }
    }
    /deep/.search-tree {
      .ctree-tree-search__footer {
        padding: 0;
      }
      .vue-recycle-scroller__item-wrapper {
        overflow-x: auto;
      }
      .vue-recycle-scroller {
        padding: 12px 10px 0;
      }
    }
  }
  .close-icon {
    position: absolute;
    right: 8px;
    top: 12px;
    font-size: 12px;
    color: #d6d6d6;
    cursor: pointer;
    &:hover {
      color: #666666;
    }
  }
}
/deep/.ctree-tree-search__search {
  display: none !important;
}
/deep/.ctree-tree__block-area {
  margin-top: 10px !important;
}
/deep/.ctree-tree-node__checkbox {
  position: relative !important;
}
/deep/.vue-tags-input {
  max-width: none !important;
  border-radius: 4px;
  background: var(--supply-color-bg-card-DEFAULT) !important;
  // [data-wpg-theme='dark'] & {
  //   background-color: #12161d !important;
  // }
  .ti-input {
    padding: 0;
    border-radius: 4px;
    border: 1px solid var(--supply-color-border-DEFAULT);
    background-color: var(--supply-color-bg-input);
    &:hover {
      border-color: var(--supply-color-primary-hover);
    }
    .ti-tags {
      padding-bottom: 3px;
      .ti-tag {
        height: 28px;
        max-width: 99%;
        padding: 0 3px 0 10px;
        overflow: hidden;
        color: var(--supply-color-secondary);
        background-color: var(--supply-color-bg-card-rank-default);
        border: 1px solid var(--supply-color-border-split);
        border-radius: 2px;
        cursor: default;
        margin: 3px 0 0 4px;
        font-size: 14px;
        .ti-actions {
          .ti-icon-close {
            font-size: 14px;
          }
        }
      }
      .ti-new-tag-input {
        margin-left: 5.5px;
        &::placeholder {
          color: #999;
        }
      }
      .ti-new-tag-input-wrapper {
        padding: 0;
        height: 26px;
        line-height: 24px;
        margin-left: 4px;
        margin-top: 3px;
        > input {
          max-width: 100%;
          padding: 1px;
          height: 100%;
          font-size: 14px;
          line-height: 1;
          background: transparent;
          border-width: 0;
          border-radius: 4px;
          outline: 0;
          min-width: unset;
          flex: 1;
        }
      }
    }
  }
}
</style>
