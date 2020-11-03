const qr = require('qr-image')
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
  // 发送或者存到消息队列
  sendAndSaveMessage(to_id, message) {
    const { app, service } = this
    let current_user_id = this.authUser.id
    // 拿到对方的socket:如果没有任何对象（即无人连接会导致报错）
    // let socket = app.ws.user[to_id]
    // 验证是否在线,不在线接收到待接收队列消息(redis)中，在线则推送消息
    if (app.ws.user && app.ws.user[to_id]) {
      // 消息推送
      app.ws.user[to_id].send(JSON.stringify({
        msg: 'ok',
        data: message
      }))
      // 存到服务器历史记录(便于查询用户是否违规)
      service.cache.setList(`chatlog_${to_id}_${message.chat_type}_${current_user_id}`, message)
    }
    else {
      this.service.cache.setList('getmessage_' + to_id, message);
    }
    // 存到自己的历时记录
    service.cache.setList(`chatlog_${current_user_id}_${message.chat_type}_${to_id}`, message)
  },
  // 生成二维码
  qrcode(data) {
    var image = qr.image(data, { size: 10 });
    this.response.type = 'image/png';
    this.body = image;
  },
  // 生成唯一id
  genID(length) {
    return Number(Math.random().toString().substr(3, length) + Date.now()).toString(36);
  },
}