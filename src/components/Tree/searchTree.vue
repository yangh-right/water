/** * @TODO 后期拆分优化树 */

<template>
  <div
    ref="tree"
    :class="['treeDomSelectBox', treeTypeShow ? 'treeBoxType' : '']"
    :style="`width:${treeAutoWidth}`"
  >
    <div class="conditionBox keywordBox supply-mt-2">
      <w-select
        v-if="isShowSort"
        style="width:100%;margin-bottom: 5px;"
        v-model="filterOption"
        @change="handleFilterOption"
      >
        <w-select-option v-for="item in orderOptions" :key="item.value" :value="item.value">
          {{ item.filterOptionName }}<w-icon v-if="item.icon" :type="item.icon"></w-icon>
        </w-select-option>
      </w-select>
      <w-input-search v-model="filterText" placeholder="关键词" @search="onSearchTree" />
    </div>
    <div v-if="treeData.length <= 0 && !loading" class="no-data">
      <w-empty :size="'small'"></w-empty>
    </div>
    <vc-tree
      ref="vctree"
      :data="treeData"
      :indent="6"
      nodeKey="key"
      :props="defaultProps"
      :height="height"
      :default-expand-all="defaultExpandSatatus"
      :default-expanded-keys="[currentNodeKey]"
      :default-checked-keys="checkedKeys"
      :current-node-key="currentNodeKey"
      :startCurrentKey="startCurrentKey"
      :filter-node-method="filterNode"
      :show-checkbox="checkable"
      @node-click="currentChange"
      @check="currentCheck"
      style="height: 100%"
    >
    </vc-tree>
    <div class="tree-bottom supply-bg-bg-card-DEFAULT">
      <w-checkbox-group
        v-if="!isShowFilter && isShowOnlineStatus"
        v-model="checkboxValue"
        name="checkboxgroup"
        :class="'checkbox'"
        @change="onlineChange('checkboxValue')"
      >
        <w-checkbox value="1" :class="'checkbox-item'">在线</w-checkbox>
        <w-checkbox value="0" :class="'checkbox-item'">离线</w-checkbox>
      </w-checkbox-group>
      <w-dropdown
        v-if="isShowFilter && isShowOnlineStatus"
        class="treeFilter"
        placement="topCenter"
      >
        <w-button class="grouping supply-text-sm">
          <i class="icon-set supply-text-base icon-ic_screening2"></i>
          筛选
        </w-button>
        <w-menu slot="overlay" :class="'tree-filter-item'">
          <w-menu-item>
            <w-checkbox-group
              v-model="checkboxValue"
              name="checkboxgroup"
              :class="'checkbox'"
              @change="checkboxOnChange('checkboxValue')"
            >
              <w-checkbox value="1">在线</w-checkbox>
              <w-checkbox value="0">离线</w-checkbox>
            </w-checkbox-group>
          </w-menu-item>
          <w-menu-item>
            <div class="line-filter"></div>
          </w-menu-item>
          <w-menu-item v-if="pageName == 'configuration'">
            <w-checkbox-group
              v-model="isSvgConfig"
              name="checkgroup"
              :class="['checkbox', 'checkbox-fil']"
              @change="checkboxOnChange('isSvgConfig')"
            >
              <w-checkbox value="0">已配置</w-checkbox>
              <w-checkbox value="2">未配置</w-checkbox>
            </w-checkbox-group>
          </w-menu-item>
          <w-menu-item v-if="pageName == 'specifiedRule'">
            <w-checkbox-group
              v-model="isAlarmConfig"
              name="checkgroup"
              :class="['checkbox', 'checkbox-fil']"
              @change="checkboxOnChange('isAlarmConfig')"
            >
              <w-checkbox value="0">已配置</w-checkbox>
              <w-checkbox value="2">未配置</w-checkbox>
            </w-checkbox-group>
          </w-menu-item>
        </w-menu>
      </w-dropdown>
      <w-dropdown
        v-if="treeTypeShow"
        :class="[
          'treeType',
          { 'treeType-fil': isShowFilter, 'treeType-single': !isShowOnlineStatus }
        ]"
        placement="topCenter"
      >
        <w-button class="grouping group-tree supply-text-xs">
          <span v-if="isShowOnlineStatus" :class="['line', { 'line-fil': isShowFilter }]"></span>
          <w-icon type="ic_settings" class="icon-set supply-text-base" />
          分组
        </w-button>
        <w-menu slot="overlay" :class="'tree-filter-settings'">
          <w-radio-group v-model="queryParams.treeCode" @change="treeTypeOnChange">
            <w-radio
              v-for="item in treeTypeList"
              :key="item.id"
              class="tree-radio"
              :style="radioStyle"
              :value="item.value"
              >{{ item.label }}
            </w-radio>
          </w-radio-group>
        </w-menu>
      </w-dropdown>
    </div>
    <w-spin v-show="loading" class="loading" />
    <div class="move-line" @mousedown="mousedown($event)" @mouseup="mouseup($event)"></div>
  </div>
