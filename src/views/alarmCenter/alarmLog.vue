<template>
  <div class="log">
    <div class="log__item">
      <rectangleTitle title="报警日志"> </rectangleTitle>
      <div class="log__table">
        <AutoSizeTable :columns="columns1" :data-source="alarmList"> </AutoSizeTable>
      </div>
    </div>
    <div class="log__item">
      <rectangleTitle title="操作日志"> </rectangleTitle>
      <div class="log__table">
        <AutoSizeTable :columns="columns2" :data-source="operateList"> </AutoSizeTable>
      </div>
    </div>
  </div>
</template>

<script>
import AutoSizeTable from '@/components/AutoSizeTable';
import rectangleTitle from '@/components/Title/rectangleTitle';
import { getLog } from '@/api/diagnosis';
export default {
  components: { rectangleTitle, AutoSizeTable },

  data() {
    return {
      columns1: [
        {
          title: '序号',
          dataIndex: 'num',
          width: 60,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '设备名称',
          width: 100,
          dataIndex: 'deviceName',
          ellipsis: true
        },
        {
          title: '描述',
          dataIndex: 'logText',
          ellipsis: true
        },
        {
          title: '报警时间',
          dataIndex: 'createTime',
          width: 180,
          ellipsis: true
        }
      ],
      columns2: [
        {
          title: '序号',
          dataIndex: 'num',
          width: 60,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '操作人',
          width: 100,
          dataIndex: 'nickname',
          ellipsis: true
        },
        {
          title: '描述',
          dataIndex: 'logText',
          ellipsis: true
        },
        {
          title: '操作时间',
          dataIndex: 'createTime',
          width: 180,
          ellipsis: true
        }
      ],
      alarmList: [],
      operateList: []
    };
  },
  methods: {
    async getAlarmLog() {
      let params = { size: 100, logType: 2 };
      const { resultData, status } = await getLog(params);
      if (status === 'complete') {
        this.alarmList = resultData || [];
      }
    },
    async getOperateLog() {
      let params = { size: 100, logType: 1 };
      const { resultData, status } = await getLog(params);
      if (status === 'complete') {
        this.operateList = resultData || [];
      }
    }
  }
};
</script>
<style lang="less" scoped>
.log {
  padding: 0 12px 16px;
  /deep/ .rectangle-title {
    line-height: 60px;
    height: 60px;
    padding-bottom: 4px;
    padding-top: 5px;
  }
  height: 100%;
  &__item {
    height: 50%;
    display: flex;
    flex-direction: column;
    .log__table {
      overflow: hidden;
      flex: 1;
    }
  }
}
</style>
