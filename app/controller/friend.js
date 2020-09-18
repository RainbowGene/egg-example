'use strict';

const Controller = require('egg').Controller;
const SortWord = require('sort-word')

class FriendController extends Controller {
  // 通讯录列表
  async list() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    // 分页
    let friends = await app.model.Friend.findAndCountAll({
      where: {
        user_id: current_user_id
      },
      include: [{
        model: app.model.User,
        as: 'friendInfo',  // 指定我们设置的别名
        attributes: ['id', 'username', 'nickname', 'avatar']
      }]
    })

    // 查询优化
    let res = friends.rows.map(item => {
      // 好友备注：昵称有显示昵称，否则显示用户名
      let name = item.friendInfo.nickname ? item.friendInfo.nickname : item.friendInfo.username
      if (item.nickname) name = item.nickname
      return {
        id: item.id,
        user_id: item.friendInfo.id,
        name,
        username: item.friendInfo.username,
        avatar: item.friendInfo.avatar
      }
    })

    // 首字母排序 npm i sort-word -S
    friends.rows = new SortWord(res, 'name')

    ctx.apiSuccess(friends)
  }

  // 查看好友资料
  async read() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    let id = ctx.params.id ? parseInt(ctx.params.id) : 0;

    // 查询
    let friend = await app.model.Friend.findOne({
      where: {
        friend_id: id,
        user_id: current_user_id
      },
      include: [{
        model: app.model.User,
        as: 'friendInfo',
        attributes: ['id', 'username', 'nickname', 'avatar']
      }]
    })
    if (!friend) ctx.throw(400, '好友不存在！')

    ctx.apiSuccess(friend)
  }

  // 移入/移除黑名单
  async setblack() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    let id = ctx.params.id ? parseInt(ctx.params.id) : 0;
    ctx.validate({
      isblack: { type: 'int', range: { in: [0, 1] }, required: true, desc: '黑名单' }
    })

    console.log(id)
    let friend = await app.model.Friend.findOne({
      where: {
        friend_id: id,
        user_id: current_user_id
      }
    });
    if (!friend) ctx.throw(400, '好友不存在！');
    // 移入/移除黑名单
    friend.isblack = ctx.request.body.isblack
    await friend.save()

    let msg = ctx.request.body.isblack ? '加入' : '移除'
    return ctx.apiSuccess(msg + '黑名单')
  }

  // 设置取消星标
  async setstar() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    let id = ctx.params.id ? parseInt(ctx.params.id) : 0;
    ctx.validate({
      star: { type: 'int', range: { in: [0, 1] }, required: true, desc: '星标值' }
    })

    console.log(id)
    let friend = await app.model.Friend.findOne({
      where: {
        friend_id: id,
        user_id: current_user_id,
        isblack: 0 // 只找没被拉黑的
      }
    });
    if (!friend) ctx.throw(400, '好友不存在！');
    // 移入/移除黑名单
    friend.star = ctx.request.body.star
    await friend.save()

    let msg = ctx.request.body.star ? '设为' : '取消'
    return ctx.apiSuccess(msg + '星标')
  }

  // 设置朋友圈权限
  async setMomentAuth() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    let id = ctx.params.id ? parseInt(ctx.params.id) : 0;
    let { lookhim, lookme } = ctx.request.body

    ctx.validate({
      lookhim: { type: 'int', range: { in: [0, 1] }, required: true, desc: '看他' },
      lookme: { type: 'int', range: { in: [0, 1] }, required: true, desc: '可以看我' }
    })

    let friend = await app.model.Friend.findOne({
      where: {
        friend_id: id,
        user_id: current_user_id,
        isblack: 0
      }
    })
    if (!friend) ctx.throw(400, '记录不存在或者已被拉黑！')

    // 执行操作
    friend.lookhim = lookhim;
    friend.lookme = lookme;
    await friend.save()

    return ctx.apiSuccess('设置成功！')
  }
}

module.exports = FriendController;
