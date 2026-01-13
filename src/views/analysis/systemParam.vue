<!--
 * @Description: 系统参数
 * @Author: limz
 * @Date: 2021-11-02 08:53:58
 * @LastEditTime: 2024-09-04 11:39:13
 * @LastEditors: wangyr
-->
<template>
  <div class="system-param supply-h-full">
    <w-row class="supply-h-full supply-flex supply-flex-col">
      <w-col :span="24" class="query-wrapper supply-bg-bg-card-DEFAULT">
        <w-form class="query-form">
          <w-col class="supply-float-left">
            <w-form-item label="分组名称">
              <w-input
                v-model="params.category"
                placeholder="请输入"
                :maxLength="50"
                allowClear
                @keyup.enter="refresh"
              >
              </w-input>
            </w-form-item>
          </w-col>
          <w-col class="supply-float-left">
            <w-form-item label="配置项">
              <w-input
                v-model="params.name"
                placeholder="请输入"
                :maxLength="50"
                allowClear
                @keyup.enter="refresh"
              >
              </w-input>
            </w-form-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-item>
              <w-button
                v-if="buttonCodes['ios_download']"
                type="primary"
                class="supply-mr-3"
                @click="downloadIos()"
              >
                IOS下载
              </w-button>
              <w-button type="primary" icon="plus" @click="addOrEdit('')">
                添加配置项
              </w-button>
              <w-button @click="resetForm" class="supply-mx-3" icon="reload">重置</w-button>
              <w-button type="primary" @click="refresh" icon="search">
                查询
              </w-button>
              <return-control :keep="true" :is-drill-down="true"></return-control>
            </w-form-item>
          </w-col>
        </w-form>
      </w-col>
      <w-col :span="24" class="con-wrapper supply-flex-1 supply-bg-bg-card-DEFAULT">
        <s-table
          v-if="columns.length"
          ref="table"
          :columns="columns"
          :rowKey="record => record.id"
          :data="loadData"
          :scroll="{ y: '384px' }"
        >
          <template slot="status" slot-scope="text, record">
            <w-switch size="small" :checked="text" @change="setStatus(record.id, !text)" />
          </template>
          <template slot="action" slot-scope="text, record">
            <a @click="addOrEdit(record)">编辑</a>
            <w-divider type="vertical" />
            <a @click="deleteItem(record.id)">删除</a>
          </template>
        </s-table>
      </w-col>
    </w-row>
    <IosPopup ref="ios_popup" />

    <!-- add / edit -->
    <w-modal
      v-if="visible"
      :title="editId ? '编辑配置项' : '添加配置项'"
      :visible="visible"
      okText="保存"
      class="add-param"
      width="600px"
      @cancel="visible = false"
      @ok="handleSubmit"
    >
      <w-form
        :form="form"
        labelAlign="right"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 19 }"
        class="query-form"
        @submit="handleSubmit"
      >
        <w-form-item v-for="item in formItems" :key="item.dataIndex" :label="item.title">
          <w-input
            v-decorator="[
              item.dataIndex,
              {
                rules: [{ required: true, message: '请输入' }],
                initialValue: formData[item.dataIndex]
              }
            ]"
            :disabled="item.dataIndex === 'code' && editId ? true : false"
            allowClear
            autocomplete="off"
            placeholder="请输入"
          />
        </w-form-item>
        <w-form-item label="备注">
          <w-input v-model="formData.remark" placeholder="请输入" />
        </w-form-item>
      </w-form>
    </w-modal>
  </div>
</template>

<script>
import store from '@/store';
import IosPopup from './models/IosPopup.vue';
import { mapState } from 'vuex';
import {
  GetSysParamPage, // 分页查询
  AddSysParam, // 创建配置项
  EditSysParam, // 编辑
  DeleteSysParam, // 删除
  ChangeStatus
} from '@/api/analysis';

