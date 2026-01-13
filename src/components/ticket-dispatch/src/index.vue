<template>
  <div class="ticket-dispatch" :class="{ 'ticket-dispatch-preview': readonly }">
    <div class="ticket-dispatch-type">
      <w-radio-group
        v-if="!readonly"
        v-model="dealUserSetting"
        :disabled="disabled"
        @change="handleDealUserSettingChange"
      >
        <w-radio v-for="item in dealUserType" :key="item.code" :value="item.code">
          {{ item.name }}
        </w-radio>
      </w-radio-group>
    </div>
    <div class="ticket-dispatch-content">
      <div class="item-container" v-if="readonly">{{ groupUserNames }}</div>
      <div v-else>
        <div v-if="dealUserSetting === 'user'" class="ticket-dispatch-item">
          <div class="item-container" @click="openTreeTrans">
            <w-select
              v-model="dealUser"
              mode="multiple"
              placeholder="请选择执行人员"
              :disabled="disabled"
              :max-tag-count="10"
              :list-data="allUsers"
              :getPopupContainer="getPopupContainer"
              :open="false"
              class="user-trans"
            >
              <w-select-option v-for="item in allUsers" :key="item.id" :value="item.id">
                {{ item.name }}
              </w-select-option>
            </w-select>
          </div>
        </div>
        <div v-if="dealUserSetting === 'group'" class="ticket-dispatch-item">
          <div class="item-container">
            <w-tree-select
              v-model="dealGroup"
              :disabled="disabled"
              show-search
              multiple
              allow-clear
              style="width: 100%"
              :dropdown-style="{ maxHeight: '200px', overflow: 'auto' }"
              :tree-data="allGroups"
              :getPopupContainer="getPopupContainer"
              treeNodeFilterProp="label"
              placeholder="请选择群组"
              @change="handleChange"
            />
          </div>
        </div>
      </div>
    </div>
    <transfer
      ref="dealUserTrans"
      :selected-ids.sync="dealUser"
      @update:selected-ids="handleChange"
      :trans-disabled="disabled"
      :ticketNo="ticketNo"
      :projectName="projectName"
      :projectId="projectId"
    />
  </div>
</template>

<script>
import Transfer from './Transfer.vue';
import { searchUserTree, getGroup } from '../api';

function generateGroupData(list) {
  let groupTree = [];

  list.forEach(item => {
    groupTree.push({
      id: item.id,
      key: item.id,
      label: item.name,
      value: item.id,
      title: item.groupName,
      children: item.children ? generateGroupData(item.children) : null
    });
  });

  return groupTree;
}

function getAllGroups(list) {
  let groups = [];

  function getGroup(arr) {
    arr.forEach(item => {
      groups.push(item);

      if (item.children) {
        getGroup(item.children);
      }
    });
  }

  getGroup(list);

  return groups;
}

// 扁平数据
let transferDataSource = [];
function flatten(list = []) {
  list.forEach(item => {
    transferDataSource.push(item);
    flatten(item.children);
  });
}

