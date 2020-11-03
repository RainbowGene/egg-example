'use strict';
module.exports = app => {
  const { STRING, INTEGER, DATE, ENUM, TEXT } = app.Sequelize;
  // 配置（重要：一定要配置详细，一定要！！！）
  const GroupUser = app.model.define('group_user', {
    id: {
      type: INTEGER(20).UNSIGNED,
      primaryKey: true,
      autoIncrement: true
    },
    user_id: {
      type: INTEGER(20).UNSIGNED,
      allowNull: false,
      comment: '用户id',
      //  定义外键（重要）
      references: {
        model: 'user', // 对应表名称（数据表名称）
        key: 'id' // 对应表的主键
      },
      onUpdate: 'restrict', // 更新时操作
      onDelete: 'cascade'  // 删除时操作
    },
    group_id: {
      type: INTEGER(20).UNSIGNED,
      allowNull: false,
      comment: '群组id',
      //  定义外键（重要）
      references: {
        model: 'group', // 对应表名称（数据表名称）
        key: 'id' // 对应表的主键
      },
      onUpdate: 'restrict', // 更新时操作
      onDelete: 'cascade'  // 删除时操作
    },
    nickname: {
      type: STRING(30),
      allowNull: false,
      defaultValue: '',
      comment: '在群里的昵称',
    },
    created_at: DATE,
    updated_at: DATE
  });

  // 定义关联关系
  GroupUser.associate = function (model) {
    GroupUser.belongsTo(app.model.User, {
      foreignKey: 'user_id'
    });
  }

  return GroupUser;
};