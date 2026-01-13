/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-06-01 08:47:52
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-16 15:21:21
 * @Description: 
 */
export const getTable = function (ref = []) {
    let [{ children } = { children: [] }] = ref;
    let columnsLen = 0;
    function getColumns(columns = []) {
        return columns.map(column => {
            let { title, key, children } = column;
            if (children && children.length > 0) {
                return {
                    title,
                    children: getColumns(children)
                }
            } else {
                columnsLen++;
                return {
                    title,
                    key,
                    dataIndex: key
                }
            }
        })
    }

    function generateRow(row, target) {
        for (let { key, value, children } of row) {
            if (children instanceof Array) {
                generateRow(children, target)
            } else {
                target[key] = key ? value : undefined
            }
        }
        return target;
    }
    function getRows(refData) {
        return refData.map(row => {
            let { time, name, children = [], timeColspan } = row;
            return { time, name, ...generateRow(children, { timeColspan }) }
        })
    }
    let rows = getRows(ref);
    let columns = rows.length > 0 ? [
        {
                title: '序号',
                dataIndex: 'num',
                key: 'num',
                width:100,
                customRender: (text, row, index) => {
                    return index + 1;
                },
        },
        {
            title: '时间',
            dataIndex: 'time',
            key: 'time',
            width:140
        },
        ...getColumns(children)
    ] : [];
    return Object.freeze({
        rows: getRows(ref),
        columns,
        columnsLen
    })
}