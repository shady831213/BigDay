const cloud = require('wx-server-sdk');
cloud.init({ env: process.env.ENVID });
const db = cloud.database();
const today = new Date()
exports.main = async(event, context) => {
  console.log(event)
  try {
    const {
      OPENID
    } = cloud.getWXContext();
    const data = event.data
    // //for test
    // const result = await cloud.openapi.subscribeMessage.send({
    //   touser: OPENID,
    //   page: 'index',
    //   data: {
    //     date2: {
    //       value: today.getFullYear() + '-' + data.data.date.month + '-' + data.data.date.day
    //     },
    //     thing3: {
    //       value: data.data.desc
    //     }
    //   },
    //   templateId: event.templateId,
    // });
    if (data._id == "") {
      const result = await db.collection('messages').add({
        data: {
          touser: OPENID,
          page: 'index',
          data: data.data,
          templateId: event.templateId,
        },
      });
      return result;
    } else {
      const result = await db.collection('messages').where({
        touser: OPENID,
        _id: data._id
      }).update({
        data: {
          data: data.data
        }
      })
      return result;
    }

  } catch (err) {
    console.log(err);
    return err;
  }
};