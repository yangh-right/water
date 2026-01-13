<template>
  <div class="configuration-box">
    <div class="configuration-header supply-bg-bg-card-DEFAULT">
      <w-form-model class="warehouse-common-top" ref="formItems" :model="params" v-bind="layout">
        <w-row :gutter="10">
          <w-col :span="6">
            <w-form-model-item label="关键字：" prop="keyWord">
              <w-input v-model="params.keyWord" placeholder="请输入关键字"></w-input>
            </w-form-model-item>
          </w-col>
          <w-col class="supply-float-right">
            <w-form-model-item :labelCol="{ span: 0 }" :wrapperCol="{ span: 24 }">
              <w-button class="supply-mr-3" icon="reload" @click="handleReset">
                <span>重置</span>
              </w-button>
              <w-button type="primary" icon="ic_search" @click="handleSearch">
                <span>查询</span>
              </w-button>
              <return-control :is-drill-down="true"></return-control>
            </w-form-model-item>
          </w-col>
        </w-row>
      </w-form-model>
    </div>
    <div class="configuration-body supply-bg-bg-card-DEFAULT">
      <!-- 该table为水厂下的组态数据 -->
      <w-table
        class="configuration-table"
        :pagination="false"
        :columns="columns"
        :data-source="waterWorkSvgData"
        :scroll="{ y: 'calc(100vh - 250px)' }"
        :rowClassName="(record, index) => (index === deletingRow ? 'deleting-row' : '')"
      >
        <template slot="operation" slot-scope="text, record, index">
          <a v-permission:menu="'configuration-edit'" @click="editSvg(record.id)">编辑</a>
          <w-divider type="vertical" />
          <a @click="deleteSvg(record.id, index)">删除</a>
        </template>
        <span slot="svgType" slot-scope="text">
          {{ svgTypeData ? svgTypeData[text] : '' }}
        </span>
      </w-table>
      <w-pagination
        v-if="total > 0"
        :current="params.current"
        :page-size-options="['10', '20', '50']"
        :showTotal="total => `共${total}条`"
        class="configuration-pagination"
        show-size-changer
        :default-current="1"
        :total="total"
        @change="pageOrSizechange"
        @showSizeChange="pageOrSizechange"
      />
    </div>
    <energy-config-dialog ref="configDialog" :formType="2" :formData="energyData" />
  </div>
</template>

