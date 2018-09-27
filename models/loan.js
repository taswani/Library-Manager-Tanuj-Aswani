"use strict";
module.exports = (sequelize, DataTypes) => {
  const Loan = sequelize.define(
    "Loan",
    {
      book_id: DataTypes.INTEGER,
      patron_id: DataTypes.INTEGER,
      loaned_on: {
        type: DataTypes.DATE,
        validate: { notEmpty: { msg: "Check out date is required" } }
      },
      return_by: {
        type: DataTypes.DATE,
        validate: { notEmpty: { msg: "Return by date is required" } }
      },
      returned_on: {
        type: DataTypes.DATE,
        validate: { notEmpty: { msg: "Return date is required" } }
      }
    },
    {
      timestamps: false,
      underscored: true
    }
  );
  Loan.associate = function(models) {
    // associations can be defined here
    models.Loan.belongsTo(models.Book);
    models.Loan.belongsTo(models.Patron);
  };
  return Loan;
};
