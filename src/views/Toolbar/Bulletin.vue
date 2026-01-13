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
        <div class="message-con">
          <div class="con-title supply-text-main supply-shadow" @click="pushAlarm">
            通知公告
          </div>
          <div class="con-list-wrapper">
            <div v-if="messageList.length > 0" class="con-list">
              <div class="list">
                <div
                  v-for="m in messageList"
                  :key="m.id"
                  class="message-item supply-bg-bg-card-DEFAULT"
                >
                  <bulletin-con :item="m" @change="gotoPage"></bulletin-con>
                </div>
              </div>
            </div>
            <w-empty v-else ></w-empty>
          </div>
          <div class="con-bottom supply-bg-bg-card-DEFAULT">
            <w-checkbox v-model="checkedAll" @change="changeCheckedAll">全选</w-checkbox>
            <span>
              <w-button style="margin-right:12px" @click="batchMessage">批量已读</w-button>
              <w-button type="primary" size="small" @click="gotoPage('/baseInfo/noticeList', {})"
                >更多通告</w-button
              >
            </span>
          </div>
        </div>
      </template>

      <div class="supply-px-2 supply-cursor-pointer" @click="handleMenuClick">
        <w-icon type="ic_assignment_late" />
        <span class="supply-px-2">公告</span>
        <span>{{ unRead }}</span>
      </div>
    </w-popover>
  </div>
</template>

<script>
import { updateReadInfo, alarmPushAll, unreadNum, unreadList } from '@/api/baseInfo';
import BulletinCon from './components/BulletinCon';
import { mapMutations } from 'vuex';
export default {
  name: 'HeaderBulletin',
  components: { BulletinCon },
  data() {
    return {
      visible: false,
      total: 0,
      pages: 0,
      unRead: 0,
      checkedAll: false,
      option: {
        pageNum: 1,
        pageSize: 10,
        rowType: '0'
      },
      messageList: []
    };
  },
  computed: {
    checkedIds: function() {
      let ids = [];
      this.messageList.map(a => {
        if (a.checked) {
          ids.push(a.id);
        }
      });
      return ids;
    }
  },
  watch: {
    checkedIds(val) {
      this.checkedAll = val.length === this.messageList.length;
    },
    visible(val) {
      this.getUnReadNum();
      this.setAbloutStatus(val);
    }
  },
  mounted() {
    this.getUnReadNum();
    this.timer = setInterval(() => {
      this.getUnReadNum();
    }, 20 * 1000);
  },
  destroyed() {
    clearInterval(this.timer);
  },
  methods: {
    ...mapMutations('pub', ['setAbloutStatus']),
    /* 通知数 */
    getUnReadNum() {
      unreadNum().then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.unRead = resultData;
        }
      });
    },
    pushAlarm() {
      let params = {
        message: {
          id: new Date().getTime(),
          noticeType: '1',
          publishBy: 'diudiu',
          publishDate: '2021-04-23 13:14:17',
          pushType: '1',
          title: '云边的小卖部' + new Date().getTime()
        },
        sysCode: 'alarm_socket_push',
        userIds: ['366893146c434cd9a634f2db631dfcd8']
      };
      alarmPushAll(params); // 手动推送通告
    },
    handleMenuClick() {
      this.visible = !this.visible;
      if (this.visible) {
        this.getMessageList();
      }
    },
    /* 跳转页面 */
    gotoPage(_path, obj, readFlag) {
      if (obj.id && readFlag == 0) {
        updateReadInfo([obj.id]);
        this.getMessageList();
      }
      this.drillDown({
        path: _path,
        query: obj
      });
      this.visible = false;
    },
    getMessageList() {
      unreadList().then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.messageList = resultData.map(r => {
            return {
              ...r,
              checked: false
            };
          });
        }
      });
    },
    changePageNum() {
      this.getMessageList();
    },
    changeCheckedAll() {
      this.messageList.map(a => {
        a.checked = this.checkedAll;
      });
    },
    batchMessage() {
      let { checkedIds } = this;
      if (checkedIds.length <= 0) {
        this.$message.info('您还未选择通知');
        return false;
      }
      this.$confirm({
        title: '提示',
        content: `您共选中了${checkedIds.length}项，要批量处理吗？`,
        onOk: () => {
          updateReadInfo(checkedIds).then(res => {
            if (res.status === 'complete') {
              this.$message.success('操作成功');
              this.getMessageList();
              this.getUnReadNum();
            }
          });
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
.message-con {
  .con-title {
    height: 50px;
    line-height: 50px;
    text-align: center;
    font-size: 14px;
  }
  .con-list-wrapper {
    // background: #f5f7fa;
    padding: 12px 10px;
    height: calc(100vh - 240px);
    max-height: 450px;
    .con-list {
      overflow-y: auto;
      height: 100%;
      ul.list {
        // height: calc(100% - 35px);
        height: 100%;
        overflow: auto;
      }
    }
    .message-item {
      padding: 8px 18px 12px;
      border-radius: 4px;
      margin-bottom: 10px;
      cursor: pointer;
    }
    .page {
      margin-top: 10px;
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
