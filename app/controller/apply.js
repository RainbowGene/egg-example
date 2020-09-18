'use strict';

const Controller = require('egg').Controller;

class ApplyController extends Controller {
  async addfriend() {
    const { ctx, app } = this
    // 拿到当前用户
    let current_user_id = ctx.authUser.id;
    // 验证参数
    ctx.validate({
      friend_id: { type: 'int', required: true, desc: '对方id' },
      nickname: { type: 'string', required: false, desc: '昵称' },
      lookme: { type: 'int', required: true, range: { in: [0, 1] }, desc: '看我' },
      lookhim: { type: 'int', required: true, range: { in: [0, 1] }, desc: '看他' }
    });
    let { friend_id, nickname, lookme, lookhim } = ctx.request.body
    // 不能添加自己
    if (current_user_id === friend_id) ctx.throw(400, '不能添加自己')

    // 对方是否存在
    let user = await app.model.User.findOne({
      where: {
        id: friend_id,
        status: 1
      }
    })
    if (!user) ctx.throw(400, '用户不存在或者已被禁用!')

    // 之前是否申请过了
    let apply = await app.model.Apply.findOne({
      where: {
        user_id: current_user_id,
        friend_id,
        status: ['pending', 'agree'] //待处理或者已同意
      }
    })
    if (apply) ctx.throw(400, '请等待对方通过申请！')

    // 创建申请
    let res = await app.model.Apply.create({
      user_id: current_user_id,
      friend_id,
      lookme,
      lookhim,
      nickname
    })
    if (!res) ctx.throw(400, '申请创建失败！')

    return ctx.apiSuccess('申请已发送！')
  }

  // 获取好友申请列表
  async list() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    // 分页
    let page = ctx.params.page ? parseInt(ctx.params.page) : 1 // 默认第一页
    let limit = ctx.query.limit ? parseInt(ctx.query.limit) : 10 // 默认十条
    let offset = (page - 1) * limit;

    // 关联user表
    let rows = await app.model.Apply.findAll({
      where: {
        friend_id: current_user_id
      },
      include: [{
        model: app.model.User,
        attributes: ['id', 'username', 'nickname', 'avatar']
      }],
      offset,
      limit
    });

    // 待处理的申请数
    let count = await app.model.Apply.count({
      where: {
        friend_id: current_user_id,
        status: "pending"
      }
    })

    if (!rows) ctx.throw(400, '查找失败！')

    return ctx.apiSuccess({ count, rows })
  }

  // 处理好友申请
  async handle() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    let id = ctx.params.id ? parseInt(ctx.params.id) : -1

    ctx.validate({
      nickname: { type: 'string', required: false, desc: '昵称' },
      status: { type: 'string', required: true, range: { in: ['refuse', 'agree', 'ignore'] }, desc: '处理结果' },
      lookme: { type: 'int', required: true, range: { in: [0, 1] }, desc: '看我' },
      lookhim: { type: 'int', required: true, range: { in: [0, 1] }, desc: '看他' }
    });

    // 查询申请是否存在
    let apply = await app.model.Apply.findOne({
      where: {
        id,
        friend_id: current_user_id,
        status: "pending"
      }
    })
    if (!apply) ctx.throw(400, '该申请不存在！')

    let { status, nickname, lookhim, lookme } = ctx.request.body
    // 使用事务
    let transaction;
    try {
      // 开启事务
      transaction = await app.model.transaction();

      //设置申请状态 agree 同意
      await apply.update({
        status
      }, { transaction })

      if (status == 'agree') { // 同意才去添加去操作
        // 加入对方好友列表
        if (!await app.model.Friend.findOne({ // 对方列表不存在我
          where: {
            friend_id: current_user_id,
            user_id: apply.user_id
          }
        })) { // 创建
          await app.model.Friend.create({
            friend_id: current_user_id,
            user_id: apply.user_id,
            nickname: apply.nickname,
            lookhim: apply.lookhim,
            lookme: apply.lookme
          })
        }

        // 将对方列表加入我的好友列表
        if (!await app.model.Friend.findOne({ // 对方不存在我的好友列表
          where: {
            friend_id: apply.user_id,
            user_id: current_user_id
          }
        })) { // 创建
          await app.model.Friend.create({
            friend_id: apply.user_id,
            user_id: current_user_id,
            nickname,
            lookhim,
            lookme
          })
        }
      }

      // 提交事务
      await transaction.commit()
      // 消息推送
      return ctx.apiSuccess('好友申请处理成功')
    } catch (e) {
      // 事务回滚
      await transaction.rollback();
      return ctx.apiFail('处理失败')
    }
  }
}

module.exports = ApplyController;
