<template>
  <div class="header-message">
    <w-popover
      v-model="visible"
      class="test"
      placement="bottom"
      trigger="click"
      overlayClassName="message-popover"
    >
      <template slot="content">
        <div class="message-con" :style="{ backgroundColor: popoverBgColor }">
          <div class="con-title supply-text-main">
            {{ option.value.name }}
          </div>
          <w-tabs v-model="tab">
            <w-tab-pane
              v-for="(tab, i) of tabList"
              :key="tab.code"
              :tab="tab.name + tab.total"
              forceRender
            >
              <!-- 工单内容组件 -->
              <message-con
                :option="option.value"
                :ref="'msg' + tab.code"
                :visible="visible"
                :tab="tab.code"
                @setTotal="setTotal"
                @change="messageChange"
              ></message-con>
            </w-tab-pane>
          </w-tabs>
        </div>
      </template>

      <div class="supply-px-2 supply-cursor-pointer">
        <w-icon :type="option.value.icon" />
        <span class="supply-px-2">{{ option.value.name }}</span>
        <span>{{ unRead }}</span>
      </div>
    </w-popover>
  </div>
</template>

<script>
import { getMessageList } from '@/api/baseInfo';
import MessageCon from './components/MessageCon';
import { mapMutations } from 'vuex';
import Bus from './Bus.js';
export default {
  name: 'HeaderMessage',
  components: { MessageCon },
  props: {
    option: {
      type: Object,
      default: () => ({})
    }
  },
  inject: ['state'],
  data() {
    return {
      tabList: [
        { code: '0', name: '未读', total: '' },
        { code: '1', name: '已读', total: '' }
      ],
      tab: '0',
      visible: false,
      total: 0,
      pages: 0,
      unRead: 0,
      checkedAll: false,
      orderList: []
    };
  },
  computed: {
    checkedIds: function() {
      let ids = [];
      this.orderList.map(a => {
        if (a.checked) {
          ids.push(a.id);
        }
      });
      return ids;
    },
    popoverBgColor() {
      return this.state.theme === 'dark' ? '#20262F' : '#f5f7fa';
    }
  },
  watch: {
    visible(val) {
      this.getUnReadNum();
      this.setAbloutStatus(val);
    }
  },
  created() {
    Bus.$on(this.option.code + 'Ws', () => {
      this.getUnReadNum();
    });
  },
  mounted() {
    this.getUnReadNum();
    this.timer = setInterval(() => {
      this.getUnReadNum();
    }, 20 * 1000);
  },
  beforeDestroy() {
    Bus.$off(this.option.code + 'Ws');
  },
  destroyed() {
    clearInterval(this.timer);
  },
  methods: {
    ...mapMutations('pub', ['setAbloutStatus']),
    setTotal(data) {
      let total = typeof data.total === 'number' ? '（' + data.total + '）' : '';
      this.$set(this.tabList[data.tab], 'total', total);
    },
    /* 未读工单数 */
    getUnReadNum() {
      let params = {
        clientId: 'water_purification',
        clientTypes: [this.option.clientType],
        currentPage: 1,
        pageSize: 0,
        status: '0',
        type: ''
      };
      getMessageList(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.unRead = resultData.page.total;
        }
      });
    },
    messageChange(visible) {
      this.visible = visible;
      if (visible) {
        this.tabList.forEach(item => {
          if (this.$refs['msg' + item.code]) {
            this.$refs['msg' + item.code][0].getMessageList(true);
          }
        });
      }
      this.getUnReadNum();
    }
  }
};
</script>

<style scoped lang="less">
.message-con {
  border-radius: 4px;
  background-color: #f5f7fa;
  .con-title {
    border-radius: 4px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 14px;
  }
  /deep/.wpg-tabs-nav {
    width: 100%;

    div:first-child {
      height: 48px;
      display: flex;
      width: 100%;
    }

    .wpg-tabs-tab {
      flex: 1;
      justify-content: center;
      margin: 0 8px;
      text-align: center;
      vertical-align: middle;
      line-height: 32px;
    }
  }
  .con-bottom {
    padding: 11px 10px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    .ant-btn {
      font-size: 12px;
      margin-left: 12px;
    }
  }
}
</style>

<style lang="less">
.wpg-popover.message-popover {
  .wpg-popover-inner-content {
    width: 360px;
    padding: 0;
  }
}
</style>
