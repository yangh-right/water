<!--
  @author: zhangxiang
  @date: 2021-12-02 10:26:29
  @desc：
-->
<template>
  <w-info-form
    :fields="fields"
    :model="form"
    :showCancelButton="false"
    @submit="handleSumit"
    :layout="{ span: 8, labelCol: { span: 8 }, wrapperCol: { span: 16 }, labelAuto: true }"
  >
  </w-info-form>
</template>

<script>
import CommonMixin from '../mixins/common-mixin';

export default {
  name: 'TicketTemplate',
  mixins: [CommonMixin],

  props: {
    form: {
      type: Object
    }
  },
  data() {
    return {
      fetching: false,
      list: [],
      fields: [
        {
          name: 'code',
          label: '模版选择',
          type: 'select',
          attrs: {
            style: 'width: 100%',
            showSearch: true,
            filterOption: false
          },
          listeners: {
            search: this.handleSearch
          }
        }
      ]
    };
  },
  methods: {
    initForm() {
      this.getTemplateList();
    },
    handleSumit() {
      const item = this.list.find((i) => i.code === this.form.code);
      this.$emit('submit', {
        id: item.id,
        code: item.code
      });
    },
    handleSearch(val) {
      this.getTemplateList(val);
    },
    async getTemplateList(name) {
      const field = this.fields[0];
      try {
        const { resultData } = await this.$axios.post('/waterwork-ticket-api/ticketOutWork/selectTemplatePage', {
          page: {
            size: 999
          },
          releaseFlag: '1',
          templateName: name
        });
        this.list = resultData?.records.map((i) => ({
          ...i,
          label: i.name,
          value: i.code
        }));
      } catch (error) {
        console.log(error);
        this.list = [];
      }
      this.fields.splice(0, 1, {
        ...field,
        options: this.list.slice(0)
      });
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-form-item.label-auto .wpg-form-item-label {
  flex-basis: 120px;
}
</style>
