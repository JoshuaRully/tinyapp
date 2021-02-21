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
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" }
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

// GETs below!

app.get('/', (req, res) => {
  res.redirect('/register');
});

app.get('/urls', (req, res) => {
  const id = req.session.user_id;
  const user = id ? users[id] : null;
  if (user) {
    let templateVars = { urls: isUsersLink(id), user };
    res.render("urlsIndex", templateVars);
  } else {
    res.status(403).send("Please login or register first.");
  }
});

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
  if (user && urlDatabase[shortURL]) {
    let templateVars = { shortURL, longURL: urlDatabase[shortURL].longURL, user };
    res.render('urlsShow', templateVars);
  } else {
    res.send('Requested page was not found');
  }
});

app.get('/u/:shortURL', (req, res) => {
  const { shortURL } = req.params;
  const longURL = urlDatabase[shortURL].longURL;
  // TODO: if the longurl contains Http then do some logic else other logic.
  res.redirect(longURL);
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

app.post('/urls', (req, res) => {
  const shortURL = genRandomString();
  const { longURL } = req.body;
  const userID = req.session.user_id;
  urlDatabase[shortURL] = {
    longURL,
    userID
  };
  res.redirect(`/urls/${shortURL}`);
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const userID = req.session.user_id;
  const { longURL } = req.body;
  const { shortURL } = req.params;
  if (userID !== urlDatabase[shortURL].userID) {
    res.status(404).send('You do not have access to edit this link');
    return;
  }
  urlDatabase[shortURL] = { longURL, userID };
  res.redirect(`/urls`);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  const userID = req.session.user_id;
  if (userID) {
    delete urlDatabase[shortURL];
  } else {
    res.send('Unauthorized request');
  }
  res.redirect('/urls');
});

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
    res.redirect('/login');
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