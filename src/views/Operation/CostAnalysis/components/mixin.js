import moment from 'moment';

export default {
  data() {
    return {};
  },
  computed: {
    //坐标轴时间格式
    formData() {
      if (this.waterPlantIdObj.dateType === 'DAY') return 'HH:00';
      else if (this.waterPlantIdObj.dateType === 'MONTH') return 'D';
      else return 'M[月]';
    }
  },
  methods: {
    //对图例进行区分
    changeDate(data) {
      let columns = [];
      if (data.dateType === 'DAY') {
        if (data.time === moment().format('YYYY-MM-DD')) {
          columns = ['今日', '上一日', '上年同期'];
        } else if (data.time === moment().subtract(1, 'day').format('YYYY-MM-DD')) {
          columns = ['昨日', '上一日', '上年同期'];
        } else {
          columns = [data.time, '上一日', '上年同期'];
        }
      } else if (data.dateType === 'MONTH') {
        if (data.time === moment().format('YYYY-MM')) {
          columns = ['本月', '上一月', '上年同期'];
        } else if (data.time === moment().subtract(1, 'month').format('YYYY-MM')) {
          columns = ['上月', '上一月', '上年同期'];
        } else {
          columns = [data.time, '上一月', '上年同期'];
        }
      } else {
        if (data.time === moment().format('YYYY')) {
          columns = ['今年', moment().subtract(1, 'year').format('YYYY'), moment().subtract(2, 'year').format('YYYY')];
        } else if (data.time === moment().subtract(1, 'year').format('YYYY')) {
          columns = ['去年', moment().subtract(2, 'year').format('YYYY'), moment().subtract(3, 'year').format('YYYY')];
        } else {
          columns = [data.time, moment(data.time).subtract(1, 'year').format('YYYY'), moment(data.time).subtract(2, 'year').format('YYYY')];
        }
      }
      return columns;
    },

    //点击修改时间
    onEchartsClick(e) {
      // 当前时间为月时，点击查询当前选中日期数
      if (this.waterPlantIdObj.dateType === 'DAY') return;
      let params = {
        time: '',
        type: ''
      };
      if (this.waterPlantIdObj.dateType === 'MONTH') {
        params.type = 'day';
        params.time = moment(this.waterPlantIdObj.time + '-' + e.name).format('YYYY-MM-DD');
      } else if (this.waterPlantIdObj.dateType === 'YEAR') {
        params.type = 'month';
        params.time = moment(this.waterPlantIdObj.time + '-' + parseInt(e.name)).format('YYYY-MM');
      }
      this.$emit('changeTime', params);
    }
  }
};
