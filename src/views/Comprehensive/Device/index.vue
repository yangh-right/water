<template>
  <!-- 仪表管理 -->
  <div class="device-view">
    <w-form-table-page>
      <template #form>
        <w-form-header
          :title="null"
          newLine
          :neddRetain="false"
          :fields="fields"
          :model="searchForm"
          :layout="layout"
          :loading="loading"
        >
          <template #waterPlantId>
            <FactorySelect
              v-model.trim="searchForm.waterPlantId"
              :showAll="!autoSelect"
              :autoSelect="autoSelect"
              @change="handleSearch"
            ></FactorySelect>
          </template>
          <template #deviceTypeList>
            <DeviceType v-model.trim="searchForm.deviceTypeList" :showAll="true"></DeviceType>
          </template>
          <template #action>
            <div class="supply-flex supply-justify-end">
              <w-button type="primary" class="supply-mr-3" @click="handleExportTemplate"
                >模版导出</w-button
              >
              <w-button type="primary" class="supply-mr-3" @click="handleImport"
                ><w-icon type="ic_publish" />导入</w-button
              >
              <w-button type="primary" class="supply-mr-3" @click="handleExport"
                ><w-icon type="ic_file_download" />导出</w-button
              >
              <w-button type="primary" icon="ic_add" @click="handleAdd">
                <span>新增设备</span>
              </w-button>
              <w-button class="supply-mx-3" icon="reload" @click="handleReset">
                <span>重置</span>
              </w-button>
              <w-button type="primary" icon="ic_search" @click="handleSearch">
                <span>查询</span>
              </w-button>
            </div>
          </template>
          <template #footer></template>
        </w-form-header>
      </template>
      <template #table>
        <w-info-table
          style="height: 100%"
          show-index
          :columns="columns"
          :data-source="dataSource"
          :page="searchForm"
          :loading="loading"
          @handleDetail="handleDetail"
          @handleEdit="handleEdit"
          @handleDelete="handleDelete"
          @changePage="handlePageChange"
        >
          <template #deviceType="{ text }">
            <span>{{ currentDeviceType(text).fullName }}</span>
          </template>
          <template #placeName="{ row, text }">
            <span>{{ row.deviceStatus === -1 || !text ? '--' : text.split('-')[0] }}</span>
          </template>
          <template #monitoringPositionInfo="{ row, text }">
            <span>{{ row.deviceStatus === -1 || !text ? '--' : text.split('-')[0] }}</span>
          </template>

          <template #deviceStatus="{ row, text }">
            <span :style="handleStateStyle('deviceStatus', deviceStatusOptions, row)">
              {{ filterDeviceText(text, deviceStatusOptions) }}
            </span>
          </template>
          <template #deviceGrade="{ text }">
            <span>{{ filterDeviceText(text, deviceGradeOptions) }}</span>
          </template>
          <template #deviceOnlineFlag="{ row, text }">
            <div>
              <span v-if="row.iotFlag">{{ text === 'OFFLINE' ? '离线' : '在线' }}</span>
              <span v-else>非IoT</span>
            </div>
          </template>
        </w-info-table>
      </template>
    </w-form-table-page>
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
  </div>
</template>

