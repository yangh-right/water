<!--
 * @Author: wangyr
 * @Date: 2023-08-07 10:58:38
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-08-07 14:36:06
 * @Description:
-->
<template>
  <div>
    <w-modal
      destroyOnClose
      :visible="showModal"
      :title="title"
      @ok="handleSubmit"
      :maskClosable="false"
      :confirm-loading="confirmLoading"
      @cancel="handleCancel"
      width="650px"
    >
      <w-info-form :footer="null" :model="form" :fields="fields" ref="form"> </w-info-form>
    </w-modal>
  </div>
</template>

<script>
import { getListByPlaceId, addOrUpdate } from '@/api/optimization';

export default {
  name: 'TheModalSet',
  components: {},
  data() {
    return {
      form: {},
      fields: [],
      showModal: false,
      confirmLoading: false,
      fieldsSetModal: []
    };
  },
  props: {
    structure: {
      type: Object,
      default: () => {}
    },
    title: {
      type: String,
      default: undefined
    }
  },
  computed: {},
  watch: {
    structure: {
      deep: true,
      handler(val) {
        this.getTabsList(val);
      }
    }
  },
  methods: {
    async getTabsList(row) {
      let { resultData, status } = await getListByPlaceId(row.id);
      if (status === 'complete') {
        if (resultData.length) {
          let fields = [];
          let form = {};
          resultData.forEach(item => {
            form[item.typeName] = '';
            fields.push({
              name: item.typeName,
              label: item.typeName,
              placeholder: '请输入',
              value: !!item.modelCode ? item.modelCode : '',
              type: 'input',
              span: 24,
              wrapperCol: { span: 18 },
              attrs: {
                maxLength: 50
              }
            });
          });
          this.fields = fields;
          this.form = form;
          this.fieldsSetModal = resultData;
        } else {
          this.fields = [];
        }
      }
    },
    async handleSubmit() {
      this.$refs['form'].validate(async validate => {
        this.confirmLoading = true;
        this.fieldsSetModal.forEach(item => {
          item['modelCode'] = this.form[item.typeName];
        });
        let { resultData, status } = await addOrUpdate(this.fieldsSetModal);
        this.confirmLoading = false;
        if (status === 'complete') {
          this.$message.success('配置成功');
          this.showModal = false;
        }
      });
    },
    handleCancel() {
      this.showModal = false;
    }
  }
};
</script>

<style lang="less" scoped>
@import '/src/views/System/ConfigSystem/StructureConfig/components/style.less';
.position-item {
  margin-top: -3px;
}
</style>
