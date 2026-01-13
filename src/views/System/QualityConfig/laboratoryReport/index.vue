<template>
  <div class="water-quality-container" id="waterQualityContainer">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :fields="fields"
          :model="searchForm"
          :layout="headerLayout"
          :title="null"
          :loading="loading"
          newLine
          :neddRetain="false"
          @search="handleSearch"
        >
          <template #waterPlantId>
            <factory-select
              showAll
              autoSelect
              v-model="searchForm.waterPlantId"
              @change="getList"
            ></factory-select>
          </template>
          <template #footer>
            <w-button v-if="!isEdit" icon="edit" @click="handleEdit">
              <span>编辑</span>
            </w-button>
            <w-button v-if="isEdit" icon="close" @click="handleCancel">
              <span>取消</span>
            </w-button>
            <w-button v-if="isEdit" icon="save" @click="handleSave">
              <span>保存</span>
            </w-button>

            <w-dropdown>
              <w-menu slot="overlay">
                <w-menu-item key="1" @click="exportTemplate">模板下载</w-menu-item>
                <w-menu-item key="2" @click="uploadFile">导入</w-menu-item>
              </w-menu>
              <w-button icon="ic_vertical_align_top"> 导入 </w-button>
            </w-dropdown>
            <w-button
              icon="ic_vertical_align_bottom"
              :loading="exportLoading"
              @click="handleExport"
            >
              <span>导出</span>
            </w-button>
            <div ref="fileCon" style="display: none">
              <input
                id="file"
                ref="file"
                type="file"
                name="fileUpload"
                style="display: none"
                accept=".xls,.xlsx,.XLS,.XLSX"
                @change="handleFile"
              />
            </div>
            <w-button icon="reload" @click="handleReset">
              <span>重置</span>
            </w-button>
            <w-button type="primary" icon="ic_search" @click="handleSearch">
              <span>查询</span>
            </w-button>
          </template>
        </w-form-header>
      </template>
      <template #table>
        <div class="full-table-wrap">
          <!-- 水质指标表格 -->
          <w-table
            :columns="waterQualityColumns"
            :data-source="waterQualityData"
            :pagination="false"
            :bordered="true"
            size="middle"
            :rowClassName="record => getWaterQualityRowClass(record)"
          >
            <template slot="phValue" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.phValue" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="ss" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.ss" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="codCr" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.codCr" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="bod5" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.bod5" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="nh3N" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.nh3N" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="tp" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.tp" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="tn" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.tn" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="bacteriaCount" slot-scope="text, record, index">
              <w-input v-if="isEdit && index >= 2" v-model="record.bacteriaCount" size="small" />
              <span v-else>{{ text }}</span>
            </template>
          </w-table>

          <!-- 污泥指标表格 -->
          <w-table
            :columns="sludgeColumns"
            :data-source="sludgeData"
            :pagination="false"
            :bordered="true"
            size="middle"
            class="sludge-table"
            :rowClassName="() => 'sludge-row'"
          >
            <template slot="mlss" slot-scope="text, record">
              <w-input v-if="isEdit" v-model="record.mlss" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="mlvss" slot-scope="text, record">
              <w-input v-if="isEdit" v-model="record.mlvss" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="fValue" slot-scope="text, record">
              <w-input v-if="isEdit" v-model="record.fValue" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="svi" slot-scope="text, record">
              <w-input v-if="isEdit" v-model="record.svi" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="sv30" slot-scope="text, record">
              <w-input v-if="isEdit" v-model="record.sv30" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="doValue" slot-scope="text, record">
              <w-input v-if="isEdit" v-model="record.doValue" size="small" />
              <span v-else>{{ text }}</span>
            </template>
            <template slot="waterContent" slot-scope="text, record">
              <w-input v-if="isEdit" v-model="record.waterContent" size="small" />
              <span v-else>{{ text }}</span>
            </template>

            <div slot="waterColorTitle" class="water-color">
              <div class="water-box">
                <div class="water-title">进水色度</div>
                <div class="water-value">
                  <w-input v-if="isEdit" v-model="inletColor" size="small" />
                  <span v-else>{{ inletColor }}</span>
                </div>
              </div>
              <div class="water-box">
                <div class="water-title">出水色度</div>
                <div class="water-value">
                  <w-input v-if="isEdit" v-model="outletColor" size="small" />
                  <span v-else>{{ outletColor }}</span>
                </div>
              </div>
            </div>
          </w-table>

          <!-- 备注和签名区域 -->
          <div class="footer-section">
            <w-row>
              <w-col :span="24">
                <div class="remark">备注：{{ remarks }}</div>
              </w-col>
            </w-row>
            <w-row type="flex" justify="space-between" class="signature-row">
              <w-col :xs="24" :sm="11">
                <w-input v-if="isEdit" addonBefore="制表人：" v-model="creator" placeholder="" />
                <w-input
                  v-else
                  addonBefore="制表人："
                  :disabled="true"
                  :value="creator"
                  placeholder=""
                />
              </w-col>
              <w-col :xs="24" :sm="11">
                <w-input v-if="isEdit" addonBefore="审核人：" v-model="reviewer" placeholder="" />
                <w-input
                  v-else
                  addonBefore="审核人："
                  :disabled="true"
                  :value="reviewer"
                  placeholder=""
                />
              </w-col>
            </w-row>
          </div>
        </div>
      </template>
    </w-form-table-page>
  </div>
