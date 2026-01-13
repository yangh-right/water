<!--
 * @Description:
 * @Author: limz
 * @Date: 2021-10-21 09:21:28
 * @LastEditTime: 2021-10-21 13:30:31
 * @LastEditors: limz
-->
<template>
  <w-tooltip trigger="click">
    <template slot="title">
      <div class="delay-alarm query-form">
        <div class="title supply-text-sm">推迟处理该报警</div>
        时间：
        <w-select
          v-model="delayTime"
          :getPopupContainer="triggerNode => triggerNode.parentNode"
          :options="timeList"
        ></w-select>
        <div class="supply-text-right">
          <a @click="delay">确定</a>
        </div>
      </div>
    </template>
    <slot />
  </w-tooltip>
</template>

<script>
import { DelayAlarm } from '@/api/diagnosis';
// 秒-s  分钟-m 小时-h 天-d 周-w
const timeList = [
  {
    label: '4小时',
    value: '4-h'
  },
  {
    label: '8小时',
    value: '8-h'
  },
  {
    label: '1天',
    value: '1-d'
  },
  {
    label: '3天',
    value: '3-d'
  },
  {
    label: '1周',
    value: '1-w'
  }
];
export default {
  name: 'DelayAlarm',
  props: {
    alarmId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      delayTime: '4-h',
      timeList
    };
  },
  methods: {
    async delay() {
      this.$confirm({
        title: '提示',
        content: '您确定要延迟处理吗?',
        onOk: async () => {
          let { alarmId, delayTime } = this;
          let params = {
            alarmId,
            delay: delayTime.split('-')[0],
            timeUnit: delayTime.split('-')[1]
          };
          let { status } = await DelayAlarm(params);
          if (status === 'complete') {
            this.$message.success('设置成功');
            this.$emit('change');
          }
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
.delay-alarm {
  width: 180px;
  padding: 8px 9px;
  .ant-select {
    width: 120px;
    margin: 8px 0;
  }
  .supply-text-right {
    a {
      color: #008184;
    }
  }
}
</style>
