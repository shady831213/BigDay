// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({
  env: process.env.ENVID
})

// 云函数入口函数
exports.main = async(event, context) => {
  try {
    const db = cloud.database();
    const MAX_LIMIT = 20
    const {
      OPENID
    } = cloud.getWXContext();
    const countResult = await db.collection('messages').where({
      touser: OPENID,
    }).count()
    const total = countResult.total
    const batchTimes = Math.ceil(total / MAX_LIMIT)
    const tasks = []
    for (let i = 0; i < batchTimes; i++) {
      const promise = db.collection('messages').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
        touser: OPENID,
      }).field({
        data: true
      }).get()
      tasks.push(promise)
    }
    // 等待所有
    return (await Promise.all(tasks)).reduce((acc, cur) => {
      return {
        data: acc.data.concat(cur.data),
        errMsg: acc.errMsg,
      }
    }, {
      data: [],
      errMsg: "",
    })
  } catch (err) {
    console.log(err);
    return err;
  }
}