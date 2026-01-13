import searchTree from './searchTree';

/* istanbul ignore next */
searchTree.install = function(Vue) {
  Vue.component(searchTree.name, Tree);
};

export default searchTree;
