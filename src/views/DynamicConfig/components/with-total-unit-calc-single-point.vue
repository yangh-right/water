<!--
  @author: zhangxiang
  @date: 2021-08-27 16:18:22
  @desc：设施-设备-监测量 选择
-->
<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <slot name="prev" :form="form" />
      <template v-for="(item, idx) in form.domains">
        <w-row :key="item.key + '-' + idx" :gutter="[12]">
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-modelFactorCode`"
              :prop="`domains[${idx}].modelFactorCode`"
              :rules="{
                required: true,
                message: configData.message,
                trigger: 'change'
              }"
              required
              :label="configData.label"
            >
              <w-info-select
                v-model="form.domains[idx].modelFactorCode"
                :placeholder="configData.placeholder"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :options="modelList"
                @change="
                  (val, node) => {
                    handlModelChange(val, node, idx);
                  }
                "
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-deviceId`"
              :prop="`domains[${idx}].deviceId`"
              :rules="{
                required: true,
                message: '设备不能为空!',
                trigger: 'change'
              }"
              required
              label="设备选择"
            >
              <w-info-select
                v-model="form.domains[idx].deviceId"
                placeholder="选择设备"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
                :options="deviceList"
                @change="handleDeviceChange($event, idx)"
              />
            </w-form-model-item>
          </w-col>
          <w-col :span="7">
            <w-form-model-item
              :ref="`${form.domains[idx].key}-pointName`"
              required
              label="监测量选择"
              :prop="`domains[${idx}].pointName`"
              :rules="{
                required: true,
                message: '监测量不能为空!',
                trigger: 'change'
              }"
            >
              <w-info-select
                v-model="form.domains[idx].pointName"
                placeholder="选择监测量"
                :mode="single ? 'default' : 'multiple'"
                :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              >
                <w-select-option
                  v-for="item in pointMap[form.domains[idx].deviceId]"
                  :key="item.pointName"
                  :value="item.pointName"
                  >{{ item.pointMemo }}</w-select-option
                >
              </w-info-select>
            </w-form-model-item>
          </w-col>
          <slot name="extra" :item="item" :idx="idx" />
          <w-col :span="3">
            <w-form-model-item :wrapper-col="{ span: 24 }">
              <w-button
                v-if="form.domains.length > 1"
                type="link"
                size="small"
                icon="delete"
                class="wfc-alarm remove-button"
                @click="handleRemoveField(idx, item)"
              >
                删除
              </w-button>
              <w-button
                v-if="form.domains.length === idx + 1"
                type="link"
                size="small"
                icon="plus"
                class="add-button"
                @click="handleAddField"
              >
                添加
              </w-button>
            </w-form-model-item>
          </w-col>
        </w-row>
      </template>
      <slot />
    </w-form-model>
    <div class="footer">
      <w-button type="primary" :loading="loading" @click="handleSubmit">提交</w-button>
    </div>
  </div>
</template>

<script>
import CommonMixin from '../mixins/common-mixin';
// import { getNeedOption } from '@/views/DeviceManageNew/common/config';
// import { getModelConfig, getModelInstance } from '@/api/interligenDosing';
import { selectDevicePointByDeviceEntityId } from '@/api/device-operation';

