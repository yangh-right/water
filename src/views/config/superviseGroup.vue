<!--
 * @Description: 监测量分组
 * @Author: limz
 * @Date: 2021-06-11 10:58:24
 * @LastEditTime: 2024-06-25 16:42:46
 * @LastEditors:  Do not edit
-->
<template>
  <div class="supervise-group supply-flex supply-flex-col ">
    <div class="search-box supply-flex-none supply-bg-bg-card-DEFAULT">
      <w-row>
        <w-form-model
          ref="formSearch"
          layout="inline"
          :model="formSearch"
          class="supply-clear-both"
          @submit="query(1)"
          @submit.native.prevent
        >
          <w-col class="search-item">
            <w-form-model-item label="用户端" prop="type">
              <w-select v-model="formSearch.type" style="width: 120px">
                <w-select-option value="">
                  全部
                </w-select-option>
                <w-select-option v-for="type in typeList" :key="type.value" :value="type.value">
                  {{ type.name }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col class="search-item">
            <w-form-model-item label="页面名称" prop="type">
              <w-select v-model="formSearch.nameCode" style="width: 160px">
                <w-select-option value="">
                  全部
                </w-select-option>
                <w-select-option v-for="page in pageList" :key="page.value" :value="page.value">
                  {{ page.name }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col class="search-item">
            <w-form-model-item label="模糊查找" prop="keyWord">
              <w-input
                v-model.trim="formSearch.keyWord"
                placeholder="页面标识/分组标识"
                :maxLength="50"
                allowClear
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-left">
            <w-form-model-item>
              
            </w-form-model-item>
          </w-col>
          <w-col v-if="buttonCodes['configSuperviseGroup_add']" class="supply-float-right">
            <w-form-model-item>
              <w-button type="primary" icon="plus" @click="editGroup('new')"
                >新增</w-button>
              <w-button @click="reset" icon="reload" class="supply-mx-3"
                >重置</w-button>
              <w-button type="primary" html-type="submit" icon="search"
                >查询</w-button
              >
              <return-control :keep="true" :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
    </div>

    <PaginationTable
      :scroll="{ x: 1400 }"
      class="supply-flex-1 supply-overflow-hidden supply-bg-bg-card-DEFAULT"
      rowKey="id"
      :columns="columns"
      :data-source="data"
      :loading="loading"
      :current.sync="formSearch.page.current"
      :total.sync="total"
      :pageSize.sync="formSearch.page.size"
      @change="changeListP"
      :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
    >
      <template slot="type" slot-scope="text">
        {{ getNameByCode(configList, text) }}
      </template>
      <template slot="action" slot-scope="text, record, index">
        <a
          v-if="buttonCodes['configSuperviseGroup_link']"
          href="javascript:;"
          style="margin-right: 10px"
          @click="addRelevance(record.id)"
          >关联监测量</a
        >
        <a
          v-if="buttonCodes['configSuperviseGroup_edit']"
          href="javascript:;"
          style="margin-right: 10px"
          @click="editGroup(record)"
          >编辑</a
        >
        <a
          v-if="buttonCodes['configSuperviseGroup_delete']"
          href="javascript:;"
          @click="deleteGroup(record.id, index)"
          >删除</a
        >
      </template>
    </PaginationTable>

    <!-- add / edit -->
    <w-modal
      v-if="visible"
      :title="title"
      :visible="visible"
      okText="保存"
      class="add-group secondary-modal"
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
        <w-form-item label="用户端">
          <w-select
            v-decorator="[
              'platform',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.platform
              }
            ]"
            placeholder="请选择"
          >
            <w-select-option v-for="type in typeList" :key="type.value" :value="type.value">
              {{ type.name }}
            </w-select-option>
          </w-select>
        </w-form-item>
        <w-form-item label="页面名称">
          <w-select
            v-decorator="[
              'page',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.page
              }
            ]"
            placeholder="请选择"
          >
            <w-select-option v-for="page in pageList" :key="page.value" :value="page.value">
              {{ page.name }}
            </w-select-option>
          </w-select>
        </w-form-item>
        <w-form-item label="分组名称">
          <w-select
            v-decorator="[
              'pointGroupCode',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.pointGroupCode
              }
            ]"
            placeholder="请选择"
          >
            <w-select-option
              v-for="group in groupList"
              :key="group.dictValue"
              :value="group.dictValue"
            >
              {{ group.dictName }}
            </w-select-option>
          </w-select>
        </w-form-item>
        <w-form-item label="分组排序">
          <w-input-number
            v-decorator="[
              'sort',
              {
                rules: [{ required: true, message: '请输入' }],
                initialValue: formData.sort
              }
            ]"
            placeholder="请输入"
            :min="0"
          />
        </w-form-item>
        <w-form-item label="分组类型">
          <!-- <w-select
            v-decorator="[
              'type',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.type
              }
            ]"
            placeholder="请选择"
          >
            <w-select-option v-for="group in configList" :key="group.value" :value="group.value">
              {{ group.name }}
            </w-select-option>
          </w-select> -->
          <w-radio-group
            v-decorator="[
              'type',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.type
              }
            ]"
          >
            <w-radio v-for="group in configList" :key="group.value" :value="group.value">
              {{ group.name }}
            </w-radio>
          </w-radio-group>
        </w-form-item>
      </w-form>
    </w-modal>

    <!-- 关联监测量 -->
    <relevance-info
      ref="infoModal"
      :item="{
        isShowSearch: true,
        isCheckAll: true,
        tabs: ['标准监测量', '非标监测量'],
        id: groupId,
        title: '关联监测量',
        draggable: true,
        columns: [
          {
            title: '监测量',
            width: 60,
            dataIndex: 'pointName',
            ellipsis: true
          },
          {
            title: '监测量名称',
            dataIndex: 'pointMemo',
            ellipsis: true
          }
        ]
      }"
      @change="numChange"
    ></relevance-info>
  </div>
