<template>
  <w-modal
    class="knowledge-dialog secondary-modal"
    :title="modalTitle"
    :visible="visible"
    :confirm-loading="confirmLoading"
    :width="800"
    :okText="okText"
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <div ref="wrapper" class="knowledge-wrapper">
      <div v-if="isEdit" class="table-page-search-wrapper">
        <w-form-model ref="form" layout="inline" class="query-form" :model="options" :rules="rules">
          <w-row :gutter="20">
            <w-col :span="8">
              <w-form-model-item label="知识类型" prop="operationType">
                <w-select v-model="options.operationType" @change="changeType">
                  <w-select-option
                    v-for="item in operationType"
                    :key="item.code"
                    :value="item.code"
                  >
                    {{ item.name }}
                  </w-select-option>
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col :span="8">
              <w-form-model-item label="知识名称" prop="knowledgeName">
                <w-input v-model.trim="options.knowledgeName" :max="32"></w-input>
              </w-form-model-item>
            </w-col>
            <w-col :span="8">
              <w-form-model-item label="版本" prop="version">
                <w-input-number
                  v-model.trim="options.version"
                  :min="0.1"
                  :max="10000"
                  :step="0.1"
                  :precision="2"
                ></w-input-number>
              </w-form-model-item>
            </w-col>
            <w-col v-show="showPoint" :span="24">
              <w-form-model-item label="关联监测量" prop="pointVOList">
                <w-select
                  v-model="options.pointVOList"
                  mode="multiple"
                  placeholder="请选择\输入"
                  :filterOption="false"
                  :options="renderedOptions"
                  @search="handleSearch"
                  @popupScroll="handleScroll"
                  @select="handleSelect"
                >
                </w-select>
              </w-form-model-item>
            </w-col>
            <w-col :span="24" class="knowledge-content">
              <w-form-model-item prop="knowledgeContent">
                <tinymce v-model="options.knowledgeContent" />
              </w-form-model-item>
            </w-col>
          </w-row>
        </w-form-model>
      </div>

      <div v-else class="table-page-preview-wrapper">
        <w-descriptions>
          <w-descriptions-item label="知识名称">
            {{ options.knowledgeName || '--' }}
          </w-descriptions-item>
          <w-descriptions-item label="版本">
            {{ options.version || '--' }}
          </w-descriptions-item>
        </w-descriptions>
        <div class="table-page-preview-content" v-html="knowledgeContent"></div>
      </div>
    </div>
  </w-modal>
</template>

<script>
const LOAD_NUM = 50; // 加载条数--可自定义
import debounce from 'lodash/debounce';
import { mapState } from 'vuex';
import Tinymce from '@/components/Tinymce';
import {
  addOperationKnowledge,
  updateOperationKnowledge,
  selectOperationKnowledge,
  allPointList
} from '@/api/work';
import serverConfig from '@/config/server.config';
import { convertUrl } from '@/utils/uri';

function isHttpUrl(url) {
  return url && url.substr(0, 4) === 'http';
}

function htmlparser(html) {
  let el = document.createElement('div');
  el.innerHTML = html;

  let links = el.querySelectorAll('a');
  let images = el.querySelectorAll('img');
  links.forEach(link => {
    let href = link.getAttribute('href');
    let url = href ? convertUrl(href, 'absolute', serverConfig.IMG_BASE_URL, '') : '';
    link.setAttribute('href', isHttpUrl(url) ? url : serverConfig.IMG_BASE_URL + url);
  });
  images.forEach(img => {
    let src = img.getAttribute('src');
    let url = src ? convertUrl(src, 'absolute', serverConfig.IMG_BASE_URL, '') : '';
    img.setAttribute('src', isHttpUrl(url) ? url : serverConfig.IMG_BASE_URL + url);
  });

  return el.innerHTML;
}

function getFileName(path) {
  const array = path.split('/');
  return array[array.length - 1];
}

function getExtName(path) {
  const array = path.split('.');
  return array.length > 1 ? '.' + array[array.length - 1] : '';
}

const EXTS = [
  // image
  '.jpg',
  '.jpeg',
  '.png',
  '.gif',
  '.webp',
  '.tiff',
  '.bmp',
  '.svg',
  // media
  '.mp3',
  '.mp4',
  '.mkv',
  // file
  '.txt',
  '.md',
  '.pdf',
  '.doc',
  '.docx',
  '.ppt',
  '.pptx',
  '.xlsx',
  '.xls',
  '.7z',
  '.zip',
  '.rar'
];

const EDIT_TYPE_MAP = {
  1: '新增',
  2: '编辑',
  3: '复制'
};

