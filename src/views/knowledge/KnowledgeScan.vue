<template>
  <div class="knowledge-scan-containner">
    <div class="scan-base">
      <div class="scan-base-title">
        <h4>{{ pageData.pageTitle }}</h4>
        <span v-for="(item, index) in pageData.knowledgeTag" :key="index" class="label">
          {{ labelDictory[item] }}
        </span>
        <w-button icon="arrow-left" @click="goBack">
          {{ $t('knowledge.workspace.goBack') }}
        </w-button>

        <w-button icon="ic_border_color" type="primary" ghost @click="goEdit">
          {{ $t('knowledge.workspace.edit') }}
        </w-button>
      </div>
      <div class="scan-base-info">
        <div class="one">
          <span class="one-create">{{ pageData.createUserName }}</span>
          <w-icon type="ic_watch_later" />
          <span class="one-text">{{ pageData.createTime }}</span>
          <w-icon type="ic_visibility" theme="filled" />
          <span class="one-text">{{ pageData.pv }}</span>
        </div>
        <div class="two">
          <span class="two-title">{{ $t('knowledge.workspace.bookClass') }}：</span>
          <span class="two-value">{{ pagePath }}</span>
        </div>
      </div>
      <div class="scan-base-content" v-html="pageData.pageContent" />
    </div>
    <div class="scan-action">
      <span class="scan-action-left">{{ pageData.createUserName }}</span>
      <div v-if="pageData.releaseFlag === '1'" class="scan-action-right">
        <span :class="pageData.likeStatus === '1' ? 'active' : ''" @click="handleLike()">
          <w-icon type="like" theme="filled" />
          {{ pageData.likeNum ? pageData.likeNum : '0' }}
        </span>
        <span :class="pageData.collectStatus === '1' ? 'active' : ''" @click="handleStar()">
          <w-icon type="star" theme="filled" />
          {{ pageData.collectNum ? pageData.collectNum : '0' }}
        </span>
      </div>
    </div>
    <div class="scan-file">
      <div class="scan-file-header">
        <p class="title">{{ $t('knowledge.workspace.uploadFile') }}</p>
        <div v-if="pageData.files && pageData.files.length" class="btns">
          <w-button type="primary" ghost size="small" @click="checkAll">
            {{
              filesMode ? $t('knowledge.workspace.allSelect') : $t('knowledge.workspace.noSelect')
            }}
          </w-button>
          <w-button type="primary" size="small" class="btn-item" @click="downBatch(checkKeys)">
            {{ $t('knowledge.workspace.batchDown') }}
          </w-button>
        </div>
      </div>
      <div v-if="pageData.files && pageData.files.length" class="scan-file-content">
        <div v-for="item in pageData.files" :key="item.fileId" class="file-box">
          <div class="show">
            <w-checkbox
              v-model="item.checked"
              class="checkbox"
              @change="e => onChange(e, item.fileId)"
            />
            <img style="height: 30px" :src="fileImg(item.name.split('.')[1])" alt="" srcset="" />
            {{ item.name }}
          </div>
          <div class="down" @click="downSingle(item.url)">
            <img src="@/assets/images/modules/knowledge/ic_下载_18.png" alt="" srcset="" />
            <span>{{ $t('knowledge.workspace.downLoad') }}</span>
          </div>
        </div>
      </div>
      <div v-else>{{ $t('knowledge.workspace.noFile') }}</div>
    </div>
  </div>
</template>

<script>
import {
  batchDownloadFile,
  getPageDetail,
  getPagePath,
  knowledgeLikeAdd,
  knowledgeLikeCancel,
  knowledgeStar
} from '@/api/knowLedge';
import { t } from '@/locale/useLocale';
import { mapState } from 'vuex';

