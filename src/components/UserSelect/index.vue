<template>
  <w-select
    :value="userIdList"
    style="width: 100%;"
    :mode="mode"
    allow-clear
    :placeholder="placeholder"
    :maxTagTextLength="maxTagTextLength"
    :maxTagCount="maxTagCount"
    :optionFilterProp="optionFilterProp"
    option-filter-prop="label"
    @search="fetchUser"
    @popupScroll="handlePopupScroll"
    @change="handleChange"
    @select="handleSelect"
    @blur="handleBlur"
  >
    <w-select-option
      v-for="item in selectUsers"
      :key="item.id"
      :value="item.id"
      :label="item.userName"
    >
      {{ item.userName }}
    </w-select-option>
  </w-select>
</template>

<script>
/* eslint-disable no-invalid-this */
import debounce from 'lodash.debounce';
import { getAllUser } from '@/api/work';
const LOAD_NUM = 30; // 加载条数

export default {
  name: 'UserSelect',

  props: {
    max: {
      type: Number,
      default: 999
    },
    mode: {
      type: String,
      default: 'multiple'
    },
    optionFilterProp: {
      type: String,
      default: 'children'
    },
    placeholder: {
      type: String,
      default: '请选择用户'
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
    value: {
      type: [Array, String]
    },
    userList: {
      type: Array
    },
    hiddenUserList: {
      type: Array,
      default: () => []
    }
  },

  data() {
    this.fetchUser = debounce(this.loadUser, 150);

    return {
      searchVal: '',
      selectUsers: [],
      userIdList: [] // 关联用户
    };
  },

  watch: {
    value() {
      this.userIdList = this.value;
    }
  },

  mounted() {
    this.userIdList = this.value;

    this.getAllUser();
  },

  methods: {
    async getAllUser() {
      let ret = await getAllUser();
      let allUsers = ret.resultData || [];
      if (this.hiddenUserList.length) {
        allUsers = allUsers.filter(o => !this.hiddenUserList.includes(o.id));
      }

      this.allUsers = allUsers;
      this.loadUser();
    },

    loadUser(value = '') {
      this.searchVal = value;

      let selectedArr = [];
      let filterUserList = [];
      let userIdList = this.userIdList || [];
      if (!Array.isArray(userIdList)) {
        userIdList = [userIdList];
      }
      let unknowUserList = this.handleUnknowUser();
      let allUsers = this.allUsers || [];

      allUsers.forEach(item => {
        if (userIdList.includes(item.id)) {
          selectedArr.push(item);
        } else {
          let bool = item.userName.toLowerCase().indexOf(value.toLowerCase()) >= 0;
          if (value) {
            if (bool) {
              filterUserList.push(item);
            }
          } else {
            filterUserList.push(item);
          }
        }
      });

      this.filterUserList = filterUserList;

      this.selectUsers = selectedArr
        .concat(unknowUserList)
        .concat(filterUserList)
        .slice(0, LOAD_NUM);
    },

    handleUnknowUser() {
      let users = [];

      if (this.userList && this.userList.length) {
        this.userList.forEach(item => {
          let allUsers = this.allUsers || [];
          let user = allUsers.find(o => o.id === item.id);

          if (!user) {
            users.push({
              id: item.id,
              userName: item.name
            });
          }
        });
      }

      return users;
    },

    handlePopupScroll: debounce(function() {
      if (this.searchVal === '') {
        this.loadMoreData(this.allUsers);
      } else {
        this.loadMoreData(this.filterUserList);
      }
    }, 400),

    // 加载更多数据到select框
    loadMoreData(dataList) {
      const renderedLen = this.selectUsers.length; // 已渲染的下拉列表长度
      const totalLen = dataList.length; // 当前数据源的长度
      let addList = [];
      if (renderedLen < totalLen) {
        if (renderedLen + LOAD_NUM <= totalLen) {
          addList = dataList.slice(renderedLen, renderedLen + LOAD_NUM);
        } else {
          addList = dataList.slice(renderedLen, renderedLen + (totalLen % LOAD_NUM));
        }
        this.selectUsers = this.selectUsers.concat(addList);
      }
    },

    handleSelect() {
      if (this.searchVal) {
        const selectedArr = []; // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const restList = []; // 从数据源中过滤出其他的值，返回一个数组
        let unknowUserList = this.handleUnknowUser();
        let allUsers = [...unknowUserList, ...this.allUsers];
        allUsers.forEach(item => {
          let bool = this.userIdList.includes(item.id);

          if (bool) {
            selectedArr.push(item);
          } else {
            restList.push(item);
          }
        });
        const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        this.selectUsers = newList; // 更新已渲染的下拉列表
        this.allUsers = selectedArr.concat(restList); // 更新数据源
        this.searchVal = '';
      }
    },

    handleChange(value) {
      if (value.length <= this.max) {
        this.userIdList = value;
        let unknowUserList = this.handleUnknowUser();

        this.nodes = value.map(id => {
          let data = this.allUsers.find(item => item.id === id);
          if (!data) {
            data = unknowUserList.find(item => item.id === id);
          }
          return {
            type: '99',
            id: data.id,
            name: data.userName
          };
        });
      } else {
        this.showMaxMessage && this.$message.warning(`最多可选${this.max}个人`);
      }

      this.$emit('change', this.userIdList, this.nodes, {
        value
      });
      this.$emit('input', this.userIdList);
    },

    handleBlur() {
      this.searchVal = '';
      setTimeout(() => {
        this.loadUser(this.searchVal);
      }, 100);
    }
  }
};
</script>
