<!--
 * @Description:报警中心
 * @Author: limz
 * @Date: 2021-08-04 11:25:05
 * @LastEditTime: 2025-02-17 10:26:40
 * @LastEditors: wangyr
-->

<template>
  <div class="ai-chat-center">
    <div class="title">
      <span>你好，我是AI厂长</span><img src="../../assets/chatElve/symbol.png" />
    </div>
    <div class="second-title">尊敬的用户，欢迎踏上智慧之旅，AI厂长给将为您指引方向。</div>
    <div class="chat-box" ref="chatContainer" id="scroll-to-bottom">
      <img src="../../assets/chatElve/prompt-title.png" />
      <div class="prompt-content">
        <div class="prompt-content-list" v-for="(item, index) in promptList" :key="index">
          <img src="../../assets/chatElve/point.png" style="width: 5px;height: 5px;" />
          <span style="display: flex; gap: 10px;">{{ item }}</span>
          <w-button
            type="text"
            :disabled="request_flag"
            @click="goSearch(item)"
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
      <w-textarea
        style="border-radius: 12px;height: 120px;width: 100%; resize: none;"
        v-model="keyword"
        @keyup.enter="!request_flag && goSearch(keyword)"
        placeholder="和AI厂长聊天"
      >
      </w-textarea>
      <img src="../../assets/chatElve/send.png" @click="!request_flag && goSearch(keyword)" :disabled="request_flag"/>
    </div>
  </div>
</template>

<script>

import moment from 'moment';
import { accessToken } from '@wpg/framework-vue';

export default {
  name: 'aiChat',
  components: { },
  data() {
    return {
      keyword: '',
      currentTime: moment().format('HH:mm:ss'),
      promptList: ['污水厂出水总磷偏高是啥原因', '污水厂出水总氮偏高是啥原因', '污水厂氨氮偏高是啥原因'], //提示问题
      chatList: [
        {
          label: 'fr',
          value: '你好，我是AI厂长，欢迎咨询污水知识!'
        }
      ],
      request_flag: false
    };
  },
  watch: {
    chatList(val) {
      if (val) {
        this.$nextTick(() => {
          this.scrollToBottom();
        });
      }
    }
  },
  created() {
  },
  methods: {
    async sendAiMessageStream(data, onChunk) {
      try {
        this.request_flag = true;
        const response = await fetch('/main/purificationApi/ai/sendMessage', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + accessToken.get()
          },
          body: JSON.stringify(data)
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        if (!response.body) {
          throw new Error('Streaming not supported in this environment');
        }

        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let buffer = '';
        
        console.log('-----event start', new Date());
        while (this.request_flag) {
          const { done, value } = await reader.read();
          if (done) {
            break;
          }
          
          // 解码并添加到缓冲区
          buffer += decoder.decode(value, { stream: true });
          // 按行分割处理
          const lines = buffer.split('\n');
          buffer = lines.pop() || ''; // 最后一行可能不完整，放回缓冲区
          
          for (const line of lines) {
            const trimmedLine = line.trim();
            if (!trimmedLine) continue; // 跳过空行
            if (trimmedLine === 'event: close') {
              this.request_flag = false;
              break;
            }
            try {
              // 解析 JSON 对象
              const jsonData = JSON.parse(trimmedLine);
              // 调用回调函数，传递解析后的数据
              onChunk(jsonData);
            } catch (e) {
              console.warn('解析 JSON 失败:', trimmedLine, e);
            }
          }
        }
        
        // 处理缓冲区剩余内容
        if (buffer.trim()) {
          try {
            const jsonData = JSON.parse(buffer.trim());
            onChunk(jsonData);
          } catch (e) {
            console.warn('解析最后一行 JSON 失败:', buffer, e);
          }
        }
        this.request_flag = false;
      } catch (error) {
        console.log('....', error);
        this.request_flag = false;
      }
    },
    async goSearch(params) {
      if (this.request_flag) {
        return;
      }
      if (params === '') {
        return;
      }
      this.chatList.push({
        label: 'my',
        value: params
      });
      try {
        let requestParams = this.chatList.map(chatData => {
          return {
            'content': chatData.value,
            'role': chatData.label === 'fr' ? 'assistant' : 'user'
          }
        });
        this.keyword = '';
        this.chatList.push({
          label: 'fr',
          value: '思考中...'
        });
        const lastIndex = this.chatList.length - 1;
        this.request_flag = true;
        await this.sendAiMessageStream(requestParams, (chunkData) => {
          const { message, done } = chunkData;
          if (message && message.content) {
            if (this.chatList[lastIndex].value === '思考中...') {
              this.chatList[lastIndex].value = '';
            }
            this.$set(this.chatList, lastIndex, {
              ...this.chatList[lastIndex],
              value: this.chatList[lastIndex].value + chunkData.message.content
            });
          }
          if (done) {
            console.log('完整响应内容:', this.chatList[lastIndex].value);
            this.request_flag = false;
          }
        });
      } catch (e) {
        console.log(e);
        if (this.chatList[lastIndex].value === '思考中...') {
          this.chatList[lastIndex].value = '抱歉，没有找到相关内容';
        }
        this.request_flag = false;
      }
    },
    upChatList() {
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

.ai-chat-center {
  background: url(../../assets/chatElve/background.png);
  background-repeat: no-repeat;
  background-size: 100% 100%;
  background-position: center;
  padding: 16px;

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
    height: 560px;
    box-shadow: inset 0 1px 2px 0 #ffffff;
    border-radius: 6px;
    padding: 13px 18px 0 16px;
    overflow: scroll;
    background: url(../../assets/chatElve/chat-content-bg.png);
    background-repeat: no-repeat;
    background-size: 100% 100%;
    background-position: center;

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
        line-height: 20px; /* 根据内容高度调整，建议与元素高度匹配 */
        display: flex; /* 使用flex布局强制对齐（推荐） */
        align-items: center; /* 垂直居中对齐 */
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #666666;
        background: #edf6ff;
        border-radius: 6px;
        justify-content: space-between;

        img {
          width: 140px;
          height: 20px;
          margin: auto 0;
          margin-right: 8px;
        }

        .supply-float-right {
          margin-left: auto;
          margin-right: 8px;
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
        white-space: pre-wrap;
        word-break: break-all;
      }
    }
  }

  .search {
    width: 100%;
    height: 130px;
    margin-top: 18px;
    align-items: center;
    position: relative;

    img {
      position: absolute;
      right: 16px;
      bottom: 24px;
      width: 32px;
      height: 32px;
      object-fit: contain;
    }
  }
}
</style>
