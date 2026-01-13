<template>
  <div class="form-wrapper">
    <w-form-model ref="form" :model="form" :label-col="{ span: 8 }" :wrapper-col="{ span: 16 }">
      <w-row :gutter="[30]">
        <w-col :span="7">
          <w-form-model-item
            required
            label="进水采样点"
            :prop="`inWaterPoint`"
            :rules="{
              required: true,
              message: '进水采样点不能为空!',
              trigger: 'change'
            }"
          >
            <w-info-select
              v-model="form.inWaterPoint"
              :options="pointList"
              placeholder="选择进水采样点"
              @change="inWaterPointChange"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            />
          </w-form-model-item>
          <w-info-form
            ref="inWaterForm"
            class="info-form"
            :fields="fieldsInWater"
            :model="formInWater"
            :footer="null"
            :layout="{ span: 24, colon: true }"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 16 }"
          >
          </w-info-form>
        </w-col>
        <w-col :span="7">
          <w-form-model-item
            required
            label="出水采样点"
            :prop="`outWaterPoint`"
            :rules="{
              required: true,
              message: '出水采样点不能为空!',
              trigger: 'change'
            }"
          >
            <w-info-select
              v-model="form.outWaterPoint"
              :options="pointList"
              placeholder="选择出水采样点"
              @change="outWaterPointChange"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
            />
          </w-form-model-item>
          <w-info-form
            ref="outWaterForm"
            class="info-form"
            :fields="fieldsOutWater"
            :model="formOutWater"
            :footer="null"
            :layout="{ span: 24, colon: true }"
            :label-col="{ span: 8 }"
            :wrapper-col="{ span: 16 }"
          >
          </w-info-form>
        </w-col>
      </w-row>
    </w-form-model>
    <div class="footer">
      <w-button type="primary" :loading="loading" @click="handleSubmit">提交</w-button>
    </div>
  </div>
</template>

<script>
import CommonMixin from '../mixins/common-mixin';

export default {
  name: 'WaterPoint',
  mixins: [CommonMixin],
  props: {
    form: {
      type: Object
    }
  },
  data() {
    return {
      pointList: [],
      fieldsInWater: [
        {
          name: 'PH',
          type: 'select',
          label: 'PH',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        },
        {
          name: 'COD',
          type: 'select',
          label: 'COD',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        },
        {
          name: '浊度',
          type: 'select',
          label: '浊度',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        },
        {
          name: '氨氮',
          type: 'select',
          label: '氨氮',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        }
      ],
      fieldsOutWater: [
        {
          name: 'PH',
          type: 'select',
          label: 'PH',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        },
        {
          name: 'COD',
          type: 'select',
          label: 'COD',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        },
        {
          name: '浊度',
          type: 'select',
          label: '浊度',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        },
        {
          name: '余氯',
          type: 'select',
          label: '余氯',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        },
        {
          name: '氨氮',
          type: 'select',
          label: '氨氮',
          placeholder: '选择指标',
          options: [],
          attrs: {
            allowClear: true
          }
        }
      ],
      formInWater: {
        PH: undefined,
        COD: undefined,
        浊度: undefined,
        氨氮: undefined
      },
      formOutWater: {
        PH: undefined,
        COD: undefined,
        余氯: undefined,
        浊度: undefined,
        氨氮: undefined
      }
    };
  },
  watch: {
    waterPlantId: {
      handler(val) {
        if (val) {
          this.getPointList();
        }
      },
      immediate: true
    }
  },
  methods: {
    // 查询采样点
    async getPointList() {
      try {
        let res = await this.$http.post('waterwork-energy-api/SamplePoint/list', {
          pageFlag: false,
          waterPlantId: this.waterPlantId
        });
        let resultData = res?.resultData || [];
        this.pointList = Object.freeze(
          resultData.map((i) => ({
            key: i.id,
            value: i.id,
            label: i.name
          }))
        );
      } catch (error) {
        this.pointList = Object.freeze([]);
      }
    },
    async initForm() {
      if (this.form.inWaterPoint) {
        await this.inWaterPointChange(this.form.inWaterPoint);
      }
      if (this.form.outWaterPoint) {
        await this.outWaterPointChange(this.form.outWaterPoint);
      }
      this.formInWater = this.form.inWaterSample
        ? { ...this.form.inWaterSample }
        : { PH: undefined, COD: undefined, 浊度: undefined, 氨氮: undefined };
      this.formOutWater = this.form.outWaterSample
        ? { ...this.form.outWaterSample }
        : {
            PH: undefined,
            COD: undefined,
            余氯: undefined,
            浊度: undefined,
            氨氮: undefined
          };
    },
    async inWaterPointChange(val) {
      let arr = await this.getPointDetail(val);
      this.fieldsInWater.forEach((item, index) => {
        this.fieldsInWater[index].options = arr
          .map((_i) => ({ ..._i, label: _i.indexName, value: _i.id }))
          .filter((i) => i.validFlag);
      });
      this.formInWater = { PH: undefined, COD: undefined, 浊度: undefined, 氨氮: undefined };
    },
    async outWaterPointChange(val) {
      let arr = await this.getPointDetail(val);
      this.fieldsOutWater.forEach((item, index) => {
        this.fieldsOutWater[index].options = arr
          .map((_i) => ({ ..._i, label: _i.indexName, value: _i.id }))
          .filter((i) => i.validFlag);
      });
      this.formOutWater = { PH: undefined, COD: undefined, 余氯: undefined, 浊度: undefined, 氨氮: undefined };
    },
    handleSubmit() {
      this.$refs['form'].validate((valid) => {
        if (valid) {
          this.formInWater = {
            PH: this.formInWater['PH'] ? this.formInWater['PH'] : '',
            COD: this.formInWater['COD'] ? this.formInWater['COD'] : '',
            浊度: this.formInWater['浊度'] ? this.formInWater['浊度'] : '',
            氨氮: this.formInWater['氨氮'] ? this.formInWater['氨氮'] : ''
          };
          this.formOutWater = {
            PH: this.formOutWater['PH'] ? this.formOutWater['PH'] : '',
            COD: this.formOutWater['COD'] ? this.formOutWater['COD'] : '',
            余氯: this.formOutWater['余氯'] ? this.formOutWater['余氯'] : '',
            浊度: this.formOutWater['浊度'] ? this.formOutWater['浊度'] : '',
            氨氮: this.formOutWater['氨氮'] ? this.formOutWater['氨氮'] : ''
          };
          this.$emit('submit', {
            ...this.form,
            inWaterSample: { ...this.formInWater },
            outWaterSample: { ...this.formOutWater }
          });
        }
      });
    },
    async getPointDetail(id) {
      try {
        let params = {
          pageFlag: false,
          samplePointId: id,
          waterPlantId: this.waterPlantId
        };
        let res = await this.$http.post('waterwork-energy-api/SamplePointDetail/list', params);
        return res?.resultData || [];
      } catch (e) {
        console.log(e);
      }
    }
  }
};
</script>

<style lang="less" scoped>
.form-wrapper {
  .info-form {
    width: 100%;
    padding-left: 150px;
    box-sizing: border-box;
  }
  .footer {
    flex: 0 0 54px;
    text-align: right;
    padding: 0 24px;
    margin-top: 24px;
  }
}
</style>
