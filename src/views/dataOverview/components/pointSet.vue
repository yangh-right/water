<template>
  <w-modal
    :visible="visible"
    title="监测量展示配置"
    :width="648"
    :mask="true"
    :height="320"
    @cancel="visible = false"
    @ok="handleConfirm"
  >
    <div class="page-wrapper">
      <div class="device-name">{{ deviceInfor.deviceName }}:</div>
      <div class="points-list">
        <w-checkbox-group v-model="checkedList" :options="plainOptions" />
      </div>
    </div>
  </w-modal>
</template>
<script>
import { addOrUpdateDeviceConfig } from '@/api/dataBoard';
export default {
  name: 'pointSet',
  props: {
    deviceInfor: {
      type: Object,
      default: () => {}
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      checkedList: [],
      plainOptions: []
    };
  },
  watch: {
    deviceInfor: {
      handler(val) {
        if (Object.keys(val).length > 0) {
          this.handleData();
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    handleData() {
      this.checkedList = this.deviceInfor.deviceDataList
        .filter(item => item.isShow)
        .map(item => item.pointName);
      this.plainOptions = this.deviceInfor.deviceDataList.map(item => ({
        ...item,
        label: item.pointMemoAlias,
        value: item.pointName
      }));
    },
    async handleConfirm() {
      let params = {
        id: this.deviceInfor.deviceId,
        industryDeviceId: this.deviceInfor.deviceId,
        pointNames: this.checkedList.join(',')
      };
      let { status, resultData } = await addOrUpdateDeviceConfig(params);
      if (status === 'complete') {
        this.visible = false;
        this.$message.success('操作成功！');
        this.$emit('selectChange');
      }
    }
  }
};
</script>
<style lang="less" scoped>
.page-wrapper {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .device-name {
    margin-bottom: 6px;
  }
}
</style>