</template>

<script>
import { mapState } from 'vuex';
import {
  initPointGroup, // 初始化
  listPointGroup, // 分页查询
  selectDictEnumByCode,
  sysDictListByCode,
  addPointGroup, // 新增分组
  deletePointGroup, // 删除分组
  editPointGroup // 编辑分组
} from '@/api/manage';
import { defineComponent } from '@vue/composition-api';
import PaginationTable from '@/components/PaginationTable/index.vue';

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    fixed: 'left',
    align: 'center',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '用户端',
    dataIndex: 'platformName',
    ellipsis: true
  },
  {
    title: '页面名称',
    dataIndex: 'pageName',
    ellipsis: true
  },
  {
    title: '页面标识',
    dataIndex: 'page',
    ellipsis: true
  },
  {
    title: '分组类型',
    dataIndex: 'type',
    ellipsis: true,
    scopedSlots: { customRender: 'type' }
  },
  {
    title: '分组名称',
    dataIndex: 'pointGroupName',
    ellipsis: true,
    scopedSlots: { customRender: 'pointGroupName' }
  },
  {
    title: '分组标识',
    dataIndex: 'pointGroupCode',
    ellipsis: true
  },
  {
    title: '监测量数',
    dataIndex: 'num',
    ellipsis: true
  },
  {
    title: '排序',
    dataIndex: 'sort',
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 180,
    fixed: 'right',
    scopedSlots: { customRender: 'action' }
  }
];