</template>
<script>
import VcTree from '../VcTree/src/VcTree';
import { debounce } from 'throttle-debounce';
import { getSortTreeData as getTreeData, getTreeTypeList, getNodeStatus } from '@/api/baseInfo';
import { mapState, mapMutations } from 'vuex';
const filterOptions = [
  { filterOptionName: '污水厂创建时间', value: 'timeDesc', icon: 'arrow-down' },
  { filterOptionName: '污水厂创建时间', value: 'timeAsc', icon: 'arrow-up' },
  { filterOptionName: '按污水厂首字母A-Z', value: 'shorthandAsc' },
  { filterOptionName: '按污水厂首字母Z-A', value: 'shorthandDesc' },
  { filterOptionName: '按污水厂在线--离线', value: 'onlineDesc' },
  { filterOptionName: '按污水厂离线--在线', value: 'onlineAsc' },
  { filterOptionName: '按污水厂供水模式A-Z', value: 'pumpHouseGroupAsc' },
  { filterOptionName: '按污水厂供水模式Z-A', value: 'pumpHouseGroupDesc' }
];
const filterOptionMap = {
  timeDesc: {
    orderBy: 'time',
    orderType: 'DESC'
  },
  timeAsc: {
    orderBy: 'time',
    orderType: 'ASC'
  },
  shorthandAsc: {
    orderBy: 'shorthand',
    orderType: 'ASC'
  },
  shorthandDesc: {
    orderBy: 'shorthand',
    orderType: 'DESC'
  },
  onlineAsc: {
    orderBy: 'online',
    orderType: 'ASC'
  },
  onlineDesc: {
    orderBy: 'online',
    orderType: 'DESC'
  },
  pumpHouseGroupAsc: {
    orderBy: 'pumpHouseGroup',
    orderType: 'ASC'
  },
  pumpHouseGroupDesc: {
    orderBy: 'pumpHouseGroup',
    orderType: 'DESC'
  }
};

