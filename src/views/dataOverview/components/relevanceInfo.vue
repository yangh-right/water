<!--
 * @Description: 关联监测量
 * @Author: limz
 * @Date: 2021-06-15 09:44:04
 * @LastEditTime: 2024-09-23 16:32:17
 * @LastEditors:  Do not edit
-->
<template>
    <div>
      <w-modal
        class="secondary-modal"
        :title="item.title"
        :visible="visible"
        okText="保存"
        width="1000px"
        @cancel="visible = false"
        @ok="handleOk"
      >
        <w-row id="modalWrapper" class="query-form modal-wrapper">
          <w-col :span="11" class="modal-left supply-border-border-split">
            <template v-if="item.tabs.length > 0">
              <w-col
                v-for="(tab, idx) in item.tabs"
                :key="idx"
                :class="['modal-left-tip supply-text-sm supply-text-main supply-border-border-split', { active: current === idx + 1 }]"
                :span="12"
                @click="current = idx + 1"
              >
                {{ tab }}
              </w-col>
            </template>
            <w-col
              v-if="item.isShowSearch"
              :class="['modal-left-tip supply-text-sm supply-text-main supply-border-border-split']"
              :span="24"
            >
              <w-input-search v-model.trim="keyWord" placeholder="请输入" @search="getPoints(1)" />
            </w-col>
            <w-col class="rule-box" :span="24">
              <template v-if="standardPList && standardPList.length > 0 && current === 1">
                <w-col>
                  <w-tabs
                    :default-active-key="standardPList[0].data[0].pointType"
                    tab-position="left"
                  >
                    <w-tab-pane
                      v-for="tab in standardPList"
                      :key="tab.data[0].pointType"
                      :tab="tab.name"
                    >
                      <w-table
                        :row-selection="rowSelection"
                        :columns="item.columns"
                        :selectedRowKeys="selectedRowKeys"
                        :data-source="filterData(tab.data)"
                        :rowKey="record => record.pointName"
                        :scroll="{ y: '310px' }"
                        :class="{ 'hide-headcheck': !item.isCheckAll }"
                        :pagination="{
                          total: filterData(tab.data).length,
                          size: 'small'
                        }"
                      >
                      </w-table>
                    </w-tab-pane>
                  </w-tabs>
                </w-col>
              </template>
              <template v-else-if="unStandardPList.length > 0 && current === 2">
                <w-col>
                  <w-table
                    :row-selection="rowSelection"
                    :columns="item.columns"
                    :rowKey="record => record.pointName"
                    :data-source="filterData(unStandardPList)"
                    :scroll="{ y: '310px' }"
                    :pagination="{
                      total: filterData(unStandardPList).length,
                      size: 'small'
                    }"
                  >
                  </w-table>
                </w-col>
              </template>
              <w-empty v-else></w-empty>
            </w-col>
          </w-col>
          <w-col :span="2" class="modal-center">
            <w-icon type="double-right" class="supply-cursor-pointer" @click="confirmPoints" />
          </w-col>
          <w-col :span="11" class="modal-right supply-border-border-split">
            <w-col class="selected-label supply-text-sm supply-text-main supply-border-border-split" :span="24">
              已{{ item.title }}（{{ associatedPointList.length }}）
            </w-col>
            <w-col class="selected-rule-box" :span="24">
              <w-col class="supply-bg-bg-card-light supply-text-deviate selected-rule-title" :span="24">
                <w-col
                  v-for="(text, idx) in item.columns"
                  :key="text.dataIndex"
                  :span="idx === 0 ? 5 : 8"
                >
                  <span class="text"> {{ text.title }} </span>
                </w-col>
                <w-col :span="3">
                  <span class="action supply-float-right">操作</span>
                </w-col>
              </w-col>
              <w-col id="selectedRuleCon" class="selected-rule-content" :span="24">
                <w-col
                  v-for="(point, i) of associatedPointList"
                  :key="point.pointCode"
                  class="supply-bg-bg-invalid supply-text-secondary selected-rule"
                  :span="24"
                >
                  <w-col
                    v-for="(text, idx) in item.columns"
                    :key="text.dataIndex"
                    class="rule-label"
                    :span="idx === 0 ? 5 : 8"
                  >
                    <span class="text" :title="point[text.dataIndex]">
                      {{ point[text.dataIndex] }}
                    </span>
                  </w-col>
                  <w-col class="rule-handle" :span="3">
                    <w-icon
                      class="supply-cursor-pointer"
                      type="close"
                      @click="cancelSelectedRule(i, point)"
                    />
                  </w-col>
                </w-col>
              </w-col>
            </w-col>
          </w-col>
          <w-col v-if="item.draggable" :span="24" class="supply-text-third supply-text-xs tips">
            注：选择的监测量将展示在表格中，可对已选监测量进行拖动排序以确定展示顺序
          </w-col>
        </w-row>
      </w-modal>
    </div>
  </template>
  
  <script lang="ts">
  import Vue from 'vue';
  import Sortable from 'sortablejs';
  import {
    standardPoints, // 获取标准监测量 未关联
    nonStandardPoints, // 获取非标准监测量 未关联
    associated, // 获取监测量 已关联
    addOrDelPointGroup // 关联监测量
  } from '@/api/manage';
  
  export default Vue.extend({
    name: 'RelevanceInfo',
    props: {
      item: {
        type: Object,
        default: () => {}
      }
    },
    data() {
      return {
        visible: false,
        current: 1,
        selectedRowKeys: [],
        standardPList: [],
        unStandardPList: [],
        associatedPointList: [], // 右侧显示
        selectedPoints: [], // 左侧已勾选的
        associatedInitVal: [], // 已关联
        keyWord: ''
      };
    },
    computed: {
      rowSelection() {
        let that: any = this;
        return {
          onSelect: (record, selected) => {
            if (selected) {
              that.selectedPoints.push(record);
            } else {
              let idx = that.selectedPoints.findIndex(p => p.pointName === record.pointName);
              if (idx > -1) that.selectedPoints.splice(idx, 1);
            }
          },
          onSelectAll: (selected, selectedRows, changeRows) => {
            changeRows.forEach(row => {
              if (selected) {
                that.selectedPoints.push(row);
              } else {
                let idx = that.selectedPoints.findIndex(p => p.pointName === row.pointName);
                if (idx > -1) that.selectedPoints.splice(idx, 1);
              }
            });
          },
          selectedRowKeys: that.selectedRowKeys,
          onChange: selectedRowKeys => {
            this.selectedRowKeys = selectedRowKeys;
          }
        };
      },
      filterData() {
        return (data: Object[]) => {
          let arr: Object[] = [];
          data.forEach((d: any) => {
            let idx: number = this.associatedPointList.findIndex(
              (p: any) => p.pointName === d.pointName
            );
            if (idx <= -1) arr.push(d);
          });
          return arr;
        };
      }
    },
    watch: {
      visible(val) {
        if (val && this.item.id) {
          this.getPoints(0);
        } else {
          this.selectedPoints = [];
          this.selectedRowKeys = [];
          this.current = 1;
          this.keyWord = '';
        }
      }
    },
    methods: {
      /* 获取监测量 */
      async getPoints(num) {
        let _this: any = this;
        _this.globalLoading.show({ domId: 'modalWrapper' });
        let params = {
          id: this.item.id,
          keyWord: this.keyWord
        };
        // 标准监测量
        let standP: any = await standardPoints(params);
        this.standardPList = standP.resultData;
        // 非标监测量
        let unStandP: any = await nonStandardPoints(params);
        this.unStandardPList = unStandP.resultData;
        if (num === 0) {
          // 已关联
          let points: any = await associated(this.item.id);
          _this.associatedInitVal = [...points.resultData];
          _this.associatedPointList = [...points.resultData];
  
          if (this.item.draggable) {
            setTimeout(() => {
              const dom = document.getElementById('selectedRuleCon') as HTMLElement;
              Sortable.create(dom, {
                animation: 150,
                onUpdate: evt => {
                  // 在更新时才进行改变数组
                  const { newIndex, oldIndex } = evt;
                  // 插件只是进行了元素的位置改变, 需要手动更改数据, 真实修改排序
                  _this.associatedPointList.splice(
                    newIndex,
                    0,
                    _this.associatedPointList.splice(oldIndex, 1)[0]
                  );
                }
              });
            }, 20);
          }
        }
      },
      /* 移到右侧 */
      confirmPoints() {
        this.associatedPointList = this.associatedPointList.concat(this.selectedPoints);
        this.selectedPoints = [];
        this.selectedRowKeys = [];
      },
      /* 取消关联 */
      cancelSelectedRule(i: number, point: any) {
        this.associatedPointList.splice(i, 1);
        let idx: number = this.associatedInitVal.findIndex(
          (p: any) => p.pointName === point.pointName
        );
        if (idx > -1) {
          // 删除已关联的监测量, isAlias, 非标1的直接插进去, 标准0通过pointType判断加进去对应的表格
          let that: any = this;
          if (point.isAlias === 1) {
            that.unStandardPList.unshift(point);
          } else {
            let index: number = this.standardPList.findIndex(
              (g: any) => g.data[0].pointType === point.pointType
            );
            if (index > -1) {
              that.standardPList[index].data.unshift(point);
            } else {
              that.standardPList.unshift({
                data: [point],
                name: point.pointTypeName
              });
            }
          }
        }
      },
      handleOk() {
        if (this.associatedPointList.length > 50) {
          this.$message.error('已关联监测量不能超过50个');
          return false;
        }
        this.$confirm({
          title: '提示',
          content: '确定要提交吗？',
          onOk: () => {
            let params: Object = {
              pointGroupId: this.item.id,
              pointGroupRels: this.associatedPointList.map((p: any) => {
                return {
                  isAlias: p.isAlias, // 0标准 1非标
                  point: p.pointName,
                  pointGroupId: this.item.id
                };
              })
            };
            addOrDelPointGroup(params).then((res: any) => {
              if (res.status === 'complete' && res.resultData) {
                this.$message.success('修改成功');
                this.visible = false;
                this.$emit('change', true);
              }
            });
          }
        });
      }
    }
  });
  </script>
  
  <style scoped lang="less">
  .modal-wrapper {
    height: 500px;
    display: flex;
    position: relative;
    .modal-center {
      display: flex;
      align-items: center;
      justify-content: center;
      max-width: 60px;
      .anticon {
        width: 100%;
        line-height: 40px;
      }
    }
    .modal-left,
    .modal-right {
      flex-grow: 1;
      border-style: solid;
      border-width: 1px;
      border-radius: 4px;
    }
    .modal-left {
      .search-box {
        height: 38px;
        padding-bottom: 2px;
      }
      .rule-box {
        height: calc(100% - 94px);
        overflow-y: auto;
        > .wpg-col {
          height: 100%;
        }
        .rule {
          height: 34px;
          line-height: 34px;
        }
        /deep/ .wpg-tabs {
          height: 100%;
          .wpg-tabs-nav-wrap {
            // background-color: #f9fafb;
            background-color: var(--supply-color-table-interval);
          }
          .wpg-tabs-content {
            padding: 0;
          }
          .wpg-tabs-tab {
            font-size: 12px;
            margin: 0;
            padding: 9px 18px;
            &.wpg-tabs-tab-active {
              // background-color: #fff;
              color: var(--supply-color-primary-DEFAULT);
              background-color: var(--supply-color-bg-select-active);
            }
          }
        }
        .hide-headcheck /deep/ .wpg-table-thead {
          th .wpg-table-selection {
            display: none;
          }
        }
      }
      .modal-left-tip {
        height: 52px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 0 16px;
        border-bottom-width: 1px;
        border-bottom-style: solid;
        cursor: pointer;
        &.active {
          // color: #4285f4;
          color: var(--supply-color-primary-DEFAULT);
          // border-bottom-color: #4285f4;
          border-bottom-color: var(--supply-color-primary-DEFAULT);
          border-bottom-width: 2px;
        }
      }
    }
    .modal-right {
      .selected-label {
        height: 52px;
        padding-left: 16px;
        display: flex;
        align-items: center;
        border-bottom-width: 1px;
        border-bottom-style: solid;
      }
      .selected-rule-title {
        height: 39px;
        line-height: 39px;
        padding: 0 10px;
        display: flex;
        align-items: center;
        justify-content: space-around;
        .action {
          padding-right: 10px;
        }
      }
      .selected-rule-box {
        height: calc(100% - 40px);
        padding: 6px 8px 12px;
        .selected-rule-content {
          overflow-y: auto;
          height: calc(100% - 40px);
        }
        .selected-rule {
          height: 32px;
          border-radius: 4px;
          padding: 0 10px;
          margin: 6px 0;
          display: flex;
          align-items: center;
          justify-content: space-around;
          .rule-label,
          .rule-handle {
            height: 100%;
            display: flex;
            align-items: center;
            padding-right: 8px;
            .text {
              display: block;
              width: 100%;
              white-space: nowrap;
              overflow: hidden;
              text-overflow: ellipsis;
            }
          }
          .rule-handle {
            justify-content: flex-end;
          }
        }
      }
    }
    .tips {
      position: absolute;
      bottom: -50px;
      left: 0;
    }
  }
  </style>
  