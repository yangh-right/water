export const fields = [
  {
    label: '选择污水厂：',
    name: 'waterPlantId',
    type: 'select',
    colon: true,
    span: 8,
    wrapperCol: { span: 18 }
  },
  {
    label: '班次名称：',
    name: 'nameLike',
    type: 'input',
    placeholder: '请输入班次名称',
    colon: true,
    attrs: {
      maxLength: 32
    },
    span: 8,
    wrapperCol: { span: 18 }
  }
];
export const rules = {
  waterPlantId: [{ required: true, message: '请选择水厂', trigger: 'change' }],
  name: [{ required: true, message: '请填写班次名称', trigger: 'blur' }],
  startTime: [{ required: true, message: '请选择开始时间', trigger: 'change' }],
  endTime: [{ required: true, message: '请选择结束时间', trigger: 'change' }],
  color: [{ required: true, message: '请选择班次颜色', trigger: 'change' }]
};
export const modelFields = [
  {
    colon: true,
    name: 'waterPlantName',
    label: '污水厂名称',
    type: 'text'
  },
  {
    colon: true,
    name: 'name',
    label: '班次名称',
    type: 'text'
  },
  {
    colon: true,
    name: 'teamId',
    label: '班组',
    type: 'text'
  },
  {
    colon: true,
    name: 'time',
    label: '值班时间段',
    type: 'text'
  },
  {
    colon: true,
    name: 'color',
    label: '班次背景色',
    type: 'text'
  },
  {
    colon: true,
    name: 'remark',
    label: '备注',
    type: 'text'
  }
];

export const columns = [
  {
    title: '班次名称',
    dataIndex: 'name',
    width: 150,
    ellipsis: true
  },
  {
    title: '班组名称',
    dataIndex: 'teamId',
    scopedSlots: { customRender: 'teamId' },
    ellipsis: true,
    width: 150
  },
  {
    title: '值班时间段',
    dataIndex: 'startTime',
    scopedSlots: { customRender: 'startTime' }
  },
  {
    title: '排序',
    dataIndex: 'sort1',
    customRender: (a, b, i) => i + 1
  },
  {
    title: '班次背景色',
    dataIndex: 'color',
    scopedSlots: { customRender: 'color' }
  },
  {
    title: '备注',
    dataIndex: 'remark',
    ellipsis: true
  },
  {
    title: '是否有效',
    dataIndex: 'validFlag',
    type: 'switch',
    scopedSlots: { customRender: 'validFlag' }
  },
  {
    title: '操作',
    width: 120,
    type: 'action',
    events: [
      {
        key: 'infoEdit',
        name: '修改'
      },
      {
        key: 'infoDetail',
        name: '详情'
      }
    ]
  }
];
export const res = {
  count: 4,
  errorCode: null,
  errorMessage: null,
  resultData: [
    {
      color: '#4362FF',
      createTime: 1664265120000,
      createUser: '污水厂管理员',
      delFlag: 0,
      endTime: '08:00:00',
      id: '045e806fac77d7aefda4154e731d78f5',
      name: '夜班',
      remark: null,
      sort: 30,
      startTime: '02:00:00',
      tenantId: 'ca2e0bfc9e351c3d1b6968bc8a0631ed',
      updateTime: 1664265120000,
      updateUser: '污水厂管理员',
      userId: 'e032902cadc93bc74ca8ab34aa60fb23',
      validFlag: 1,
      waterPlantId: '1515879694258409473'
    },
    {
      color: '#FFCC34',
      createTime: 1650356167000,
      createUser: '污水厂管理员',
      delFlag: 0,
      endTime: '11:30:00',
      id: 'f54067eed573763418ef859628d7f96a',
      name: '早班',
      remark: null,
      sort: 27,
      startTime: '08:00:00',
      tenantId: 'ca2e0bfc9e351c3d1b6968bc8a0631ed',
      updateTime: 1650601001000,
      updateUser: '污水厂管理员',
      userId: 'e032902cadc93bc74ca8ab34aa60fb23',
      validFlag: 1,
      waterPlantId: '1515879694258409473'
    },
    {
      color: '#ff8c02',
      createTime: 1650356214000,
      createUser: '污水厂管理员',
      delFlag: 0,
      endTime: '05:30:00',
      id: '701ee7a27bf6b1a29a528c5b5cefd3a9',
      name: '午班',
      remark: null,
      sort: 28,
      startTime: '11:30:00',
      tenantId: 'ca2e0bfc9e351c3d1b6968bc8a0631ed',
      updateTime: 1650601001000,
      updateUser: '污水厂管理员',
      userId: 'e032902cadc93bc74ca8ab34aa60fb23',
      validFlag: 1,
      waterPlantId: '1515879694258409473'
    },
    {
      color: '#9D57FF',
      createTime: 1650356241000,
      createUser: '污水厂管理员',
      delFlag: 0,
      endTime: '22:30:00',
      id: '3745d59df2e4418beb329e0f2a4f03d7',
      name: '晚班',
      remark: null,
      sort: 29,
      startTime: '18:00:00',
      tenantId: 'ca2e0bfc9e351c3d1b6968bc8a0631ed',
      updateTime: 1650601002000,
      updateUser: '污水厂管理员',
      userId: 'e032902cadc93bc74ca8ab34aa60fb23',
      validFlag: 1,
      waterPlantId: '1515879694258409473'
    }
  ],
  status: 'complete',
  success: true
};
