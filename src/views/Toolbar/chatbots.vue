<template>
  <div class="talkfixed">
    <VueDragResize
      :isActive="isActive"
      :isResizable="false"
      :isDraggable="true"
      :w="98"
      :h="95"
      :x="x"
      :y="y"
      :z="1000"
      @clicked="isActive = true"
      @dragstop="isActive = false"
    >
      <div
        :class="{ chatElve: true, chatWizards: environment === '1' }"
        @dblclick="visible = true"
      ></div>
      <w-modal v-model="visible" :footer="null" width="80%">
        <div class="title">
          <span>你好，我是智慧水宝宝</span><img src="../../assets/chatElve/symbol.png" />
        </div>
        <div class="second-title">尊敬的用户，欢迎踏上智慧之旅，智慧水宝宝将为您指引方向。</div>
        <div class="chat-box" ref="chatContainer" id="scroll-to-bottom">
          <img src="../../assets/chatElve/prompt-title.png" />
          <div class="prompt-content">
            <div class="prompt-content-list" v-for="(item, index) in promptList" :key="index">
              <img src="../../assets/chatElve/point.png" style="width: 5px;height: 5px;" />
              <span>{{ item.fileOriginName }}</span>
              <w-button
                type="text"
                @click="goSearch(item.fileOriginName)"
                class="supply-float-right"
                >提问</w-button
              >
            </div>
          </div>
          <div style="text-align: center;">
            {{ currentTime }}
          </div>
          <div class="chat-content" v-for="(item, index) in chatList" :key="index">
            <div v-if="item.label === 'my'" class="my-chat">{{ item.value }}</div>
            <div v-if="item.label === 'fr'" class="fr-chat">{{ item.value }}</div>
            <div v-if="item.label === 'tm'" class="fr-chat">{{ timeFormat(item.value) }}</div>
          </div>
        </div>
        <div class="search">
          <w-input
            style="border-radius: 16px;height: 28px;"
            v-model="keyword"
            @keyup.enter="goSearch(keyword)"
          ></w-input>
          <img src="../../assets/chatElve/send.png" @click="goSearch(keyword)" />
        </div>
      </w-modal>
    </VueDragResize>
  </div>
