<template>
  <w-modal
    :visible="visible"
    :title="$t('knowledge.workspace.addType')"
    :width="600"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <w-form-model
      ref="form"
      class="wpg-form--horizontal wpg-form--label-right"
      :rules="rules"
      :model="form"
    >
      <w-form-model-item :label="$t('knowledge.workspace.addName')" prop="name">
        <w-input v-model.trim="form.name" :placeholder="$t('knowledge.workspace.input')" />
      </w-form-model-item>
    </w-form-model>
  </w-modal>
</template>

<script>
import { bookAdd } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';
export default {
  props: {
    addSortVisible: {
      type: Boolean,
      default: false
    },

    pid: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      form: {
        name: ''
      },
      visible: false,
      rules: {
        name: [
          { required: true, message: t('knowledge.workspace.inputName'), trigger: 'blur' },
          { min: 2, max: 30, message: t('knowledge.workspace.stringNum'), trigger: 'blur' }
        ],
        description: [{ max: 200, message: t('knowledge.workspace.notMoreThan'), trigger: 'blur' }]
      }
    };
  },

  watch: {
    addSortVisible(val) {
      if (val) {
        this.visible = true;
        this.form = {
          name: ''
        };
        this.$refs.form && this.$refs.form.clearValidate();
      }
    }
  },

  methods: {
    handleOk() {
      this.$refs.form.validate(valid => {
        if (valid) {
          this.addOrEdit();
        }
      });
    },

    async addOrEdit() {
      let data = {
        pid: this.pid,
        bookName: this.form.name
      };
      let res = await bookAdd(data);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.addSuccess'));
        this.visible = false;
        this.$emit('update');
        this.$emit('closeAdd');
      }
    },

    handleCancel() {
      this.visible = false;
      this.$emit('closeAdd');
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-form-item {
  // margin-bottom: 20px;

  .wpg-form-item-label {
    width: 100px;
  }
}
</style>
