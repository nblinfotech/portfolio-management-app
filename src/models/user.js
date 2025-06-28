'use strict';
const { Model } = require('sequelize');
const bcrypt = require('bcryptjs');
const { organizations } = require('./core');
module.exports = (sequelize, DataTypes) => {
  class user extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }

    // Methods begins here

    /**
     * Check if email is taken
     * @param {string} email - The user's email
     * @param {number} [excludeUserId] - The id of the user to be excluded
     * @returns {Promise<boolean>}
     */
    static async isEmailTaken(email) {
      const user = await this.findOne({
        where: {
          email,
        },
      });
      return !!user;
    }
    async isPasswordMatch(password) {
      return bcrypt.compare(password, this.password);
    }

    // Methods ends here
  }
  user.init(
    {
      is_primary: DataTypes.BOOLEAN,
      organization_id: {
        type: DataTypes.INTEGER,
        references: {
          model: organizations,
          key: 'id',
        },
      },
      first_name: DataTypes.STRING,
      middle_name: DataTypes.STRING,
      last_name: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
      role: DataTypes.STRING,
      is_active: DataTypes.BOOLEAN,
      status: { type: DataTypes.INTEGER, defaultValue: 0 },
      failed_login_attempts: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        allowNull: false
      },
      last_failed_login: {
        type: DataTypes.DATE,
        allowNull: true
      },
      phone: {
        type: DataTypes.STRING,
        allowNull: true
      },
    },
    {
      sequelize,
      modelName: 'user',
      hooks: {
        beforeSave: async (user) => {
          if (user.changed('password')) {
            console.log('beforeCreate: Hashing password');
            user.password = await bcrypt.hash(user.password, 8);
            console.log('beforeCreate: Password hashed:', user.password);
          }
        },
      },
    }
  );
  return user;
};
