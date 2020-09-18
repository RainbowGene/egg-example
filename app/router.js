'use strict';

/**
 * @param {Egg.Application} app - egg application
 */
module.exports = app => {
  const { router, controller } = app;
  router.get('/', controller.home.index);

  router.post('/reg', controller.user.reg); // 注册
  router.post('/login', controller.user.login); // 登录
};
