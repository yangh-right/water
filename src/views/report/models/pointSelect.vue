<template>
  <div class="point-con">
    <div v-if="isComposeInput" class="point-compose">
      <w-select
        class="point-compose__select"
        style="width:165px"
        placeholder="监测量组合"
        :max-tag-count="1"
        @focus="selectFocus"
      >
        <div slot="dropdownRender">
          <div class="compose-content">
            <div
              v-for="(item, index) in composeList"
              :key="item.id"
              :style="{ width: itemWidth }"
              @click="selectPoints(item)"
              class="compose-content__item"
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
      :selectable="false"
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
import {
  getPointNameByPageOrType,
  getDeviceCommonPoint,
  getPointsByPointNames
} from '@/api/runMonitor';
import pointEditIcon from '@/assets/images/modules/report/ic_border_color3@2x.png';
import { mapState } from 'vuex';
import { sysDictListByCode } from '@/api/manage';
import { getHistoryList } from '@/api/report';
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
    isConfigPoint: {
      type: Boolean,
      default: false
    },
    allTreeData: {
      type: Array,
      default: []
    },
    pointNameList: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      searchVal: '',
      composeList: [],
      pointEditIcon,
      itemWidth: '100%',
      checkedKeys: [],
      checkedUnits: [],
      expandedKeys: [],
      devs: [],
      lastSet: null,
      groupDict: null,
      selectNode: [],
      treeData: []
    };
  },
  computed: {
    ...mapState('report', ['hasEdit'])
  },
  watch: {
    hasEdit(val) {
      this.getHistoryList();
    },
    allTreeData: {
      handler() {
        this.treeData = JSON.parse(JSON.stringify(this.allTreeData));
      },
      immediate: true
    },
    checkedKeys(val) {
      let keys = val
        .filter(item => typeof item === 'string')
        .filter(item => this.getSearchCheck(item));
      let name = keys.map(item => this.pointNameList[item]);
      this.$emit('change', { key: keys, name: name });
    }
  },
  mounted() {
    this.getDict();
    this.getHistoryList();
  },
  methods: {
    async getHistoryList() {
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
    },
    getSearchCheck(item, ifShow = false) {
      this.treeData.map(tree => {
        if (tree.children) {
          tree.children.map(treeChild => {
            if (treeChild.key === item) {
              ifShow = true;
            }
          });
        } else {
          if (tree.key === item) {
            ifShow = true;
          }
        }
      });
      return ifShow;
    },
    selectPoints(row) {
      this.checkedKeys = row.points.map(item => item.pointCode);
    },
    editPoint() {
      this.$emit('update:visible', true);
    },
    onSeviceSelect() {
      this.checkedKeys = [...this.checkedKeys];
    },
    selectFocus() {
      this.$nextTick(() => {
        let composeContent = document.querySelector('.compose-content');
        if (composeContent && composeContent.scrollWidth > 266) {
          this.itemWidth = composeContent.scrollWidth + 'px';
        }
      });
    },
    onSearch(value) {
      this.treeData = this.getSearchTreeData(JSON.parse(JSON.stringify(this.allTreeData)));
      this.checkedKeys = [...this.checkedKeys];
    },
    onCheck(checkedKeys, e) {
      // let keys = [];
      checkedKeys = checkedKeys.filter(item => typeof item === 'string');

      if (checkedKeys.length > 10) {
        this.$message.error('最多只能选择10个监测量');
        return;
      }
      this.checkedKeys = [...checkedKeys];
    },
    // 获取监测量数据
    async getPointData(dev = [], key = '') {
      this.devs = dev;
      const params = {
        platform: '1',
        pageCode: 'pump_detail'
      };
      let res = await getPointNameByPageOrType(params);
      let { resultData } = res;
      if (this.isConfigPoint) {
        this.getConfigPoints(resultData);
      } else {
        this.getCommonPoints(resultData, dev);
      }
    },
    async getCommonPoints(resultData, dev) {
      let resChild = await getDeviceCommonPoint(dev);
      let pointNameList = {};
      resChild.resultData.map(item => (pointNameList[item.key] = item.value));
      this.pointNameList = pointNameList;

      this.handleCommonData(resultData, resChild.resultData);
    },
    async getConfigPoints(resultData) {
      let queryChild = resultData.map(item => {
        return getPointsByPointNames(item.data);
      });
      Promise.all(queryChild).then(res => {
        let pointNameList = {};
        res.forEach(item => {
          pointNameList = { ...pointNameList, ...item.resultData };
        });
        this.pointNameList = pointNameList;

        this.handleConfigData(resultData, res);
      });
    },
    handleConfigData(resTop, resChild) {
      let expandedKeys = [];
      let defaultCheck = [];
      let res = resTop.map((itemF, index) => {
        expandedKeys.push(index);
        return {
          title: itemF.pointGroupName,
          key: index,
          children: Object.keys(resChild[index].resultData).map(item => {
            if (this.showDefault && defaultCheck.length < 3) {
              defaultCheck.push(item);
            }
            return { key: item, title: resChild[index].resultData[item] };
          })
        };
      });
      this.treeData = this.getSearchTreeData(res);
      this.expandedKeys = expandedKeys;
      this.checkedKeys = defaultCheck;
    },
    handleCommonData(resTop, resChild) {
      let expandedKeys = [];
      let defaultCheck = [];
      let res = [];
      resTop.map((itemF, index) => {
        let children = [];
        itemF.data.map(child => {
          resChild.forEach(item => {
            if (item.key === child) {
              item.isChild = true;
              if (this.showDefault && defaultCheck.length < 3) {
                defaultCheck.push(item.key);
              }
              children.push({ key: item.key, title: item.value });
            }
          });
        });
        if (children.length) {
          expandedKeys.push(index);
          res.push({
            title: itemF.pointGroupName,
            key: index,
            children: children
          });
        }
      });
      resChild
        .filter(item => !item.isChild)
        .forEach(item => {
          if (this.showDefault && defaultCheck.length < 3) {
            defaultCheck.push(item.key);
          }
          res.push({
            title: item.value,
            key: item.key
          });
        });
      this.treeData = this.getSearchTreeData(res);
      this.expandedKeys = expandedKeys;
      this.checkedKeys = defaultCheck;
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
    },
    expand(expandedKeys) {
      this.expandedKeys = expandedKeys;
    },
    getDict() {
      sysDictListByCode('point_group_type').then(res => {
        if (res.status === 'complete') {
          this.groupDict = this.dealDict(res.resultData, 'value');
        }
      });
    },
    /* 处理数据字典数据 */
    dealDict(_data, type) {
      let obj = {};
      _data.forEach(r => {
        obj[r[type]] = r.name;
      });
      return obj;
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
  height: 100%;
  width: 100%;
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
    overflow-y: auto;
    overflow-x: hidden;
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
<style>
.wpg-tree.wpg-tree-directory > li span.wpg-tree-node-content-wrapper > span,
.wpg-tree.wpg-tree-directory .wpg-tree-child-tree > li span.wpg-tree-node-content-wrapper > span {
  position: relative;
  z-index: 1;
  width: 100%;
  overflow: hidden;
  display: inline-block;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.wpg-tree.wpg-tree-directory li ul {
  padding: 0;
}
</style>
