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
  },
  // 生成token
  getToken(val) {
    return this.app.jwt.sign(val, this.app.config.jwt.secret)
  },
  // 验证token
  checkToken(token) {
    return this.app.jwt.verify(token, this.app.config.jwt.secret)
  },
  // 用户上线
  async online(user_id) {
    const { service, app } = this;
    let pid = process.pid;
    // 下线其他设备
    let opid = await service.cache.get('online_' + user_id);
    if (opid) {
      // 通知对应进程用户下线
      app.messenger.sendTo(opid, 'offline', user_id);
    }
    // 存储上线状态
    service.cache.set('online_' + user_id, pid);
  },
}