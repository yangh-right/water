<!--  -->
<template>
  <div class="deviceTree">
    <factory-select
      style="width: 100%"
      v-model="waterPlantId"
      autoSelect
      @change="getTree"
    ></factory-select>
    <w-divider></w-divider>
    <w-input-search
      v-model="searchInput"
      placeholder="请输入构筑物名称"
      @search="handleSearchTree"
    />
    <div v-loading="loading" class="tree">
      <w-empty v-if="treeData.length === 0" />
      <w-tree
        v-else
        v-model="checkedKeys"
        show-icon
        :checkable="checkable"
        :tree-data="treeData"
        :expanded-keys.sync="expandedKeys"
        :selected-keys.sync="selectedKeys"
        @check="onCheck"
        @select="onSelect"
      >
        <template slot="handle" slot-scope="item">
          <span>{{ item.title }}</span>
          <!-- <w-icon
            v-if="treeType === 'device'"
            :id="'node' + uuid()"
            type="ic_equipment_pump"
            :class="[item.data.onlineStatus == '1' ? 'supply-text-success' : 'supply-text-invalid']"
            :style="{ 'margin-left': '3px' }"
          /> -->
          <w-icon
            v-if="treeType === 'video'"
            :id="'node' + uuid()"
            type="ic_videocam"
            :class="[item.data.onlineStatus == '1' ? 'supply-text-success' : 'supply-text-invalid']"
            :style="{ 'margin-left': '3px' }"
          />
        </template>
      </w-tree>
    </div>
  </div>
</template>

<script>
import FactorySelect from '@/components/factory-select/index.vue';
import uuid from '@/utils/uuid';

export default {
  name: 'deviceTree',
  components: { FactorySelect },
  props: {
    treeType: {
      // device, station, video, tank
      type: String,
      default: 'device'
    },
    isReturnObj: {
      type: Boolean,
      default: false
    },
    checkable: {
      type: Boolean,
      default: false
    },
    pageSiteId: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      searchInput: '',
      expandedKeys: [],
      checkedKeys: [],
      selectedKeys: [],
      loading: false,
      treeData: [],
      currentNodeKey: '',
      waterPlantId: undefined,
      firstload: 0,
      pointList: [],
      deviceIds: [],
      uuid
    };
  },
  watch: {
    waterPlantId(newV) {
      this.handleInit();
    }
  },
  methods: {
    // 判断路由是否带参，并且限定执行一次
    handleInit() {
      this.pointList = [];
      let deviceId = this.$route.query.deviceId?.split(',') || [];
      let pointNames = this.$route.query.pointNames?.split(',') || [];
      pointNames.forEach((item, index) => {
        this.pointList.push({ pointName: item, deviceId: deviceId[index] });
      });
      if (this.$route.query.waterPlantId) this.waterPlantId = this.$route.query.waterPlantId;
      if (this.pointList.length || !this.firstload) {
        this.getTree();
        this.firstload++;
      }
    },
    //搜索监测量
    handleSearchTree() {
      this.getTree();
    },
    //更改树的可选属性
    changeTreeData(data) {
      data.forEach(v => {
        v.title = v.name;
        v.key = v.id;
        v.checkable = true;
        if (v.children.length <= 0) {
          v.scopedSlots = { title: 'handle' };
        }
        if (v.type == '4') {
          this.deviceIds.push(v.id);
        }
        v.children = this.changeTreeData(v.children);
      });
      return data;
    },
    //获取设备树的数据
    async getTree() {
      try {
        this.loading = true;
        this.treeData = [];
        let url =
          this.treeType === 'video'
            ? '/place/getLocationVideoTree'
            : '/place/getLocationDeviceTree';
        let { resultData } = await this.$http.get(
          `${url}?waterPlantId=${this.waterPlantId}&keywords=${this.searchInput}`
        );
        this.changeTreeData(resultData);
        this.treeData = resultData;
        this.handleData();
      } catch (e) {
        console.log(e);
      } finally {
        this.loading = false;
      }
    },
    //处理数据，判断是路由的id还是默认选择第一项
    handleData() {
      //  默认选中第一个设备
      let defaultKey = [];
      // 默认选中指定设备
      if (this.pageSiteId) {
        defaultKey.push(this.pageSiteId);
      }
      this.chooseFirstDevice(this.treeData[0], defaultKey);

      //如果有路由信息，则找到对应的key
      if (this.pointList.length) {
        this.pointList.forEach(item => {
          defaultKey.push(item.deviceId)
        })
        this.pointList = [];
      }
      this.expandedKeys = defaultKey;
      this.checkedKeys = defaultKey;
      this.selectedKeys = defaultKey;
      this.onCheck();
    },
    chooseFirstDevice(data, defaultKey) {
      if (data.children && data.children.length > 0) {
        this.chooseFirstDevice(data.children[0], defaultKey);
      } else {
        defaultKey.push(data.key);
      }
    },
    //点击文字勾选
    onSelect(key, info) {
      if (info.node.selectable) {
        this.checkedKeys = [info.node.eventKey];
        this.onCheck();
      }
    },
    onCheck() {
      let checkArr = this.checkData(this.checkedKeys);
      if (this.isReturnObj) {
        let obj = {
          selectedKeys: this.checkedKeys,
          itemData: checkArr.length > 0 ? checkArr[0] : null
        };
        this.$emit('onTreeChecked', obj);
      } else {
        let checkDeviceIds = this.handleCheckData(this.checkedKeys, this.treeData);
        this.$emit('onCheck', checkDeviceIds, this.treeData);
      }
    },
    handleCheckData(keys) {
      let tempArr = [];
      keys.forEach(key => {
        if (this.deviceIds.includes(key)) {
          tempArr.push(key);
        }
      });
      return tempArr;
    },
    //处理数据将key和title一起传出去
    checkData(arr) {
      let newArr = [];
      const treeMap = data => {
        data.forEach(v => {
          if (arr.indexOf(v.key) >= 0) {
            newArr.push(v);
          }
          treeMap(v.children);
        });
      };
      treeMap(this.treeData);
      return newArr;
    }
  }
};
</script>
<style lang="less" scoped>
.deviceTree {
  .tree {
    padding: 10px 0 0 0;
    height: calc(100vh - 225px);
    overflow: auto;
  }
  .spin-loading {
    display: flex;
    flex-direction: column;
    align-items: center;
  }
  .tree-checkbox {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: center;
    img {
      width: 20px;
      height: 20px;
    }
  }
  /deep/.wpg-tree-node-selected {
    color: #ffffff !important;
    background: var(--supply-color-primary-DEFAULT) !important;
  }

  /deep/.wpg-tree li .wpg-tree-node-content-wrapper:hover {
    color: #4285f4;
  }

  /deep/ .wpg-tree li span.wpg-tree-checkbox-checked + .wpg-tree-node-content-wrapper {
    color: #4285f4;
  }

  /deep/.wpg-tree-checkbox-disabled + span {
    color: #c0c0c0 !important;
    cursor: not-allowed !important;
  }
}
</style>
