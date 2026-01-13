<!-- 动态表单的组件 -->
<template>
  <div class="form-item">
    <div class="form-title">
      <p>{{ title }}</p>
    </div>
    <div class="form-content">
      <w-info-form
        ref="model-form"
        class="model-form"
        :fields="modelFields"
        :model="modelForm"
        :layout="modelLayout"
        :footer="null"
      >
        <template #backFlow="{ form }">
          <div class="form-child">
            <w-input-number v-model="form.backFlow" :min="0" placeholder="请填写"></w-input-number>
            <p class="child-input">m<sup>3</sup>/h</p>
          </div>
        </template>
        <template #inBackFlow="{ form }">
          <div class="form-child">
            <w-input-number
              v-model="form.inBackFlow"
              :min="0"
              placeholder="请填写"
            ></w-input-number>
            <p class="child-input">m<sup>3</sup>/h</p>
          </div>
        </template>
        <template #ORP="{ form }">
          <div class="form-child">
            <w-input-number v-model="form.ORP" placeholder="请填写"></w-input-number>
            <p class="child-input">mv</p>
          </div>
        </template>
        <template #MLSS="{ form }">
          <div class="form-child">
            <w-input-number v-model="form.MLSS" :min="0" placeholder="请填写"></w-input-number>
            <p class="child-input">mg/L</p>
          </div>
        </template>
        <template #DO="{ form }">
          <div class="form-child">
            <w-input-number v-model="form.DO" :min="0" placeholder="请填写"></w-input-number>
            <p class="child-input">mg/L</p>
          </div>
        </template>
        <template #NN="{ form }">
          <div class="form-child">
            <w-input-number v-model="form.NN" :min="0" placeholder="请填写"></w-input-number>
            <p class="child-input">mg/L</p>
          </div>
        </template>
      </w-info-form>
      <!-- <w-icon type="ic_remove_circle_outline" @click="removeItem"></w-icon> -->
    </div>
  </div>
</template>

<script>
export default {
  props: {
    title: String,
    modelForm: Object,
    modelFields: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      modelLayout: { span: 12, labelCol: { span: 10 }, wrapperCol: { span: 14 }, colon: true }
    };
  },
  methods: {
    removeItem() {
      this.$confirm({
        title: '是否删除当前数据？',
        okText: '确定',
        cancelText: '取消',
        onOk: () => {
          this.$emit('remove', this.title);
        },
        onCancel: () => {}
      });
    },
    checkVal() {
      let Pass = false;
      this.$refs['model-form'].validate(valid => {
        if (!valid) {
          Pass = false;
          return false;
        } else {
          Pass = true;
        }
      });
      return Pass;
    }
  }
};
</script>
<style lang="less" scoped>
.form-item {
  .form-title {
    height: 35px;
    padding: 0 10px;
    line-height: 35px;
    font-size: 14px;
  }

  .form-content {
    padding: 0 20px;
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    .wpgicon {
      font-size: 20px;
      margin-right: 40px;
    }
  }
  .model-form {
    width: 70%;
    margin-top: 10px;
    /deep/.wpg-select {
      width: 88%;
    }
    .form-child {
      display: flex;
      .child-input {
        margin-left: 5px;
      }
    }
  }
}

html:not([data-wpg-theme='dark']) {
  .form-title {
    background: #f2f6fc;
  }
}

html[data-wpg-theme='dark'] {
  .form-title {
    background: #333b46;
  }
}
</style>
