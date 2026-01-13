<!--
 * @Description: 监测量配置页面
 * @Author: undefined
 * @Date: undefined
 * @LastEditTime: 2024-07-04 09:04:15
 * @LastEditors: wangyr
-->

<template>
  <w-select
    v-model="selectList"
    mode="multiple"
    :filterOption="false"
    :options="renderedOptions"
    placeholder="请选择监测量"
    style="width: 100%"
    :maxTagTextLength="4"
    maxTagPlaceholder="..."
    :maxTagCount="3"
    :autoClearSearchValue="true"
    dropdownClassName="supervise-set-select"
    @search="handleSearch"
    @popupScroll="handleScroll"
    @blur="handleChange"
    @change="handleChange"
    @select="handleSelect"
    @dropdownVisibleChange="dropDownSelect"
  >
  </w-select>
</template>

<script>
import debounce from 'lodash/debounce';
import { mapState, mapMutations } from 'vuex';
import cloneDeep from 'lodash.clonedeep';

const LOAD_NUM = 100; // 加载条数--可自定义
export default {
  name: 'pointSelect',
  components: {},
  props: {
    rawPoints: {
      type: Array,
      default: () => []
    },
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      pointsList: [],
      now: 'page',
      formSearch: {
        keyword: '',
        type: '',
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
      formData: {},
      loading: false,
      selectList: [],
      renderedOptions: [],
      searchVal: ''
    };
  },
  watch: {
    rawPoints: {
      handler(val) {
        this.pointsList = cloneDeep(this.rawPoints);
        this.renderedOptions = this.pointsList;
      },
      immediate: true
    },
    value: {
      handler(val) {
        this.selectList = cloneDeep(val)?.map(item => item.code) || [];
      },
      immediate: true
    }
  },

  methods: {
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
    handleChange(val) {
      let newList = this.selectList.map(item => {
        const pointObj = this.findPoint(item);
        return {
          name: pointObj.label || '',
          code: item,
          defaultValue: pointObj.defaultValue ?? null,
          pointObj
        };
      });
      this.$emit('input', newList);
      this.$emit('change', newList);
    },
    findPoint(code) {
      return this.rawPoints.find(item => item.value === code) || {};
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      console.log('kkk',val)
      if (this.searchVal) {
        const selectedArr = this.pointsList.filter(item => item === val); // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const restList = this.pointsList.filter(item => item !== val); // 从数据源中过滤出其他的值，返回一个数组
        // const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        // this.renderedOptions = newList; // 更新已渲染的下拉列表
        this.pointsList = selectedArr.concat(restList); // 更新数据源
        // this.searchVal = ''; // 因为触发handleSelect函数时，会自动清空用户输入的内容。因此，searchVal需要重置。
      }
    }
  }
};
</script>

<style scoped lang="less"></style>
