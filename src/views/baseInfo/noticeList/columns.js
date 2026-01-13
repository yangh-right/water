/**
 * @DATE:  2021-04-21 08:53
 * @Version: 0.0.1
 * @Author: yunchangJia
 * @Description:
 * @Update: 更新内容 by yunchangJia 2021-04-21 08:53
 */
const notice0 = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    customRender: (text, row, index) => {
      return index + 1;
    },
  },
  {
    title: '标题',
    dataIndex: 'cusTitle',
    // key: 'title',
    ellipsis: true,
    scopedSlots: { customRender: 'cusTitle' },
  },
  {
    title: '类型',
    dataIndex: 'noticeType',
    key: 'noticeType',
    ellipsis: true,
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    key: 'createBy',
    ellipsis: true,
  },
  {
    title: '发布时间',
    dataIndex: 'publishDate',
    // key: 'publishDate',
    ellipsis: true,
    customRender: (text, row, index) => {
      return text ? text : '--';
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  }
];
const notice1 = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    customRender: (text, row, index) => {
      return index + 1;
    },
  },
  {
    title: '标题',
    dataIndex: 'cusTitle',
    // key: 'title',
    ellipsis: true,
    scopedSlots: { customRender: 'cusTitle' },
  },
  {
    title: '类型',
    dataIndex: 'noticeType',
    key: 'noticeType',
    ellipsis: true,
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    key: 'createBy',
    ellipsis: true,
  },
  {
    title: '发布时间',
    dataIndex: 'publishDate',
    // key: 'publishDate',
    ellipsis: true,
    customRender: (text, row, index) => {
      return text ? text : '--';
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  }
];
const notice2 = [
  {
    title: '序号',
    dataIndex: 'num',
    key: 'num',
    customRender: (text, row, index) => {
      return index + 1;
    },
  },
  {
    title: '标题',
    dataIndex: 'cusTitle',
    // key: 'title',
    ellipsis: true,
    scopedSlots: { customRender: 'cusTitle' },
  },
  {
    title: '类型',
    dataIndex: 'noticeType',
    key: 'noticeType',
    ellipsis: true,
  },
  {
    title: '创建人',
    dataIndex: 'createBy',
    key: 'createBy',
    ellipsis: true,
  },
  {
    title: '创建时间',
    dataIndex: 'createDate',
    // key: 'publishDate',
    ellipsis: true,
    customRender: (text, row, index) => {
      return text ? text : '--';
    },
  },
  {
    title: '操作',
    dataIndex: 'action',
    scopedSlots: { customRender: 'action' },
  }
];
export default { notice0, notice1, notice2 };
