const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];
const SECRET_KEY = 'your_secret_key';

const isValid = (username) => {
    return users.some((user) => user.username === username);
  }; 

const authenticatedUser = (username, password) => {
    return users.some((user) => user.username === username && user.password === password);
  };
  
//only registered users can login
regd_users.post("/login", (req, res) => {
    const { username, password } = req.body;
  
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required" });
    }
  
    if (!isValid(username)) {
      return res.status(401).json({ message: "Invalid username" });
    }
  
    if (!authenticatedUser(username, password)) {
      return res.status(401).json({ message: "Invalid password" });
    }
  
    const token = jwt.sign({ username }, SECRET_KEY, { expiresIn: '1h' });

    req.session.authorization = {
        accessToken: token,
        username: username
    };

    return res.status(200).json({ message: "Login successful", token });
  });
  

// Add a book review
// Add or modify a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const { review } = req.query;
    const username = req.session.authorization?.username;
  
    // Ensure the user is logged in
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    // Ensure the review is provided
    if (!review) {
      return res.status(400).json({ message: "Review content is required" });
    }
  
    // Find the book by ISBN
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Initialize the reviews object if it doesn't exist
    if (!book.reviews) {
      book.reviews = {};
    }
  
    // Add or modify the review for the current user
    book.reviews[username] = review;
  
    return res.status(200).json({ message: "Review successfully added/modified", reviews: book.reviews });
  });
  
// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
    const { isbn } = req.params;
    const username = req.session.authorization?.username;
  
    // Ensure the user is logged in
    if (!username) {
      return res.status(403).json({ message: "User not logged in" });
    }
  
    // Find the book by ISBN
    const book = books[isbn];
    if (!book) {
      return res.status(404).json({ message: "Book not found" });
    }
  
    // Check if the book has reviews and if the current user has a review
    if (book.reviews && book.reviews[username]) {
      // Delete the user's review
      delete book.reviews[username];
      return res.status(200).json({ message: "Review deleted successfully", reviews: book.reviews });
    } else {
      return res.status(404).json({ message: "No review found for the user on this book" });
    }
  });
  

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
