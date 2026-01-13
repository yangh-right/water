<template>
  <div class="knowledge-add-container">
    <w-spin class="knowledge-add-container__spin" :spinning="loading"></w-spin>
    <div class="outwork-titlebar wbgc-card add-header">
      <div class="add-header-title">
        <w-icon type="ic_dvr" />
        <span>{{ titleText }}</span>
      </div>
      <div class="add-header-btn">
        <w-button icon="arrow-left" @click="goBack">
          {{ $t('knowledge.workspace.goBack') }}
        </w-button>
      </div>
    </div>

    <div class="add-content">
      <w-form-model ref="form" :model="form" :rules="rules" class="wpg-form--horizontal">
        <div class="wbgc-card add-content-item">
          <w-form-model-item :label="$t('knowledge.workspace.knowTitle')" prop="pageTitle">
            <w-input v-model.trim="form.pageTitle" :placeholder="$t('knowledge.workspace.input')" />
          </w-form-model-item>
          <w-form-model-item :label="$t('knowledge.workspace.bookClass')" prop="bookId">
            <w-tree-select
              v-model="form.bookId"
              :replace-fields="replaceFields"
              show-search
              tree-node-filter-prop="title"
              style="width: 100%"
              :tree-data="treeData"
              :dropdown-style="{ maxHeight: '400px', overflow: 'auto' }"
              :placeholder="$t('knowledge.workspace.input')"
              allow-clear
              tree-default-expand-all
            />
          </w-form-model-item>
          <w-form-model-item :label="$t('knowledge.workspace.knowTag')" prop="knowledgeTag">
            <w-select
              v-model="form.knowledgeTag"
              mode="multiple"
              style="width: 100%"
              :placeholder="$t('knowledge.workspace.input')"
              :max-tag-count="5"
              @change="handleLabel"
            >
              <w-select-option v-for="item in knowledgeTag" :key="item.value">
                {{ item.label }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
          <w-form-model-item :label="$t('knowledge.workspace.uploadFile')" prop="files">
            <vc-file-upload v-model="form.files" />
          </w-form-model-item>
          <w-form-model-item
            :label="$t('knowledge.workspace.knowRange')"
            required
            prop="allVisibleFlag"
            class="range"
          >
            <!-- <span class="visible-all">全部可见</span> -->
            <w-radio-group v-model="form.allVisibleFlag" name="radioGroup">
              <w-radio value="1"> {{ $t('knowledge.workspace.allVisible') }} </w-radio>
              <w-radio value="0" @click="handelRange">
                {{ $t('knowledge.workspace.rangeVisible') }}
              </w-radio>
            </w-radio-group>
            <div v-if="rangeTips" class="visible-range">
              {{ $t('knowledge.workspace.selectVisibleRange') }}
            </div>
            <div
              v-if="form.allVisibleFlag === '0' && form.groupNames && form.groupNames.length"
              class="visible-label"
            >
              {{ form.groupNames.join(',') }}
            </div>
          </w-form-model-item>
        </div>

        <div class="add-content-edit">
          <w-form-model-item prop="pageContent">
            <vc-editor
              v-model="form.pageContent"
              :placeholder="$t('knowledge.workspace.inputContent')"
            />
          </w-form-model-item>
        </div>
      </w-form-model>
    </div>

    <div class="add-footer">
      <w-button class="add-footer-btn" @click="handleOk('0')">{{
        $t('knowledge.workspace.drafts')
      }}</w-button>
      <w-button class="add-footer-btn" type="primary" @click="handleOk('1')">
        {{ $t('knowledge.workspace.saveAndSubmit') }}
      </w-button>
    </div>

    <range-dialog
      :visible="rangeVisible"
      :keys="form.roleIds"
      @rangeOK="rangeOK"
      @rangeCancel="rangeCancel"
    />
  </div>
</template>

<script>
import RangeDialog from './components/RangeDialog.vue';
import { getBookTree, getPageDetail, pageAddOrEdit } from '@/api/knowLedge';
import { t } from '@/locale/useLocale';
import { mapState } from 'vuex';

export default {
  name: 'KnowledgeAdd',
  components: {
    RangeDialog
  },
  inject: ['closeTab'],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.pageId = to.query.id;
      to.query.id ? vm.loadData() : vm.reset();
    });
  },

  data() {
    return {
      loading: false,
      rules: {
        pageTitle: [
          { required: true, message: t('knowledge.workspace.inputName'), trigger: 'blur' },
          { min: 2, max: 30, message: t('knowledge.workspace.stringNum'), trigger: 'blur' }
        ],
        bookId: [{ required: true, message: t('knowledge.workspace.selectClass') }]
        // knowledgeTag: [{ required: true, message: '请选择标签', trigger: 'blur' }]
      },
      pageId: '',
      form: {
        pageTitle: '',
        bookId: undefined,
        knowledgeTag: undefined,
        roleIds: [],
        pageContent: '',
        allVisibleFlag: '1',
        groupNames: []
      },
      treeData: [],
      replaceFields: { children: 'children', title: 'name', key: 'id', value: 'id' },
      rangeVisible: false
    };
  },

  computed: {
    ...mapState('dict', ['knowledgeTag']),
    labelDictory() {
      let labelDictory = {};
      this.knowledgeTag?.forEach(element => {
        labelDictory[element.value] = element.label;
      });
      return labelDictory;
    },
    titleText() {
      return this.pageId ? t('knowledge.workspace.editKnow') : t('knowledge.workspace.addKnow');
    },

    rangeTips() {
      return this.form.allVisibleFlag === '0' && !this.form.roleIds?.length;
    }
  },

  mounted() {
    this.getBookTree();
  },

  methods: {
    async loadData() {
      let { status, resultData } = await getPageDetail(this.pageId);
      if (status === 'complete') {
        resultData.files = JSON.parse(resultData.files);
        this.form = resultData;
      }
    },
    reset() {
      this.form = {
        pageTitle: '',
        bookId: undefined,
        knowledgeTag: undefined,
        roleIds: [],
        pageContent: '',
        allVisibleFlag: '1',
        groupNames: []
      };
    },

    goBack() {
      this.closeTab(this.$route.path);
    },

    handelRange() {
      this.rangeVisible = true;
    },
    handleOk(flag) {
      this.$refs.form.validate(valid => {
        if (valid && !this.rangeTips) {
          this.addItem(flag);
        }
      });
    },

    async addItem(flag) {
      if (this.loading) return;
      this.loading = true;
      let data = {
        ...this.form,
        releaseFlag: flag
      };
      data.id = flag === '1' || this.form.releaseFlag === '0' ? this.pageId : '';
      delete data.groupNames;
      delete data.labelName;
      data.roleIds = data.allVisibleFlag === '1' ? [] : data.roleIds;
      let { status } = await pageAddOrEdit(data);
      if (status === 'complete') {
        this.$message.success(t('knowledge.workspace.submitSuccess'));
        this.loading = false;
        console.log('111', 111);

        this.closeTab(this.$route.path);
      }
      this.loading = false;
    },

    rangeOK(keys, labels) {
      this.form.roleIds = keys;
      this.form.groupNames = labels;
      this.rangeVisible = false;
    },

    rangeCancel() {
      this.rangeVisible = false;
    },

    handleLabel(value) {
      this.form.labelName = value.map(item => this.labelDictory[item]);
    },

    async getBookTree() {
      let res = await getBookTree({});
      if (res.status === 'complete') {
        let data = res.resultData;
        this.treeData = data;
      }
    }
  }
};
</script>