</template>

<script>
import { exportFile } from '@/utils/util';
import {
  getWaterQualityReport,
  waterQualityExport,
  waterQualityExportTemplate,
  waterQualityImport,
  waterQualityEdit
} from '@/api/manage';
import FactorySelect from '@/components/factory-select';

export default {
  name: 'WaterQualityTable',
  components: {
    FactorySelect
  },
  data() {
    return {
      loading: false,
      isEdit: false,
      exportLoading: false,
      headerLayout: {
        span: 6,
        colon: true,
        labelAuto: true,
        wrapperCol: { span: 18 }
      },
      searchForm: {
        waterPlantId: undefined,
        date: this.$moment(),
        currentPage: 1,
        pageSize: 20,
        total: 5
      },
      tableData: [],
      fields: [
        {
          label: '选择污水厂',
          name: 'waterPlantId',
          type: 'input'
        },
        {
          label: '选择日期',
          name: 'date',
          type: 'date-picker',
          attrs: {
            format: 'YYYY-MM-DD',
            placeholder: '请选择日期'
          }
        }
      ],
      // 水质指标列定义
      waterQualityColumns: [
        { title: '水质指标', dataIndex: 'indicator', key: 'indicator', width: 120 },
        {
          title: 'pH',
          dataIndex: 'phValue',
          key: 'ph',
          width: 120,
          scopedSlots: { customRender: 'phValue' }
        },
        {
          title: 'SS (mg/L)',
          dataIndex: 'ss',
          key: 'ss',
          width: 120,
          scopedSlots: { customRender: 'ss' }
        },
        {
          title: 'CODCr (mg/L)',
          dataIndex: 'codCr',
          key: 'codcr',
          width: 120,
          scopedSlots: { customRender: 'codCr' }
        },
        {
          title: 'BOD5 (mg/L)',
          dataIndex: 'bod5',
          key: 'bod5',
          width: 120,
          scopedSlots: { customRender: 'bod5' }
        },
        {
          title: 'NH3-N (mg/L)',
          dataIndex: 'nh3N',
          key: 'nh3n',
          width: 120,
          scopedSlots: { customRender: 'nh3N' }
        },
        {
          title: 'TP (mg/L)',
          dataIndex: 'tp',
          key: 'tp',
          width: 120,
          scopedSlots: { customRender: 'tp' }
        },
        {
          title: 'TN (mg/L)',
          dataIndex: 'tn',
          key: 'tn',
          width: 120,
          scopedSlots: { customRender: 'tn' }
        },
        {
          title: '类大肠菌群数(个/L)',
          dataIndex: 'bacteriaCount',
          key: 'bacteriaCount',
          width: 120,
          scopedSlots: { customRender: 'bacteriaCount' }
        }
      ],
      // 水质指标数据
      waterQualityData: [
        {
          key: '1',
          indicator: '进水设计值',
          phValue: '6-9',
          ss: '200',
          codCr: '400',
          bod5: '150',
          nh3N: '45',
          tp: '5',
          tn: '55',
          bacteriaCount: '/',
          typeCode: '1',
          createTime: '',
          creator: '',
          doValue: null,
          dryMudRate: null,
          fValue: null,
          inletColor: null,
          mlss: null,
          mlvss: null,
          outletColor: null,
          remarks: '',
          reportDate: '',
          reviewer: null,
          sv30: null,
          svi: null,
          tenantId: '',
          ticketId: '',
          updateTime: '',
          waterPlantId: '',
          weather: '',
          wetMudRate: null
        },
        {
          key: '2',
          indicator: '出水限值',
          phValue: '6-9',
          ss: '10',
          codCr: '30',
          bod5: '6',
          nh3N: '1 (1.5)',
          tp: '0.3',
          tn: '10 (12)',
          bacteriaCount: '1000',
          typeCode: '2',
          createTime: '',
          creator: '',
          doValue: null,
          dryMudRate: null,
          fValue: null,
          inletColor: null,
          mlss: null,
          mlvss: null,
          outletColor: null,
          remarks: '',
          reportDate: '',
          reviewer: null,
          sv30: null,
          svi: null,
          tenantId: '',
          ticketId: '',
          updateTime: '',
          waterPlantId: '',
          weather: '',
          wetMudRate: null
        },
        {
          key: '3',
          indicator: '进 水',
          phValue: '',
          ss: '',
          codCr: '',
          bod5: '',
          nh3N: '',
          tp: '',
          tn: '',
          bacteriaCount: '',
          typeCode: 'INLET',
          createTime: '',
          creator: '',
          doValue: null,
          dryMudRate: null,
          fValue: null,
          inletColor: null,
          mlss: null,
          mlvss: null,
          outletColor: null,
          remarks: '',
          reportDate: '',
          reviewer: null,
          sv30: null,
          svi: null,
          tenantId: '',
          ticketId: '',
          updateTime: '',
          waterPlantId: '',
          weather: '',
          wetMudRate: null
        },
        {
          key: '4',
          indicator: '二沉池出水',
          phValue: '',
          ss: '',
          codCr: '',
          bod5: '',
          nh3N: '',
          tp: '',
          tn: '',
          bacteriaCount: '',
          typeCode: 'SECONDARY_OUTLET',
          createTime: '',
          creator: '',
          doValue: null,
          dryMudRate: null,
          fValue: null,
          inletColor: null,
          mlss: null,
          mlvss: null,
          outletColor: null,
          remarks: '',
          reportDate: '',
          reviewer: null,
          sv30: null,
          svi: null,
          tenantId: '',
          ticketId: '',
          updateTime: '',
          waterPlantId: '',
          weather: '',
          wetMudRate: null
        },
        {
          key: '5',
          indicator: '出 水',
          phValue: '',
          ss: '',
          codCr: '',
          bod5: '',
          nh3n: '',
          tp: '',
          tn: '',
          bacteriaCount: '',
          typeCode: 'OUTLET',
          createTime: '',
          creator: '',
          doValue: null,
          dryMudRate: null,
          fValue: null,
          inletColor: null,
          mlss: null,
          mlvss: null,
          outletColor: null,
          remarks: '',
          reportDate: '',
          reviewer: null,
          sv30: null,
          svi: null,
          tenantId: '',
          ticketId: '',
          updateTime: '',
          waterPlantId: '',
          weather: '',
          wetMudRate: null
        }
      ],
      // 污泥指标列定义
      sludgeColumns: [
        {
          title: '污泥指标',
          dataIndex: 'indicator',
          key: 'indicator',
          width: 120
        },
        {
          title: 'MLSS(mg/L)',
          dataIndex: 'mlss',
          key: 'mlss',
          width: 120,
          scopedSlots: { customRender: 'mlss' }
        },
        {
          title: 'MLVSS(mg/L)',
          dataIndex: 'mlvss',
          key: 'mlvss',
          width: 120,
          scopedSlots: { customRender: 'mlvss' }
        },
        {
          title: 'f值',
          dataIndex: 'fValue',
          key: 'fValue',
          width: 120,
          scopedSlots: { customRender: 'fValue' }
        },
        {
          title: 'SVI(mL/g)',
          dataIndex: 'svi',
          key: 'svi',
          width: 120,
          scopedSlots: { customRender: 'svi' }
        },
        {
          title: 'SV30(%)',
          dataIndex: 'sv30',
          key: 'sv30',
          width: 120,
          scopedSlots: { customRender: 'sv30' }
        },
        {
          title: 'DO(mg/L)',
          dataIndex: 'doValue',
          key: 'doValue',
          width: 120,
          scopedSlots: { customRender: 'doValue' }
        },
        {
          dataIndex: 'waterColor',
          key: 'waterColor',
          slots: { title: 'waterColorTitle' },
          colSpan: 2,
          width: 120
        },
        {
          title: '污泥含水率',
          dataIndex: 'waterContent',
          key: 'waterContent',
          width: 120,
          colSpan: 0,
          scopedSlots: { customRender: 'waterContent' }
        }
      ],
      // 污泥指标数据
      sludgeData: [
        {
          key: '1',
          indicator: '生物池1#',
          mlss: '',
          mlvss: '',
          fValue: '',
          svi: '',
          sv30: '',
          waterColor: '湿污泥含水率(%)',
          waterContent: '',
          typeCode: 'biocycle1',
          bacteriaCount: null,
          bod5: null,
          codCr: null,
          createTime: '',
          creator: '',
          doValue: null,
          dryMudRate: null,
          inletColor: null,
          nh3N: null,
          outletColor: null,
          phValue: null,
          remarks: '',
          reportDate: '',
          reviewer: null,
          ss: null,
          tenantId: '',
          ticketId: '',
          tn: null,
          tp: null,
          updateTime: '',
          waterPlantId: '',
          weather: '',
          wetMudRate: null
        },
        {
          key: '2',
          indicator: '生物池2#',
          mlss: '',
          mlvss: '',
          fValue: '',
          svi: '',
          sv30: '',
          waterColor: '干污泥含水率(%)',
          waterContent: '',
          typeCode: 'biocycle2',
          bacteriaCount: null,
          bod5: null,
          codCr: null,
          createTime: '',
          creator: '',
          doValue: null,
          dryMudRate: null,
          inletColor: null,
          nh3N: null,
          outletColor: null,
          phValue: null,
          remarks: '',
          reportDate: '',
          reviewer: null,
          ss: null,
          tenantId: '',
          ticketId: '',
          tn: null,
          tp: null,
          updateTime: '',
          waterPlantId: '',
          weather: '',
          wetMudRate: null
        }
      ],
      inletColor: '', // 进水色度
      outletColor: '', // 出水色度
      creator: '', // 创建人
      reviewer: '', // 审核人
      remarks: '' // 备注
    };
  },
  mounted() {
    this.getList();
  },
  methods: {
    handleEdit() {
      this.isEdit = !this.isEdit;
    },
    async handleSave() {
      let originalData =
        this.tableData.length > 0
          ? [...this.tableData]
          : [...this.waterQualityData, ...this.sludgeData];

      let typeCode = ['INLET', 'SECONDARY_OUTLET', 'OUTLET', 'biocycle1', 'biocycle2'];
      let data = originalData
        .filter(item => typeCode.includes(item.typeCode))
        .map(item => {
          let waterQualityItem = this.waterQualityData.find(waterQuality => {
            return waterQuality.typeCode === item.typeCode;
          });
          let sludgeItem = this.sludgeData.find(sludge => {
            return sludge.typeCode === item.typeCode;
          });
          if (sludgeItem && item.typeCode === 'biocycle1') {
            sludgeItem.wetMudRate = item.waterContent;
          }
          if (sludgeItem && item.typeCode === 'biocycle2') {
            sludgeItem.dryMudRate = item.waterContent;
          }
          return {
            ...item,
            ...(waterQualityItem || {}),
            ...(sludgeItem || {}),
            inletColor: this.inletColor,
            outletColor: this.outletColor,
            creator: this.creator,
            reviewer: this.reviewer,
            remarks: this.remarks,
            reportDate: this.searchForm.date.format('YYYY-MM-DD'),
            waterPlantId: this.searchForm.waterPlantId
          };
        });
      console.log('111', this.searchForm.date.format('YYYY-MM-DD'));
      let res = await waterQualityEdit(data);
      if (res.status === 'complete') {
        this.isEdit = false; // 关闭编辑
        this.tableData = [];
        this.$message.success('保存成功!');
        this.getList();
      } else {
        console.log(res.errorMessage);
      }
    },
    handleCancel() {
      this.isEdit = !this.isEdit;
    },
    exportTemplate() {
      waterQualityExportTemplate().then(res => {
        exportFile(res, '化验分析模版');
      });
    },
    uploadFile() {
      this.$refs.file.click();
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      const response = await waterQualityImport(formData);
      if (response.status === 'complete') {
        this.$message.success(response.resultData);
        this.getList();
      } else {
        this.$message.error(response.errorMessage || response.resultData);
        exportFile(response, '导入失败记录');
        this.getList();
      }
      document.getElementById('file').value = '';
    },
    async getList() {
      let params = {
        date: !this.searchForm.date
          ? this.$moment().format('YYYY-MM-DD')
          : this.searchForm.date.format('YYYY-MM-DD')
      };
      this.globalLoading.show({ domId: 'waterQualityContainer' });
      let res = await getWaterQualityReport(params.date);
      try {
        let result = res?.resultData ? res.resultData : res;
        this.tableData = JSON.parse(JSON.stringify(result));
        if (Array.isArray(result) && result.length > 0) {
          let waterQualityTypeCode = ['INLET', 'SECONDARY_OUTLET', 'OUTLET'];
          let sludgeTypeCode = ['biocycle1', 'biocycle2'];
          let waterQualityData = result.filter(item => {
            return waterQualityTypeCode.includes(item.typeCode);
          });
          let sludgeData = result.filter(item => {
            return sludgeTypeCode.includes(item.typeCode);
          });
          this.waterQualityData.forEach(item => {
            let waterQualityItem = waterQualityData.find(waterQuality => {
              return waterQuality.typeCode === item.typeCode;
            });
            if (waterQualityItem) {
              item.phValue = waterQualityItem.phValue;
              item.ss = waterQualityItem.ss;
              item.codCr = waterQualityItem.codCr;
              item.bod5 = waterQualityItem.bod5;
              item.nh3N = waterQualityItem.nh3N;
              item.tp = waterQualityItem.tp;
              item.tn = waterQualityItem.tn;
              item.bacteriaCount = waterQualityItem.bacteriaCount ?? '';
            }
          });
          this.sludgeData.forEach(item => {
            let sludgeItem = sludgeData.find(sludge => {
              return sludge.typeCode === item.typeCode;
            });
            if (sludgeItem) {
              item.mlss = sludgeItem.mlss;
              item.mlvss = sludgeItem.mlvss;
              item.fValue = sludgeItem.fValue;
              item.svi = sludgeItem.svi;
              item.sv30 = sludgeItem.sv30;
              item.doValue = sludgeItem.doValue;
              item.waterContent =
                item.typeCode === 'biocycle1' ? sludgeItem.wetMudRate : sludgeItem.dryMudRate;
            }
          });

          this.inletColor = result[0].inletColor;
          this.outletColor = result[0].outletColor;
          this.creator = result[0].creator;
          this.reviewer = result[0].reviewer;
          this.remarks = result[0].remarks;
        } else {
          this.resetTableData();
        }
      } catch (error) {
        console.log(error);
        this.resetTableData();
      } finally {
        this.globalLoading.hide({ domId: 'waterQualityContainer' });
      }
    },
    resetTableData() {
      // 重置水质指标数据
      this.waterQualityData.forEach(item => {
        if (['INLET', 'SECONDARY_OUTLET', 'OUTLET'].includes(item.typeCode)) {
          item.phValue = '';
          item.ss = '';
          item.codCr = '';
          item.bod5 = '';
          item.nh3N = '';
          item.tp = '';
          item.tn = '';
          item.bacteriaCount = '';
        }
      });

      // 重置污泥指标数据
      this.sludgeData.forEach(item => {
        item.mlss = '';
        item.mlvss = '';
        item.fValue = '';
        item.svi = '';
        item.sv30 = '';
        item.doValue = '';
        item.waterContent = '';
      });

      // 重置其他数据
      this.inletColor = '';
      this.outletColor = '';
      this.creator = '';
      this.reviewer = '';
      this.remarks = '';
      this.tableData = [];
    },
    handleSearch() {
      this.getList();
    },
    handleReset() {
      // 重置搜索表单
      this.searchForm = {
        waterPlantId: undefined,
        date: undefined,
        currentPage: 1,
        pageSize: 20,
        total: 5
      };

      // 重新获取数据
      this.getList();
    },
    // 打印
    handlePrint() {
      let printContent = document.getElementById('print-content').innerHTML;
      let printWindow = window.open('', '_blank');
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
      printWindow.close();
    },
    // 导出
    handleExport() {
      let params = {
        date: !this.searchForm.date
          ? this.$moment().format('YYYY-MM-DD')
          : this.searchForm.date.format('YYYY-MM-DD')
      };
      waterQualityExport(params.date).then(res => {
        exportFile(res, '化验分析');
      });
    },
    getWaterQualityRowClass(record) {
      if (record.typeCode === '1' || record.typeCode === '2') {
        return 'water-quality-design-row';
      }
      return 'water-quality-row';
    }
  }
};
</script>

