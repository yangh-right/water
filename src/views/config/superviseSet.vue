<!--
 * @Description: 监测量配置页面
 * @Author: undefined
 * @Date: undefined
 * @LastEditTime: 2025-01-20 13:18:01
 * @LastEditors: wangyr
-->

<template>
  <div class="supervise-set supply-flex supply-flex-col">
    <div
      class="supervise-set-tap supply-bg-bg-card-DEFAULT supply-flex-none supply-overflow-hidden"
    >
      <span
        v-for="tab in tabs"
        :key="tab.value"
        :class="tabVal === tab.value ? 'active' : ''"
        @click="changeTab(tab.value)"
      >
        {{ tab.label }}
      </span>
      <!-- <w-button v-if="!stepData" class="supply-float-right" @click="back">返回</w-button> -->
      <return-control
        class="supply-float-right"
        style="margin-top: 7px; margin-right: 12px;"
        :keep="true"
        :is-drill-down="true"
      ></return-control>
    </div>
    <div
      class="supervise-set-body supply-flex-1 supply-overflow-hidden supply-flex supply-flex-col"
    >
      <w-row class="manage-seach supply-bg-bg-card-DEFAULT supply-flex-none">
        <w-form-model
          ref="formSearch"
          layout="inline"
          :model="formSearch"
          class="supply-clear-both"
          @submit="query"
          @submit.native.prevent
        >
          <!-- <w-col class="search-item">
            <w-form-model-item label="监测量归属" prop="type">
              <w-select v-model="formSearch.type" style="width: 120px">
                <w-select-option value="">
                  全部
                </w-select-option>
                <w-select-option v-for="c in configList" :key="c.value" :value="c.value">
                  {{ c.name }}
                </w-select-option>
              </w-select>
            </w-form-model-item>
          </w-col> -->
          <w-col class="search-item">
            <w-form-model-item label="分组" prop="groupType">
              <w-select v-model="formSearch.groupType" style="width: 120px">
                <w-select-option value="">
                  全部
                </w-select-option>
                <template v-if="now === 'energy'">
                  <w-select-option v-for="e in energyTypeList" :key="e.value" :value="e.value">
                    {{ e.name }}
                  </w-select-option>
                </template>
                <template v-else>
                  <w-select-option v-for="e in groupTypeList" :key="e.value" :value="e.value">
                    {{ e.name }}
                  </w-select-option>
                </template>
              </w-select>
            </w-form-model-item>
          </w-col>
          <w-col class="search-item">
            <w-form-model-item label="模糊查找" prop="keyword">
              <w-input
                v-model.trim="formSearch.keyword"
                placeholder="监测量名称"
                :maxLength="50"
                allowClear
              ></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-model-item>
              <w-button v-if="isShowButton('add')" type="primary" icon="plus" @click="addPoint(1)"
                >新增</w-button
              >
              <w-button icon="ic_autorenew" @click="reset" class="supply-mx-3">重置</w-button>
              <w-button type="primary" icon="ic_search" html-type="submit">查询</w-button>
            </w-form-model-item>
          </w-col>
        </w-form-model>
      </w-row>
      <PaginationTable
        class="supply-flex-1 supply-bg-bg-card-DEFAULT"
        rowKey="id"
        :loading="loading"
        :columns="columns"
        :data-source="data"
        :current.sync="formSearch.page.current"
        :total.sync="total"
        :pageSize.sync="formSearch.page.size"
        @change="changeListP"
      >
        <template slot="action" slot-scope="action, record">
          <a
            v-if="isShowButton('config')"
            href="javascript:;"
            class="delete-link"
            @click="setPoint(record)"
            >配置</a
          >
          <a
            v-if="isShowButton('edit')"
            href="javascript:;"
            class="delete-link"
            @click="addPoint(2, record)"
            >编辑</a
          >
          <a v-if="isShowButton('delete')" href="javascript:;" @click="deleteOne(record.id)"
            >删除</a
          >
        </template>
      </PaginationTable>
    </div>

    <!-- 编辑 -->
    <w-modal
      v-if="visible"
      :title="editType === 1 ? `新增${currentTabStr}` : `编辑${currentTabStr}`"
      :visible="visible"
      class="add-parts"
      width="600px"
      @cancel="visible = false"
      @ok="handleOk"
    >
      <w-form
        :form="form"
        labelAlign="right"
        :label-col="{ span: 5 }"
        :wrapper-col="{ span: 19 }"
        class="query-form"
        @submit="handleOk"
      >
        <w-form-item label="监测量名称">
          <w-input
            v-decorator="[
              'name',
              {
                rules: [{ required: true, message: '请输入' }],
                initialValue: formData.name
              }
            ]"
            :maxLength="50"
            allowClear
            placeholder="请输入"
            autocomplete="off"
          />
        </w-form-item>
        <w-form-item label="监测量标识">
          <w-input
            v-decorator="[
              'code',
              {
                rules: [
                  { required: true, message: '请输入' },
                  {
                    validator: codeInput
                  }
                ],
                initialValue: formData.code
              }
            ]"
            :maxLength="50"
            allowClear
            placeholder="请输入"
            autocomplete="off"
          />
        </w-form-item>
        <!-- <w-form-item label="监测量归属">
          <w-select
            v-decorator="[
              'type',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.type
              }
            ]"
            placeholder="请选择"
            :disabled="editType === 2"
          >
            <w-select-option v-for="m in configList" :key="m.value" :value="m.value">
              {{ m.name }}
            </w-select-option>
          </w-select>
        </w-form-item> -->
        <w-form-item label="监测量选择">
          <w-select
            v-decorator="[
              'pointNameList',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.pointNames
              }
            ]"
            mode="multiple"
            :filterOption="false"
            :options="renderedOptions"
            placeholder="请选择\输入"
            style="width: 100%"
            :maxTagTextLength="4"
            maxTagPlaceholder="..."
            :maxTagCount="3"
            dropdownClassName="supervise-set-select"
            @search="handleSearch"
            @popupScroll="handleScroll"
            @select="handleSelect"
            @dropdownVisibleChange="dropDownSelect"
          >
          </w-select>
        </w-form-item>
        <w-form-item label="分组">
          <w-select
            v-decorator="[
              'groupType',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.groupType
              }
            ]"
            showSearch
            :filter-option="filterOption"
            placeholder="请选择"
          >
            <template v-if="now === 'page'">
              <w-select-option v-for="m in groupTypeList" :key="m.value" :value="m.value">
                {{ m.name }}
              </w-select-option>
            </template>
            <template v-else>
              <w-select-option v-for="m in energyTypeList" :key="m.value" :value="m.value">
                {{ m.name }}
              </w-select-option>
            </template>
          </w-select>
        </w-form-item>
        <w-form-item label="计算方式">
          <w-select
            v-decorator="[
              'valueType',
              {
                rules: [{ required: true, message: '请选择' }],
                initialValue: formData.valueType
              }
            ]"
            placeholder="请选择"
            :disabled="editType === 2"
          >
            <template v-if="now === 'page'">
              <w-select-option v-for="m in valTypeList" :key="m.value" :value="m.value">
                {{ m.name }}
              </w-select-option>
            </template>
            <template v-else>
              <w-select-option v-for="m in energyValTypeList" :key="m.value" :value="m.value">
                {{ m.name }}
              </w-select-option>
            </template>
          </w-select>
        </w-form-item>
        <w-form-item label="排序">
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
            :max="9999"
            :precision="0"
          />
        </w-form-item>
      </w-form>
    </w-modal>
  </div>
