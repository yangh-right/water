<template>
  <div class="knowledge-item-box">
    <div class="content" @click="goDetail(dataItem.id)">
      <img src="@/assets/images/modules/knowledge/编组.png" alt="" class="quotes" />
      <h4 class="title" :title="dataItem.pageTitle">
        <w-checkbox @click.stop @change="e => onChange(e, dataItem.id)" />
        {{ dataItem.pageTitle }}
      </h4>
      <div class="label">
        <span v-for="(v, i) in dataItem.knowledgeTag" :key="v">
          {{ labelDictory[v] }}
        </span>
      </div>
      <div class="time">
        {{ dataItem.createUserName }} {{ $t('knowledge.workspace.createdAt') }}
        {{ dataItem.createTime }}
      </div>
      <div class="intro" :style="`display: -webkit-box`" v-html="dataItem.pageContent" />
    </div>
    <div v-if="dataItem.releaseFlag === '1'" class="action">
      <span :class="dataItem.likeStatus === '1' ? 'active' : ''" @click="handleLike(dataItem.id)">
        <w-icon type="like" theme="filled" />
        {{ dataItem.likeNum }}
      </span>
      <span
        :class="dataItem.collectStatus === '1' ? 'active' : ''"
        @click="handleStar(dataItem.id)"
      >
        <w-icon type="star" theme="filled" />
        {{ dataItem.collectNum }}
      </span>
      <span :class="dataItem.eyeFlag ? 'active' : ''">
        <w-icon type="eye" theme="filled" />
        {{ dataItem.pv }}
      </span>
    </div>
  </div>
</template>

<script>
import { knowledgeLikeAdd, knowledgeLikeCancel, knowledgeStar } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';
import { mapState } from 'vuex';

export default {
  props: {
    data: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      dataItem: {}
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
  watch: {
    data: {
      handler(val) {
        this.dataItem = JSON.parse(JSON.stringify(this.data));
      }
    }
  },

  mounted() {
    this.dataItem = JSON.parse(JSON.stringify(this.data));
  },

  methods: {
    onChange(e, id) {
      this.$emit('onChange', e, id);
    },

    handleLike(id) {
      let flag = this.dataItem.likeStatus === '1' ? true : false; // 当前点赞状态
      if (flag) {
        this.dataItem.likeStatus = '0';
        this.dataItem.likeNum--;
        this.unLike(id);
      } else {
        this.dataItem.likeStatus = '1';
        this.dataItem.likeNum++;
        this.like(id);
      }
    },
    async like(id) {
      let param = { knowledgeId: id };
      let res = await knowledgeLikeAdd(param);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.likeSuccess'));
      }
    },
    async unLike(id) {
      let param = { knowledgeId: id };
      let res = await knowledgeLikeCancel(param);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.likeCancel'));
      }
    },

    handleStar(id) {
      let flag = this.dataItem.collectStatus === '1' ? true : false; // 当前收藏状态
      let state = flag ? '0' : '1'; // 赋予新值
      if (flag) {
        this.dataItem.collectStatus = '0';
        this.dataItem.collectNum--;
      } else {
        this.dataItem.collectStatus = '1';
        this.dataItem.collectNum++;
      }
      this.star(id, state);
    },

    async star(id, flag) {
      let param = {
        collectType: flag,
        pageIds: [id]
      };
      let res = await knowledgeStar(param);
      if (res.status === 'complete') {
        if (flag === '1') {
          this.$message.success(t('knowledge.workspace.starSuccess'));
        } else {
          this.$message.success(t('knowledge.workspace.starCancel'));
        }
      }
    },
    goDetail(id) {
      this.drillDown({
        path: '/knowledge-scan',
        query: { id }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-item-box {
  .content {
    cursor: pointer;

    .quotes {
      height: 22px;
      position: absolute;
      top: 7px;
      left: 22px;
    }

    .title {
      /* height: 36px; */
      padding: 9px 11px 8px;
      overflow: hidden;
      color: var(--supply-color-main);
      font-weight: 500;
      font-size: 14px;
      font-family: PingFangSC-Medium, sans-serif;
      white-space: nowrap;
      text-overflow: ellipsis;
      background: var(--supply-color-bg-card-title);
    }

    .label {
      height: 20px;
      margin: 8px 0;
      overflow: hidden;

      span {
        display: inline-block;
        height: 18px;
        margin-right: 8px;
        padding: 0 6px;
        color: var(--supply-color-primary-hover);
        font-size: 12px;
        line-height: 16px;
        border: 1px solid var(--supply-color-primary-hover);
        border-radius: 2px;
      }
    }

    .time {
      color: var(--supply-color-third);
      font-size: 12px;
      font-family: PingFangSC-Regular, sans-serif;
    }

    .intro {
      height: 76px;
      margin: 8px 0;
      padding: 8px 9px;
      overflow: hidden;
      text-overflow: ellipsis;
      background: var(--supply-color-bg-card-dark);
      border-radius: 2px;
      line-clamp: 3;
      -webkit-box-orient: vertical;
      -webkit-line-clamp: 3;
    }
  }

  .action {
    span {
      position: relative;
      padding: 0 11px;
      color: var(--supply-color-secondary);
      font-size: 12px;
      cursor: pointer;

      i {
        margin-right: 3px;
        color: #8392ad;
        font-size: 14px;
      }

      &::after {
        position: absolute;
        top: 3px;
        right: 1px;
        width: 1px;
        height: 12px;
        background-color: #dee2e7;
        content: '';
      }

      &:first-child {
        padding-left: 0;
      }

      &:last-child {
        &::after {
          background-color: transparent;
        }
      }
    }

    .active {
      color: var(--supply-color-primary-DEFAULT);

      i {
        color: var(--supply-color-primary-DEFAULT);
      }
    }
  }
}
</style>
