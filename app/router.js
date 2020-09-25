'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.post('/reg', controller.user.reg); // 注册
  router.post('/login', controller.user.login); // 登录
  router.post('/logout', controller.user.logout); // 退出

  router.post('/search/user', controller.search.user); // 搜索用户
  router.post('/apply/addfriend', controller.apply.addfriend); // 申请添加好友
  router.get('/apply/:page', controller.apply.list); // 好友申请列表
  router.post('/apply/handle/:id', controller.apply.handle); // 处理好友申请

  router.get('/friend/list', controller.friend.list); // 好友申请列表
  router.get('/friend/read/:id', controller.friend.read); // 查看用户资料
  router.post('/friend/setblack/:id', controller.friend.setblack); // 移入移除黑名单
  router.post('/friend/setstar/:id', controller.friend.setstar); // 设置星标
  router.post('/friend/setmomentauth/:id', controller.friend.setMomentAuth); // 设置朋友圈权限
  router.post('/friend/setremarktag/:id', controller.friend.setremarkTag); // 设置备注标签

  router.post('/report/save', controller.report.save); // 举报

  app.ws.use(async (ctx, next) => {
    // 获取参数 ws://localhost:7001/ws?token=123456
    // ctx.query.token
    // 验证用户token
    let user = {};
    let token = ctx.query.token;
    try {
      user = ctx.checkToken(token);
      // 验证用户状态
      let userCheck = await app.model.User.findOne({
        where: {
          id: user.id
        }
      });
      if (!userCheck) {
        ctx.websocket.send(JSON.stringify({
          msg: "fail",
          data: '用户不存在'
        }));
        return ctx.websocket.close();
      }
      if (!userCheck.status) {
        ctx.websocket.send(JSON.stringify({
          msg: "fail",
          data: '你已被禁用'
        }));
        return ctx.websocket.close();
      }
      // 用户上线 默认为空对象
      app.ws.user = app.ws.user ? app.ws.user : {};
      // 下线其他设备 
      if (app.ws.user[user.id]) { // 判断上线
        app.ws.user[user.id].send(JSON.stringify({
          msg: "fail",
          data: '你的账号在其他设备登录'
        }));
        app.ws.user[user.id].close();
      }
      // 记录当前用户id  ctx.websocket.user_id 
      ctx.websocket.user_id = user.id;
      app.ws.user[user.id] = ctx.websocket;

      // ctx.online(user.id);

      await next();
    } catch (err) {
      console.log(err);
      let fail = err.name === 'TokenExpiredError' ? 'token 已过期! 请重新获取令牌' : 'Token 令牌不合法!';
      ctx.websocket.send(JSON.stringify({
        msg: "fail",
        data: fail
      }))
      // 关闭连接
      ctx.websocket.close();
    }
  });

  // 配置websocket路由
  app.ws.route('/ws', controller.chat.connect)

  // 发送消息
  router.post('/chat/send', controller.chat.send)
};
