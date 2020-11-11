'use strict';

const Controller = require('egg').Controller;

class TagController extends Controller {
  // 标签列表
  async list() {
    const { ctx, app } = this;
    let current_user_id = ctx.authUser.id;

    let rows = await app.model.Tag.findAll({
      where: {
        user_id: current_user_id
      },
      attributes: ['id', 'name']
    });

    ctx.apiSuccess(rows);
  }

  // 标签用户列表
  async read() {
    const { ctx, app } = this;
    let current_user_id = ctx.authUser.id;

    let id = parseInt(ctx.params.id);

    let rows = await app.model.Tag.findOne({
      where: {
        user_id: current_user_id,
        id
      },
      attributes: ['id', 'name'],
      include: [{
        model: app.model.Friend,
        attributes: ['nickname'],
        where: {
          isblack: 0
        },
        include: [{
          model: app.model.User,
          as: "friendInfo",
          attributes: ['id', 'nickname', 'avatar', 'username']
        }]
      }]
    });

    ctx.apiSuccess(rows.friends);

  }
}

module.exports = TagController;
