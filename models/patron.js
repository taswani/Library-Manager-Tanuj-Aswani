"use strict";
module.exports = (sequelize, DataTypes) => {
  const Patron = sequelize.define(
    "Patron",
    {
      first_name: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "First name is required" } }
      },
      last_name: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Last name is required" } }
      },
      address: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Address is required" } }
      },
      email: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Email address is required" } }
      },
      library_id: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Library ID is required" } }
      },
      zip_code: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: { msg: "Zip code is required" },
          not: { args: ["[a-z]", "i"], msg: "Please enter a number" }
        }
      }
    },
    {
      timestamps: false,
      underscored: true
    }
  );
  Patron.associate = function(models) {
    // associations can be defined here
    models.Patron.hasMany(models.Loan);
  };
  return Patron;
};
