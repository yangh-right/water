<template>
  <div class="message-box">
    <!-- <div class="message-level" :class="['message-level' + info.alarmLevel]">
      {{ info.alarmLevel }}
    </div> -->
    <div class="message-right">
      <div class="message-top">
        <div class="message-title" :title="item.title || ''" @click="$emit('change', item.businessId)">
          {{ item.title || '' }}
        </div>
        <span v-if="showCloseAllBtn" class="close-all" @click.stop="$emit('closeAll')">
          关闭全部
        </span>
      </div>
      <div class="message-info" v-html="item.content">
        <!-- <span class="message-time">{{ time + ' ' }}</span>
        <span class="message-detail">{{
          info.stationName + ' ' + info.industryDeviceName + ' ' + '发生了' + ' ' + info.alarmName
        }}</span> -->
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'MessageBox',
  props: {
    item: {
      type: Object,
      default: () => {},
      require: true
    },
    type: {
      type: String,
      default: '0'
    },
    showCloseAllBtn: {
      type: Boolean,
      default: false
    }
  },
  // computed: {
  //   info() {
  //     console.log(this.item);
  //     console.log(JSON.parse(this.item.originalJson));
  //     return JSON.parse(this.item.originalJson);
  //   },
  //   time() {
  //     if (JSON.parse(this.item.originalJson).createTime) {
  //       let time = JSON.parse(this.item.originalJson).createTime.replace(/T/g,' ')
  //       let time1 = new Date(time).getTime();
  //       let now = new Date().getTime();
  //       if (now - time1 <= 60*1000) {
  //         return '刚刚'
  //       }
  //       return time
  //     } else {
  //       return ''
  //     }
  //   }
  // }
};
</script>

<style lang="less" scoped>
.message-box {
  min-height: 21px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  font-size: 12px;
  .message-level {
    width: 40px;
    text-align: center;
    height: 20px;
    line-height: 20px;
    border-radius: 4px;
    color: #fff;
    margin-right: 9px;
    &.message-level1 {
      background: #ed5162;
    }
    &.message-level2 {
      background: #ff922b;
    }
    &.message-level3 {
      background: #2c65e0;
    }
    &.message-level4 {
      background: #33db24;
    }
  }
  .message-right {
    flex: auto;
    // padding-right: 35px;
    .message-top {
      display: flex;
      justify-content: space-between;
      align-items: center;
      .message-title {
        width: 196px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 14px;
        cursor: pointer;
      }
      .close-all {
        cursor: pointer;
        margin-right: 20px;
      }
    }
    .message-info {
      min-height: 36px;
      max-height: 130px;
      overflow-y: auto;
    }
  }
}
</style>
