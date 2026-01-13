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
          <w-form-model-item label="模型监测量编号" prop="modelName">
            <w-input v-model.trim="form.modelName" placeholder="请输入模型监测量编号" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="模型监测量名称" prop="modelMemo">
            <w-input v-model.trim="form.modelMemo" placeholder="请输入模型监测量名称" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="模型编号别名" prop="modelAlias">
            <w-input v-model.trim="form.modelAlias" placeholder="请输入模型编号别名" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="默认值" prop="defaultValue">
            <w-input v-model.trim="form.defaultValue" placeholder="默认值" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="模型监测量单位" prop="modelUnit">
            <w-input v-model.trim="form.modelUnit" placeholder="请输入模型监测量单位" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="构筑物" prop="placeId">
            <w-select v-model="form.placeId" placeholder="请选择构筑物名称" showSearch allowClear>
              <w-select-option
                v-for="item in structureList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24" v-if="form.placeId">
          <w-form-model-item label="行业设备监测量" prop="pointName">
            <w-select v-model="form.pointName" placeholder="请选择行业设备监测量" showSearch allowClear>
              <w-select-option
                v-for="item in placePointNameList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}({{ item.value }})</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import { cloneDeep } from 'lodash-es';
import FactorySelect from '@/components/factory-select/index.vue';
import { updateForecastCode, addForecastCode } from '@/api/runTime';
import { queryList } from '@/api/deviceManagement'
import { pointByDeviceIdListApi } from '@/api/analysis'
const paramsData = {
  waterPlantId: '',
  modelName: '',
  modelMemo: '',
  modelUnit: '',
  modelAlias: '',
  pointName: '',
  defaultValue: '',
  placeId: undefined,
  id: undefined,
  delFlag: 0
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
    structureList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      form: cloneDeep(paramsData),
      visible: false,
      rules: {
        waterPlantId: [{ required: true, message: '请选择污水厂' }]
      },
      placePointNameList: [],
      firstChange: true
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
    },
    'form.placeId'(val) {
      if (val) {
        this.getPointList(val);
        if (!this.firstChange) {
          this.form.pointName = undefined;
        } else {
          this.firstChange = false;
        }
      }
    }
  },
  created() {
    this.initData();
  },
  methods: {
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        this.form = {
          ...this.rowData
        };
      }
      this.firstChange = true;
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let {
            waterPlantId,
            modelName,
            modelMemo,
            placeId,
            modelAlias,
            modelUnit,
            pointName,
            defaultValue,
            id,
            delFlag
          } = this.form;
          let params = {
            waterPlantId,
            modelName,
            modelMemo,
            placeId,
            modelAlias,
            modelUnit,
            pointName,
            defaultValue,
            id,
            delFlag
          };
          let method = this.runTimeObj ? updateForecastCode : addForecastCode;
          let { status } = await method(params);
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
    },
    async getPointList(placeId) {
      let placeParam = {
        'placeId': placeId,
        'pageFlag': false
      }
      let { status, resultData } = await queryList(placeParam);
      this.placePointNameList = [];
      if (status === 'complete') {
        let industreyDeviceIds = resultData.records.map(data => data.industryDeviceId).filter(deviceId => deviceId != undefined && deviceId != null);
        if (industreyDeviceIds && industreyDeviceIds.length > 0) {
          let { status, resultData } = await pointByDeviceIdListApi(industreyDeviceIds);
          if (status === 'complete') {
            this.placePointNameList = resultData.map(data => {
              return {
                label: data.pointMemo,
                value: data.pointName
              }
            });
          }
        }
      }
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
