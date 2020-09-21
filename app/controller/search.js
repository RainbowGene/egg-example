'use strict';

const Controller = require('egg').Controller;

class SearchController extends Controller {
  // 搜索用户
  async user() {
    const { ctx, app } = this
    let { keyword } = ctx.request.body

    ctx.validate({
      keyword: { type: 'string', required: true, desc: '关键字' }
    });
    let user = await app.model.User.findOne({
      where: {
        username: keyword
      },
      attibutes: {
        exclude: ['password']
      }
    })
    if (!user) ctx.throw(400, '无搜索结果')
    return ctx.apiSuccess(user)
  }
}

module.exports = SearchController;
