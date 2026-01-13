<template>
  <div style="overflow-y: scroll;" class="config-table full-view supply-bg-bg-card-DEFAULT">
    <w-detail-header pageTitle="编辑">
      <template>
        <w-button @click="back">返回</w-button>
      </template>
    </w-detail-header>
    <div class="table-wrapper">
      <w-config-provider>
        <w-table
          style="height: 90%"
          class="tableDevice"
          ref="wTable"
          :columns="expertProcessColumns"
          :data-source="modalListData"
          :loading="loading"
          :scroll="{ x: 1000 }"
          :pagination="false"
          :rowKey="editPower ? 'num' : 'id'"
        >
          <template slot="factorTypeName" slot-scope="text, record, index">
            {{ text }}
          </template>
          <template slot="conditionDescStrList" slot-scope="text, record, index">
            <template v-if="record.editable">
              <span v-for="item in initConditionDescStrList(record)">
                <span v-if="item.type === 's'">{{ item.splitStr }}</span>
                <w-input
                  v-if="!item.label && item.type === 'v'"
                  style="width: 60px;margin:0 12px;"
                  :defaultValue="item.value"
                  @change="e => handlechang(e.target.value, item.splitStr)"
                  >{{ item.value }}</w-input
                >
                <span v-if="item.label">
                  <w-select
                    :default-value="item.label"
                    :loading="dataLoading"
                    placeholder="输入搜索内容"
                    style="width: 200px;"
                    show-search
                    option-filter-prop="children"
                    @change="value => handlechang(value, item.splitStr)"
                    @search="handleSearch"
                    @popupScroll="handlePopupScroll"
                    @select="handleSelect"
                  >
                    <w-select-option
                      v-for="rendered in renderedOptions"
                      :value="rendered.value"
                      :key="rendered.key"
                    >
                      {{ rendered.label }}
                    </w-select-option>
                  </w-select>
                </span>
              </span>
            </template>
            <template v-else>
              {{ record.decisionConditionExpressionShow }}
            </template>
          </template>
          <template slot="planList" slot-scope="text, record, index">
            <draggable
              v-if="record.editable"
              ref="el"
              v-model="record.planList"
              @update="onUpdate(record.planList)"
            >
              <div v-for="(item, index) in record.planList" :key="item.id">
                <w-checkbox
                  :checked="item.checked"
                  v-model="item.checked"
                  @change="onUpdate(record.planList)"
                />
                {{ index + 1 }}、{{ item.measures }}
              </div>
            </draggable>
            <template v-else>
              <div v-for="(item, index) in record.planList" :key="item.id">
                <div v-if="item.checked">{{ index + 1 }}、{{ item.measures }}</div>
              </div>
            </template>
          </template>
          <template slot="operation" slot-scope="text, record, index">
            <div>
              <span v-if="record.editable">
                <a @click="() => save(record)">保存</a>
                <w-divider type="vertical"></w-divider>
                <a @click="() => cancel(record, index)">取消</a>
              </span>
              <span v-else>
                <a :disabled="editingKey !== ''" @click="() => edit(record)">编辑</a>
                <!-- <w-divider type="vertical"></w-divider>
                <a :disabled="editingKey !== ''" @click="() => delet(index)">删除</a> -->
              </span>
            </div>
          </template>
        </w-table>
      </w-config-provider>
    </div>
  </div>
</template>

