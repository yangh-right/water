/*
 * @Author: yuan wenyu
 * @Version: 1.0.1
 * @Date: 2023-03-23 16:29:59
 * @LastEditors: yuan wenyu
 * @LastEditTime: 2023-04-23 09:47:57
 * @Description:
 */
import Vue from 'vue';
import cloneDeep from 'lodash.clonedeep';
let tree =`{
    "args": [],
    "count": 0,
    "errorCode": null,
    "errorMessage": null,
    "resultData": [
        {
            "checkable": null,
            "children": [],
            "data": null,
            "id": "aa55d6e3aea7ce1e4c8b29ae5fc65527",
            "label": "5",
            "name": "11",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [],
            "data": null,
            "id": "f56ace1d5f27e7e0a52bf1567cebc633",
            "label": "0",
            "name": "22",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [
                {
                    "checkable": null,
                    "children": [],
                    "data": null,
                    "id": "43cb457e8a8e3875615d21d9f3996543",
                    "label": "0",
                    "name": "2222",
                    "online": null,
                    "orderIndex": 0,
                    "parentId": "5718cc2a0754fb06c727dd3c9b22f92b",
                    "scopedSlots": null,
                    "shorthand": null
                }
            ],
            "data": null,
            "id": "5718cc2a0754fb06c727dd3c9b22f92b",
            "label": "10",
            "name": "44",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [],
            "data": null,
            "id": "bebd8a99ca639f726eb8736aeacb951f",
            "label": "3",
            "name": "55",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [
                {
                    "checkable": null,
                    "children": [],
                    "data": null,
                    "id": "6861dc1b87179be970d13004b75a7d0b",
                    "label": "0",
                    "name": "g节点D",
                    "online": null,
                    "orderIndex": 0,
                    "parentId": "20db71d5c58bd3d0c39cb09ee646e695",
                    "scopedSlots": null,
                    "shorthand": null
                },
                {
                    "checkable": null,
                    "children": [
                        {
                            "checkable": null,
                            "children": [],
                            "data": null,
                            "id": "827c44f71affdf4cdc0e5ff3ef28972f",
                            "label": "0",
                            "name": "Nintendo Switch",
                            "online": null,
                            "orderIndex": 0,
                            "parentId": "96251585e172dcf990ac253f2731448d",
                            "scopedSlots": null,
                            "shorthand": null
                        },
                        {
                            "checkable": null,
                            "children": [],
                            "data": null,
                            "id": "6521f4e3aca31ec2a4559b8a4ed17ddf",
                            "label": "3",
                            "name": "g节点C",
                            "online": null,
                            "orderIndex": 0,
                            "parentId": "96251585e172dcf990ac253f2731448d",
                            "scopedSlots": null,
                            "shorthand": null
                        }
                    ],
                    "data": null,
                    "id": "96251585e172dcf990ac253f2731448d",
                    "label": "3",
                    "name": "g节点B",
                    "online": null,
                    "orderIndex": 0,
                    "parentId": "20db71d5c58bd3d0c39cb09ee646e695",
                    "scopedSlots": null,
                    "shorthand": null
                }
            ],
            "data": null,
            "id": "20db71d5c58bd3d0c39cb09ee646e695",
            "label": "3",
            "name": "g节",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [],
            "data": null,
            "id": "c9a08a6ef3b12d21771616da29954f91",
            "label": "5",
            "name": "test",
            "online": null,
            "orderIndex": 0,
            "parentId": "43362530d4212cec6397e9b936a50afb",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [],
            "data": null,
            "id": "a073ece2b0ed8766f476433402495309",
            "label": "0",
            "name": "保养",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [
                {
                    "checkable": null,
                    "children": [],
                    "data": null,
                    "id": "dfa2d35ed2896a65e8e46906cf1007d2",
                    "label": "1",
                    "name": "11",
                    "online": null,
                    "orderIndex": 0,
                    "parentId": "132a91e638f7e7e4f67c5e187e28c304",
                    "scopedSlots": null,
                    "shorthand": null
                }
            ],
            "data": null,
            "id": "132a91e638f7e7e4f67c5e187e28c304",
            "label": "6",
            "name": "维修",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [],
            "data": null,
            "id": "d9ed7aa0eed7b6842f6aa86ea0f423e1",
            "label": "0",
            "name": "羡慕",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        },
        {
            "checkable": null,
            "children": [],
            "data": null,
            "id": "ec3c93abc8a062c0c09be5966979d892",
            "label": "3",
            "name": "超长的分类名称超长的分类名称超长的分类名称超长的分类名称超长的分类名称超长的分类名称超",
            "online": null,
            "orderIndex": 0,
            "parentId": "0",
            "scopedSlots": null,
            "shorthand": null
        }
    ],
    "status": "complete",
    "success": true
}`
let list = `{
    "args": [],
    "count": 0,
    "errorCode": null,
    "errorMessage": null,
    "resultData": {
        "countId": null,
        "current": 1,
        "hitCount": false,
        "maxLimit": null,
        "optimizeCountSql": true,
        "orders": [
            {
                "asc": false,
                "column": "pv"
            }
        ],
        "pages": 4,
        "records": [
            {
                "allVisibleFlag": "0",
                "bookId": "c9a08a6ef3b12d21771616da29954f91",
                "collectNum": 1,
                "collectStatus": "1",
                "createBy": "001",
                "createTime": "2022-11-14 13:21:03",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.1",
                "groupIds": [],
                "groupNames": [],
                "id": "3920359c5566079adfdb469f2ff8b688",
                "knowledgeTag": [
                    "wx"
                ],
                "likeNum": 0,
                "likeStatus": "0",
                "logList": [],
                "pageContent": "<p>万恒</p>",
                "pageIcon": null,
                "pagePy": "WZ",
                "pageTitle": "完整",
                "pv": 226,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2022-11-23 17:19:11",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2023-04-21 09:47:20"
            },
            {
                "allVisibleFlag": "1",
                "bookId": "5718cc2a0754fb06c727dd3c9b22f92b",
                "collectNum": 0,
                "collectStatus": "0",
                "createBy": "001",
                "createTime": "2023-02-01 14:06:54",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.4",
                "groupIds": [],
                "groupNames": [],
                "id": "580fefe6e1fbf59fa18c26f28549ae3a",
                "knowledgeTag": [
                    "wx",
                    "by"
                ],
                "likeNum": 1,
                "likeStatus": "1",
                "logList": [],
                "pageContent": "<p>hhhh</p>",
                "pageIcon": null,
                "pagePy": "122",
                "pageTitle": "122",
                "pv": 218,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2023-03-27 17:23:25",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2023-03-27 17:37:15"
            },
            {
                "allVisibleFlag": "1",
                "bookId": "7c888043c85e9e2f647dd19eaaf26467",
                "collectNum": 1,
                "collectStatus": "1",
                "createBy": "001",
                "createTime": "2022-11-14 14:58:57",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.1",
                "groupIds": [],
                "groupNames": [],
                "id": "06326ef6bc6ff7577374e14d12ebb284",
                "knowledgeTag": [
                    "by"
                ],
                "likeNum": 1,
                "likeStatus": "1",
                "logList": [],
                "pageContent": null,
                "pageIcon": null,
                "pagePy": "1212",
                "pageTitle": "1212",
                "pv": 151,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2022-11-15 16:53:51",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2022-11-25 11:05:39"
            },
            {
                "allVisibleFlag": "1",
                "bookId": "dfa2d35ed2896a65e8e46906cf1007d2",
                "collectNum": 1,
                "collectStatus": "1",
                "createBy": "001",
                "createTime": "2022-11-25 16:20:40",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.1",
                "groupIds": [],
                "groupNames": [],
                "id": "21fd89fae3f2ca0b36b5e62f4858b658",
                "knowledgeTag": [
                    "wx",
                    "by",
                    "xj",
                    "sb"
                ],
                "likeNum": 1,
                "likeStatus": "1",
                "logList": [],
                "pageContent": "<p>会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加会加速卡点查看速度加</p>",
                "pageIcon": null,
                "pagePy": "ZZZ",
                "pageTitle": "早早早",
                "pv": 147,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2022-11-26 13:29:57",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2023-02-01 14:00:46"
            },
            {
                "allVisibleFlag": "1",
                "bookId": "6521f4e3aca31ec2a4559b8a4ed17ddf",
                "collectNum": 0,
                "collectStatus": "0",
                "createBy": "001",
                "createTime": "2023-02-21 17:20:42",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.2",
                "groupIds": [],
                "groupNames": [],
                "id": "de5cfb98c3cba0de736f2b3dabd2827a",
                "knowledgeTag": [
                    "xj"
                ],
                "likeNum": 0,
                "likeStatus": "0",
                "logList": [],
                "pageIcon": null,
                "pagePy": "1111111111",
                "pageTitle": "1111111111",
                "pv": 125,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2023-02-26 16:42:26",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2023-04-07 17:11:10"
            },
            {
                "allVisibleFlag": "0",
                "bookId": "5718cc2a0754fb06c727dd3c9b22f92b",
                "collectNum": 0,
                "collectStatus": "0",
                "createBy": "001",
                "createTime": "2022-11-26 14:36:49",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.2",
                "groupIds": [],
                "groupNames": [],
                "id": "cadc096befc3180d1d93bd4f22e3cd48",
                "knowledgeTag": [
                    "wx"
                ],
                "likeNum": 0,
                "likeStatus": "0",
                "logList": [],
                "pageContent": "<p>111111</p>",
                "pageIcon": null,
                "pagePy": "111",
                "pageTitle": "111",
                "pv": 86,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2022-11-26 14:40:14",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2022-12-02 16:34:42"
            },
            {
                "allVisibleFlag": "0",
                "bookId": "5718cc2a0754fb06c727dd3c9b22f92b",
                "collectNum": 0,
                "collectStatus": "0",
                "createBy": "001",
                "createTime": "2022-11-26 18:39:13",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.7",
                "groupIds": [],
                "groupNames": [],
                "id": "b4e9f5263e11f2856130db442e848f34",
                "knowledgeTag": [
                    "xj",
                    "sb"
                ],
                "likeNum": 1,
                "likeStatus": "1",
                "logList": [],
                "pageContent": null,
                "pageIcon": null,
                "pagePy": "111",
                "pageTitle": "111",
                "pv": 84,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2022-11-29 15:24:03",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2022-11-30 15:42:17"
            },
            {
                "allVisibleFlag": "0",
                "bookId": "c9a08a6ef3b12d21771616da29954f91",
                "collectNum": 0,
                "collectStatus": "0",
                "createBy": "001",
                "createTime": "2022-11-23 14:18:47",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.0",
                "files": null,
                "groupIds": [],
                "groupNames": [],
                "id": "0192ec9e0727d6dccece40b33a553a5f",
                "knowledgeTag": [
                    "by",
                    "sb"
                ],
                "likeNum": 1,
                "likeStatus": "1",
                "logList": [],
                "pageContent": "<p>12</p>",
                "pageIcon": null,
                "pagePy": "1212",
                "pageTitle": "1212",
                "pv": 81,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2022-11-23 14:18:47",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2022-11-26 13:17:30"
            },
            {
                "allVisibleFlag": "0",
                "bookId": "132a91e638f7e7e4f67c5e187e28c304",
                "collectNum": 1,
                "collectStatus": "1",
                "createBy": "001",
                "createTime": "2022-11-12 14:46:53",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.1",
                "files": null,
                "groupIds": [],
                "groupNames": [],
                "id": "e4a1f4f07408394e47881042ec5befb3",
                "knowledgeTag": [
                    "by"
                ],
                "likeNum": 1,
                "likeStatus": "1",
                "logList": [],
                "pageIcon": null,
                "pagePy": "WZBT",
                "pageTitle": "文章标题",
                "pv": 66,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2022-11-24 15:45:07",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2022-11-30 15:45:36"
            },
            {
                "allVisibleFlag": "0",
                "bookId": "c9a08a6ef3b12d21771616da29954f91",
                "collectNum": 1,
                "collectStatus": "1",
                "createBy": "001",
                "createTime": "2022-11-23 18:42:50",
                "createUserName": "Admin(管理员)",
                "currentVersion": "v1.1",
                "groupIds": [],
                "groupNames": [],
                "id": "03a451605dbbe3ba5f4d7bbd6b19f247",
                "knowledgeTag": [
                    "xj",
                    "by"
                ],
                "likeNum": 1,
                "likeStatus": "1",
                "logList": [],
                "pageContent": "<p>212122112212</p>",
                "pageIcon": null,
                "pagePy": "SDSD",
                "pageTitle": "撒大声地",
                "pv": 43,
                "releaseFlag": "1",
                "tenantId": "001",
                "updateBy": "001",
                "updateTime": "2023-03-27 17:24:58",
                "updateUserName": "Admin(管理员)",
                "viewTime": "2023-03-27 17:25:22"
            }
        ],
        "searchCount": true,
        "size": 10,
        "total": 40
    },
    "status": "complete",
    "success": true
}`
let detail =`{
    "args": [],
    "count": 0,
    "errorCode": null,
    "errorMessage": null,
    "resultData": {
        "allVisibleFlag": "1",
        "bookId": "aa55d6e3aea7ce1e4c8b29ae5fc65527",
        "collectNum": 1,
        "collectStatus": "1",
        "createBy": "001",
        "createTime": "2023-04-18 18:08:24",
        "createUserName": "Admin(管理员)",
        "currentVersion": "v1.0",
        "files": null,
        "groupIds": [],
        "groupNames": [],
        "id": "a15f67e75b2b0419ace6f17b6a596eeb",
        "knowledgeTag": [],
        "likeNum": 1,
        "likeStatus": "1",
        "logList": [],
        "pageContent": null,
        "pageIcon": null,
        "pagePy": "ZSDYGWZ",
        "pageTitle": "这是第一个文章",
        "pv": 5,
        "releaseFlag": "1",
        "tenantId": "001",
        "updateBy": "001",
        "updateTime": "2023-04-18 18:08:24",
        "updateUserName": "Admin(管理员)",
        "viewTime": "2023-04-23 09:39:56"
    },
    "status": "complete",
    "success": true
}`
const data = {

  list: {
    isFull: true,
    data: list
  },

  detail: {
    isFull: true,
    data: detail
  },
  tree: {
    isFull: true,
    data: tree
  },

//   cbd: {
//     isFull: true,
//     data: cbd
//   },
  // //报告上传日
  // bgsc: {
  //   data: {
  //     reportNo: 'd1',
  //     hasReport: true,
  //     reportDate: moment(new Date()).format('YYYY-MM-DD HH:mm:ss'),
  //     testItems: JSON.parse(bgscD)
  //   }
  // }
};
Vue.prototype.getMock = (name, param) => {
  let res = {

    resultData: {},
    status: 'complete'
  };
  if (data[name].isFull) {
    res = JSON.parse(data[name].data);
  } else {
    res = {
      resultData:
        typeof data[name].data === 'object' ? data[name].data : JSON.parse(data[name].data),
      status: 'complete'
    };
  }
  res.param = param
  console.log('res', cloneDeep(res));

  return res;
};
