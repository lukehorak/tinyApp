const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session")
const dotenv = require('dotenv');
const bcrypt = require("bcrypt");
const appTools = require("./tinyAppTools");
const methodOverride = require("method-override");

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

app.use(methodOverride('_method'))
app.use(bodyParser.urlencoded({extended:true}));
app.use(cookieSession({
  name: 'session',
  keys: [process.env.COOKIESALT],
  maxAge: 24 * 60 * 60 * 1000
}))
app.set("view engine", "ejs");
app.use(express.static('public'));

const urlDatabase = {
  "b2xVn2": {longURL: "http://www.lighthouselabs.ca", userID: "v4b3", visitors: [], clicks: []},
  "9sm5xK": {longURL: "http://www.google.com", userID: "v4b3", visitors: [], clicks: []}
};

const allVisitors = {};

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
  users[user_id] ? res.render("urls_new", templateVars) : res.render("register", {error: "You must have an account to register a URL. Sign up today!"});
});

app.get("/urls/:shortURL", (req, res) => {
  const user_id = req.session.user_id;
  const short = req.params.shortURL;
  const urlObj = urlDatabase[short];
  const validURL = (user_id === urlObj.userID)
  let templateVars = {
    short: short,
    long: urlDatabase[short].longURL,
    hostURL: `http://${req.hostname}/u/`,
    user: users[user_id],
    valid: validURL,
    clicks: urlDatabase[short].clicks,
    uniqueVisits: urlDatabase[short].visitors.length
  };
  res.render("urls_show", templateVars)
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  // if shortURL undefined, throw 404
  const longURL = urlDatabase[short].longURL;
  // Set visitorID va, generating cookie first if needed
  if (!req.session.visitor_id){
    req.session.visitor_id = appTools.generateUniqueId(allVisitors, 8);
  }
  // TODO - helper function?
  let visitorID = req.session.visitor_id;
  // Check if visitor exists, if not create an ID and record it
  if (!allVisitors[visitorID]){
    allVisitors[visitorID] = { id: visitorID }
  }
  if (!urlDatabase[short].visitors.includes(visitorID)){
    urlDatabase[short].visitors.push(visitorID)
  }
  urlDatabase[short].clicks.push({visitor: visitorID, timestamp: new Date()});
  res.redirect(longURL);
})

app.get("/register", (req, res) => {
  const templateVars = { error: undefined }
  res.render("register", templateVars)
})

app.get("/login", (req, res) => {
  const templateVars = { error: undefined }
  res.render("login", templateVars)
})

////////////////////
// POST
////////////////////

app.post("/urls", (req,res) => {
  const short = appTools.generateUniqueId(urlDatabase,6);
  const long = appTools.confirmHTTPS(req.body.longURL);
  urlDatabase[short] = { longURL: long, userID: req.session.user_id, visitors: [], clicks: [] };
  res.redirect(`/urls/${short}`)
})

app.post("/login", (req, res) => {
  const{ email, password } = req.body;
  const userId = appTools.propertyTakenBy("email", users, email);
  //console.log("email: ", email);
  if(!userId || !bcrypt.compareSync(password, users[userId].password)){
    res.status(403).render("login", {error: "Invalid username or password, please try again!"});
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
  if (!email || !password){
    const errorMessage = appTools.errorMessageBuilder(email, password);
    res.status(400).render("register", { error:errorMessage});
  }
  else if (appTools.propertyTakenBy("email", users, email)){
    res.status(400).render("register", { error: "That email is already associated with an account. Try another one!" });
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

////////////////////
// PUT
////////////////////

app.put("/urls/:shortURL", (req,res) => {
  const short = req.params.shortURL;
  if(!appTools.getResource(urlDatabase, short)){
    res.statusMessage = `Resource ${short} does not exist!`;
    res.sendStatus(400)
  }
  if (appTools.validateUser(req, urlDatabase)){
    const long = appTools.confirmHTTPS(req.body.longURL)
    urlDatabase[short] = { longURL: long, userID: req.session.user_id, visitors: [], clicks: []}
    res.redirect('/')
  }
  res.sendStatus(401)
})

////////////////////
// DELETE
////////////////////

app.delete("/urls/:shortURL", (req, res) => {
  const short = req.params.shortURL;
  if(!appTools.getResource(urlDatabase, short)){
    res.statusMessage = `Resource ${short} does not exist!`;
    res.sendStatus(400)
  }
  if (appTools.validateUser(req, urlDatabase)){
    delete urlDatabase[short];
    res.redirect('/')
  }
  res.sendStatus(401);
})

///////////////////////////////////////////////////////////////////////////////////////////////////
// Listen
///////////////////////////////////////////////////////////////////////////////////////////////////
app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});