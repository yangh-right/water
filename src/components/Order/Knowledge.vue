<template>
  <div>
    <w-select
      v-if="!readonly"
      v-model="selectedValue"
      show-search
      :getPopupContainer="triggerNode => triggerNode.parentNode"
      :placeholder="placeholder"
      :disabled="disabled"
      option-label-prop="label"
      style="width: 100%;"
      :filter-option="false"
      @search="fetchList"
      @focus="fetchList"
      @change="handleChange"
    >
      <w-spin v-if="fetching" slot="notFoundContent" size="small" />
      <!-- <w-select-option
        v-for="item in data"
        :key="item.id"
        :value="item.id"
        :label="item.bookName"
        :disabled="item.delFlag === '1'"
      >
        {{ item.bookName }}
        <span v-if="item.delFlag === '1'" style="float: right;">已删除</span>
      </w-select-option> -->
      <w-select-opt-group v-for="item in data" :key="item.id">
        <span slot="label">{{ item.bookName }}</span>
        <w-select-option
          v-for="page in item.pages"
          :key="page.id"
          :value="page.id"
          :label="page.pageTitle"
        >
          {{ page.pageTitle }}
        </w-select-option>
      </w-select-opt-group>
    </w-select>
    <div v-else class="knowledge-tree">
      <a @click="showKnowledge">查看详情</a>

      <knowledge-dialog
        ref="editDialog"
        :knowledgeData="knowledgeData"
        :readonly="true"
        :editable="false"
        :editType="2"
      />
    </div>
  </div>
</template>

<script>
import KnowledgeDialog from './KnowledgeDialog.vue';
import { debounce } from 'throttle-debounce';
import { selectOperationKnowledgeList, GetKnowledgeTree } from '@/api/work';

export default {
  name: 'KnowledgeTree',

  components: {
    KnowledgeDialog
  },

  props: {
    placeholder: {
      type: String,
      default: '请选择知识'
    },
    value: {
      type: [String, Number],
      default: undefined
    },
    disabled: {
      type: Boolean,
      default: false
    },
    orgId: {
      type: String,
      default: ''
    },
    shouldOrgLoad: {
      type: Boolean,
      default: false
    },
    readonly: {
      type: Boolean,
      default: false
    },
    type: {
      type: String,
      default: '6'
    },
    keyWord: {
      type: String,
      default: ''
    }
  },

  data() {
    this.lastFetchId = 0;
    this.fetchList = debounce(800, this.fetchList);

    return {
      data: [],
      knowledgeData: {},
      content: {},
      selectedValue: this.value === '' ? '' : Number(this.value),
      fetching: false
    };
  },

  watch: {
    value(val) {
      // if (val) {
      this.selectedValue = val === '' ? '' : Number(val);
      // }
    },

    orgId() {
      this.fetchList();
    },

    keyWord() {
      this.fetchList();
    }
  },

  created() {
    if (!this.readonly) {
      this.fetchList();
    }
  },

  mounted() {
    // if (this.readonly) {
    // this.handlePreview(this.selectedValue);
    // } else {
    //   this.fetchList('');
    // }
  },

  methods: {
    fetchList() {
      // if (this.shouldOrgLoad && !this.orgId) {
      //   this.data = [];
      // } else {
      this.fetching = true;
      GetKnowledgeTree({ keyWord: this.keyWord }).then(res => {
        let list = res.resultData || [];

        list.forEach(item => {
          item.id = item.id.toString();
        });

        this.data = list;
        this.fetching = false;
      });
      // }
    },

    searchList() {},

    handleChange(value) {
      Object.assign(this, {
        selectedValue: value,
        fetching: false
      });

      this.$emit('input', value);
    },

    showKnowledge() {
      this.knowledgeData = {
        id: this.selectedValue
      };

      this.$refs.editDialog && (this.$refs.editDialog.visible = true);
    }
  }
};
</script>

<style lang="less" scoped></style>
