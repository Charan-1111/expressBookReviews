const express = require('express');
const axios = require("axios");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();

const doesExist = (username)=>{
  let userswithsamename = users.filter((user)=>{
    return user.username === username
  });
  if(userswithsamename.length > 0){
    return true;
  } else {
    return false;
  }
}

async function getBooksAsync(callback) {
  try {
    setTimeout(() => {
      callback(null, books);
    }, 1000);
  } catch (error) {
    callback(error);
  }
}

function getBookByISBN(isbn) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error('Book not found'));
      }
    }, 1000);
  });
}

async function getBooksByAuthor(author, callback) {
  try {
    setTimeout(() => {
      const isbns = Object.keys(books);
      const booksFound = isbns
        .map((isbn) => books[isbn])
        .filter((book) => book.author === author);

      callback(null, booksFound);
    }, 1000);
  } catch (error) {
    callback(error);
  }
}

function getBooksByTitle(title) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      const isbns = Object.keys(books);
      const booksFound = isbns
        .map((isbn) => books[isbn])
        .filter((book) => book.title === title);

      if (booksFound.length > 0) {
        resolve(booksFound);
      } else {
        reject(new Error('No books found with the specified title'));
      }
    }, 1000);
  });
}


public_users.post("/register", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;

  if (username && password) {
    if (!doesExist(username)) {
      users.push({"username":username,"password":password});
      return res.status(200).json({message: "User successfully registred. Now you can login"});
    } else {
      return res.status(404).json({message: "User already exists!"});
    }
  }
  return res.status(404).json({message: "Unable to register user."});
});

// Get the book list available in the shop
public_users.get('/', function (req, res) {
  getBooksAsync((error, bookList) => {
    if (error) {
      console.error('Error fetching book list:', error);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.send(JSON.stringify(bookList, null, 4));
    }
  });
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn', function (req, res) {
  const isbn = req.params.isbn;

  getBookByISBN(isbn)
    .then((book) => {
      res.send(book);
    })
    .catch((error) => {
      console.error('Error fetching book by ISBN:', error);
      res.status(404).json({ message: 'Book not found' });
    });
});
  
// Get book details based on author
public_users.get('/author/:author', function (req, res) {
  const author = req.params.author;

  getBooksByAuthor(author, (error, booksFound) => {
    if (error) {
      console.error('Error fetching books by author:', error);
      res.status(500).json({ message: 'Internal server error' });
    } else {
      res.send(booksFound);
    }
  });
});

// Get all books based on title
public_users.get('/title/:title', function (req, res) {
  const title = req.params.title;

  getBooksByTitle(title)
    .then((booksFound) => {
      res.send(booksFound);
    })
    .catch((error) => {
      console.error('Error fetching books by title:', error);
      res.status(404).json({ message: 'No books found with the specified title' });
    });
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  res.send(books[isbn].reviews)
});

module.exports.general = public_users;
