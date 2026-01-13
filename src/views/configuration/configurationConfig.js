export const actions = [
  {
    name: '保存为组件',
    action: 'saveComponent'
  },
  {
    name: '复制',
    action: 'copy',
    isMultiple: true
  },
  {
    name: '上移',
    action: 'pre'
  },
  {
    name: '下移',
    action: 'next'
  },
  {
    name: '置顶',
    action: 'top'
  },
  {
    name: '置底',
    action: 'bottom'
  },
  {
    name: '删除',
    action: 'delete',
    isMultiple: true
  },
  {
    name: '框选',
    action: 'select',
    isMultiple: true
  }
  // {
  //   name: '画线',
  //   action: 'draw'
  // }
];

export const zooms = [
  {
    value: '1.2',
    label: '放大20%'
  },
  {
    value: '1.1',
    label: '放大10%'
  },
  {
    value: '1',
    label: '正常'
  },
  {
    value: '0.9',
    label: '缩小10%'
  },
  {
    value: '0.8',
    label: '缩小20%'
  },
  {
    value: '0.7',
    label: '缩小30%'
  },
  {
    value: '0.6',
    label: '缩小40%'
  },
  {
    value: '0.5',
    label: '缩小50%'
  },
  {
    value: '0.4',
    label: '缩小60%'
  }
];

export const columns = [
  {
    title: '序号',
    key: 'num',
    width: 80,
    align: 'center',
    customRender: (text, row, index) => {
      return index + 1;
    }
  },
  {
    title: '名称',
    dataIndex: 'svgName',
    key: 'svgName',
    width: 180,
    scopedSlots: { customRender: 'svgName' }
  },
  {
    title: '组态类型',
    dataIndex: 'svgType',
    key: 'svgType',
    width: 120,
    scopedSlots: { customRender: 'svgType' }
  },
  {
    title: '排序',
    dataIndex: 'sort',
    width: 120,
    key: 'sort'
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    key: 'createDate',
    width: 220
  },
  {
    title: '修改时间',
    dataIndex: 'updateDate',
    key: 'updateDate',
    width: 220
  },
  {
    title: '操作',
    dataIndex: 'operation',
    width: 145,
    fixed: 'right',
    scopedSlots: { customRender: 'operation' }
  }
];

export const elements = [
  {
    label: '图片',
    action: 'image'
  },
  {
    label: '监测量',
    action: 'point'
  },
  {
    label: '文本',
    action: 'text'
  },
  {
    label: '1级报警',
    action: 'alarm1'
  },
  {
    label: '2级报警',
    action: 'alarm2'
  },
  {
    label: '3级报警',
    action: 'alarm3'
  },
  {
    label: '4级报警',
    action: 'alarm4'
  },
  {
    label: '矩型',
    action: 'rect'
  },
  {
    label: '线条',
    action: 'line'
  },
  {
    label: '圆圈',
    action: 'circle'
  },
  {
    label: '三角',
    action: 'triangle'
  }
];

export const components = [
  {
    label: '泵房环境',
    action: 'icon-ic_algae'
  },
  {
    label: '水泵与电机',
    action: 'icon-ic_conduit'
  },
  {
    label: '管路系统',
    action: 'icon-ic_pipe_network'
  },
  {
    label: '电气控制',
    action: 'icon-ic_description'
  },
  {
    label: '水箱',
    action: 'icon-wpg_pool'
  }
];

export const SVG_TYPE = 'SVG_TYPE';
