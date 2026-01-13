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
        <form-parser v-if="list[0]" :formKey="formKey" :formConf="list[0].formConf" />
      </div>
    </div>
  </div>
</template>

<script>
import FormParser from '@/components/FormParser';
import makePumpFields from './maintainPump';
import makeInspectFields from './inspectPump';

const MAINTAIN_PUMP_MAP = {
  quarter: 'maintainPumpQuarter',
  semi: 'maintainPumpSemi',
  year: 'maintainPumpYear'
};

let INSPECT_MAP = {
  week: 'planInspectWeek',
  month: 'planInspectMonth',
  quarter: 'planInspectQuarter',
  year: 'planInspectYear'
};

function initFields(planType, period) {
  let fields = [];
  if (period && planType === 'maintain' && MAINTAIN_PUMP_MAP[period]) {
    fields = makePumpFields(period);
  }

  if (period && planType === 'inspect' && INSPECT_MAP[period]) {
    fields = makeInspectFields(period);
  }

  return Object.freeze(fields);
}

export default {
  name: 'TicketMaintainPump',

  components: {
    FormParser
  },

  props: {
    value: {
      type: [Array],
      default: () => {}
    },
    planType: {
      type: String,
      default: 'maintain'
    },
    period: {
      type: String,
      default: ''
    },
    readonly: {
      type: Boolean,
      default: false
    }
  },

  data() {
    return {
      formKey: '',
      fields: initFields(this.planType, this.period),
      list: []
    };
  },

  watch: {
    value() {
      this.initList();
    },
    planType() {
      this.updateForm();
    },
    period() {
      this.updateForm();
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
    updateForm() {
      this.list = [];
      setTimeout(() => {
        this.fields = initFields(this.planType, this.period);
        this.initForm();
      });
    },

    initList() {
      if (!this.readonly) return;

      let list = this.value || [];

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
            fields: this.fields
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
            fields: this.fields
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
