var calanderHelper = require("calanderHelper.js")
const tmplId = 'vkE0Bu2itEgO-8OmANVWWS-cDCRgKrEFpKgWxeHmz2k'
Page({
  data: {
    data: {
      _id: "",
      data: {
        desc: "",
        solar: true,
        date: {
          month: new Date().getMonth() + 1,
          day: new Date().getDate()
        }
      }
    },
    multiArray: [],
    multiIndex: [0, 0],
  },
  pickerInit: function(data) {
    let months = Array.from({
      length: 12
    }, (v, i) => 1 + i)
    var days = data.data.solar ? calanderHelper.SolarDays(data.data.date.month) : calanderHelper.LunarDays()
    this.setData({
      multiArray: [months, Array.from({
        length: days
      }, (v, i) => i + 1)],
      multiIndex: [data.data.date.month - 1, data.data.date.day >= days ? days - 1 : data.data.date.day - 1],
      data: {
        _id: data._id,
        data: {
          desc: data.data.desc,
          solar: data.data.solar,
          date: {
            month: data.data.date.month,
            day: data.data.date.day >= days ? days : data.data.date.day
          }
        }
      }
    })
  },
  onLoad: function() {
    const eventChannel = this.getOpenerEventChannel()
    const that = this
    eventChannel.on('acceptDataFromIndex', function(data) {
      console.log(data)
      that.pickerInit(data)
    })
  },
  onInput: function(e) {
    const update = {
      _id: this.data.data._id,
      data: {
        solar: this.data.data.data.solar,
        desc: e.detail.value,
        date: this.data.data.data.date
      }
    }
    this.setData({
      data: update
    })
  },
  onSubscribe: function() {
    // 调用微信 API 申请发送订阅消息
    const data = this.data.data
    if (data.data.desc == "") {
      wx.showModal({
        title: '提示',
        content: '描述不能为空！',
        success: function(res) {
          if (res.confirm) {
            console.log('用户点击确定')
          }
        }
      })
    } else {
      wx.requestSubscribeMessage({
        // 传入订阅消息的模板id，模板 id 可在小程序管理后台申请
        tmplIds: [tmplId],
        success(res) {
          // 申请订阅成功
          if (res.errMsg === 'requestSubscribeMessage:ok') {
            // 这里将订阅的课程信息调用云函数存入db
            wx.cloud
              .callFunction({
                name: 'subscribe',
                data: {
                  data: data,
                  templateId: tmplId,
                },
              })
              .then(() => {
                wx.showToast({
                  title: '成功',
                  icon: 'success',
                  duration: 1000,
                  complete: () => {
                    setTimeout(function() {
                      wx.navigateBack({})
                    }, 1000);
                  }
                })
              })
              .catch(() => {
                wx.showToast({
                  title: '失败',
                  icon: 'none',
                  duration: 1000,
                });
              });
          }
        },
      });
    }
  },
  bindMultiPickerChange: function(e) {
    console.log('picker发送选择改变，携带值为', e.detail.value)
    const update = {
      _id: this.data.data._id,
      data: {
        solar: this.data.data.data.solar,
        desc: this.data.data.data.desc,
        date: {
          month: this.data.multiArray[0][e.detail.value[0]],
          day: this.data.multiArray[1][e.detail.value[1]]
        }
      }
    }
    this.setData({
      data: update,
      multiIndex: e.detail.value,
    })
  },
  bindMultiPickerColumnChange: function(e) {
    console.log('修改的列为', e.detail.column, '，值为', e.detail.value);
    var data = {
      multiArray: this.data.multiArray,
      multiIndex: this.data.multiIndex
    };
    data.multiIndex[e.detail.column] = e.detail.value;
    if (e.detail.column == 0) {
      var days = this.data.data.data.solar ? calanderHelper.SolarDays(data.multiArray[0][e.detail.value]) : calanderHelper.LunarDays()
      data.multiArray[1] = Array.from({
        length: days
      }, (v, i) => i + 1)
      data.multiIndex[1] = data.multiIndex[1] >= days ? days - 1 : data.multiIndex[1]
    }
    console.log(data.multiIndex);
    this.setData(data);
  },
  bindSolarLunarChange: function(e) {
    const update = {
      _id: this.data.data._id,
      data: {
        solar: e.detail.value,
        desc: this.data.data.data.desc,
        date: this.data.data.data.date
      }
    }
    this.pickerInit(update)
  },
});