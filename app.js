// TODO - Create a Login Page (User Registration)

const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const appTools = require("./tinyAppTools");

const app = express();
const PORT = 3080;

app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieParser())
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "test": {
    id: "test",
    email: "user@farts.com",
    password: "!u@fdc"
  }
}

///////////////////////////////////////////////////////////////////////////////////////////////////
// Routes
///////////////////////////////////////////////////////////////////////////////////////////////////

////////////////////
// GET
////////////////////
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls", (req, res) => {
  const user_id = req.cookies['user_id'];
  let templateVars = {
    urls: urlDatabase,
    user: users[user_id]
  }
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const user_id = req.cookies['user_id'];
  let templateVars = {
    user: users[user_id]
  }
  res.render("urls_new", templateVars)
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.cookies['user_id'];
  let templateVars = {
    short: req.params.shortURL,
    long: urlDatabase[req.params.shortURL],
    fullTiny: `http://${req.hostname}/u/${req.params.shortURL}`,
    user: users[user_id]
  };
  res.render("urls_show", templateVars)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})

app.get("/register", (req, res) => {
  res.render("_register")
})

////////////////////
// POST
////////////////////

app.post("/urls", (req,res) => {
  let short = appTools.generateUniqueId(urlDatabase,6);
  urlDatabase[short] = req.body.longURL;
  res.redirect(`/urls/${short}`)
})

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
})

app.post("/urls/:shortURL", (req,res) => {
  const re = ('^http[s]?://');
  let long = req.body.longURL;
  long = (long.search(re) > -1 ? long : `http://${long}`)
  urlDatabase[req.params.shortURL] = long;
  res.redirect('/urls')
})

app.post("/login", (req, res) => {
  res.cookie("username", req.body.username);
  res.redirect('/urls');
})

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
})

app.post("/register", (req, res) => {
  if (!req.body.email || !req.body.password || appTools.propertyIsTaken("email", users, req.body.email)){
    res.sendStatus(400);
  }
  const id = appTools.generateUniqueId(users, 8)
  users[id] = {
    id: id,
    email: req.body.email,
    password: req.body.password
  }
  res.cookie("user_id", id);
  res.redirect("/urls");
 
})

///////////////////////////////////////////////////////////////////////////////////////////////////
// Listen
///////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});