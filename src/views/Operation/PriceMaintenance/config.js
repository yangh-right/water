export const infoColumns = [
  {
    title: '名称',
    dataIndex: 'name',
    width: 200
  },
  {
    title: '单价(元)',
    dataIndex: 'price',
    width: 200,
    slots: { customRender: 'price' }
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 200
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    width: 200
  }
];

export const recordColumns = [
  {
    title: '流量单价(元)',
    dataIndex: 'flowUnitPrice',
    width: 120
  },
  {
    title: '电量单价(元)',
    dataIndex: 'powerUnitPrice',
    width: 120
  },
  {
    title: '药量单价(元)',
    dataIndex: 'dosageUnitPrice',
    width: 120
  },
  {
    title: 'PAC单价(元)',
    dataIndex: 'pacUnitPrice',
    width: 120
  },
  {
    title: '污泥单价(元)',
    dataIndex: 'sludgeUnitPrice',
    width: 120
  },
  {
    title: '乙酸钠单价(元)',
    dataIndex: 'sodiumAcetateUnitPrice',
    width: 120
  },
  {
    title: '次氯酸钠单价(元)',
    dataIndex: 'sodiumHypochloriteUnitPrice',
    width: 120
  },
  // {
  //   title: '更新时间',
  //   dataIndex: 'updateTime',
  //   width: 120
  // },
  // {
  //   title: '更新人',
  //   dataIndex: 'updateBy',
  //   width: 120
  // },
  {
    title: '版本号',
    dataIndex: 'version',
    width: 120
  }
];
