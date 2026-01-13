<template>
  <w-select
    :value="idList"
    style="width: 100%;max-height: 150px"
    :mode="mode"
    :disabled="disabled"
    :showSearch="true"
    :placeholder="placeholder"
    :maxTagTextLength="maxTagTextLength"
    :maxTagCount="maxTagCount"
    :optionFilterProp="optionFilterProp"
    :getPopupContainer="triggerNode => triggerNode.parentNode"
    @search="fetchList"
    @popupScroll="handlePopupScroll"
    @change="handleChange"
    @select="handleSelect"
    @blur="handleBlur"
  >
    <w-select-option
      v-for="item in selectList"
      :key="item[replaceFields.key]"
      :value="item[replaceFields.value]"
    >
      {{ item[replaceFields.title] }}
    </w-select-option>
  </w-select>
</template>

<script>
/* eslint-disable no-invalid-this */
import debounce from 'lodash.debounce';
const LOAD_NUM = 15; // 加载条数

export default {
  name: 'VirSelect',

  props: {
    max: {
      type: Number,
      default: 999
    },
    mode: {
      type: String,
      default: 'default'
    },
    optionFilterProp: {
      type: String,
      default: 'children'
    },
    placeholder: {
      type: String,
      default: '请选择'
    },
    maxTagTextLength: {
      type: Number
    },
    maxTagCount: {
      type: Number
    },
    showMaxMessage: {
      type: Boolean,
      default: true
    },
    replaceFields: {
      type: Object,
      default: () => {
        return {
          children: 'children',
          title: 'title',
          key: 'key',
          value: 'value'
        };
      }
    },
    listData: {
      type: Array,
      default: () => []
    },
    value: {
      type: [Array, String]
    },
    disabled: {
      type: Boolean,
      default: false
    }
  },

  data() {
    this.fetchList = debounce(this.loadList, 150);

    return {
      searchVal: '',
      selectList: [],
      idList: [] // 关联用户
    };
  },

  watch: {
    value() {
      let last = JSON.stringify(this.idList);
      let current = JSON.stringify(this.value);
      this.idList = [...this.value];

      if (last !== current) {
        this.loadList();
      }
    },

    listData() {
      this.loadList(this.searchVal);
    }
  },

  mounted() {
    this.idList = [...this.value];
    this.loadList();
  },

  methods: {
    loadList(value = '') {
      this.searchVal = value;

      let selectedArr = [];
      let filterList = [];
      let idList = this.idList || [];
      if (!Array.isArray(idList)) {
        idList = [idList];
      }

      this.listData.forEach(item => {
        if (idList.includes(item[this.replaceFields.value])) {
          selectedArr.push(item);
        } else {
          let bool = item[this.replaceFields.title].toLowerCase().indexOf(value.toLowerCase()) >= 0;
          if (value) {
            if (bool) {
              filterList.push(item);
            }
          } else {
            filterList.push(item);
          }
        }
      });

      this.filterList = filterList;

      this.selectList = selectedArr.concat(filterList).slice(0, LOAD_NUM);
    },

    handlePopupScroll: debounce(function() {
      this.loadMoreData(this.filterList);
      // if (this.searchVal === '') {
      //   this.loadMoreData(this.listData);
      // } else {
      //   this.loadMoreData(this.filterList);
      // }
    }, 100),

    // 加载更多数据到select框
    loadMoreData(dataList) {
      const renderedLen = this.selectList.length; // 已渲染的下拉列表长度
      const totalLen = dataList.length; // 当前数据源的长度
      let addList = [];
      if (renderedLen < totalLen) {
        if (renderedLen + LOAD_NUM <= totalLen) {
          addList = dataList.slice(renderedLen, renderedLen + LOAD_NUM);
        } else {
          addList = dataList.slice(renderedLen, renderedLen + (totalLen % LOAD_NUM));
        }
        this.selectList = this.selectList.concat(addList);
      }
    },

    handleSelect() {
      if (this.searchVal) {
        this.searchVal = '';
      }

      this.$nextTick(() => {
        this.loadList(this.searchVal);
      });
    },

    handleChange(value) {
      this.$emit('input', value);
      this.$emit('change', value);
    },

    handleBlur() {
      this.searchVal = '';
      setTimeout(() => {
        this.loadList(this.searchVal);
      }, 100);
    }
  }
};
</script>
