/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-08-11 09:53:13
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-08-11 10:26:34
 * @Description: 
 */
import SearchTable from './SearchTable.vue';

SearchTable.install = function(app) {
  app.component(SearchTable.name, SearchTable);
};

export default SearchTable;
