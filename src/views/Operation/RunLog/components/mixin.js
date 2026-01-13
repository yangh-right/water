import { basicFields } from './config';
import { setTree } from '@/utils/util';
import moment from 'moment';
import _ from 'lodash-es';
import { getFields } from './config';

export default {
  inject: ['state', 'closeTab'],
  data() {
    return {
      layout: { span: 12, labelCol: { span: 4 }, wrapperCol: { span: 12 }, colon: true },
      basicFields,
      basicForm: {},
      shiftList: [],
      runLogFormData: ['厌氧池', '缺氧池', '好氧池'],
      runLogFormJson: [
        {
          title: '厌氧池',
          formData: {},
          modelFields: getFields('backFlow', 'ORP', 'MLSS')
        },
        {
          title: '缺氧池',
          formData: {},
          modelFields: getFields('inBackFlow', 'ORP', 'MLSS')
        },
        {
          title: '好氧池',
          formData: {},
          modelFields: getFields('DO', 'MLSS', 'NN')
        }
      ],
      params: {
        currentPage: 1,
        delFlag: 0,
        orderBy: '',
        pageFlag: true,
        pageSize: 10,
        tenantId: '',
        validFlag: 1,
        nameLike: ''
      },
      page: { size: 10, pages: 1, total: 0 },
      newTitle: ''
    };
  },
  filters: {
    formatTime(val) {
      return val.substring(0, 5);
    }
  },
  methods: {
    //今天之后的年月日不可选，不包括今天
    disabledDate(current) {
      return current > moment().subtract(0, 'day');
    },
    getFields,
    // 获取班次列表
    async getShiftList(id) {
      try {
        let { resultData } = await this.$http.post('/shift/list', {
          waterPlantId: id,
          ...this.params,
          page: this.page
        });
        this.shiftList = resultData.records;
      } catch (e) {
        this.shiftList = [];
      }
    },
    // 获取班组列表
    async getClassList(id) {
      try {
        let { resultData } = await this.$http.get(
          `/team/getTeamCrewsTreeByWaterPlantId?waterPlantId=${id}`
        );
        setTree(resultData);
        this.basicFields[3].attrs.treeData = resultData;
      } catch (e) {
        this.basicFields[3].attrs.treeData = [];
      }
    },
    //水厂改变时，获取列表
    async factoryChange(val) {
      this.basicForm = {
        onDutyDate: this.basicForm.onDutyDate,
        classId: null,
        shiftPerson: null,
        waterPlantId: val
      };
      await this.getShiftList(val);
      await this.getClassList(val);
    },
    //修改传给后端的时间和班次信息
    getShifInfo(id, date) {
      let arr = this.shiftList.filter(item => item.id === id);
      return {
        startDate: date + ' ' + arr[0].startTime,
        endDate: date + ' ' + arr[0].endTime,
        shiftName: arr[0].name
      };
    },

    //保存信息
    async handleSubmit(type) {
      if (!this.onSubmit()) {
        this.$message.warn('请检查必填内容是否为空！');
        return;
      }
      if (!this.runLogFormJson.length) {
        this.$message.warn('请填写运行数据！');
        return;
      }
      this.basicForm.shiftPerson = this.basicForm.shiftPerson.toString();
      let shiftObj =
        this.basicForm.classId &&
        this.getShifInfo(this.basicForm.classId, this.basicForm.onDutyDate);
      let waterPlantName = this.factoryName(this.basicForm.waterPlantId);
      if (type === 'edit') this.handleEdit(shiftObj, waterPlantName);
      else this.handleAdd(shiftObj, waterPlantName);
    },

    //返回运行日志列表
    goBack() {
      this.closeTab();
      this.goto('/Operation/RunLog');
    },

    handleGoBack() {
      this.$confirm({
        title: '返回后将无法保留当前编辑信息，确定返回吗？',
        okText: '返回',
        cancelText: '取消',
        onOk: () => {
          this.goBack();
        },
        onCancel: () => {}
      });
    },
    //新增数据项
    addItem() {
      if (!this.newTitle.trim()) {
        this.$message.warn('输入的名称不能为空');
        return;
      }
      this.runLogFormData.push(this.newTitle);
      this.runLogFormJson.push({ title: this.newTitle, formData: {} });
      this.newTitle = '';
    },
    //删除数据项
    removeItem(val) {
      this.runLogFormData = _.remove(this.runLogFormData, item => item !== val);
      this.runLogFormJson = _.remove(this.runLogFormJson, item => item.title !== val);
    },
    //校验基本信息和运行数据的内容
    onSubmit() {
      let basicPass = true;
      let modelPass = true;
      let newArr = [];
      this.$refs.basicForm.validate(valid => {
        if (!valid) {
          basicPass = false;
          return false;
        } else {
          basicPass = true;
        }
      });
      this.$refs.formItem &&
        this.$refs.formItem.forEach(item => {
          newArr.push(item.checkVal());
        });
      modelPass = newArr.every(item => item);
      return basicPass && modelPass;
    }
  }
};
