<!--
  @author: zhangxiang
  @date: 2021-12-02 13:46:43
  @desc：
-->
<template>
  <w-info-form
    :fields="fields"
    :model="form"
    @submit="handleSumit"
    :layout="{ span: 8, labelCol: { span: 8 }, wrapperCol: { span: 16 }, labelAuto: true }"
  />
</template>

<script>
import CommonMixin from '../mixins/common-mixin';

export default {
  name: 'DeviceTemplate',
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
          name: 'id',
          label: '模版选择',
          type: 'select',
          options: this.list,
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
      const item = this.list.find((i) => i.id === this.form.id);
      this.$emit('submit', {
        id: item.id,
        name: item.templateName
      });
    },
    handleSearch(val) {
      this.getTemplateList(val);
    },
    async getTemplateList(name) {
      const field = this.fields[0];
      try {
        const { resultData } = await this.$axios.post('/waterwork-device-api/industryDevice/queryPage', {
          pageFlag: false,
          keyword: name
        });
        this.list = resultData.map((i) => ({
          ...i,
          label: i.templateName,
          value: i.id
        }));
      } catch (error) {
        this.list = [];
      }
      this.fields.splice(0, 1, {
        ...field,
        options: this.list
      });
    }
  }
};
</script>