<style lang="less" scoped>
/deep/ .wpg-form--horizontal {
  .wpg-form-item {
    display: flex;
    .wpg-form-item-control-wrapper {
      flex: 1;
    }
  }
  .wpg-form-item:nth-child(3),
  .wpg-form-item:nth-child(4) {
    padding-left: 11px;
  }
}
.knowledge-add-container {
  position: relative;
  height: 100%;
  &__spin {
    position: absolute;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
  }
  .add-header {
    display: flex;
    justify-content: space-between;
    padding: 10px 8px 10px 19px;

    &-title {
      i {
        color: #888e99;
      }

      span {
        margin-left: 12px;
        color: var(--supply-color-main);
        font-weight: 500;
        font-size: 16px;
        font-family: PingFangSC-Medium, sans-serif;
      }
    }

    &-btn {
      /deep/ .wpg-btn {
        padding: 0 14px;

        span {
          margin-left: 8px;
        }
      }
    }
  }

  .add-content {
    height: calc(100% - 118px);
    margin-top: 12px;
    overflow: auto;
    border-radius: 4px;

    &-item {
      padding: 12px 20px;
      border-radius: 4px;

      .range {
        /deep/ .wpg-form-explain {
          display: none;
        }

        .visible-range {
          position: absolute;
          top: 20px;
          left: 100px;
          color: #f64357;
          font-size: 12px;
          line-height: 16px;
        }

        .visible-label {
          position: absolute;
          top: 2px;
          left: 200px;
          width: 200px;
          font-size: 12px;
          line-height: 16px;
        }
      }

      /deep/ .wpg-form-item {
        &:last-child {
          margin-bottom: 0;
        }
      }
    }

    &-edit {
      margin-top: 12px;

      /deep/ .wpg-form-item {
        margin-bottom: 0;
      }

      /deep/ .vc-editor {
        min-height: 285px !important;
        border: none;
        border-radius: 4px;

        .tox-statusbar {
          .tox-statusbar__wordcount {
            display: none;
          }
          // display: none;
        }
      }
    }
  }

  .add-footer {
    display: flex;
    align-items: center;
    justify-content: flex-end;
    height: 60px;

    &-btn {
      margin-left: 20px;
      padding: 0 26px;
    }
  }
}
</style>
