<!--
 * @Author: wangyr
 * @Date: 2023-06-28 13:02:11
 * @LastEditors: wangyr
 * @LastEditTime: 2024-11-01 09:50:13
 * @Description:
-->
<template>
  <div class="debugTool">
    <div class="debugTool-head">
      <w-form-model class="supply-bg-bg-card-DEFAULT" layout="inline" ref="form">
        <w-form-model-item label="选择污水厂" prop="waterPlantId">
          <FactorySelect
            v-model.trim="waterPlantId"
            style="width: 220px"
            :showAll="true"
            :autoSelect="true"
            @input="getData"
          ></FactorySelect>
        </w-form-model-item>
      </w-form-model>
    </div>
    <div class="debugTool-centre">
      <w-tabs v-model="tabType" size="large" @change="getData">
        <w-tab-pane key="0" tab="基于溶解氧的模型控制"> </w-tab-pane>
        <w-tab-pane key="1" tab="基于好氧池氨氮的按需曝气控制" force-render> </w-tab-pane>
      </w-tabs>
      <div class="centre">
        <div class="centre-l">
          <w-button type="primary" style="margin: 0 0 10px 10px;" @click="addModal">
            配置
          </w-button>
          <div class="table-box">
            <PaginationTable
              :rowClassName="isRowClick"
              rowKey="id"
              :customRow="customRow"
              class="content-wrapper supply-bg-bg-card-DEFAULT"
              :columns="columns"
              :data-source="data"
            >
              <template slot="isFaulty" slot-scope="text, record">
                <w-radio-group v-model="record.isFaulty" :options="plainOptions" />
              </template>
              <template slot="type" slot-scope="text, record">
                {{ text === 1 ? '氨氮仪' : '溶氧仪' }}
              </template>
              <template slot="targetValue" slot-scope="text, record">
                <w-input-number v-model="record.targetValue" :step="0.1" :min="0" />
              </template>
            </PaginationTable>
          </div>
          <div v-if="tabType === '0'" class="bottom">
            <p style="font-size: 14px;color: #6281A3;">
              计算说明
            </p>
            <p>
              1.点击配置，配置生化池组数，每组生化池中好氧池数量以及每个好氧池中溶解氧仪的数量；
            </p>
            <p>
              2.参数设定，根据工艺需求，设定每台溶氧仪的目标值，设定DO权重（一般为2-4），设定调整步幅（开度一般5%左右，频率一般0.5Hz左右），根据设备情况设定鼓风机开度上下限，设定调整周期（一般20min-120min）；
            </p>
          </div>
          <div v-if="tabType === '1'" class="bottom">
            <p style="font-size: 14px;color: #6281A3;">
              计算说明
            </p>
            <p>
              1.本工具适合好氧池有氨 氮仪的情况，氨氮仪的测量精度要达到土10%;
            </p>
            <p>
              2.点击配置，配置生化池 组数，每组生化池氨氮仪数量;
            </p>
            <p>
              3.根据工艺需求，设定每台氨氮仪的
              目标值，设定过程氨氮权重(一般为2-4)，设定调整步幅(开度一般5%左右
              频率一般0.5Hz左右)，根据设备情况设定鼓风机开度;
            </p>
          </div>
        </div>
        <w-divider type="vertical" />
        <div class="centre-r">
          <p class="title">
            参数设定
          </p>
          <w-form-model ref="ruleForm" :model="form" :rules="rules">
            <w-form-model-item label="DO权重" prop="weight">
              <w-input-number v-model="form.weight" style="width: 287px;" :step="0.1" :min="0" />
            </w-form-model-item>
            <w-form-model-item label="开度调整步幅设定(%)" prop="adjustPace">
              <w-input-number
                v-model="form.adjustPace"
                style="width: 287px;"
                :step="0.1"
                :min="0"
                :formatter="value => `${value}%`"
                :parser="value => value.replace('%', '')"
              />
            </w-form-model-item>
            <w-form-model-item label="鼓风机开度上下限(%)" prop="upperLowerLimit">
              <w-input v-model="form.upperLowerLimit" placeholder="输入示例：10-90" />
            </w-form-model-item>
            <w-form-model-item label="调整周期(分钟min)" prop="cycle">
              <w-input-number v-model="form.cycle" style="width: 287px;" :step="1" :min="0" />
            </w-form-model-item>
            <w-form-model-item style="margin-top: 10px;">
              <w-button
                type="primary"
                style="float: right;"
                :disabled="data.length < 1"
                @click="onSubmit"
              >
                计算
              </w-button>
            </w-form-model-item>
          </w-form-model>
          <p class="title">
            计算结果
          </p>
          <p>鼓风机开度调整量：{{ result }}</p>
        </div>
      </div>
    </div>
    <relevance-model
      ref="releModel"
      @relateChange="getData"
      :waterPlantId="waterPlantId"
      :tabType="tabType"
      :dataList="data"
    ></relevance-model>
  </div>
