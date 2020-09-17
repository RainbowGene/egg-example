/* eslint valid-jsdoc: "off" */

'use strict';

/**
 * @param {Egg.EggAppInfo} appInfo app info
 */
module.exports = appInfo => {
  /**
   * built-in config
   * @type {Egg.EggAppConfig}
   **/
  const config = exports = {};

  // use for cookie sign key, should change to your own and keep security
  config.keys = appInfo.name + '_1600341648045_8031';

  // 在这里添加中间件
  config.middleware = [];

  // add your user config here
  const userConfig = {
    // myAppName: 'egg',
  };

  // 关闭 csrf，开启跨域
  config.security = {
    csrf: {
      enable: false,
    },
    // 跨域白名单
    domainWhiteList: []
  };

  // 允许跨域的方法
  config.cors = {
    origin: '*',
    allowMethods: 'GET,PUT,POST,DELETE,PATCH'
  };

  return {
    ...config,
    ...userConfig,
  };
};
