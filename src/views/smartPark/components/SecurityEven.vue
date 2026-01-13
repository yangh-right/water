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
          <div class="name">设备名称</div>
          <div class="time">告警名称</div>
          <div class="reason">告警时间</div>
          <div class="action">操作</div>
        </div>
        <div class="table-body">
          <div v-for="(item, i) in tableData" :key="i" class="table-tr">
            <div class="name">{{ item.deviceName }}</div>
            <div class="time">{{ item.alarmName }}</div>
            <div class="reason">{{ item.alarmTime }}</div>
            <div class="action">
              <span>处理</span>
              <span>关闭</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </bim-card>
</template>

<script>
import BimCard from './BimCard.vue';
export default {
  name: 'SecurityEven',
  components: {
    BimCard
  },
  data() {
    return {
      cardTitle: '安防事件',
      tableData: [
        {
          deviceName: '72号围栏',
          alarmTime: '05/31  12:34',
          alarmName: '入侵告警'
        },
        {
          deviceName: '71号围栏',
          alarmTime: '05/30  10:09',
          alarmName: '入侵告警'
        },
        {
          deviceName: '62号围栏',
          alarmTime: '05/29  16:14',
          alarmName: '入侵告警'
        },
        {
          deviceName: '8号围栏',
          alarmTime: '05/29  09:22',
          alarmName: '入侵告警'
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
      background: url('~@/assets/images/default/smartPark/table_head.png') no-repeat;
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
      height: 34px;
      display: flex;
      align-items: center;
      background: url('~@/assets/images/default/smartPark/table_dark.png') no-repeat;
      background-size: 100% 100%;
      padding: 0 0 0 12px;
      box-sizing: border-box;
      margin-top: 4px;

      .name {
        font-weight: 500;
        font-size: 14px;
        color: #d8f0ffcc;
        letter-spacing: 0;
        text-align: center;
      }
      .time {
        font-weight: 500;
        font-size: 14px;
        color: #d8f0ffcc;
        letter-spacing: 0;
        text-align: center;
        line-height: 16px;
      }

      .reason {
        font-weight: 500;
        font-size: 14px;
        color: #d8f0ffcc;
        letter-spacing: 0;
        text-align: center;
        line-height: 16px;
      }
      .action {
        font-weight: 500;
        font-size: 14px;
        color: #22bcff;
        letter-spacing: 0;
        text-align: center;
        line-height: 16px;
        span {
          margin-left: 6px;
        }
      }
    }
    .table-tr:nth-child(even) {
      background: url('~@/assets/images/default/smartPark/table_light.png') no-repeat;
    }
    .name {
      flex-basis: 100px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
      display: flex;
      align-items: center;
    }
    .time {
      flex-basis: 120px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .reason {
      flex-basis: 120px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .action {
      flex-basis: 120px;
      text-align: center;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