<script>
import { debounce } from 'lodash-es';
import draggable from 'vuedraggable';
import { updateExpertProcessControlDecision, queryDevicePointByStationId } from '@/api/analysis';
import { expertProcessColumns } from './options.js';
const LOAD_NUM = 100;
export default {
  name: 'editPlant',
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      loading: false,
      modalListData: [], //列表数据
      editingKey: '', //编辑某一行时，其他行精致编辑
      editingRecord: {}, // 编辑前的记录备份
      expertProcessColumns,
      planIds: [],
      conditionExpressionObj: {},
      selectedVal: '', // Select框选中的值
      oriDataList: [], // 原数据列表 -- 从接口获取
      dataLoading: false, // 原数据列表的加载状态 -- 接口的响应状态
      searchVal: '', // 搜索的内容
      filterDataList: [], // 过滤的数据列表 -- 从dataList中过滤出含搜索内容的数据
      renderedOptions: [] // 已渲染的下拉列表
    };
  },
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    devicePointList: {
      type: Array,
      default: () => []
    },
    //是否支持编辑
    editPower: {
      type: Boolean
    },
    addBtn: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.initTableData();
    this.getAllpoints();
  },
  watch: {},
  methods: {
    handlechang(value, label) {
      this.conditionExpressionObj[label] = value;
    },
    initConditionDescStrList(row) {
      let result = row.conditionDescStrList.map(item => {
        let own = this.conditionExpressionObj[item.splitStr];
        let devicePointObj = this.devicePointList.find(devicePoint => own === devicePoint.value);
        return {
          ...item,
          value: own ? own : item.splitStr,
          label: devicePointObj ? devicePointObj.label : undefined
        };
      });
      return result;
    },
    onUpdate(list) {
      this.planIds = list
        .filter(item => item.checked)
        .map(item => item.id)
        .join(',');
    },
    initTableData() {
      this.modalListData = this.tableData;
    },
    /* 所有监测量 */
    getAllpoints() {
      this.dataLoading = true;
      queryDevicePointByStationId().then(res => {
        this.dataLoading = false;
        if (res.status === 'complete') {
          this.oriDataList = res.resultData.map(p => {
            return {
              label: `${p.deviceName}_${p.pointMemo}`,
              value: `${p.industryDeviceId}_${p.pointName}`,
              key: `${p.industryDeviceId}_${p.pointName}`
            };
          });
          this.renderedOptions = this.oriDataList.slice(0, LOAD_NUM);
        }
      });
    },
    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.searchVal = val;
      let filterList = [];
      if (val) {
        filterList = this.oriDataList.filter(item => item.value.indexOf(val) > -1);
      } else {
        filterList = this.oriDataList;
      }
      this.filterDataList = filterList;
      this.renderedOptions =
        filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
    },
    // 滚动时触发（防止抖动）
    handlePopupScroll: debounce(function() {
      if (this.searchVal === '') {
        this.loadMoreData(this.oriDataList);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    }, 400),
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
        const selectedArr = this.oriDataList.filter(item => item === val); // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const restList = this.oriDataList.filter(item => item !== val); // 从数据源中过滤出其他的值，返回一个数组
        const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        this.renderedOptions = newList; // 更新已渲染的下拉列表
        this.oriDataList = selectedArr.concat(restList); // 更新数据源
        this.searchVal = ''; // 因为触发handleSelect函数时，会自动清空用户输入的内容。因此，searchVal需要重置。
      }
    },
    async save(record) {
      this.loading = true;
      this.editingKey = '';
      delete record.editable;
      let params = {
        ...record,
        planIds: this.planIds.length ? this.planIds : record.planIds,
        planList: [],
        decisionConditionExpressionValue: JSON.stringify(this.conditionExpressionObj)
      };
      let { status } = await updateExpertProcessControlDecision(params);
      if (status === 'complete') {
        let message = '编辑成功';
        this.$message.success(message);
        this.loading = false;
      } else {
        return false;
      }
    },
    cancel(record, index) {
      delete record.editable;
      this.modalListData[index] = this.editingRecord;
      this.modalListData = [...this.modalListData];
      this.editingKey = '';
    },
    back() {
      this.$emit('cancel');
    },
    edit(record) {
      this.editingKey = 'ing';
      this.conditionExpressionObj = JSON.parse(record.decisionConditionExpressionValue);
      this.planIds = [];
      this.editingRecord = { ...record };
      record.editable = true;
      this.modalListData = [...this.modalListData];
    }
  }
};
</script>
<style lang="less" scoped>
.config-table {
  padding-bottom: 12px;
}
</style>
