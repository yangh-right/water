<template>
  <w-modal
    :destroyOnClose="true"
    :title="runTimeObj.type ? '编辑' : '新增'"
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
          <w-form-model-item label="模型名称" prop="modelName">
            <w-input v-model="form.modelName" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="模型编号" prop="modelCode">
            <w-input v-model="form.modelCode" :disabled="!!runTimeObj.type" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="模型类型" prop="modelTypeCode">
            <w-select v-model="form.modelTypeCode">
              <w-select-option
                v-for="(item, index) in runTimeObj.modelList"
                :key="item.dictValue"
                :value="item.dictValue"
                >{{ item.dictName }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="选择污水厂" prop="waterPlantId">
            <FactorySelect v-model.trim="form.waterPlantId" autoSelect></FactorySelect>
          </w-form-model-item>
        </w-col>
        <w-col span="24" class="param-title">
          <w-form-model-item :labelCol="{ span: 8 }" label="输入参数" prop=""> </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item :wrapperCol="{ span: 24 }" prop="inputParam">
            <input-param
              :pointsList="pointsList"
              ref="inputForm"
              v-model="form.inputParam"
              style="width: 100%;"
            />
          </w-form-model-item>
        </w-col>
        <w-col span="24" class="param-title">
          <w-form-model-item label="输出参数" prop=""> </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="默认监测量" prop="outputParam">
            <point-select :rawPoints="pointsList" v-model="form.outputParam"> </point-select>
          </w-form-model-item>
        </w-col>
        <w-col v-show="outputParamLabel1" span="24">
          <w-form-model-item :label="outputParamLabel1" prop="outFlowOutputParam">
            <point-select :rawPoints="pointsList" v-model="form.outFlowOutputParam"> </point-select>
          </w-form-model-item>
        </w-col>
        <w-col v-show="outputParamLabel2" span="24">
          <w-form-model-item :label="outputParamLabel2" prop="otherOutputParam">
            <point-select :rawPoints="pointsList" v-model="form.otherOutputParam"> </point-select>
          </w-form-model-item>
        </w-col>
        <w-col v-show="outputParamLabel3" span="24">
          <w-form-model-item :label="outputParamLabel3" prop="sludgeOutputParam">
            <point-select :rawPoints="pointsList" v-model="form.sludgeOutputParam"> </point-select>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import FactorySelect from '@/components/factory-select/index.vue';
import InputParam from './InputParam';
import pointSelect from './pointSelect';
import { addParamConfiguration, allPointList, editParamConfiguration } from '@/api/runTime';
export default {
  name: 'ConfigEdit',
  components: {
    InputParam,
    pointSelect,
    FactorySelect
  },
  props: {
    runTimeObj: {
      type: Object,
      default: () => ({
        obj: ''
      })
    }
  },
  data() {
    return {
      outputParamLabel1: '',
      outputParamLabel2: '',
      outputParamLabel3: '',
      pointsList: [],
      form: {
        modelCode: '',
        modelTypeCode: '',
        modelName: '',
        waterPlantId: '',
        inputParam: [],
        outputParam: [],
        outFlowOutputParam: [],
        otherOutputParam: [],
        sludgeOutputParam: []
      },
      visible: false,
      rules: {
        modelName: [{ required: true, message: '请输入模型名称' }],
        modelCode: [{ required: true, message: '请输入模型编号' }],
        modelTypeCode: [{ required: true, message: '请选择模型类别' }],
        waterPlantId: [{ required: true, message: '请选择水厂' }],
        inputParam: [{ validator: this.checkInputParam }],
        outputParam: [{ required: true, message: '请选择监测量' }]
      }
    };
  },
  watch: {
    'form.modelTypeCode': {
      handler(val) {
        if (!val) {
          this.outputParamLabel1 = '';
          this.outputParamLabel2 = '';
          this.outputParamLabel3 = '';
        } else if (val === '4') {
          this.outputParamLabel1 = '硝化监测量';
          this.outputParamLabel2 = '厌氧释磷监测量';
          this.outputParamLabel3 = '智能排泥监测量';
        } else {
          this.outputParamLabel1 = '出水预测监测量';
          this.outputParamLabel2 = '微生物监测量';
          this.outputParamLabel3 = '';
        }
      },
      immediate: true
    },
    'runTimeObj.obj': {
      handler(e) {
        if (e) {
          let {
            modelCode,
            modelTypeCode,
            modelName,
            waterPlantId,
            inputParam,
            outputParam,
            outFlowOutputParam,
            otherOutputParam,
            sludgeOutputParam
          } = e;
          try {
            this.form = {
              modelCode,
              modelTypeCode,
              modelName,
              waterPlantId,
              inputParam: inputParam ? JSON.parse(inputParam) : [],
              outputParam: outputParam ? JSON.parse(outputParam) : [],
              outFlowOutputParam: outFlowOutputParam ? JSON.parse(outFlowOutputParam) : [],
              otherOutputParam: otherOutputParam ? JSON.parse(otherOutputParam) : [],
              sludgeOutputParam: sludgeOutputParam ? JSON.parse(sludgeOutputParam) : []
            };
          } catch (error) {
            this.form = {
              modelCode,
              modelTypeCode,
              modelName,
              waterPlantId,
              inputParam: [],
              outputParam: [],
              outFlowOutputParam: [],
              otherOutputParam: [],
              sludgeOutputParam: []
            };
          }
        } else {
          this.form = {
            modelCode: '',
            modelTypeCode: '',
            modelName: '',
            waterPlantId: '',
            inputParam: [],
            outputParam: [],
            outFlowOutputParam: [],
            otherOutputParam: [],
            sludgeOutputParam: []
          };
        }
      },
      immediate: true,
      deep: true
    }
  },
  created() {
    this.getAllpoints();
  },
  methods: {
    /* 所有监测量 */
    getAllpoints() {
      allPointList({}).then(res => {
        if (res.status === 'complete') {
          this.pointsList = res.resultData.map(p => {
            return {
              ...p,
              defaultValue: p.defaultValue ?? null,
              label: p.pointMemo,
              value: p.pointName,
              key: p.pointName
            };
          });
        }
      });
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    checkInputParam(rule, value, callback) {
      this.$refs.inputForm
        ?.handlerFrom()
        .then(res => {
          callback();
        })
        .catch(err => {
          callback(new Error(' '));
        });
    },
    checkOutput(rule, value, callback) {
      if (value?.length) {
        callback();
      } else {
        callback(new Error('请选择监测量'));
      }
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let {
            modelCode,
            modelTypeCode,
            modelName,
            waterPlantId,
            inputParam,
            outputParam,
            outFlowOutputParam,
            otherOutputParam,
            sludgeOutputParam
          } = this.form;
          let params = {
            modelCode,
            modelTypeCode,
            modelName,
            waterPlantId,
            inputParam: JSON.stringify(inputParam),
            outputParam: JSON.stringify(outputParam),
            outFlowOutputParam: JSON.stringify(outFlowOutputParam),
            otherOutputParam: JSON.stringify(otherOutputParam),
            sludgeOutputParam: JSON.stringify(sludgeOutputParam),
            id: this.runTimeObj.obj === '' ? '' : this.runTimeObj.obj.id
          };
          if (this.form.modelTypeCode !== '4') {
            params.sludgeOutputParam = '[]';
          }
          let method = this.runTimeObj.type ? editParamConfiguration : addParamConfiguration;

          let { status } = await method(params);
          if (status === 'complete') {
            let message = this.runTimeObj.type ? '编辑成功' : '新增成功';
            this.$message.success(message);
            this.visible = false;
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
.param-title {
  /deep/.wpg-form-item-label {
    position: relative;
    left: -30px;
  }
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
