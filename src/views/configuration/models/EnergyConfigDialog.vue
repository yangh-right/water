<!--
 * @Description: 能耗配置弹框
 * @Author: zhangtianwen
 * @LastEditTime: 2024-12-13 10:51:03
-->
<template>
  <w-modal
    class="secondary-modal"
    v-model="visible"
    :title="modelTitle"
    :width="800"
    centered
    :maskClosable="false"
    ok-text="保存"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <custom-form ref="customForm" :options="options" @submit="submit"></custom-form>
  </w-modal>
</template>

<script>
import CustomForm from '@/components/CustomForm';
import {
  getEnergyService as apiGetEnergyService,
  setEnergyConfig as apiAddEnergyConfig
} from '@/api';

const _customData = {
  genOptions(type, opt, self) {
    const _option = {
      layout: {
        gutter: 24,
        span: 24,
        labelCol: { span: 24 },
        wrapperCol: { span: 24 }
      },
      list: [
        {
          fieldType: 'select',
          fieldName: 'pointWater',
          label: '供水量',
          placeholder: '请选择供水量',
          options: self.serviceWater,
          attrs: {
            mode: 'multiple'
          }
        },
        {
          fieldType: 'select',
          fieldName: 'pointPower',
          label: '耗电量',
          placeholder: '请选择耗电量',
          options: self.serviceEnergy,
          attrs: {
            mode: 'multiple'
          }
        },
        {
          fieldType: 'select',
          fieldName: 'pointPressure',
          label: '出口压力',
          placeholder: '请选择出口压力',
          options: self.servicePress,
          attrs: {
            mode: 'multiple'
          }
        }
      ]
    };

    if (type === 2 && opt && opt.waterPlantId) {
      _option.list.forEach((v, idx) => {
        v.label = `${self.formData.siteSvgName + v.label}:`;
        v.initialValue = (opt[v.fieldName] && opt[v.fieldName].split(',')) || [];
      });
    }
    return _option;
  }
};

const transformList = function(arr = []) {
  return arr.map(v => {
    v.value = v.serviceId;
    v.label = `${v.nickname}-${v.serviceId}`;
    return v;
  });
};

export default {
  name: 'EnergyConfigDialog',
  components: { CustomForm },
  props: {
    formType: {
      type: Number,
      default: 1 // 1->新增; 2->编辑
    },
    formData: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      visible: false,
      options: _customData.genOptions(this.formType, this.formData, this),
      serviceWater: [],
      serviceEnergy: [],
      servicePress: []
    };
  },
  computed: {
    modelTitle() {
      let { siteName = '', siteSvgName = '' } = this.formData;
      return `${siteName} - ${siteSvgName}`;
    }
  },
  watch: {
    visible(val) {
      if (val) {
        this.getServiceTree();
      }
    }
  },
  methods: {
    // 获取监测量列表
    async getServiceTree() {
      let { waterPlantId = '' } = this.formData;
      let data = await Promise.all([
        apiGetEnergyService(waterPlantId, 1),
        apiGetEnergyService(waterPlantId, 2),
        apiGetEnergyService(waterPlantId, 3)
      ]);
      this.serviceWater = transformList(data[0]);
      this.serviceEnergy = transformList(data[1]);
      this.servicePress = transformList(data[2]);
      this.options = _customData.genOptions(2, this.formData, this);
    },
    handleSubmit() {
      this.$refs.customForm.submit();
    },
    handleCancel() {
      this.$refs.customForm.reset();
      this.visible = false;
    },
    submit(data) {
      let { pointPower = [], pointWater = [], pointPressure = [] } = data;
      let { waterPlantId = '', svgId = '' } = this.formData;
      let params = {
        waterPlantId,
        svgId,
        pointPower: pointPower.join(',') || '',
        pointWater: pointWater.join(',') || '',
        pointPressure: pointPressure.join(',') || ''
      };
      this.addConfig(params);
    },
    // 添加能耗配置
    async addConfig(data) {
      await apiAddEnergyConfig(data);
      this.$message.success('添加成功');
      this.handleCancel();
      this.$emit('update');
    }
  }
};
</script>

<style scoped lang="less"></style>
