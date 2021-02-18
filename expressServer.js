const express = require('express');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { genRandomString, getUserByEmail, checkPassword } = require('./helpers'); 
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

app.get("/login", (req, res) => {
  const id = req.body.userID;
  const user = id ? users[id] : null;
  let templateVars = { user };
  res.render("login", templateVars);
})
  
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
  const loginEmail = req.body.loginemail;
  const loginPassword = req.body.loginpassword;
  const userID = getUserByEmail(loginEmail, users);
  const passwordCheck = checkPassword(loginEmail, loginPassword, users);
  if (userID && passwordCheck) {
    req.session.user_id = userID;
    res.redirect("/urls");
  } else {
    res.status(403).send("Invalid email or password combination.");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/login");
})

app.post("/register", function (req, res) {
  const { email, password } = req.body;
  if (email === "" || password === "") {
    res.status(400).send("An email or password needs to be entered.")
    return
  } else if (getUserByEmail(email, users)) {
    res.status(400).send("Email is already in use.")
    return
  } else {
    const userID = genRandomString();
    users[userID] = {
      id: userID,
      email: email,
      password: password
    }
    req.session.userID = userID;
    res.redirect("/urls");
  }
});

app.listen(PORT, () => {
  console.log(`Example app is listening on port ${PORT}!`);
});