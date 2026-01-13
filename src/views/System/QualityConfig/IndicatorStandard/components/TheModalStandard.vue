<template>
  <div>
    <w-modal
      :title="title"
      :visible="visible"
      :confirmLoading="confirmLoading"
      width="600px"
      @ok="handleSubmit"
      :maskClosable="false"
      @cancel="handleCancel"
    >
      <w-info-form :footer="null" :model="form" :fields="modalField" ref="form">
        <template #factory>
          <w-row>
            <w-col :span="6" style="padding-right: 10px">
              <w-select v-model="form.warningName">
                <w-select-option
                  v-for="item in warningNameList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </w-select-option>
              </w-select>
            </w-col>
            <w-col :span="18">
              <RangeForm
                :form="form"
                ref="range1Form"
                :fieldNameList="fieldNameListC"
                :unit="unit"
                v-if="rangeType"
              ></RangeForm>
              <OptionForm
                :form="form"
                ref="option1Form"
                :fieldNameList="fieldNameListCO"
                :options="options"
                v-else
              ></OptionForm>
            </w-col>
          </w-row>
        </template>
        <template #national>
          <w-row>
            <w-col :span="6" style="padding-right: 10px">
              <w-select v-model="form.limitName">
                <w-select-option
                  v-for="item in limitNameList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </w-select-option>
              </w-select>
            </w-col>
            <w-col :span="18">
              <RangeForm
                :form="form"
                ref="range2Form"
                :fieldNameList="fieldNameListG"
                :unit="unit"
                v-if="rangeType"
              ></RangeForm>
              <OptionForm
                :form="form"
                ref="option2Form"
                :fieldNameList="fieldNameListGO"
                :options="options"
                v-else
              ></OptionForm>
            </w-col>
          </w-row>
        </template>
      </w-info-form>
    </w-modal>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import RangeForm from '@/components/range-form';
