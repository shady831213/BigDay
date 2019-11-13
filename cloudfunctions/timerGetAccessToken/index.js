
const cloud = require('wx-server-sdk')
cloud.init({ env: process.env.ENVID })
const db = cloud.database()
const coll_token = db.collection('accessToken');
const rq = require('request-promise')
const APPID = process.env.APPID;
const APPSECRET = process.env.APPSECRET;

exports.main = async (event, context) => {
  try {
    console.log(APPID)
    console.log(APPSECRET)
    let res = await rq({
      method: 'GET',
      uri: "https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=" + APPID + "&secret=" + APPSECRET,
    });
    res = JSON.parse(res)
    let resUpdate = await coll_token.doc('ACCESS_TOKEN').update({
      data: {
        token: res.access_token
      }
    })
  } catch (e) {
    console.error(e)
  }
}
