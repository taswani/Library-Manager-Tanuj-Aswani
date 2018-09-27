const express = require("express"); //Need to require express for routing.
const app = express(); //Putting express into an app variable to write less code.
const router = express.Router(); //Setting up a router.
const { Book } = require("../models"); //Requiring the model for Books from sequelize.
const { Loan } = require("../models"); //Requiring the model for Books from sequelize.
const { Patron } = require("../models"); //Requiring the model for Books from sequelize.
const { Op } = require("sequelize"); //Requiring Operators from sequelize to be able query specifics.
const moment = require("moment"); //Requiring the moment npm module to help format and set up dates for loans.

//All the routes for the library manager, including get, put, and post routes.
//The get routes double as a means of retrieving data from the database.
//The put routes double as a means of error validation for the updating of the database.
//The post routes exist to create new data entries in the database.

router.get("/", (req, res, next) => {
  res.render("home");
});

//Using default "/" for books post route.

router.post("/", (req, res, next) => {
  Book.create(req.body)
    .then(function(book) {
      res.redirect("all_books");
    })
    .catch(function(err) {
      if (err.name === "SequelizeValidationError") {
        res.render("new_book", {
          book: Book.build(req.build),
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(function(err) {
      res.sendStatus(500);
    });
});

router.post("/new_patron", (req, res, next) => {
  Patron.create(req.body)
    .then(function(patron) {
      res.redirect("all_patrons");
    })
    .catch(function(err) {
      if (err.name === "SequelizeValidationError") {
        res.render("new_patron", {
          patron: Patron.build(req.body),
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(function(err) {
      res.sendStatus(500);
    });
});

router.post("/loans", (req, res, next) => {
  Loan.create(req.body)
    .then(function(loan) {
      res.redirect("all_loans");
    })
    .catch(function(err) {
      if (err.name === "SequelizeValidationError") {
        Book.findAll({}).then(function(books) {
          Patron.findAll({}).then(function(patrons) {
            res.render("new_loan", {
              loan: Loan.build(req.body),
              books,
              patrons,
              moment,
              errors: err.errors
            });
          });
        });
      }
    })
    .catch(function(err) {
      res.sendStatus(500);
    });
});

router.get("/all_books", (req, res, next) => {
  Book.findAll({}).then(function(books) {
    res.render("all_books", {
      books: books
    });
  });
});

//Loans dependent on both other models in order to display all the information.
//Syntax in the pug files was a bit weird to get a hang of first.

router.get("/all_loans", (req, res, next) => {
  Loan.findAll({
    include: [
      {
        model: Book
      },
      {
        model: Patron
      }
    ]
  }).then(function(loans) {
    res.render("all_loans", {
      loans,
      moment
    });
  });
});

router.get("/all_patrons", (req, res, next) => {
  Patron.findAll({}).then(function(patrons) {
    res.render("all_patrons", {
      patrons: patrons
    });
  });
});

router.get("/books/new", (req, res, next) => {
  res.render("new_book", { book: {}, title: "New Book" });
});

router.get("/books/:id", (req, res, next) => {
  Book.findOne({
    include: [
      {
        model: Loan,
        include: [
          {
            model: Patron
          }
        ]
      }
    ],
    where: {
      id: {
        [Op.eq]: req.params.id
      }
    }
  })
    .then(function(book) {
      res.render("book_detail", { book: book, moment });
    })
    .catch(function(err) {
      console.log(err);
    });
});

router.get("/overdue_books", (req, res, next) => {
  Book.findAll({
    include: [
      {
        model: Loan,
        where: {
          returned_on: null,
          return_by: {
            $lt: new Date()
          }
        }
      }
    ]
  }).then(function(books) {
    res.render("overdue_books", { books });
  });
});

router.get("/checked_books", (req, res, next) => {
  Book.findAll({
    include: [
      {
        model: Loan,
        where: {
          returned_on: null
        }
      }
    ]
  }).then(function(books) {
    res.render("checked_books", { books });
  });
});

router.get("/patrons/new", (req, res, next) => {
  res.render("new_patron", { patron: {}, title: "Patron" });
});

router.get("/new_loan", (req, res, next) => {
  Book.findAll({}).then(function(books) {
    Patron.findAll({}).then(function(patrons) {
      res.render("new_loan", { loan: Loan.build(), books, patrons, moment });
    });
  });
});

router.get("/overdue_loans", (req, res, next) => {
  Loan.findAll({
    include: [
      {
        model: Book
      },
      {
        model: Patron
      }
    ],
    where: {
      returned_on: null,
      return_by: {
        $lt: new Date()
      }
    }
  }).then(function(loans) {
    res.render("overdue_loans", {
      loans,
      moment
    });
  });
});

router.get("/checked_loans", (req, res, next) => {
  Loan.findAll({
    include: [
      {
        model: Book
      },
      {
        model: Patron
      }
    ],
    where: {
      returned_on: null
    }
  }).then(function(loans) {
    res.render("checked_loans", {
      loans,
      moment
    });
  });
});

router.get("/book_detail", (req, res, next) => {
  res.render("book_detail");
});

router.get("/patrons/:id", (req, res, next) => {
  Patron.findOne({
    include: [
      {
        model: Loan,
        include: [
          {
            model: Book
          }
        ]
      }
    ],
    where: {
      id: {
        [Op.eq]: req.params.id
      }
    }
  })
    .then(function(patron) {
      res.render("patron_detail", { patron: patron, moment });
    })
    .catch(function(err) {
      console.log(err);
    });
});

router.get("/return/:id", (req, res, next) => {
  Loan.findOne({
    include: [
      {
        model: Book
      },
      {
        model: Patron
      }
    ],
    where: {
      id: {
        [Op.eq]: req.params.id
      }
    }
  }).then(function(loan) {
    res.render("return_book", {
      loan,
      return: Loan.build(),
      moment
    });
  });
});

router.put("/return/:id", (req, res, next) => {
  Loan.findById(req.params.id)
    .then(function(loan) {
      if (loan) {
        return loan.update(req.body);
      } else {
        res.sendStatus(404);
      }
    })
    .then(function() {
      res.redirect("/all_loans");
    })
    .catch(function(err) {
      if (err.name === "SequelizeValidationError") {
        Loan.findOne({
          include: [
            {
              model: Patron
            },
            {
              model: Book
            }
          ],
          where: {
            id: {
              [Op.eq]: req.params.id
            }
          }
        }).then(function(loan) {
          res.render("return_book", {
            loan,
            return: Loan.build(req.body),
            moment,
            errors: err.errors
          });
        });
      }
    })
    .catch(function(err) {
      res.sendStatus(500);
    });
});

router.put("/books/:id", (req, res, next) => {
  Book.findById(req.params.id)
    .then(function(book) {
      if (book) {
        return book.update(req.body);
      } else {
        res.sendStatus(404);
      }
    })
    .then(function() {
      res.redirect("/all_books");
    })
    .catch(function(err) {
      if (err.name === "SequelizeValidationError") {
        let book = Book.build(req.body);
        book.id = req.params.id;
        res.render("book_detail", {
          book: book,
          title: book.title,
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(function() {
      res.sendStatus(500);
    });
});

router.put("/patrons/:id", (req, res, next) => {
  Patron.findById(req.params.id)
    .then(function(patron) {
      if (patron) {
        return patron.update(req.body);
      } else {
        res.sendStatus(404);
      }
    })
    .then(function() {
      res.redirect("/all_patrons");
    })
    .catch(function(err) {
      if (err.name === "SequelizeValidationError") {
        let patron = Patron.build(req.body);
        patron.id = req.params.id;
        res.render("patron_detail", {
          patron,
          moment,
          errors: err.errors
        });
      } else {
        throw err;
      }
    })
    .catch(function() {
      res.sendStatus(500);
    });
});

module.exports = router;
