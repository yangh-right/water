<template>
  <div class="point-con">
    <w-input-search v-model="searchVal" class="search" placeholder="参数名称" @search="onSearch" />
    <w-tree
      v-show="treeData.length > 0"
      :checkedKeys="checkedKeys"
      checkable
      :expandedKeys="expandedKeys"
      :tree-data="treeData"
      class="wpg-tree-directory point-Multi"
      @check="onCheck"
      @expand="expand"
    />
    <div v-show="treeData.length === 0" class="nodata-text">
      <p class="tips"><w-empty :size="'small'"></w-empty></p>
    </div>
  </div>
</template>

<script>
import { ponitByDeviceIdApi } from '@/api/analysis';
import pointEditIcon from '@/assets/images/modules/report/ic_border_color3@2x.png';

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
      checkedKeys: [],
      checkedUnits: [],
      treeData: [],
      expandedKeys: [],
      composeList: [],
      itemWidth: '100%',
      pointEditIcon,
      devs: []
    };
  },
  watch: {
    checkedKeys(val) {
      this.$emit('change', { key: val, name: '' });
    }
  },
  methods: {
    onSearch() {
      this.treeData = this.getSearchTreeData(JSON.parse(JSON.stringify(this.allTreeData)));
      this.checkedKeys = [...this.checkedKeys];
    },
    getSearchTreeData(res) {
      if (!this.searchVal) {
        return res;
      }
      return res.filter(item => {
        if (item.children) {
          item.children = this.getSearchTreeData(item.children);
          return item.children.length;
        } else {
          return item.title.indexOf(this.searchVal) > -1;
        }
      });
    },
    onCheck(checkedKeys, e) {
      let keys = [];
      let units = [];
      e.checkedNodes.map(checked => {
        let value = checked.data.props.pointName;
        let unit = checked.data.props.pointUnit;
        if (value) {
          keys.push(value);
          units.push(unit);
        }
      });
      const set = new Set(units);
      if (set.size > 3) {
        this.$message.error('您最多只能选择三种单位类型监测量');
        return;
      }
      this.checkedKeys = keys;
    },
    // 获取监测量数据
    async getPointData(dev = [], key = '') {
      let expandedKeys = [];
      this.devs = dev;
      if (!dev.length) {
      } else {
        let res = await ponitByDeviceIdApi(dev[0]);
        let { status, resultData } = res;
        if (status === 'complete') {
          // 展示探头法和化学法监测量
          let zzyPointName = ['NH3N', 'NO3', 'NH3N1', ' NO3N']; //'InstantaneousFlow', 'COD'
          let defaultCheck = [];
          resultData.forEach((data, index) => {
            data.title = data.pointMemo;
            data.key = data.pointName;
            expandedKeys.push(index);
          });
          if (resultData && resultData.length && this.showDefault) {
            resultData.forEach(item => {
              if (zzyPointName.indexOf(item.pointName) !== -1) {
                defaultCheck.push(item.pointName);
              }
            });
          }
          this.treeData = resultData;
          this.allTreeData = [...resultData];
          this.expandedKeys = expandedKeys;
          // 路由传递参数
          if (!this.showDefault) {
            this.checkedKeys = this.defaultKeys;
          } else {
            this.checkedKeys = defaultCheck;
          }
        }
      }
    },
    expand(expandedKeys) {
      this.expandedKeys = expandedKeys;
    }
  }
};
</script>

<style lang="less" scoped>
.compose-content {
  overflow: auto;
  display: flex;
  max-height: 298px;
  max-width: 266px;
  min-width: 100%;
  flex-direction: column;
  position: absolute;
  right: 0;
  box-shadow: 0 0 15px #a9a9a9;
  background-color: var(--supply-color-bg-select-DEFAULT);
  &__item {
    cursor: pointer;
    display: flex;
    height: 36px;
    min-width: 100%;
    font-weight: 400;
    font-size: 12px;
    color: #646666;
    line-height: 36px;
    width: max-content;
    vertical-align: middle;
    &--selected {
      color: var(--supply-color-primary-DEFAULT);
      background-color: var(--supply-color-bg-select-active);
    }
    &:hover {
      color: var(--supply-color-primary-DEFAULT);
      background-color: var(--supply-color-bg-select-active);
    }
  }
  &__title {
    width: 80px;
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    padding: 0 16px;
    flex: 0 0 auto;
  }
  &__list {
    padding-right: 16px;
    white-space: nowrap;
  }
}
.point-con {
  width: 100%;
  height: 100%;
  padding: 12px;
  font-size: 12px;
  .point-compose {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 5px;
    > img {
      cursor: pointer;
    }
  }
  .search {
    margin-bottom: 14px;
  }

  .point-Multi {
    height: calc(100% - 50px);
    overflow-x: hidden;
    overflow-y: auto;
  }

  .nodata-text {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: calc(100% - 50px);
  }
}
</style>
<style>
.wpg-tree.wpg-tree-directory > li span.wpg-tree-node-content-wrapper > span,
.wpg-tree.wpg-tree-directory .wpg-tree-child-tree > li span.wpg-tree-node-content-wrapper > span {
  position: relative;
  z-index: 1;
  display: inline-block;
  width: 100%;
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
}

.wpg-tree.wpg-tree-directory li ul {
  padding: 0;
}
</style>
