const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [{"username":"charan", "password":"password4"}];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
let validusers = users.filter((user)=>{
  return (user.username === username && user.password === password)
});
if(validusers.length > 0){
  return true;
} else {
  return false;
}
}

//only registered users can login
regd_users.post("/login", (req,res) => {
  const username = req.body.username;
  const password = req.body.password;
  if (!username || !password) {
      return res.status(404).json({message: "Error logging in"});
  }
 if (authenticatedUser(username,password)) {
    let accessToken = jwt.sign({
      data: password
    }, 'access', { expiresIn: 60 * 60 });
    req.session.authorization = {
      accessToken,username
  }
  return res.status(200).send("User successfully logged in");
  } else {
    return res.status(208).json({message: "Invalid Login. Check username and password"});
  }});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  if (!req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Retrieve username from the session

  // Check if the ISBN exists in the books database
  if (!books[isbn]) {
    return res.status(404).json({ message: "Book not found" });
  }

  const review = req.params.review;

  books[isbn].reviews.username = review;
  res.status(200).json({message:`The review for the book with ISBN ${isbn} has been addedd/updated.`})
  
});

// Delete a review
regd_users.delete("/auth/review/:isbn", (req, res)=>{
  if (!req.session.authorization || !req.session.authorization.username) {
    return res.status(401).json({ message: "User not logged in" });
  }

  const isbn = req.params.isbn;
  const username = req.session.authorization.username; // Retrieve username from the session

  delete books[isbn].reviews.username;
  res.status(200).json({message: `Reviews for the ISBN ${isbn} posted by the user ${username} deleted`});
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
