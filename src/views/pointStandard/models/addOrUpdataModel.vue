<template>
  <w-modal
    :destroyOnClose="true"
    :title="runTimeObj ? '编辑' : '新增'"
    :visible="visible"
    height="80vh"
    width="650px"
    centered
    :maskClosable="false"
    @cancel="cancel"
    @ok="handlerFrom"
  >
    <w-row class="config-wrap">
      <w-form-model
        ref="form"
        :model="form"
        :rules="rules"
        :labelCol="{ span: 10 }"
        :wrapperCol="{ span: 14 }"
      >
        <w-col span="24">
          <w-form-model-item label="选择污水厂" prop="waterPlantId">
            <FactorySelect v-model.trim="form.waterPlantId" autoSelect></FactorySelect>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="监测量名称" prop="pointName">
            <w-select
              showSearch
              allowClear
              :filterOption="false"
              :options="renderedOptions"
              v-model="form.pointName"
              placeholder="请选择\输入监测量名称"
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
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item :label="typeLabel" prop="type">
            <w-select v-model="form.type" placeholder="请选择" allowClear>
              <w-select-option v-for="item in typeList" :value="item.value" :key="item.value"
                >{{ item.label }}
              </w-select-option>
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24" v-if="warnLevelVisible">
          <w-form-model-item :label="warnLabel" prop="warnLevel">
            <w-row>
              <w-select v-model="form.warnLevel" allowClear>
                <w-select-option
                  v-for="item in warnLevelList"
                  :key="item.value"
                  :value="item.value"
                >
                  {{ item.label }}
                </w-select-option>
              </w-select>
            </w-row>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="输入警戒域" prop="internalReflux">
            <RangeForm
              :form="form"
              ref="range1Form"
              :fieldNameList="fieldNameListC"
              :operatorList="operatorList"
            ></RangeForm>
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import { mapState } from 'vuex';
import { cloneDeep, debounce } from 'lodash-es';
import FactorySelect from '@/components/factory-select/index.vue';
import RangeForm from './configModel.vue';
import { addPointStandard } from '@/api/pointStandard';
import { allPointList } from '@/api/manage';
const paramsData = {
  waterPlantId: '',
  pointName: undefined,
  type: undefined,
  warnLevel: undefined,
  warnOpt: undefined,
  warnMin: undefined,
  warnMax: undefined
};
const LOAD_NUM = 100;
export default {
  name: 'addOrUpdataModel',
  components: {
    FactorySelect,
    RangeForm
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
    operatorList: {
      type: Array,
      default: () => {}
    },
    tabVal: {
      type: Number,
      default: 1
    }
  },
  computed: {
    ...mapState('dict', ['factory_standard', 'national_standard']),
    typeLabel() {
      return this.tabVal === 1 ? `${this.factory_standard}/${this.national_standard}` : '过程/出口';
    },
    warnLabel() {
      return `选择${this.factory_standard}警戒等级`;
    },
    warnLevelVisible() {
      return this.form.type == 1 ? true : false;
    },
    typeList() {
      return this.tabVal === 1
        ? [
            {
              label: this.factory_standard,
              value: 1
            },
            {
              label: this.national_standard,
              value: 2
            }
          ]
        : [
            {
              label: '过程',
              value: 3
            },
            {
              label: '出口',
              value: 4
            }
          ];
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      form: cloneDeep(paramsData),
      visible: false,
      rules: {
        waterPlantId: [{ required: true, message: '请选择水厂' }],
        pointName: [{ required: true, message: '请选择/输入监测量名称' }]
      },
      renderedOptions: [],
      pointsList: [],
      searchVal: '',
      filterDataList: [],
      fieldNameListC: ['warnOpt', 'warningValue', 'warnMin', 'warnMax'],
      warnLevelList: []
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.initData();
      }
    },
    runTimeObj(val) {
      if (!val) {
        this.form = cloneDeep(paramsData);
      }
    }
  },
  created() {
    this.getAllpoints();
    this.getWarnLevel();
  },
  methods: {
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        this.form = {
          ...this.rowData
        };
      }
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
    async getWarnLevel() {
      let { status, resultData } = await this.$http.get(`/sysDict/sysDictListByCode/factory_level`);
      if (status) {
        this.warnLevelList = resultData?.map(item => {
          return {
            label: item.dictValue,
            value: item.dictCode
          };
        });
      }
    },
    cancel() {
      this.visible = false;
      this.form = cloneDeep(paramsData);
      this.$emit('cancel');
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = {
            ...this.form
          };
          let { status } = await addPointStandard(params);
          if (status === 'complete') {
            let message = this.runTimeObj ? '编辑成功' : '新增成功';
            this.$message.success(message);
            this.visible = false;
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
