<!--
 * @Author: wangyr
 * @Date: 2023-05-18 10:53:35
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-13 11:32:43
 * @Description:
-->
<template>
  <div class="biologyAtlas">
    <!-- 头部区域 -->
    <div class="biologyAtlas-head">
      <div class="form-header">
        {{ currentName }}
      </div>
      <w-button type="primary" icon="plus" style="float: right;" @click="addAtlas">
        新增配置
      </w-button>
    </div>
    <!-- 表格区域 -->
    <div class="biologyAtlas-central">
      <div class="table-box">
        <w-table
          :columns="columns"
          :data-source="tableData"
          :scroll="{ y: 'calc(100% - 50px)' }"
          bordered
          :pagination="false"
        >
          <template slot="img" slot-scope="text, record">
            <img
              v-for="item in record.urlList"
              :key="item"
              class="file-item"
              :src="item"
              @click="handlePreview(item)"
            />
          </template>
          <template slot="operation" slot-scope="text, record">
            <a @click="editAtlas(record)">编辑</a>
          </template>
        </w-table>
      </div>
    </div>
    <!-- 新增/编辑弹窗 -->
    <w-modal
      v-model="addVisible"
      :title="visibleTitle"
      @ok="handleOk"
      :width="800"
      :maskClosable="false"
      @cancel="resetForm"
    >
      <w-form-model
        ref="ruleForm"
        :model="addForm"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <w-form-model-item label="模块名称" prop="code">
          <w-select v-model="addForm.code">
            <w-select-option v-for="item in modalList" :key="item.value" :value="item.value">
              {{ item.label }}
            </w-select-option>
          </w-select>
        </w-form-model-item>
        <w-form-model-item label="标题" prop="title">
          <w-input v-model="addForm.title"></w-input>
        </w-form-model-item>
        <w-form-model-item label="描述信息" prop="memo">
          <w-textarea v-model="addForm.memo" placeholder="请输入描述信息" :rows="4" />
        </w-form-model-item>
        <w-form-model-item label="图片信息">
          <uploadImg ref="uploadImg" v-model="fileList" :limit="9" :type="1"></uploadImg>
        </w-form-model-item>
      </w-form-model>
    </w-modal>
    <w-modal
      :visible="imgVisible"
      width="600px"
      :footeeleteDevicer="null"
      :footer="null"
      @cancel="imgVisible = false"
    >
      <img style="width: 100%" :src="previewImgUrl" />
    </w-modal>
  </div>
</template>

<script>
import { getDataFileList, addOrUpdateDataFile } from '@/api/manage';
import { sysDictListByCode } from '@/api/manage';
import uploadImg from './uploadImg';
import serverConfig from '@/config/server.config';

