<!--
 * @Description: 巡检步骤新增 / 删除
 * @Author: limz
 * @Date: 2021-09-03 09:47:52
 * @LastEditTime: 2024-12-13 10:19:19
 * @LastEditors: 胡海鸥 huhaiou@shwpg.com
-->
<template>
  <w-modal
    v-if="visible"
    :title="modalTitle"
    :visible="visible"
    centered
    okText="保存"
    class="add-group secondary-modal"
    width="600px"
    @cancel="handleCancel"
    @ok="handleSubmit"
    :maskClosable="false"
  >
    <w-form
      :form="form"
      labelAlign="right"
      :label-col="{ span: 4 }"
      :wrapper-col="{ span: 20 }"
      class="query-form"
      @submit="handleSubmit"
    >
      <w-form-item label="所属设备">
        <w-select
          v-decorator="[
            'deviceId',
            {
              rules: [{ required: true, message: '请选择所属设备' }],
              initialValue: formData.deviceId
            }
          ]"
          showSearch
          placeholder="请选择所属设备"
        >
          <w-select-option v-for="device in deviceList" :key="device.id" :value="device.id">
            {{ device.deviceName }}
          </w-select-option>
        </w-select>
      </w-form-item>

      <w-form-item label="步骤编号">
        <w-input
          v-decorator="[
            'stepCode',
            {
              rules: [{ required: true, message: '请输入步骤编号' }],
              initialValue: formData.stepCode
            }
          ]"
          :maxLength="50"
          allowClear
          autocomplete="off"
          placeholder="请输入步骤编号"
        />
      </w-form-item>

      <w-form-item label="步骤名称">
        <w-input
          v-decorator="[
            'stepName',
            {
              rules: [{ required: true, message: '请输入步骤名称' }],
              initialValue: formData.stepName
            }
          ]"
          :maxLength="50"
          allowClear
          autocomplete="off"
          placeholder="请输入步骤名称"
        />
      </w-form-item>

      <w-form-item v-if="isEditMode" label="启用">
        <w-switch v-model="delFlag" size="small" />
      </w-form-item>

      <w-form-item label="排序">
        <w-input-number
          v-decorator="[
            'sort',
            {
              rules: [{ required: true, message: '请输入排序' }],
              initialValue: formData.sort || 0
            }
          ]"
          :precision="0"
          :min="0"
          :max="999999999"
          placeholder="请输入排序"
        />
      </w-form-item>
    </w-form>
  </w-modal>
</template>

<script>
import {
  SaveInspConfig // 保存修改
} from '@/api/manage';

export default {
  name: 'EditInspStep',
  props: {
    type: {
      type: String,
      default: 'new',
      validator: value => ['new', 'edit'].includes(value)
    },
    formData: {
      type: Object,
      default: () => ({})
    },
    isCopy: {
      type: Boolean,
      default: false
    },
    deviceList: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      form: this.$form.createForm(this),
      delFlag: true,
      loading: false
    };
  },
  computed: {
    /**
     * 是否为编辑模式
     */
    isEditMode() {
      return this.type !== 'new';
    },

    /**
     * 模态框标题
     */
    modalTitle() {
      return this.type === 'new' ? '新增步骤' : '编辑步骤';
    },

    /**
     * 获取字符串值
     */
    getStr() {
      return (list, val) => {
        const data = list.find(t => String(t.value) === String(val));
        return data?.label || '';
      };
    }
  },
  watch: {
    formData: {
      handler(val) {
        if (val.stepName) {
          this.delFlag = val.delFlag === 0;
        }
      },
      immediate: true,
      deep: true
    }
  },
  methods: {
    /**
     * 处理取消操作
     */
    handleCancel() {
      this.visible = false;
      this.resetForm();
    },

    /**
     * 重置表单
     */
    resetForm() {
      this.form.resetFields();
      this.delFlag = true;
    },

    /**
     * 保存提交
     */
    async handleSubmit() {
      try {
        const values = await this.validateForm();
        if (!values) return;

        await this.saveData(values);
        this.$message.success('保存成功');
        this.visible = false;
        this.$emit('change');
      } catch (error) {
        console.error('保存失败:', error);
        this.$message.error('保存失败，请重试');
      }
    },

    /**
     * 验证表单
     */
    validateForm() {
      return new Promise((resolve, reject) => {
        this.form.validateFields((err, values) => {
          if (err) {
            reject(err);
          } else {
            resolve(values);
          }
        });
      });
    },

    /**
     * 保存数据
     */
    async saveData(values) {
      const params = {
        ...values,
        delFlag: this.delFlag ? 0 : 1,
        isCopy: this.isCopy
      };

      if (this.formData.id) {
        params.id = this.formData.id;
      }

      const res = await SaveInspConfig(params);
      if (res.status !== 'complete') {
        throw new Error('保存失败');
      }
    }
  }
};
</script>

<style scoped lang="less">
.ant-input-number {
  width: 100%;
}
</style>
