<!-- 添加班次 -->
<template>
  <w-modal
    destroyOnClose
    :visible="visible"
    :title="title"
    :maskClosable="false"
    :footer="null"
    @cancel="handleCancel"
  >
    <w-form-model
      ref="add-model-form"
      :model="AddForm"
      :rules="rules"
      :label-col="{ span: 5 }"
      :wrapper-col="{ span: 19 }"
      @submit="handleSubmit"
      @cancel="handleCancel"
      v-if="!showDetails"
    >
      <w-form-model-item label="选择污水厂" prop="waterPlantId">
        <factory-select
          v-model="AddForm.waterPlantId"
          :disabled="factoryDisabled"
          @change="factoryChange"
        ></factory-select>
      </w-form-model-item>
      <w-form-model-item label="班次名称" prop="name">
        <w-input v-model="AddForm.name" :maxLength="32" />
      </w-form-model-item>
      <w-form-model-item label="班组" prop="teamId">
        <w-select v-model="AddForm.teamId">
          <w-select-option v-for="item in translateData" :key="item.id" :value="item.id">
            {{ item.name }}
          </w-select-option>
        </w-select>
      </w-form-model-item>
      <w-form-model-item label="值班时间段" style="margin-bottom: 0">
        <w-form-model-item
          :style="{ display: 'inline-block', width: 'calc(50% - 12px)' }"
          prop="startTime"
        >
          <w-time-picker
            format="HH:mm"
            valueFormat="YYYY-MM-DD HH:mm:00"
            style="width: 100%"
            v-model="AddForm.startTime"
            placeholder="请选择开始时间"
          />
        </w-form-model-item>
        <span :style="{ display: 'inline-block', width: '24px', textAlign: 'center' }">-</span>
        <w-form-model-item
          :style="{ display: 'inline-block', width: 'calc(50% - 12px)' }"
          prop="endTime"
        >
          <w-time-picker
            format="HH:mm"
            valueFormat="YYYY-MM-DD HH:mm:00"
            style="width: 100%"
            v-model="AddForm.endTime"
            placeholder="请选择结束时间"
          />
        </w-form-model-item>
      </w-form-model-item>
      <w-form-model-item class="colorBox" label="班次背景色" prop="color">
        <w-radio-group v-model="AddForm.color">
          <w-radio-button
            :value="item.color"
            v-for="item in formatColorList"
            :key="item.color"
            :disabled="item.disabled"
          >
            <span class="colorBlock" :style="{ backgroundColor: item.color }">
              <w-icon type="ic_check"></w-icon>
            </span>
          </w-radio-button>
        </w-radio-group>
      </w-form-model-item>
      <w-form-model-item label="备注">
        <w-input v-model="AddForm.remark" />
      </w-form-model-item>
      <w-form-model-item class="formBtn" :wrapper-col="{ span: 24 }">
        <w-button @click="handleCancel"> 取消 </w-button>
        <w-button style="margin-left: 10px" type="primary" :loading="loading" @click="handleSubmit">
          提交
        </w-button>
      </w-form-model-item>
    </w-form-model>
    <w-info-form
      v-else
      :fields="modelFields"
      :model="AddForm"
      :layout="layout"
      :footer="null"
      class="detailForm"
    >
      <template #time="{ form }">
        <span>{{ form.startTime | formatTime }} - {{ form.endTime | formatTime }}</span>
      </template>
      <template #color="{ form }">
        <span class="colorBlockCheck" :style="{ backgroundColor: form.color }"></span>
      </template>
    </w-info-form>
  </w-modal>
</template>

<script>
import FactorySelect from '@/components/factory-select/index';
import { modelFields } from '../config.js';
import { without } from 'lodash-es';