const columns = [
  {
    title: '序号',
    width: 80,
    align: 'center',
    dataIndex: 'index',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '分组名称',
    dataIndex: 'category',
    ellipsis: true
  },
  {
    title: '配置项',
    dataIndex: 'name',
    ellipsis: true
  },
  {
    title: '配置项标识',
    dataIndex: 'code',
    ellipsis: true
  },
  {
    title: '配置项值',
    dataIndex: 'value',
    ellipsis: true
  },
  // {
  //   title: '是否全局',
  //   dataIndex: 'global',
  //   ellipsis: true,
  //   width: 100,
  //   customRender: text => {
  //     return text ? '是' : '否';
  //   }
  // },
  {
    title: '是否有效',
    dataIndex: 'status',
    ellipsis: true,
    scopedSlots: { customRender: 'status' }
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true
  },
  {
    title: '操作',
    width: 120,
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' }
  }
];

export default {
  name: 'SystemParam',
  components: {
    IosPopup
  },
  data() {
    return {
      form: this.$form.createForm(this),
      columns,
      params: {
        name: '',
        category: ''
      },
      visible: false,
      formData: {
        category: '',
        name: '',
        code: '',
        value: '',
        remark: ''
      },
      editId: '',
      formItems: columns.slice(1, 5)
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  methods: {
    /** 分页查询 */
    async loadData(parameter) {
      let params = {
        page: {
          current: parameter.pageNo,
          size: parameter.pageSize
        },
        ...this.params
      };
      return await GetSysParamPage(params).then(res => {
        return {
          total: res.resultData.total,
          records: res.resultData.records,
          current: res.resultData.current
        };
      });
    },
    downloadIos() {
      this.$refs.ios_popup.setShowIosPopup(true);
    },
    /** 查询 */
    refresh(bool = true) {
      if (this.$refs.table) this.$refs.table.refresh(bool);
    },

    /** 重置 */
    resetForm() {
      this.params = {
        name: '',
        category: ''
      };
      this.refresh();
    },

    /** 提交保存 */
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$confirm({
            title: '提示',
            content: '确定要提交吗？',
            onOk: async () => {
              console.log('values: ', values);
              let params = {
                id: this.editId || '',
                ...values,
                remark: this.formData.remark
              };
              let res = params.id ? await EditSysParam(params) : await AddSysParam(params);
              if (res.status === 'complete') {
                if (params.code === 'map_strategy') {
                  store.dispatch('configure/setMapStrategy', params.value);
                }
                if (params.code === 'mapBg') {
                  store.dispatch('configure/setMapBg', params.value === '1' ? true : false);
                }
                this.$message.success(params.id ? '修改成功' : '添加成功');
                this.visible = false;
                this.refresh();
              }
            }
          });
        }
      });
    },

    /** 新增/编辑 */
    addOrEdit(record) {
      if (record) {
        let { id, category, name, code, value, remark } = record;
        this.editId = id;
        this.formData = {
          category,
          name,
          code,
          value,
          remark
        };
      } else {
        this.editId = '';
        this.formData = {
          category: '',
          name: '',
          code: '',
          value: '',
          remark: ''
        };
      }
      this.visible = true;
    },

    /** 删除 */
    deleteItem(id) {
      this.$confirm({
        title: '提示',
        content: '确定要删除吗?',
        onOk: async () => {
          let res = await DeleteSysParam(id);
          if (res.status === 'complete') this.$message.success('删除成功！');
          this.refresh();
        }
      });
    },

    /** 设置是否有效 */
    setStatus(id, status) {
      this.$confirm({
        title: '提示',
        content: '确定要修改吗?',
        onOk: async () => {
          let res = await ChangeStatus(`?id=${id}&status=${status}`);
          if (res.status === 'complete') this.$message.success('修改成功！');
          this.refresh();
        }
      });
    }
  }
};
</script>

<style scoped lang="less">
@import '@/styles/switch.less';
.system-param {
  /deep/ .wpg-table-title {
    display: none;
  }
  .query-wrapper {
    padding: 8px 12px;
    border-radius: 4px;
    .query-form .wpg-form-item {
      display: flex;
      margin: 0;
      padding: 0 12px;
    }
    .supply-text-right .wpg-form-item {
      display: inline-block;
    }
  }
  .con-wrapper {
    border-radius: 4px;
    margin-top: 12px;
  }
}
.add-param {
  .query-form {
    .wpg-input-number {
      width: 100%;
    }
  }
}
</style>