export default {
  name: 'KnowledgeScan',
  inject: ['closeTab'],
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.pageId = to.query.id;
      vm.loadData();
      vm.getPagePath();
    });
  },

  data() {
    return {
      pagePath: '',
      checkKeys: [],
      pageId: '',
      pageData: {},
      filesMode: true
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
    }
  },
  watch: {
    checkKeys(val) {
      if (val.length === this.pageData.files.length) {
        this.filesMode = false;
      } else if (val.length === 0) {
        this.filesMode = true;
      }
    }
  },

  methods: {
    async loadData() {
      let { status, resultData } = await getPageDetail(this.pageId);
      // let { status, resultData } = this.getMock('detail', this.pageId);
      if (status === 'complete') {
        resultData.files = JSON.parse(resultData.files);
        this.pageData = resultData;
        this.pageData.files = resultData.files
          ? resultData.files.map(item => {
              return { ...item, checked: false };
            })
          : '';
      }
    },
    async getPagePath() {
      let { status, resultData } = await getPagePath(this.pageId);
      if (status === 'complete') {
        this.pagePath = resultData;
      }
    },
    goBack() {
      this.closeTab(this.$route.path);
    },
    async like(id) {
      this.pageData.likeStatus = '1';
      this.pageData.likeNum++;
      let param = { knowledgeId: id };
      let res = await knowledgeLikeAdd(param);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.likeSuccess'));
      }
    },
    async unLike(id) {
      this.pageData.likeStatus = '0';
      this.pageData.likeNum--;
      let param = { knowledgeId: id };
      let res = await knowledgeLikeCancel(param);
      if (res.status === 'complete') {
        this.$message.success(t('knowledge.workspace.likeCancel'));
      }
    },
    handleStar() {
      let id = this.pageId;
      let flag = this.pageData.collectStatus === '1' ? true : false; // 当前收藏状态
      let state = flag ? '0' : '1'; // 赋予新值
      if (flag) {
        this.pageData.collectStatus = '0';
        this.pageData.collectNum--;
      } else {
        this.pageData.collectStatus = '1';
        this.pageData.collectNum++;
      }
      this.star(id, state);
    },
    handleLike() {
      let id = this.pageId;
      let flag = this.pageData.likeStatus === '1' ? true : false;
      let state = flag ? '0' : '1';
      state === '1' ? this.like(id) : this.unLike(id);
    },
    async star(id, flag) {
      let param = {
        collectType: flag,
        pageIds: [id]
      };
      let res = await knowledgeStar(param);
      if (res.status === 'complete') {
        if (flag === '1') {
          this.$message.success(t('knowledge.workspace.starSuccess'));
        } else {
          this.$message.success(t('knowledge.workspace.starCancel'));
        }
      }
    },

    goEdit() {
      this.drillDown({
        path: '/knowledge-add',
        query: { id: this.pageId }
      });
    },

    fileImg(info) {
      switch (info) {
        case 'ppt':
          return require('@/assets/images/modules/knowledge/ic_ppt_30.png');
        case 'docx':
        case 'doc':
          return require('@/assets/images/modules/knowledge/ic_word_30.png');
        case 'jpeg':
        case 'jpg':
          return require('@/assets/images/modules/knowledge/ic_jpg_30.png');
        case 'png':
          return require('@/assets/images/modules/knowledge/ic_png.png');
        case 'mp3':
        case 'mp4':
          return require('@/assets/images/modules/knowledge/ic_video_30.png');
        case 'pdf':
          return require('@/assets/images/modules/knowledge/ic_pdf_30.png');
        case 'txt':
          return require('@/assets/images/modules/knowledge/ic_txt_30.png');
        case 'zip':
          return require('@/assets/images/modules/knowledge/ic_zip_30.png');
        case 'xls':
        case 'xlsx':
          return require('@/assets/images/modules/knowledge/ic_excel_30.png');
        default:
          return require('@/assets/images/modules/knowledge/ic_nodata_30.png');
      }
    },

    downSingle(url) {
      window.open(url, '_self');
    },

    async downBatch(keys) {
      if (keys.length === 0) {
        this.$message.warning(t('knowledge.workspace.selectFile'));
      } else {
        let param = {
          fileIdList: keys
        };
        let res = await batchDownloadFile(param);

        this.parseBlob(res, 'zip', 'application/zip');
      }
    },

    parseBlob(data, ext = 'xlsx', type = 'application/vnd.ms-excel') {
      // data：指待读取blob数据
      let reader = new FileReader();
      reader.onload = event => {
        // 读取之后进行操作的代码区域，event.currentTarget.result 指读取到的内容
        try {
          let result = JSON.parse(event.currentTarget.result);
          if (result && result.status === 'error') {
            Vue.prototype.$message.error(result.errorMessage);
          }
        } catch (e) {
          this.exportFile(data, data.fileName || t('knowledge.workspace.filePackage'), ext, type);
        }
      };
      // 调用方法读取
      reader.readAsText(data);
    },

    exportFile(data, filename, ext = 'xlsx', type = 'application/vnd.ms-excel') {
      let blob = new Blob([data], { type });
      if (window.navigator.msSaveBlob) {
        try {
          // ie浏览器自带下载文件的方法
          window.navigator.msSaveBlob(data, filename);
        } catch (e) {}
      } else {
        let elink = document.createElement('a');
        elink.download = `${filename}.${ext}`;
        elink.style.display = 'none';
        let href = window.URL.createObjectURL(blob);
        elink.href = href;
        document.body.appendChild(elink);
        elink.click();
        document.body.removeChild(elink);
        window.URL.revokeObjectURL(href); // 释放掉blob对象
      }
    },

    onChange(e, id) {
      e.target.checked
        ? this.checkKeys.push(id)
        : this.checkKeys.splice(
            this.checkKeys.findIndex(item => item === id),
            1
          );
    },

    checkAll() {
      this.checkKeys = [];
      for (let index = 0; index < this.pageData.files.length; index++) {
        const element = this.pageData.files[index];
        if (this.filesMode) {
          this.checkKeys.push(element.fileId);
          element.checked = true;
        } else {
          element.checked = false;
        }
      }
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-scan-containner {
  background: var(--supply-color-bg-card-DEFAULT);
  height: 100%;
  padding: 12px;
  overflow-x: hidden;
  overflow-y: scroll;

  .scan-base {
    padding: 20px 20px 16px;
    border-radius: 4px;

    &-title {
      height: 36px;

      h4 {
        display: inline-block;
        margin-right: 12px;
        color: var(--supply-color-main);
        font-weight: 500;
        font-size: 22px;
        background-image: linear-gradient(
          -64deg,
          rgba(128, 180, 255, 0) 0%,
          rgba(65, 138, 255, 0.45) 95%
        );
        background-repeat: no-repeat;
        background-position: 0 bottom;
        background-size: 100% 50%;
      }

      .label {
        display: inline-block;
        height: 18px;
        margin-right: 8px;
        padding: 0 6px;
        color: var(--supply-color-primary-DEFAULT);
        font-size: 12px;
        line-height: 16px;
        border: 1px solid var(--supply-color-primary-DEFAULT);
        border-radius: 2px;
      }

      button {
        float: right;
        margin-left: 12px;
      }
    }

    &-info {
      margin-top: 10px;
      padding: 16px;
      background: var(--supply-color-bg-card-dark);
      border-radius: 2px;

      .one {
        &-create {
          margin-right: 3px;
          color: var(--supply-color-main);
          font-weight: 400;
          font-size: 16px;
          text-decoration: underline;
        }

        i {
          margin-right: 8px;
          margin-left: 21px;
          color: #8292ad;
        }

        &-text {
          color: var(--supply-color-secondary);
          font-size: 14px;
        }
      }

      .two {
        margin-top: 12px;

        &-title {
          color: var(--supply-color-secondary);
          font-size: 14px;
        }

        &-value {
          color: var(--supply-color-primary-DEFAULT);
        }
      }
    }

    &-content {
      margin-top: 16px;
      overflow: auto;
      color: var(--supply-color-secondary);
      line-height: 22px;
      letter-spacing: 0;
    }
  }

  .scan-action {
    display: flex;
    align-items: center;
    justify-content: space-between;
    height: 54px;
    margin-top: 12px;
    padding: 0 16px;
    border-radius: 4px;

    &-left {
      color: var(--supply-color-main);
      font-size: 16px;
      text-decoration: underline;
    }

    &-right {
      span {
        position: relative;
        padding: 0 11px;
        color: var(--supply-color-secondary);
        font-size: 12px;
        cursor: pointer;

        i {
          margin-right: 3px;
          color: #8392ad;
          font-size: 14px;
        }

        &::after {
          position: absolute;
          top: 3px;
          right: 1px;
          width: 1px;
          height: 12px;
          background-color: #dee2e7;
          content: '';
        }

        &:first-child {
          padding-left: 0;
        }

        &:last-child {
          &::after {
            background-color: transparent;
          }
        }
      }

      .active {
        color: var(--supply-color-primary-DEFAULT);

        i {
          color: var(--supply-color-primary-DEFAULT);
        }
      }
    }
  }

  .scan-file {
    margin-top: 12px;
    padding: 20px;
    border-radius: 4px;

    &-header {
      display: flex;
      justify-content: space-between;
      margin-bottom: 12px;

      .title {
        display: flex;
        align-items: center;
        color: var(--supply-color-main);
        font-weight: 500;
        font-size: 14px;

        &::before {
          display: inline-block;
          width: 4px;
          height: 14px;
          margin-right: 9px;
          background-color: #87ce40;
          content: '';
        }
      }

      .btns {
        .btn-item {
          margin-left: 12px;
        }
      }
    }

    &-content {
      .file-box {
        display: flex;
        align-items: center;
        justify-content: space-between;
        height: 50px;
        padding: 0 30px 0 16px;
        border: 1px dashed #d0d5db;
        border-bottom: none;

        .show {
          color: var(--supply-color-main);
          font-size: 14px;

          img {
            margin: 0 12px;
          }
        }

        .down {
          color: var(--supply-color-secondary);
          font-size: 14px;
          cursor: pointer;

          img {
            margin-top: -2px;
            margin-right: 3px;
          }
        }

        &:last-child {
          border-bottom: 1px dashed #d0d5db;
        }
      }
    }
  }
}
</style>