import OptionForm from './OptionSelect.vue';
import { modalField } from '../config';
const defaultForm = {
  id: undefined,
  indexId: undefined,
  placeId: undefined,
  pointLocation: undefined,
  warningName: '预警',
  limitName: '限值',
  warningOpt: undefined,
  warningValue: undefined,
  warningMin: undefined,
  warningMax: undefined,
  limitOpt: undefined,
  limitValue: undefined,
  limitMin: undefined,
  limitMax: undefined,
  warningRange: undefined,
  limitRange: undefined
};
export default {
  name: 'modalStandard',
  components: {
    RangeForm,
    OptionForm
  },
  props: {
    /* 模态框属性 */
    visible: {
      type: Boolean,
      default: false
    },
    confirmLoading: {
      type: Boolean,
      default: false
    },
    /* 模态框内容展示 */
    indicatorObj: {
      type: Object,
      default: undefined
    },
    //水厂id
    waterPlantId: {
      type: String,
      default: undefined
    }
  },
  data() {
    return {
      /* 表单参数 */
      modalField: modalField,
      form: { ...defaultForm },
      /* 模态框相关 */
      fieldNameListC: ['warningOpt', 'warningValue', 'warningMin', 'warningMax'],
      fieldNameListG: ['limitOpt', 'limitValue', 'limitMin', 'limitMax'],
      fieldNameListCO: ['warningOpt', 'warningRange'],
      fieldNameListGO: ['limitOpt', 'limitRange'],
      rangeType: true, // 数值 还是 选项
      unit: undefined, //单位
      options: [], // 选项类型下拉框option
      selectedIndex: undefined
    };
  },
  computed: {
    ...mapState('dict', ['factory_standard', 'national_standard']),
    title() {
      return this.indicatorObj ? '编辑标准' : '新增标准';
    },
    warningNameList() {
      return [
        {
          label: '预警',
          value: '预警'
        },
        {
          label: this.factory_standard,
          value: this.factory_standard
        }
      ];
    },
    limitNameList() {
      return [
        {
          label: '限值',
          value: '限值'
        },
        {
          label: this.national_standard,
          value: this.national_standard
        }
      ];
    }
  },
  watch: {
    visible: {
      async handler(val) {
        //清除验证信息
        Object.keys(this.$refs).forEach(key => {
          this.$refs[key] && this.$refs[key].$_clearValidate();
        });
        //获取构筑物列表
        if (val) {
          await this.getOptions();
        }

        if (this.indicatorObj) {
          this.processFormParams();
        } else {
          this.form = { ...defaultForm };
        }
        this.form.waterPlantId = this.waterPlantId;
      }
    },
    //指标改变时的操作
    'form.indexId': {
      handler(val) {
        const item = this.modalField[0].options.find(item => item.value === val);
        this.selectedIndex = item;
        this.unit = item && item.unit;
        if (Boolean(this.rangeType) !== Boolean(item && item.dataType === 1)) {
          let init = {
            warningOpt: undefined,
            warningValue: undefined,
            warningMin: undefined,
            warningMax: undefined,
            limitOpt: undefined,
            limitValue: undefined,
            limitMin: undefined,
            limitMax: undefined,
            warningRange: undefined,
            limitRange: undefined
          };
          Object.assign(this.form, init);
        }
        this.rangeType = item && item.dataType === 1;
        //选项的下拉框
        let temp = [];
        item &&
          item?.range?.split(',').forEach(item => {
            temp.push({
              label: item,
              value: item
            });
          });
        this.options.splice(1, this.options.length - 1, ...temp);
      }
    },
    factory_standard: {
      handler(val) {
        if (val) {
          this.modalField[3].label = `${val}/预警`;
        }
      },
      immediate: true
    },
    national_standard: {
      handler(val) {
        if (val) {
          this.modalField[4].label = `${val}/限制`;
        }
      },
      immediate: true
    }
  },
  methods: {
    //获取指标 和 构筑物
    async getOptions() {
      try {
        let { resultData: structureList } = await this.$http.post(`/place/list`, {
          currentPage: 1,
          delFlag: 0,
          ids: [],
          orderBy: '',
          pageFlag: false,
          pageSize: 10,
          tenantId: '',
          waterPlantIds: [],
          name: '',
          nameLike: '',
          coding: '',
          waterPlantId: this.waterPlantId
        });

        this.modalField[1].options = structureList.records.map(item => {
          return {
            ...item,
            value: item.id,
            label: item.name
          };
        });
      } catch (error) {
        console.log(error);
      }

      //获取指标列表
      try {
        let { resultData: indexList } = await this.$http.post(`/waterIndex/page`, {
          currentPage: 1,
          delFlag: 0,
          ids: [],
          orderBy: '',
          pageFlag: false,
          pageSize: 10,
          tenantId: '',
          name: '',
          nameLike: '',
          containerId: '',
          conservantId: '',
          validFlag: 1
        });

        this.modalField[0].options = indexList.records.map(item => {
          return {
            ...item,
            rangeValue: item.value,
            value: item.id,
            label: item.name
          };
        });
      } catch (error) {
        console.log(error);
      }
    },
    /* 模态框方法 */
    handleSubmit() {
      let promiseArray = [];

      Object.keys(this.$refs).forEach(key => {
        if (this.$refs[key] && key !== 'form') {
          promiseArray.push(this.$refs[key].validate());
        }
      });
      // info-form的验证和自己的写的表单组件不一样 特殊处理
      promiseArray.push(
        new Promise((res, rej) => {
          this.$refs['form']?.validate(valid => {
            valid ? res() : rej('请按要求正确填写表单');
          });
        })
      );
      let type = this.indicatorObj ? 'put' : 'post';

      //更改入参形式 数组=》字符串
      this.form.warningRange = this.form.warningRange && this.form.warningRange.join(',');
      this.form.limitRange = this.form.limitRange && this.form.limitRange.join(',');

      Promise.all(promiseArray)
        .then(() => {
          this.$emit('submit', this.form, type);
        })
        .catch(error => {
          this.$message.error(error);
        });
    },
    handleCancel() {
      this.$emit('update:visible', false);
    },
    processFormParams() {
      const item = this.modalField[0].options.find(
        item => item.value === this.indicatorObj.indexId
      );
      this.rangeType = item && item.dataType === 1;
      Object.assign(this.form, this.indicatorObj);

      this.form.warningRange =
        this.indicatorObj.warningRange && this.indicatorObj.warningRange.split(',');
      this.form.limitRange =
        this.indicatorObj.limitRange && this.indicatorObj.limitRange.split(',');
      //将form的null值处理成undefined 防止回显问题
      Object.keys(this.form).forEach(key => {
        this.form[key] = this.form[key] || this.form[key] === 0 ? this.form[key] : undefined;
      });
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-row.wpg-form-item {
  height: 62px;
  margin-bottom: 0;
}
</style>