<style lang="less" scoped>
.water-quality-container {
  width: 100%;
  height: 100%;
  position: relative;
  margin: 0 auto;

  .full-table-wrap {
    padding: 0 6px;
    box-sizing: border-box;
  }

  .sludge-table {
    margin-top: 16px;
  }

  .footer-section {
    margin-top: 24px;

    .remark {
      margin-bottom: 16px;
      font-weight: bold;
    }

    .signature-row {
      .ant-col {
        margin-bottom: 16px;
      }
    }
  }
  /deep/.wpg-table-header-column {
    width: 100% !important;
    height: 100% !important;
    > div {
      width: 100% !important;
    }
    .wpg-table-column-title {
    }
  }
  /deep/.wpg-table-wrapper {
    height: auto !important;
  }
  .water-color {
    display: flex;
    flex-direction: column;
    .water-box {
      display: flex;
      justify-content: space-between;
      align-items: center;
      border-bottom: 1px solid var(--supply-color-border-split);
      &:last-child {
        border-bottom: none;
      }
      .water-title {
        flex: 1;
        border-right: 1px solid var(--supply-color-border-split);
        text-align: left;
      }
      .water-value {
        height: 29px;
        line-height: 29px;
        margin-left: 4px;
        flex: 1;
        background: var(--supply-rgb-color-bg-card-DEFAULT);
      }
    }
  }

  /deep/ .water-quality-row td:first-child,
  /deep/ .sludge-row td:first-child {
    background-color: #f0f7ff;
    font-weight: bold;
  }

  /deep/ .water-quality-design-row {
    background-color: #fef4ff;
    td:first-child {
      background-color: #fef4ff;
      font-weight: bold;
    }
  }
}
</style>
