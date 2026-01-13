<template>
  <div class="base-info wfc1">
    <div class="form-title">基本信息</div>
    <w-info-form ref="baseForm" :model="form" :fields="baseFields" :layout="layout" :footer="null">
      <template #deviceType>
        <DeviceType
          v-model.trim="form.deviceType"
          :isSingleSelect="true"
          :allowClear="true"
          @change="handleDeviceType"
        ></DeviceType>
      </template>
    </w-info-form>
  </div>
</template>

<script>
import { baseFields } from '../config';
import InfoMixin from './InfoMixin';
import DeviceType from '../../components/DeviceType.vue';
import { sysDictListByCode } from '@/api/deviceManagement';
import { mapState } from 'vuex';
export default {
  name: 'BaseInfo',
  mixins: [InfoMixin],
  components: { DeviceType },
  props: {
    form: {
      type: Object,
      default: () => {}
    },
    type: {
      type: String,
      default: ''
    },
    deviceId: {
      type: String,
      default: ''
    },
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      baseFields
    };
  },
  computed: {
    ...mapState('account', ['user'])
  },
  watch: {},
  async created() {
    await this.getSystemDictList('purification_use_state', 'deviceStatus');
    await this.getSystemDictList('device_grade', 'deviceGrade');
  },
  activated() {},
  methods: {
    // 获取使用状态
    async getSystemDictList(key, value) {
      const { resultData } = await sysDictListByCode(key);
      this[value + 'Options'] = resultData.map(i => {
        return {
          label: i.dictName,
          value: i.dictCode,
          ...i
        };
      });
      this.baseFields.find(i => i.name === value).options = this[value + 'Options'];
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    handleDeviceType(value, label, extra, treeData) {
      let deviceClassify = treeData.filter(item => {
        return item.children.some(child => child.dictCode === value);
      });
      this.form.deviceParentType =
        deviceClassify.length > 0 ? deviceClassify[0].dictCode : undefined;
    },
    formValidate() {
      this.$refs['baseForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['baseForm'].$_resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.base-info {
  width: 100%;
  .form-title {
    padding-bottom: 10px;
    // color: #333;
    font-size: 16px;
  }
  .form-special {
    // display: flex;
    // flex-direction: row;
    position: relative;
    .button-container {
      position: absolute;
      left: 100%;
      top: 0;
      display: flex;
    }
  }
  .form-text {
    position: absolute;
    height: 40px;
    color: #999;
    width: 400px;
    top: 28px;
    left: 0;
    display: flex;
    align-items: center;
    .form-text-item {
      max-width: 30%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
