/*
 * @Description: 表单字段过滤值格式
 * @Author: huhaiou
 * @Date: 2022-04-08 11:36:42
 * @LastEditTime: 2022-08-29 16:33:11
 * @LastEditors: yuan wenyu
 */


export const scrollLoad = {
  bind(el, binding) {
    const scrollWrap = el.querySelector('.wpg-table-body');
    scrollWrap.addEventListener('scroll', function() {
      let minDistance = 0;
      const scrollDistance = this.scrollHeight - this.scrollTop - this.clientHeight;
      if (scrollDistance <= minDistance) {
        binding.value();
      }
    })
  }
}
