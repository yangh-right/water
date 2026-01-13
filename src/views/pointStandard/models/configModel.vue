<template>
  <div>
    <w-form-model ref="form" :model="form">
      <w-row>
        <w-col :span="8">
          <info-form-item
            :key="`${field[0].name}`"
            :field="field[0]"
            :form="form"
            :type="'SUBMIT'"
          ></info-form-item>
        </w-col>
        <w-col :span="16" style="padding-left: 10px">
          <w-row>
            <w-col :span="10">
              <info-form-item
                :key="`${field[2].name}`"
                :field="field[2]"
                :form="form"
                :type="'SUBMIT'"
              ></info-form-item>
            </w-col>
            <w-col :span="4" class="common">-</w-col>
            <w-col :span="10">
              <info-form-item
                :key="`${field[3].name}`"
                :field="field[3]"
                :form="form"
                :type="'SUBMIT'"
              ></info-form-item>
            </w-col>
          </w-row>
        </w-col>
      </w-row>
    </w-form-model>
  </div>
</template>

<script>
import InfoFormItem from '@/components/form-item/form-item.vue';
function testPositiveNumer(rule, value, callback, msg) {
  if (value && !/^[+]{0,1}(\d+)$|^[+]{0,1}(\d+\.\d+)$/.test(value)) {
    callback(new Error(msg));
  } else {
    callback();
  }
}
export default {
  components: {
    InfoFormItem
  },
  props: {
    form: {
      type: Object,
      default: () => ({})
    },
    fieldNameList: {
      type: Array,
      default: () => ['opt', 'value', 'rangeMin', 'rangeMax']
    },
    operatorList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      field: [
        {
          name: this.fieldNameList[0],
          type: 'select',
          options: this.operatorList,
          placeholder: '请选择',
          attrs: {
            allowClear: true
          }
        },
        {
          name: this.fieldNameList[1],
          type: 'input',
          placeholder: '请填写',
          rules: [
            {
              validator: (rule, value, callback) => {
                testPositiveNumer(rule, value, callback, '请填写正确的数值范围');
              },
              trigger: 'change'
            }
          ]
        },
        {
          name: this.fieldNameList[2],
          type: 'input',
          placeholder: '下限',
          rules: [
            {
              validator: (rule, value, callback) => {
                testPositiveNumer(rule, value, callback, '请填写正确的数值范围最小值');
              },
              trigger: 'change'
            }
          ]
        },
        {
          name: this.fieldNameList[3],
          type: 'input',
          placeholder: '上限',
          rules: [
            {
              validator: (rule, value, callback) => {
                testPositiveNumer(rule, value, callback, '请填写正确的数值范围最大值');
              },
              trigger: 'change'
            }
          ]
        }
      ]
    };
  },
  mounted() {
    // console.log('this.operatorList',this.operatorList);
  },
  methods: {
    //     //字典-运算符
    //     async getOperator() {
    //   let { status, resultData } = await this.$http.get(`/sysDict/sysDictListByCode/standard_operator`);
    //   if(status){
    //     this.field[0].options = resultData?.map(item => {
    //       return {
    //         label: item.dictName,
    //         value: item.dictCode,
    //       };
    //     });
    //   }
    // },
    validate() {
      return new Promise((res, rej) => {
        this.$refs['form'].validate(valid => {
          valid ? res() : rej('请按要求正确填写表单');
        });
      });
    },
    $_clearValidate() {
      this.$refs['form'].clearValidate();
    }
  }
};
</script>

<style lang="less" scoped>
.common {
  text-align: center;
  line-height: 40px;
}
</style>