const colorList = ['#4362FF', '#FFCC34', '#FF5568', '#29DCB1', '#9D57FF', '#ff8c02', '#7cc844'];
export default {
  components: { FactorySelect },
  props: {
    title: {
      type: String,
      default: ''
    },
    AddForm: {
      type: Object,
      default: () => {}
    },
    translateData: {
      type: Array,
      default: () => []
    },
    modelType: {
      type: String,
      default: 'add'
    },
    visible: {
      type: Boolean,
      default: false
    }
  },
  data() {
    const checkName = (rule, value, callback) => {
      let flag = this.nameList.findIndex(item => item === value);
      if (!value) {
        callback(new Error('请填写班次名称'));
      } else if (flag > -1) {
        callback(new Error('班次名称重复'));
      } else {
        callback();
      }
    };
    return {
      colorList,
      loading: false, //确定按钮时显示等待
      modelFields,
      formatColorList: [],
      layout: { span: 24, labelCol: { span: 6 }, wrapperCol: { span: 18 }, colon: true },
      rules: {
        waterPlantId: [{ required: true, message: '请选择水厂', trigger: 'change' }],
        name: [{ required: true, trigger: 'change', validator: checkName }],
        startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
        endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
        color: [{ required: true, message: '请选择班次颜色', trigger: 'change' }]
      },
      nameList: [],
      factoryDisabled: false //水厂是否可已切换
    };
  },

  filters: {
    formatTime(val) {
      return val.substring(0, 5);
    }
  },

  computed: {
    showDetails() {
      return this.modelType === 'check';
    }
  },
  watch: {
    visible(val) {
      if (val && this.modelType === 'edit') {
        this.factoryDisabled = true;
        this.colorChange(this.AddForm.waterPlantId, this.AddForm.color);
        this.nameChange(this.AddForm.waterPlantId, this.AddForm.name);
      } else if (!val) {
        this.formatColorList = [];
        this.factoryDisabled = false;
      }
    }
  },
  created() {},
  methods: {
    factoryChange(val) {
      this.colorChange(val);
      this.nameChange(val);
    },
    //获取列表中已存在的班次名称和班次时间
    async nameChange(val, name = '') {
      this.nameList = [];
      let params = {
        delFlag: 0,
        orderBy: '',
        pageFlag: true,
        tenantId: '',
        validFlag: '',
        nameLike: '',
        waterPlantId: val,
        currentPage: 1,
        pageSize: 50
      };
      let { resultData } = await this.$http.post('/shift/list', params);
      resultData.records.forEach(item => {
        this.nameList.push(item.name);
      });
      this.nameList = without(this.nameList, name);
    },
    //对可选颜色做判断
    async colorChange(val, editColor = '') {
      if (!editColor) delete this.AddForm.color;
      let { resultData } = await this.$http.get('/shift/getUsedColor?waterPlantId=' + val);
      let tempArr = [];
      this.colorList.forEach(item => {
        if (resultData.indexOf(item) > -1) {
          if (item === editColor) {
            tempArr.push({
              color: item,
              disabled: false
            });
          } else {
            tempArr.push({
              color: item,
              disabled: true
            });
          }
        } else {
          tempArr.push({
            color: item,
            disabled: false
          });
        }
      });
      this.formatColorList = tempArr;
    },
    async handleSubmit() {
      if (!this.checkVal()) return;
      this.loading = true;
      if (this.modelType === 'add') {
        try {
          let res = await this.$http.post('/shift', this.AddForm);
          this.loading = false;
          if (res.status === 'complete') {
            this.$message.success('新增成功');
            this.$emit('update:visible', false);
            // 调用父组件的查询方法
            this.$parent.handleSearch();
          }
        } catch {
          this.loading = false;
        }
      } else {
        try {
          let res = await this.$http.put('/shift', this.AddForm);
          this.loading = false;
          if (res.status === 'complete') {
            this.$message.success('修改成功');
            this.$emit('update:visible', false);
            // 调用父组件的查询方法
            this.$parent.handleSearch();
          }
        } catch {
          this.loading = false;
        }
      }
    },
    handleCancel() {
      this.loading = false;
      this.$emit('update:visible', false);
    },

    //检验弹窗必填内容
    checkVal() {
      let Pass = false;
      this.$refs['add-model-form'].validate(valid => {
        if (!valid) {
          Pass = false;
          return false;
        } else {
          Pass = true;
        }
      });
      return Pass;
    }
  }
};
</script>
<style lang="less" scoped>
.colorBlockCheck {
  width: 30px;
  height: 30px;
  display: block;
  margin-top: 5px;
}
/deep/ .wpg-radio-button-wrapper {
  padding: 0;
  margin: 0 4px;
  width: 30px;
  height: 30px;
  border: none;
  .colorBlock {
    display: flex;
    height: 100%;
    width: 100%;
    position: relative;
    justify-content: center;
    align-items: center;
    .wpgicon {
      display: none;
    }
  }
}
/deep/ .wpg-radio-button-wrapper-checked:not(.wpg-radio-button-wrapper-disabled) {
  box-shadow: none;
}
/deep/.wpg-radio-button-wrapper:not(:first-child)::before {
  background: transparent !important;
}
/deep/ .wpg-radio-button-wrapper-checked {
  .wpgicon {
    color: #fff;
    display: block !important;
  }
  .colorBlock {
    top: -1px;
  }
}

.formBtn {
  /deep/ .wpg-form-item-control {
    display: flex;
    flex-direction: row-reverse;
  }
}

.detailForm {
  /deep/.wpg-col-24 {
    height: 55px;
  }
}
</style>
