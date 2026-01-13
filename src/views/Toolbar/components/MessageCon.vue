<!--
 * @Description:
 * @Author: liuct
 * @Date: 2021-06-10 14:25:45
 * @LastEditTime: 2023-05-18 08:52:29
 * @LastEditors: Do not edit
-->
<template>
  <div class="message-con__wrapper">
    <div class="con-list-wrapper">
      <div v-if="orderList.length > 0" class="con-list">
        <div :class="['list', orderList.length < 4 ? '' : 'list-scroll']">
          <div v-for="m in orderList" :key="m.id" class="message-item supply-bg-bg-card-DEFAULT">
            <template v-if="option.code === 'notice'">
              <div class="item__con" :title="m.content.replace(/<[^>]*>|<\/[^>]*>/gm, '') || ''">
                {{ m.content.replace(/<[^>]*>|<\/[^>]*>/gm, '') || '' }}
              </div>
              <div class="item__bottom">
                <div class="bottom__date">{{ m.sendTime || '' }}</div>
                <div v-if="tab === '0'" class="bottom__read" @click="setHaveRead([m.id])">
                  <span>标记已读</span>
                </div>
              </div>
            </template>
            <template v-if="option.code === 'order'">
              <div class="item__con" :title="m.originalData.content || ''">
                {{ m.originalData.content || '' }}
              </div>
              <div class="item__bottom">
                <div class="bottom__date">{{ m.originalData.sendTime || '' }}</div>
                <a class="bottom__detail" @click="toDetail(m.businessId, [m.id])">详情</a>
              </div>
            </template>
          </div>
        </div>
      </div>
    </div>
    <div class="pagination-box">
      <w-pagination
        :pageSize="pageSize"
        :total="total"
        :current="currentPage"
        showLessItems
        @change="onChangePage"
      />
    </div>
    <div v-if="this.tab === '0' && orderList.length" class="read-box">
      <w-button class="read-box" @click="setHaveRead(orderList.map(item => item.id))">
        当页已读
      </w-button>
    </div>
  </div>
</template>

<script>
import { setMessageStatus, getMessageList } from '@/api/baseInfo';
export default {
  name: 'MessageCon',
  props: {
    tab: {
      type: String,
      default: '0'
    },
    visible: {
      type: Boolean,
      default: false
    },
    option:{
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      total: 0,
      pageSize: 10,
      orderList: [],
      currentPage: 1
    };
  },
  watch: {
    visible: {
      handler(val) {
        if (val) {
          this.getMessageList(true);
        }
      },
      immediate: true
    }
  },
  methods: {
    // 分页、跳页
    onChangePage(page) {
      this.currentPage = page;
      this.getMessageList();
    },
    async setHaveRead(ids, visible = true) {
      if (this.tab === '0' && ids.length) {
        let params = {
          clientType: this.option.clientType,
          processType: 1,
          ids: ids
        };
        await setMessageStatus(params);
        this.$emit('change', visible);
      }
    },
    async toDetail(ticketId, ids) {
      if (!ticketId) {
        this.$message.warn('该消息暂未解析到工单详情');
        return;
      }
      if (this.tab === '0') {
        this.setHaveRead(ids, false)
      }else {
        this.$emit('change', false);
      }
      this.goto({
        path: '/work-manage/detail',
        query: {
          id: ticketId
        }
      });
    },
    getMessageList(isInit = false) {
      if (isInit) {
        this.currentPage = 1;
      }
      let params = {
        clientId:'water_purification',
        clientTypes: [this.option.clientType],
        currentPage: this.currentPage,
        pageSize: this.pageSize,
        status: this.tab,
        type: ''
      };
      getMessageList(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.total = resultData.page.total;
          this.$emit('setTotal', { tab: this.tab, total: this.total });
          this.orderList = resultData.page.records.map(item => {
            item.ticket = item.ticket || {};
            item.originalData = item.originalJson ? JSON.parse(item.originalJson) : {};
            return item;
          });
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
.message-con__wrapper {
  .con-list-wrapper {
    height: calc(100vh - 280px);
    max-height: 450px;
    .con-list {
      height: 100%;
      .list {
        padding: 0 10px 0;
        height: 100%;
        overflow: auto;
        &.list-scroll {
          padding: 0 0 0 10px;
        }
        .message-item {
          padding: 8px 18px 12px;
          border-radius: 4px;
          margin-bottom: 10px;
          .item__top {
            color: #333;
            font-size: 18px;
            display: flex;
            justify-content: space-between;
            align-items: center;
            .top__name {
              padding-right: 16px;
            }
            .top__id {
              overflow: hidden;
              text-align: right;
              flex: 1;
              text-overflow: ellipsis;
              white-space: nowrap;
            }
          }
          .item__con {
            height: 42px;
            margin: 12px 0;
            color: #999;
            font-size: 14px;
            overflow: hidden;
            text-overflow: ellipsis;
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
          }
          .item__bottom {
            display: flex;
            justify-content: space-between;
            width: 100%;
            .bottom__date {
              color: #666666;
              font-size: 14px;
              line-height: 22px;
              text-align: center;
            }
            .bottom__read {
              padding: 2px 6px;
              cursor: pointer;
              border-radius: 3px;
              background-color: #e6f7ff;
              border: 1px solid #91d5ff;
              font-size: 12px;
              color: #1890ff;
            }
          }
        }
      }
    }
    .page {
      margin-top: 10px;
    }
  }
  .pagination-box {
    background-color: rgba(0,0,0,0);
    padding: 11px 10px;
    display: flex;
    justify-content: flex-end;
    align-items: center;
    .ant-btn {

      font-size: 12px;
      margin-left: 12px;
    }
  }
  .read-box{
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 40px;
    font-size: 14px;
    letter-spacing: 0;
    /deep/ .wpg-btn {
      border-radius: 0 0 4px 4px;
      background-color: var(--supply-color-bg-card-DEFAULT);
      flex: 1;
      border: none;
    }
  }
}
</style>
