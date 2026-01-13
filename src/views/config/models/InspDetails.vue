<!--
 * @Description: 巡检步骤新增 / 删除
 * @Author: limz
 * @Date: 2021-09-03 09:47:52
 * @LastEditTime: 2024-12-13 15:02:43
 * @LastEditors: 胡海鸥 huhaiou@shwpg.com
-->
<template>
  <w-modal
    v-if="visible"
    title="巡检项配置"
    :visible="visible"
    okText="保存"
    centered
    class="add-group secondary-modal"
    width="820px"
    :footer="false"
    @cancel="visible = false"
    :maskClosable="false"
  >
    <div class="btn-wrapper">
      <w-button type="primary" size="small" :disabled="!addStatus" @click="handleAdd">
        新增
      </w-button>
    </div>
    <w-table
      rowKey="id"
      :columns="columns"
      :data-source="data"
      :pagination="false"
      :loading="loading"
      :scroll="{ y: '360px' }"
    >
      <template
        v-for="col in ['type', 'inspectionValue', 'inspectionName', 'delFlag']"
        :slot="col"
        slot-scope="text, record"
      >
        <div :key="col">
          <template v-if="record.editable">
            <w-select
              v-if="col === 'type'"
              v-model="record[col]"
              style="width: 100%"
              size="small"
              :options="typeList"
              placeholder="请选择类型"
              @select="changeType"
            >
            </w-select>
            <w-select
              v-else-if="col === 'inspectionValue' && type === 1"
              ref="inspectionValue"
              v-model="pointCode"
              mode="multiple"
              :allowClear="true"
              :filterOption="false"
              size="small"
              :options="renderedOptions"
              placeholder="请选择\输入监测量"
              style="width: 100%"
              :maxTagCount="1"
              :maxTagTextLength="4"
              dropdownClassName="supervise-set-select"
              showSearch
              @search="handleSearch"
              @popupScroll="handleScroll"
              @select="handleSelect"
              @dropdownVisibleChange="dropDownSelect"
            />
            <w-switch
              v-else-if="col === 'delFlag'"
              v-model="record[col]"
              size="small"
              placeholder="请选择是否启用"
            />
            <w-input v-else v-model="record[col]" placeholder="请输入内容" size="small" style="margin: -5px 0" />
          </template>
          <template v-else>
            <span v-if="col === 'type'">{{ inspectTypeList[text] }}</span>
            <span v-else-if="col === 'delFlag'">{{ text ? '是' : '否' }}</span>
            <span v-else-if="col === 'inspectionValue'" class="cut" :title="text">
              {{ record.pointName }}
            </span>
            <span v-else class="cut" :title="text">{{ text }}</span>
          </template>
        </div>
      </template>
      <template slot="action" slot-scope="text, record">
        <div class="editable-row-operations">
          <span v-if="record.editable">
            <a style="margin-right:4px" @click="() => save(record.id)">保存</a>
            <a @click="cancel(record.id)">取消</a>
          </span>
          <span v-else>
            <a :disabled="editingKey !== ''" @click="() => edit(record)">编辑 </a>
            <a :disabled="editingKey !== ''" @click="() => deleteItem(record.id)"> 删除</a>
          </span>
        </div>
      </template>
    </w-table>
  </w-modal>
</template>

