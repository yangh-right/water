/* 
  1.搜索头部布局
  2.表格loading
  3.表格分页
*/

export default {
  data() {
    return {
      headerLayout: {
        span: 6,
        colon: true,
        labelAuto: true,
        wrapperCol: { span: 18 }
      },
      extraLayout: {
        span: 8,
        colon: true,
        labelAuto: true,
        wrapperCol: { span: 17 }
      },
      loading: false
    };
  },
  methods: {
    async handleSearch() {
      this.searchForm.currentPage = 1;
      await this.getList();
    },
    async handlePageChange(cur, size) {
      this.searchForm.currentPage = cur;
      this.searchForm.pageSize = size;
      await this.getList();
    },
    async resetPageChange() {
      this.searchForm.currentPage = 1;
      this.searchForm.pageSize = 20;
      await this.getList();
    }
  }
};
