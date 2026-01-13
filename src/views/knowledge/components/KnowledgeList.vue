<template>
  <div class="knowledge-list">
    <div class="knowledge-list-box">
      <div
        v-if="form.time.length || form.knowledgeTag.length || form.userIds.length"
        class="condition"
      >
        <div v-if="form.time.length" class="condition-item">
          <span class="condition-item-name">
            {{ $t('knowledge.workspace.hadSelect') }} - {{ $t('knowledge.workspace.time') }} :
          </span>
          <span class="condition-item-value">{{ form.startTime }} ~ {{ form.endTime }}</span>
        </div>
        <div v-if="form.knowledgeTag.length" class="condition-item">
          <span class="condition-item-name">
            {{ $t('knowledge.workspace.hadSelect') }} - {{ $t('knowledge.workspace.tag') }} :
          </span>
          <span v-for="(item, index) in form.labelName" :key="index" class="condition-item-label">
            {{ item }}
          </span>
        </div>
        <div v-if="form.userIds.length" class="condition-item">
          <span class="condition-item-name">
            {{ $t('knowledge.workspace.hadSelect') }} - {{ $t('knowledge.workspace.createUser') }} :
          </span>
          <span class="condition-item-value">{{ form.createByName.join('、') }}</span>
        </div>
      </div>
      <div class="list">
        <div class="list-filter">
          <w-dropdown v-if="form.bookId !== 'dqzr'">
            <a class="list-filter-time">
              {{ sortDictionary[sortKey] }}
              <w-icon type="ic_expand_more" />
            </a>
            <w-menu slot="overlay">
              <w-menu-item v-for="(value, key) in sortDictionary" :key="key">
                <a href="javascript:;" @click="changeSort(key)">{{ value }}</a>
              </w-menu-item>
            </w-menu>
          </w-dropdown>
          <w-button class="list-filter-btn" type="primary" icon="plus" @click="handleAdd">
            {{ $t('knowledge.workspace.add') }}
          </w-button>
          <w-button class="list-filter-btn" icon="ic_delete" @click="handelDelete">
            {{ $t('knowledge.workspace.delete') }}
          </w-button>
        </div>
        <div class="list-containner">
          <div
            v-for="(item, index) in dataList"
            :key="item.id"
            :class="[
              'knowledge-box-item',
              { 'knowledge-box-odd': index % 2 != 1 },
              { 'knowledge-box-draft': item.releaseFlag === '0' }
            ]"
          >
            <know-card :data="item" @onChange="onChange" />
          </div>
        </div>
      </div>
    </div>
    <div class="knowledge-list-pagination">
      <w-pagination :value="current" @change="paginationChange" :total="total" />
    </div>
  </div>
</template>

<script>
import KnowCard from './KnowCard.vue';
import { deleteBatch, getKnowledgePage } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';

