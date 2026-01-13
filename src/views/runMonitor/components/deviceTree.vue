<!--  -->
<template>
  <div class="deviceTree">
    <w-input-search
      v-model="searchInput"
      placeholder="请输入污水厂名称"
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
            :id="'node' + uuid()"
            type="ic_pump_room"
            :class="[item.isOnline === '1' ? 'supply-text-success' : 'supply-text-invalid']"
          /> -->
        </template>
      </w-tree>
    </div>
  </div>
</template>

<script>
import uuid from '@/utils/uuid';

export default {
  name: 'deviceTree',
  components: {},
  props: {
    treeType: {
      // device, station, video, tank
      type: String,
      default: 'device'
    },
    isReturnObj: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      searchInput: '',
      expandedKeys: [],
      checkedKeys: [],
      selectedKeys: [],
      checkable: false,
      loading: false,
      treeData: [],
      waterPlantId: undefined,
      firstload: 0,
      pointList: [],
      uuid
    };
  },
  watch: {
    waterPlantId(newV) {
      this.handleInit();
    }
  },
  created() {
    this.getTree();
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
        v.title = v.stationName;
        v.key = v.id;
        v.checkable = true;
        v.selectable = true;
        v.scopedSlots = { title: 'handle' };
      });
      return data;
    },
    //获取设备树的数据
    async getTree() {
      try {
        this.loading = true;
        this.treeData = [];
        let stationArr = [];
        const res = await this.$http.post('waterPlantClient/getWaterPlants'); // 获取站点状态
        if (res.status === 'complete') {
          stationArr = res.resultData;
        }
        let url = '/svg/manager/getSvgListByCondition';
        let { resultData } = await this.$http.post(`${url}?keywords=${this.searchInput}`, {
          pageSize: 50
        });
        if (Array.isArray(resultData) && resultData.length > 0) {
          resultData.forEach(item => {
            let station = stationArr.filter(station => {
              return item.stationId === station.id;
            });
            if (station.length > 0) {
              item.stationName = station[0].stationName;
              item.isOnline = station[0].isOnline;
            }
          });
          this.changeTreeData(resultData);
          console.log('iiii', resultData);
          this.treeData = resultData;
          this.handleData();
        }
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
      this.chooseFirstDevice(this.treeData[0], defaultKey);

      //如果有路由信息，则找到对应的key
      if (this.pointList.length) {
        let routerKeys = [];
        this.findKeys(this.pointList, this.treeData, routerKeys);
        this.pointList = [];
      } else {
        this.expandedKeys = defaultKey;
        this.checkedKeys = defaultKey;
        this.selectedKeys = defaultKey;
      }
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
        this.$emit('onTreeChecked', this.checkedKeys);
      }
    },

    //处理数据将key和title一起传出去
    checkData(arr) {
      let newArr = [];
      const treeMap = data => {
        data.forEach(v => {
          if (arr.indexOf(v.key) >= 0) {
            newArr.push(v);
          }
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
    background: var(--supply-color-primary-active) !important;
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
