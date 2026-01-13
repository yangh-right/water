/* 
  化验相关配置的混入
  1.表格的loading和分页操作
  2.节流warning
*/

export default {
  data() {
    return {
      loading: false
    };
  },
  methods: {
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
