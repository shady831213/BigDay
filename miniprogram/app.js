//app.js
import { Cloud } from 'laf-client-sdk'

const laf_cloud = new Cloud({
  // the laf app server base url
  baseUrl: "https://xofufw.lafyun.com",
  environment: "wxmp",
})
App({
  laf_cloud: laf_cloud,
  onLaunch: function () {
    this.globalData = {}
  }
})
