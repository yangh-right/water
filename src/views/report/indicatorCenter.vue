<template>
  <div class="system-param supply-h-full">
    <w-row class="supply-h-full supply-flex supply-flex-col">
      <w-col :span="24" class="query-wrapper supply-bg-bg-card-DEFAULT">
        <w-form class="query-form">
          <!-- <w-col class="supply-float-left">
            <w-form-model-item label="选择污水厂" prop="projectStatusList">
              <factory-select
                v-model="waterPlantId"
                style="width: 202px"
                autoSelect
                :showAll="true"
              ></factory-select>
            </w-form-model-item>
          </w-col> -->
          <w-col :span="8" class="supply-float-left">
            <w-form-model-item label="关键字：" label-for="keyword">
              <w-input v-model="keyword" placeholder="请输入关键字"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-item>
              <w-button class="supply-self-end" type="primary" @click="addPoint" icon="plus">
                新增组合
              </w-button>
              <w-button class="supply-mx-3" @click="handleReset" icon="reload">重置</w-button>
              <w-button type="primary" @click="queryData" icon="search">查询</w-button>
            </w-form-item>
          </w-col>
        </w-form>
      </w-col>
      <w-col :span="24" class="con-wrapper supply-flex-1 supply-bg-bg-card-DEFAULT">
        <s-table
          ref="table"
          class="supply-bg-bg-card-component"
          row-key="addPoint"
          :scroll="{ x: 500 }"
          :columns="columns"
          :data="getHistoryList"
          :showPagination="false"
          :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
        >
          <template slot="name" slot-scope="text, record">
            <w-input v-if="record.isAdd || record.isEdit" v-model="record.name"></w-input>
            <span v-else>{{ text }}</span>
          </template>
          <template slot="pointName" slot-scope="text, record">
            <div v-if="record.isAdd || record.isEdit">
              <w-select
                v-model="record.pointsId"
                placeholder="监测量选择"
                allowClear
                showSearch
                mode="multiple"
                :maxTagCount="2"
                :filterOption="filterOption"
                style="width: 320px;"
                @search="handleSearch"
                @popupScroll="handleScroll"
                @change="changeServices(record)"
              >
                <w-select-option v-for="opt of renderedOptions" :key="opt.value">{{
                  opt.label
                }}</w-select-option>
              </w-select>
            </div>
            <span v-else>{{ text }}</span>
          </template>
          <template slot="action" slot-scope="text, record, index">
            <a v-show="record.isAdd || record.isEdit" @click="historyAdd(record)">保存</a>
            <w-divider v-show="record.isAdd || record.isEdit" type="vertical" />
            <a v-show="record.isAdd || record.isEdit" @click="handleCanel(record)">取消</a>

            <a v-show="!record.isAdd && !record.isEdit" @click="editPoint(record)">修改</a>
            <w-divider v-show="!record.isAdd && !record.isEdit" type="vertical" />
            <a v-show="!record.isAdd && !record.isEdit" @click="getHistoryDelete(record.id, index)"
              >删除</a
            >
          </template>
        </s-table>
      </w-col>
    </w-row>
  </div>
