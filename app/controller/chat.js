'use strict';

const Controller = require('egg').Controller;

class ChatController extends Controller {
  async connect() {
    const { ctx, app, service } = this;
    if (!ctx.websocket) {
      ctx.throw(400, '非法访问');
    }

    // console.log(`clients: ${app.ws.clients.size}`);

    // 监听接收消息和关闭socket
    ctx.websocket
      .on('message', msg => {
        // console.log('接收消息', msg);
      })
      .on('close', (code, reason) => {
        // 用户下线
        console.log('用户下线', code, reason);
        let user_id = ctx.websocket.user_id;
        // 移除redis中的用户上线记录
        // service.cache.remove('online_' + user_id);
        if (app.ws.user && app.ws.user[user_id]) {
          delete app.ws.user[user_id];
        }
      });
  }

  // 发送消息
  async send() {
    const { ctx, app, service } = this;
    // 拿到当前用户id
    let current_user_id = ctx.authUser.id;
    // 验证参数
    ctx.validate({
      to_id: {
        type: 'int',
        required: true,
        desc: '接收人/群id'
      },
      chat_type: {
        type: 'string',
        required: true,
        range: {
          in: ['user', 'group']
        },
        desc: '接收类型'
      },
      type: {
        type: 'string',
        required: true,
        range: {
          in: ['text', 'image', 'video', 'audio', 'emoticon', 'card']
        },
        desc: '消息类型'
      },
      data: {
        type: 'string',
        required: true,
        desc: '消息内容'
      },
      // options: {
      //   type: 'string',
      //   required: true
      // }
    });
    // 获取参数
    let { to_id, chat_type, type, data, options } = ctx.request.body;
    // 单聊
    if (chat_type === 'user') {
      // 验证好友是否存在，并且对方没有把你拉黑
      let Friend = await app.model.Friend.findOne({
        where: {
          user_id: to_id,
          friend_id: current_user_id,
          isblack: 0
        },
        include: [{
          model: app.model.User,
          as: "userInfo"
        }, {
          model: app.model.User,
          as: "friendInfo"
        }]
      });
      if (!Friend) {
        return ctx.apiFail('对方不存在或者已经把你拉黑');
      }
      // 验证好友是否被禁用
      if (!Friend.userInfo.status) {
        return ctx.apiFail('对方已被禁用');
      }
      // 构建消息格式
      let from_name = Friend.friendInfo.nickname ? Friend.friendInfo.nickname : Friend.friendInfo.username;
      if (Friend.nickname) {
        from_name = Friend.nickname;
      }
      let message = {
        id: (new Date()).getTime(), // 唯一id，后端生成唯一id
        from_avatar: Friend.friendInfo.avatar,// 发送者头像
        from_name, // 发送者昵称
        from_id: current_user_id, // 发送者id
        to_id, // 接收人/群 id
        to_name: Friend.userInfo.nickname ? Friend.userInfo.nickname : Friend.userInfo.username, // 接收人/群 名称
        to_avatar: Friend.userInfo.avatar, // 接收人/群 头像
        chat_type: 'user', // 接收类型
        type,// 消息类型
        data, // 消息内容
        options: {}, // 其他参数
        create_time: (new Date()).getTime(), // 创建时间
        isremove: 0, // 是否撤回
      }

      // 拿到对方的socket
      let socket = app.ws.user[to_id]
      // 验证是否在线,不在线接收到待接收队列消息(redis)中，在线则推送消息
      if (!socket) {
        this.service.cache.setList('getmessage_' + to_id, message);
      }
      else {
        // 消息推送
        socket.send(JSON.stringify({
          msg: 'ok',
          data: message
        }))
        // 存到服务器历史记录(便于查询用户是否违规)
        service.cache.setList(`chatlog_${to_id}_user_${current_user_id}`, message)
      }
      // 存到自己的历时记录
      service.cache.setList(`chatlog_${current_user_id}_user_${to_id}`, message)

      return ctx.apiSuccess(message)
    }
    // 群聊
    return ctx.apiSuccess('群聊')
  }
}

module.exports = ChatController;
