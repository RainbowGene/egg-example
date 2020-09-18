'use strict';

const Controller = require('egg').Controller;

class SearchController extends Controller {
  // 搜索用户
  async user() {
    const { ctx, app } = this

    ctx.validate({
      keyword: { type: 'string', required: true, desc: '关键字' }
    });
    let { keyword } = ctx.request.body
    let user = await app.model.User.findOne({
      where: {
        username: keyword
      },
      attibutes: {
        exclude: ['password']
      }
    })
    ctx.body = user
  }
}

module.exports = SearchController;
