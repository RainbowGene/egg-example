'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { ctx } = this;
    ctx.apiFail('错啦')
  }
}

module.exports = HomeController;
