const express = require('express');
const bodyParser = require('body-parser');
const bcrypt = require('bcrypt');
const cookieSession = require('cookie-session');
const { genRandomString, getUserByEmail } = require('./helpers');

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static('public'));
app.use(cookieSession({
  name: 'sesh',
  keys: ['key1', 'key2']
}));

const PORT = 8080;

// test data below!

const urlDatabase = {

};

const users = {

};

// GETs below!

app.get('/', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  if (user) {
    let templateVars = { urls: isUsersLink(id), user };
    res.render('urlsIndex', templateVars);
  } else {
    res.redirect('login');
  }
});

// displays the users URLs if they are logged in
app.get('/urls', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  if (user) {
    let templateVars = { urls: isUsersLink(id), user };
    res.render('urlsIndex', templateVars);
  } else {
    res.status(403).send("Please login or register first.");
  }
});

// allows user to create new shortURL if they are logged in
app.get('/urls/new', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  if (user) {
    let templateVars = { user };
    res.render('urlsNew', templateVars);
  } else {
    res.redirect('/login');
  }
});

app.get('/urls/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  // rejects user if they try to access /urls/:shortURL if they do not own it
  if (urlDatabase[shortURL].userID !== id) {
    res.status(404).send('You do not have access to edit this url.');
    return;
  }
  // directs user to edit page if the url is present in their urls
  if (user && urlDatabase[shortURL]) {
    let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
    res.render('urlsShow', templateVars);
  } else {
    res.send('Please login first.');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const urlExists = urlDatabase[req.params.shortURL];
  if (!urlExists) {
    res.send('This short URL does not exist.');
    return;
  }
  res.redirect(urlExists.longURL);
  // TODO: if the longurl contains Http then do some logic else other logic.
});

app.get('/register', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  let templateVars = { user };
  res.render('register', templateVars);
});

app.get('/login', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  let templateVars = { user };
  res.render('login', templateVars);
});
  
// POSTs below!

// generates a random 6 character string and assigns it to longURL
app.post('/urls', (req, res) => {
  const userID = req.session.user_id;
  if (userID) {
    const shortURL = genRandomString();
    const { longURL } = req.body;
    urlDatabase[shortURL] = {
      longURL,
      userID
    };
    res.redirect(`/urls/${shortURL}`);
  }
});

// checks if user has access to edit the shortURL and directs accordingly
app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.session.user_id;
  const { longURL } = req.body;
  const { shortURL } = req.params;
  if (userID !== urlDatabase[shortURL].userID) {
    res.status(404).send('You do not have access to edit this url.');
    return;
  }
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls`);
});

// deletes shortURL from database if they own the shortURL
app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const userID = req.session.user_id;
  if (userID === urlDatabase[shortURL].userID) {
    delete urlDatabase[shortURL];
  }
  if (userID !== urlDatabase[shortURL].userID) {
    res.send('Unauthorized request.');
    return;
  }
  res.redirect('/urls');
});

// checks password using bcrypt and logs user in if they have an account
app.post('/login', (req, res) => {
  const loginEmail = req.body.loginemail;
  const loginPassword = req.body.loginpassword;
  const userID = getUserByEmail(loginEmail, users);
  const passwordCheck = checkPassword(loginEmail, loginPassword, users);
  if (userID && passwordCheck) {
    req.session.user_id = userID;
    res.redirect('/urls');
  } else {
    res.status(403).send('Invalid email or password combination.');
  }
});

app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect("/urls");
});

// registers a new user and hashes their password
app.post('/register', (req, res) => {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send('An email or password needs to be entered.');
    return;
  } else if (getUserByEmail(email, users)) {
    res.status(400).send('Email is already in use.');
    return;
  } else {
    const userID = genRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: bcrypt.hashSync(password, 10) // TODO: change bcrypt to async!!!
    };
    req.session.user_id = userID;
    res.redirect('/urls');
  }
});

// implemented helper functions below

const isUsersLink = (id) => {
  let result = {};
  for (let obj in urlDatabase) {
    if (urlDatabase[obj].userID === id) {
      result[obj] = {
        shortURL: obj,
        longURL: urlDatabase[obj].longURL,
      };
      
    }
  }
  return result;
};

const checkPassword = (loginemail, loginpassword, objectDB) => {
  for (let user in objectDB) {
    if (objectDB[user].email === loginemail && bcrypt.compareSync(loginpassword, objectDB[user].password)) { // TODO: change bcrypt to async!!!
      return true;
    }
  }
  return false;
};

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});