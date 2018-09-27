"use strict";
module.exports = (sequelize, DataTypes) => {
  const Book = sequelize.define(
    "Book",
    {
      title: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Title is required" } }
      },
      author: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Author is required" } }
      },
      genre: {
        type: DataTypes.STRING,
        validate: { notEmpty: { msg: "Genre is required" } }
      },
      first_published: {
        type: DataTypes.INTEGER,
        validate: {
          notEmpty: { msg: "Date is required" },
          not: { args: ["[a-z]", "i"], msg: "Please enter a number" }
        }
      }
    },
    {
      timestamps: false,
      underscored: true
    }
  );
  Book.associate = function(models) {
    // associations can be defined here
    models.Book.hasMany(models.Loan);
  };
  return Book;
};
