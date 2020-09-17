module.exports = {
  // api返回成功
  apiSuccess(data = '', msg = 'ok', code = 200) {
    // this 直接相当于 ctx
    this.status = code
    this.body = { msg, data }
  },
  // 返回失败
  apiFail(data = '', msg = 'fail', code = 400) {
    // this 直接相当于 ctx
    this.status = code
    this.body = { msg, data }
  }
}