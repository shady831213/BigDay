const cloud = require('wx-server-sdk');
const templateMessage = require('templateMessage.js')
const rp = require('request-promise');
const lunarSolarConverter = require('LunarSolarConverter.js')
const convert = new lunarSolarConverter.converter()
cloud.init({ env: process.env.ENVID });

exports.main = async(event, context) => {
  const db = cloud.database();
  const MAX_LIMIT = 100
  const countResult = await db.collection('messages').count()
  const total = countResult.total
  const batchTimes = Math.ceil(total / MAX_LIMIT)
  const tasks = []
  const today = new Date()
  const lunar = convert.SolarToLunar({
    solarDay: today.getDate(),
    solarMonth: today.getMonth() + 1,
    solarYear: today.getFullYear(),
  })
  for (let i = 0; i < batchTimes; i++) {
    tasks.push(db.collection('messages').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
      data: {
        solar: true,
        date: {
          month: today.getMonth() + 1,
          day: today.getDate()
        }
      }
    }).get())
    tasks.push(db.collection('messages').skip(i * MAX_LIMIT).limit(MAX_LIMIT).where({
      data: {
        solar: false,
        date: {
          month: lunar.lunarMonth,
          day: lunar.lunarDay
        }
      }
    }).get())
  }
  const promise = async message => {
    try {
      console.log('send')
      let tokenRes = await db.collection("accessToken").doc("ACCESS_TOKEN").get();
      let token = tokenRes.data.token; // access_token
      const data = {
        date2: {
          value: today.getFullYear() + '-' + (today.getMonth()+1) + '-' + today.getDate()
        },
        thing3: {
          value: message.data.desc
        }
      }
      console.log(data)
      console.log(message.touser)
      console.log(message.page)
      console.log(message.templateId)
      const result = await templateMessage.sendTemplateMsg(token, {
        touser: message.touser,
        page: message.page,
        data: data,
        templateId: message.templateId,
      });
      console.log(result)
      return result
    } catch (e) {
      console.log(e)
      return e;
    }
  }

  const promises = tasks.map(async messages => {
    return (await Promise.all((await messages).data.map(promise))).reduce((acc, cur) => {
      return acc.concat([cur])
    }, [])
  })

  return (await Promise.all(promises)).reduce((acc, cur) => {
    return acc.concat(cur)
  })
};