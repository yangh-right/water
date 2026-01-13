<template>
  <div class="notice-list supply-flex supply-flex-col">
    <div class="tabs supply-bg-bg-card-DEFAULT">
      <w-tabs v-model="current" @change="changeTab">
        <w-tab-pane v-for="(tab, i) in tabs" :key="i" :tab="tab"></w-tab-pane>
      </w-tabs>
    </div>
    <w-row :span="24" class="notice-header supply-bg-bg-card-DEFAULT">
      <w-form-model
        ref="formSearch"
        class="query-form"
        layout="inline"
        :model="params"
        @submit="getNoticeList"
        @submit.native.prevent
      >
        <w-col :span="5">
          <w-form-model-item label="类型" prop="noticeType">
            <w-select v-model="params.noticeType" placeholder="请选择">
              <w-select-option value>全部</w-select-option>
              <w-select-option
                v-for="item in typeList"
                :key="item.dictCode"
                :value="item.dictCode"
                >{{ item.dictName }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col :span="8">
          <w-form-model-item label="日期" prop="date">
            <w-range-picker
              v-model="params.date"
              :allowClear="false"
              :disabledDate="disabledDate"
              :format="'YYYY-MM-DD'"
            />
          </w-form-model-item>
        </w-col>
        <w-col :span="5">
          <w-form-model-item label="模糊查询" prop="keyWord">
            <w-input v-model="params.keyWord" placeholder="请输入标题" :maxLength="50" allowClear />
          </w-form-model-item>
        </w-col>
        <w-col :span="6" class="supply-text-right">
          <w-button
            v-permission:menu="'noticeCreat'"
            v-if="user.userType !== '0'"
            type="primary"
            icon="plus"
            @click="createOrEditNotice('创建', '')"
            >创建</w-button
          >
          <w-button class="supply-mx-3" @click="reset" icon="reload">重置</w-button>
          <w-button type="primary" html-type="submit" icon="search">查询</w-button>
          <!-- <return-control path="/business" :keep="true" :is-drill-down="true"></return-control> -->
        </w-col>
      </w-form-model>
    </w-row>
    <w-config-provider>
      <template v-if="data.length <= 0" #renderEmpty>
        <w-empty></w-empty>
      </template>
      <div
        class="notice-body supply-flex-1 supply-overflow-hidden supply-bg-bg-card-DEFAULT supply-flex supply-flex-col"
      >
        <div v-if="user.userType !== '0'">
          <div v-show="current === 2 && data.length > 0" class="table-tool">
            已选择<span>{{ selectedRowKeys.length }}</span
            >项
            <span @click="deleteNotice('')">批量删除</span>
          </div>
        </div>
        <PaginationTable
          class="supply-flex-1 supply-overflow-hidden"
          :columns="columns[`notice${current}`]"
          :data-source="data"
          :rowKey="record => record.id"
          :row-selection="
            current === 2 ? { selectedRowKeys: selectedRowKeys, onChange: onSelectChange } : null
          "
          :scroll="{ y: 'calc(100vh - 318px)', x: 1080 }"
          :current.sync="params.page.current"
          :total.sync="total"
          :pageSize.sync="params.page.size"
          :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
        >
          <template slot="cusTitle" slot-scope="text, record">
            <span v-show="current === 0" :class="'read-statu' + record.readFlag">{{
              record.readFlag === 1 ? '已读' : '未读'
            }}</span>
            <span>{{ record.title }}</span>
          </template>
          <template slot="action" slot-scope="text, record, index">
            <a
              v-permission:menu="'checkNotice'"
              v-show="current !== 2"
              class="table-a"
              @click="createOrEditNotice('查看', record.id)"
              >查看</a
            >
            <a v-show="current === 1" class="table-a" @click="withdraw(record.id)">撤回</a>
            <a v-show="current === 2" class="table-a" @click="createOrEditNotice('编辑', record.id)"
              >编辑</a
            >
            <a v-show="current === 2" class="table-a" @click="deleteNotice(record.id, index)"
              >删除</a
            >
          </template>
        </PaginationTable>
      </div>
    </w-config-provider>
  </div>
</template>

<script>
import columns from './columns';
import { sysDictListByCode } from '@/api/manage';
import { updateReadInfo } from '@/api/baseInfo';
import { mapGetters, mapState } from 'vuex';
import { selectNoticeInfoPage, withdrawNotice, deleteNotice } from '@/api/notice';
import PaginationTable from '@/components/PaginationTable/index.vue';

export default {
  name: '',
  components: {
    PaginationTable
  },
  data() {
    return {
      typeList: [],
      typeName: null,
      total: 0,
      columns,
      data: [],
      params: {
        noticeType: '',
        date: [this.$moment().subtract(30, 'days'), this.$moment()],
        keyWord: '',
        page: {
          current: 1,
          size: 20
        }
      },
      tabs: ['我的通知', '我的发布', '草稿箱'],
      current: 0,
      visible: false,
      depList: [],
      rules: {
        orgId: [{ required: true, message: '请选择组织' }],
        userName: [{ required: true, message: '请输入用户名' }],
        phoneNum: [
          { required: true, message: '请输入手机号码' },
          { pattern: /^1[0-9]{10}$/, message: '请输入正确手机号码' }
        ]
      },
      selectedRowKeys: [],
      deletingRow: -1
    };
  },
  computed: {
    ...mapGetters('account', ['user']),
    ...mapState('setting', ['buttonCodes'])
  },
  activated() {
    if (this.$route.query && this.$route.query.rowType) {
      this.current = Number(this.$route.query.rowType);
    }
    let rowType = sessionStorage.getItem('noticeListRowType');
    if (rowType) {
      this.current = Number(rowType);
      sessionStorage.removeItem('noticeListRowType');
    }
    this.getNoticeTypeList();
    this.getNoticeList();
  },
  methods: {
    /**
     * 获取 notice 类型
     */
    async getNoticeTypeList() {
      const { resultData } = await sysDictListByCode('notice_type');
      this.typeList = resultData;
      let obj = {};
      resultData.map(item => {
        obj[item.dictValue] = item.dictName;
      });
      this.typeName = obj;
    },
    async getNoticeList() {
      let start = this.params.date[0] ? this.params.date[0].format('YYYY-MM-DD') + ' 00:00:00' : '';
      let end = this.params.date[1] ? this.params.date[1].format('YYYY-MM-DD') + ' 23:59:59' : '';
      const params = {
        ...this.params,
        endDateStr: end,
        rowType: this.current,
        startDateStr: start
      };
      const { records, total } = await selectNoticeInfoPage(params);
      this.data = records;
      this.total = total;
      this.data.map(item => {
        item.noticeType = this.typeName[item.noticeType];
        return item;
      });
    },
    /* 禁止选择日期 */
    disabledDate(current) {
      return current && current > this.$moment().endOf('day');
    },
    // 分页改变
    change(page, pageSize) {
      this.getNoticeList();
    },
    // 分页条数改变
    onShowSizeChange(current, size) {
      this.getNoticeList();
    },
    // 重置
    reset() {
      this.$refs.formSearch.resetFields();
      this.getNoticeList();
    },
    changeTab(i) {
      this.current = i;
      this.total = 0;
      this.params.pageNum = 1;
      this.getNoticeList();
    },
    createOrEditNotice(flag, id = '') {
      if (flag === '查看') {
        updateReadInfo([id]);
        this.drillDown({
          path: '/baseInfo/checkNotice',
          query: {
            id,
            rowType: this.current
          }
        });
      } else {
        this.drillDown({
          path: '/baseInfo/creatNoticeList',
          query: {
            id,
            flag,
            rowType: this.current
          }
        });
      }
    },
    withdraw(id) {
      this.$confirm({
        title: '提示',
        content: '确定要撤回该通告吗？',
        onOk: async () => {
          await withdrawNotice([id]);
          this.$message.success('撤回成功！');
          this.params.pageNum = 1;
          this.getNoticeList();
        }
      });
    },
    deleteNotice(id, index) {
      let params = [];
      if (id) {
        // 单个删除
        this.deletingRow = index;
        this.$confirm({
          title: '提示',
          content: '确定要删除吗？',
          onOk: async () => {
            params = [id];
            deleteNotice(params).then(res => {
              this.$message.success('删除成功！');
              this.selectedRowKeys = [];
              this.params.pageNum = 1;
              this.deletingRow = -1;
              this.getNoticeList();
            });
          },
          onCancel: () => {
            this.deletingRow = -1;
          }
        });
      } else if (this.selectedRowKeys.length > 0) {
        // 批量删除
        params = this.selectedRowKeys;
        this.$confirm({
          title: '提示',
          content: '确定要删除吗？',
          onOk: async () => {
            await deleteNotice(params);
            this.$message.success('删除成功！');
            this.selectedRowKeys = [];
            this.params.pageNum = 1;
            this.getNoticeList();
          }
        });
      } else {
        this.$message.error('请选择您要删除的通知');
        return;
      }
    },
    onSelectChange(selectedRowKeys) {
      this.selectedRowKeys = selectedRowKeys;
    }
  }
};
</script>

<style lang="less" scoped>
.notice-list {
  width: 100%;
  height: 100%;
  .notice-header {
    margin-top: 10px;
    border-radius: 4px;
    padding: 14px 12px 12px;
    .btn-item-creat {
      float: right;
    }
  }
  .notice-body {
    // height: calc(100% - 58px);
    padding: 0 12px;
    margin-bottom: 10px;
    .read-statu0,
    .read-statu1 {
      width: 40px;
      display: inline-block;
      border-radius: 2px;
      font-family: PingFangSC-Regular, sans-serif;
      font-size: 12px;
      text-align: center;
      margin-right: 8px;
    }
    .read-statu0 {
      background: #feedef;
      color: #f64357;
    }
    .read-statu1 {
      background: #ebebeb;
      color: #999999;
    }
    .table-tool {
      height: 36px;
      line-height: 36px;
      padding-left: 19px;
      font-size: 12px;
      color: #666666;
      span {
        color: #4285f4;
        &:nth-child(2) {
          margin-left: 14px;
          cursor: pointer;
        }
      }
    }
    .tabs-con {
      font-size: 14px;
      display: flex;
      margin-bottom: 12px;
      span {
        color: #999999;
        padding: 14px 0;
        text-align: center;
        width: 140px;
        cursor: pointer;
      }
      .active {
        color: #4285f4;
        border-bottom: 2px solid #4285f4;
      }
    }
    .table-a {
      margin-right: 16px;
    }
    /deep/.pagination-wrapper {
      margin: 12px 0px;
    }
  }
}
</style>
<style lang="less">
.notice-header {
  .query-form {
    .region-or-org-select {
      min-width: 490px;
    }
    .wpg-form-item {
      display: flex;
    }
    .wpg-form-item-label {
      text-align: right;
      margin-right: 8px;
    }
    .wpg-form-item-control-wrapper {
      flex: 1;
    }
    .wpg-btn {
      margin-top: 3px;
    }
  }
}
</style>
