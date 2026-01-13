<template>
  <w-modal
    :destroyOnClose="true"
    :title="TicketConfirmTitle"
    :visible="visible"
    height="80vh"
    width="650px"
    centered
    :maskClosable="false"
    @cancel="cancel"
    @ok="handlerFrom"
  >
    <w-row class="config-wrap">
      <w-form-model ref="form" :model="form" :labelCol="{ span: 10 }" :wrapperCol="{ span: 14 }">
        <w-col span="24">
          <w-form-model-item label="原因" prop="sedimentDischarge">
            <w-input v-model="form.confirmType" placeholder="请输入处理原因" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="处理描述" prop="dataTime">
            <div style="position: relative">
              <w-textarea :maxLength="120" v-model="form.confirmDesc" class="textarea" />
              <div class="left-count">{{ textareaLength }}/120</div>
            </div>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import {
  alarmConfirm // 确认报警
} from '@/api/diagnosis';
export default {
  name: 'edit',
  props: {
    rowData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      form: {
        confirmDesc: '',
        confirmType: ''
      },
      visible: false,
      TicketConfirmTitle: ''
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.TicketConfirmTitle = `【${this.rowData.alarmName}】处理`;
      }
    }
  },
  computed: {
    textareaLength() {
      return this.form.confirmDesc.length;
    }
  },
  methods: {
    cancel() {
      this.visible = false;
      this.form = {
        confirmDesc: '',
        confirmType: ''
      };
      this.$emit('cancel');
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          if (!this.form.confirmType && !this.form.confirmDesc) {
            // 如果两个输入框都为空，阻止提交并提醒用户输入
            this.$message.error('请至少填写一项');
          } else {
            let params = {
              ...this.form,
              alarmId: this.rowData.alarmHandlerDataId
            };
            let { status } = await alarmConfirm(params);
            if (status === 'complete') {
              let message = '编辑成功';
              this.$emit('refresh');
              this.$message.success(message);
              this.visible = false;
              this.form = {
                confirmDesc: '',
                confirmType: ''
              };
              this.$emit('cancel', true);
            } else {
              return false;
            }
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
.textarea {
  height: 102px;
  min-height: 102px;
  max-height: 186px;
}
.left-count {
  position: absolute;
  bottom: -6px;
  right: 15px;
  font-size: 12px;
}
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
