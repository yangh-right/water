<template>
  <div class="point-con">
    <w-input-search v-model="searchVal" class="search" placeholder="参数名称" @search="onSearch" />
    <w-tree
      v-show="treeData.length > 0"
      :selectedKeys="selectedKeys"
      defaultExpandAll
      :tree-data="treeData"
      :expandedKeys="expandedKeys"
      class="wpg-tree-directory point-Single"
      @select="onSelect"
    />
    <div v-show="treeData.length === 0" class="nodata-text">
      <w-empty description="暂无监测量"></w-empty>
    </div>
  </div>
</template>
<script>
import { getDeviceCommonPoint } from '@/api/runMonitor';
import { ponitByDeviceIdApi } from '@/api/analysis';
export default {
  props: {
    showDefault: {
      type: Boolean,
      default: true
    },
    defaultKeys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      searchVal: '',
      selectedKeys: [],
      treeData: [],
      expandedKeys: [],
      devs: [],
      allTreeData: [],
      groupDict: null
    };
  },
  watch: {
    selectedKeys(val) {
      let name = val.map(item => this.pointNameList[item]);
      this.$emit('change', { key: val, name: name, treeData: this.allTreeData });
    }
  },
  created() {},
  methods: {
    onSearch() {
      this.getPointData(this.devs);
    },
    onSelect(selectedKeys) {
      this.selectedKeys = [...selectedKeys];
    },
    async getDevicesPoint(devs){
      this.allTreeData = [];
      let result = await Promise.all(devs.map(dev => ponitByDeviceIdApi(dev)));
      if(Array.isArray(result) && result.length > 0){
        result.forEach(dev => {
          this.allTreeData.push(...dev.resultData)
        })
      }
    },
    async getPointData(dev = []) {
      this.getDevicesPoint(dev);
      this.devs = dev;
      let res = [];
      if (dev.length > 0) {
        let commonRes = await getDeviceCommonPoint(dev);
        res = commonRes ? commonRes.resultData : [];
      }
      let pointNameList = {};
      res.map(item => (pointNameList[item.key] = item.value));
      this.pointNameList = pointNameList;
      let defaultCheck = '';
      if (res.length) {
        if (this.showDefault) {
          defaultCheck = res[0].key;
        }
      }
      let allItemList = [];
      res.forEach(item => {
        allItemList.push({
          title: item.value,
          key: item.key
        });
      });
      this.treeData = this.getSearchTreeData(allItemList);
      if (!this.showDefault) {
        let defaultItem = this.treeData.find(item => item.key === this.defaultKeys[0]);
        this.selectedKeys = defaultItem ? [defaultItem.key] : [defaultCheck];
      } else {
        this.selectedKeys = [defaultCheck];
      }
    },
    getSearchTreeData(res) {
      if (!this.searchVal) return res;
      return res.filter(item => {
        if (item.children) {
          item.children = this.getSearchTreeData(item.children);
          return item.children.length;
        } else {
          return item.title.indexOf(this.searchVal) > -1;
        }
      });
    }
  }
};
</script>
<style lang="less" scoped>
.point-con {
  height: 100%;
  width: 100%;
  padding: 12px;
  font-size: 12px;
  .search {
    margin-bottom: 14px;
  }
  .point-Single {
    height: calc(100% - 50px);
    overflow: auto;
  }
  .nodata-text {
    width: 100%;
    height: calc(100% - 50px);
    display: flex;
    justify-content: center;
    align-items: center;
  }
}
</style>
