<template>
  <w-modal
    class="secondary-modal"
    title="添加组态"
    :visible="visible"
    width="900px"
    centered
    @ok="handleOk"
    @cancel="handleCancel"
  >
    <!-- 添加组态 -->
    <w-form ref="addSvgForm" labelAlign="left" layout="inline" :form="form">
      <w-form-item label="组态类型">
        <w-select v-model="allSvgParams.condition.svgType" style="width:200px">
          <w-select-option value="">全部</w-select-option>
          <w-select-option v-for="item in typeList" :key="item.value" :value="item.value">
            {{ item.name }}
          </w-select-option>
        </w-select>
      </w-form-item>
      <w-form-item label="模板名称">
        <w-input
          style="width:200px"
          v-model="allSvgParams.condition.svgName"
          placeholder="请输入模板名称"
        />
      </w-form-item>
      <w-form-item label="">
        <w-button type="primary" style="margin-right: 10px;" @click="handleSearch()">查询</w-button>
        <w-button @click="reset()">重置</w-button>
      </w-form-item>
    </w-form>
    <w-table
      class="configuration-table"
      :pagination="false"
      :columns="allsvgcolumns"
      :row-selection="{
        type: 'radio',
        columnWidth: 80,
        columnTitle: '选择',
        selectedRowKeys: selectedRowKeys,
        onChange: onSelectChange
      }"
      :data-source="svgData"
      :scroll="{ y: 300 }"
    >
      <template slot="svgType" slot-scope="text">
        <span>{{ formateSvgType(text) }}</span>
      </template>
      <template slot="svgName" slot-scope="text, record">
        <span>{{ text }}&nbsp;&nbsp;</span>
        <w-popover
          trigger="hover"
          placement="bottom"
          :overlayStyle="{ width: '450px' }"
          :destroyTooltipOnHide="true"
        >
          <w-icon type="eye" class="supply-cursor-pointer" />
          <configuration-preview-only
            slot="content"
            :svgInfo="record"
            :svgZoomValue="420 / (record.svgWidth || 1860)"
          ></configuration-preview-only>
        </w-popover>
      </template>
    </w-table>
    <w-pagination
      v-if="allsvgTotal > 0"
      :current="allSvgParams.page.current"
      class="configuration-pagination"
      show-size-changer
      :default-current="1"
      :total="allsvgTotal"
      @showSizeChange="svgPageOrSizeChange"
      @change="svgPageOrSizeChange"
    />
  </w-modal>
</template>

<script>
import ConfigurationPreviewOnly from './ConfigurationPreviewOnly';
import { getDevicePhSvgList, addSiteSvg } from '@/api/configuration';
import { sysDictListByCode } from '@/api/manage';

const columns = [
  {
    title: '组态类型',
    dataIndex: 'svgType',
    key: 'svgType',
    scopedSlots: { customRender: 'svgType' }
  },
  {
    title: '组态编号',
    dataIndex: 'svgCode',
    key: 'svgCode',
    scopedSlots: { customRender: 'svgCode' }
  },
  {
    title: '组态名称',
    dataIndex: 'svgName',
    key: 'svgName',
    scopedSlots: { customRender: 'svgName' }
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    key: 'createDate'
  },
  {
    title: '修改时间',
    dataIndex: 'updateDate',
    key: 'updateDate'
  },
  {
    title: '操作',
    dataIndex: 'operation',
    scopedSlots: { customRender: 'operation' }
  }
];
const allsvgcolumns = columns.slice(0, 3);

export default {
  name: 'AddConfiguration',
  components: {
    ConfigurationPreviewOnly
  },
  props: {
    // 关联的泵房ID
    waterPlantId: {
      type: String,
      default: ''
    },
    // 组态类型
    svgType: {
      type: String,
      default: ''
    }
  },
  data() {
    return {
      visible: false,
      form: this.$form.createForm(this, { name: 'coordinated' }),
      typeList: [],
      columns,
      allsvgcolumns,
      allSvgParams: {
        // 获取所有组态数据的参数
        page: {
          current: 1,
          size: 10
        },
        condition: {
          svgType: '',
          svgName: ''
        }
      },
      allsvgTotal: 0,
      selectedRowKeys: [], // 选中要添加的组态
      svgData: [] // 组态数据
    };
  },
  mounted() {
    this.sysDictListByCode('plant_svg_type', 'typeList');
  },
  methods: {
    openModal() {
      this.visible = true;
      this.allSvgParams.condition.svgType = this.svgType;
      this.svgPageOrSizeChange(1, 10);
    },
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      if (data === 'svgTypeData') {
        let obj = {};
        res.resultData.forEach(item => {
          obj[item.value] = item.name;
        });
        this[data] = obj;
      } else {
        this[data] = res.resultData;
      }
    },
    /**
     * 翻页
     */
    svgPageOrSizeChange(current, pageSize) {
      this.allSvgParams.page.current = current;
      this.allSvgParams.page.size = pageSize;
      this.getSvgList();
    },
    /**
     * 获取组态列表
     */
    getSvgList() {
      getDevicePhSvgList(this.allSvgParams).then(res => {
        let { status, resultData } = res;
        if (status === 'complete') {
          this.allsvgTotal = resultData.total;
          resultData.records.forEach(item => {
            item.key = item.id;
          });
          this.svgData = resultData.records;
        }
      });
    },
    formateSvgType(v) {
      let { name } = this.typeList.find(({ value }) => value === v) ?? { name: v };
      return name;
    },
    /**
     * 查询组态模板列表
     */
    handleSearch() {
      this.allSvgParams.current = 1;
      this.getSvgList();
    },
    // 重置
    reset() {
      this.allSvgParams = {
        page: {
          current: 1,
          size: 10
        },
        condition: {
          svgType: this.svgType,
          svgName: ''
        }
      };
      this.getSvgList();
    },
    handleOk() {
      this.form.validateFields((err, values) => {
        if (!err) {
          this.addSiteSvg();
        }
      });
    },
    handleCancel() {
      this.form && this.form.resetFields();
      this.allSvgParams.condition.svgName = '';
      this.selectedRowKeys = [];
      this.selectedSvgType = '';
      this.visible = false;
    },
    /**
     * 添加组态
     */
    addSiteSvg() {
      let params = {
        waterPlantId: this.waterPlantId,
        svgId: this.selectedRowKeys[0],
        svgType: this.selectedSvgType
      };
      if (!this.selectedRowKeys[0]) {
        this.$message.warning('请选择组态！');
        return;
      }
      addSiteSvg(params).then(res => {
        if (res.status === 'complete') {
          this.$message.success('添加成功！');
          this.$emit('finished');
          this.handleCancel();
          this.selectedSvgType = '';
        }
      });
    },
    onSelectChange(selectedRowKeys, selectedRows) {
      this.selectedSvgType = selectedRows[0].svgType;
      this.selectedRowKeys = selectedRowKeys;
    }
  }
};
</script>

<style lang="less" scoped>
.configuration {
  &-table {
    .conlisttab-img {
      width: 60px;
      height: 30px;
    }
    /deep/td {
      vertical-align: middle;
    }
  }

  &-pagination {
    margin-top: 15px;
    padding: 10px;
    text-align: right;
  }
}
</style>
