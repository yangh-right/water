import Vue from "vue";

import Driver from 'driver.js';
import 'driver.js/dist/driver.min.css';
const driver = new Driver({
  animate: false,
  nextBtnText: '下一步',
  prevBtnText: '上一步',
  closeBtnText: '退出引导',
  doneBtnText: '结束',
  onHighlightStarted: (Element) => {
    const node = Element.getNode()
    const menu = document.querySelector('#globalMenuList')
    if (node instanceof HTMLElement) {
      if (node.getAttribute('id') == 'diagnosis') {
        if (menu instanceof HTMLElement) {
          menu.style.display = 'block'
        }
      }
    }
  },
  onNext: (Element) => {
    const node = Element.getNode()
    const map = document.querySelector('.map-wrapper')
    const menu = document.querySelector('#globalMenuList')
    if (node instanceof HTMLElement) {
      if (node.getAttribute('id') == 'diagnosis') {
        if (map instanceof HTMLElement) {
          map.style['z-index'] = -1
        }
      } else if (node.getAttribute('id') == 'globalMenuList') {
        if (map instanceof HTMLElement) {
          map.style['z-index'] = 1
        }
        if (menu instanceof HTMLElement) {
          menu.style.display = 'none'
        }
      }
    }
  },
})
Vue.prototype.$Driver = driver