</template>
<script>
import RelevanceModel from './relevanceModel.vue';
import FactorySelect from '@/components/factory-select/index.vue';
import { getData, calculateAndSave, getDataKeyRealDataMap } from '@/api/debugTool';
import PaginationTable from '@/components/PaginationTable/index.vue';
export default {
  components: {
    FactorySelect,
    RelevanceModel,
    PaginationTable
  },
  data() {
    return {
      waterPlantId: '',
      visible: false,
      tabType: '0',
      plainOptions: [
        { label: '是', value: 1 },
        { label: '否', value: 0 }
      ],
      columns: [],
      currentRecord: { index: 0, id: '', keyData: '' },
      data: [],
      form: {
        weight: '',
        adjustPace: '',
        upperLowerLimit: '',
        cycle: ''
      },
      rules: {
        weight: [{ required: true, message: '请输入权重值', trigger: 'blur' }],
        adjustPace: [{ required: true, message: '请输入开度调整步幅设定值', trigger: 'blur' }],
        upperLowerLimit: [{ required: true, message: '请输入鼓风机开度上下限值', trigger: 'blur' }],
        cycle: [{ required: true, message: '请输入调整周期值', trigger: 'blur' }]
      },
      result: 0,
      timer: null
    };
  },
  watch: {
    tabType: {
      handler(newVal, oldVal) {
        this.columns = [
          {
            title: '好氧池',
            dataIndex: 'placeName',
            key: 'placeName'
          },
          {
            title: newVal === '0' ? '溶氧仪' : '氨氮仪',
            dataIndex: 'deviceName',
            key: 'deviceName'
            // scopedSlots: { customRender: 'type' }
          },
          {
            title: '仪表是否故障',
            key: 'isFaulty',
            dataIndex: 'isFaulty',
            scopedSlots: { customRender: 'isFaulty' }
          },
          {
            title: 'DO目标值(mg/L)',
            dataIndex: 'targetValue',
            key: 'targetValue',
            scopedSlots: { customRender: 'targetValue' }
          },
          {
            title: 'DO实测值(mg/L)',
            key: 'actualValue',
            dataIndex: 'actualValue'
          }
        ];
      },
      deep: true,
      immediate: true
    }
  },
  async mounted() {
    // this.getData();
  },
  methods: {
    getData() {
      if (!this.waterPlantId) return;
      const params = { waterPlantId: this.waterPlantId, type: Number(this.tabType) };
      getData(params).then(res => {
        if (res.status === 'complete') {
          this.data = res.resultData.map(item => {
            return {
              ...item,
              isFaulty: 0,
              targetValue: 0,
              actualValue: item.record.actualValue
            };
          });

          if (this.data.length) {
            this.currentRecord = { index: 0, keyData: this.data[0], id: this.data[0].id };
            let { weight, adjustPace, upperLowerLimit, cycle } = this.data[0].record;
            this.result = this.data[0].record.adjustNumber;
            this.form = {
              weight,
              adjustPace,
              upperLowerLimit,
              cycle
            };
            this.timedTask();
          } else {
            this.currentRecord = { index: 0, id: '', keyData: '' };
            this.form = {
              weight: '',
              adjustPace: '',
              upperLowerLimit: '',
              cycle: ''
            };
          }
        }
      });
    },
    timedTask() {
      this.timer = setInterval(() => {
        //需要定时执行的代码
        this.getDataKeyRealDataMap();
      }, 10 * 1000);
    },
    getDataKeyRealDataMap() {
      const params = { waterPlantId: this.waterPlantId, type: Number(this.tabType) };
      getDataKeyRealDataMap(params).then(res => {
        if (res.status === 'complete') {
          this.data.forEach(item => {
            item.actualValue = res.resultData[item.dataKey].pointValue;
          });
        }
      });
    },
    handleOk() {
      this.visible = false;
    },
    addModal() {
      this.$refs.releModel.visible = true;
    },
    onSubmit() {
      this.$confirm({
        title: '提示',
        content: '您确定要计算吗',
        onOk: async () => {
          let {
            id,
            keyData: {
              targetValue,
              isFaulty,
              deviceId,
              structurePoolId,
              placeId,
              industryDeviceId,
              pointName
            }
          } = this.currentRecord;
          let params = {
            isFaulty,
            targetValue,
            id,
            deviceId,
            structurePoolId,
            placeId,
            industryDeviceId,
            pointName,
            waterPlantId: this.waterPlantId,
            type: Number(this.tabType),
            ...this.form
          };
          this.$refs.ruleForm.validate(valid => {
            if (valid) {
              calculateAndSave(params).then(res => {
                if (res.status === 'complete') {
                  this.result = res.resultData;
                  this.$message.success('计算成功');
                } else {
                  this.result = 0;
                }
              });
            } else {
              console.log('error submit!!');
              return false;
            }
          });
        }
      });
    },
    isRowClick(record, index) {
      return this.currentRecord.index === index ? 'clickClass' : '';
    },
    customRow(record, index) {
      return {
        on: {
          click: () => {
            console.log(record);
            this.currentRecord = { index: index, keyData: record, id: record.id };
            let { weight, adjustPace, upperLowerLimit, cycle } = record.record;
            this.result = record.record.adjustNumber;
            this.form = {
              weight,
              adjustPace,
              upperLowerLimit,
              cycle
            };
          }
        }
      };
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
    this.timer = null;
  }
};
</script>

<style lang="less" scoped>
.debugTool {
  width: 100%;
  height: 100%;
  .debugTool-head {
    height: 60px;
    width: 100%;
    border-radius: 4px;
    background: var(--supply-color-bg-card-DEFAULT);
    display: flex;
    align-items: center;
    padding: 0 12px;
  }
  .debugTool-centre {
    width: 100%;
    margin-top: 10px;
    height: calc(100% - 70px);
    border-radius: 4px;
    overflow: hidden;
    background: var(--supply-color-bg-card-DEFAULT);
    .centre {
      width: 100%;
      height: calc(100% - 57px);
      display: flex;
      justify-content: space-between;
      /deep/.wpg-divider {
        margin-top: 10px;
        height: calc(100% - 20px) !important;
      }
      .centre-l {
        width: calc(100% - 320px);
        height: 100%;
        .table-box {
          width: 100%;
          height: calc(100% - 205px);
          display: flex;
          flex-direction: column;
          /deep/.table-wrapper {
            .wpg-table-tbody {
              cursor: pointer;
              .wpg-table-row.clickClass {
                background: var(--supply-color-table-hover);
              }
            }
          }
          /deep/.pagination-wrapper {
            display: none;
          }
          .content-wrapper {
            flex: 1;
            border-radius: 4px;
          }
        }
        .bottom {
          width: calc(100% - 40px);
          height: 150px;
          background: var(--supply-color-bg-card-dark);
          border-radius: 4px;
          margin-left: 20px;
          padding: 10px 20px;
        }
      }
      .centre-r {
        padding: 10px;
        width: 307px;
        height: 100%;
        .title {
          color: var(--supply-color-main);
          font-size: 16px;
        }
        /deep/.wpg-form-item {
          margin-bottom: 0 !important;
        }
      }
    }
  }
}
</style>
