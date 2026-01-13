/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2024-02-10 10:00:14
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2024-02-10 10:18:12
 * @Description: 
 */
let szUserAgent = navigator.userAgent.toLowerCase();
if(szUserAgent.includes('chrome')){
  let aScript = [];
  const publicPath = window.__INJECTED_PUBLIC_PATH_BY_QIANKUN__ || ''
  aScript = publicPath ? `${publicPath}js/hkH5/h5player.min.js` : "./js/hkH5/h5player.min.js"
  let head = document.getElementsByTagName("head").item(0);
  let oScript = null;
  oScript = document.createElement("script");
  oScript.type = "text/javascript";
  oScript.src = aScript;
  head.appendChild(oScript);
}
