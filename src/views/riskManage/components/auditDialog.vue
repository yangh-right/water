<!--
 * @Author: wangyr
 * @Date: 2023-11-02 14:57:14
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-11-15 09:09:14
 * @Description:
-->
<template>
  <w-modal
    :visible="visible"
    :destroyOnClose="true"
    title="审批"
    centered
    :width="480"
    @ok="handleAudit"
    @cancel="cancel"
  >
    <div class="audit-wrap">
      是否通过：<w-radio-group v-model="isAudit">
        <w-radio :value="true">
          是
        </w-radio>
        <w-radio :value="false">
          否
        </w-radio>
      </w-radio-group>
    </div>
    <div class="audit-wrap">
      备注：<w-textarea v-model="remark" :max="200" placeholder="请输入"></w-textarea>
    </div>
  </w-modal>
</template>

<script>
export default {
  name: 'auditDialog',
  components: {},
  data() {
    return {
      visible: false,
      isAudit: true,
      remark: ''
    };
  },
  computed: {},
  watch: {},
  methods: {
    handleAudit() {
      this.$emit('handleAudit', this.isAudit, this.remark);
    },
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    }
  },
  created() {},
  mounted() {}
};
</script>

<style lang="less" scoped>
.audit-wrap {
  margin-bottom: 12px;
}
</style>