export default {
  name: 'ScreenSetting',
  components: {
    uploadImg,
    ImgSlider: () => import('@/views/pressureEquipments/ImgDeviceSlider.vue')
  },
  props: {
    currentName: {
      type: String,
      default: '大屏配置'
    }
  },
  data() {
    return {
      addVisible: false,
      imgVisible: false,
      visibleTitle: '新增大屏配置',
      previewImgUrl: '',
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          align: 'center',
          width: 80,
          customRender: (text, row, index) => index + 1
        },
        {
          title: '模块名称',
          dataIndex: 'codeName',
          align: 'center',
          width: 160,
          key: 'codeName'
        },
        {
          title: '标题',
          dataIndex: 'title',
          align: 'center',
          width: 160,
          key: 'title'
        },
        {
          title: '图片',
          dataIndex: 'url',
          align: 'center',
          width: 400,
          key: 'url',
          scopedSlots: { customRender: 'img' }
        },
        {
          title: '描述信息',
          dataIndex: 'memo',
          ellipsis: false,
          width: 350,
          key: 'memo'
        },
        {
          title: '操作',
          dataIndex: 'operation',
          align: 'center',
          key: 'operation',
          scopedSlots: { customRender: 'operation' }
        }
      ],
      tableData: [],
      modalList: [],
      modalName: {},
      addForm: {
        url: '',
        code: '',
        memo: '',
        title: ''
      },
      fileList: [],
      rules: {
        code: [{ required: true, message: '请选择模块名称', trigger: 'blur' }],
        memo: [{ required: true, message: '请输入描述信息', trigger: 'blur' }]
      },
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      atlasId: ''
    };
  },
  async mounted() {
    await this.sysDictListByCode('screenSetting', 'modal');
    this.getPageData();
  },
  methods: {
    // 去掉地址中的协议和域名，仅保留路径用于后端保存
    stripOrigin(url) {
      if (!url) return url;
      try {
        const u = new URL(url, window.location.origin);
        return `${u.pathname}${u.search}${u.hash}`;
      } catch (e) {
        return url.replace(/^[http|https]?:\/\/[^/]+/i, '');
      }
    },
    /** 报警类型 */
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[`${data}List`] = res.resultData.map(item => {
        return {
          ...item,
          label: item.dictName,
          value: item.dictValue
        };
      });
      this[`${data}Name`] = this[`${data}List`].reduce((acc, item) => {
        acc[item.dictValue] = item.dictName;
        return acc;
      }, {});
    },
    // 获取页面数据
    getPageData() {
      const params = { fileGroup: 'screen' };
      getDataFileList(params).then(res => {
        const { status, resultData } = res;
        if (status === 'complete') {
          this.tableData = resultData.map(item => ({
            ...item,
            codeName: this.modalName[item.code] || '',
            urlList: item.url ? item.url.split(',').map(this.formatFileUrl) : []
          }));
        }
      });
    },
    // 格式化文件URL
    formatFileUrl(url) {
      // 计算基础URL，只判断一次环境
      const isDevelopment = process.env.NODE_ENV === 'development';
      const baseUrl = isDevelopment ? serverConfig.PUBLIC_API_BASE_URL : window.location.origin;

      // 提取URL处理逻辑为单独函数
      const processUrl = path => {
        // 移除或替换/api前缀
        const processed = isDevelopment
          ? path.replace(/^\/api/, '')
          : path.replace(/^\/api/, '/main');

        // 处理重复的/main
        return processed.replace(/(\/main)+/g, isDevelopment ? '' : '/main');
      };

      return `${baseUrl}${processUrl(url)}`;
    },
    // 新增配置弹窗
    addAtlas() {
      this.addVisible = true;
      this.visibleTitle = '新增大屏配置';
      this.resetForm();
    },
    // 提交表单
    handleOk() {
      if (this.fileList.length < 1) {
        this.$message.warning('请先上传图片信息！');
        return;
      }
      this.$refs.ruleForm.validate(valid => {
        if (!valid) return false;
        const params = {
          ...this.addForm,
          fileGroup: 'screen',
          // 存库时移除域名，仅保留路径
          url: this.fileList.map(file => this.stripOrigin(file.fileUrl)).join(','),
          fileId: this.fileList[0].fileId
        };
        if (this.visibleTitle === '新增大屏配置') {
          addOrUpdateDataFile(params).then(this.handleSuccess('添加成功'));
        } else {
          params.id = this.atlasId;
          addOrUpdateDataFile(params).then(this.handleSuccess('编辑成功'));
        }
      });
    },
    // 操作成功回调
    handleSuccess(msg) {
      return res => {
        if (res.status === 'complete') {
          this.$message.success(msg);
          this.addVisible = false;
          this.resetForm();
          this.getPageData();
        }
      };
    },
    // 重置表单
    resetForm() {
      this.fileList = [];
      this.addForm = { url: '', title: '', code: '', memo: '' };
      this.$refs.ruleForm && this.$refs.ruleForm.resetFields();
    },
    // 预览图片
    handlePreview(src) {
      this.imgVisible = true;
      this.previewImgUrl = src;
    },
    // 编辑配置
    editAtlas(row) {
      this.addForm = {
        url: row.url,
        title: row.title,
        memo: row.memo,
        code: row.code
      };
      this.atlasId = row.id;
      this.addVisible = true;
      this.visibleTitle = '编辑大屏配置';
      this.fileList = row.urlList.map(item => {
        const fileId = item.split('/').pop();
        return { fileId, status: 'done', fileUrl: item };
      });
    }
  }
};
</script>

<style lang="less" scoped>
.biologyAtlas {
  height: 100%;
  width: 100%;

  .biologyAtlas-head {
    width: 100%;
    height: 60px;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 12px;

    .form-header {
      color: var(--supply-color-main);
      font-size: 16px;
      line-height: 14px;
      margin: 12px 0 22px;
      display: flex;
      align-items: center;
      justify-content: flex-end;
      &::before {
        display: inline-block;
        width: 4px;
        height: 14px;
        margin-right: 8px;
        vertical-align: top;
        background-color: var(--supply-color-primary-DEFAULT);
        content: '';
      }
    }
  }
  .biologyAtlas-central {
    margin-top: 10px;
    height: calc(100% - 70px);
    width: 100%;
    background-color: var(--supply-color-bg-card-DEFAULT);
    border-radius: 4px;
    padding: 10px 12px;
    .table-box {
      width: 100%;
      height: calc(100% - 50px);
      .file-item {
        width: 120px;
        height: 120px;
        cursor: pointer;
      }
    }
    .pagination {
      height: 50px;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: flex-end;
    }
  }
}
/deep/.wpg-table-wrapper {
  height: 100%;

  .wpg-spin-nested-loading,
  .wpg-spin-container,
  .wpg-table,
  .wpg-table-content,
  .wpg-table-scroll {
    height: 100%;
    overflow: hidden;
  }

  /* .wpg-table {
    &-thead tr > th,
    &-tbody tr > td {
      padding-left: 20px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  } */

  .wpg-table-tbody {
    tr {
      cursor: pointer;

      & > td.wpg-table-selection-column span {
        display: none;
      }

      &.wpg-table-row-selected {
        background: #eaf1fb;
      }
    }
  }
}
/deep/.media .media-img .img-card {
  background: var(--mbg-4-cls);
}
</style>
