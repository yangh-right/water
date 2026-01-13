<template>
  <div class="add-form">
    <custom-form
      v-if="loadForm"
      class="basic-form supply-bg-bg-card-DEFAULT"
      ref="form"
      :options="formOptions"
      @submit="submit"
    >
    </custom-form>
    <div v-if="loadForm" class="form-footer supply-text-right">
      <w-button type="primary" class="supply-mr-3" :loading="confirmLoading" @click="handleSubmit"
        >确定</w-button
      >
      <w-button
        type="primary"
        class="supply-mr-3"
        ghost
        :disabled="confirmLoading"
        @click="handleReset"
      >
        取消
      </w-button>
    </div>
  </div>
</template>

<script>
import { getSysDict as apiGetSysDict } from '@/api/pumpCfg';
import { getDeviceTypeApi } from '@/api/public'
import CustomForm from '@/components/CustomForm';
import debounce from 'lodash/debounce';
import {
  problemReportAdd,
  problemReportSource,
  problemReportUserTarget,
  // allProcessSection,
  // allLocationByProcessSection,
  // listByLocation,
  queryPumpHouse
} from '@/api/manage';
import { queryList } from '@/api/deviceManagement'
import { setFormItemOptions } from '@/utils/util';
function genFormOptions(self) {
  return {
    layout: {
      gutter: 24,
      span: 8,
      labelCol: { span: 24 },
      wrapperCol: { span: 24 }
    },
    list: [
      {
        id: 'deviceType',
        fieldType: 'treeSelect',
        fieldName: 'deviceType',
        label: '设备类型',
        placeholder: '请选择设备类型',
        options: [],
        rules: [
          {
            required: true,
            message: '请选择设备类型'
          }
        ],
        // attrs: {
        //   showSearch: true
        // },
        listeners: {
          change: self.deviceTypeChange
        }
      },
      // {
      //   id: 'processSection',
      //   fieldType: 'select',
      //   fieldName: 'processSection',
      //   label: '工艺段',
      //   placeholder: '请选择工艺段',
      //   options: [],
      //   attrs: {
      //     showSearch: true
      //   },
      //   listeners: {
      //     change: self.processSectionChange
      //   }
      // },
      // {
      //   id: 'installationLocation',
      //   fieldType: 'select',
      //   fieldName: 'installationLocation',
      //   label: '安装位置',
      //   placeholder: '请选择安装位置',
      //   options: [],
      //   attrs: {
      //     showSearch: true
      //   },
      //   listeners: {
      //     change: self.locationChange
      //   }
      // },
      {
        id: 'deviceId',
        fieldType: 'select',
        fieldName: 'deviceId',
        label: '设备',
        placeholder: '请选择设备',
        options: [],
        rules: [
          {
            required: true,
            message: '请选择设备'
          }
        ],
        attrs: {
          showSearch: true
        }
      },
      {
        id: 'problemType',
        fieldType: 'select',
        fieldName: 'problemType',
        label: '故障类型',
        placeholder: '请选择故障类型',
        options: [],
        rules: [
          {
            required: true,
            message: '请选择故障类型'
          }
        ]
      },
      {
        id: 'severity',
        fieldType: 'select',
        fieldName: 'severity',
        label: '严重程度',
        placeholder: '请选择严重程度',
        options: [],
        rules: [
          {
            required: true,
            message: '请选择严重程度'
          }
        ]
      },
      {
        id: 'problemSource',
        fieldType: 'select',
        fieldName: 'problemSource',
        label: '问题来源',
        labelKey: 'name',
        valueKey: 'code',
        placeholder: '请选择问题来源',
        options: [],
        rules: [
          {
            required: true,
            message: '请选择问题来源'
          }
        ]
      },
      {
        id: 'reportUserIds',
        fieldType: 'select',
        fieldName: 'reportUserIds',
        label: '上报对象',
        labelKey: 'userName',
        valueKey: 'id',
        placeholder: '请选择上报对象',
        options: [],
        listeners: {
          popupScroll: self.handleScroll,
          dropdownVisibleChange: self.dropDownSelect,
          search: self.handleSearch,
          select: self.handleSelect
        },
        attrs: {
          mode: 'multiple',
          showArrow: true,
          allowClear: true,
          maxTagCount: 3,
          maxTagTextLength: 5
        },
        rules: [
          {
            required: true,
            message: '请选择上报对象'
          }
        ]
      },
      {
        fieldType: 'textarea',
        fieldName: 'problemContent',
        label: '上报内容',
        placeholder: '请输入上报内容',
        rules: [
          {
            required: true,
            message: '请输入上报内容'
          }
        ],
        layout: {
          span: 12
        },
        attrs: {
          autoSize: { minRows: 4, maxRows: 4 },
          maxLength: 200,
          allowClear: true
        }
      },
      {
        fieldType: 'upload',
        // initialValue: [
        //   "secondary-water-supply-032969f011a92f16442dd3998c17107c/202303/b51da64735314958a6d49b9d841e80b4.png",
        //   "/api/userCenterApi/FileManager?url=secondary-water-supply-032969f011a92f16442dd3998c17107c/202303/caf0713bb9e44803a978f1391ff84b05.png"
        // ],
        fieldName: 'files',
        layout: {
          span: 12
        },
        label: '现场情况',
        placeholder: '请上传现场情况',
        attrs: {
          multiple: true
        },
        maxQuantity: 10
      }
    ]
  };
}
const LOAD_NUM = 20; // 加载条数--可自定义
export default {
  name: 'ProblemAdd',
  data() {
    this.handleScroll = debounce(this.handlePopupScroll, 150);
    return {
      waterPlantId: '',
      stationList: [],
      confirmLoading: false,
      formOptions: genFormOptions(this),
      loadForm: false,
      keyword: '',
      renderedOptions: [],
      pointsList: [],
      filterDataList: []
    };
  },

  components: { CustomForm },

  computed: {},

  mounted() {
    this.getWaterPlant();
    this.getSelectData();
  },

  methods: {
    async getWaterPlant() {
      const { resultData, status } = await queryPumpHouse({
        current: 1,
        page: {
          current: 1,
          size: 10000
        }
      });
      if (status === 'complete') {
        this.waterPlantId = resultData?.[0]?.id;
        this.problemReportUserTarget();
      }
    },
    // 滚动时触发（防止抖动）
    handlePopupScroll() {
      if (this.keyword === '') {
        this.loadMoreData(this.pointsList);
      } else {
        this.loadMoreData(this.filterDataList);
      }
    },
    dropDownSelect(open) {
      this.renderedOptions = open ? this.pointsList.slice(0, LOAD_NUM) : this.pointsList;
      setFormItemOptions(this.formOptions, 'reportUserIds', this.renderedOptions || []);
    },
    // 被选中时调用，参数为选中项的 value (或 key) 值
    handleSelect(val) {
      if (this.keyword) {
        const selectedArr = this.pointsList.filter(item => item === val); // 从数据源中过滤出下拉框选中的值，并返回一个数组
        const restList = this.pointsList.filter(item => item !== val); // 从数据源中过滤出其他的值，返回一个数组
        const newList = selectedArr.concat(restList).slice(0, LOAD_NUM); // 将选中的元素放到下拉列表的第一位
        this.renderedOptions = newList; // 更新已渲染的下拉列表
        this.pointsList = selectedArr.concat(restList); // 更新数据源
        this.keyword = ''; // 因为触发handleSelect函数时，会自动清空用户输入的内容。因此，keyword需要重置。
      }
    },
    // 文本框值变化时触发 -- 从数据源中过滤出含搜索内容的数据，并取过滤结果的前n条作为下拉列表的可选项
    handleSearch(val) {
      this.keyword = val;
      let filterList = [];
      if (val) {
        filterList = this.pointsList.filter(item => {
          let value = item.userName;
          return value.indexOf(val) > -1;
        });
      } else {
        filterList = this.pointsList;
      }
      this.filterDataList = filterList;
      this.renderedOptions =
        filterList.length < LOAD_NUM ? filterList : filterList.slice(0, LOAD_NUM);
      setFormItemOptions(this.formOptions, 'reportUserIds', this.renderedOptions || []);
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
      setFormItemOptions(this.formOptions, 'reportUserIds', this.renderedOptions || []);
    },
    async getSelectData() {
      const resArr = await Promise.allSettled([
        getDeviceTypeApi(),
        apiGetSysDict('question_type'),
        apiGetSysDict('serious_level'),
        problemReportSource()
      ]);
      // 对应表单项id
      const attrList = ['deviceType', 'problemType', 'severity', 'problemSource'];
      // 填充表单项
      resArr.forEach((res, i) => {
        if (res.status === 'fulfilled') {
          if (attrList[i] === 'deviceType') {
            let resultData = res.value?.resultData || [];
            let deviceTypeTreeData = resultData.map(data => {
              return { 
                label : data.data.dictName,
                value: data.data.dictCode,
                children: data.children.map(childData => {
                  return {
                    label : childData.data.dictName,
                    value: childData.data.dictCode
                  }
                })
              };
            });
            setFormItemOptions(this.formOptions, attrList[i], deviceTypeTreeData);
          } else if (attrList[i] === 'problemSource') {
            setFormItemOptions(this.formOptions, attrList[i], res.value?.resultData || []);
          } else {
            setFormItemOptions(this.formOptions, attrList[i], res.value);
          }
        }
      });
      this.loadForm = true;
    },
    handlePumpChange(val) {
      this.problemReportUserTarget(val);
      this.setPumpAddress(val);
    },

    setPumpAddress(val) {
      let curPumpAddress = this.stationList.find(item => item.id === val)?.addr || '';
      this.$refs.form?.form.setFieldsValue({
        pumpAddress: curPumpAddress
      });
    },
    async problemReportUserTarget(val) {
      this.$refs.form?.form.setFieldsValue({
        reportUserIds: [] //''
      });
      if (this.waterPlantId) {
        let res = await problemReportUserTarget(this.waterPlantId, 1);
        if (res.status === 'complete') {
          this.pointsList = res.resultData;
          this.renderedOptions = this.pointsList;
        }
      } else {
        setFormItemOptions(this.formOptions, 'reportUserIds', []);
      }
    },
    deviceTypeChange() {
      this.$nextTick(() => {
        // this.updateProcessSection();
        // this.updateLocation();
        this.updateDevice();
      });
    },
    processSectionChange() {
      this.$nextTick(() => {
        // this.updateLocation();
        this.updateDevice();
      });
    },
    // locationChange() {
    //   this.$nextTick(() => {
    //     this.updateDevice();
    //   });
    // },
    // async updateProcessSection() {
    //   this.$refs.form?.form.setFieldsValue({
    //     processSection: undefined
    //   });
    //   let deviceType = this.$refs.form?.form.getFieldValue('deviceType') || '';
    //   if (deviceType) {
    //     const { resultData, status } = await allProcessSection(deviceType);
    //     if (status === 'complete') {
    //       let options = resultData || [];
    //       options.forEach(item => {
    //         item.value = item.processSection;
    //         item.label = item.processSection;
    //       });
    //       setFormItemOptions(this.formOptions, 'processSection', options);
    //     }
    //   } else {
    //     setFormItemOptions(this.formOptions, 'processSection', []);
    //   }
    // },
    // async updateLocation() {
    //   this.$refs.form?.form.setFieldsValue({
    //     installationLocation: undefined
    //   });
    //   let data = this.$refs.form?.form.getFieldsValue();
    //   const { resultData, status } = await allLocationByProcessSection(
    //     data.deviceType || '',
    //     data.processSection || ''
    //   );
    //   if (status === 'complete') {
    //     let options = resultData || [];
    //     options.forEach(item => {
    //       item.value = item.installationLocation;
    //       item.label = item.installationLocation;
    //     });
    //     setFormItemOptions(this.formOptions, 'installationLocation', options);
    //   }
    // },
    async updateDevice() {
      this.$refs.form?.form.setFieldsValue({
        deviceId: undefined
      });
      let data = this.$refs.form?.form.getFieldsValue();
      let deviceRequestParam = {
        deviceTypeList: [data.deviceType],
        pageFlag: false
      }
      const { resultData, status } = await queryList(deviceRequestParam);
      // const { resultData, status } = await listByLocation(
      //   data.deviceType || '',
      //   encodeURIComponent(data.processSection || ''),
      //   encodeURIComponent(data.installationLocation || '')
      // );
      if (status === 'complete') {
        let options = resultData.records || [];
        options.forEach(item => {
          item.value = item.id;
          item.label = item.deviceName;
        });
        setFormItemOptions(this.formOptions, 'deviceId', options);
      }
    },
    handleReset() {
      this.$refs.form.reset();
      this.$emit('cancelSubmit');
    },
    handleSubmit() {
      this.$refs.form.submit();
    },
    async submit(values) {
      this.confirmLoading = true;
      const params = {
        ...values,
        channel: '2',
        status: '0'
      };
      if (values.files?.length) {
        params.files = values.files.map(item => ({ url: item }));
      }
      let res = await problemReportAdd(params);
      if (res.status === 'complete') {
        this.$message.success('问题上报成功！');
        this.$emit('complete');
      }
      this.confirmLoading = false;
    }
  }
};
</script>
