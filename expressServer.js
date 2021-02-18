const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { genRandomString } = require('./helpers'); 
// import "bootswatch/dist/solar/bootstrap.min.css";
// TODO: Note: Replace ^[theme]^ (examples: darkly, slate, cosmo, spacelab, and superhero. See https://bootswatch.com/ for current theme names.)

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));

app.use(cookieParser());

const PORT = 8080;

// test data below!

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
  res.send('/register');
});

app.get('/urls', (req, res) => {
  const templateVars = {
     urls: urlDatabase,
     user: user[req.cookies.userID] 
    }
  res.render('urlsIndex', templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: users[req.cookies.userID]
  }
  res.render("urlsNew", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urlsShow", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL];
    res.redirect(longURL);
  } else {
    // TODO: change to proper status code later
    res.redirect('https://http.cat/404');
  }
});

app.get('/register', (req, res) => {
  const templateVars = {
    urls: urlDatabase,
    user: users[req.cookies.userID]
  };
  res.render('register', templateVars);
});
  
// POSTs below!

app.post('/urls', (req, res) => {
  const shortURL = genRandomString();
  const { longURL } = req.body;
  urlDatabase[shortURL] = longURL;
  res.redirect('/urls/' + String(shortURL));
});

app.post('/urls/:shortURL/delete', (req, res) => {
  const { shortURL } = req.params;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

app.post('/urls/:shortURL/edit', (req, res) => {
  const shortURL = req.params.shortURL;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect('/urls');
});

app.post('/login', (req, res) => {
  const { userID } = req.body;
  res.cookie('userID', userID);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
})

app.post("/register", function (req, res) {
  const { email, password } = req.body;
    const userID = genRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: password
    };
    // req.session.user_id = userID;
    console.log(users);
    res.cookie("userID", userID);
    res.redirect("/urls");
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});