<!--
 * @Description: 巡检配置
 * @Author: limz
 * @Date: 2021-09-02 10:28:19
 * @LastEditTime: 2024-12-24 17:04:25
 * @LastEditors: yuan wenyu
-->
<template>
  <div class="inspect-config supply-flex supply-flex-col">
    <div class="search-box supply-bg-bg-card-DEFAULT">
      <w-row>
        <w-form-model
          ref="formSearch"
          layout="inline"
          :model="formSearch"
          class="supply-clear-both"
          @submit="query"
          @submit.native.prevent
        >
          <w-col class="search-item">
            <w-form-model-item label="模糊查找" prop="keyWord">
              <w-input
                v-model.trim="formSearch.keyWord"
                placeholder="步骤名称"
                :maxLength="50"
                allowClear
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-model-item>
              <w-button
                v-if="buttonCodes['inspectConfig-export']"
                style="margin-right:12px"
                @click="exportFile"
              >
                Excel导出
              </w-button>
              <w-button class="supply-mr-3" type="primary" @click="editGroup('new')">新增</w-button>
              <w-button @click="reset" icon="reload">
                重置
              </w-button>
              <w-button class="supply-mx-3" type="primary" html-type="submit" icon="search">
                查询
              </w-button>
              <return-control path="/business" :keep="true" :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
    </div>
    <div class="inspect-config-body supply-flex-1 supply-bg-bg-card-DEFAULT">
      <w-config-provider>
        <template v-if="data.length <= 0" #renderEmpty>
          <w-empty></w-empty>
        </template>
        <PaginationTable
          rowKey="id"
          :columns="tableColumns"
          class="supply-h-full"
          :data-source="data"
          :loading="loading"
          :current.sync="formSearch.page.current"
          :total.sync="total"
          :pageSize.sync="formSearch.page.size"
          @change="changeListP"
          :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
        >
          <template slot="delFlag" slot-scope="text, record">
            <w-switch :checked="text === 0" size="small" @change="handleChange(record)" />
          </template>
          <template slot="action" slot-scope="text, record, index">
            <a style="margin-right:8px" @click="addInspect(record.id, record.configType)">巡检项</a>
            <a style="margin-right:8px" @click="editGroup('edit', record)">编辑</a>
            <a @click="deleteGroup(record.id, index)">删除</a>
          </template>
        </PaginationTable>
      </w-config-provider>
    </div>

    <editInspStep
      ref="editInspStep"
      :deviceList="deviceList"
      :formData="formData"
      :type="editType"
      :isCopy="isCopy"
      @change="query"
    />
    <InspDetails ref="inspDetails" :devList="devList" :editInfo="editInfo" @change="query" />
  </div>
</template>

<script>
import {
  sysDictListByCode, // 数据字典
  InspConfigList,
  SaveInspConfig,
  InspDelConfig,
  configExcel
} from '@/api/manage';
import { queryList } from '@/api/deviceManagement';
import { exportFile } from '@/utils/util';
import { mapState } from 'vuex';
import PaginationTable from '@/components/PaginationTable/index.vue';

