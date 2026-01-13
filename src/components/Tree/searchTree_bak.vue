<template>
  <div
    :class="['treeDomSelectBox', treeTypeShow?'treeBoxType':'']"
    :style="`width:${treeWidth}`"
    id="tree"
  >
    <div class="conditionBox keywordBox">
      <w-input-search v-model="keyword" placeholder="关键词" @search="onSearchTree" />
    </div>
    <w-tree
      :showIcon="false"
      :checkable="checkable"
      v-model="checkedKeys"
      @check="onCheck"
      @select="onSelect"
      @expand="onExpand"
      :expandedKeys="expandedKeys"
      :autoExpandParent="autoExpandParent"
      :selectedKeys="selectedKeys"
      :treeData="treeData"
      v-if="treeData.length>0"
    >
      <template slot="title" slot-scope="{ title, id, status }">
        <span :title="title">{{title}}</span>
        <i :id="'node'+id" :class="['icon-ic_wifi', status == '0' ? 'supply-text-success':'supply-text-invalid']"></i>
      </template>
    </w-tree>
    <w-dropdown v-if="treeTypeShow" class="treeType" placement="topCenter">
      <w-button>
        树结构
        <i class="icon-set supply-text-xl icon-ic_settings"></i>
      </w-button>
      <w-menu slot="overlay">
        <w-radio-group v-model="queryParams.treeCode" @change="treeTypeOnChange">
          <w-radio
            v-for="item in treeTypeList"
            class="tree-radio"
            :style="radioStyle"
            :value="item.value"
            :key="item.id"
          >{{item.label}}</w-radio>
        </w-radio-group>
      </w-menu>
    </w-dropdown>
    <w-spin v-show="loading" class="loading" />
  </div>
</template>

<script>
import { getTreeData, getTreeTypeList, getNodeStatus, changeTreeType } from '@/api/baseInfo';
import { mapState, mapMutations } from 'vuex';