<script>
const columns = [
  {
    title: '序号',
    dataIndex: 'index',
    width: 70,
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '类型',
    dataIndex: 'type',
    width: 90,
    scopedSlots: { customRender: 'type' }
  },
  {
    title: '关联监测量',
    dataIndex: 'inspectionValue',
    ellipsis: true,
    width: 220,
    scopedSlots: { customRender: 'inspectionValue' }
  },
  {
    title: '巡检内容',
    dataIndex: 'inspectionName',
    ellipsis: true,
    scopedSlots: { customRender: 'inspectionName' }
  },
  {
    title: '是否启用',
    dataIndex: 'delFlag',
    ellipsis: true,
    width: 100,
    scopedSlots: { customRender: 'delFlag' }
  },
  {
    title: '操作',
    dataIndex: 'action',
    width: 100,
    ellipsis: true,
    scopedSlots: { customRender: 'action' }
  }
];
const inspectTypeList = ['视频', '数据', '报警'];
const LOAD_NUM = 100; // 加载条数--可自定义
import debounce from 'lodash/debounce';
import {
  InspConfigDetailList, // 保存修改
  SaveInspConfigDetail, // 保存
  pageQueryPage,
  GetGroupPointPage,
  allPointList, // 所有监测量
  DeleteConfigDetail // 删除巡检项
} from '@/api/manage';
export default {
  name: 'InspDetails',
  props: {
    devList: {
      type: Array,
      default: () => []
    },
    editInfo: {
      type: Object,
      default: () => {}
    }
  },
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      visible: false,
      form: this.$form.createForm(this),
      delFlag: true,
      formData: {},
      data: [],
      columns,
      editingKey: '',
      loading: false,
      addStatus: true,
      typeList: [
        {
          label: '视频',
          value: 0
        },
        {
          label: '数据',
          value: 1
        },
        {
          label: '报警',
          value: 2
        }
      ],
      pointsList: [],
      pointCode: '',
      renderedOptions: [],
      searchVal: '',
      type: '',
      inspectTypeList
    };
  },
  watch: {
    visible(val) {
      if (val) {
        this.editingKey = '';
        this.getList();
      } else {
        this.addStatus = true;
      }
    }
  },
  methods: {
    async getList() {
      let points =
        this.editInfo.type === 0 ? await this.getPumpPointList() : await this.getAllpoints();
      this.pointsList = points;
      this.renderedOptions = this.pointsList;
      InspConfigDetailList(this.editInfo.id).then(res => {
        if (res.status === 'complete') {
          this.data = res.resultData.map(r => {
            let data = [];
            this.pointsList.forEach(p => {
              let arr = r.inspectionValue?.split(',') || [];
              // eslint-disable-next-line max-nested-callbacks
              if (arr.find(a => a === p.value)) {
                data.push(p.label);
              }
            });
            return {
              ...r,
              pointName: data.join(),
              delFlag: r.delFlag === 0
            };
          });
        }
      });
    },

    /* 所有监测量 */
    async getAllpoints() {
      let { status, resultData } = await allPointList();
      let data = status === 'complete' ? resultData.map(p => {
        return {
          label: p.pointMemo,
          value: p.pointName,
          key: p.pointName
        };
      }) : [];
      return data;
    },
    /* 解决分页数据后部分监测量显示code问题 */
    dropDownSelect(open) {
      this.renderedOptions = open ? this.pointsList.slice(0, LOAD_NUM) : this.pointsList;
    },
    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.searchVal = val;
      let filterList = [];
      if (val) {
        filterList = this.pointsList.filter(item => {
          let value = item.value + item.label;
          return value.indexOf(val) > -1;
        });
      } else {
        filterList = this.pointsList;
      }
      this.filterDataList = filterList;
      this.renderedOptions =
        filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
    },
    // 滚动时触发（防止抖动）
    handlePopupScroll() {
      if (this.searchVal === '') {
        this.loadMoreData(this.pointsList);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    },
    // 加载更多数据到select框
    loadMoreData(dataList) {
      const renderedLen = this.renderedOptions.length; // 已渲染的下拉列表长度
      const totalLen = dataList.length; // 当前数据源的长度
      let addList = [];
      if (renderedLen < totalLen) {
        if (renderedLen + LOAD_NUM <= totalLen) {
          addList = dataList.slice(renderedLen, renderedLen + LOAD_NUM);
        } else {
          addList = dataList.slice(renderedLen, renderedLen + (totalLen % LOAD_NUM));
        }
        this.renderedOptions = this.renderedOptions.concat(addList);
      }
    },
    changeType(type) {
      this.type = type;
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      if (this.searchVal) {
        const selectedArr = this.pointsList.filter(item => item === val); // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const restList = this.pointsList.filter(item => item !== val); // 从数据源中过滤出其他的值，返回一个数组
        const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        this.renderedOptions = newList; // 更新已渲染的下拉列表
        this.pointsList = selectedArr.concat(restList); // 更新数据源
        this.searchVal = ''; // 因为触发handleSelect函数时，会自动清空用户输入的内容。因此，searchVal需要重置。
      }
    },

    async getPumpPointList() {
      this.pointCode = '';
      let params = {
        keyword: '',
        type: this.editInfo.type, // 监测量类型 0泵房配置，1设备配置
        // groupType: 'online_inspection_point_group',
        page: { current: 1, size: 999 }
      };
      let data = [];
      let res = await pageQueryPage(params);
      if (res.status === 'complete') {
        let records = res.resultData?.records;
        data = records.map(r => {
          return {
            label: r.name,
            value: r.code,
            key: r.code
          };
        });
      }
      return data;
    },

    async getDevPointList() {
      this.pointCode = '';
      let params = {
        groupCode: 'online_inspection_point_group',
        industryDeviceIds: [],
        pageCode: 'inspection_page',
        platform: 1,
        pumpId: ''
      };
      let data = [];
      let res = await GetGroupPointPage(params);
      if (res.status === 'complete') {
        let records = [];
        if (res.resultData?.length > 0) {
          records = res.resultData[0].data || [];
        }
        data = records.map(r => {
          return {
            label: r.pointMemo,
            value: r.pointName
          };
        });
      }
      return data;
    },

    save(id) {
      const target = this.data.filter(item => id === item.id)[0];
      if (target) {
        if (target.type === 0 || target.type === 1 || target.type === 2) {
          if (target.type === 1 && !this.pointCode) {
            this.$message.warn('请填写监测量');
            return;
          }
        } else {
          this.$message.warn('请选择类型');
          return;
        }
        delete target.editable;
        let params = {
          ...target,
          delFlag: target.delFlag ? 0 : 1,
          id: target.id === -1 ? '' : target.id,
          configId: this.editInfo.id
        };
        if (target.type === 1) params.inspectionValue = this.pointCode.join();
        SaveInspConfigDetail(params).then(res => {
          if (res.status === 'complete') {
            this.$message.success('保存成功');
          }
          this.getList();
        });
      }
      this.editingKey = '';
      this.addStatus = true;
    },

    /* 新增 */
    handleAdd() {
      let newData = {
        type: '',
        inspectionValue: '',
        inspectionName: '',
        delFlag: true,
        id: -1
      };
      this.pointCode = '';
      this.data.push(newData);
      this.addStatus = false;
      this.edit(newData);
    },

    edit({ id, inspectionValue, type }) {
      this.pointCode = inspectionValue ? inspectionValue.split(',') : [];
      this.addStatus = false;
      this.type = type;
      const newData = [...this.data];
      const target = newData.filter(item => id === item.id)[0];
      this.editingKey = id;
      if (target) {
        target.editable = true;
        this.data = newData;
      }
    },

    async deleteItem(id) {
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        type: 'warning',
        onOk: async () => {
          let ret = await DeleteConfigDetail(id);
          if (ret.status === 'complete') {
            this.$message.success('删除成功');
            this.getList();
          }
        }
      });
    },

    cancel() {
      this.editingKey = '';
      this.pointCode = '';
      this.getList();
      this.addStatus = true;
    }
  }
};
</script>

<style scoped lang="less">
.add-group{
  /deep/ .wpg-modal-header {
    background-color: var(--supply-color-bg-card-dark);
    padding: 12px 4px;
    &::after {
      display: none;
    }
  }
}
.btn-wrapper {
  text-align: right;
  padding-bottom: 8px;
}
/deep/ .ant-modal-body {
  height: 450px;
}
.cut {
  width: 100%;
  display: inline-block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
