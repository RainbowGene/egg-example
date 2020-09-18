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

  router.get('/friend/:page', controller.friend.list); // 好友申请列表
  router.get('/friend/read/:id', controller.friend.read); // 好友资料
  router.post('/friend/setblack/:id', controller.friend.setblack); // 移入移除黑名单
  router.post('/friend/setstar/:id', controller.friend.setstar); // 设置星标
  router.post('/friend/setmomentauth/:id', controller.friend.setMomentAuth); // 设置朋友圈权限

  router.post('/report/save', controller.report.save); // 举报
};
