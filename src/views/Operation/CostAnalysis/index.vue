<template>
  <div class="full-view">
    <div class="full-view-top">
      <FactorySelect
        v-model="waterPlantIdObj.waterPlantId"
        style="width: 200px;margin-right:16px;"
        autoSelect
      ></FactorySelect>
      <TimePicker
        style="width: 310px"
        v-model="time"
        :timePickerOption="{ defaultTimeType: 'date', disabledDate: disabledDate }"
        size="default"
        @change="timeChange"
      ></TimePicker>
    </div>
    <div class="full-view-middle">
      <WaterAnalysis class="card" />
      <PieCard class="card" title="成本金额比例" @changeTab="changeTab" />
      <AreaChartCard class="card" @changeTime="changeTime" />
    </div>
    <div class="full-view-select wbgc-card">
      <w-tabs v-model="defaultFirstLevel" @change="onChange">
        <w-tab-pane v-for="item in firstLevelCost" :key="item.id" :tab="item.name" />
      </w-tabs>
      <div class="full-view-bottom">
        <PieCard class="left" :firstCostType="firstCostType" />
        <CostConsumption
          :secondaryCostList="secondaryCostList"
          :firstCostType="firstCostType"
          class="right"
          @changeTime="changeTime"
        />
      </div>
    </div>
  </div>
</template>

<script>
import components from './components';
import moment from 'moment';

export default {
  name: 'CostAnalysis',
  provide() {
    return {
      waterPlantIdObj: this.waterPlantIdObj,
      themeObj: this.themeObj
    };
  },
  inject: ['state'],
  components: { ...components },
  data() {
    return {
      firstLevelCost: [],
      secondaryCostList: [],
      defaultFirstLevel: '',
      firstCostType: {}, //选中的一级成本类型对象
      time: { time: moment().format('YYYY'), type: 'year' },
      waterPlantIdObj: {
        waterPlantId: '',
        startTime: '',
        endTime: '',
        dateType: 'YEAR',
        time: moment().format('YYYY')
      },
      themeObj: {
        theme: ''
      }
    };
  },
  mounted() {
    this.getList();
  },
  watch: {
    'state.theme': {
      handler(val) {
        if (val === 'dark') {
          this.themeObj.theme = 'dark';
        } else {
          this.themeObj.theme = 'light';
        }
      },
      immediate: true
    }
  },
  methods: {
    disabledDate(current) {
      return current && current > moment();
    },
    //按钮切换,获取到二级成本类型
    onChange() {
      let obj = this.firstLevelCost.find(item => item.id === this.defaultFirstLevel) || {};
      let unit = obj?.unit ? `(${obj.unit})` : '';
      this.firstCostType = {
        name: obj.name || '',
        unit: unit,
        id: obj.id || ''
      };
      this.secondaryCostList = obj.child || [];
    },
    //获取按钮列表
    async getList() {
      this.firstLevelCost = [];
      try {
        let { resultData } = await this.$http.post('/costType/list', { nameLike: '' });
        resultData.records.forEach((item, index) => {
          //7-判断是否存在别名，不存在则显示原成本名
          this.firstLevelCost.push({
            name: item.otherName ? item.otherName : item.name,
            id: item.id,
            unit: item.unit,
            child: [],
            firstName: item.name //处理点击饼图时，对应选择名称
          });
          //24-总+一级成本类型的别名
          this.firstLevelCost[index].child.push({
            name: `总${item.otherName ? item.otherName : item.name}`,
            id: item.id,
            unit: item.unit
          });
          //25-如果二级成本名，则添加
          if (item.children.length) {
            item.children.forEach(child => {
              this.firstLevelCost[index].child.push({ name: child.name, id: child.id });
            });
          }
        });
        //7-默认选中第一项
        this.defaultFirstLevel = this.firstLevelCost[0]?.id || '';
        this.onChange();
      } catch (e) {
        console.log(e);
      }
    },
    //修改选中按钮
    changeTab(val) {
      this.defaultFirstLevel = this.firstLevelCost.find(item => item.firstName === val).id;
      this.onChange();
    },
    //对时间参数进行处理
    timeChange(val) {
      this.waterPlantIdObj.dateType = val.type === 'date' ? 'DAY' : val.type.toUpperCase();
      this.waterPlantIdObj.startTime = val.startDate;
      this.waterPlantIdObj.endTime = val.endDate;
      this.waterPlantIdObj.time = val.time;
    },
    //子组件传值出来，修改父组件的时间
    changeTime(val) {
      //修改组件的选中值
      this.time.time = val.time;
      //修改当前时间
      this.waterPlantIdObj.time = val.time;
      this.waterPlantIdObj.startTime = moment(val.time)
        .startOf(val.type)
        .format('YYYY-MM-DD 00:00:00');
      this.waterPlantIdObj.endTime = moment(val.time)
        .endOf(val.type)
        .format('YYYY-MM-DD 23:59:59');
      this.waterPlantIdObj.dateType = val.type === 'day' ? 'DAY' : val.type.toUpperCase();
    }
  }
};
</script>

<style lang="less" scoped>
.full-view {
  width: 100%;
  overflow: auto;
  &::-webkit-scrollbar {
    display: none;
  }
  &-top {
    height: 40px;
    width: 100%;
    display: flex;
    align-items: center;
    /deep/ .wpg-calendar-picker-input {
      height: 36px !important;
      line-height: 36px !important;
    }
    /deep/ .wpg-calendar-input-wrap {
      height: 36px !important;
    }
    /deep/.yearInput {
      height: 36px !important;
    }
    /deep/.anticon-calendar {
      line-height: 40px !important;
    }
  }
  &-middle {
    width: 100%;
    height: calc((100% - 115px) / 2);
    min-height: 372px;
    margin-top: 10px;
    display: flex;
    .card {
      width: 40%;
      height: 100%;
      border-radius: 4px;
      margin-right: 10px;
      &:last-child {
        margin-right: 0;
      }
    }
    .card:nth-child(2) {
      width: 30%;
    }
    .card:nth-child(3) {
      width: 30%;
    }
  }
  &-select {
    width: 100%;
    height: calc((100% - 15px) / 2);
    min-height: 407px;
    margin-top: 10px;
    border-radius: 4px;
    padding: 10px 16px 16px;
  }
  &-bottom {
    display: flex;
    width: 100%;
    height: calc(100% - 48px);
    border-radius: 4px;
    .left {
      width: 31%;
      margin-right: 10px;
      border-radius: 4px;
      height: 100%;
    }
    .right {
      width: 68%;
      border-radius: 4px;
      height: 100%;
      box-shadow: 0 1px 6px 2px rgba(4, 12, 25, 0.08);
    }
  }
}

/deep/ .wpg-tabs-tab {
  width: 100px;
  text-align: center;
  margin: 0 10px;
}
</style>
