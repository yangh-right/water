<template>
  <w-modal
    :destroyOnClose="true"
    :title="runTimeObj ? '编辑' : '新增'"
    :visible="visible"
    height="80vh"
    width="650px"
    centered
    :maskClosable="false"
    @cancel="cancel"
    @ok="handlerFrom"
  >
    <w-row class="config-wrap">
      <w-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :labelCol="{ span: 10 }"
        :wrapperCol="{ span: 14 }"
      >
        <w-col span="24">
          <w-form-model-item label="选择污水厂" prop="waterPlantId">
            <FactorySelect v-model.trim="form.waterPlantId" autoSelect></FactorySelect>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="碳排放来源" prop="sourceType">
            <w-select v-model="form.sourceType" placeholder="请选择碳排放来源" allowClear>
              <w-select-option v-for="item in sourceTypeList" :key="item.key" :value="item.key">{{
                item.label
              }}</w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="碳排放气体" prop="gasType">
            <w-select v-model="form.gasType" placeholder="请选择碳排放气体" allowClear>
              <w-select-option v-for="item in gasTypeList" :key="item.key" :value="item.key">{{
                item.label
              }}</w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24" v-if="form.sourceType === 2">
          <w-form-model-item label="净水设备" prop="deviceId">
            <w-select
              show-search
              v-model="form.deviceId"
              placeholder="请选择净水设备"
              option-filter-prop="children"
              :filter-option="filterOption"
              allowClear
            >
              <w-select-option v-for="item in deviceIdList" :key="item.key" :value="item.key">{{
                item.label
              }}</w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="排放量(tonCO₂)" prop="emissionValue">
            <w-input-number
              v-model="form.emissionValue"
              placeholder="请输入排放量"
              style="width: 100%;"
            />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="数据录入时间" prop="dataTime">
            <w-date-picker
              v-model="form.dataTime"
              :disabled-date="disabledDate"
              show-time
              allowClear
              valueFormat="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import FactorySelect from '@/components/factory-select/index.vue';
import { addOrUpdateCarbonEmission } from '@/api/reportRecord';
const paramsData = {
  waterPlantId: '',
  sourceType: undefined,
  gasType: undefined,
  deviceId: undefined,
  emissionValue: '',
  dataTime: null
};
export default {
  name: 'ConfigEdit',
  components: {
    FactorySelect
  },
  props: {
    runTimeObj: {
      type: Number,
      default: 0
    },
    rowData: {
      type: Object,
      default: () => {}
    },
    gasTypeList: {
      type: Array,
      default: () => []
    },
    sourceTypeList: {
      type: Array,
      default: () => []
    },
    deviceIdList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: cloneDeep(paramsData),
      teamList: [],
      visible: false,
      rules: {
        waterPlantId: [{ required: true, message: '请选择水厂' }],
        sourceType: [{ required: true, message: '请选择碳排放源' }],
        emissionValue: [{ required: true, message: '请输入排放量' }],
        dataTime: [{ required: true, message: '请选录入时间' }]
      }
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.initData();
      }
    },
    runTimeObj(val) {
      if (!val) {
        this.form = cloneDeep(paramsData);
      }
    }
  },
  methods: {
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    },
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        let {
          waterPlantId,
          sourceType,
          gasType,
          deviceId,
          emissionValue,
          dataTime,
          id
        } = this.rowData;
        this.form = {
          waterPlantId,
          sourceType,
          gasType: gasType === 0 ? undefined : gasType,
          deviceId,
          emissionValue,
          dataTime,
          id
        };
      }
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            ...this.form,
            deviceId: this.form.sourceType === 2 ? this.form.deviceId : ''
          };
          let { status } = await addOrUpdateCarbonEmission(params);
          if (status === 'complete') {
            let message = this.runTimeObj ? '编辑成功' : '新增成功';
            this.$message.success(message);
            this.visible = false;
            this.form = cloneDeep(paramsData);
            this.$emit('cancel', true);
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.config-wrap {
  max-height: 70vh;
  overflow: auto;
}
/deep/.wpg-form-item-label {
  width: 150px;
}
.form-footer {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.af-time {
  position: relative;

  &::after {
    content: '年';
    font-weight: 500;
    font-size: 14px;
    color: var(--supply-color-third);
    position: absolute;
    right: -20px;
    top: 7px;
  }
}
</style>
@/api/reportRecord
