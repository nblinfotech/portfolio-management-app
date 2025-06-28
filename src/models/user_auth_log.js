'use strict';
const { Model } = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class auth_log extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  auth_log.init(
    {
      user_id: DataTypes.INTEGER,
      details: DataTypes.JSON,
      status: DataTypes.INTEGER,
      ip: DataTypes.STRING
    },
    {
      sequelize,
      modelName: 'user_auth_log',
    }
  );
  return auth_log;
};