export default {
  name: 'TicketDispatch',

  components: {
    Transfer
  },

  props: {
    status: {
      type: String,
      defualt: 'edit'
    },

    value: {
      type: Array,
      default: () => []
    },

    getPopupContainer: {
      type: Function
    },

    devices: {
      type: Array,
      default: () => []
    },
    ticketNo: {
      type: String,
      default: ''
    },
    projectNames: {
      type: String,
      default: ''
    },
    projectIds: {
      type: String,
      default: ''
    }
  },

  data() {
    return {
      dealUserSetting: 'user',
      dealUserType: [
        { name: '个人', code: 'user' },
        { name: '群组', code: 'group' }
      ],
      allUsers: [],
      allGroups: [],
      dealUser: [],
      dealGroup: [],
      projectId: [],
      projectName: [] //设备联动选中的项目名
    };
  },

  computed: {
    disabled() {
      return this.status === 'disabled' || this.status === 'preview';
    },
    readonly() {
      return this.status === 'preview';
    },
    dealUserSettingName() {
      let dealSetting = this.dealUserType.find(v => v.code === this.dealUserSetting);

      return dealSetting ? dealSetting.name : '';
    },
    groupUserNames() {
      let list = (this.value || []).map(item => {
        return item.name;
      });

      return list.join('、');
    }
  },

  watch: {
    value() {
      let list = this.value || [];
      this.splitGroupAndUser(list || []);
    },
    devices: {
      handler(val) {
        this.projectName = [];
        this.projectId = [];
        val.forEach(item => {
          this.projectId.push(item.projectId);
          this.projectName.push(item.projectName);
        });
      },
      immediate: true,
      deep: true
    },
    projectNames: {
      handler(val) {
        if (val) {
          this.projectName = val.split(',');
        }
      },
      immediate: true,
      deep: true
    },
    projectIds: {
      handler(val) {
        if (val) {
          this.projectId = val;
        }
      },
      immediate: true,
      deep: true
    },
    projectId: {
      handler(val) {
        this.getAllUser();
      },
      deep: true
    },
    ticketNo: {
      handler(val) {
        this.getAllUser();
      },
      deep: true
    }
  },

  mounted() {
    this.getAllUser();
    this.getGroupAndUse();
  },

  methods: {
    async getAllUser() {
      const ret = await searchUserTree({
        flag: false,
        groupFlag: false,
        projectName: this.projectName,
        projectId: this.projectId,
        ticketNo: this.ticketNo
      });
      if (ret.status === 'complete') {
        this.allUsers = this.handleTreeData([...ret.resultData]);
        // 初始化时如果没有选中任何用户，且当前是个人模式，则默认选中所有用户
        this.initDefaultUsers();
      }
    },
    handleTreeData(data = []) {
      let transferDataSource = [];
      function flatten(list) {
        list.forEach(item => {
          // 只添加真正的用户（没有children或children为空的项）
          if (!item.children || item.children.length === 0) {
            transferDataSource.push({
              data: item.data,
              id: item.id,
              label: item.name,
              name: item.name,
              parentId: item.parentId,
              key: item.id,
              title: item.name,
              checkable: false,
              selectable: false
            });
          }
          // 递归处理子项
          if (item.children && item.children.length > 0) {
            flatten(item.children);
          }
        });
      }
      flatten(data);
      return transferDataSource;
    },

    async getGroupAndUse() {
      let ret = await getGroup({
        disableFlag: '0',
        name: '',
        userId: '',
        projectName: this.projectName,
        page: {
          current: 1,
          size: 100
        }
      });
      if (ret.status === 'complete') {
        let allGroups = ret?.resultData || [];
        this.allGroups = Object.freeze(generateGroupData(allGroups));
        this.groupList = getAllGroups(this.allGroups);
      }
    },

    splitGroupAndUser(list) {
      let groupList = [];
      let userList = [];
      let dealUserSetting = 'user';

      list.forEach(item => {
        if (item.type === '99') {
          dealUserSetting = 'user';
          userList.push(item.id);
        } else {
          dealUserSetting = 'group';
          groupList.push(item.id);
        }
      });

      if (list.length) {
        this.dealUserSetting = dealUserSetting;
      }
      this.dealUser = userList;
      this.dealGroup = groupList;
    },

    unionGroupAndUser(groups, users) {
      let groupUsers = [];

      users.forEach(item => {
        let user = this.allUsers.find(o => o.id === item);
        if (user) {
          groupUsers.push({
            name: user.name,
            id: user.id,
            type: '99'
          });
        }
      });
      groups.forEach(item => {
        let group = this.groupList.find(o => o.id === item);
        if (group) {
          groupUsers.push({
            name: group.title,
            id: group.id,
            type: '1'
          });
        }
      });

      return groupUsers;
    },

    handleDealUserSettingChange() {
      if (this.dealUserSetting === 'user') {
        this.dealGroup = [];
      }
      if (this.dealUserSetting === 'group') {
        this.dealUser = [];
      }
      this.handleChange();
    },

    handleChange() {
      let notExistArr = [];
      // 找到不存在的元素下标
      this.dealUser.forEach((item, index) => {
        let existIndex = null;
        existIndex = this.allUsers.findIndex(o => {
          return o.id === item;
        });
        if (existIndex === -1) {
          notExistArr.push(index);
        }
      });
      // 删除
      notExistArr.forEach(i => {
        this.dealUser.splice(i, 1);
      });
      let list = this.unionGroupAndUser(this.dealGroup, this.dealUser);
      this.$emit('input', list);
    },
    openTreeTrans() {
      if (this.disabled) return;
      this.$refs.dealUserTrans && (this.$refs.dealUserTrans.visible = true);
    },

    initDefaultUsers() {
      // 只有在个人模式下，且没有初始值，且用户列表不为空时才默认选中所有用户
      if (
        this.dealUserSetting === 'user' &&
        (!this.value || this.value.length === 0) &&
        this.allUsers.length > 0
      ) {
        // 确保在个人模式下清空群组选择
        this.dealGroup = [];
        // 选中所有用户（现在allUsers只包含真正的用户）
        this.dealUser = this.allUsers.map(user => user.id);
        console.log('111', this.dealUser);
        this.handleChange();
      }
    }
  }
};
</script>
<style lang="less" scoped>
.user-trans {
  /deep/.wpg-select-selection__choice__remove {
    display: none !important;
  }
}
.ticket-dispatch-type {
  width: 150px !important;
  margin: auto;
}
</style>
