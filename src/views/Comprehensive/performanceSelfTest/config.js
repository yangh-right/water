export const columns = [
  {
    title: '设备名称',
    dataIndex: 'equipmentName',
    key: 'equipmentName',
    ellipsis: true
  },
  {
    title: '设备型号',
    dataIndex: 'model',
    key: 'model',
    ellipsis: true,
    width: 200
  },
  {
    title: '运行时长',
    dataIndex: 'runTime',
    children: [
      {
        title: '1#',
        dataIndex: 'runTime1',
        key: 'runTime1'
      },
      {
        title: '2#',
        dataIndex: 'runTime2',
        key: 'runTime2'
      },
      {
        title: '3#',
        dataIndex: 'runTime3',
        key: 'runTime3'
      },
      {
        title: '4#',
        dataIndex: 'runTime4',
        key: 'runTime4'
      },
      {
        title: '5#',
        dataIndex: 'runTime5',
        key: 'runTime5'
      },
      {
        title: '6#',
        dataIndex: 'runTime6',
        key: 'runTime6'
      }
    ]
  },
  {
    title: '电流',
    dataIndex: 'electriccurrent',
    children: [
      {
        title: '1#',
        dataIndex: 'electric1',
        key: 'electric'
      },
      {
        title: '2#',
        dataIndex: 'electric2',
        key: 'electric2'
      },
      {
        title: '3#',
        dataIndex: 'electric3',
        key: 'electric3'
      },
      {
        title: '4#',
        dataIndex: 'electric4',
        key: 'electric4'
      },
      {
        title: '5#',
        dataIndex: 'electric5',
        key: 'electric5'
      },
      {
        title: '6#',
        dataIndex: 'electric6',
        key: 'electric6'
      }
    ]
  }
];