</template>

<script>
import debounce from 'lodash/debounce';
import { mapState, mapMutations } from 'vuex';
import PaginationTable from '@/components/PaginationTable/index.vue';

import {
  sysDictListByCode, // 数据字典
  selectDictEnumByCode, // 枚举类
  pageQueryPage, // 页面显示 - 分页查询1
  energyQueryPage, // 能效 - 分页查询2
  allPointList, // 所有监测量
  checkCode, // 检测code
  checkEnergyCode, // 检测code 2
  addPointConfig, // 新增监测量1
  updatePointConfig, // 编辑监测量1
  deletePointConfig, // 删除1
  deleteEnergyPointConfig, // 删除2
  updateEnergyPointConfig, // 编辑2
  addEnergyPointConfig // 新增2
} from '@/api/manage';

const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 80,
    align: 'center',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '监测量名称',
    dataIndex: 'name',
    ellipsis: true
  },
  {
    title: '监测量标识',
    dataIndex: 'code',
    ellipsis: true
  },
  {
    title: '分组',
    dataIndex: 'groupTypeStr',
    ellipsis: true
  },
  {
    title: '排序',
    dataIndex: 'sort',
    ellipsis: true
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    ellipsis: true
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 150,
    scopedSlots: { customRender: 'action' }
  }
];
const LOAD_NUM = 100; // 加载条数--可自定义
export default {
  name: 'SuperviseSet',
  components: {
    PaginationTable
  },
  props: {
    stepData: {
      type: Object,
      default: null
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      columns,
      form: this.$form.createForm(this, { name: 'pointsForm' }),
      now: 'page',
      formSearch: {
        keyword: '',
        type: 0,
        groupType: '',
        page: {
          current: 1,
          size: 20
        }
      },
      configList: [], // 监测量归属
      energyTypeList: [], // 分组 -- 能效
      groupTypeList: [], // 分组 -- 页面
      valTypeList: [], // 计算方式 -- 页面
      energyValTypeList: [], // 计算方式 -- 能效
      data: [],
      scroll: { y: 'calc(100vh - 300px)' },
      total: 1,
      pages: 1,
      visible: false,
      editType: 1,
      pointsList: [],
      formData: {},
      loading: false,
      renderedOptions: [],
      searchVal: '',
      tabs: [
        {
          label: '水质配置',
          value: '0'
        },
        {
          label: '构筑物配置',
          value: '1'
        },
        {
          label: '能耗配置',
          value: '2'
        },
        {
          label: '活性污泥配置',
          value: '3'
        },
        {
          label: '其它配置',
          value: '9'
        }
      ],
      tabVal: '0'
    };
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),
    ...mapState('page', ['current', 'opened']),
    /* 处理数据字典数据 */
    dealDict() {
      return (_data, val) => {
        let idx = _data.findIndex(d => d.value === val);
        if (idx > -1) return _data[idx]['name'];
      };
    },
    currentTabStr() {
      return this['now'] === 'page' ? '监测量配置' : '能耗监测量配置';
    },
    isShowButton() {
      return type => {
        let str = this.now === 'energy' ? 'configSuperviseSet_' : 'configSuperviseSetP_';
        return this.buttonCodes[str + type];
      };
    }
    // 跳转至此页面的path
    // fromPath() {
    //   console.log(this.$route.query);
    //   if (this.$route.query && this.$route.query.page) {
    //     return '/manage/pump'
    //   } else {
    //     return '/system'
    //   }
    // }
  },
  async mounted() {
    await this.getDict();
    this.getAllpoints();
    this.query();
  },
  methods: {
    ...mapMutations('page', ['removeOpened']),
    /* 检查监测量code */
    async codeInput(rule, v, callback) {
      const value = v || '';
      if (value) {
        let params = { code: value };
        if (this.formData['id']) params.id = this.formData['id'];
        let res = this.now === 'page' ? await checkCode(params) : await checkEnergyCode(params);
        if (res.status !== 'complete' || !res.resultData) {
          callback(new Error('标识已存在, 不可重复'));
        } else {
          callback();
        }
      }
    },
    changeTab(tab) {
      this.tabVal = tab;
      this.formSearch.page.current = 1;
      this.formSearch.type = tab;
      this.query();
    },
    /* 翻页 */
    changeListP(page) {
      this.query();
    },
    /* 搜索tag */
    filterTag(val, treeNode) {
      return treeNode.data.props.title.includes(val);
    },
    /* 数据字典 / 枚举类 */
    async getDict() {
      let configRet = await selectDictEnumByCode('POINT_CONFIG_TYPE'); // 归属
      this.configList = configRet.resultData;
      let energyTypeRet = await selectDictEnumByCode('POINT_CONFIG_ENERGY_GROUP_TYPE'); // 分组 -- 能效
      this.energyTypeList = energyTypeRet.resultData;
      let valTypeRet = await selectDictEnumByCode('POINT_CONFIG_VALUE_TYPE'); // 计算方式 -- 页面
      this.valTypeList = valTypeRet.resultData;
      let energyValTypeRet = await selectDictEnumByCode('POINT_CONFIG_ENERGY_VALUE_TYPE'); // 计算方式 -- 能效
      this.energyValTypeList = energyValTypeRet.resultData;
      let groupTypeRet = await sysDictListByCode('purification_point_config_group_type'); // 分组 -- 页面
      this.groupTypeList = groupTypeRet.resultData.map(i => {
        return {
          name: i.dictName,
          value: i.dictCode,
          code: i.dictCode,
          ...i
        };
      });
    },
    /* 所有监测量 */
    getAllpoints() {
      allPointList().then(res => {
        if (res.status === 'complete') {
          this.pointsList = res.resultData.map(p => {
            return {
              label: p.pointMemo,
              value: p.pointName,
              key: p.pointName
            };
          });
          this.renderedOptions = this.pointsList;
        }
      });
    },
    /* 解决分页数据后部分监测量显示code问题 */
    dropDownSelect(open) {
      this.renderedOptions = open ? this.pointsList.slice(0, LOAD_NUM) : this.pointsList;
    },
    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.searchVal = val;
      let filterList = [];
      if (val) {
        filterList = this.pointsList.filter(item => {
          let value = item.value + item.label;
          return value.indexOf(val) > -1;
        });
      } else {
        filterList = this.pointsList;
      }
      this.filterDataList = filterList;
      this.renderedOptions =
        filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
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
    },
    /* 重置 */
    reset() {
      this.formSearch = {
        keyword: '',
        type: this.formSearch.type,
        groupType: '',
        page: {
          current: 1,
          size: 20
        }
      };
      this.query();
    },
    /* 提交 */
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.$confirm({
            title: '提示',
            content: '确定要提交吗？',
            onOk: async () => {
              if (this.editType === 2) values.id = this.formData['id'];
              values['type'] = this.formSearch.type; // 监测量归属
              let res = {};
              if (this.now === 'page') {
                res =
                  this.editType === 1
                    ? await addPointConfig(values)
                    : await updatePointConfig(values);
              } else {
                res =
                  this.editType === 1
                    ? await addEnergyPointConfig(values)
                    : await updateEnergyPointConfig(values);
              }
              if (res.status === 'complete') {
                this.visible = false;
                this.$message.success('提交成功');
                this.formSearch.page.current = 1;
                this.query();
              }
            }
          });
        }
      });
    },
    /* 删除 */
    deleteOne(_id) {
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          let res =
            this.now === 'page' ? await deletePointConfig(_id) : await deleteEnergyPointConfig(_id);
          if (res.status === 'complete') {
            this.$message.success('删除成功');
            this.formSearch.page.current = 1;
            this.query();
          }
        }
      });
    },
    /* 新增 / 编辑 */
    addPoint(type, record) {
      this.visible = true;
      this.editType = type;
      if (type === 1) {
        this.formData = {};
      } else {
        this.formData = {
          ...record,
          pointNames: JSON.parse(record.pointNames)
        };
        // this.renderedOptions = this.pointsList.slice(0, LOAD_NUM);
        if (this.formData.pointNames.length > 0) {
          // let selectedArr =
        }
      }
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    },
    /* 分页查询 */
    async query(page) {
      this.loading = true;
      let reg = /^[0-9]+.?[0-9]*/;
      // this.formSearch.page.current = page && reg.test(page) ? page : 1;
      let res =
        this.now === 'page'
          ? await pageQueryPage(this.formSearch)
          : await energyQueryPage(this.formSearch);
      this.loading = false;
      let {
        status,
        resultData: { records, pages, total }
      } = res;
      if (status === 'complete') {
        let groups = this.now === 'page' ? this.groupTypeList : this.energyTypeList;
        let valTypes = this.now === 'page' ? this.valTypeList : this.energyValTypeList;
        Object.assign(this, {
          data: records.map(r => {
            return {
              ...r,
              groupTypeStr: this.dealDict(groups, r.groupType),
              valueTypeStr: this.dealDict(valTypes, r.valueType)
            };
          }),
          pages,
          total
        });
      }
    },
    /* 配置 */
    setPoint(record) {
      this.drillDown({
        path: '/config/setPoints',
        query: { id: record.id }
      });
      let { name, code, type, pointNames, groupTypeStr, valueType, valueTypeStr } = record;
      pointNames = JSON.parse(pointNames).map(n => {
        let idx = this.pointsList.findIndex(p => p.value === n);
        if (idx > -1) return this.pointsList[idx]['label'];
      });
      let data = {
        data: [
          {
            label: '监测量名称',
            value: name
          },
          {
            label: '监测量标识',
            value: code
          },
          {
            label: '分组',
            value: groupTypeStr
          },
          {
            label: '计算方式',
            value: valueTypeStr
          },
          {
            label: '监测量选择',
            value: pointNames.join('，')
          }
        ],
        id: record.id,
        current: this.now,
        type,
        valueType
      };
      this.$store.commit('page/setPointData', data);
    }
  }
};
</script>

<style scoped lang="less">
.supervise-set {
  height: 100%;
  &-tap {
    height: 50px;
    border-radius: 4px;
    margin-bottom: 12px;
    span {
      display: inline-block;
      height: 100%;
      width: 140px;
      font-size: 14px;
      color: #999999;
      text-align: center;
      font-weight: 400;
      line-height: 48px;
      cursor: pointer;
      &.active {
        color: var(--supply-color-primary-DEFAULT);
        border-bottom: 2px solid var(--supply-color-primary-DEFAULT);
      }
    }
    .ant-btn {
      height: 28px;
      margin-top: 10px;
      margin-right: 30px;
    }
  }
  &-body {
    .manage-seach {
      padding: 12px;
      border-radius: 4px;
      .search-item {
        float: left;
        .ant-input {
          width: 205px;
        }
        .ant-select {
          width: 260px !important;
        }
      }
    }
    .delete-link {
      margin-right: 12px;
    }
    .pagination-con {
      text-align: right;
      padding: 12px 20px;
    }
  }
}
.add-parts {
  .ant-input-number {
    width: 100%;
  }
}
</style>
