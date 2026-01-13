import { sysDictListByCode } from '@/api/manage';
import { set, cloneDeep } from 'lodash-es';
import serverConfig from '@/config/server.config';
import moment from 'moment';
import { saveAs } from 'file-saver';
import { mapState } from 'vuex';
import { h } from '@vue/composition-api';
// import UploadDraggerDialog from '@/components/UploadFile/UploadDraggerDialog.vue';
// import UploadFile from '@/components/UploadFile/UploadFile.vue';
function isExcel(value) {
  const pattern = /^.*\.(?:xls|xlsx)$/;
  return pattern.test(value);
}
export function exportFile(data, filename, ext = 'xlsx', mime = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=utf-8') {
  if (data instanceof Blob) {
    let blob = new Blob([data], { type: mime });
    if (window.navigator.msSaveBlob) {
      try {
        // ie浏览器自带下载文件的方法
        window.navigator.msSaveBlob(data, filename);
      } catch (e) {}
    } else {
      let elink = document.createElement('a');
      elink.download = filename + '.' + ext;
      elink.style.display = 'none';
      let href = window.URL.createObjectURL(blob);
      elink.href = href;
      document.body.appendChild(elink);
      elink.click();

      setTimeout(() => {
        document.body.removeChild(elink);
        window.URL.revokeObjectURL(href); // 释放掉blob对象
      }, 200);
    }
  }
}
export function importFile(callback) {
  let input = document.createElement('input');
  input.setAttribute('type', 'file');
  input.setAttribute('accept', '*');
  input.style.display = 'none';
  input.addEventListener('change', () => {
    if (input.files && input.files.length > 0) {
      callback && callback(input.files[0]);
    }
  });
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}
export const config = {
  showAddBtn: true,
  showImportBtn: true,
  searchFields: [
    {
      search: true,
      name: 'name',
      type: 'select',
      label: '所在大区',
      placeholder: '请输入 ',
      listeners: {},
      colon: true
    }
  ],
  columns: [
    {
      title: '序号',
      dataIndex: 'num',
      key: 'num',
      width: 80,
      customRender: (text, row, index) => {
        return index + 1;
      }
    },
    {
      title: '所在大区',
      ellipsis: true,
      dataIndex: '5'
    }
  ],
  detailFields: []
};