export default {
  components: { VcTree },
  props: {
    onlySearch: {
      type: Boolean,
      require: false,
      default: true
    },
    checkable: {
      type: Boolean,
      default: false
    },
    treeTypeShow: {
      type: Boolean,
      default: true
    },
    treeType: {
      // device, station, video, tank
      type: String,
      default: 'device'
    },
    pageName: {
      type: String,
      default: ''
    },
    isShowSort: {
      type: Boolean,
      default: false
    },
    isShowFilter: {
      type: Boolean,
      default: false
    },
    checkedIds: {
      type: Array,
      required: false,
      default: () => []
    },
    usePropTreeData: {
      type: Boolean,
      default: false
    },
    propTreeData: {
      type: Array,
      required: false,
      default: () => []
    },
    treeWidth: {
      type: String,
      default: '180px'
    },
    pageSiteId: {
      type: String,
      default: null
    },
    orgId: {
      type: String,
      default: null
    },
    sessionKey: {
      type: String,
      default: null
    },
    isSelectFirst: {
      type: Boolean,
      default: false
    },
    isReturnObj: {
      type: Boolean,
      default: false
    },
    isShowOnlineStatus: {
      type: Boolean,
      default: true
    },
    isUseParent: {
      // 污水厂节点也可点击获取数据
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      filterOption: '',
      filterOptions,
      orderOptions: [],
      height: 500,
      loading: false,
      checkboxValue: ['1', '0'],
      isSvgConfig: ['0'],
      isAlarmConfig: ['0'],
      oldChoose: {
        checkboxValue: ['1'],
        isSvgConfig: ['0'],
        isAlarmConfig: ['0']
      },
      radioStyle: {
        display: 'block',
        height: '30px',
        lineHeight: '30px'
      },
      queryParams: {
        treeCode: '2',
        treeType: this.treeType
      },
      defaultProps: {
        children: 'children',
        label: 'title'
      },
      treeDataObj: {},
      checkedData: [], //记录已经勾选节点对象数组
      treeTypeList: [],
      treeData: [],
      checkedKeys: this.checkedIds || [],
      checkedLeafNodes: [],
      treeDataOriginal: [],
      TreeNodeStatus: [],
      treeNodeStatusObj: {},
      preCurrentNodeKey: '',
      currentNodeKey: '',
      filterText: '',
      defaultExpandSatatus: true,
      startCurrentKey: '',
      treeAutoWidth: this.treeWidth
    };
  },
  watch: {
    checkedIds(val) {
      this.checkedKeys = val;
    },
    pageSiteId: {
      handler(val) {
        this.$set(this, 'startCurrentKey', val);
      },
      immediate: true
    },
    'queryParams.treeCode': {
      handler(val) {
        this.orderOptions = val === '0' ? [...this.filterOptions] : this.filterOptions.slice(2);
        this.filterOption =
          this.orderOptions.find(item => item.value === this.filterOption) && this.filterOption
            ? this.filterOption
            : this.orderOptions[0].value;
      }
    }
  },
  computed: {
    ...mapState('tree', ['treeDataObjCurrent', 'treeDataListObj', 'currentKeys']),
    filterOptionObj() {
      return filterOptionMap[this.filterOption];
    },
    caliberList() {
      return JSON.parse(localStorage.getItem('caliber'));
    },
    useWaterTypeList() {
      return JSON.parse(localStorage.getItem('use_water_type'));
    },
    onlineStatus() {
      return this.checkboxValue.length >= 2 ? null : this.checkboxValue[0];
    }
  },
  created() {
    if (sessionStorage.getItem(this.sessionKey)) {
      let onlineState = JSON.parse(sessionStorage.getItem(this.sessionKey));
      this.checkboxValue = onlineState;
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.init();
    });
  },
  methods: {
    ...mapMutations('tree', ['setTreeDataObjCurrent', 'setTreeDataListObj', 'setCurrentKey']),
    handleFilterOption() {
      this.loading = true;
      this.getTree(false);
    },
    async init() {
      this.loading = true;
      this.$nextTick(() => {
        this.height = this.$refs.tree.offsetHeight - (this.isShowSort ? 123 : 134);
      });
      await this.getTreeType();
      await this.getTreeNodeStatus();
      this.getTree(false);
      this.setInter();
    },
    filterNode(value, data) {
      if (!value) return true;
      return data.name.indexOf(value) > -1;
    },
    async checkboxOnChange(type) {
      if (this[type] && this[type].length <= 0) {
        this[type] = [...this.oldChoose[type]];
        this.$message.warning('至少勾选一种情况！');
        return false;
      } else {
        if (type != 'notsave') this.oldChoose[type] = [...this[type]];
      }

      if (type != 'notsave') {
        this.loading = true;
        await this.getTreeNodeStatus();
      }
      this.treeData = this._dealitemfilter();
      this.chooseItem();
      if (type == 'notsave') return false;
      this.saveTreeDo();
    },
    chooseItem() {
      if (!this.currentNodeKey && !this.pageSiteId && !this.checkable) {
        if (this.currentKeys[this.treeType]) {
          this.currentNodeKey = this.currentKeys[this.treeType];
        } else {
          this.currentNodeKey = this.toGetSelectKey(this.treeData[0]).selectedKeys;
        }
      }
      if (this.pageSiteId) {
        this.currentNodeKey = this.pageSiteId;
      }
      this.preCurrentNodeKey = this.currentNodeKey;
      this.selectEmit();
    },
    currentChange(e, node) {
      if (!this.isReturnObj) {
        this.currentNodeKey = '';
        return;
      }
      if (node.isLeaf || e.isUseParent) {
        this.currentNodeKey = e.key;
        this.preCurrentNodeKey = e.key;
        this.selectEmit();
      } else {
        this.currentNodeKey = this.preCurrentNodeKey;
      }
    },
    currentCheck(e, keys) {
      this.checkedKeys = [];
      this.checkedLeafNodes = [];
      keys.checkedNodes.forEach(item => {
        if (item.leaf) {
          this.checkedKeys.push(item.key);
          this.checkedLeafNodes.push(item);
        }
      });
      this.selectEmit(this.checkedKeys);
    },
    onSearchTree(key) {
      this.filterText = key;
      this.defaultExpandSatatus = this.filterText != '' ? true : false;
      if (this.defaultExpandSatatus) {
        this.$emit('update:pageSiteId', '');
      }
      this.$emit('onSearchTree', key);
      this.treeData = this._dealitemfilter();
    },

    async treeTypeOnChange(e) {
      this.loading = true;
      this.queryParams.treeCode = e.target.value;
      // this.saveTreeDo();
      await this.getTreeNodeStatus();
      this.loading = true;
      this.getTree(false);
    },
    async onlineChange(type) {
      if (this[type] && this[type].length <= 0) {
        this[type] = [...this.oldChoose[type]];
        this.$message.warning('至少勾选一种情况！');
        return false;
      }
      sessionStorage.setItem(this.sessionKey, JSON.stringify(this.checkboxValue));
      this.loading = true;
      this.getTree(false);
    },
    saveTreeDo() {
      let sendData = {
        isSelected: this.queryParams.treeCode,
        isStatus: this.checkboxValue,
        isSvgConfig: this.isSvgConfig,
        isAlarmConfig: this.isAlarmConfig
      };
    },

    /**
     * 获取树类型列表
     */
    async getTreeType() {
      await getTreeTypeList(this.treeType).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.queryParams.treeCode = resultData.isSelected ? resultData.isSelected : '0';
          if (sessionStorage.getItem(this.sessionKey)) {
            let onlineState = JSON.parse(sessionStorage.getItem(this.sessionKey));
            this.checkboxValue = onlineState;
          } else {
            this.checkboxValue =
              Array.isArray(resultData.isStatus) && resultData.isStatus.length === 0
                ? resultData.isStatus
                : ['1', '0'];
          }
          this.isSvgConfig = resultData.isSvgConfig ? resultData.isSvgConfig : ['0'];
          this.isAlarmConfig =
            Array.isArray(resultData.isAlarmConfig) && resultData.isAlarmConfig.length === 0
              ? resultData.isAlarmConfig
              : ['0', '2'];
          this.treeTypeList = resultData.list;
        }
      });
    },

    /**
     * 获取树节点状态 污水厂 设备
     */
    async getTreeNodeStatus() {
      let res = await getNodeStatus({});
      this.loading = false;
      if (res.status === 'complete') {
        this.TreeNodeStatus = res.resultData;
        this.$nextTick(() => {
          this.setTreeNodeStatus();
        });
      }
    },
    setTreeNodeStatus() {
      if (this.TreeNodeStatus.length > 0) {
        this.TreeNodeStatus.forEach(item => {
          let nodeId = item.nodeId.replace(/#/g, '-');
          this.treeNodeStatusObj[item.nodeId] = item.status;
          switch (item.status) {
            case '0':
              if (document.getElementById('#node' + nodeId)) {
                document.getElementById('#node' + nodeId).classList.add('supply-text-invalid');
                document.getElementById('#node' + nodeId).classList.remove('supply-text-success');
              }
              break;
            case '1':
              if (document.getElementById('#node' + nodeId)) {
                document.getElementById('#node' + nodeId).classList.add('supply-text-success');
                document.getElementById('#node' + nodeId).classList.remove('supply-text-invalid');
              }
              break;
            case '2':
              break;
          }
        });
      }
    },

    /**
     * 获取树数据
     */
    getTree(useStorage = true) {
      this.treeData = [];
      let key = this.treeType + this.queryParams.treeCode;
      let sendData = { ...this.queryParams };
      if (this.treeType === 'tank')
        sendData = {
          ...this.queryParams,
          orgId: this.orgId
        };
      Object.assign(sendData, this.filterOptionObj);
      sendData.online = this.onlineStatus;
      //sendData.orderBy = 'shorthand';
      //sendData.orderType = 'DESC';

      if (!this.treeDataListObj[key] || !useStorage) {
        getTreeData(sendData).then(res => {
          this.loading = false;
          let { resultData, status } = res;
          if (status === 'complete') {
            this.setTreeDataListObj({
              target: key,
              treeData: resultData
            });
            this.toGetRegionTree(resultData);
            this.checkboxOnChange('notsave');
          }
        });
      } else {
        setTimeout(() => {
          this.loading = false;
          this.toGetRegionTree(this.treeDataListObj[key]);
          this.checkboxOnChange('notsave');
        }, 200);
      }
    },

    /**
     * 保存当前选中id
     */
    saveCurrentKey(_id) {
      if (!_id || _id.length <= 0) return false;
      if (this.treeType === 'video') {
        this.setCurrentKey({
          video: _id || ''
        });
      }
    },
    // 获取树形控件数据
    toGetRegionTree(resultData) {
      if (resultData.length === 0) return false;
      this.selectedKeys = [];
      this.expandedKeys = [];
      resultData.forEach((item, index) => {
        if (item.children && item.children.length > 0) {
          this.treeData.push({
            ...item,
            children: this.get(item),
            title: item.name,
            selectable: false,
            leaf: false,
            key: item.id,
            status: item.online,
            queryKey: item.name + item.id + item.pinyin,
            treeType: this.treeType
          });
        } else {
          if (this.treeType == 'tank') this.treeNodeStatusObj[item.id] = item.online;
          this.treeData.push({
            ...item,
            title: item.name,
            selectable: true,
            leaf: false,
            key: item.id,
            scopedSlots: { title: 'title' },
            status: item.online,
            isShow: true,
            queryKey: item.name + item.id + item.pinyin,
            treeType: this.treeType
          });
        }
      });
      this.treeDataOriginal = [...this.treeData];
      this.generateList(this.treeData);
      this.setTreeDataObjCurrent(this.treeDataObj);
      // if (this.pageSiteId) {
      //     this.selectedKeys.push(this.pageSiteId);
      //     this.expandedKeys = [getParentKey(this.pageSiteId, this.treeData)];
      //     if (this.keyword) {
      //         this.onSearchTree(this.keyword);
      //     }
      // }
      // this.$emit('getSiteId', this.selectedKeys);
    },
    /**
     * 获取选中的菜单
     * @param {Object} child 当前需要选中的父级菜单树对象
     * @param {Object} obj 当前返回的最终的需要展开以及选中的菜单
     */
    toGetSelectKey(
      child,
      obj = {
        selectedKeys: ''
      }
    ) {
      if (!child)
        return {
          expandedKeys: [],
          selectedKeys: ''
        };
      if (child.children && child.children.length) {
        const item = child.children[0];
        if (item.children && item.children.length) {
          this.toGetSelectKey(item, obj);
        } else {
          obj.selectedKeys = item.id;
        }
      } else {
        obj.selectedKeys = child.id;
      }
      return obj;
    },

    /**
     * 递归 处理数据
     * @param children
     * @returns {*}
     */

    get({ children, name }) {
      // 递归增加树字段title,key
      children = children.map((child, index) => {
        if (child.children && child.children.length) {
          child = {
            ...child,
            children: this.get(child),
            title: child.name,
            queryKey: child.name + child.id + child.pinyin,
            selectable: false,
            leaf: false,
            status: child.online,
            key: child.id,
            pName: name,
            treeType: this.treeType
          };
        } else {
          if (this.treeType == 'tank') this.treeNodeStatusObj[child.id] = child.online;
          child = {
            ...child,
            title: child.name,
            key: child.id,
            selectable: true,
            leaf: true,
            queryKey: child.name + child.id + child.pinyin,
            scopedSlots: { title: 'title' },
            status: child.online,
            isShow: true,
            pName: name,
            treeType: this.treeType
          };
        }
        return child;
      });
      return children;
    },

    // 将属性控件的数据源编程一个数组
    generateList(data, _parentNum) {
      for (let i = 0; i < data.length; i++) {
        let parentNum = [i];
        if (_parentNum) parentNum = [..._parentNum, i];
        const node = data[i];
        const key = node.key;
        const title = node.title;
        this.treeDataObj[node.id] = node;
        if (node.children) {
          this.generateList(node.children, parentNum);
        }
      }
    },

    /**
     * 触发选中事件
     * @param selectedKeys
     * @param itemData
     */
    selectEmit(selectedKeys, itemData = []) {
      let status = true;
      if (this.pageSiteId) status = JSON.stringify(this.treeData).includes(this.pageSiteId);
      if (this.treeData.length <= 0 || !status) {
        this.$message.warning('左侧树当前筛选条件下未查询到数据，请改变筛选条件后查看!');
        this.$emit('update:pageSiteId', '');
        return false;
      }
      if (this.isReturnObj) {
        if (this.checkable) {
          selectedKeys = this.checkedKeys;
          this.checkedKeys.forEach(item => {
            itemData.push({
              ...this.treeDataObj[item],
              pName: this.treeDataObj[this.treeDataObj[item].parentId]
                ? this.treeDataObj[this.treeDataObj[item].id].name
                : ''
            });
          });
        }
        let _itemData = itemData.length > 0 ? itemData : this.treeDataObj[this.currentNodeKey];
        let pName = '';
        if (_itemData && itemData[0]) {
          pName = this.treeDataObj[_itemData[0].parentId]
            ? this.treeDataObj[_itemData[0].parentId].name
            : '';
          _itemData = {
            ..._itemData,
            pName: pName
          };
        }
        this.$emit(
          'onSelect',
          {
            selectedKeys: selectedKeys ? selectedKeys : [this.currentNodeKey],
            itemData: {
              ..._itemData
            }
          },
          this.treeDataObj
        );
        this.saveCurrentKey(this.currentNodeKey); // @todo
      } else if (this.checkable) {
        this.$emit('onCheck', this.checkedKeys, this.treeDataObj, this.checkedLeafNodes);
        // if(this.checkedKeys.length>0) this.saveCurrentKey(this.checkedKeys[0]) //  @todo
      } else {
        this.$emit('onSelect', [this.currentNodeKey], this.treeDataObj);
        // this.saveCurrentKey(this.currentNodeKey) // @todo
      }
    },

    /**
     * 按照条件过滤树数据
     * @param key
     * @param _data
     * @returns {[]}
     * @private
     */
    _dealitemfilter(_data, _parentNameFilter = false) {
      let arr = _data || JSON.parse(JSON.stringify(this.treeDataOriginal));
      let itemArr = [];
      let key = this.filterText || '-1truepass';
      let parentNameFilterStatus = _parentNameFilter;
      let status = this.checkboxValue.length >= 2 ? '-1truepass' : this.checkboxValue[0]; // 在线离线过滤
      let statusSvg = this.isSvgConfig.length >= 2 ? '-1truepass' : this.isSvgConfig[0]; // 组态配置过滤
      let statusAlarm = this.isAlarmConfig.length >= 2 ? '-1truepass' : this.isAlarmConfig[0]; // 报警配置过滤
      arr.forEach((item, i) => {
        if (this.isUseParent && item.label === 'station') item.isUseParent = true;
        if (item.children.length > 0) {
          if (item.queryKey.toUpperCase().indexOf(key.toUpperCase()) != -1 || _parentNameFilter)
            parentNameFilterStatus = true;
          arr[i].children = this._dealitemfilter(item.children, parentNameFilterStatus);
          parentNameFilterStatus = false;
          if (arr[i].children.length > 0) {
            itemArr.push(item);
          }
        } else {
          let s1 =
            item.queryKey.toUpperCase().indexOf(key.toUpperCase()) != -1 ||
            key == '-1truepass' ||
            _parentNameFilter;
          let s2 = item.status === status || status === '-1truepass';
          if (this.isShowFilter) {
            if (s1 && s2) {
              if (this.pageName == 'configuration') {
                if (statusSvg == 0 && item.extSvgId) itemArr.push(item);
                if (statusSvg == 2 && !item.extSvgId) itemArr.push(item);
                if (statusSvg == '-1truepass') itemArr.push(item);
              }
              if (this.pageName == 'specifiedRule') {
                if (statusAlarm == 0 && item.isAlarmConfig == '1') itemArr.push(item);
                if (statusAlarm == 2 && item.isAlarmConfig == '0') itemArr.push(item);
                if (statusAlarm == '-1truepass') itemArr.push(item);
              }
            }
          } else {
            if (this.pageName == 'waterRule') {
              if (s1) itemArr.push(item);
            } else {
              if (s1 && s2) itemArr.push(item);
            }
          }
        }
      });

      return itemArr;
    },
    setInter() {
      if (this.setInterItme) clearInterval(this.setInterItme);
      this.setInterItme = setInterval(() => {
        this.getTreeNodeStatus();
      }, 10 * 1000);
    },
    mousedown: function(event) {
      let that = this;
      var event = event || window.event;
      let _target = event.target;
      let startx = event.clientX;
      let starty = event.clientY;
      let sb_bkx = startx - event.target.offsetLeft;
      let sb_bky = starty - event.target.offsetTop;
      let ww = document.documentElement.clientWidth;
      let wh = window.innerHeight;
      if (event.preventDefault) {
        event.preventDefault();
      } else {
        event.returnValue = false;
      }
      // 拖动宽度时防抖
      const debounceMoveLine = debounce(100, false, ev => {
        let event = ev || window.event;
        let scrolltop = document.documentElement.scrollTop || document.body.scrollTop;
        if (event.clientY < 0 || event.clientX < 0 || event.clientY > wh || event.clientX > ww) {
          return false;
        }
        let endx = event.clientX - sb_bkx;
        let endy = event.clientY - sb_bky;
        if (endx <= 100 || endx >= 400) {
          document.onmousemove = null;
          return false;
        }
        _target.style.left = endx + 'px';
        // _target.style.top=endy+'px';
        that.treeAutoWidth = endx + 4 + 'px';
      });
      const moveLineEvents = ev => {
        debounceMoveLine(ev);
      };

      document.onmousemove = function(ev) {
        moveLineEvents(ev);
      };
    },
    mouseup: function(e) {
      document.onmousemove = null;
    },
    setCurrentNodeKey(val) {
      this.currentNodeKey = val;
    }
  },
  beforeDestroy() {
    if (this.setInterItme) clearInterval(this.setInterItme);
  }
};
</script>
<style lang="less" scoped>
.treeDomSelectBox {
  position: relative;
  height: 100%;
  border-radius: 4px;
  &.treeBoxType {
    padding-bottom: 36px;
  }
  overflow: hidden;

  .move-line {
    width: 4px;
    height: 100%;
    position: absolute;
    right: 0px;
    top: 0px;
    cursor: move;
  }
}

