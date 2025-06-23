// app.js
App({
  onLaunch() {
    // 小程序初始化时执行
    console.log('App Launched');
  },
  onShow(options) {
    // 小程序启动或从后台进入前台时执行
  },
  onHide() {
    // 小程序从前台进入后台时执行
  },
  onError(msg) {
    // 小程序发生脚本错误或 API 调用失败时执行
    console.error('App Error:', msg);
  },
  globalData: {
    userInfo: null
  }
});