// 找到包含搜索关键字的节点的key值
const getParentKey = (key, tree) => {
    let parentKey;
    for (let i = 0; i < tree.length; i++) {
        const node = tree[i];
        if (node.children) {
            if (node.children.some((item) => item.key === key)) {
                parentKey = node.key;
            } else if (getParentKey(key, node.children)) {
                parentKey = getParentKey(key, node.children);
            }
        }
    }
    return parentKey;
};
export default {
    name: 'searchTree',
    data() {
        return {
            loading: false,
            firstItemArr: null,
            regionParams: {
                groupId: [],
                userType: '',
                caliber: '',
            },
            searchValue: '', // 当前搜索得内容
            autoExpandParent: true,
            expandedKeys: [], //默认展开节点
            selectedKeys: [], //默认选中项
            treeData: [],
            treeDataOriginal:[],
            treeDataObj: {},
            TreeNodeStatus: [],
            treeNodeStatusObj: {},
            meterExam: false,
            allDataList: [],
            allSiteIdObj: {},
            groupList: [], // 自定义分区
            treeTypeList: [],
            radioStyle: {
                display: 'block',
                height: '30px',
                lineHeight: '30px',
            },
            queryParams: {
                treeCode: '2',
                treeType: this.treeType,
            },
            checkedKeys: this.checkedKey,
            setInterItme: null,
            keyword: '',
        };
    },
    props: {
        onlySearch: {
            type: Boolean,
            require: false,
            default: true,
        },
        checkable: {
            type: Boolean,
            default: false,
        },
        treeTypeShow: {
            type: Boolean,
            default: true,
        },
        treeType: {
            // device, pump, video
            type: String,
            default: 'device',
        },
        checkedKey: {
            type: Array,
            required: false,
            default: () => [],
        },
        usePropTreeData: {
            type: Boolean,
            default: false,
        },
        propTreeData: {
            type: Array,
            required: false,
            default: () => [],
        },
        treeWidth: {
            type: String,
            default: '220px',
        },
        isSelectFirst: {
            type: Boolean,
            default: true,
        },
    },
    watch: {
        checkedKey(n, o) {
            this.checkedKeys = n;
        },
        '$route.query.name': {
            handler(val) {
                this.keyword = val;
                if (this.treeData.length > 0) {
                    this.onSearchTree(val);
                }
            },
            immediate: true,
        },
    },
    computed: {
        ...mapState('tree', ['treeDataObjCurrent', 'treeDataListObj']),
        caliberList() {
            return JSON.parse(localStorage.getItem('caliber'));
        },
        pageSiteId() {
            return this.$route.query.siteId;
        },
        useWaterTypeList() {
            return JSON.parse(localStorage.getItem('use_water_type'));
        },
    },
    mounted() {
        if (!this.usePropTreeData) {
            this.init();
        } else {
            this.treeData = [];
            this.propTreeData.forEach((item, index) => {
                if (item.children && item.children.length > 0) {
                    this.treeData.push({
                        children: this.get(item),
                        title: item.name,
                        selectable: false,
                        key: item.id,
                        scopedSlots: { title: 'title' },
                    });
                }
            });
            this.treeDataOriginal =[...this.treeData]
        }
    },
    methods: {
        ...mapMutations('tree', ['setTreeDataObjCurrent', 'setTreeDataListObj']),
        async init() {
            await this.getTreeType();
            await this.getTreeNodeStatus();
            this.getTree();
        },
        /**
         * 获取树数据
         */
        getTree() {
            this.loading = true;
            this.treeDataObj = {};
            this.treeData = [];
            this.allDataList = [];
            let key = this.treeType + this.queryParams.treeCode;
            if (!this.treeDataListObj[key]) {
                getTreeData(this.queryParams).then((res) => {
                    this.loading = false;
                    let { resultData, status } = res;
                    if (status === 'complete') {
                        this.setTreeDataListObj({
                            target: key,
                            treeData: resultData,
                        });
                        this.toGetRegionTree(resultData);
                    }
                });
            } else {
                setTimeout(() => {
                    this.loading = false;
                    this.toGetRegionTree(this.treeDataListObj[key]);
                }, 200);
            }
        },

        /**
         * 获取树类型列表
         */
        async getTreeType() {
            await getTreeTypeList(this.treeType).then((res) => {
                let { status, resultData } = res;
                if (status === 'complete') {
                    this.queryParams.treeCode = resultData.isSelected;
                    this.treeTypeList = resultData.list;
                }
            });
        },
        treeTypeOnChange(e) {
            this.queryParams.treeCode = e.target.value;
            changeTreeType(this.queryParams.treeCode).then(res => {})
            this.getTree();
        },
        //获取树形控件数据
        toGetRegionTree(resultData) {
            this.selectedKeys = [];
            this.expandedKeys = [];
            resultData.forEach((item, index) => {
                if (index === 0) {
                    if (!this.pageSiteId) {
                        //默认展开第一个节点
                        this.expandedKeys = this.toGetSelectKey(item).expandedKeys;
                        // 选中第一个节点
                        this.selectedKeys = this.toGetSelectKey(item).selectedKeys;
                    }
                }
                if (item.children && item.children.length > 0) {
                    this.treeData.push({
                        ...item,
                        children: this.get(item),
                        title: item.name,
                        selectable: false,
                        key: item.id,
                    });
                } else {
                    this.treeData.push({
                        ...item,
                        title: item.name,
                        selectable: true,
                        key: item.id,
                        scopedSlots: { title: 'title' },
                        status: this.treeNodeStatusObj[item.id],
                        isShow:true
                    });
                }
            });
            this.treeDataOriginal =[...this.treeData]
            this.generateList(this.treeData);
            this.selectEmit(this.selectedKeys, this.treeDataObj[this.selectedKeys[0]]);
            this.setTreeDataObjCurrent(this.treeDataObj);
            if (this.pageSiteId) {
                this.selectedKeys.push(this.pageSiteId);
                this.expandedKeys = [getParentKey(this.pageSiteId, this.treeData)];
                if (this.keyword) {
                    this.onSearchTree(this.keyword);
                }
            }
            this.$emit('getSiteId', this.selectedKeys);
        },

        /**
         * 获取选中的菜单
         * @param {Object} child 当前需要选中的父级菜单树对象
         * @param {Object} obj 当前返回的最终的需要展开以及选中的菜单
         */
        toGetSelectKey(
            child,
            obj = {
                expandedKeys: [],
                selectedKeys: [],
            }
        ) {
            if (!child)
                return {
                    expandedKeys: [],
                    selectedKeys: [],
                };
            if (child.children && child.children.length) {
                obj.expandedKeys.push(child.id);
                const item = child.children[0];
                if (item.children && item.children.length) {
                    obj.expandedKeys.push(item.id);
                    this.toGetSelectKey(item, obj);
                } else {
                    obj.selectedKeys = [item.id];
                }
            } else {
                obj.selectedKeys = [child.id];
            }
            return obj;
        },
        // 将属性控件的数据源编程一个数组
        generateList(data, _parentNum) {
            for (let i = 0; i < data.length; i++) {
                let parentNum = [i];
                if (_parentNum) parentNum = [..._parentNum, i];
                const node = data[i];
                const key = node.key;
                const title = node.title;
                this.allDataList.push({
                    key,
                    title: title,
                    parentsArr: parentNum,
                });
                this.allSiteIdObj[node.id] = node.name;
                this.treeDataObj[node.id] = node;
                if (node.children) {
                    this.generateList(node.children, parentNum);
                }
            }
        },
        //搜索树形控件
        onSearchTree(value) {
            if (!value) {
                this.expandedKeys = [...this.selectedKeys];
                return false;
            }
            let currentId = '';
            this.firstItemArr = null;
            if (this.allSiteIdObj[value]) value = this.allSiteIdObj[value]; // 如果输入的为id，且id存在
            const selectedKeys = [];
            const expandedKeys = this.allDataList
                .map((item, index) => {
                    //如果该对象的title包含关键字则把该对象的key值和树控件数据传给getParentKey方法
                    if (item.title.indexOf(value) > -1) {
                        if (!this.firstItemArr) this.firstItemArr = item.parentsArr;
                        selectedKeys.push({
                            key: item.key,
                            name: item.title,
                        });
                        return getParentKey(item.key, this.treeData);
                    }
                    return null;
                })
                .filter((item, i, self) => item && self.indexOf(item) === i);
            if (selectedKeys && selectedKeys.length > 0) {
                this.expandedKeys = expandedKeys;
                const handleObj = this.treeDataObj[selectedKeys[0].key]; // 当前搜索得到得第一个值的对象
                if (handleObj) {
                    const currentSiteId =
                        handleObj.children && handleObj.children.length
                            ? handleObj.children[0].id
                            : handleObj.id;
                    if (this.isSelectFirst && this.pageSiteId === handleObj.id) {
                        this.expandedKeys = [getParentKey(this.pageSiteId, this.treeData)];
                        const getChildSite = (arr) => {
                            // 递归查找当前查询对象的最底层的id
                            if (arr && arr.length) {
                                if (arr[0].children && arr[0].children.length) {
                                    getChildSite(arr[0].children);
                                } else {
                                    this.expandedKeys = [arr[0].id];
                                }
                            }
                        };
                        handleObj.children && handleObj.children.length
                            ? getChildSite(this.treeDataObj[selectedKeys[0].key].children)
                            : (this.selectedKeys = [handleObj.id]);
                        this.selectedKeys = [
                            this.treeDataObj[selectedKeys[0].key].children
                                ? this.treeDataObj[selectedKeys[0].key].children[0].id
                                : this.treeDataObj[selectedKeys[0].key].id,
                        ];
                        this.selectEmit(this.selectedKeys, this.treeDataObj[this.selectedKeys[0]]);
                    }
                } else {
                    this.expandedKeys = [getParentKey(selectedKeys[0].key, this.treeData)];
                }
            } else {
                this.$message.error('未搜到相关内容！');
            }
            this.autoExpandParent = true;
            if (this.firstItemArr) this.changeScroll();
            // this.$emit('getSiteId',this.selectedKeys);
        },
        onSearchTreeNew(val){
            if(!val) {
                this.treeData = [...this.treeDataOriginal]
                return false
            }
            console.log(this.keyword)
            this.treeData = this._searchTreeNew(val, '')
            console.log(this.treeData)
        },
        _searchTreeNew(val, _arr){
            let key = val ? val : this.keyword;
            let arr = _arr ? _arr : [...this.treeDataOriginal];
            arr.forEach((item, i) => {
                if(item.children.length>0){
                    arr[i]= this._searchTreeNew(val, item.children)
                }
                if(item.title.indexOf(key) == -1){
                    arr.isShow = false;
                }else{
                    arr.isShow = true;
                }
            })
            return arr
        },
        //展开节点
        onExpand(expandedKeys) {
            this.setTreeNodeStatus();
            // if not set autoExpandParent to false, if children expanded, parent can not collapse.
            // or, you can remove all expanded children keys.
            this.expandedKeys = expandedKeys;
            this.autoExpandParent = false;
            this.$emit('onExpand', this.expandedKeys);
        },
        // 选择某一项
        onSelect(selectedKeys, e) {
            if (selectedKeys.length <= 0) return false;
            this.selectedKeys = selectedKeys;
            // this.treeData = [];
            this.selectEmit(selectedKeys);
        },
        selectEmit(selectedKeys, itemData) {
            if (this.treeType === 'video' && !this.checkable) {
                this.$emit('onSelect', {
                    selectedKeys: this.selectedKeys,
                    itemData: itemData ? itemData : this.treeDataObj[selectedKeys[0]],
                });
            } else {
                this.$emit('onSelect', this.selectedKeys);
            }
        },
        onCheck(checkedKeys, info) {
            let { checkedNodes } = info,
                checked = [];
            checkedNodes.map((item) => {
                if (item.componentOptions.children.length <= 0) {
                    checked.push(item.key);
                }
            });
            this.$emit('onCheck', checked);
        },
        changeScroll() {
            let itemPosition = 0;
            this.firstItemArr.forEach((item) => {
                itemPosition += item;
            });
            setTimeout(() => {
                let dom = document.querySelector('.ant-tree');
                dom.scrollTop = itemPosition * 40;
            }, 500);
        },
        // selectChange (item) {
        //     this.selectedKeys = [item.key];
        //     this.$emit('getSiteId',this.selectedKeys);
        // },
        // onChangeReport(e){
        //     this.meterExam = e.target.checked;
        //     if(this.meterExam){
        //         this.regionParams.accountType = 'meter_exam';
        //     }else{
        //         this.regionParams.accountType = '';
        //     }
        //     // this.$emit('getMeterExamState',this.meterExam);
        //     this.toGetRegionTree();
        // },
        // onChangeCaliber(value){
        //     this.regionParams.caliber = value;
        //     this.toGetRegionTree();
        // },
        moreConditionConfirm() {
            this.toGetRegionTree();
        },
        groupIdFilterOption(input, option) {
            return (
                option.componentOptions.children[0].text
                    .toLowerCase()
                    .indexOf(input.toLowerCase()) >= 0
            );
        },
        // 跳转
        async toGetSystemPage() {
            const params = {
                menuLink: '/Navigation',
            };
            let [err, res] = await toPromise(getCommonSystemPage(params));
            if (err) {
                // return this.$message.error('服务异常');
                return;
            }
            if (res.data.status === 'complete') {
                window.open(res.data.resultData, '_blank');
            } else {
                this.$message.error(res.data.errorMessage || '网络异常');
            }
        },
        get({ children }) {
            // 递归增加树字段title,key
            children = children.map((child, index) => {
                if (child.children && child.children.length) {
                    child = {
                        ...child,
                        children: this.get(child),
                        title: child.name,
                        selectable: false,
                        key: child.id,
                    };
                } else {
                    child = {
                        ...child,
                        title: child.name,
                        key: child.id,
                        selectable: true,
                        scopedSlots: { title: 'title' },
                        status: this.treeNodeStatusObj[child.id],
                        isShow:true
                    };
                }
                return child;
            });
            return children;
        },
        async getTreeNodeStatus() {
            await getNodeStatus({}).then((res) => {
                let { status, resultData } = res;
                if (status === 'complete') {
                    this.TreeNodeStatus = resultData;
                    this.setTreeNodeStatus();
                }
            });
        },
        setTreeNodeStatus() {
            if (this.TreeNodeStatus.length > 0) {
                this.TreeNodeStatus.forEach((item) => {
                    this.treeNodeStatusObj[item.nodeId] = item.status;
                    return false;
                });
            }
        },
        // setInter() {
        //     if (this.setInterItme) clearInterval(this.setInterItme);
        //     this.setInterItme = setInterval(() => {
        //         this.getTreeNodeStatus();
        //     }, 60 * 1000);
        // }
    },
    beforeDestroy() {
        if (this.setInterItme) clearInterval(this.setInterItme);
    },
};
</script>

<style lang="less" scoped>
.treeDomSelectBox {
    position: relative;

    &.treeBoxType {
        padding-bottom: 36px;
    }
}

.keywordBox {
    margin-bottom: 8px;
}

.treeType {
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    text-align: center;
}

.ant-dropdown-menu {
    padding-left: 10px;
}

.icon-set {
    margin-left: 5px !important;
}

.loading {
    position: absolute;
    left: 50%;
    top: 50%;
    margin-top: -10px;
    margin-left: -10px;
}

.icon-ic_wifi {
    float: right;
    margin-top: 8px;
    font-size: 20px;
}
</style>