/deep/ .wpg-input {
  height: 28px;
  font-size: 12px;
}

.keywordBox {
  margin-bottom: 8px;
}

.tree-bottom {
  position: absolute;
  bottom: 0;
  left: 0;
  height: 42px;
  width: 100%;
  // background: #fff;
  box-shadow: 0 2px 8px 0 rgba(0, 0, 0, 0.4);

  .checkbox {
    position: absolute;
    left: 8px;
    top: 0;
    z-index: 99;
    height: 42px;
    line-height: 42px;
    width: auto;

    /deep/ .wpg-checkbox + span {
      padding-left: 4px;
    }

    .checkbox-item {
      width: auto;
      margin-left: 0px;
    }
  }
}

/deep/ .checkbox-fil {
  width: 100%;
}

.treeFilter {
  height: 42px;
  width: 50%;
  line-height: 42px;
  border: 0px;
  text-align: center;
  box-shadow: none;
  padding-right: 15px;
}

.tree-filter-line {
  height: 1px;
  background: #d6d6d6;
  width: 100%;
}

.treeType {
  width: 100%;
  height: 42px;
  line-height: 42px;
  padding-left: 110px;
  border: 0px !important;
  text-align: center;
  box-shadow: none;
  position: relative;

  &.treeType-fil {
    width: 50%;
    padding-left: 15px;
  }

  &.treeType-single {
    width: 100%;
    padding-left: 0px;
  }
}
.wpg-dropdown {
  max-height: 500px;
}
.wpg-dropdown-menu {
  padding: 4px 5px;
  max-height: 500px;
  overflow-y: scroll;
}

