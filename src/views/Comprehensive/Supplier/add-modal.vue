<template>
  <w-form-modal
    :title="(type === 'add' ? '新增' : '编辑') + '设备商家'"
    :visible="visible"
    :model="form"
    :fields="fields"
    :width="1000"
    :layout="{ span: 12, wrapperCol: { span: 18 } }"
    :loading="loading"
    @submit="handleSubmit"
    @cancel="hide"
  >
  </w-form-modal>
</template>

<script>
import { fields } from './config';
import { addInsert,getQueryById,updateInsert,sysDictListByCode } from '@/api/deviceManagement';
export default {
  name: 'AddModal',
  props: {
    type: {
      type: String,
      default: 'add'
    },
    modalInfo: {
      type: Object,
      default: () => {}
    },
    property: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      visible: false,
      loading: false,
      form: {},
      fields: fields,
      bankList: []
    };
  },

  watch: {
    visible(val) {
      if (val) {
        if (this.modalInfo.id) {
          this.getInfo(this.modalInfo.id);
        } else {
          this.form = {
            ...this.modalInfo,
            property: this.property
          };
        }
      }
    }
  },
  created() {
  },
  methods: {
    show() {
      this.visible = true;
    },
    hide() {
      this.visible = false;
    },
    handleSubmit() {
      if (this.type === 'add') {
        this.add();
      } else {
        this.edit();
      }
    },
    async add() {
      this.loading = true;
      const type = this.form.property.length === 2 ? 3 : this.form.property[0];
      const data = { ...this.form, type: type };
      const { success, errorMessage } = await addInsert(data);
      if (success) {
        this.$message.success('新增成功!');
        this.hide();
        this.$emit('search');
      } else {
        this.$message.error(errorMessage);
      }
      this.loading = false;
    },
    async edit() {
      this.loading = true;
      const type = this.form.property.length === 2 ? 3 : this.form.property[0];
      const data = { ...this.form, type: type };
      const { success, errorMessage } = await updateInsert(data,{ id: data.id });
      if (success) {
        this.$message.success('编辑成功!');
        this.$emit('search');
      } else {
        this.$message.error(errorMessage);
      }
      this.loading = false;
      this.hide();
    },
    async getInfo(id) {
      this.loading = true;
      let params={ entityId: id };
      const { resultData } = await getQueryById(params);
      const type = resultData.type === 1 ? [1] : resultData.type === 2 ? [2] : resultData.type === 3 ? [1, 2] : [];
      const bankOfDeposit =
        this.bankList.find(a => {
          return a.label === resultData.bankOfDeposit;
        }) || {};
      this.form.bankOfDeposit = bankOfDeposit.value;
      this.form = {
        ...resultData,
        property: type,
        bankOfDeposit: bankOfDeposit.value || resultData.bankOfDeposit || undefined
      };
      this.loading = false;
    },
    async getBank() {
      const { resultData } = await sysDictListByCode('purification_bank');
      let data = resultData.map(i => {
        return {
          label: i.dictName,
          value: i.dictCode
        };
      });
      this.bankList = data;
      this.fields.forEach((item, index) => {
        if (item.name === 'bankOfDeposit') {
          this.fields[index].options = data;
        }
      });
      const bankOfDeposit =
        this.bankList.find(a => {
          return a.label === this.form.bankOfDeposit;
        }) || {};
      if (bankOfDeposit.value) {
        this.form.bankOfDeposit = bankOfDeposit.value;
      }
    }
  }
};
</script>
<style lang="less" scoped>
.wpg-modal-footer {
  text-align: center;
}
</style>
