<template>
  <div class="knowledge-base-box">
    <div class="outwork-titlebar wbgc-card knowledge-header">
      <div class="knowledge-header-img">
        <img src="@/assets/images/modules/knowledge/ic_知识库.png" />
        <img src="@/assets/images/modules/knowledge/text.png" />
      </div>
      <div class="knowledge-header-filter">
        <w-input-search
          v-model="options.keyword"
          class="search"
          :placeholder="$t('knowledge.workspace.keywordSearch')"
        />
        <w-button type="primary" icon="select" ghost @click="showDrawer">
          {{ $t('knowledge.workspace.advancedSearch') }}
        </w-button>
        <w-button class="supply-mx-3" @click="handleImport"
          ><w-icon type="ic_publish" />导入</w-button
        >
        <w-button @click="handleExport"><w-icon type="ic_file_download" />导出</w-button>
        <advanced-rules ref="drawer" @changeFilter="changeFilter" />
      </div>
    </div>
    <div class="knowledge-container">
      <knowledge-sort
        class="knowledge-container__sort"
        :book-id="options.bookId"
        @changeSort="changeSort"
      />
      <knowledge-list class="knowledge-container__list" :form="options" />
    </div>
    <div ref="fileCon" style="display: none">
      <input
        id="file"
        ref="file"
        type="file"
        name="fileUpload"
        style="display: none"
        accept=".xls,.xlsx,.XLS,.XLSX"
        @change="handleFile"
      />
    </div>
  </div>
</template>

<script>
import KnowledgeSort from './components/KnowledgeSort.vue';
import KnowledgeList from './components/KnowledgeList.vue';
import AdvancedRules from './components/AdvancedRules.vue';
import { t } from '@/locale/useLocale';
import { exportFile } from '@/utils/util';
import { importKnowledgeData, exportTemplate } from '@/api/knowLedge';
import { mapActions } from 'vuex';

export default {
  name: 'KnowledgeBase',
  components: {
    KnowledgeSort,
    KnowledgeList,
    AdvancedRules
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.reset();
    });
  },
  data() {
    return {
      options: {
        bookId: 'zsk',
        keyword: '',
        time: [],
        knowledgeTag: [],
        userIds: []
      }
    };
  },
  mounted() {
    this.getDictData();
  },
  methods: {
    ...mapActions('dict', ['getDict2']),
    reset() {
      this.options = {
        ...this.options
      };
    },
    async getDictData() {
      await this.getDict2('knowledge_tag');
    },
    changeSort(sort) {
      this.options.bookId = sort;
    },
    showDrawer() {
      this.$refs.drawer.visible = true;
    },
    handleExport() {
      exportTemplate().then(res => {
        exportFile(res, '知识库模版');
      });
    },
    handleImport() {
      this.$refs.file.click();
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importKnowledgeData(formData);
      if (res.size) {
        this.$message.error('导入失败');
        exportFile(res, '导入失败信息');
      } else {
        this.$message.success('导入成功');
      }
      this.changeSort();
      document.getElementById('file').value = '';
    },
    changeFilter(form) {
      this.options = {
        bookId: this.options.bookId,
        keyword: this.options.keyword,
        ...form
      };
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-base-box {
  display: flex;
  flex-direction: column;
  height: 100%;

  .knowledge-header {
    display: flex;
    justify-content: space-between;
    background-color: var(--supply-color-bg-card-DEFAULT);
    background-image: url('~@/assets/images/modules/knowledge/a_img.png');
    background-repeat: no-repeat;
    background-position: right;

    &-img {
      img {
        margin-right: 10px;
      }
    }

    &-filter {
      .search {
        width: 343px;
        margin-right: 16px;
      }
    }
  }

  .knowledge-container {
    display: flex;
    flex: 1;
    height: 200px;
    margin-top: 12px;
    &__sort {
      background: var(--supply-color-bg-card-DEFAULT);
    }
    &__list {
    }
  }
}
</style>