export default {
  name: 'InspectConfig',
  components: {
    EditInspStep: () => import('./models/EditInspStep.vue'),
    InspDetails: () => import('./models/InspDetails.vue'),
    PaginationTable
  },
  data() {
    return {
      formSearch: {
        keyWord: '',
        page: {
          current: 1,
          size: 20
        }
      },
      total: 0,
      pages: 0,
      data: [],
      loading: false,
      editType: '',
      devList: [],
      formData: {},
      editInfo: {},
      isCopy: false,
      deletingRow: -1,
      deviceList: [],
      deviceObj: {}
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),

    /**
     * 表格列配置
     */
    tableColumns() {
      return [
        {
          title: '序号',
          dataIndex: 'index',
          align: 'center',
          width: 60,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '分组名称',
          dataIndex: 'groupName',
          ellipsis: true
        },
        {
          title: '分组编号',
          dataIndex: 'groupCode',
          ellipsis: true
        },
        {
          title: '步骤编号',
          dataIndex: 'stepCode',
          ellipsis: true
        },
        {
          title: '步骤名称',
          dataIndex: 'stepName',
          ellipsis: true
        },
        {
          title: '是否启用',
          dataIndex: 'delFlag',
          ellipsis: true,
          scopedSlots: { customRender: 'delFlag' }
        },
        {
          title: '排序',
          dataIndex: 'sort'
        },
        {
          title: '更新时间',
          dataIndex: 'updateTime',
          ellipsis: true
        },
        {
          title: '操作',
          dataIndex: 'action',
          width: 200,
          ellipsis: true,
          scopedSlots: { customRender: 'action' }
        }
      ];
    },

    /**
     * 获取字符串值
     */
    getStr() {
      return (list, val) => {
        const data = list.find(t => String(t.value) === String(val));
        return data?.label || '';
      };
    }
  },
  created() {
    this.getListByCode();
  },
  mounted() {
    this.query();
    this.handleDeviceSearch();
  },
  methods: {
    /**
     * 导出文件
     */
    exportFile() {
      const params = { ...this.formSearch };
      configExcel(params).then(res => {
        exportFile(res, '巡检配置');
      });
    },

    /**
     * 查询数据
     */
    async query() {
      try {
        this.loading = true;
        const res = await InspConfigList(this.formSearch);

        if (res.status === 'complete') {
          const { total, pages, records } = res.resultData;
          this.data = records || [];
          this.total = total || 0;
          this.pages = pages || 0;
        }
      } catch (error) {
        console.error('查询失败:', error);
      } finally {
        this.loading = false;
      }
    },

    /**
     * 设备搜索
     */
    async handleDeviceSearch() {
      try {
        const { resultData, status } = await queryList({});

        if (status === 'complete') {
          this.deviceList = resultData.records || [];
          this.deviceObj = (resultData.records || []).reduce((acc, item) => {
            if (item.id && item.deviceName) {
              acc[item.id] = item.deviceName;
            }
            return acc;
          }, {});
        }
      } catch (error) {
        console.error('设备搜索失败:', error);
      }
    },

    /**
     * 重置搜索
     */
    reset() {
      this.formSearch = {
        keyWord: '',
        page: {
          current: 1,
          size: 20
        }
      };
      this.query();
    },

    /**
     * 分页变化
     */
    changeListP(page, size) {
      this.formSearch.page.current = page;
      this.query();
    },

    /**
     * 数据字典查询数据
     */
    async getListByCode() {
      try {
        const ret = await sysDictListByCode('pumpAndMachineryChild');
        if (ret.status === 'complete') {
          this.devList = this.dealData(ret.resultData);
        }
      } catch (error) {
        console.error('获取数据字典失败:', error);
      }
    },

    /**
     * 处理数据
     */
    dealData(data) {
      return (data || []).map(r => ({
        value: r.value,
        label: r.name
      }));
    },

    /**
     * 编辑 / 新增
     */
    editGroup(type, data) {
      this.editType = type;
      this.isCopy = false;
      this.$refs.editInspStep.visible = true;
      this.formData = type === 'edit' ? JSON.parse(JSON.stringify(data)) : {};
    },

    /**
     * 复制
     */
    copyGroup(type, data) {
      if (data !== undefined && data !== null) {
        this.editType = type;
        this.isCopy = true;
        const editData = JSON.parse(JSON.stringify(data));
        editData.locationName = undefined;
        editData.locationCode = undefined;
        this.$refs.editInspStep.visible = true;
        this.formData = editData;
      }
    },

    /**
     * 删除
     */
    async deleteGroup(id, index) {
      this.deletingRow = index;

      try {
        await this.$confirm({
          title: '提示',
          content: '确定要删除吗？',
          type: 'warning',
          okText: '确定',
          cancelText: '取消',
          onOk: async () => {
            const res = await InspDelConfig(id);
            if (res.status === 'complete') {
              this.$message.success('删除成功');
              this.query();
            }
          },
          onCancel: () => {}
        });
      } catch (error) {
        console.error('删除失败:', error);
      } finally {
        this.deletingRow = -1;
      }
    },

    /**
     * 切换启停
     */
    async handleChange(record) {
      const { stepCode, stepName, deviceId, delFlag, id } = record;

      try {
        await this.$confirm({
          title: '提示',
          content: `确定要${delFlag === 0 ? '关闭' : '启用'}吗？`,
          onOk: async () => {
            const params = {
              stepCode,
              stepName,
              deviceId,
              delFlag: delFlag ? 0 : 1,
              id
            };
            const res = await SaveInspConfig(params);
            if (res.status === 'complete') {
              this.$message.success(`${delFlag === 0 ? '关闭' : '启用'}成功`);
              this.query();
            } else {
              this.$message.error(`${delFlag === 0 ? '关闭' : '启用'}失败`);
            }
          },
          onCancel: () => {}
        });
      } catch (error) {
        console.error('操作失败:', error);
      }
    },

    /**
     * 添加巡检项
     */
    addInspect(_id, _type) {
      this.editInfo = { id: _id, type: _type };
      this.$refs.inspDetails.visible = true;
    }
  }
};
</script>

<style scoped lang="less">
.inspect-config {
  height: 100%;
  padding: 0px 12px 12px;

  .search-box {
    padding: 10px 20px;
    border-radius: 4px;
    margin-bottom: 12px;

    .search-item {
      float: left;

      .ant-input {
        width: 270px;
      }
    }
  }

  &-body {
    border-radius: 4px;
    overflow: hidden;
    height: calc(100% - 74px);

    .pagination-con {
      text-align: right;
      padding: 24px 20px;
    }
  }
}

/deep/ .ant-modal {
  &-header {
    background-color: #f6f6f6 !important;
    padding: 12px 24px;

    .ant-modal-title {
      font-size: 16px;
    }
  }

  &-body {
    padding: 12px;
  }

  &-footer {
    padding: 10px 12px 15px;
  }
}
</style>
