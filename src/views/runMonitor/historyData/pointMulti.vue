<template>
  <div class="point-con">
    <div v-if="isComposeInput" class="point-compose">
      <w-select
        v-model="curCompose.name"
        class="point-compose__select"
        style="width:195px"
        placeholder="监测量组合"
        :max-tag-count="1"
        @focus="selectFocus"
      >
        <div slot="dropdownRender">
          <div class="compose-content">
            <div
              v-for="item of composeList"
              :key="item.id"
              :style="{ width: itemWidth }"
              @click="selectPoints(item)"
              :class="[
                'compose-content__item',
                item.id === curCompose.id ? 'compose-content__item--selected' : ''
              ]"
            >
              <div class="compose-content__title">{{ item.name }}</div>
              <div class="compose-content__list">
                {{ item.pointName }}
              </div>
            </div>
          </div>
        </div>
      </w-select>
      <img @click="editPoint" :src="pointEditIcon" class="supply-w-5 supply-h-5" alt="" />
    </div>
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
import { getHistoryList } from '@/api/report';
import pointEditIcon from '@/assets/images/modules/report/ic_border_color3@2x.png';

export default {
  props: {
    showDefault: {
      type: Boolean,
      default: true
    },
    isComposeInput: {
      type: Boolean,
      default: false
    },
    defaultKeys: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      curCompose: {
        id: '',
        name: ''
      },
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
    hasEdit(val) {
      this.curCompose = { id: '', name: '' };
      this.getHistoryList();
    },
    checkedKeys(val) {
      this.$emit('change', { key: val, name: '', treeData: this.allTreeData });
    }
  },
  mounted() {
    this.getHistoryList();
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
          let defaultCheck = [];
          resultData.forEach((data, index) => {
            data.title = data.pointMemo;
            data.key = data.pointName;
            expandedKeys.push(index);
          });
          if (resultData && resultData.length && this.showDefault) {
            resultData.forEach(item => {
              if (defaultCheck.length < 3) {
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
    },
    selectPoints(row) {
      this.curCompose = row;
      this.checkedKeys = row.points.map(item => item.pointCode);
    },
    selectFocus() {
      this.$nextTick(() => {
        let composeContent = document.querySelector('.compose-content');
        if (composeContent && composeContent.scrollWidth > 266) {
          this.itemWidth = composeContent.scrollWidth + 'px';
        }
      });
    },
    editPoint() {
      this.$emit('update:visible', true);
    },
    async getHistoryList() {
      console.log('222');
      let res = await getHistoryList({ current: 0, size: 100 });
      this.composeList = res.resultData.map(item => {
        let { id, name, points } = item;
        let pointName = '';
        points.forEach((point, i) => {
          if (i) {
            pointName += '/' + point.pointName;
          } else {
            pointName += point.pointName;
          }
        });
        return { name, pointName, points, id };
      });
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
