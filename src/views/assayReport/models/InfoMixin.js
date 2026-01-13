import { getAssayReportCodeList } from '@/api/report';

export default {
  props: {
    isEdit: {
      type: Boolean,
      default: false
    },
    configCode: {
      type: String,
      default: ''
    }
  },
  data() {
    const defaultForm = () => ({
      a220: '',
      a2202a275: '',
      a275: '',
      absorbance: '',
      analyzer: '',
      calibrationConcentration: '',
      color: '',
      configCode: '',
      configId: 0,
      configName: '',
      createTime: '',
      createUser: '',
      dataValue: '',
      dilutionFactor: '',
      endTime: '',
      fecalColiformsValue: '',
      macropore: '',
      mass: '',
      measuredAbsorbance: '',
      measuredConcentration: '',
      micropore: '',
      mlss: '',
      mlvss: '',
      relativeError: '',
      reviewStatus: 0,
      reviewer: '',
      samplingDate: '',
      samplingVolume: '',
      settlability: '',
      shape: '',
      startTime: '',
      sv30: '',
      tenantId: '',
      testingTime: '',
      updateTime: '',
      updateUser: '',
      w1: '',
      w2: '',
      w3: '',
      w4: '',
      waterPlantId: '',
      waterPlantName: ''
    });
    return {
      defaultForm,
      form: defaultForm(),
      tableData: [],
      loading: false,
      layout: {
        span: 12,
        labelCol: { span: 4 },
        wrapperCol: { span: 18 }
      }
    };
  },
  computed: {},
  watch: {
    configCode: {
      immediate: true,
      handler(val) {
        if (val && !this.isEdit) {
          this.getAssayReportCodeList(val);
        }
      }
    }
  },
  methods: {
    // columns字段数据
    async getAssayReportCodeList(configCode) {
      this.loading = true;
      try {
        const { status, resultData = [] } = await getAssayReportCodeList({
          configType: '1',
          configCode
        });
        if (status === 'complete') {
          this.tableData = (resultData || []).map(item => ({
            ...this.defaultForm(),
            configName: item.desc || '',
            configId: item.id || ''
          }));
        } else {
          this.tableData = [];
        }
      } finally {
        this.loading = false;
      }
    },
    // 处理数据
    handleData() {
      return this.tableData.map(item => ({
        ...item,
        calibrationConcentration: this.form.calibrationConcentration || '',
        measuredAbsorbance: this.form.measuredAbsorbance || '',
        measuredConcentration: this.form.measuredConcentration || '',
        relativeError: this.form.relativeError || '',
        analyzer: this.form.analyzer || '',
        testingTime: this.form.testingTime || '',
        configCode: this.configCode || ''
      }));
    },
    // 清理数据
    clearData() {
      this.form = this.defaultForm();
      this.tableData = [];
    },
    // 处理编辑数据
    handleEditData(row) {
      this.form = { ...this.defaultForm(), ...row };
      this.tableData = [this.form];
    }
  }
};