const defaultData = {
  message: '配置编码不能为空!',
  label: '配置编码',
  placeholder: '选择配置编码'
};
export default {
  name: 'with-total-unit-calc-single-point',
  mixins: [CommonMixin],
  inheritAttrs: false,
  props: {
    waterPlantId: {
      type: String
    },
    info: {
      type: Object
    },
    form: {
      type: Object
    },
    loading: {
      type: Boolean,
      default: false
    },
    single: {
      type: Boolean,
      default: true
    }
  },
  data() {
    return {
      configData: defaultData,
      modelList: [],
      deviceList: [],
      // 记录对应deviceId下的point
      pointMap: {}
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.initForm();
        }
      },
      immediate: true
    }
  },
  activated() {
    this.init();
  },
  mounted() {
    this.init();
  },
  methods: {
    init() {
      let typeCode = this.$route.query.typeCode;
      if (typeCode === 'IntelligentChlorinationModel') {
        this.configData = {
          message: '模型实例不能为空!',
          label: '模型实例',
          placeholder: '选择模型实例'
        };
      } else {
        this.configData = defaultData;
      }
    },
    initForm() {
      if (this.form.domains.length) {
        for (let i = 0; i < this.form.domains.length; i++) {
          const { deviceId } = this.form.domains[i];

          if (deviceId) {
            this.handleDeviceChange(deviceId, i, false);
          }
        }
      } else {
        this.handleAddField();
      }
      let typeCode = this.$route.query.typeCode;
      if (typeCode === 'IntelligentChlorinationModel') {
        this.getInstanceCode();
      } else {
        this.getmodelCode();
      }

      this.getDeviceList();
    },

    // 获取配置编码
    async getmodelCode() {
      console.log(this.info, 'info');
      let res = await getModelConfig({
        modelCode:
          this.info.originCode === 'IntelligentChlorinationModel' ||
          this.info.originCode === 'IntelligentPumpGroupModel'
            ? this.info.originCode
            : this.info.typeCode,
        pageFlag: false
      });
      this.modelList = getNeedOption(res?.resultData || [], ['confName', 'confCode', 'confName']);
    },

    async getInstanceCode() {
      let res = await getModelInstance({
        modelCode: this.info.typeCode,
        stationId: this.waterPlantId,
        productCode: 'wpg-waterwork-001',
        pageFlag: false
      });
      this.modelList = getNeedOption(res?.resultData || [], ['instanceName', 'id', 'instanceName']);
    },

    // 获取设备
    async getDeviceList() {
      // FIXME: 获取设备列表
      let res = await this.$axios.get(
        `/waterwork-device-api/Facilities/queryDeviceByWaterPlantId`,
        {
          params: {
            id: this.waterPlantId,
            pageFlag: false
          }
        }
      );
      this.deviceList = getNeedOption(res?.resultData || [], ['deviceName', 'deviceId']);
    },
    handlModelChange(val, node, idx) {
      this.form.domains[idx].modelFactorName = node.data.props.dictCode;
    },
    // 获取对应设备的监测量
    async handleDeviceChange(deviceId, idx, reset = true) {
      if (!deviceId || !this.waterPlantId) {
        return;
      }
      if (reset) {
        this.form.domains[idx].pointName = undefined;
      }
      try {
        // FIXME: 获取监测量
        // const { resultData } = await this.$axios.post('/waterwork-device-api/industryDevice/selectDevicePointByDeviceEntityId', {
        //   waterPlantId: this.waterPlantId,
        //   deviceId,
        //   pageFlag: false
        // });
        const { resultData } = await selectDevicePointByDeviceEntityId({
          waterPlantId: this.waterPlantId,
          deviceId
        });
        this.$set(this.pointMap, deviceId, resultData);
      } catch (error) {
        console.log(error);
        this.$set(this.pointMap, deviceId, []);
      }
    },
    // handlePointChange(value, idx) {
    //   const item = this.form.domains[idx];
    //   const pointList = this.pointMap[item.deviceId] || [];
    //   item.pointInfo = pointList.filter((i) => value.includes(i.monitoringQuantityName));
    // },
    handleRemoveField(idx) {
      this.form.domains.splice(idx, 1);
    },
    // 新增字段
    handleAddField() {
      this.form.domains.push({
        key: Date.now(),
        modelFactorName: undefined,
        modelFactorCode: undefined,
        deviceId: undefined,
        pointName: []
      });
    },
    handleSubmit() {
      this.$refs['form'].validate(valid => {
        if (valid) {
          this.$emit('submit', this.form.domains.slice(0));
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.form-wrapper {
  .footer {
    flex: 0 0 54px;
    text-align: right;
    padding: 0 24px;
    margin-top: 24px;
  }
}
</style>
