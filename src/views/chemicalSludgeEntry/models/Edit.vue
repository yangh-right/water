<template>
  <div @click="isPointSelectOpen = false" class="page-wrapper">
    <div class="supply-relative table-box">
      <w-button class="supply-self-end supply-mb-2" type="primary" @click="toAddSupplier">
        新增监测量配置
      </w-button>
      <s-table
        :showPagination="false"
        :page-size="10"
        :scroll="{ x: 640 }"
        ref="table"
        style="max-height:350px"
        class="supply-bg-bg-card-component"
        row-key="id"
        :columns="columns"
        :data="getSupplierList"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="modelPointName" slot-scope="text, record">
          <w-select
            v-if="isEdit === record.id"
            showSearch
            allowClear
            :filterOption="false"
            :options="renderedOptions"
            v-model="modelPointName"
            placeholder="请选择\输入模型监测量"
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
          <span v-else>{{ text }}</span>
        </template>
        <template slot="entryType" slot-scope="text, record">
          <w-select v-if="isEdit === record.id" v-model="entryType" style="width: 100%">
            <w-select-option
              v-for="item in informationList"
              :key="item.value"
              :value="item.label"
              >{{ item.label }}</w-select-option
            >
          </w-select>
          <span v-if="isEdit !== record.id">{{ text }}</span>
        </template>
        <template slot="action" slot-scope="text, record, index">
          <a v-show="isEdit === record.id" @click="historyAdd(record)">保存</a>
          <w-divider v-show="isEdit === record.id" type="vertical" />
          <a v-show="isEdit === record.id" @click="isEdit = false">取消</a>
          <a v-show="isEdit !== record.id" @click="editPoint(record)">修改</a>
          <w-divider v-show="isEdit !== record.id" type="vertical" />
          <a v-show="isEdit !== record.id" @click="deleteSupplier(record.id, index)">删除</a>
        </template>
      </s-table>
    </div>
  </div>
</template>
<script>
import { debounce } from 'lodash-es';
import {
  getModelRelation,
  addModelRelation,
  deleteModelRelation,
  getForecastCodeList
} from '@/api/reportRecord.js';
import { sysDictListByCode } from '@/api/manage';

const LOAD_NUM = 100;
export default {
  name: 'SupplierEdit',
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      entryType: '',
      ifAddPoints: 0,
      isPointSelectOpen: false,
      modelPointName: '',
      isEdit: false,
      renderedOptions: [], //渲染的模型监测量
      pointsList: [], //模型监测量列表
      informationList: [],
      columns: [
        {
          title: '模型监测量',
          dataIndex: 'modelPointName',
          width: 160,
          ellipsis: true,
          scopedSlots: { customRender: 'modelPointName' }
        },
        {
          title: '类型',
          dataIndex: 'entryType',
          width: 160,
          scopedSlots: { customRender: 'entryType' }
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          width: 80,
          defaultChecked: true,
          scopedSlots: { customRender: 'action' }
        }
      ],
      deletingRow: -1
    };
  },
  watch: {
    params(n) {
      if (JSON.stringify(n) !== '{}') {
        if (this.$refs.table) this.$refs.table.refresh(true);
      }
    }
  },
  beforeRouteEnter(to, from, next) {
    next(vm => {
      vm.refresh(false, false);
    });
  },
  mounted() {
    this.getForecastCodeList();
    this.sysDictListByCode('chemicals', 'information');
  },
  methods: {
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      this[`${data}List`] = res.resultData.map(item => {
        return {
          ...item,
          label: item.dictName,
          value: item.dictValue
        };
      });
    },
    /* 所有监测量 */
    getForecastCodeList(val) {
      let params = {
        waterPlantId: val
      };
      getForecastCodeList(params).then(res => {
        if (res.status === 'complete') {
          this.pointsList = res.resultData.map(p => {
            return {
              label: p.pointMemo,
              value: p.pointMemo,
              key: p.id
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
    //修改
    editPoint(record) {
      this.isPointSelectOpen = false;
      this.isEdit = record.id;
      this.modelPointName = record.modelPointName;
      this.entryType = record.entryType;
    },
    //新增
    toAddSupplier() {
      if (this.ifAddPoints === 2) {
        this.$message.error('已新增一空白组合，请填选并保存');
      } else {
        this.ifAddPoints = 1;
        this.isEdit = 'addPoint';
        this.modelPointName = '';
        this.entryType = '';
        if (this.$refs.table) this.$refs.table.loadData(true);
      }
    },
    //保存
    async historyAdd(record) {
      if (!this.entryType) {
        this.$message.error('监测量类型不能为空');
      } else if (!this.modelPointName) {
        this.$message.error('监测量名称');
      } else {
        if (record.id === 'addPoint') {
          this.addModelRelation(record);
        } else {
          this.editSupplier(record);
        }
      }
    },
    async addModelRelation() {
      this.isEdit = false;
      this.isPointSelectOpen = false;
      let param = {
        modelPointName: this.modelPointName,
        entryType: this.entryType
      };
      await addModelRelation(param);
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async getSupplierList() {
      if (this.ifAddPoints === 1) {
        let tableData = [{ entryType: '', modelPointName: '', id: 'addPoint' }, ...this.tableData];
        this.ifAddPoints = 2;
        return { records: tableData, current: 1, size: 1000 };
      } else {
        return await getModelRelation({ current: 1, size: 1000 }).then(res => {
          this.isEdit = false;
          this.tableData = [...res.resultData];
          this.ifAddPoints = 0;
          this.$emit('changeList', res.resultData || []);
          return { records: [...res.resultData], current: 1, size: 1000 };
        });
      }
    },
    async editSupplier(record) {
      await addModelRelation({
        ...record,
        entryType: this.entryType,
        modelPointName: this.modelPointName
      });
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async deleteSupplier(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          if (id !== 'addPoint') {
            let composeList = await deleteModelRelation(id);
          } else {
            this.ifAddPoints = 0;
          }
          if (this.$refs.table) this.$refs.table.loadData(true);
          this.deletingRow = -1;
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.compose-content {
  overflow: hidden;
  display: flex;
  max-height: 298px;
  max-width: 266px;
  min-width: 100%;
  flex-direction: column;
  position: absolute;
  right: 0;
  box-shadow: 0 0 15px #a9a9a9;
  background-color: var(--supply-color-bg-select-DEFAULT);
  /deep/ .point-con {
    .point-Multi {
      max-height: 298px;
    }
  }
}
.page-wrapper {
  width: 100%;
  height: 100%;
  /* padding: 8px 20px 20px; */
  display: flex;
  .table-box {
    width: 100%;
    display: flex;
    flex-direction: column;
    padding: 0 30px;
    /* align-items: center; */
    height: 100%;
    .point-compose__select {
    }
    /deep/ .wpg-pagination {
      display: none;
    }
    /deep/ .table-page-search-wrapper {
      padding: 0;
    }
    /deep/ .table-page-list-wrapper {
      margin-top: 0;
    }
    /deep/ .wpg-table-placeholder {
      padding: unset;
    }
  }

  .point-select {
    border: 1px solid #dce0df;
    border-radius: 1px;
    width: 206px;
    background-color: var(--supply-color-bg-select-DEFAULT);
  }
}
</style>