export default {
  components: {
    Tinymce
  },

  props: {
    editable: {
      type: Boolean,
      default: true
    },
    readonly: {
      type: Boolean,
      default: false
    },
    editType: {
      type: Number,
      default: 1 // 1->新增信息; 2->编辑信息; 3=>复制信息;
    },
    knowledgeData: {
      type: Object,
      default: () => ({})
    }
  },

  data() {
    this.delegateWrapper = this.delegateWrapper.bind(this);
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      options: {
        operationType: '',
        version: '',
        knowledgeName: '',
        knowledgeContent: '',
        pointVOList: []
      },
      rules: {
        operationType: [{ required: true, message: '请选择知识类型' }],
        version: [{ required: true, message: '请输入版本' }],
        knowledgeName: [
          { required: true, message: '请输入知识名称' },
          { max: 32, message: '知识名称最多32个字符' }
        ],
        knowledgeContent: [{ required: true, message: '请输入知识内容' }]
      },
      confirmLoading: false,
      isEdit: this.editable,
      visible: false,
      pointsList: [],
      showPoint: false,
      renderedOptions: [],
      searchVal: ''
    };
  },

  computed: {
    ...mapState('dict', {
      operationType: state => state.operation_type
    }),
    modalTitle() {
      let tit = EDIT_TYPE_MAP[this.editType];
      if (!this.isEdit) {
        tit = '查看';
      }
      return `${tit}知识库`;
    },
    okText() {
      return this.isEdit || this.readonly ? '确认' : '编辑';
    },
    knowledgeContent() {
      let content = this.options.knowledgeContent;

      if (content) {
        content = htmlparser(content);
      }

      return content;
    }
  },

  watch: {
    editable(val) {
      this.isEdit = val;
    },
    visible(val) {
      if (val) {
        this.isEdit = this.editable;
        this.restoreData();
        this.$nextTick(() => {
          this.delegateClick();
        });
      } else {
        this.offClick();
      }
    }
  },
  created() {
    this.getPointList();

    // store方法没有执行，判断是没有值去获取
    if (!this.operationType || this.operationType.length === 0) {
      this.$store.dispatch('dict/GetOperationType');
    }
  },

  methods: {
    async getPointList() {
      const { resultData } = await allPointList();
      this.pointsList = resultData.map(p => {
        return {
          label: p.pointMemo,
          value: p.pointName,
          key: p.pointName
        };
      });
      this.renderedOptions = this.pointsList.slice(0, LOAD_NUM);
    },

    async selectOperationKnowledge(id) {
      let res = await selectOperationKnowledge(id);
      let { status, resultData } = res;

      if (status === 'complete') {
        this.options = {
          operationType: resultData.operationType || '',
          version: this.editType === 3 ? '' : this.numberFormat(resultData.version || resultData.currentVersion),
          knowledgeName:
            this.editType === 3 ? `${resultData.knowledgeName}_copy` : resultData.knowledgeName || resultData.pageTitle,
          knowledgeContent: resultData.knowledgeContent || resultData.pageContent || ''
        };
        if (resultData.operationType === '1') {
          this.showPoint = true;
        }
      }
    },

    async addOperationKnowledge() {
      const params = JSON.parse(JSON.stringify(this.options));
      if (params.pointVOList) {
        params.pointVOList = params.pointVOList.map(v => {
          return { alarmCode: v };
        });
      }
      let res = await addOperationKnowledge(params);
      let ret = res.status === 'complete';

      if (!ret) {
        this.$message.error(res.errorMessage || '新增失败');
      }

      return ret;
    },

    async updateOperationKnowledge(id) {
      const params = JSON.parse(JSON.stringify(this.options));
      if (params.pointVOList) {
        params.pointVOList = params.pointVOList.map(v => {
          return { alarmCode: v };
        });
      }
      let res = await updateOperationKnowledge({
        ...params,
        id
      });

      let ret = res.status === 'complete';

      if (!ret) {
        this.$message.error(res.errorMessage || '编辑失败');
      }

      return ret;
    },

    async submit() {
      let ret;
      this.confirmLoading = true;

      if (this.editType === 1 || this.editType === 3) {
        ret = await this.addOperationKnowledge();
      } else {
        ret = await this.updateOperationKnowledge(this.knowledgeData.id);
      }
      this.confirmLoading = false;

      if (ret) {
        this.$message.success(`${EDIT_TYPE_MAP[this.editType]}成功`);
        this.$emit('update');
        this.visible = false;
      }
    },

    delegateClick() {
      if (this.$refs.wrapper) {
        this.$refs.wrapper.addEventListener('click', this.delegateWrapper);
      }
    },

    offClick() {
      if (this.$refs.wrapper) {
        this.$refs.wrapper.removeEventListener('click', this.delegateWrapper);
      }
    },

    delegateWrapper(evt) {
      let target = evt.target;
      if (target && target.nodeName.toLowerCase() === 'a') {
        let extName = getExtName(target.href);
        let filename = target.innerText;

        if (EXTS.includes(extName)) {
          evt.preventDefault();
          import('file-saver').then(FileSaver => {
            FileSaver.saveAs(target.href, filename);
          });
        }
      }
    },

    numberFormat(val) {
      let value = String(val);
      if (value) {
        value = value.replace('v', '');
        value = value ? parseFloat(value).toFixed(2) : '';
      }

      return value ? parseFloat(value) : '';
    },

    operationTypeFormat(operationType) {
      const item = this.operationType.find(v => v.code === operationType);

      return item ? item.name : '--';
    },

    restoreData() {
      if (this.editType === 1) {
        this.options = {
          operationType: '',
          version: '',
          knowledgeName: '',
          knowledgeContent: ''
        };
      } else {
        this.selectOperationKnowledge(this.knowledgeData.id);
      }
    },

    handleOk() {
      if (this.readonly) {
        this.visible = false;
      } else if (this.isEdit) {
        this.$refs.form.validate(valid => {
          if (valid) {
            this.submit();
          }
        });
      } else {
        this.isEdit = true;
      }
    },

    handleCancel() {
      if (this.$refs.form) {
        this.$refs.form.resetFields();
      }

      this.visible = false;
    },

    changeType(e) {
      let selected = null;
      this.operationType.map(type => {
        if (e === type.code) {
          selected = type;
        }
      });
      if (selected.name === '报警知识') {
        this.showPoint = true;
      } else {
        this.showPoint = false;
      }
    },
    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.searchVal = val;
      let filterList = [];
      if (val) {
        filterList = this.pointsList.filter(item => {
          let value = item.value + item.label;
          if (value.indexOf(val) > -1) return item;
        });
      } else {
        filterList = this.pointsList;
      }
      this.filterDataList = filterList;
      let arr = filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
      this.$set(this, 'renderedOptions', arr);
    },
    // 滚动时触发（防止抖动）
    handlePopupScroll() {
      if (this.searchVal === '') {
        this.loadMoreData(this.pointsList);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    },
    // 加载更多数据到select框
    loadMoreData(dataList) {
      const renderedLen = this.renderedOptions.length; // 已渲染的下拉列表长度
      const totalLen = dataList.length; // 当前数据源的长度
      let addList = [];
      if (renderedLen < totalLen) {
        if (renderedLen + LOAD_NUM <= totalLen) {
          addList = dataList.slice(renderedLen, renderedLen + LOAD_NUM);
        } else {
          addList = dataList.slice(renderedLen, renderedLen + (totalLen % LOAD_NUM));
        }
        this.renderedOptions = this.renderedOptions.concat(addList);
      }
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      if (this.searchVal) {
        const selectedArr = this.pointsList.filter(item => item === val); // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const restList = this.pointsList.filter(item => item !== val); // 从数据源中过滤出其他的值，返回一个数组
        const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        this.renderedOptions = newList; // 更新已渲染的下拉列表
        this.pointsList = selectedArr.concat(restList); // 更新数据源
        this.searchVal = ''; // 因为触发handleSelect函数时，会自动清空用户输入的内容。因此，searchVal需要重置。
      }
    }
  }
};
</script>

