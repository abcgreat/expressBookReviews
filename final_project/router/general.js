const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();


public_users.post("/register", (req,res) => {
  //Write your code here
  const {username, password} = req.body;
  
  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required"});
  }

  const userExists = users.find((user) => user.username === username);

  if (userExists) {
    return res.status(409).json({ message: "user already exists"});
  }

  users.push({ username, password});
  return res.status(201).json({ message: "User registered successfully"});

});

// Get the book list available in the shop
public_users.get('/', async (req, res) => {
    try {
      // Simulating async behavior using Promise
      const booksList = await new Promise((resolve, reject) => {
        resolve(books);
      });
  
      // Send back the list of books
      return res.status(200).json(booksList);
    } catch (error) {
      // Handle errors
      return res.status(500).json({ message: "Error fetching the books list", error: error.message });
    }
  });

// Get book details based on ISBN
public_users.get('/isbn/:isbn', (req, res) => {
    const isbn = req.params.isbn;
  
    // Simulate async behavior using Promise
    new Promise((resolve, reject) => {
      const book = books[isbn];
      if (book) {
        resolve(book);
      } else {
        reject(new Error('Book not found'));
      }
    })
    .then((bookDetails) => {
      return res.status(200).json(bookDetails);
    })
    .catch((error) => {
      return res.status(404).json({ message: "Error fetching the book details", error: error.message });
    });
  });
  
  
// Get book details based on author
public_users.get('/author/:author', (req, res) => {
    const author = req.params.author.toLowerCase(); // Handle case-insensitive search
  
    new Promise((resolve, reject) => {
      const filteredBooks = Object.keys(books).filter((key) => books[key].author.toLowerCase() === author).map((key) => books[key]);
  
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error('No books found by this author'));
      }
    })
    .then((booksByAuthor) => {
      return res.status(200).json(booksByAuthor);
    })
    .catch((error) => {
      return res.status(404).json({ message: "No books found by this author", error: error.message });
    });
  });
  

// Get all books based on title
public_users.get('/title/:title', (req, res) => {
    const title = req.params.title.toLowerCase(); // Handle case-insensitive search
  
    new Promise((resolve, reject) => {
      const filteredBooks = Object.keys(books).filter((key) => books[key].title.toLowerCase() === title).map((key) => books[key]);
  
      if (filteredBooks.length > 0) {
        resolve(filteredBooks);
      } else {
        reject(new Error('No books found with this title'));
      }
    })
    .then((booksByTitle) => {
      return res.status(200).json(booksByTitle);
    })
    .catch((error) => {
      return res.status(404).json({ message: "No books found with this title", error: error.message });
    });
  });
  

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  //Write your code here
  const isbn = req.params.isbn;
  
  if (books[isbn]) {
    return res.status(200).json(books[isbn]);
  } else {
    return res.status(404).json({ message: "No books found by the ISBN"});
  }
});

module.exports.general = public_users;