export default defineComponent({
  name: 'SuperviseGroup',
  components: {
    PaginationTable,
    relevanceInfo: () => import('./components/relevanceInfo.vue')
  },
  data() {
    return {
      formSearch: {
        type: '',
        keyWord: '',
        nameCode: '',
        page: {
          current: 1,
          size: 20
        }
      },
      columns,
      total: 1,
      pages: 1,
      data: [],
      scroll: { y: 'calc(100vh - 280px)' },
      form: this.$form.createForm(this, { name: 'modalForm' }),
      visible: false,
      title: '',
      typeList: [],
      typeDict: {},
      pageList: [],
      pageDict: {},
      groupDict: {},
      groupList: [],
      formData: {},
      loading: false,
      groupId: '',
      configList: [],
      deletingRow: -1
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes'])
  },
  async mounted() {
    this.selectDictType();
    this.getDict();
    let res = await initPointGroup();
    if (res.status === 'complete') {
      this.query(1);
    }
  },
  methods: {
    /* 数据字典枚举 - 客户端 */
    async selectDictType() {
      selectDictEnumByCode('POINT_GROUP_DICT').then(res => {
        if (res.status === 'complete') {
          this.typeList = res.resultData;
          this.typeDict = this.dealDict(res.resultData, 'value');
        }
      });
      selectDictEnumByCode('POINT_GROUP_PAGE_TYPE').then(res => {
        if (res.status === 'complete') {
          this.pageList = res.resultData;
          this.pageDict = this.dealDict(res.resultData, 'value');
        }
      });
      let configRet = await selectDictEnumByCode('POINT_CONFIG_TYPE'); // 归属
      this.configList = configRet.resultData;
    },
    /* 数据字典 - 分组 */
    getDict() {
      sysDictListByCode('purification_point_group_type').then(res => {
        if (res.status === 'complete') {
          this.groupList = res.resultData;
          this.groupDict = this.dealDict(res.resultData, 'dictValue');
        }
      });
    },
    /* 处理数据字典数据 */
    dealDict(_data, type) {
      let obj = {};
      _data.forEach(r => {
        obj[r[type]] = !!r.name ? r.name : r.dictName;
      });
      return obj;
    },
    /* 分页查询 */
    query(num = 1) {
      this.formSearch.page.current = num;
      this.loading = true;
      let params = { ...this.formSearch };
      listPointGroup(params).then(res => {
        this.loading = false;
        let {
          status,
          resultData: { total, records, pages }
        } = res;
        if (status === 'complete') {
          Object.assign(this, {
            data: records.map(item => {
              return {
                ...item,
                pointGroupName: this.groupDict[item.pointGroupCode],
                platformName: item.platform ? this.typeDict[item.platform] : '全部',
                pageName: this.pageDict[item.page]
              };
            }),
            total,
            pages
          });
        }
      });
    },
    reset() {
      this.formSearch = {
        type: '',
        keyWord: '',
        nameCode: '',
        page: {
          current: 1,
          size: 20
        }
      };
      this.query(1);
    },
    /* 翻页 */
    changeListP(page, pageSize) {
      this.formSearch.page.current = page;
      this.query(this.formSearch.page.current);
    },
    /* 新增/编辑分组 */
    handleSubmit() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$confirm({
            title: '提示',
            content: '确定要提交吗？',
            onOk: async () => {
              if (values.platform === 'all') values.platform = '';
              let _id = this.formData['id'];
              if (_id) values.id = this.formData['id'];
              let res = _id ? await editPointGroup(values) : await addPointGroup(values);
              if (res.status === 'complete') {
                this.$message.success(_id ? '修改成功' : '添加成功');
                this.visible = false;
                this.formSearch.page.current = 1;
                this.query(1);
              }
            }
          });
        }
      });
    },
    editGroup(record) {
      this.title = record === 'new' ? '新增分组' : '编辑分组';
      this.formData = record === 'new' ? {} : record;
      this.visible = true;
    },
    /* 删除 */
    deleteGroup(_id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          deletePointGroup(_id).then(res => {
            if (res.status === 'complete') {
              this.$message.success('删除成功');
              this.formSearch.page.current = 1;
              this.deletingRow = -1;
              this.query(1);
            }
          });
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    },
    /* 关联监测量 */
    addRelevance(_id) {
      this.groupId = _id;
      if (this.$refs.infoModal) {
        this.$refs.infoModal['visible'] = true;
      }
    },
    numChange(status) {
      if (status) this.query(1);
    },
    getNameByCode(list, code) {
      const item = list.find(v => v.code === code || v.value === code);
      return item?.name || '--';
    }
  }
});
</script>

<style scoped lang="less">
.supervise-group {
  height: 100%;

  .search-box {
    padding: 8px 20px;
    border-radius: 4px;
    margin-bottom: 12px;
    .search-item {
      float: left;
      .wpg-input {
        width: 270px;
      }
    }
    .btn-item {
      margin-right: 8px;
    }
  }

  &-body {
    height: calc(100% - 72px);

    .pagination-con {
      text-align: right;
      padding: 24px 20px;
    }
  }
}
.add-group {
  .wpg-input-number {
    width: 100%;
  }
}
</style>