export const defaultMixin = {
  name: 'SearchTable',
  props: {
    defaultSearchForm: {
      type: Object,
      default: () => ({})
    },
    defaultDetailForm: {
      type: Object,
      default: () => ({})
    }
  },
  data() {
    return {
      layout: {
        span: 6,
        gutter: [0, 0],
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      },
      detailLayout: {
        gutter: [24, 0],
        span: 8,
        wrapperCol: { span: 24 },
        labelCol: { span: 24 }
      },
      tableProps: {
        showCheckbox: false,
        showTotal: false,
        initSelectedRowKeys: []
      },
      tableEvent: {
        changeCheckbox: this.changeTableCheckbox,
        changePage: this.changePage
      },
      initDetailForm: {}, //弹窗刚打开时表单的数据
      timeKeys: [],
      detailWidth: 1160,
      showImportBtn: false,
      showExportBtn: false,
      showAddBtn: true,
      searchFields: [],
      detailFields: [],
      columns: [],
      tableListMeth: null,
      delMeth: null,
      addMeth: null,
      editMeth: null,
      importMeth: null,
      downName: '资料',
      exportMeth: null,
      modalType: 0, //0 新增 1编辑
      searchForm: { ...this.defaultSearchForm },
      hideSearchFields: [],
      disabledSearchFields: [],
      detailForm: { ...this.defaultDetailForm },
      detailLoading: false,
      visible: false,
      dataList: [],
      initColumns: [],
      selectedKeys: [],
      dateParam: {
        date: {
          params: ['startDate', 'endDate'],
          dateFormat: 'YYYY-MM-DD HH:mm:ss'
        }
      },
      selectedRows: [],
      tableLoading: false,
      page: {
        pageSize: 50,
        currentPage: 1,
        total: 0
      }
    };
  },
  computed: {
    ...mapState('account', {
      user: state => state.user || {}
    }),
    ...mapState('setting', {
      buttonCodes: state => state.buttonCodes || {}
    }),
    isAdmin() {
      return this.user.adminUser === 1;
    },
    userOrgId() {
      return this.user.orgId || '';
    },
    detailTip() {
      return this.modalType ? '编辑成功！' : '新增成功！';
    },
    detailTitle() {
      return this.modalType ? '编辑' : '新增';
    },
    tableScroll() {
      return {
        x: this.columns.length * 150
      };
    }
  },
  watch: {
    initColumns: {
      handler(val) {
        this.columns = val.filter(col => !col.ifHide);
      },
      immediate: true
    }
  },
  mounted() {
    this.queryData();
  },
  activated() {
    if (this.$route.query.drillDownTime && sessionStorage.getItem('drillDownTime' + this.$route.path) !== this.$route.query.drillDownTime) {
      sessionStorage.setItem('drillDownTime' + this.$route.path, this.$route.query.drillDownTime);
      this.searchForm = this.getInitSearchForm();
      this.initQuery();
    }
  },
  methods: {
    initQuery() {
      const routeQuery = this.$route.query;
      this.searchFields.forEach(item => {
        if (routeQuery[item.name]) {
          this.searchForm[item.name] = routeQuery[item.name];
        }
      });
      this.getList();
    },
    queryData() {
      this.getList();
    },
    handleDetailSubmit() {
      try {
        this.$refs.detailModal.$refs['info-form'].validate(async valid => {
          if (valid) {
            let meth = this.modalType ? this.editMeth : this.addMeth;
            if (!meth) return;
            const { status } = await meth(this.handleDetailApiParams(this.handleParams(this.detailForm)));
            if (status === 'complete') {
              this.$message.success(this.detailTip);
              this.getList();
            }
            this.visible = false;
          } else {
            return false;
          }
        });
      } catch (error) {
        console.log('error', error);
      }
    },
    handleDetailApiParams(params) {
      return params;
    },
    imageFullUrl(url) {
      return /^secondary-water-supply/.test(url) ? serverConfig.IMG_HOST_URL + url : url;
    },
    handleAdd(row) {
      this.modalType = 0;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.detailModal.$refs['info-form'].resetFields();
        this.detailForm = this.getInitDetailForm();
        this.handleForm({});
        this.initDetailForm = cloneDeep(this.detailForm);
      });
    },
    rowEdit(row) {
      this.modalType = 1;
      this.visible = true;
      this.$nextTick(() => {
        this.$refs.detailModal.$refs['info-form'].resetFields();
        this.setForm(this.detailForm, this.handleParams(row, false));
        this.handleForm(row);
        this.initDetailForm = cloneDeep(this.detailForm);
      });
    },
    handleForm() {},
    setForm(form, value) {
      if (value) {
        Object.keys(value).forEach(item => {
          this.$set(form, item, value[item]);
        });
      } else {
        Object.keys(form).forEach(item => {
          this.$set(form, item, value);
        });
      }
    },
    disableForm(field, condition) {
      let disabled = condition === undefined ? !this.isAdmin && this.modalType && (this.initDetailForm[field] || typeof this.initDetailForm[field] === 'number') : condition;
      if (disabled) {
        return true;
      }
      return false;
    },
    rowDelete(row) {
      this.$confirm({
        title: '提示',
        content: '您确定要进行此操作吗',
        onOk: async () => {
          if (!this.delMeth) return;
          const { resultData, status } = await this.delMeth(row.id);
          if (status === 'complete') {
            this.$message.success('删除成功！');
            if (this.selectedKeys.includes(row.id)) {
              let index = this.selectedKeys.findIndex(id => id === row.id);
              this.selectedKeys.splice(index, 1);
              let rowIndex = this.selectedRows.findIndex(item => item.id === row.id);
              this.selectedRows.splice(rowIndex, 1);
              this.tableProps.initSelectedRowKeys = this.selectedKeys;
            }
            if (this.dataList.length === 1) {
              this.page.currentPage = 1;
            }
            this.getList();
          }
        }
      });
    },
    handleSearch() {
      this.page.currentPage = 1;
      this.getList();
    },
    handleReset() {
      this.page.currentPage = 1;
      this.getList();
    },
    openUploadDialog() {
      this.$refs.uploadDialog && (this.$refs.uploadDialog.visible = true);
    },
    async handleImport(fileList, callback) {
      const formData = new FormData();
      for (let file of fileList) {
        if (!isExcel(file.name)) {
          this.$message.error('请选择Excel文件进行上传');
          callback && callback({ status: 0 });
          return;
        }
        formData.append('file', file);
      }
      if (!this.importMeth) {
        callback && callback({ status: 0 });
        return;
      }
      const res = await this.importMeth(formData, this.tab);
      if (!res?.size) {
        this.$message.success('导入成功！');
        callback && callback({ status: 1, data: res });
        this.getList();
      } else if (res?.status === 'error' || res.size) {
        callback && callback({ status: 0, data: res });
      }
    },

    async handleExport() {
      if (!this.exportMeth) return;
      let page = {
        current: this.page.currentPage,
        size: this.page.pageSize
      };
      this.exportMeth(this.handleParams({ ...this.searchForm, page })).then(res => {
        saveAs(res, this.downName);
        if (res.size) {
          this.$message.success('导出成功！');
        }
      });
    },
    async getList() {
      if (!this.tableListMeth) return;
      this.tableLoading = true;
      let page = {
        current: this.page.currentPage,
        size: this.page.pageSize
      };
      if (this.page?.orders?.length) page.orders = this.page.orders;
      const { resultData, status } = await this.tableListMeth(this.handleApiParams(this.handleParams({ ...this.searchForm, page })));
      if (status === 'complete') {
        let { records, total } = resultData;
        this.page.total = total;
        this.dataList = records;
        this.handleList();
      }
      this.tableLoading = false;
    },
    handleApiParams(params) {
      return params;
    },
    handleList() {},
    handleParams(val, timeFormat = true) {
      let params = {
        ...val
      };
      Object.keys(params)?.forEach(key => {
        if (timeFormat && params[key]?._isAMomentObject) {
          params[key] = params[key].format(this.dateParam?.[key]?.dateFormat || 'YYYY-MM-DD HH:mm:ss');
        } else if (!timeFormat && params[key] && this.timeKeys.includes(key)) {
          params[key] = moment(params[key]);
        } else if (timeFormat && Array.isArray(params[key]) && params[key].length && params[key].every(time => time?._isAMomentObject) && this.dateParam[key]) {
          this.dateParam[key].params.forEach((time, i) => {
            params[time] = params[key][i].format(this.dateParam[key].dateFormat || 'YYYY-MM-DD HH:mm:ss');
          });
        }
      });
      return params;
    },
    hide() {
      this.visible = false;
    },
    getInitDetailForm(tab = 'type') {
      const initForm = {};
      this.detailFields?.forEach(item => {
        initForm[item.name] = undefined;
      });
      if (this.tab || typeof this.tab === 'number') {
        initForm[tab] = this.tab;
      }
      return { ...initForm, ...this.defaultDetailForm };
    },
    getInitSearchForm(tab = 'type') {
      // const initForm = {}
      // this.searchFields?.forEach(item => {
      //   initForm[item.name] = undefined
      // })
      // if (this.tab || typeof this.tab === 'number') {
      //   initForm[tab] = this.tab
      // }
      // return { ...initForm, ...this.defaultSearchForm }
      return this.searchForm;
    },
    async sysDictListByCode(key, field, callback) {
      const { resultData, status } = await sysDictListByCode(key);
      if (status === 'complete') {
        const dictList = resultData || [];
        dictList.forEach(item => {
          item.value = item.dictValue;
          item.label = item.dictName;
        });
        if (callback) {
          callback(dictList);
          return
        }
        this.setFieldOptions(dictList, field);
      }
    },
    async setDictByApi(config) {
      let { api, params, replaceFields, field } = config;
      if (!api || !field) return;
      if (!replaceFields) {
        replaceFields = { label: 'name', value: 'id' };
      }
      const { resultData, status } = await api(params);
      if (status === 'complete') {
        const dictList = resultData || [];
        dictList.forEach(item => {
          item.label = item[replaceFields.label];
          item.value = item[replaceFields.value];
        });
        this.setFieldOptions(dictList, field);
      }
    },
    setDictMap(dictList, field) {
      this[field + 'Map'] = {};
      dictList.forEach(item => {
        this[field + 'Map'][item.value] = item.label;
      });
    },
    getDictName(field, text) {
      if (this[field + 'Map']) {
        return this[field + 'Map'][text] || '';
      } else {
        return '';
      }
    },
    setFieldOptions(list, field, path) {
      this.setSearchFieldOptions(list, field, path);
      this.setDetailFieldOptions(list, field, path);
      this.setColumnOptions(list, field, path);
    },
    setSearchFieldOptions(list, field, path) {
      const searchField = this.searchFields.find(item => item.name === field);
      if (path && searchField) {
        set(searchField, path, list);
      } else {
        searchField && (searchField.options = [...list]);
      }
    },
    setColumnOptions(list, field, path) {
      this.setDictMap(list, field);
      const columnItem = this.columns.find(item => item.dataIndex === field);
      columnItem &&
        (columnItem.customRender = text => {
          return this[field + 'Map']?.[text] || '--';
        });
    },
    setDetailFieldOptions(list, field, path) {
      const detailField = this.detailFields.find(item => item.name === field);
      if (path && detailField) {
        set(detailField, path, list);
      } else {
        detailField && (detailField.options = [...list]);
      }
    },
    tableChangeRadio(keys, rows) {
      this.selectedKeys = keys;
      this.selectedRows = rows;
      this.$emit('selectedRows', rows);
    },
    openTableSelectDialog(ref = 'tableSelectDialog') {
      this.$refs[ref].visible = true;
    },
    resetTableSelected() {
      this.tableProps.initSelectedRowKeys = [];
      this.selectedKeys = [];
      this.selectedRows = [];
      this.$emit('selectedRows', []);
    },
    changePage() {
      this.getList();
    },
    changeTableCheckbox(keys, rows) {
      this.selectedKeys = keys;
      this.selectedRows = rows;
      this.$emit('selectedRows', rows);
    }
  }
};
export const formMixin = {
  name: 'CustomForm',
  components: {
    // UploadDraggerDialog,
    // UploadFile
  },
  props: {
    value: {
      type: Object,
      default: () => ({})
    },
    isEdit: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      editMeth: null,
      addMeth: null,
      addSuccessTip: '新增成功！',
      editSuccessTip: '编辑成功！',
      formProps: {
        loading: false,
        footerNewLine: true,
        neddRetain: false,
        enterText: '确定'
      },
      timeKeys: [],
      formEvent: {
        submit: this.submit,
        cancel: this.cancel
      },
      fields: [],
      form: {},
      layout: {
        span: 6,
        wrapperCol: { span: 18 },
        labelCol: { span: 6 }
      }
    };
  },
  watch: {
    value: {
      handler(val) {
        this.setFormValue(val);
      },
      immediate: true
    }
  },
  methods: {
    getInitForm() {
      const initForm = {};
      this.fields?.forEach(item => {
        initForm[item.name] = undefined;
      });
      return { ...initForm };
    },
    setFormValue(row) {
      if (this.isEdit) {
        this.$nextTick(() => {
          this.$refs.info_form.resetFields();
          this.setForm(this.form, this.handleParams(row, false));
          this.handleForm(this.form);
        });
      } else {
        this.$nextTick(() => {
          this.$refs.info_form.resetFields();
          this.form = this.getInitForm();
          this.handleForm(this.form);
        });
      }
    },
    setForm(form, value) {
      if (value) {
        Object.keys(value).forEach(item => {
          this.$set(form, item, value[item]);
        });
      } else {
        Object.keys(form).forEach(item => {
          this.$set(form, item, value);
        });
      }
    },
    openUploadDialog() {
      this.$refs.uploadDialog && (this.$refs.uploadDialog.visible = true);
    },
    async handleImport(fileList, callback) {
      const formData = new FormData();
      for (let file of fileList) {
        if (!isExcel(file.name)) {
          this.$message.error('请选择Excel文件进行上传');
          callback && callback({ status: 0 });
          return;
        }
        formData.append('file', file);
      }
      if (!this.importMeth) {
        callback && callback({ status: 0 });
        return;
      }
      const res = await this.importMeth(formData, this.tab);
      if (!res?.size) {
        this.$message.success('导入成功！');
        callback && callback({ status: 1, data: res });
        this.getList();
      } else if (res?.status === 'error' || res.size) {
        callback && callback({ status: 0, data: res });
      }
    },
    handleForm() {},
    handleParams(val, timeFormat = true) {
      let params = {
        ...val
      };
      Object.keys(params)?.forEach(key => {
        if (timeFormat && params[key]?._isAMomentObject) {
          params[key] = params[key].format('YYYY-MM-DD HH:mm:ss');
        } else if (!timeFormat && params[key] && this.timeKeys.includes(key)) {
          params[key] = moment(params[key]);
        }
      });
      return params;
    },
    async sysDictListByCode(key, field, callback) {
      const { resultData, status } = await sysDictListByCode(key);
      if (status === 'complete') {
        const dictList = resultData || [];
        dictList.forEach(item => {
          item.label = item.name;
        });
        if (callback) {
          callback(dictList);
          return;
        }
        this.setFieldOptions(dictList, field);
      }
    },
    async setDictByApi(config) {
      let { api, params, replaceFields, field } = config;
      if (!api || !field) return;
      if (!replaceFields) {
        replaceFields = { label: 'name', value: 'id' };
      }
      const { resultData, status } = await api(params);
      if (status === 'complete') {
        const dictList = resultData || [];
        dictList.forEach(item => {
          item.label = item[replaceFields.label];
          item.value = item[replaceFields.value];
        });
        this.setFieldOptions(dictList, field);
      }
    },
    setDictMap(dictList, field) {
      this[field + 'Map'] = {};
      dictList.forEach(item => {
        this[field + 'Map'][item.value] = item.label;
      });
    },
    setFieldOptions(list, field, path) {
      const detailField = this.fields.find(item => item.name === field);
      if (path && detailField) {
        set(detailField, path, list);
      } else {
        detailField && (detailField.options = [...list]);
      }
      this.setOtherOptions(list, field, path);
    },
    setOtherOptions(list, field, path) {},
    handleApiParams(params) {
      return params;
    },
    submit() {
      try {
        this.$refs.info_form.validate(async valid => {
          if (valid) {
            let meth = this.isEdit ? this.editMeth : this.addMeth;
            if (!meth) return;
            this.formProps.loading = true;
            const { status } = await meth(this.handleApiParams(this.handleParams(this.form)));
            this.formProps.loading = false;
            if (status === 'complete') {
              let tip = this.isEdit ? this.editSuccessTip : this.addSuccessTip;
              this.$message.success(tip);
              this.$emit('action', true);
            }
          } else {
            return false;
          }
        });
      } catch (error) {
        console.log('error', error);
      }
    },
    cancel() {
      this.$emit('action', false);
    }
  }
};
export const tableMixin = {
  name: 'table',
  data() {
    return {
      tableProps: {
        showCheckbox: false,
        showTotal: false,
        initSelectedRowKeys: []
      },
      tableEvent: {
        changeCheckbox: this.changeTableCheckbox,
        changePage: this.changePage
      },
      columns: [],
      tableListMeth: null,
      selectedKeys: [],
      selectedRows: [],
      tableLoading: false,
      page: {
        pageSize: 10,
        currentPage: 1,
        total: 0
      }
    };
  },
  computed: {
    tableScroll() {
      return {
        x: this.columns.length * 150
      };
    }
  },
  methods: {
    async getList() {
      if (!this.tableListMeth) return;
      this.tableLoading = true;
      let page = {
        current: this.page.currentPage,
        size: this.page.pageSize
      };
      const { resultData, status } = await this.tableListMeth({ ...this.tableParams, page });
      if (status === 'complete') {
        let { records, total } = resultData;
        this.page.total = total;
        this.dataList = records;
        this.handleList();
      }
      this.tableLoading = false;
    },
    resetTableSelected() {
      this.tableProps.initSelectedRowKeys = [];
      this.selectedKeys = [];
      this.selectedRows = [];
      this.$emit('selectedRows', []);
    },
    changePage() {
      this.getList();
    },
    changeTableCheckbox(keys, rows) {
      this.selectedKeys = keys;
      this.selectedRows = rows;
      this.$emit('selectedRows', rows);
    },
    handleList() {},
    tableChangeRadio(keys, rows) {
      this.selectedKeys = keys;
      this.selectedRows = rows;
      this.$emit('selectedRows', rows);
    }
  }
};
