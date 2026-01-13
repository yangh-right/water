/*
 * @Description:
 * @Author: JianYue
 * @Date: 2024-04-25 10:42:18
 * @LastEditTime: 2024-08-21 10:15:01
 * @LastEditors: wangyr
 */
export const columns = [
  {
    title: '姓名',
    dataIndex: 'name',
    ellipsis: true
  },
  {
    title: '账户',
    dataIndex: 'account',
    ellipsis: true
  },
  // {
  //   title: '岗位',
  //   dataIndex: 'role',
  //   ellipsis: true
  // },
  {
    title: '污水厂名称',
    dataIndex: 'waterPlantId',
    scopedSlots: { customRender: 'waterPlantId' },
    ellipsis: true
  },
  {
    title: '上传资质文件数量',
    dataIndex: 'pictureTotal',
    ellipsis: true
  },
  {
    title: '操作',
    fixed: 'right',
    width: 200,
    type: 'action',
    dataIndex: 'action',
    align: 'center'
  }
];
