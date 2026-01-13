/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-06-15 09:05:37
 * @LastEditors: wangyr
 * @LastEditTime: 2024-10-19 11:29:15
 * @Description:
 */
import moment from 'moment';
import { handleConfig, handleDetailFields } from '@/components/SearchTable/util';
export function getProcessAdjustConfig(_this) {
  const config = {
    searchFields: [
      {
        name: 'date',
        type: 'range-picker',
        label: '时间',
        placeholder: ['开始时间', '结束时间'],
        options: [],
        attrs: {
          disabledDate: current => {
            return current && current > moment().endOf('day');
          }
        },
        listeners: {}
      }
    ],
    initColumns: [
      {
        title: '序号',
        dataIndex: 'num',
        key: 'num',
        width: 80,
        customRender: (text, row, index) => {
          return index + 1;
        }
      },
      { dataIndex: 'fillDate', title: '日期', ellipsis: true },
      { dataIndex: 'classes', title: '班次', ellipsis: true },
      { dataIndex: 'sludgeDischargeCondition', title: '排泥情况', ellipsis: true },
      { dataIndex: 'waterQualitySituation', title: '水质预警情况', ellipsis: true },
      { dataIndex: 'remark', title: '备注', ellipsis: true },
      {
        title: '操作',
        type: 'action',
        fixed: 'right',
        width: 180,
        events: [
          {
            name: '详情',
            key: 'detail'
          },
          {
            name: '编辑',
            key: 'edit'
          },
          {
            name: '删除',
            key: 'delete'
          }
        ]
      }
    ],
    detailFields: []
  };
  handleConfig(config);
  return config;
}

export const processConfig = [
  {
    name: '一二期',
    key: 'processList1',
    waterPlantType: 0
  },
  {
    name: '三期',
    key: 'processList2',
    waterPlantType: 1
  }
];

export const operateContentList = [
  { label: '风量', value: '风量' },
  { label: '米八阀', value: '米八阀' },
  { label: '进水阀', value: '进水阀' },
  { label: '乙酸阀', value: '乙酸阀' },
  { label: '气阀', value: '气阀' },
  { label: '驼峰阀', value: '驼峰阀' }
];
export const operateLocationList = [
  { label: '1#南', value: '1#南' },
  { label: '1#北', value: '1#北' },
  { label: '2#南', value: '2#南' },
  { label: '2#北', value: '2#北' },
  { label: '三万吨', value: '三万吨' },
  { label: '驼峰阀', value: '驼峰阀' }
];
export const classesList = [
  { label: '早', value: 0 },
  { label: '中', value: 1 },
  { label: '晚', value: 2 }
];
export const phaseFields = [
  {
    name: 'operateTime',
    type: 'time-picker',
    label: '操作时间',
    placeholder: '请选择',
    span: 9,
    wrapperCol: { span: 16 },
    labelCol: { span: 8 },
    rules: [
      {
        required: true,
        message: '该字段不能为空！'
      }
    ],
    attrs: {
      format: 'HH:mm',
      allowClear: true
    }
  },
  {
    name: 'operateContent',
    type: 'select',
    label: '操作内容',
    span: 9,
    wrapperCol: { span: 16 },
    labelCol: { span: 8 },
    placeholder: '请选择',
    attrs: {
      allowClear: true
    }
  },
  {
    name: 'operatePosition',
    type: 'select',
    label: '操作位置',
    span: 9,
    wrapperCol: { span: 16 },
    labelCol: { span: 8 },
    attrs: {
      allowClear: true
    }
  },
  {
    name: 'operateValue',
    type: 'input-number',
    label: '操作数值',
    span: 9,
    wrapperCol: { span: 16 },
    labelCol: { span: 8 },
    attrs: {
      min: 0,
      allowClear: true
    }
  },
  {
    name: 'fontColorObj',
    type: 'input',
    span: 6,
    wrapperCol: { span: 8 },
    labelCol: { span: 16 },
    label: '字体颜色',
    placeholder: '请输入'
  }
];

handleDetailFields(phaseFields);

export const detailFields = [
  {
    name: 'fillDate',
    type: 'date-picker',
    label: '日期',
    span: 9,
    wrapperCol: { span: 18 },
    labelCol: { span: 6 },
    placeholder: '请选择',
    rules: [
      {
        required: true,
        message: '该字段不能为空！'
      }
    ]
  },
  {
    name: 'classes',
    type: 'select',
    label: '班次',
    span: 9,
    wrapperCol: { span: 18 },
    labelCol: { span: 6 },
    placeholder: '请选择',
    rules: [
      {
        required: true,
        message: '该字段不能为空！'
      }
    ],
    options: classesList
  },
  {
    name: 'sludgeDischargeCondition',
    type: 'textarea',
    label: '排泥情况',
    placeholder: '请输入',
    span: 18,
    wrapperCol: { span: 19 },
    labelCol: { span: 5 },
    attrs: {
      allowClear: true,
      autoSize: { minRows: 2, maxRows: 5 }
    }
  },
  {
    name: 'waterQualitySituation',
    type: 'textarea',
    label: '水质预警情况',
    placeholder: '请输入',
    span: 18,
    wrapperCol: { span: 19 },
    labelCol: { span: 5 },
    attrs: {
      allowClear: true,
      autoSize: { minRows: 2, maxRows: 5 }
    }
  },
  {
    name: 'remark',
    type: 'textarea',
    label: '备注',
    placeholder: '请输入',
    span: 18,
    wrapperCol: { span: 21 },
    labelCol: { span: 3 },
    attrs: {
      allowClear: true,
      autoSize: { minRows: 2, maxRows: 5 }
    }
  },
  {
    name: 'fontColorObj',
    type: 'input',
    span: 6,
    wrapperCol: { span: 10 },
    labelCol: { span: 14 },
    label: '字体颜色',
    placeholder: '请输入'
  },
  {
    name: 'title1',
    type: 'input',
    span: 24,
    label: ''
  },
  {
    name: 'processList1',
    type: 'input',
    span: 24,
    wrapperCol: { span: 24 },
    labelCol: { span: 0 },
    label: ''
  },
  {
    name: 'title2',
    type: 'input',
    span: 24,
    label: ''
  },
  {
    name: 'processList2',
    type: 'input',
    span: 24,
    wrapperCol: { span: 24 },
    labelCol: { span: 0 },
    label: ''
  }
];
handleDetailFields(detailFields);