</template>
<script>
import moment from 'moment';
import { debounce } from 'throttle-debounce';
import { getSysParamByCode } from '@/api/index';
import { getPage } from '@/api/fileManagement';
import VueDragResize from 'vue-drag-resize';
export default {
  name: 'chatbots',
  components: { VueDragResize },
  data() {
    return {
      isActive: false,
      visible: false,
      x: 1800,
      y: 810,
      keyword: '',
      currentTime: moment().format('HH:mm:ss'),
      promptList: [], //提示问题
      chatList: [
        {
          label: 'fr',
          value: '你好，我是智慧水宝宝，欢迎来到智慧水宝宝!'
        }
      ],
      environment: '2' // 1，广州  2，杭州
    };
  },
  watch: {
    visible() {
      if (this.visible) {
        this.getList();
      }
    },
    chatList(val) {
      if (val) {
        // debounce(800, this.upChatList)
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    }
  },
  created() {
    this.x = window.innerWidth - 100;
    this.y = window.innerHeight - 100;
    this.getEnvironment();
  },
  methods: {
    getEnvironment() {
      getSysParamByCode('environment').then(res => {
        if (res.resultData === '1') {
          this.environment = '1';
        } else {
          this.environment = '2';
        }
      });
    },
    async getList() {
      let params = {
        defaultFile: 1
      };

      try {
        let res = await getPage(params);
        this.promptList = res?.resultData?.records;
      } catch (e) {
        console.log(e);
      }
    },
    async goSearch(params) {
      this.chatList.push({
        label: 'my',
        value: params
      });
      try {
        let keyWord = encodeURIComponent(params);
        let res = await this.$http.post(`/waterPlantFile/searchFile?keyword=${keyWord}`);
        this.chatList.push({
          label: 'fr',
          value: res?.resultData[0].remark
        });
      } catch (e) {
        this.chatList.push({
          label: 'fr',
          value: '抱歉，没有找到相关内容'
        });
      }
    },
    upChatList() {
      console.log(6666666666666666);
      this.chatList.push({
        label: 'tm',
        value: moment()
      });
    },
    scrollToBottom() {
      let scroll_to_bottom = document.getElementById('scroll-to-bottom');
      scroll_to_bottom.scrollTop = scroll_to_bottom.scrollHeight;
    },
    timeFormat(time) {
      const today = new Date().getTime();
      // 当前时间减去获取到的时间
      const sub = today - time;
      const day = 1000 * 60 * 60 * 24;
      const timeDate = new Date(time);
      const currentYear = new Date().getFullYear();
      const getYear = new Date(time).getFullYear();
      const HHmm = `${formatTime2('hh', timeDate)}:${formatTime2('mm', timeDate)}`;
      const showWeekDay = isShowWeekDay(sub, timeDate.getDay());
      if (currentYear > getYear) {
        return `${formatTime2('yyyy年MM月dd日', timeDate)} ${todayTimeFormat(
          timeDate.getHours()
        )} ${formatTime2('hh:mm', timeDate)}`;
      } else if (showWeekDay) {
        return `${weekFormat(timeDate.getDay())} ${HHmm}`;
      } else if (sub > day && sub < day * 2) {
        return `昨天 ${HHmm}`;
      } else if (sub <= day) {
        return HHmm;
      } else {
        return `${formatTime2('MM月dd日', timeDate)} ${todayTimeFormat(
          timeDate.getHours()
        )} ${formatTime2('hh:mm', timeDate)}`;
      }
    },
    // 是否显示周几
    isShowWeekDay(sub, weekDay) {
      const currentWeekDay = new Date().getDay();
      const dayTime = 1000 * 60 * 60 * 24;
      // 1.当前时间与消息时间相差必须大于2天小于7天
      // 2.当前时间距离本周一相差必须大于2天且小于当前距离周一的天数
      // 3.消息时间不可能是0-周日，因为周日没有给后面时间留空间，不会走这里的逻辑，而是走今天的逻辑
      if (sub >= dayTime * 2 && weekDay !== 0 && sub <= dayTime * currentWeekDay) {
        return true;
      } else {
        return false;
      }
    },
    // 转换今日的时辰格式
    todayTimeFormat(e) {
      if (e >= 0 && e < 7) {
        return '凌晨';
      } else if (e >= 7 && e < 11) {
        return '上午';
      } else if (e >= 11 && e < 13) {
        return '中午';
      } else if (e >= 13 && e < 18) {
        return '下午';
      } else if (e >= 18 && e < 24) {
        return '晚上';
      } else {
        return '';
      }
    },
    //星期格式转换 0-6：周日到周六
    weekFormat(e, prefix = '周') {
      switch (e) {
        case 0:
          return prefix + '日';
        case 1:
          return prefix + '一';
        case 2:
          return prefix + '二';
        case 3:
          return prefix + '三';
        case 4:
          return prefix + '四';
        case 5:
          return prefix + '五';
        case 6:
          return prefix + '六';
        default:
          return '';
      }
    },
    ////时间格式化兼容 ios
    ormatTime2(fmt, timestamp) {
      var date = new Date(timestamp); // 兼容safari
      var o = {
        'M+': date.getMonth() + 1,
        'd+': date.getDate(),
        'h+': date.getHours(),
        'm+': date.getMinutes(),
        's+': date.getSeconds(),
        'q+': Math.floor((date.getMonth() + 3) / 3),
        S: date.getMilliseconds()
      };
      if (/(y+)/.test(fmt)) {
        fmt = fmt.replace(RegExp.$1, (date.getFullYear() + '').substr(4 - RegExp.$1.length));
      }
      for (var k in o) {
        if (new RegExp('(' + k + ')').test(fmt)) {
          fmt = fmt.replace(
            RegExp.$1,
            RegExp.$1.length === 1 ? o[k] : ('00' + o[k]).substr(('' + o[k]).length)
          );
        }
      }
      return fmt;
    }
  }
};
</script>
<style lang="less" scoped>
::-webkit-scrollbar-thumb {
  border-radius: 3px;
  background-color: #acc3e8;
  width: 2px;
}

.talkfixed {
  bottom: 0;
  right: 0;
  color: #333;

  /deep/.inactive {
    z-index: 1000 !important;
  }

  .chatElve {
    width: 98px;
    height: 85px;
    background-image: url(../../assets/chatElve/Chatbots.png);
    background-repeat: no-repeat;
    background-position: center center;
    background-size: 100%;
    &.chatWizards {
      background-image: url(../../assets/chatElve/chatWizards.png);
    }
  }
}

/deep/.wpg-modal-body {
  padding: 14px 0 0 0;
}

/deep/.wpg-btn {
  height: 24px;
  color: #8db5f7;
  border-color: #fff;
  border-radius: 18px;
}

/deep/.wpg-modal-content {
  background: url(../../assets/chatElve/background.png);
  background-repeat: no-repeat;
  padding: 16px;
  height: 662px;
  background-size: cover;
  min-width: 1100px;
  max-width: 1587px;
  margin-left: 100px;

  .title {
    height: 33px;
    margin-bottom: 8px;

    span {
      font-family: PingFangSC-SNaNpxibold, sans-serif;
      font-weight: 600;
      font-size: 24px;
      color: #00437d;
    }

    img {
      margin: 0 0 18px 8px;
    }
  }

  .second-title {
    width: 392px;
    height: 20px;
    font-family: PingFangSC-Regular, sans-serif;
    font-weight: 400;
    font-size: 14px;
    color: #5290c6;
    margin-bottom: 18px;
  }

  .chat-box {
    width: 100%;
    height: 492px;
    box-shadow: inset 0 1px 2px 0 #ffffff;
    border-radius: 6px;
    padding: 13px 18px 0 16px;
    overflow: scroll;
    background: url(../../assets/chatElve/chat-content-bg.png);
    background-repeat: no-repeat;

    .prompt-content {
      width: 100%;
      margin: 16px 0;
      display: flex;
      justify-content: space-between;
      align-content: center;
      flex-wrap: wrap;

      .prompt-content-list {
        width: 30%;
        margin-top: 20px;
        margin-left: 12px;
        padding: 8px;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        background: #edf6ff;
        border-radius: 6px;

        img {
          width: 140px;
          height: 20px;
          margin: auto 0;
          margin-right: 6px;
        }
      }
    }

    .chat-content {
      margin: 6px 0;

      .my-chat {
        width: 55%;
        background: #4285f4;
        margin-left: 45%;
        padding: 12px;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #ffffff;
        border-radius: 8px 8px 0 8px;
      }

      .fr-chat {
        width: 55%;
        background: #edf6ff;
        padding: 12px;
        color: #666666;
        font-size: 14px;
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        border-radius: 8px 8px 0 0;
      }
    }
  }

  .search {
    width: 100%;
    margin-top: 18px;
    display: flex;
    align-items: center;

    img {
      margin-left: 14px;
      width: 28px;
      height: 28px;
    }
  }
}
</style>
