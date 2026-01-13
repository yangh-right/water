/*
 * @Description:
 * @version:
 * @Author: liuct
 * @Date: 2021-12-17 16:42:47
 * @LastEditors: liuct
 * @LastEditTime: 2021-12-20 09:57:14
 */

function crossMul(v1, v2) {
  return v1.x * v2.y - v1.y * v2.x;
}
export function lineline(p1, p2, p3, p4) {
  var v1 = { x: p1.x - p3.x, y: p1.y - p3.y },
    v2 = { x: p2.x - p3.x, y: p2.y - p3.y },
    v3 = { x: p4.x - p3.x, y: p4.y - p3.y },
    v = crossMul(v1, v3) * crossMul(v2, v3);
  v1 = { x: p3.x - p1.x, y: p3.y - p1.y };
  v2 = { x: p4.x - p1.x, y: p4.y - p1.y };
  v3 = { x: p2.x - p1.x, y: p2.y - p1.y };
  return v <= 0 && crossMul(v1, v3) * crossMul(v2, v3) <= 0 ? true : false;
}

function checkIfInReact(react, point) {
  if (
    react.x <= point.x &&
    point.x <= react.x + react.width &&
    react.y <= point.y &&
    point.y <= react.y + react.height
  ) {
    return true;
  }
  return false;
}
export function lineReact(react, line) {
  // 先判断线段两个端点是否至少有一个点在矩形中，若有则相交
  if (
    checkIfInReact(react, { x: line.x1, y: line.y1 }) ||
    checkIfInReact(react, { x: line.x2, y: line.y2 })
  ) {
    return true;
  }
  const rp1 = { x: react.x, y: react.y };
  const rp2 = { x: react.x, y: react.y + react.height };
  const rp3 = { x: react.x + react.width, y: react.y + react.height };
  const rp4 = { x: react.x + react.width, y: react.y };
  const lp1 = { x: line.x1, y: line.y1 };
  const lp2 = { x: line.x2, y: line.y2 };
  if (lineline(rp1, rp3, lp1, lp2) && lineline(rp2, rp4, lp1, lp2)) {
    return true;
  }
  return false;
}
