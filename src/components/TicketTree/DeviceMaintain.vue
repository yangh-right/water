<template>
  <div class="inspect-pump">
    <div v-if="readonly">
      <div v-if="list.length > 0">
        <div v-for="(item, index) in list" :key="index" class="form-parser-container">
          <form-parser v-if="item.formConf" ref="formRef" :formConf="item.formConf" />
        </div>
      </div>

      <w-empty v-else />
    </div>

    <div v-else class="form-parser-edit">
      <div class="form-parser-container">
        <form-parser v-if="list[0]" :formConf="list[0].formConf" />
      </div>
    </div>
  </div>
</template>

<script>
import FormParser from '@/components/FormParser';
import forms from '@/enum/ticket-handle-form';

let fields = forms['maintain'];

export default {
  name: 'TicketDeviceMaintain',

  components: {
    FormParser
  },

  props: {
    value: {
      type: [Object],
      default: () => {}
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      list: []
    };
  },

  watch: {
    value() {
      this.initList();
    }
  },

  mounted() {
    if (this.readonly) {
      this.initList();
    } else {
      this.initForm();
    }
  },

  methods: {
    initList() {
      if (!this.readonly) return;

      let data = this.value || {};
      let list = [];

      Object.keys(data).forEach(v => {
        data[v].forEach(item => {
          list.push(item);
        });
      });

      this.list = list.map((item, index) => {
        return {
          ...item,
          name: item.extra ? item.extra.name : '--',
          formRef: `formRef${index}`,
          formConf: {
            formRef: 'elForm',
            formModel: 'formData',
            formRules: 'rules',
            readonly: true,
            column: 3,
            fields: Object.freeze(fields)
          }
        };
      });

      this.$nextTick(() => {
        this.list.forEach((item, index) => {
          this.$refs.formRef[index].fillForm(item);
        });
      });
    },

    initForm() {
      this.list = [
        {
          formConf: {
            formRef: 'elForm',
            formModel: 'formData',
            formRules: 'rules',
            readonly: false,
            disabled: true,
            column: 1,
            fields
          }
        }
      ];
    }
  }
};
</script>

<style lang="less" scoped>
.form-parser-container {
  margin-bottom: 18px;
  border-bottom: 1px solid #f1f3f5;

  &:last-child {
    margin-bottom: 0;
    border-bottom: 0;
  }
}

.form-parser-edit {
  /deep/ .form-descriptions {
    .form-description-item-label {
      color: #666;
      font-weight: 400;
    }
  }
}
</style>
