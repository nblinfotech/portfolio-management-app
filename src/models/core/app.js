'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class app extends Model {
    static associate(models) {
      app.hasMany(models.module, {
        foreignKey: 'app_id',
        as: 'modules',
        onDelete: 'SET NULL',
        onUpdate: 'CASCADE',
      });
    }
  }
  app.init(
    {
      app_name: DataTypes.STRING,
      description: DataTypes.STRING,
      application_icon: { type: DataTypes.STRING, allowNull: true },
      disk_name: DataTypes.STRING,
      modules: DataTypes.JSON,
      path: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'app',
      tableName: 'apps',
    }
  );
  return app;
};
