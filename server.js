const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const cookieSession = require("cookie-session")
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");
const appTools = require("./tinyAppTools");

///////////////////////////////////////////////////////////////////////////////////////////////////
// Configs
///////////////////////////////////////////////////////////////////////////////////////////////////
const app = express();
const PORT = 3080;

// Configure env variables
const dotenvConfig = dotenv.config();
if (dotenvConfig.error){
  throw dotenvConfig.error
}

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIESALT],
  maxAge: 24 * 60 * 60 * 1000
}))
app.set("view engine", "ejs");
app.use(express.static('public'));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "v4b3"},
  "9sm5xK": {longURL: "http://www.google.com", userID: "v4b3"}
};

const users = {
  "v4b3": {
    id: "test",
    email: "user@totallyrealemail.com",
    password: "$2b$10$CwpiZMMvozyMQWRksvPZrOdn.d5mhi/dhjYSbuFbZxx47z7m43dE6"
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////
// GET
////////////////////

app.get("/", (req, res) => {
  const user_id = req.session.user_id;
  const userURLs = appTools.urlsForUser(urlDatabase, user_id)
  let templateVars = {
    urls: userURLs,
    user: users[user_id],
    hostURL: `http://${req.hostname}/u/`
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.session.user_id;
  let templateVars = {
    user: users[user_id]
  }
  users[user_id] ? res.render("urls_new", templateVars) : res.redirect("/login");
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const urlObj = urlDatabase[req.params.shortURL];
  const validURL = (user_id === urlObj.userID)
  let templateVars = {
    short: req.params.shortURL,
    long: urlDatabase[req.params.shortURL].longURL,
    hostURL: `http://${req.hostname}/u/`,
    user: users[user_id],
    valid: validURL
  };
  res.render("urls_show", templateVars)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
})

app.get("/register", (req, res) => {
  res.render("_register")
})

app.get("/login", (req, res) => {
  res.render("_login")
})

////////////////////
// POST
////////////////////

app.post("/urls", (req,res) => {
  const short = appTools.generateUniqueId(urlDatabase,6);
  const long = appTools.confirmHTTPS(req.body.longURL);
  urlDatabase[short] = { longURL: long, userID: req.session.user_id };
  res.redirect(`/urls/${short}`)
})

app.post("/urls/:shortURL/delete", (req,res) => {
  if (appTools.validateUser(req, urlDatabase)){
    delete urlDatabase[req.params.shortURL];
    res.redirect('/')
  }
  res.sendStatus(401);
  
})

app.post("/urls/:shortURL", (req,res) => {
  if (appTools.validateUser(req, urlDatabase)){
    // const re = ('^http[s]?://');
    // let long = req.body.longURL;
    // long = (long.search(re) > -1 ? long : `http://${long}`);
    const long = appTools.confirmHTTPS(req.body.longURL)
    urlDatabase[req.params.shortURL] = { longURL: long, userID: req.session.user_id }
    res.redirect('/')
  }
  res.sendStatus(401)
})

app.post("/login", (req, res) => {
  const{ email, password } = req.body;
  const userId = appTools.propertyTakenBy("email", users, email);
  if(!userId || !bcrypt.compareSync(password, users[userId].password)){
    res.sendStatus(403);
  }
  req.session["user_id"] = userId
  res.redirect('/');
})

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/');
})

app.post("/register", (req, res) => {
  const { email, password } = req.body;
  if (!email || !password || appTools.propertyTakenBy("email", users, email)){
    res.sendStatus(400);
  }
  const id = appTools.generateUniqueId(users, 8)
  users[id] = {
    id: id,
    email: email,
    password: bcrypt.hashSync(password, 10)
  }
  req.session["user_id"] = id;
  res.redirect("/");
 
})

///////////////////////////////////////////////////////////////////////////////////////////////////
// Listen
///////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});