export default {
  name: 'KnowledgeList',

  components: {
    KnowCard
  },
  props: {
    form: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    return {
      dataList: [],
      checkedKeys: [],
      sortKey: 'create_time',
      sortDictionary: {
        create_time: t('knowledge.workspace.createTime'),
        like_num: t('knowledge.workspace.likeNum'),
        pv: t('knowledge.workspace.pv')
      },
      current: 1,
      total: 0
    };
  },

  watch: {
    form: {
      handler(val) {
        this.loadData();
      },
      deep: true
    },
    sortKey: {
      handler(val) {
        this.loadData();
      }
    }
  },

  methods: {
    async loadData(initPage = true) {
      if (initPage) this.current = 1;
      let param = {
        bookId: this.form.bookId,
        userIds: this.form.userIds,
        startTime: this.form.startTime,
        endTime: this.form.endTime,
        knowledgeTag: this.form.knowledgeTag,
        keyword: this.form.keyword,
        sortCode: this.sortKey,
        myCollectFlag: this.form.bookId === 'wdsc' ? '1' : '',
        releaseFlag: this.form.bookId === 'cgx' ? '0' : '1',
        page: { current: this.current }
      };
      if (['wdsc', 'zsk', 'cgx', 'dqzr'].includes(this.form.bookId)) {
        param = { ...param };
        param.bookId = '';
        if (this.form.bookId === 'dqzr') {
          param.sortCode = 'pv';
        }
      } else {
        param = { ...param };
      }
      let { resultData, status } = await getKnowledgePage(param);
      // let {resultData,status} = this.getMock('list',param)
      if (status === 'complete') {
        this.dataList = resultData.records;
        this.total = resultData.total;
      }
    },
    paginationChange(current) {
      this.current = current;
      this.loadData(false);
    },
    onChange(e, id) {
      if (e.target.checked) {
        this.checkedKeys.push(id);
      } else {
        this.checkedKeys.splice(this.checkedKeys.indexOf('id'), 1);
      }
    },

    changeSort(key) {
      this.sortKey = key;
    },
    handleAdd() {
      this.drillDown('/knowledge-add');
    },
    handelDelete() {
      if (this.checkedKeys.length) {
        this.$confirm({
          title: t('knowledge.workspace.willDelete'),
          content: '',
          onOk: () => {
            this.delete();
          }
        });
      } else {
        this.$message.warning(t('knowledge.workspace.selectDelete'));
      }
    },
    async delete() {
      let data = {
        ids: this.checkedKeys
      };
      let { status } = await deleteBatch(data);
      if (status === 'complete') {
        this.$message.success(t('knowledge.workspace.deleteSuccess'));
        this.loadData();
      }
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-list {
  width: calc(100% - 220px);
  margin-left: 12px;

  .knowledge-list-box {
    display: flex;
    flex-direction: column;
    height: calc(100% - 50px);
    overflow: auto;
    border-radius: 4px;

    .condition {
      background: var(--supply-color-bg-card-DEFAULT);
      display: flex;
      flex-wrap: wrap;
      margin-bottom: 16px;

      &-item {
        background: var(--supply-color-bg-card-dark);
        width: calc(50% - 24px);
        margin-top: 12px;
        margin-right: 12px;
        margin-left: 12px;
        padding: 5px 12px;
        font-size: 12px;
        border-radius: 4px;

        &-name {
          margin-right: 3px;
          color: var(--supply-color-third);
        }

        &-value {
          color: var(--supply-color-secondary);
        }

        &-label {
          display: inline-block;
          height: 18px;
          margin-right: 8px;
          padding: 0 6px;
          color: var(--supply-color-primary-DEFAULT);
          font-size: 12px;
          line-height: 16px;
          border: 1px solid var(--supply-color-primary-DEFAULT);
          border-radius: 2px;
        }

        &:last-child {
          width: 100%;
          margin-bottom: 12px;
        }
      }
    }

    .list {
      background: var(--supply-color-bg-card-DEFAULT);
      flex: 1;
      background-image: url('~@/assets/images/modules/knowledge/编组_8.png');
      background-repeat: no-repeat;

      &-filter {
        display: flex;
        align-items: center;
        justify-content: right;
        height: 64px;
        margin-right: 16px;

        &-time {
          color: var(--supply-color-secondary);
          font-size: 14px;
        }

        &-btn {
          margin-left: 16px;
          font-size: 14px;

          /deep/ .wpgicon {
            font-size: 14px;
          }

          /deep/ span {
            margin-left: 5px;
          }
        }
      }

      &-containner {
        display: flex;
        flex-wrap: wrap;
        padding: 0 16px;

        .knowledge-box-item {
          position: relative;
          width: 50%;
          width: calc(50% - 8px);
          height: 233px;
          margin-bottom: 16px;
          padding: 20px 16px 16px;
          /* background-color: antiquewhite;
          background-image: linear-gradient(0deg, #f5faff 0%, #fff 100%); */
          border-radius: 4px;
          box-shadow: 0 6px 12px 0 rgba(37, 59, 110, 0.1);
        }

        .knowledge-box-odd {
          margin-right: 16px;
        }

        .knowledge-box-draft {
          height: 210px;
        }
      }
    }
  }

  .knowledge-list-pagination {
    background: var(--supply-color-bg-card-DEFAULT);
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    height: 50px;
    padding: 0 25px 12px;
  }
}
</style>
