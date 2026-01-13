/*
 * @Description: promis 代替try catch 异常捕获
 * @Author: zhangtianwen
 * @LastEditTime: 2021-01-07 11:35:38
 */
export default function (promise) {
    if (!promise || ! (promise instanceof Promise)) {
        return new Promise((resolve, reject) => {
            reject(new Error("requires promises as the param"));
        }).catch((err) => {
            return [err, undefined];
        });
    }
    return promise.then(function () {
        return [undefined, ...arguments];
    }).catch(err => {
        return [err, undefined];
    });

}