<script>
import { exportFile } from '@/utils/util';
import { headerFields, columns, searchForm } from './config';
import FactorySelect from '@/components/factory-select/index.vue';
import DeviceType from '../components/DeviceType.vue';
import { cloneDeep } from 'lodash';
import { mapGetters } from 'vuex';
import { selectIndustryList, queryIndustryPointByIndustryDeviceIds } from '@/api/public';
import {
  queryList,
  sysDictListByCode,
  manufacturer,
  getOneDevice,
  getStructureByStationId,
  deleteDevice,
  exportDeviceTemplate,
  importDevice,
  exportDevice
} from '@/api/deviceManagement';
import { mapState } from 'vuex';
export default {
  name: 'Device',
  components: { FactorySelect, DeviceType },
  data() {
    return {
      installAddressMap: {},
      modalInfo: {},
      isCommonScreen: true,
      loading: false,
      title: '仪表台账',
      layout: {
        colon: true, // 冒号
        span: 6, // 改为 6 或其他值来测试效果
        wrapperCol: { span: 18 },
        gutter: [12, 8] //栅格间隔[水平间距，垂直间距]
      },
      page: { size: 20, current: 1, total: 0 },
      searchForm: cloneDeep(searchForm),
      columns,
      dataSource: [],
      deviceStatusOptions: [],
      onlineStateOptions: [],
      deviceGradeOptions: [],
      headerFields,
      treeData: [],
      devicePointList: []
    };
  },
  computed: {
    ...mapState('account', ['user']),
    fields() {
      return cloneDeep(this.headerFields);
    },
    autoSelect() {
      return this.$store.state.factoryList?.length === 1;
    },
    ...mapGetters('device', ['currentDeviceType'])
  },
  watch: {
    'searchForm.waterPlantId'() {
      this.getStructureByStationId();
    }
  },
  async created() {
    await this.getSystemDictList('purification_use_state', 'deviceStatus', 'deviceStatusOptions');
    await this.getSystemDictList('purification_device_level', 'deviceGrade', 'deviceGradeOptions');
    await this.getSystemDictList('purification_user_year', 'useYear');
    await this.getSystemDictList('install_address', 'installAddress');
  },
  activated() {
    const { placeId, structureIdList, isStorage } = this.$route.query;
    if (placeId || isStorage || structureIdList) {
      this.searchForm = cloneDeep(searchForm);
      this.searchForm.deviceStatus = [];
    }
    if (placeId) {
      this.searchForm.placeId = placeId;
    }
    this.handleSearch();
  },
  methods: {
    // 数据字典
    async getSystemDictList(key, value, options) {
      const { resultData } = await sysDictListByCode(key);
      this[value + 'Map'] = {};
      let data = resultData.map(i => {
        this[value + 'Map'][i.dictCode] = i.dictName;
        return {
          label: i.dictName,
          value: i.dictCode,
          color: i.color ? i.color : i.remark ? i.remark : '#333'
        };
      });
      this.headerFields.forEach((item, index) => {
        if (item.name === value) {
          if (options) this[options] = data;
          this.headerFields[index].options = data;
        }
      });
    },
    // 获取安装地址（构筑物、仓库）
    async getStructureByStationId() {
      let params = {
        waterPlantId: this.searchForm.waterPlantId ? this.searchForm.waterPlantId : ''
      };
      const { resultData } = await getStructureByStationId(params);
      let data = resultData.map(item => {
        return {
          label: item.name,
          value: item.id,
          ...item
        };
      });
      this.headerFields.find(i => i.name === 'placeId').options = data;
    },
    handleSearch() {
      this.searchForm.currentPage = 1;
      this.page.current = 1;
      this.getDeviceList();
    },
    async getDeviceList() {
      this.loading = true;
      const { resultData } = await queryList({ ...this.searchForm, page: this.page });
      this.dataSource = resultData.records;
      this.searchForm.total = resultData.total;
      this.loading = false;
    },
    handleReset() {
      this.searchForm = cloneDeep(searchForm);
      this.handleSearch();
    },
    handleAdd() {
      this.goto({
        path: '/Comprehensive/Device/add',
        query: { type: 'add', deviceTime: new Date().getTime() }
      });
    },
    handleStateStyle(key, options, row) {
      let color = '#333';
      if (key === 'deviceStatus') {
        let deviceStatus = [3, 0]; // 闲置、待报废
        if (row && !deviceStatus.includes(row.deviceStatus)) {
          options.forEach(item => {
            if (item.label === row.deviceStatus || item.value === String(row.deviceStatus)) {
              color = item.color;
            }
          });
          return {
            color
          };
        }
        return {};
      }
    },
    filterDeviceText(text, options) {
      if (options?.length) {
        return options.find(item => item.value === String(text))?.label || '--';
      }
      return '--';
    },
    ejectSupplierDetail(opt) {
      this.modalInfo = opt;
      this.$refs.supplierDetail.show();
    },
    handleSupplierEdit(opt) {
      this.modalInfo = opt;
      this.$refs.supplierAdd.show();
    },
    handleDetail(row) {
      this.goto({
        path: '/Comprehensive/Device/detail',
        query: {
          id: row.id,
          placeId: row.placeId,
          deviceTime: new Date().getTime(),
          iotFlag: row.deviceOnlineFlag !== 'NOT_IOT'
        }
      });
    },
    handleEdit(row) {
      this.goto({
        path: '/Comprehensive/Device/edit',
        query: { type: 'edit', id: row.id, placeId: row.placeId, deviceTime: new Date().getTime() }
      });
    },
    // 删除设备
    async handleDelete(row) {
      let res = await getOneDevice({
        deviceId: row.id
      });
      if (res.resultData.iotFlag) {
        let tempObj = {
          productCode: 'water_purification',
          dsAreaStationDeviceQueries: [
            {
              stationId: this.searchForm.waterPlantId,
              productCode: 'water_purification',
              areaId: []
            }
          ],
          industryDeviceIds: [res.resultData.industryPlaformId]
        };
        let res1 = await selectIndustryList(tempObj);
        this.industryDeviceItem = res1.resultData[0] || {};
        if (this.industryDeviceItem.deviceId) {
          let params = {
            industryDeviceIds: [this.industryDeviceItem.deviceId],
            productCode: 'water_purification'
          };
          const { resultData, status } = await queryIndustryPointByIndustryDeviceIds(params);
          if (status === 'complete') {
            this.devicePointList = resultData;
            // 获取监测量类型
            this.devicePointList.forEach(async item => {
              let params = {
                pointType: [item.pointType]
              };
              let { resultData } = await DsPointList(params);
              item.pointTypeName = resultData[0].pointTypeName;
            });
          }
        }
      }
      if (this.devicePointList.length) {
        this.$confirm({
          title: '该设备下有关联监测量，删除后可能会影响正常使用，您确定要删除该设备吗？',
          okText: '确定删除',
          cancelText: '取消',
          onCancel: () => {},
          onOk: () => {
            this.deleteDevice(row);
          }
        });
      } else {
        this.$confirm({
          title: '删除后无法找回，您确定要删除该设备吗？',
          okText: '确定删除',
          cancelText: '取消',
          onCancel: () => {},
          onOk: () => {
            this.deleteDevice(row);
          }
        });
      }
    },
    async deleteDevice(row) {
      try {
        this.deleteLoading = true;
        let params = {
          deviceId: row.id
        };
        let { success } = await deleteDevice(params);
        if (success) {
          this.$message.success('删除设备成功！');
          this.handleSearch();
        }
      } catch (error) {
        console.log(error);
      } finally {
        this.deleteLoading = false;
      }
    },
    // 页码change
    handlePageChange(current, pageSize) {
      this.searchForm.currentPage = current;
      this.searchForm.pageSize = pageSize;
      this.page.current = current;
      this.page.size = pageSize;
      this.getDeviceList();
    },
    handleExportTemplate() {
      exportDeviceTemplate().then(res => {
        exportFile(res, '设备模版');
      });
    },
    handleImport() {
      this.$refs.file.click();
    },
    async handleFile() {
      let file = this.$refs.file.files[0];
      let formData = new FormData();
      formData.append('file', file);
      let res = await importDevice(formData);
      if (res.size) {
        this.$message.success('导入失败');
        exportFile(res, '导入失败信息');
      } else {
        this.$message.success('导入成功');
      }
      this.getDeviceList();
      document.getElementById('file').value = '';
    },
    handleExport() {
      const vo = this.searchForm;
      exportDevice(vo).then(res => {
        exportFile(res, '设备');
      });
    }
  }
};
</script>

<style lang="less" scoped>
.device-view {
  width: 100%;
  height: 100%;
}
</style>
