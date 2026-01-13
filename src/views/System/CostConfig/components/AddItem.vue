<template>
  <w-modal :visible="visible" title="选择监测量" @ok="handleOk" @cancel="handleCancel">
    <w-form-model ref="form" :model="form" :colon="true" :rules="rules" :labelCol="{ span: 7 }" :wrapperCol="{ span: 17 }">
      <w-form-model-item prop="structureIdList" label="选择地点">
        <place-cascader v-model="form.structureIdList" :waterPlantId="waterPlantId" @change="locationChange"></place-cascader>
      </w-form-model-item>
      <w-form-model-item prop="deviceId" label="选择设备">
        <device-select-tree v-model="form.deviceId" :positionId="form.structureIdList.at(-1) || ''" @change="getPoint"></device-select-tree>
      </w-form-model-item>
      <w-form-model-item prop="pointId" label="选择监测量">
        <w-select
          v-model="form.pointId"
          :options="pointOptions"
          placeholder="请选择监测量"
          :getPopupContainer="node => node.parentNode"
          :dropdown-style="{
            maxHeight: '300px',
            overflow: 'auto'
          }"
        ></w-select>
      </w-form-model-item>
    </w-form-model>
  </w-modal>
</template>

<script>
import PlaceCascader from '@/components/place-select-tree/place-cascader.vue';
import DeviceSelectTree from '@/components/device-select-tree';
export default {
  name: 'AddItem',
  components: { PlaceCascader, DeviceSelectTree },
  props: {
    visible: {
      type: Boolean,
      default: false
    },
    waterPlantId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        structureIdList: [],
        deviceId: '',
        pointId: undefined
      },
      rules: {
        structureIdList: [{ required: true, message: '请选择数据源对应的地点' }],
        deviceId: [{ validator: this.structureRequiredValidate, trigger: ['blur', 'change'] }],
        pointId: [
          { validator: this.structureRequiredValidate, trigger: ['blur', 'change'] },
          { required: true, message: '请选择监测量' }
        ]
      },
      pointOptions: []
    };
  },
  methods: {
    async getPoint() {
      this.form.pointId = undefined;
      let { resultData } = await this.$http.post('/devicePoint/getDevicePointList', {
        pageFlag: false,
        positionId: this.form.structureIdList.at(-1),
        deviceId: this.form.deviceId
      });
      this.pointOptions = resultData.map(v => {
        return {
          title: v.pointMemo,
          value: v.id
        };
      });
    },
    async locationChange() {
      this.form.deviceId = '';
      this.form.pointId = undefined;
      this.$refs.form.clearValidate(['deviceId', 'pointId']);
      await this.getPoint();
    },
    async handleOk() {
      let cb = await this.$refs.form.validate();
      if (cb) {
        this.$emit('update:pointId', this.form.pointId);
        this.$emit(
          'update:pointOptions',
          this.pointOptions.filter(v => v.value === this.form.pointId)
        );
        this.handleCancel();
      }
    },
    handleCancel() {
      this.$refs.form.resetFields();
      this.form = {
        structureIdList: [],
        deviceId: '',
        pointId: undefined
      };
      this.pointOptions = [];
      this.$emit('update:visible', false);
    },
    structureRequiredValidate(rule, value, cb) {
      if (this.form.structureIdList.length === 0) cb(new Error('请先选择数据源对应的地点'));
      else cb();
    }
  }
};
</script>
<style lang="less" scoped></style>
