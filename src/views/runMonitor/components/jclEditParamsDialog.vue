<!--
 * @Date: 2021-10-15 11:33:53
 * @Version: 1.0.0
 * @Author: chenhengling
 * @Description: 监测量编辑参数弹窗
 * @LastEditTime: 2024-12-13 10:23:46
 * @LastEditors: 胡海鸥 huhaiou@shwpg.com
-->
<template>
  <w-modal
    class="secondary-modal"
    :visible="visible"
    title="编辑监测量"
    wrapClassName="pumpCfg-modal"
    centered
    :confirmLoading="confirmLoading"
    :cancelButtonProps="{ props: { disabled: confirmLoading } }"
    @ok="handleSubmit"
    @cancel="handleCancel"
  >
    <custom-form ref="form" :options="formOptions" @submit="submit" />
  </w-modal>
</template>

<script>
import { mapState } from 'vuex';
import { validPointMultiple } from '@/utils/validator';
import { updatePoint as apiUpdatePoint } from '@/api/public';

const GB = {
  genFormOptions(data) {
    const _option = {
      layout: {
        span: 24,
        labelCol: { span: 6 },
        wrapperCol: { span: 18 }
      },
      list: [
        {
          fieldType: 'input',
          fieldName: 'pointMemoAlias',
          label: '监测量别名',
          placeholder: '请输入别名',
          rules: [{ required: true, message: '请输入别名' }]
        },
        {
          fieldType: 'inputNumber',
          fieldName: 'minValue',
          label: '下限值',
          placeholder: '请输入下限值'
        },
        {
          fieldType: 'inputNumber',
          fieldName: 'maxValue',
          label: '上限值',
          placeholder: '请输入上限值'
        }
        // {
        //   fieldType: 'inputNumber',
        //   fieldName: 'ratio',
        //   label: '倍率',
        //   placeholder: '请输入倍率',
        //   rules: [{ required: true, message: '请输入倍率' }, { validator: validPointMultiple }],
        //   decoratorOptions: {
        //     validateFirst: true
        //   }
        // }
      ]
    };

    if (data) {
      _option.list.forEach(item => {
        item.initialValue = data[item.fieldName];
      });
    }

    return _option;
  }
};

export default {
  name: 'JclMultipleDialog',
  inject: ['parseTableKey'],
  components: {
    CustomForm: () => import('@/components/CustomForm')
  },
  props: {
    visible: Boolean,
    formData: {
      type: Object,
      default: null
    }
  },
  data() {
    return {
      formOptions: GB.genFormOptions(this.formData), // 表单配置
      confirmLoading: false
    };
  },
  computed: mapState('setting', ['systemCode']),
  watch: {
    visible(val) {
      if (val) {
        this.formOptions = GB.genFormOptions(this.formData);
      }
    }
  },
  methods: {
    /**
     * @description: 处理提交
     * @param {*}
     * @return {*}
     */
    handleSubmit() {
      this.$refs.form.submit();
    },
    /**
     * @description: 处理取消
     * @param {*}
     * @return {*}
     */
    handleCancel() {
      if (this.confirmLoading) {
        this.$message.warn('正在提交数据，请稍后');
        return;
      }
      this.$refs.form.reset();
      this.$emit('update:visible', false);
    },
    /**
     * @description: 提交表单
     * @param {*}
     * @return {*}
     */
    async submit(values) {
      const opts = {
        pointList: [
          {
            iotDeviceId: this.formData.deviceId,
            pointName: this.formData.pointName,
            ...values
          }
        ],
        productCode: this.systemCode
      };
      this.confirmLoading = true;

      try {
        await apiUpdatePoint(opts);
        this.confirmLoading = false;
        this.$message.success('修改监测量成功');
        this.handleCancel();
        this.$emit('update', values);
      } catch (err) {
        this.confirmLoading = false;
      }
    }
  }
};
</script>
