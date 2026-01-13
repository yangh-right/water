<template>
  <div class="knowledge-sort-container">
    <ul class="class-box supply-p-0">
      <li
        v-for="(item, index) in sortData"
        :key="index"
        :class="['item', { active: item.code === bookId }]"
        @click="checkSort(item.code)"
      >
        <div class="item-box">
          <w-icon
            v-if="item.code === 'zsk'"
            :type="expandFlag ? 'ic_expand_more' : 'ic_chevron_right'"
            class="tree-arrow"
          />
          <img v-if="item.code === 'dqzr'" :src="item.img" />

          <span class="item-box-name">
            <w-icon
              v-if="item.code !== 'dqzr'"
              :type="item.icon"
              theme="filled"
              :style="item.icon === 'ic_delete' ? 'font-size:16px' : ''"
            />

            {{ item.name }}
            <span v-if="item.num" class="num">({{ item.num }})</span>
          </span>

          <w-icon
            v-if="item.code === 'zsk'"
            type="plus"
            class="tree-plus"
            @click.stop="handlerPlus"
          />
        </div>
        <div v-if="item.code === 'zsk' && addSortFlag" class="add-sort" @click.stop>
          <w-input
            ref="input"
            v-model="newSort"
            :placeholder="$t('knowledge.workspace.inputName')"
            size="small"
            @pressEnter="addSort(newSort)"
          />
        </div>

        <vc-tree
          v-if="item.code === 'zsk' && expandFlag"
          :data="treeData"
          class="vc-tree"
          :props="defaultProps"
          @node-click="handleNodeClick"
        >
          <div slot-scope="{ node, data }" class="custom-tree-node">
            <w-input
              v-if="currentRename === data.id"
              ref="renameInput"
              :default-value="node.label"
              style="width: 75px; font-size: 12px"
              size="small"
              @blur="blurRename"
            />

            <span v-else class="title" :title="`${data.name}${data.num ? data.name : ''}`">
              <span class="label">{{ data.name }}</span>
              <span v-if="data.num" class="num">({{ data.num ? data.name : '' }})</span>
            </span>

            <w-dropdown class="vc-dropdown">
              <a class="ant-dropdown-link" @click="e => e.preventDefault()">
                <w-icon type="ic_more_horiz" />
              </a>
              <w-menu slot="overlay">
                <w-menu-item>
                  <a href="javascript:;" @click="handlerAdd(data)">{{
                    $t('knowledge.workspace.addClass')
                  }}</a>
                </w-menu-item>
                <w-menu-item>
                  <a href="javascript:;" @click="handlerRename(data)">{{
                    $t('knowledge.workspace.rename')
                  }}</a>
                </w-menu-item>
                <w-menu-item>
                  <a href="javascript:;" @click="handlerRemove(data)">
                    {{ $t('knowledge.workspace.removeTo') }}
                  </a>
                </w-menu-item>
                <w-menu-item>
                  <a href="javascript:;" @click="handlerDel(data)">{{
                    $t('knowledge.workspace.delete')
                  }}</a>
                </w-menu-item>
              </w-menu>
            </w-dropdown>
          </div>
        </vc-tree>
      </li>
    </ul>

    <add-sort
      :pid="currentEdit"
      :add-sort-visible="addSortVisible"
      @update="update"
      @closeAdd="closeAdd"
    />
    <move-sort
      :id="currentEdit"
      :move-sort-visible="moveSortVisible"
      :sort-data="treeData"
      @update="update"
      @closeMove="closeMove"
    />
    <img src="@/assets/images/modules/knowledge/b_img.png" class="background" />
  </div>
</template>

