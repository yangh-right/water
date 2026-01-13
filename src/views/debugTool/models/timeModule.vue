<!--
 * @Author: your name
 * @Date: 2022-01-12 11:02:19
 * @LastEditTime: 2024-05-17 12:25:12
 * @LastEditors: yuan wenyu
 * @Description: 时间组件
 * @FilePath: \ergongscreen\src\views\mainPage\module\timeModule.vue
-->
<template>
  <div class="timeModule">
    <div class="time">{{ time }}</div>
    <div class="split"></div>
    <div class="date-box">
      <div class="week">{{ week }}</div>
      <div class="date">{{ date }}</div>
    </div>
  </div>
</template>

<script>
//定义函数，将一位数"1"转为两位数"01"
const weekTrans = {
  0: '星期日',
  1: '星期一',
  2: '星期二',
  3: '星期三',
  4: '星期四',
  5: '星期五',
  6: '星期六'
};
import moment from 'moment';
export default {
  name: 'TimeModule',
  data() {
    return {
      date: '',
      week: '',
      time: '',
      timer: null //timer interval pointer
    };
  },
  mounted() {
    this.tikTok();
    this.timer = setInterval(this.tikTok, 1000);
  },
  beforeDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.timer = null;
  },
  methods: {
    tikTok() {
      const day = moment();
      this.date = day.format('YYYY.MM.DD');
      this.week = weekTrans[day.day()];
      this.time = day.format('HH:mm:ss');
    }
  }
};
</script>

<style lang="less" scoped>
.timeModule {
  display: flex;
  align-items: center;
  .time {
    font-family: MiSans-Demibold, sans-serif;
    font-weight: 600;
    font-size: 22px;
    color: #f2f9ff;
    letter-spacing: 0;
    text-align: right;
  }
  .split {
    margin: 0 5px 0 10px;
    width: 1px;
    height: 20px;
    background: #0069c4;
  }
  .date-box {
    .week {
      font-family: MiSans-Regular, sans-serif;
      font-weight: 400;
      font-size: 12px;
      color: #f2f9ff;
      line-height: 12px;
      letter-spacing: 0;
      text-align: center;
    }
    .date {
      font-family: MiSans-Regular, sans-serif;
      font-weight: 400;
      transform: scale(0.84);
      font-size: 12px;
      color: #f2f9ff;
      letter-spacing: 0;
    }
  }
}
</style>
