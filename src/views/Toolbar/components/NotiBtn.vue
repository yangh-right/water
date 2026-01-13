<template>
  <div class="noti-btn supply-text-xs supply-text-primary">
    <span :class="['noti-span', isConfirm ? 'unactive' : '']" @click="confirmAlarm">{{
      isConfirm ? '已确认' : '确认'
    }}</span>
    <span v-if="item.ticketId" class="noti-span unactive">派单</span>
    <span
      v-else
      class="noti-span"
      @click="$emit('change', 'handleAdd', item.id, item.deviceId, item.phId, item.solutionId)"
      >派单</span
    >
    <w-dropdown>
      <a class="ant-dropdown-link" @click="selectChange">更多</a>
      <w-menu slot="overlay">
        <w-menu-item>
          <a
            href="javascript:;"
            @click="
              $emit('change', 'gotoPage', '/diagnosis/alarmDetails', {
                alarmId: item.id,
                ticketId: item.ticketId
              })
            "
            >查看详情</a
          >
        </w-menu-item>
        <w-menu-item>
          <a
            href="javascript:;"
            @click="
              $emit('change', 'gotoPage', '/runMonitor/pumpOverview', {
                siteId: item.phId,
                name: item.phName
              })
            "
            >污水厂详情</a
          >
        </w-menu-item>
        <w-menu-item>
          <a
            href="javascript:;"
            @click="
              $emit('change', 'gotoPage', '/diagnosis/alarmList', {
                siteId: item.phId,
                name: item.phName
              })
            "
            >查看报警历史</a
          >
        </w-menu-item>
      </w-menu>
    </w-dropdown>
  </div>
</template>

<script>
import { alarmConfirm } from '@/api/diagnosis';
export default {
  name: 'NotiBtn',
  props: {
    item: {
      default: () => {},
      type: Object
    }
    // id: {
    //     default: '',
    //     type: String,
    // },
    // phName: {
    //     default: '',
    //     type: String,
    // },
    // phId: {
    //     default: '',
    //     type: String,
    // },
    // deviceId: {
    //     default: '',
    //     type: String,
    // },
    // ticketId: {
    //     default: '',
    //     type: String,
    // },
    // confirmStatus: {
    //     default: '0',
    //     type: String,
    // },
  },
  data() {
    return {
      isConfirm: false
    };
  },
  watch: {
    confirmStatus(val) {
      this.isConfirm = val;
    }
  },
  methods: {
    selectChange() {},
    /* 确认报警 */
    confirmAlarm() {
      if (this.isConfirm) return false;
      this.$confirm({
        title: '提示',
        content: '您确定要提交吗',
        onOk: () => {
          alarmConfirm(this.item.id).then(res => {
            let { status } = res;
            if (status === 'complete') {
              this.$message.success('确认成功');
              this.isConfirm = true;
            }
          });
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.noti-span {
  margin-right: 24px;
  display: inline-block;
  cursor: pointer;
  &.unactive {
    color: #c0c0c0;
  }
}
</style>
