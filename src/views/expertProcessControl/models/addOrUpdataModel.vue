<template>
  <div class="full-view" style="overflow-y: scroll;">
    <w-detail-header :pageTitle="runTimeObj ? '编辑' : '新增'">
      <template>
        <w-button @click="cancel">取消</w-button>
        <w-button style="margin-left: 10px" type="primary" :loading="loading" @click="handlerFrom"
          >保存</w-button
        >
      </template>
    </w-detail-header>
    <w-row class="config-wrap supply-bg-bg-card-DEFAULT">
      <w-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :labelCol="{ span: 10 }"
        :wrapperCol="{ span: 14 }"
      >
        <w-col span="24">
          <w-form-model-item label="条件描述">
            <span v-for="item in initConditionDescStrList(rowData)">
              <span v-if="item.type === 's'" v-html="item.value"></span>
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
              <span v-if="!item.label && item.type === 'v'">
                <w-input
                  style="width: 60px;margin:0 12px;"
                  :defaultValue="item.value"
                  @change="e => handlechang(e.target.value, item.splitStr)"
                  >{{ item.value }}</w-input
                >
              </span>
            </span>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
    <edit-plant
      :tableData="form.planList || []"
      @editPlanList="updataPlanList"
      :editPower="true"
      addBtn="总调控措施"
      :modalColumns="planListColumns"
    ></edit-plant>
  </div>
</template>

<script>
import { cloneDeep, debounce } from 'lodash-es';
import FactorySelect from '@/components/factory-select/index.vue';
import { queryDevicePointByStationId } from '@/api/analysis';
import {
  addOrUpdateExpertProcessControl,
  getExpertProcessControlDecisionByControlId
} from '@/api/analysis';
import { planListColumns, expertProcessColumns } from './options.js';

import editPlant from './editPlant.vue';
const paramsData = {
  // waterPlantId: '',
  conditionExpression: '',
  planList: []
  // desc: ''
};
const LOAD_NUM = 100;
export default {
  name: 'addOrUpdataModel',
  components: {
    FactorySelect,
    editPlant
  },
  props: {
    runTimeObj: {
      type: Number,
      default: 0
    },
    rowData: {
      type: Object,
      default: () => {}
    },
    structureLiat: {
      type: Array,
      default: () => {}
    },
    devicePointList: {
      type: Array,
      default: () => []
    },
    type: {
      type: Number,
      default: 1
    }
  },
  computed: {},
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      form: cloneDeep(paramsData),
      loading: false,
      rules: {
        // waterPlantId: [{ required: true, message: '请选择水厂' }],
        // desc: [{ required: true, message: '请输入决策配置描述' }],
      },
      pointsList: [],
      fieldNameListC: ['warnOpt', 'warningValue', 'warnMin', 'warnMax'],
      planListColumns,
      expertProcessColumns,
      selectedVal: '', // Select框选中的值
      oriDataList: [], // 原数据列表 -- 从接口获取
      dataLoading: false, // 原数据列表的加载状态 -- 接口的响应状态
      searchVal: '', // 搜索的内容
      filterDataList: [], // 过滤的数据列表 -- 从dataList中过滤出含搜索内容的数据
      renderedOptions: [], // 已渲染的下拉列表
      modalListData: []
    };
  },
  watch: {
    runTimeObj(val) {
      if (!val) {
        this.form = cloneDeep(paramsData);
      }
    }
  },
  created() {
    this.getAllpoints();
    this.initData();
  },
  methods: {
    //条件描述编辑时
    handlechang(value, label) {
      this.conditionExpressionObj[label] = value;
    },
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        this.conditionExpressionObj = JSON.parse(this.rowData.conditionExpressionValue);
        const { planList } = this.rowData;
        this.form = {
          planList
        };
        this.showExpertProcessControlDecision(this.rowData);
      }
    },
    initLabel(item) {
      let i = '';
      // 提取序号
      const match = String(item).match(/^(\d+、)/);
      if (match) {
        i = match[0];
      }
      // 提取 `value`，去除开头的序号
      const value = String(item).replace(/^(^\d+、)/, '');
      // 构造并返回新对象
      return { i, value };
    },
    initValue(item) {
      // 提取数值和单位
      const match = String(item).match(/^(\d+(\.\d+)?)(\D+)/);
      // 如果匹配成功
      if (match) {
        const value = match[1]; // 数值
        const unit = match[3]; // 单位
        // 构造并返回新对象
        return { value, unit };
      } else {
        // 如果不匹配，默认返回空对象或抛出错误
        return {};
      }
    },
    //决策因素详情列表
    async showExpertProcessControlDecision(row) {
      let params = {
        controlId: row.id
      };
      const { resultData } = await getExpertProcessControlDecisionByControlId(params);
      this.modalListData = resultData.map(item => {
        let planIdLists = item.planIds?.split(',');
        return {
          ...item,
          planIds: row.planList.map(item => {
            // 查找对应 ID 的数据项
            const checked = planIdLists?.includes(item.id);
            // 如果找到，返回对应的 name 值
            return { id: item.id, measures: item.measures, checked };
          })
        };
      });
    },
    initConditionDescStrList(row) {
      let arr = row.conditionDescStrList.map(item => {
        let own = this.conditionExpressionObj[item.splitStr];
        let devicePointObj = this.devicePointList.find(devicePoint => own === devicePoint.value);
        return {
          ...item,
          value: own ? own : item.splitStr.replace(/<br\/>/g, ''),
          label: devicePointObj ? devicePointObj.label : undefined
        };
      });
      let result = arr.map(item => {
        return {
          ...item,
          value: item.value.includes('或者') ? item.value.replace('或者', '或者<br/>') : item.value
        };
      });
      return result;
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
    cancel() {
      this.visible = false;
      this.form = cloneDeep(paramsData);
      this.$emit('cancel');
    },
    updataPlanList(val) {
      this.form.planList = val;
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            ...this.rowData,
            planList: this.form.planList,
            type: this.type,
            conditionExpressionValue: JSON.stringify(this.conditionExpressionObj)
          };
          let { status } = await addOrUpdateExpertProcessControl(params);
          if (status === 'complete') {
            let message = this.runTimeObj ? '编辑成功' : '新增成功';
            this.$message.success(message);
            this.visible = false;
            this.loading = false;
            this.form = cloneDeep(paramsData);
            this.$emit('cancel', true);
          } else {
            return false;
          }
        } else {
          return false;
        }
      });
    }
  }
};
</script>

<style lang="less" scoped>
.config-wrap {
  max-height: 70vh;
  overflow: auto;
}
/deep/.wpg-form-item-label {
  width: 150px;
}
.form-footer {
  position: absolute;
  right: 20px;
  bottom: 20px;
}
.af-time {
  position: relative;

  &::after {
    content: '年';
    font-weight: 500;
    font-size: 14px;
    color: var(--supply-color-third);
    position: absolute;
    right: -20px;
    top: 7px;
  }
}
</style>
