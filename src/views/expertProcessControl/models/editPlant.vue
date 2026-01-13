<template>
  <div class="config-table supply-bg-bg-card-DEFAULT">
    <w-button
      v-if="editPower && addBtn"
      :disabled="addbtnDisabled"
      type="primary"
      icon="ic_add"
      @click="addPlnList"
    >
      <span>新增{{ addBtn }}</span>
    </w-button>
    <div class="table-wrapper">
      <w-config-provider>
        <w-table
          class="tableDevice"
          ref="wTable"
          :columns="columns"
          :data-source="modalListData"
          :scroll="tableScroll"
          :pagination="false"
          rowKey="num"
        >
          <template slot="modelPoint" slot-scope="text, record, index">
            <w-input v-if="record.editable" style="margin: -5px 0" v-model="record.modelPoint" />
            <template v-else>
              {{ text }}
            </template>
          </template>
          <template slot="modelValue" slot-scope="text, record, index">
            <div v-if="record.editable" style="margin: -5px 0">
              <w-input v-model="record.modelValue" />
            </div>
            <template v-else>
              {{ text }}
            </template>
          </template>
          <template slot="measuresType" slot-scope="text, record, index">
            <template>
              {{ measuresTypeObj[text] }}
            </template>
          </template>
          <template slot="measures" slot-scope="text, record, index">
            <w-textarea v-if="record.editable" style="margin: -5px 0" v-model="record.measures" />
            <template v-if="!record.editable">
              {{ text }}
            </template>
          </template>
          <template slot="sort" slot-scope="text, record, index">
            <w-input
              v-if="record.editable"
              type="number"
              style="margin: -5px 0"
              v-model="record.sort"
            />
            <template v-else>
              {{ text }}
            </template>
          </template>
          <template v-if="editPower" slot="operation" slot-scope="text, record, index">
            <div>
              <span v-if="record.editable">
                <a @click="() => save(record)">保存</a>
                <w-divider type="vertical"></w-divider>
                <a @click="() => cancel(record, index)">取消</a>
              </span>
              <span v-else>
                <a :disabled="editingKey !== ''" @click="() => edit(record)">编辑</a>
                <!-- <w-divider type="vertical"></w-divider>
                <a :disabled="editingKey !== ''" @click="() => delet(index)">删除</a> -->
              </span>
            </div>
          </template>
        </w-table>
      </w-config-provider>
    </div>
    <w-button
      v-if="editPower && !addBtn"
      type="primary"
      style="float: right;margin:12px 0"
      @click="addPlnList"
    >
      <span>确定</span>
    </w-button>
  </div>
</template>

<script>
import draggable from 'vuedraggable';
import { sysDictListByCode } from '@/api/manage';
export default {
  name: 'editPlant',
  data() {
    return {
      addbtnDisabled: false, //列表添加按钮是否禁用
      modalListData: [], //列表数据
      rowData: [],
      measuresTypeObj: {}, //施类型对象
      measuresTypeList: [], //施类型选项
      editingKey: '', //编辑某一行时，其他行精致编辑
      cacheData: [],
      editingRecord: {} // 编辑前的记录备份
    };
  },
  props: {
    tableData: {
      type: Array,
      default: () => []
    },
    modalColumns: {
      type: Array,
      default: () => []
    },
    //是否支持编辑
    editPower: {
      type: Boolean
    },
    addBtn: {
      type: String,
      default: ''
    }
  },
  mounted() {
    this.getMeasuresTypeObj();
    this.initTableData();
  },
  computed: {
    columns() {
      return this.editPower
        ? this.modalColumns
        : this.modalColumns.filter(item => item.dataIndex !== 'operation');
    },
    tableScroll() {
      return this.editPower && this.addBtn ? { y: 'auto' } : { y: 450 };
    }
  },
  watch: {},
  methods: {
    onUpdate(list) {
      let planIds = list.map(item => item.id).join(',');
    },
    initTableData() {
      this.modalListData = this.tableData;
      this.cacheData = this.tableData.map(item => ({ ...item }));
    },
    // 措施类型对象
    async getMeasuresTypeObj() {
      let res = await sysDictListByCode('measures_type');
      if (res.success) {
        this.measuresTypeList = res.resultData?.map(item => {
          this.measuresTypeObj[+item.dictValue] = item.dictName;
          return {
            label: item.dictName,
            value: +item.dictValue
          };
        });
      }
      this.modalListData = [...this.modalListData];
    },
    addPlnList() {
      this.addbtnDisabled = true;
      this.modalListData.push({
        editable: true,
        newplan: true
      });
      this.editingKey = 'ing';
      this.$nextTick(() => {
        const scrollElement = this.$refs.wTable.$el.querySelector('.wpg-table-body');
        if (scrollElement) {
          scrollElement.scrollTop = scrollElement.scrollHeight;
        }
      });
    },
    handleChange(value, num, column) {
      const newData = [...this.modalListData];
      const target = newData.find(item => num === item.num);
      if (target) {
        target[column] = value;
        this.modalListData = newData;
      }
    },
    //如果新增为空不保存
    arePropertiesEmpty(obj) {
      const properties = ['measuresType', 'measures', 'sort'];
      for (let prop of properties) {
        if (obj[prop] !== null && obj[prop] !== undefined && obj[prop] !== '' && obj[prop] !== 0) {
          return false; // 如果属性不是null、undefined、空字符串或0，则返回false
        }
      }
      return true; // 所有属性都被认为是“没有值”，则返回true
    },
    save(record) {
      this.addbtnDisabled = false;
      this.editingKey = '';
      let addSuccess = this.arePropertiesEmpty(record);
      if (addSuccess) {
        this.modalListData = this.modalListData.filter(item => !item.editable);
      } else {
        delete record.editable;
        delete record.newplan;
      }
      this.$emit('editPlanList', this.modalListData);
    },
    cancel(record, index) {
      this.addbtnDisabled = false;
      this.editingKey = '';
      let addSuccess = this.arePropertiesEmpty(record);
      if (addSuccess) {
        this.modalListData.splice(index, 1);
      } else {
        if (record.newplan) {
          this.modalListData = this.modalListData.filter(item => !item.newplan);
        } else {
          Object.assign(record, this.editingRecord);
        }
      }
      delete record.editable;
      this.editingRecord = {};
    },
    delet(index) {
      this.modalListData.splice(index, 1);
      this.$emit('editPlanList', this.modalListData);
    },
    edit(record) {
      this.addbtnDisabled = true;
      this.editingKey = 'ing';
      this.editingRecord = { ...record };
      record.editable = true;
    }
  }
};
</script>
<style lang="less" scoped>
.config-table {
  padding-bottom: 12px;
}
</style>
