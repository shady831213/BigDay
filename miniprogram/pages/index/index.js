//index.js
const app = getApp();
Page({
  data: {
    days: [],
  },
  onShow: function() {
    const that = this
    wx.cloud
      .callFunction({
        name: 'listSubscribe',
        data: {},
      })
      .then((res) => {
        const datas = res.result.data.map(function(item) {
          return {
            date: item.data.date.month + '-' + item.data.date.day + '(' + (item.data.solar ? '阳历' : '阴历') + ')',
            desc: item.data.desc,
            id: item._id,
            slideButtons: [{
                text: '编辑',
                extClass: 'bubble',
                src: '/images/编辑.svg', // icon的路径
                data: item
              },
              {
                text: '删除',
                extClass: 'bubble',
                src: '/images/删除_填充.svg', // icon的路径,
                data: item
              },
            ],
          }
        })
        console.log(datas)
        that.setData({
          days: datas
        })
      })
      .catch((e) => {
        console.log(e)
        wx.showToast({
          title: '获取列表失败',
          icon: 'none',
          duration: 1000,
        });
      });
  },
  onCreate: function(e) {
    wx.navigateTo({
      url: "../item/item",
      success: function(res) {
        res.eventChannel.emit('acceptDataFromIndex', {
          _id: "",
          data: {
            desc: "",
            solar: true,
            date: {
              month: new Date().getMonth() + 1,
              day: new Date().getDate()
            }
          }
        })
      },
      fail: function(e) {
        console.log(e)
      }
    })
  },
  slideButtonTap: function(e) {
    console.log('slide button tap', e.detail)
    switch (e.detail.index) {
      case 0:
        console.log('编辑', e.detail.data)
        const data = e.detail.data
        wx.navigateTo({
          url: "../item/item",
          success: function(res) {
            res.eventChannel.emit('acceptDataFromIndex', data)
          },
          fail: function(e) {
            console.log(e)
          }
        })
        break
      case 1:
        console.log('删除', e.detail.data)
        const that = this
        wx.cloud
          .callFunction({
            name: 'delSubscribe',
            data: {
              data: {
                _id: e.detail.data._id
              }
            },
          })
          .then((res) => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000,
              complete: that.onShow
            })
          })
          .catch((e) => {
            console.log(e)
            wx.showToast({
              title: '删除失败',
              icon: 'none',
              duration: 1000,
            });
          });
        break
    }
  },
});