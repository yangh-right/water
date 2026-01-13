<!--
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-06-27 14:40:00
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-11-11 15:06:48
 * @Description: 
-->
<template>
  <div class="edit-detail supply-px-3 supply-pt-5 supply-pb-7">
    <div class="detail-content">
      <w-info-form
        ref="info_form"
        v-on="formEvent"
        v-bind="formProps"
        :layout="layout"
        :model="form"
        enterText="确定"
        :fields="fields"
      >
        <template #footer></template>
        <template #name>
          <w-input :maxLength="20" v-model.trim="form.name"></w-input>
        </template>
        <template #iconUrl>
          <select-img class="img" v-model="form.iconUrl"></select-img>
        </template>
      </w-info-form>
    </div>
    <div class="supply-text-right">
      <w-button
        :loading="formProps.loading"
        @click="submit(true)"
        class="supply-ml-5"
        type="primary"
        v-if="form.id"
        >保存</w-button
      >
      <w-button
        :loading="formProps.loading"
        @click="submit(false)"
        class="supply-ml-5"
        type="primary"
        >新增</w-button
      >
      <w-button @click="$emit('action', false)" class="supply-ml-5">取消</w-button>
    </div>
  </div>
</template>
<script>
import selectImg from './selectImg';

import { addSvgModule, updateSvgModule } from '@/api/configuration';
import { componentFields as fields } from './data';
import { formMixin } from '@/components/SearchTable/option';
export default {
  mixins: [formMixin],
  components: { selectImg },

  data() {
    return {
      layout: {
        span: 24,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      fields
    };
  },

  methods: {
    handleApiParams(params) {
      return {
        ...params,
        iconUrl: params.iconUrl || ''
      };
    },
    submit(isSave = false) {
      try {
        this.$refs.info_form.validate(async valid => {
          if (valid) {
            if (!this.otherValidate()) return;
            let meth = isSave ? updateSvgModule : addSvgModule;
            this.formProps.loading = true;
            const { status } = await meth(this.handleApiParams(this.handleParams(this.form)));
            this.formProps.loading = false;
            if (status === 'complete') {
              let tip = isSave ? this.editSuccessTip : this.addSuccessTip;
              this.$message.success(tip);
              if (isSave) {
                this.$bus.$emit('editComponent', this.form.id);
              }
              this.$emit('action', true);
            }
          } else {
            return false;
          }
        });
      } catch (error) {
        console.log('error', error);
      }
    },
    setDictList() {}
  }
};
</script>
<style lang="less" scoped>
.form-wrapper {
  height: calc(100% - 56px);
  overflow-y: auto;
  overflow-x: hidden;
}
.form-item {
  display: flex;
  &__label {
    width: 8.2%;
    text-align: right;
  }
  &__content {
    flex: 1;
    overflow: hidden;
  }
}
.edit-detail {
  padding: 12px;
  .detail-content {
    overflow-y: auto;
    overflow-x: hidden;
    height: calc(100% - 56px);
  }
}
.asset-list {
  height: 400px;
}
.order-block {
  .order-title {
    .name {
      font-size: 18px;
      font-weight: 600;
      padding: 12px 0;
      &::before {
        content: '';
        display: inline-block;
        background-color: #9ddb00;
        margin-right: 8px;
        top: -1px;
        position: relative;
        width: 5px;
        height: 18px;
        vertical-align: middle;
      }
    }
    .total {
    }
    .search {
      &__item {
      }
    }
  }
  .order-table {
    max-height: 200px;
    overflow-y: hidden;
  }
}
</style>
