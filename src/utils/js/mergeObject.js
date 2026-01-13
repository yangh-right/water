/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2022-02-24 14:52:31
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2022-06-29 22:15:56
 * @Description: 
 */
// 合并两个复杂对象（不是直接覆盖对应key值）
export function mergeObject(def, obj) {
    if (!obj) {
        return def;
    } else if (!def) {
        return obj;
    }

    for (var i in obj) {
        // if its an object
        if (obj[i] !== null && obj[i].constructor === Object) {
            def[i] = mergeObject(def[i], obj[i]);
        } else if (obj[i] !== null && (obj[i] instanceof Array) && obj[i].length > 0) {
            // if its an array, simple values need to be joined.  Object values need to be re-merged.
            // test to see if the first element is an object or not so we know the type of array we're dealing with.
            if (obj[i][0].constructor === Object) {
                var newobjs = [];
                // create an index of all the existing object IDs for quick access.  There is no way to know how many items will be in the arrays.
                var objids = {};
                for (let x = 0, l = def[i].length; x < l; x++) {
                    objids[def[i][x].id] = x;
                }

                // now walk through the objects in the new array
                // if the ID exists, then merge the objects.
                // if the ID does not exist, push to the end of the def array
                for (let x = 0, l = obj[i].length; x < l; x++) {
                    var newobj = obj[i][x];
                    if (objids[newobj.id] !== undefined) {
                        def[i][x] = mergeObject(def[i][x], newobj);
                    } else {
                        newobjs.push(newobj);
                    }
                }

                for (var x = 0, l = newobjs.length; x < l; x++) {
                    def[i].push(newobjs[x]);
                }
            } else {
                for (let x = 0; x < obj[i].length; x++) {
                    var idxObj = obj[i][x];
                    if (def[i].indexOf(idxObj) === -1) {
                        def[i].push(idxObj);
                    }
                }
            }
        } else {
            def[i] = obj[i];
        }
    }
    return def;
}
