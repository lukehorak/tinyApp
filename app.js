const express = require("express");
const bodyParser = require("body-parser");
const appTools = require("./tinyAppTools");

const app = express();
const PORT = 3080;

app.use(bodyParser.urlencoded({extended:true}));
app.set("view engine", "ejs");

let urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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
  let templateVars = { urls: urlDatabase}
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new")
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { short: req.params.shortURL, long: urlDatabase[req.params.shortURL], fullTiny: `http://${req.hostname}/u/${req.params.shortURL}`};
  res.render("urls_show", templateVars)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
})


////////////////////
// POST
////////////////////

app.post("/urls", (req,res) => {
  let short = appTools.generateRandomString(6);
  urlDatabase[short] = req.body.longURL;
  console.log(urlDatabase);
  res.redirect(`/urls/${short}`)
})

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls')
})

app.post("/urls/:shortURL", (req,res) => {
  const re = ('^http[s]?://');
  let long = req.body.longURL;
  long = (long.search(re) > -1 ? long : `https://${long}`)
  urlDatabase[req.params.shortURL] = long;
  res.redirect(`/urls/${req.params.shortURL}`)
})

///////////////////////////////////////////////////////////////////////////////////////////////////
// Listen
///////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});