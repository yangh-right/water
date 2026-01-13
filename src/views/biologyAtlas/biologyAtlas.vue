<!--
 * @Author: wangyr
 * @Date: 2023-05-18 10:53:35
 * @LastEditors: Do not edit
 * @LastEditTime: 2023-06-13 11:32:43
 * @Description:
-->
<template>
  <div class="biologyAtlas">
    <div class="biologyAtlas-head">
      <w-form-model
        class="supply-bg-bg-card-DEFAULT"
        layout="inline"
        ref="form"
        :model="searchForm"
      >
        <w-form-model-item label="微生物名称" prop="keyWord">
          <w-input v-model="searchForm.name" placeholder="请输入微生物名称" />
        </w-form-model-item>
        <w-form-model-item prop="keyWord">
          <w-button type="primary" icon="search" @click="searchClick">
            查询
          </w-button>
        </w-form-model-item>
      </w-form-model>
      <w-button type="primary" icon="plus" style="float: right;" @click="addAtlas">
        新增图谱
      </w-button>
    </div>
    <div class="biologyAtlas-central">
      <div class="table-box">
        <w-table
          :columns="columns"
          :data-source="tableData"
          :scroll="{ y: 'calc(100% - 50px)' }"
          bordered
          :pagination="false"
        >
          <template slot="img" slot-scope="record">
            <img
              class="file-item"
              :src="handleImgSrc(record)"
              @click="handlePreview(handleImgSrc(record))"
            />
          </template>
          <template slot="operation" slot-scope="text, record">
            <a @click="editAtlas(record)">编辑</a>
            <w-popconfirm
              title="确定删除该图谱吗？"
              ok-text="确定"
              cancel-text="取消"
              @confirm="delAtlas(record)"
            >
              <a style="margin-left: 10px;">删除</a>
            </w-popconfirm>
          </template>
        </w-table>
      </div>
      <div class="pagination">
        <w-pagination
          show-size-changer
          :current="current"
          :page-size.sync="pageSize"
          :total="total"
          @showSizeChange="onShowSizeChange"
          @change="currentChange"
        />
      </div>
    </div>
    <w-modal
      v-model="addVisible"
      :title="visibleTitle"
      @ok="handleOk"
      :width="800"
      :maskClosable="false"
      @cancel="cancel"
    >
      <w-form-model
        ref="ruleForm"
        :model="addForm"
        :rules="rules"
        :label-col="labelCol"
        :wrapper-col="wrapperCol"
      >
        <w-form-model-item label="微生物名称" prop="name">
          <w-input v-model="addForm.name" />
        </w-form-model-item>
        <w-form-model-item label="形态特点" prop="trait">
          <w-textarea v-model="addForm.trait" placeholder="请输入形态特点" :rows="4" />
        </w-form-model-item>
        <w-form-model-item label="指示意义" prop="indicate">
          <w-textarea v-model="addForm.indicate" placeholder="请输入指示意义" :rows="4" />
        </w-form-model-item>
        <w-form-model-item label="图片信息">
          <uploadImg ref="uploadImg" v-model="fileList" :limit="1" :type="1"></uploadImg>
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
import { getPage, addAtlas, deleteAtlas, editAtlas } from '@/api/biologyAtlas';
import uploadImg from './components/uploadImg';
import serverConfig from '@/config/server.config';
export default {
  name: 'BiologyAtlas',
  components: { uploadImg },
  mixins: [],
  data() {
    return {
      addVisible: false,
      imgVisible: false,
      visibleTitle: '新增生物相图谱',
      previewImgUrl: '',
      labelCol: { span: 4 },
      wrapperCol: { span: 18 },
      current: 1,
      pageSize: 20,
      total: 0,
      searchForm: {
        name: ''
      },
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          align: 'center',
          width: 80,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '微生物名称',
          dataIndex: 'name',
          align: 'center',
          width: 180,
          key: 'name'
        },
        {
          title: '图片信息',
          dataIndex: 'fileId',
          align: 'center',
          width: 200,
          key: 'fileId',
          scopedSlots: { customRender: 'img' }
        },
        {
          title: '形态特点',
          dataIndex: 'trait',
          width: 500,
          key: 'trait'
        },
        {
          title: '指示意义',
          dataIndex: 'indicate',
          width: 500,
          key: 'indicate'
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
      addForm: {
        fileId: '',
        indicate: '',
        name: '',
        trait: ''
      },
      fileList: [],
      rules: {
        name: [{ required: true, message: '请输入微生物名称', trigger: 'blur' }],
        trait: [{ required: true, message: '请输入形态特点', trigger: 'blur' }],
        indicate: [{ required: true, message: '请输入指示意义', trigger: 'blur' }]
      },
      previewBaseUrl: serverConfig.PUBLIC_API_BASE_URL + '/userCenterApi/FileManager/download/',
      atlasId: ''
    };
  },
  computed: {},
  activated() {},
  mounted() {
    this.searchClick();
  },
  methods: {
    searchClick() {
      this.current = 1;
      this.getPageData();
    },
    getPageData() {
      let params = {
        ...this.searchForm,
        page: {
          current: this.current,
          size: this.pageSize
        }
      };
      getPage(params).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.tableData = resultData.records;
          this.total = resultData.total;
        }
      });
    },
    onShowSizeChange(current, size) {
      this.current = 1;
      this.pageSize = size;
      this.getPageData();
    },
    currentChange(page, pageSize) {
      this.current = page;
      this.pageSize = pageSize;
      this.getPageData();
    },
    addAtlas() {
      this.addVisible = true;
      this.visibleTitle = '新增生物相图谱';
    },
    handleOk() {
      if (this.fileList.length < 1) {
        this.$message.warning('请先上传图片信息！');
        return;
      }
      this.$refs.ruleForm.validate(valid => {
        if (valid) {
          let params = {
            ...this.addForm,
            fileId: this.fileList[0].fileId
          };
          if (this.visibleTitle === '新增生物相图谱') {
            addAtlas(params).then(res => {
              if (res.status === 'complete') {
                this.$message.success('添加成功');
                this.addVisible = false;
                this.cancel();
                this.searchClick();
              }
            });
          } else {
            params.id = this.atlasId;
            editAtlas(params).then(res => {
              if (res.status === 'complete') {
                this.$message.success('编辑成功');
                this.addVisible = false;
                this.cancel();
                this.searchClick();
              }
            });
          }
        } else {
          console.log('error submit!!');
          return false;
        }
      });
    },
    cancel() {
      this.fileList = [];
      this.addForm = {
        fileId: '',
        indicate: '',
        name: '',
        trait: ''
      };
      this.$refs.ruleForm.resetFields();
    },
    handleImgSrc(fileId) {
      if (fileId) {
        console.log(this.previewBaseUrl + fileId);
        return this.previewBaseUrl + fileId;
      }
      return '';
    },
    handlePreview(src) {
      this.imgVisible = true;
      this.previewImgUrl = src;
    },
    delAtlas(row) {
      deleteAtlas(row.id).then(res => {
        if (res.status === 'complete') {
          this.$message.success('删除成功');
          this.searchClick();
        }
      });
    },
    editAtlas(row) {
      this.addForm = {
        fileId: '',
        indicate: row.indicate,
        name: row.name,
        trait: row.trait
      };
      this.atlasId = row.id;
      this.visibleTitle = '编辑生物相图谱';
      this.addVisible = true;
      this.fileList = [
        {
          fileId: row.fileId,
          status: 'done',
          fileUrl: this.handleImgSrc(row.fileId)
        }
      ];
      this.$nextTick(() => {
        this.$refs.uploadImg.show = false;
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

  .wpg-table {
    &-thead tr > th,
    &-tbody tr > td {
      padding-left: 20px;
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
  }

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
