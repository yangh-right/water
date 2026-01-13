<template>
  <div class="check-notice">
    <div class="header supply-bg-bg-card-DEFAULT  query-form">
      <div><i class="header-tip"></i>查看内容</div>
      <div>
        <w-button @click="cancel">返回</w-button>
      </div>
    </div>
    <w-row :span="24" class="body supply-bg-bg-card-DEFAULT">
      <w-col :span="24" class="title-info supply-color-main">
        标题名称：{{ detail ? detail.title : '' }}
      </w-col>
      <w-col :span="8"
        ><span class="label">创建人：</span>{{ detail ? detail.createBy : '' }}</w-col
      >
      <w-col :span="8"
        ><span class="label">发布时间：</span>{{ detail ? detail.publishDate : '' }}</w-col
      >
      <w-col :span="8"><span class="label">类型：</span>{{ detail ? detail.userType : '' }}</w-col>
      <w-col :span="24">
        <span class="label">附件：</span>
        <span v-if="detail && detail.infos && detail.infos.length === 1" class="file-list">
          <span>{{ detail.infos[0].name }}</span>
            <!-- download设置下载文件名字失效-->
            <!--<a :download="detail.infos[0].name" :href="downLoadUrl + '/' + detail.infos[0].url">下载</a>-->
            <a @click="downLoadFile(detail.infos[0])">下载</a>
        </span>
        <span v-else-if="detail && detail.infos.length !== 0" class="file-list">
          <span>共{{ detail.infos.length }}个附件</span>
          <a @click="visible = true">查看全部</a>
        </span>
        <span v-else>暂无附件</span>
      </w-col>
      <w-col :span="24" class="content"
        ><span class="label">文本内容：</span>
        <div v-if="detail" class="table-page-preview-content" v-html="detail.content"></div>
      </w-col>
    </w-row>
    <w-modal class="secondary-modal" v-model="visible" :title="title" width="700px">
      <template slot="footer">
        <w-button type="primary" @click="downLoad(0)">
          批量下载
        </w-button>
      </template>
      <w-table
        rowKey="id"
        :row-selection="{ selectedRowKeys: selectedRowKeys, onChange: onSelectChange }"
        :columns="columns"
        :data-source="data"
        :pagination="false"
        :scroll="{ y: 200 }"
      >
        <template slot="name" slot-scope="text, record">
          <div class="file-name">
            <img
              v-if="record.type && record.type.includes('excel')"
              class="pre-icon"
              src="../../../assets/images/default/icons/ic_file_excel@2x.png"
              alt=""
            />
            <img
              v-else-if="record.type && record.type.includes('pdf')"
              class="pre-icon"
              src="../../../assets/images/default/icons/ic_file_pdf@2x.png"
              alt=""
            />
            <img
              v-else-if="record.type && record.type.includes('image')"
              class="pre-icon"
              src="../../../assets/images/default/icons/ic_file_pic@2x.png"
              alt=""
            />
            <img
              v-else-if="record.name && record.name.includes('doc')"
              class="pre-icon"
              src="../../../assets/images/default/icons/ic_file_word@2x.png"
              alt=""
            />
            <img
              v-else
              class="pre-icon"
              src="../../../assets/images/default/icons/ic_file_other@2x.png"
              alt=""
            />
            <span>{{ record.name }}</span>
          </div>
        </template>
        <template slot="action" slot-scope="text, record">
          <!--<a :download="record.fileName" :href="downLoadUrl + '/' + record.fileUrl">下载</a>-->
          <a @click="downLoadFile(record)">下载</a>
        </template>
      </w-table>
    </w-modal>
  </div>
</template>

<script>
import serverConfig from '@/config/server.config';
import { sysDictListByCode } from '@/api/manage';
import { selectNoticeInfoDetail } from '@/api/notice';
export default {
  name: 'CheckNotice',
  data() {
    return {
      visible: false,
      typeList: [],
      detail: null,
      downLoadUrl: `${serverConfig.IMG_BASE_URL}`,
      title: '查看附件',
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '文件名',
          dataIndex: 'name',
          scopedSlots: { customRender: 'name' },
          width: 350
        },
        {
          title: '操作',
          dataIndex: 'action',
          scopedSlots: { customRender: 'action' }
        }
      ],
      data: [],
      selectedRowKeys: []
    };
  },
  activated() {
    let { id, rowType } = this.$route.query;
    if (id) this.getNoticeDetail(id, rowType);
  },
  methods: {
    async getNoticeDetail(id, rowType) {
      let result = await selectNoticeInfoDetail({ id, rowType });
      this.detail = result;
      this.data = result.infos;
      const { resultData } = await sysDictListByCode('notice_type');
      this.typeList = resultData;
      this.typeList.map(item => {
        if (item.value === this.detail.noticeType) {
          this.detail.userType = item.name;
        }
      });
    },
    cancel() {
      this.goto('/baseInfo/noticeList');
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    },
    downLoad(type) {
      if (type === 0) {
        if (this.selectedRowKeys.length <= 0) {
          this.$message.error('请选择下载附件');
          return;
        }
        this.detail.infos.map(item => {
          this.selectedRowKeys.map(id => {
            if (item.id === id) {
              this.downLoadFile(item);
            }
          });
        });
        // 批量下载
      } else {
        // 全部下载
        this.detail.infos.map(item => {
          this.downLoadFile(item);
        });
      }
    },
    downLoadFile(item) {
      const x = new XMLHttpRequest()
      x.open("GET", this.downLoadUrl + '/' + item.url, true)
      x.responseType = 'blob'
      x.onload=function(e) {
        const url = window.URL.createObjectURL(x.response)
        const a = document.createElement('a')
        a.href = url
        a.target = '_blank'
        a.download = item.name
        a.click()
        a.remove()
      }
      x.send()
    },
  }
};
</script>

<style lang="less" scoped>
.check-notice {
  height: 100%;
  .header {
    height: 60px;
    border-radius: 4px;
    margin-bottom: 12px;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 20px;
    font-size: 16px;
    color: #6281a3;
    .header-tip {
      width: 5px;
      height: 16px;
      display: inline-block;
      vertical-align: middle;
      margin-right: 8px;
      background: #87ce40;
    }
  }
  .body {
    height: calc(100% - 72px);
    border-radius: 4px;
    padding: 20px 60px;
    .wpg-col {
      margin-bottom: 16px;
      font-size: 14px;
      display: flex;
      align-items: flex-start;
      color: var(--supply-color-third);
    }
    .label {
      display: inline-block;
      width: 75px;
      text-align: right;
      color: var(--supply-color-secondary);
    }
    .title-info {
      font-weight: 400;
    }
    .file-list {
      .pre-icon {
        margin-right: 10px;
      }
      span {
        margin-right: 64px;
      }
    }
    .content {
      height: calc(100% - 120px);
    }
    .table-page-preview-content {
      border: 1px solid #d6d6d6;
      border-radius: 4px;
      padding: 10px;
      width: calc(100% - 80px);
      height: 100%;
    }
  }
}
.file-name {
  display: flex;
  align-items: center;
  .pre-icon {
    width: 14px;
    margin-right: 10px;
  }
}
</style>
