<template>
  <div class="factory-info">
    <div class="form-title wfc1">采购及出厂信息</div>
    <w-info-form
      ref="factoryForm"
      :model="form"
      :fields="factoryFields"
      :layout="layout"
      :footer="null"
    >
      <template #supplierId>
        <div class="form-special">
          <w-select
            v-model="form.supplierId"
            placeholder="请选择供应商"
            :getPopupContainer="getPopupContainer"
            allowClear
            showSearch
            :filterOption="filterOption"
          >
            <w-select-option v-for="opt of supplierOptions" :key="opt.value">{{
              opt.label
            }}</w-select-option>
          </w-select>
        </div>
        <p class="form-text" v-show="form.supplierId">
          地址：
          <span class="form-text-item" :title="options.address">{{ options.address }}</span>
          ，电话：
          <span class="form-text-item" :title="options.contactsPhone">{{
            options.contactsPhone
          }}</span>
        </p>
      </template>
      <template #outFactoryTime>
        <w-date-picker
          v-model="form.outFactoryTime"
          :disabled-date="disabledStartDate"
          :getCalendarContainer="getPopupContainer"
          allowClear
          valueFormat="YYYY-MM-DD"
          style="width: 100%"
        />
      </template>
    </w-info-form>
  </div>
</template>

<script>
import { factoryFields } from '../config';
import SupplierAdd from '@/views/Comprehensive/Supplier/add-modal.vue';
import InfoMixin from './InfoMixin';
import { mapState } from 'vuex';
import { manufacturer } from '@/api/deviceManagement';
export default {
  name: 'FactoryInfo',
  components: { SupplierAdd },
  mixins: [InfoMixin],
  props: {
    form: {
      type: Object,
      default: () => {}
    },
    validate: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      modalInfo: {},
      factoryFields,
      supplierOptions: []
    };
  },
  computed: {
    ...mapState('account', ['user']),
    options() {
      let options = {
        address: this.form?.supplier?.address,
        contactsPhone: this.form?.supplier?.contactsPhone
      };
      this.supplierOptions.forEach(i => {
        if (i.value === this.form.supplierId) {
          options.address = i.address;
          options.contactsPhone = i.contactsPhone;
        }
      });
      return options;
    }
  },
  watch: {},
  activated() {
    // 供应商
    this.getSupplier();
  },
  methods: {
    // 获取厂商列表
    async getSupplier() {
      let params = {
        pageFlag: false,
        tenantId: this.user.tenantId,
        typeList: [2]
      };
      const { resultData } = await manufacturer(params);
      this.supplierOptions = resultData.records.map(i => {
        return {
          label: i.name,
          value: i.id,
          ...i
        };
      });
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },

    handleAddSupplier() {
      this.modalInfo = {};
      this.$refs.supplierAdd.show();
    },
    formValidate() {
      this.$refs['factoryForm'].validate(valid => {
        this.$emit('update:validate', !!valid);
      });
    },
    resetFields() {
      this.$refs['factoryForm'].$_resetFields();
    }
  }
};
</script>

<style lang="less" scoped>
.factory-info {
  width: 100%;
  .form-title {
    padding: 20px 0 15px 0;
    // color: #333;
    font-size: 16px;
  }
  .form-special {
    button {
      position: absolute;
      padding: 0 14px;
    }
  }
  .form-text {
    position: absolute;
    height: 40px;
    color: #999;
    width: 400px;
    top: 28px;
    left: 0;
    display: flex;
    align-items: center;
    .form-text-item {
      max-width: 30%;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }
}
</style>
