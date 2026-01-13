<!--
 * @Author: wangyr
 * @Date: 2023-05-30 19:52:35
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-05-31 16:41:34
 * @Description:
-->
<template>
  <bim-card :cardTitle="cardTitle">
    <div class="card-inner">
      <div class="table-box">
        <div class="table-head">
          <div class="name">状态</div>
          <div class="reality">报警名称</div>
          <div class="target">报警值</div>
          <div class="time">时间</div>
        </div>
        <div class="table-body">
          <div v-for="(item, i) in tableData" :key="i" class="table-tr">
            <div :class="[item.isAlarm ? 'name-active' : '', 'name']">
              <i :class="[item.isAlarm ? 'alarm-active' : 'alarm-end', 'ico-alarm']"></i
              >{{ item.status }}
            </div>
            <div class="reality">{{ item.name }}</div>
            <div class="target">{{ item.alarmVal }}</div>
            <div class="time">{{ item.time }}</div>
          </div>
        </div>
      </div>
    </div>
  </bim-card>
</template>

<script>
import BimCard from './BimCard.vue';
export default {
  name: 'RealAlarm',
  components: {
    BimCard
  },
  data() {
    return {
      cardTitle: '实时报警',
      tableData: [
        {
          isAlarm: true,
          status: '活动中',
          name: '出水COD',
          alarmVal: '75.0',
          time: '05/28  12:34'
        },
        {
          isAlarm: true,
          status: '活动中',
          name: '出水COD',
          alarmVal: '34.5',
          time: '05/28  12:34'
        },
        {
          isAlarm: true,
          status: '活动中',
          name: '出水COD',
          alarmVal: '30.7',
          time: '05/28  12:34'
        },
        {
          isAlarm: false,
          status: '已结束',
          name: '出水COD',
          alarmVal: '75.9',
          time: '05/28  12:34'
        }
      ]
    };
  },
  computed: {},
  watch: {},
  methods: {},
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.card-inner {
  width: 100%;
  height: 100%;
  position: relative;
  padding: 0 12px;
  box-sizing: border-box;

  .table-box {
    width: 100%;
    height: 100%;

    .table-head {
      height: 34px;
      display: flex;
      align-items: center;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      background: url('~@/assets/images/default/alarm-hd.png') no-repeat;
      background-size: 100% 100%;

      div {
        font-family: PingFangSC-Regular, sans-serif;
        font-weight: 400;
        font-size: 14px;
        color: #b2dfff;
        letter-spacing: 0;
      }
    }
    .table-body {
      width: 100%;
      height: calc(100% - 34px);
      overflow: auto;
    }
    .table-tr {
      height: 31px;
      display: flex;
      align-items: center;
      background: url('~@/assets/images/default/alarm-tr.png') no-repeat;
      background-size: 100% 100%;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      margin-top: 4px;

      .name {
        font-family: PingFangSC-SNaNpxibold, sans-serif;
        font-weight: 600;
        font-size: 14px;
        letter-spacing: 0;
        color: #9bc9ef;
      }
      .name-active {
        color: #ff7675;
      }
      .ico-alarm {
        display: inline-block;
        width: 24px;
        height: 24px;
        margin-right: 6px;
      }
      .alarm-active {
        background: url('~@/assets/images/default/alarm-active.png') no-repeat;
      }
      .alarm-end {
        background: url('~@/assets/images/default/alarm-end.png') no-repeat;
      }
      .reality {
        color: #ffffffff;
        font-size: 14px;
        font-weight: 600;
        letter-spacing: 0;
        text-align: left;
      }

      .target {
        font-weight: 700;
        font-size: 14px;
        color: #ffffff;
        letter-spacing: 0;
      }
      .time {
        font-weight: 700;
        font-size: 14px;
        color: #ffffff;
        letter-spacing: 0;
      }
    }
    .name {
      flex-grow: 1;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }
    .reality {
      flex-basis: 80px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .target {
      flex-basis: 80px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .time {
      flex-basis: 120px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
