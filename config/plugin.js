'use strict';

/** @type Egg.EggPlugin */
module.exports = {
  // had enabled by egg
  // static: {
  //   enable: true,
  // }

  // 跨域插件
  cors: {
    enable: true,
    package: 'egg-cors',
  },

  sequelize: {
    enable: true,
    package: 'egg-sequelize'
  },

  // 参数验证
  valparams: {
    enable: true,
    package: 'egg-valparams'
  },

  // jwt 加密鉴权
  jwt: {
    enable: true,
    package: 'egg-jwt'
  },

  // redis 缓存
  redis: {
    enable: true,
    package: 'egg-redis'
  },

  // 通讯
  websocket: {
    enable: true,
    package: 'egg-websocket-plugin',
  },
};
