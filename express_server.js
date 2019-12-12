const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended :true}));

var cookieParser = require('cookie-parser')

app.use(cookieParser())
app.set("view engine","ejs");


function generateRandomString(outputLength) {
  let result = '';
  let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for (let i = 0; i < outputLength; i ++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
}




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
}


function userExistByEmail(email) {
  
  for (key of Object.keys(users)){
      if (users[key].email === email){
          return users[key].id
      }    

    }
    return false
  }
 
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
})

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// new route submission form :
app.get("/urls/new", (req,res)=>{ 
  let templateVars =  {
    userobj: users[req.cookies["use_id"]]};
  res.render("urls_new",templateVars);
})
// the form in the urls/new generates new short code and store in databaseURL
// and sends the browser to the website typed in the form 
app.post("/urls" ,(req,res) => {
  longURL = req.body.longURL;
  if(longURL.indexOf("http") == 0 ) {
      longURL = req.body.longURL;
  } else {   
      longURL = "http://" + req.body.longURL;
  }
  if (!Object.values(urlDatabase).includes(longURL)) {
    shortURL = generateRandomString(6); 
    urlDatabase[shortURL] = longURL;
  }
res.redirect(longURL);
    
})


// list out all the urls ------------------------
app.get("/urls", (req, res) => {
  let templateVars =  {
    userobj: users[req.cookies["user_id"]],
    urls: urlDatabase};
    console.log(templateVars);
  res.render("urls_index", templateVars);

  // res.render("urls_index", urlDatabase);
});

app.post("/urls/:shortURL/delete", (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
})

app.post("/urls/:shortURL/update", (req,res) => {
  longURL = req.body.editURL;
  urlDatabase[req.params.shortURL] = longURL;
  res.redirect("/urls");
})


app.post("/urls/:shortURL/edit", (req, res) => {
  let shortUrl = req.params.shortURL
  console.log('Edit: ', req.params.shortURL);
  res.redirect(`/urls/${shortUrl}`);
})

app.post("/login", (req,res)=>{
  email = req.body.email;
  password = req.body.password;
  id = userExistByEmail(email);
  if (!id) {
    res.send("403 Error : User email is not registered")

  } else {
    if (users[id].password === password){
      res.cookie("user_id",id)
      res.redirect('/urls')
    } else {
      res.send("403 Error : wrong password")
      }
  }
   
})

app.get("/login", (req, res) => {
  let templateVars =  {
    userobj: users[req.cookies["user_id"]]};
  res.render("url_login",templateVars);
  // res.render("urls_index", urlDatabase);
});


app.post("/logout", (req,res)=>{
  res.clearCookie("user_id");
  res.redirect('/urls')
})

// Show the URL information ------------------------
app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {shortURL: req.params.shortURL,
                      longURL: urlDatabase[req.params.shortURL],
                      userobj: users[req.cookies["use_id"]]};
  res.render("urls_show", templateVars);
  // res.render("urls_index", urlDatabase);
});

// redirect to short URL in u/shortURL
app.get("/u/:shortURL", (req, res) => {
  longURL= urlDatabase[req.params.shortURL];
  res.redirect(longURL);
  // res.render("urls_index", urlDatabase);
});

app.get("/register", (req, res) => {
  let templateVars =  {
    userobj: users[req.cookies["user_id"]]};
  res.render("urls_register",templateVars);
  // res.render("urls_index", urlDatabase);
});


app.post("/register", (req,res)=>{
  email = req.body.email;
  password = req.body.password;
  id = generateRandomString(10);
  
  id = userExistByEmail(email);
  if (!id) {
    res.send("400 Error : User email is already registered")

  } else if (email ==="" || password ==="") {
    res.send("400 Error : Email or Password is empty")
  } else {  
    userobj = {id : id,
              email : email,
              password : password};
    users[id] = userobj;
      res.cookie("user_id",id)
      res.redirect('/urls')
  } 
})
