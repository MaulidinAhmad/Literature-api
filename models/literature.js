"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Literature extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Literature.belongsTo(models.User, {
        as: "user",
        foreignKey: {
          name: "userId",
        },
      });
    }
  }
  Literature.init(
    {
      title: DataTypes.STRING,
      publication: DataTypes.STRING,
      userId: DataTypes.INTEGER,
      pages: DataTypes.INTEGER,
      ISBN: DataTypes.STRING,
      author: DataTypes.STRING,
      status: DataTypes.STRING,
      year: DataTypes.INTEGER,
      file: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "Literature",
    }
  );
  return Literature;
};
