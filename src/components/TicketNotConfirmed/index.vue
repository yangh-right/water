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
    :footer="null"
  >
    <w-row class="config-wrap">
      <w-col span="24" style="text-align: center;margin-bottom: 8px;">
        <span>{{ detialContent }}</span>
      </w-col>
      <w-col span="24">
        <w-form-model-item prop="dataTime">
          <div style="position: relative">
            <w-textarea v-model="confirmDesc" class="textarea" disabled />
            <div class="left-count">{{ textareaLength }}/120</div>
          </div>
        </w-form-model-item>
      </w-col>
    </w-row>
  </w-modal>
</template>

<script>
export default {
  name: 'browse',
  props: {
    rowData: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    return {
      visible: false,
      TicketConfirmTitle: '',
      detialContent: '',
      confirmDesc: ''
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.TicketConfirmTitle = `【${this.rowData.alarmName}】处理记录`;
        this.detialContent = `${this.$moment(this.rowData.confirmTime).format(
          'YYYY-MM-DD hh:mm'
        )} 由 ${this.rowData.confirmName} 确认，处理方式为：${this.rowData.confirmType}`;
        this.confirmDesc = this.rowData.confirmDesc;
      }
    }
  },
  computed: {
    textareaLength() {
      return this.confirmDesc.length;
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
    }
  }
};
</script>

<style lang="less" scoped>
.textarea {
  height: 102px;
  min-height: 102px;
  max-height: 156px;
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