</template>
<script>
import debounce from 'lodash/debounce';
import { getPointLists } from '@/api/configuration';
import { getHistoryList, getHistoryEdit, getHistoryDelete, getHistoryAdd } from '@/api/report';
import { mapState, mapMutations } from 'vuex';
import PointSelect from './models/pointSelect';
import FactorySelect from '@/components/factory-select/index.vue';
const LOAD_NUM = 50;
export default {
  name: 'indicatorCenter',
  components: {
    PointSelect,
    FactorySelect
  },
  props: {},
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 500);
    return {
      currentRowId: '',
      waterPlantId: '',
      autoSelect: true,
      serviceIds: [],
      treeData: [],
      pointNameList: {},
      pointNameStr: '',
      ifAddPoints: 0,
      isPointSelectOpen: false,
      composeName: '',
      keyword: '',
      dataNum: 4,
      selectedRowKeys: [],
      pointsList: [],
      pointsAllList: [],
      renderedOptions: [],
      searchVal: '',
      columns: [
        {
          title: '序号',
          dataIndex: 'num',
          key: 'num',
          width: 80,
          customRender: (text, row, index) => {
            return index + 1;
          }
        },
        {
          title: '组合名称',
          dataIndex: 'name',
          width: 130,
          ellipsis: true,
          scopedSlots: { customRender: 'name' }
        },
        {
          title: '监测量',
          dataIndex: 'pointName',
          width: 250,
          scopedSlots: { customRender: 'pointName' }
        },
        {
          title: '创建时间',
          dataIndex: 'createTime',
          width: 220,
          scopedSlots: { customRender: 'createTime' }
        },
        {
          title: '操作',
          key: 'action',
          dataIndex: 'action',
          width: 130,
          defaultChecked: true,
          scopedSlots: { customRender: 'action' }
        }
      ],
      deletingRow: -1
    };
  },
  mounted() {
    this.getPointData();
  },
  computed: {
    ...mapState('setting', ['buttonCodes']),
    ...mapState('report', ['hasEdit']),
    ...mapState('account', ['user']),
    ...mapState('report', { params: 'alarmParams' }),
    ...mapState('dict', {
      planStatus: state => state.plan_status
    })
  },
  watch: {
    params(n) {
      if (JSON.stringify(n) !== '{}') {
        if (this.$refs.table) this.$refs.table.refresh(true);
      }
    }
  },
  methods: {
    ...mapMutations('report', ['setHasEdit']),
    handleCanel(record) {
      record.isAdd = false;
      record.isEdit = false;
    },
    //修改
    editPoint(record) {
      record.isAdd = false;
      record.isEdit = true;
    },
    handleReset() {
      this.keyword = '';
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    queryData() {
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    //新增
    addPoint() {
      if (this.ifAddPoints === 2) {
        this.$message.error('已新增一空白组合，请填选并保存');
      } else {
        this.ifAddPoints = 1;
        if (this.$refs.table) this.$refs.table.loadData(true);
      }
    },
    changeServices(record) {
      let tempPoints = [];
      if (Array.isArray(record.pointsId)) {
        this.pointsAllList.forEach(item => {
          if (record.pointsId.indexOf(item.pointName) > -1) {
            tempPoints.push({
              pointCode: item.pointName,
              pointName: item.pointMemo
            });
          }
        });
        record.points = tempPoints;
      }
    },
    //保存
    async historyAdd(record) {
      if (!record.pointsId) {
        this.$message.error('请先选择监测量');
        return;
      }
      if (Array.isArray(record.pointsId) && record.pointsId.length > 10) {
        this.$message.error('最多只能选择10个监测量');
      }

      if (record.isAdd) {
        let { name, points, createBy } = record;
        await getHistoryAdd({
          createBy,
          name,
          points
        });
      }
      if (record.isEdit) {
        let { id, name, points, createTime } = record;
        await getHistoryEdit({
          id,
          createTime,
          createBy: this.user.userId,
          name,
          points
        });
      }
      this.$emit('changeList');
      if (this.$refs.table) this.$refs.table.loadData(true);
    },
    async getHistoryList() {
      if (this.ifAddPoints === 1) {
        let tableData = [
          {
            name: '',
            pointName: '',
            points: [],
            id: undefined,
            pointsId: [],
            isAdd: true,
            isEdit: false,
            addPoint: 'addPoint'
          },
          ...this.tableData
        ];
        this.ifAddPoints = 2;
        return { records: tableData, current: 0, size: 1000 };
      } else {
        return await getHistoryList({ current: 0, size: 1000, keyword: this.keyword }).then(res => {
          this.setHasEdit(!this.hasEdit);
          let records = res.resultData.map(item => {
            let pointName = '';
            item.points.forEach((point, i) => {
              if (i) {
                pointName += '/' + point.pointName;
              } else {
                pointName += point.pointName;
              }
            });
            return {
              isAdd: false,
              isEdit: false,
              name: item.name,
              pointsId: item.points.map(item => item.pointCode),
              pointName,
              id: item.id,
              points: item.points,
              createBy: item.createBy,
              createTime: item.createTime
            };
          });
          this.tableData = [...records];
          this.ifAddPoints = 0;
          return { records, current: 1, size: 1000 };
        });
      }
    },
    async getHistoryDelete(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        onOk: async () => {
          if (id !== 'addPoint') {
            let composeList = await getHistoryDelete(id);
            this.$emit('changeList');
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
    },
    async getPointData() {
      const params = { currentPage: 1, pageSize: 99999, pointType: undefined, keyWord: undefined };
      let { resultData, status } = await getPointLists(params);
      this.pointsAllList = JSON.parse(JSON.stringify(resultData));
      this.pointsList = resultData.map(p => {
        return {
          label: p.pointMemo,
          value: p.pointName,
          key: p.pointName
        };
      });
      this.renderedOptions = this.pointsList.slice(0, LOAD_NUM);
    },
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
    handleSelect(val, row) {
      const selectedObj = this.pointsAllList.find(item => item.pointMemo === val);
      row.pointName = selectedObj.pointName;
      row.pointMemo = selectedObj.pointMemo;
      row.pointUnit = selectedObj.pointUnit;
      row.id = selectedObj.id;
    },
    filterOption(input, option) {
      return (
        option.componentOptions.children[0].text.toLowerCase().indexOf(input.toLowerCase()) >= 0
      );
    }
  }
};
</script>

<style lang="less" scoped>
.system-param {
  position: relative;
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
    margin-top: 10px;
  }
  /deep/.wpg-pagination {
    display: none;
  }
}
</style>
