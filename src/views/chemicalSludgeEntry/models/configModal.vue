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
        <w-form-model-item v-if="type === '1'" label="所属仓库" prop="depotId">
          <w-select v-model="form.depotId" @focus="checkFactory(form.waterPlantId)">
            <w-select-option
              v-for="(item, i) in depotList"
              :key="item.id + '' + i"
              :value="item.id"
              >{{ item.depotName }}</w-select-option
            >
          </w-select>
        </w-form-model-item>
        <w-col span="24" v-if="type === '1'">
          <w-form-model-item label="构筑物名称" prop="placeId">
            <w-select v-model="form.placeId" placeholder="请选择构筑物名称" showSearch allowClear>
              <w-select-option
                v-for="item in structureList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item v-if="type === '1'" label="药剂名称" prop="smallType">
            <w-select v-model="form.smallType" @focus="checkEntry(form.waterPlantId, form.depotId)">
              <w-select-option
                v-for="item in informationList"
                :key="item.value"
                :value="item.value"
                >{{ item.label }}</w-select-option
              >
            </w-select>
          </w-form-model-item>
          <w-form-model-item v-if="type === '2'" label="污泥名称" prop="entryName">
            <w-input placeholder="请选输入名称" v-model="form.entryName" />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item :label="type === '2' ? '重量(kg)' : '重量'" prop="entryValue">
            <w-input-number
              id="inputNumber"
              v-model="form.entryValue"
              :min="0"
              style="width: 100%;"
              placeholder="请输入重量"
              :disabled="!!runTimeObj"
            />
          </w-form-model-item>
        </w-col>
        <w-col span="24">
          <w-form-model-item label="数据录入时间" prop="dataTime">
            <w-date-picker
              v-model="form.dataTime"
              allowClear
              valueFormat="YYYY-MM-DD HH:mm:ss"
              style="width: 100%"
            />
          </w-form-model-item>
        </w-col>
      </w-form-model>
    </w-row>
  </w-modal>
</template>

<script>
import { cloneDeep, debounce } from 'lodash-es';
import { sysDictListByCode } from '@/api/manage';
import { getBeseDepotList } from '@/api/warehouse.js';
import FactorySelect from '@/components/factory-select/index.vue';
import { addDataList, getForecastCodeList } from '@/api/reportRecord';
const paramsData = {
  waterPlantId: '',
  placeId: undefined,
  depotId: '',
  smallType: '',
  modelPointName: undefined, //模型监测量
  entryName: '',
  entryValue: '',
  dataTime: null
};
const LOAD_NUM = 100;
export default {
  name: 'ConfigEdit',
  components: {
    FactorySelect
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
    structureList: {
      type: Array,
      default: () => []
    },
    //1.加药 2.排泥
    type: {
      type: String
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      form: cloneDeep(paramsData),
      visible: false,
      pointsList: [], //监测量
      renderedOptions: [], //
      depotList: [],
      informationList: [],
      informationName: {},
      searchVal: '', //搜索词
      filterDataList: [],
      rules: {
        waterPlantId: [{ required: true, message: '请选择水厂' }],
        dataTime: [{ required: true, message: '请选择数据录入时间' }],
        depotId: [{ required: true, message: '请选择仓库' }],
        entryValue: [{ required: true, message: '请输入值', trigger: 'blur' }],
        smallType: [{ required: true, message: '请选择物资' }],
        entryName: [{ required: true, message: '请输入物资名称', trigger: 'blur' }]
      }
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
    },
    'form.waterPlantId'(val) {
      this.getForecastCodeList(val);
      this.getDepotList(val);
    }
  },
  mounted() {
    this.sysDictListByCode('chemicals', 'information');
    this.form.dataTime = this.$moment().format('YYYY-MM-DD HH:mm:ss');
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
      this[`${data}Name`] = this[`${data}List`].reduce((acc, item) => {
        acc[item.dictValue] = item.dictName;
        return acc;
      }, {});
    },
    checkFactory(orgId) {
      if (!orgId) {
        this.$message.warn('请先选择污水厂');
      }
    },
    checkEntry(orgId, id) {
      if (!orgId && !id) {
        this.$message.warn('请先选择污水厂和仓库');
      }
    },
    // 获取仓库列表下拉
    getDepotList(waterPlantId) {
      let vo = {
        waterPlantId
      };
      if (waterPlantId) {
        getBeseDepotList(vo).then(res => {
          this.depotList = res.resultData.records;
        });
      }
    },
    initData() {
      if (!(this.rowData === null) && this.runTimeObj) {
        this.form = {
          ...this.rowData
        };
        console.log('this.form', this.form);
      }
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
    cancel() {
      this.visible = false;
      this.$emit('cancel');
    },
    handlerFrom() {
      this.$refs.form.validate(async valid => {
        if (valid) {
          let params = null;
          if (this.type === '2') {
            params = {
              ...this.form,
              bigType: this.type,
              entryName: this.form.entryName
            };
          } else {
            const entry = this.informationList.find(item => item.value === this.form.smallType);
            const entryName = entry.label;
            params = {
              ...this.form,
              bigType: this.type,
              entryName
            };
          }
          let { status } = await addDataList(params);
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
