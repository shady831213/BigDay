// 云函数入口文件
const cloud = require('wx-server-sdk')

cloud.init({env:process.env.ENVID})
const db = cloud.database();
// 云函数入口函数
exports.main = async(event, context) => {
  console.log(event)
  try {
    const {
      OPENID
    } = cloud.getWXContext();
    const result = await db.collection('messages').where({
      touser: OPENID,
      _id: event.data._id
    }).remove();
    return result;
  } catch (err) {
    console.log(err);
    return err;
  }
};