'use strict';

const Controller = require('egg').Controller;

class ReportController extends Controller {
  // 举报
  async save() {
    const { ctx, app } = this
    let current_user_id = ctx.authUser.id;
    // 参数验证
    ctx.validate({
      reported_id: { type: 'int', required: true, desc: '被举报人/群id' },
      reported_type: { type: 'string', range: { in: ['user', 'group'] }, required: true, desc: '类型' },
      content: { type: 'string', required: true, desc: '举报内容' },
      category: { type: 'string', required: true, desc: '分类' }
    })
    let { reported_id, reported_type, content, category } = ctx.request.body;
    // 不能举报自己
    if (reported_type === 'user' && reported_id === current_user_id) ctx.throw(400, '不要举报自己！')
    // 是否存在
    let user = await app.model.User.findOne({
      where: {
        id: reported_id,
        status: 1
      }
    })
    if (!user) ctx.throw(400, '该用户已不存在！')

    // 是否举报过（我的举报还未处理）
    let report = await app.model.Report.findOne({
      where: {
        reported_id,
        reported_type,
        status: 'pending'
      }
    })
    if (report) ctx.throw(400, '请等待管理员处理！')

    // 创建举报内容
    const res = await app.model.Report.create({
      user_id: current_user_id, reported_id, reported_type, content, category
    })

    return ctx.apiSuccess('举报已提交！')
  }
}

module.exports = ReportController;