<script>
import AddSort from './AddSort';
import MoveSort from './MoveSort.vue';
import { bookAdd, bookEdit, delType, getBookTree } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';
export default {
  name: 'KnowledgeSort',

  components: {
    AddSort,
    MoveSort
  },
  props: {
    bookId: {
      type: String,
      default: 'dqzr'
    }
  },
  data() {
    return {
      treeData: [],
      sortData: [
        {
          name: t('knowledge.workspace.nowHot'),
          img: require('@/assets/images/modules/knowledge/ic_hot.png'),
          icon: '',
          code: 'dqzr',
          num: ''
        },
        {
          name: t('knowledge.workspace.myStar'),
          img: require('@/assets/images/modules/knowledge/ic_收藏.png'),
          icon: 'star',
          code: 'wdsc',
          num: ''
        },
        {
          name: t('knowledge.workspace.knowledgeBase'),
          img: require('@/assets/images/modules/knowledge/ic_文件.png'),
          icon: 'folder-open',
          code: 'zsk',
          num: ''
        },
        {
          name: t('knowledge.workspace.drafts'),
          img: require('@/assets/images/modules/knowledge/ic_草稿箱.png'),
          icon: 'ic_delete',
          code: 'cgx',
          num: ''
        }
      ],
      renameInput: '',
      currentRename: '',
      currentEdit: '',
      defaultProps: {
        children: 'children',
        label: 'name'
      },
      expandFlag: true,
      addSortFlag: false,
      newSort: '',
      addSortVisible: false,
      moveSortVisible: false
    };
  },

  mounted() {
    this.update();
  },

  methods: {
    checkSort(sort) {
      if (sort === 'zsk') {
        this.expandFlag = !this.expandFlag;
      } else {
        this.expandFlag = false;
      }
      this.$emit('changeSort', sort);
    },
    handleNodeClick(data) {
      this.$emit('changeSort', data.id);
    },
    update() {
      this.getBookTree();
    },
    closeMove() {
      this.moveSortVisible = false;
    },
    closeAdd() {
      this.addSortVisible = false;
    },
    handlerPlus() {
      this.addSortFlag = true;
      this.expandFlag = true;
      this.$nextTick(function() {
        this.$refs.input && this.$refs.input[0].focus();
      });
    },
    handlerAdd(data) {
      this.currentEdit = data.id;
      this.addSortVisible = true;
    },
    handlerDel(data) {
      let id = data.id;
      this.$confirm({
        title: t('knowledge.workspace.willDeleteClass'),
        content: '',
        onOk: () => {
          this.delType(id);
        }
      });
    },
    handlerRename(data) {
      this.currentRename = data.id;
      this.$nextTick(function() {
        this.$refs.renameInput && this.$refs.renameInput[0].focus();
      });
    },
    handlerRemove(data) {
      this.currentEdit = data.id;
      this.moveSortVisible = true;
    },
    async getBookTree() {
      let res = await getBookTree({});
      // let res =this.getMock('tree')
      if (res.status === 'complete') {
        let data = res.resultData;
        this.treeData = data;
      }
    },
    async addSort(name) {
      this.addSortFlag = false;
      if (name) {
        let data = {
          bookName: name,
          pid: '0'
        };
        let res = await bookAdd(data);
        if (res.status === 'complete') {
          this.$message.success(t('knowledge.workspace.addSuccess'));
          this.addSortFlag = false;
          this.newSort = '';
          this.update();
        }
      }
    },
    async delType(id) {
      let res = await delType(id);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.deleteSuccess'));
        this.update();
      }
    },
    async blurRename() {
      let name = this.$refs.renameInput[0]._data.stateValue;
      let data = {
        bookName: name,
        id: this.currentRename
      };
      this.currentRename = '';
      let res = await bookEdit(data);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.renameSuccess'));
        this.update();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-sort-container {
  position: relative;
  width: 220px;
  height: 100%;
  overflow: hidden;
  background: linear-gradient(147deg, #fff 64%, #f3f8ff 100%);
  border-radius: 4px;

  ul {
    position: relative;
    z-index: 999;
    height: 100%;
    overflow: auto;

    .item {
      background: var(--supply-color-bg-card-DEFAULT);
      cursor: pointer;

      &-box {
        position: relative;
        display: flex;
        align-items: center;
        margin: 0 12px;
        padding: 13px 0;
        color: var(--supply-color-main);
        font-weight: 600;
        font-size: 14px;
        font-family: 'PingFangSC-S0pxibold', sans-serif;
        border-bottom: 1px solid var(--supply-color-bg-card-dark);

        .tree-arrow {
          position: absolute;
          left: 5px;
          color: #8c8e95;
        }

        .tree-plus {
          position: absolute;
          right: 5px;
          color: #8c8e95;
        }

        img {
          width: 22px;
          margin-right: 6px;
          margin-left: 30px;
          vertical-align: middle;
        }

        &-name {
          font-weight: 600;

          .num {
            margin-left: 3px;
            font-weight: 600;
          }

          i {
            width: 22px;
            margin-right: 1px;
            margin-left: 30px;
            color: #8393ae;
            font-size: 18px;
          }
        }
      }

      .add-sort {
        padding: 4px 0;
        text-align: center;
        background: var(--supply-color-bg-card-DEFAULT);

        /deep/ .wpg-input {
          width: 90%;
          padding-top: 4px;
          padding-bottom: 4px;
          color: var(--supply-color-third);
          font-size: 12px;
          border: 1px solid #d6d6d6;
        }
      }
    }

    .active {
      background: var(--supply-color-bg-li);
      border-radius: 2px;

      .item-box-name {
        color: var(--supply-color-primary-DEFAULT);

        i {
          color: var(--supply-color-primary-DEFAULT);
        }
      }

      .tree-plus {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
  }

  .background {
    position: absolute;
    bottom: 0;
    z-index: 1;
  }

  .vc-tree {
    .custom-tree-node {
      margin-right: 40px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;

      .num {
        margin-left: 5px;
      }
    }

    /deep/ .is-current {
      .vc-tree-node__content {
        color: var(--supply-color-primary-DEFAULT);
        background: var(--supply-color-bg-li);

        .vc-dropdown {
          color: var(--supply-color-primary-DEFAULT);
        }
      }

      .vc-tree-node__children {
        .vc-tree-node__content {
          color: #606266;
          background: #fff;

          .vc-dropdown {
            color: #606266;
          }
        }
      }
    }

    /deep/ .vc-tree-node {
      &__content {
        position: relative;
        height: 40px;
      }

      &__expand-icon {
        margin-left: 40px;
      }
    }
  }

  .vc-dropdown {
    position: absolute;
    right: 20px;
    color: #606266;
  }
}
</style>
