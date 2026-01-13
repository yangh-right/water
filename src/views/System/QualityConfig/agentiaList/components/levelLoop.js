/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-06-10 09:10:58
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-30 15:50:10
 * @Description: 
 */
export default {
    // 数据循环
    levelLoop: function(arr) {
        const returnArr = []; // 返回的数组
        let levelArr = []; // 当前层级的数组
        let lastLevelArr = []; // 上一层数组
        let idLevleArr = []; // 当前层级id的数组
        let lastIdLevleArr = []; // 上一层级id的数组
        let indexLevelArr = []; // 当前层级索引的数组
        return curLoop(arr);
        function curLoop(curArr) {
            curArr.forEach((curItem, curIndex) => {
                if (curItem.parentId === '0') {
                    // 最外层
                    returnArr.push(curItem);
                    levelArr.push(curItem);
                    idLevleArr.push(curItem.id);
                    indexLevelArr.unshift(curIndex); // 添加到最前面，遍历删除元素时从后面开始删除，不会影响index的位置
                } else {
                    let lastIndex = -1
                    if (lastIdLevleArr.length) {
                        lastIndex = lastIdLevleArr.indexOf(curItem.parentId);
                    }
                    if (lastIndex > -1) {
                        // 属于上一层级的子级
                        // 如果上一层级没有child则添加该属性，此时添加是保证有子元素指向上一层级才添加child
                        if (!lastLevelArr[lastIndex].children) {
                            lastLevelArr[lastIndex].children = [];
                        }
                        levelArr.push(curItem);
                        lastLevelArr[lastIndex].children.push(curItem);
                        idLevleArr.push(curItem.id);
                        indexLevelArr.unshift(curIndex);
                    }
                }
            });
            lastLevelArr = levelArr;
            levelArr = [];
            lastIdLevleArr = idLevleArr;
            idLevleArr = [];
            indexLevelArr.forEach(index => {
                curArr.splice(index, 1); // 删除当前层级的元素，使总数量不断减少
            });
            indexLevelArr = [];
            if (curArr.length) {
                return curLoop(curArr);
            } else {
                return returnArr;
            }
        }
    }
}