<style lang="less" scoped>
.knowledge-dialog {
  /deep/ .ant-modal-body {
    padding: 20px 40px;
  }

  /deep/ .ant-modal-footer {
    padding: 10px 40px 36px;
  }

  /deep/ .ant-descriptions {
    .ant-descriptions-item-label {
      // font-size: 12px;
    }

    .ant-descriptions-item-content {
      color: #999;
      // font-size: 12px;
    }
  }

  .table-page-search-wrapper {
    padding: 0;
  }

  .knowledge-content {
    margin-top: 15px;

    /deep/ .ant-form-item {
      .ant-form-item-control {
        height: auto;
        line-height: 1.5;
      }
    }
  }
}
</style>

<style lang="less">
.table-page-preview-content {
  height: 350px;
  overflow: auto;
  font-size: 14px;
  line-height: 1.8;

  table {
    border-top: 1px solid #ccc;
    border-left: 1px solid #ccc;
  }

  table td,
  table th {
    padding: 3px 5px;
    border-right: 1px solid #ccc;
    border-bottom: 1px solid #ccc;
  }

  table th {
    text-align: center;
    border-bottom: 1px solid #ccc;
  }

  /* blockquote 样式 */
  blockquote {
    display: block;
    margin: 10px 0;
    padding: 5px 10px;
    font-size: 100%;
    line-height: 1.4;
    background-color: #f1f1f1;
    border-left: 8px solid #d0e5f2;
  }

  /* code 样式 */
  code {
    display: inline-block;
    *display: inline;
    margin: 0 3px;
    padding: 3px 5px;
    background-color: #f1f1f1;
    border-radius: 3px;
    *zoom: 1;
  }

  pre code {
    display: block;
  }

  /* ul ol 样式 */
  ul,
  ol {
    margin: 10px 0 10px 20px;
  }
}
</style>
