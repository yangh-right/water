/**
 * 页面结构存在 table 时使用
 *
 * 1. 统一 pageSize 为 20
 * 2. 提取公共行为
 * 3. handlePageReset 方法重置pageSize
 */

export default {
  data() {
    return {
      searchForm: {}, // searchForm 传入的model值
      page: {
        // 传入给 table 作为分页, 方便后续进行pageSize的确定
        ...defaultPage
      },
      searchLoading: false, // 查询按钮 loading
      cancelLoading: false, // 重置按钮 loading
      tableList: [], // 表格数据
      tableLoading: false //  表格 loading
    };
  },
  methods: {
    /**
     * 大多数情况下, 分页切换仅仅附带数据查询
     *
     * 若存在特殊情况, 在业务组件内重新此方法即可
     *
     */
    handlePageChange(currentPage, pageSize) {
      this.page.currentPage = currentPage;
      this.page.pageSize = pageSize;
      this.getList && this.getList(); // 查询列表数据
    },
    handlePageReset() {
      this.page = {
        ...defaultPage,
        total: this.page.total
      };
    },
    async handleSearch() {
      this.searchLoading = true;
      await this.getList();
      this.searchLoading = false;
    },
    getList() {
      throw new Error('getList 方法必须被实现');
    }
  }
};

export const defaultPage = {
  currentPage: 1,
  pageSize: 20,
  total: 0
};