<script>
const columns = [
  {
    title: '组态类型',
    dataIndex: 'svgType',
    key: 'svgType',
    scopedSlots: { customRender: 'svgType' }
  },
  {
    title: '组态名称',
    dataIndex: 'svgName',
    key: 'svgName',
    scopedSlots: { customRender: 'svgName' }
  },
  {
    title: '组态编号',
    dataIndex: 'svgCode',
    key: 'svgCode',
    scopedSlots: { customRender: 'svgCode' }
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
import serverConfig from '@/config/server.config';
import { sysDictListByCode } from '@/api/manage';
import {
  siteSvgList,
  delSiteSvg,
  pumpGetService,
  pumpDelete,
  pumpBatchUpdate
} from '@/api/configuration';
import EnergyConfigDialog from './models/EnergyConfigDialog';
import ConfigurationPreviewOnly from './models/ConfigurationPreviewOnly';

export default {
  name: 'SiteConfiguration',
  components: {
    EnergyConfigDialog,
    ConfigurationPreviewOnly
  },
  data() {
    return {
      columns,
      allsvgcolumns,
      waterWorkSvgData: [], // 水厂组态数据
      svgData: [], // 组态数据
      pumpData: [], // 机泵数据
      devices: [], // 机泵状态监测量
      total: 0,
      allsvgTotal: 0,
      selectedRowKeys: [], // 选中要添加的组态
      currentSelectRowId: '', // 当前点击行的ID
      layout: {
        colon: true, // 冒号
        labelCol: { span: 6 },
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      params: {
        // 获取水厂下组态的参数
        current: 1,
        size: 10,
        keyWord: '',
        condition: {
          waterPlantId: ''
        }
      },
      energyData: {}, // 能耗配置数据
      typeList: [],
      svgTypeData: null,
      deletingRow: -1
    };
  },
  activated() {
    this.getWaterWorkSvg();
    this.sysDictListByCode('plant_svg_type', 'typeList');
    this.sysDictListByCode('plant_svg_type', 'svgTypeData');
  },
  methods: {
    async sysDictListByCode(code, data) {
      const res = await sysDictListByCode(code);
      if (data === 'svgTypeData') {
        let obj = {};
        res.resultData.forEach(item => {
          obj[item.dictValue] = item.dictName;
        });
        this[data] = obj;
      } else {
        this[data] = res.resultData;
      }
    },
    /**
     * 根据水厂id获取该水厂下的所有组态
     */
    getWaterWorkSvg() {
      this.params.condition.waterPlantId = this.$route.query.waterPlantId;
      siteSvgList(this.params).then(res => {
        const { status, resultData } = res;
        if (status === 'complete') {
          this.total = resultData.total;
          resultData.records.forEach(item => {
            item.key = item.id;
            item.svgThumbnail = serverConfig.IMG_BASE_URL + item.svgThumbnail;
          });
          this.waterWorkSvgData = resultData.records;
        }
      });
    },
    /**
     * 翻页
     */
    pageOrSizechange(current, pageSize) {
      this.params.current = current;
      this.params.size = pageSize;
      this.getWaterWorkSvg();
    },

    /**
     * 从泵房中删除组态
     */
    deleteSvg(id, index) {
      this.deletingRow = index;
      this.$confirm({
        title: '提示',
        content: '确定要删除吗？',
        type: 'warning',
        onOk: async () => {
          delSiteSvg({ id }).then(res => {
            if (res.status === 'complete') {
              this.params.current = 1;
              this.getWaterWorkSvg();
              this.deletingRow = -1;
              this.$message.success('删除成功');
            }
          });
        },
        onCancel: () => {
          this.deletingRow = -1;
        }
      });
    },

    /**
     * 编辑组态
     */
    editSvg(id) {
      let toPath = {
        path: '/configuration/edit',
        query: {
          id: id
        }
      };
      this.drillDown(toPath);
    },

    /**
     * 机泵关联
     * @todo
     */
    addPumpPoint() {
      // 机泵关联
      // if (this.pumpData.length > 0) {
      let labels = {
        pointName: '监测量',
        hzPoint: '频率',
        runtimePoint: '运行时长'
      };
      let errorLabels = [];
      let empyList = this.pumpData.filter(item => {
        return item.pointName == '';
      });
      if (empyList.length > 0) {
        this.$message.warning(empyList[0].pumpName + '泵状态监测量为空');
        return false;
      }
      for (const opt of Object.keys(labels)) {
        let s = new Set();
        this.pumpData.forEach(v => {
          v[opt] && s.add(v[opt]);
        });
        if (this.pumpData.filter(v => v[opt]).length > s.size) errorLabels.push(labels[opt]);
      }
      if (errorLabels.length) {
        this.$message.warning(`不能选择相同的${errorLabels.join('、')}`);
        return false;
      }
      let params = {
        svgId: this.currentSelectRowId,
        data: this.pumpData
      };
      pumpBatchUpdate(params).then(res => {
        let { status, errorMessage } = res;
        if (status === 'complete') {
          this.$message.success('更新成功！');
          this.visible = false;
        } else {
          this.$message.error(errorMessage);
        }
      });
    },
    // 搜索组态模板列表
    handleSearch() {
      this.getWaterWorkSvg();
    },
    handleReset() {
      this.params = {
        // 获取水厂下组态的参数
        current: 1,
        size: 10,
        keyWord: '',
        condition: {
          waterPlantId: ''
        }
      };
    }
  }
};
</script>

<style lang="less" scoped>
.configuration {
  &-box {
    height: 100%;
    overflow: hidden;
  }

  &-header {
    height: 60px;
    margin-bottom: 10px;
    padding: 0 20px;
    line-height: 60px;
    /deep/.wpg-form-item {
      margin-top: 10px !important;
    }
  }
  /deep/.wpg-form-item {
    margin-top: 10px !important;
  }
  &-body {
    height: calc(100% - 68px);
  }
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

.conlisttab-bigimg {
  width: 600px;
  height: 300px;
}
</style>
