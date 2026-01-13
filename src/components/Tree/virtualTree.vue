<template>
 <div
   :class="['treeDomSelectBox', treeTypeShow?'treeBoxType':'']"
   :style="`width:${treeWidth}`"
   ref="tree"
 >
   <div class="conditionBox keywordBox">
     <w-input-search v-model="filterText" placeholder="关键词" @search="onSearchTree" />
   </div>
   <vc-tree
     :data="treeData"
     nodeKey="key"
     :props="defaultProps"
     default-expand-all
     :height="height"
     :current-node-key="currentNodeKey"
     :filter-node-method="filterNode"
     @node-click="currentChange"
     @check="currentCheck"
     ref="vctree"
     :show-checkbox="checkable">
   </vc-tree>
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
           v-if="treeData.length>0"
         >{{item.label}}</w-radio>
       </w-radio-group>
     </w-menu>
   </w-dropdown>
 </div>
</template>
<script>
    import VcTree from  '../VcTree/src/VcTree';
    import { getTreeData, getTreeTypeList, getNodeStatus, changeTreeType } from '@/api/baseInfo';
    import { mapState, mapMutations } from 'vuex';
    export default {
        components:{VcTree},
        data() {
            return {
                height: 500,
                radioStyle: {
                    display: 'block',
                    height: '30px',
                    lineHeight: '30px',
                },
                queryParams: {
                    treeCode: '2',
                    treeType: this.treeType,
                },
                defaultProps: {
                    children: 'children',
                    label: 'title'
                },
                treeDataObj: {},
                treeTypeList: [],
                treeData:[],
                TreeNodeStatus:[],
                treeNodeStatusObj: {},
                preCurrentNodeKey:'',
                currentNodeKey:'',
                checkedKeys:[],
                filterText: '',
            };
        },
        props:{
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
        mounted(){
            this.$nextTick(() => {
                this.init();
            });
        },
        methods:{
            ...mapMutations('tree', ['setTreeDataObjCurrent', 'setTreeDataListObj']),
            async init() {
                this.height = this.$refs.tree.offsetHeight - 100
                await this.getTreeType();
                await this.getTreeNodeStatus();
                this.getTree();
            },
            filterNode(value, data) {
                if (!value) return true;
                return (data.title.indexOf(value) !== -1 || data.key.indexOf(value) !== -1);
            },
            currentChange(e, node){
                if(node.isLeaf){
                    this.currentNodeKey = e.key;
                    this.preCurrentNodeKey = e.key;
                }else{
                    this.currentNodeKey = this.preCurrentNodeKey;
                }
                this.selectEmit();
            },
            currentCheck(e, keys){
                let {checkedKeys, checkedNodes} = keys
                this.checkedKeys = checkedKeys
                this.selectEmit();
            },
            onSearchTree(val) {
                this.$refs.vctree.filter(val);
            },

            treeTypeOnChange(e) {
                this.queryParams.treeCode = e.target.value;
                changeTreeType(this.queryParams.treeCode).then(res => {})
                this.getTree();
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

            /**
             * 获取树节点状态
             */
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

            /**
             * 获取树数据
             */
            getTree() {
                this.loading = true;
                this.treeData = [];
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

            //获取树形控件数据
            toGetRegionTree(resultData) {
                this.selectedKeys = [];
                this.expandedKeys = [];
                resultData.forEach((item, index) => {
                    if (index === 0) {
                        if (!this.pageSiteId) {
                            // 选中第一个节点
                            this.currentNodeKey = this.toGetSelectKey(item).expandedKeys
                            this.preCurrentNodeKey = this.currentNodeKey
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
                this.generateList(this.treeData);
                this.selectEmit(this.currentNodeKey, this.treeDataObj[this.currentNodeKey]);
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
                    selectedKeys: '',
                }
            ) {
                if (!child)
                    return {
                        expandedKeys: [],
                        selectedKeys: [],
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
             * 出发选中事件
             * @param selectedKeys
             * @param itemData
             */
            selectEmit(selectedKeys, itemData) {
                if (this.treeType === 'video' && !this.checkable) {
                    this.$emit('onSelect', {
                        selectedKeys: [this.currentNodeKey],
                        itemData: itemData ? itemData : this.treeDataObj[this.currentNodeKey],
                    });
                } else {
                    this.$emit('onSelect', this.checkedKeys);
                }
            },

        }
    }

</script>
<style lang="less" scoped>
  .treeDomSelectBox {
    position: relative;
    height: 100%;
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
    white-space:nowrap;
  }
</style>