.line {
  height: 16px;
  width: 1px;
  background: #d6d6d6;
  vertical-align: middle;

  &.line-fil {
    position: absolute;
    left: 0;
    top: 13px;
  }
}

.line-filter {
  width: 100%;
  height: 1px;
  background: rgba(222, 226, 231, 0.5);
}

.group-tree {
  padding-top: 1px;
}

.icon-set {
  vertical-align: middle;
  margin-left: 5px !important;
  margin-right: -5px;
  margin-top: 0;
}

.loading {
  position: absolute;
  left: 50%;
  top: 50%;
  margin-top: -10px;
  margin-left: -10px;
}

/deep/ .icon-ic_wifi {
  float: right;
  font-size: 20px;
  flex-grow: 1;
  margin-top: -2px;
}

/deep/ .vc-tree-node__label {
  flex-grow: 10 !important;
  overflow: hidden;
  text-overflow: ellipsis;
  -o-text-overflow: ellipsis;
  white-space: nowrap;
}

/deep/ .wpg-dropdown-menu-item:hover {
  background-color: #fff !important;
}

/deep/ .wpg-checkbox-group {
  width: 100%;
}

/deep/ .wpg-checkbox-group .wpg-checkbox-wrapper {
  width: 50%;
  font-size: 12px;
}

.tree-filter-settings {
  padding-left: 10px;
  padding-right: 0;
}

.no-data {
  position: absolute;
  top: 25%;
  left: 0;
  width: 100%;
  height: 50%;
  z-index: 99;
}

/deep/ .vc-tree__empty-block {
  display: none;
}
</style>
