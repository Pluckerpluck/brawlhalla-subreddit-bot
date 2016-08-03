var express = require('express')
  , app = express()
  , passport = require('passport')
  , session = require('express-session')
  , util = require('util')
  , crypto = require('crypto')
  , bodyParser = require('body-parser')
  , RedditStrategy = require('passport-reddit').Strategy;

var users = require("./users").init("mongodb://mongo/brawlhalla");

passport.serializeUser(function(user, done) {
  done(null, user.redditID);
});

passport.deserializeUser(function(id, done) {
  users.find(id, done);
});

if (process.env.REDDIT_CLIENT_SECRET == null) {
  console.log("Client secret not set")
  process.exit(1);
}

passport.use(new RedditStrategy({
    clientID: "-4bBw1MsxBORHA",
    clientSecret: process.env.REDDIT_CLIENT_SECRET,
    callbackURL: "http://server.gillespie.solutions/auth/callback"
  },
  function(accessToken, refreshToken, profile, done) {
    console.log('Login by: ' + profile.name + " (" + profile.id + ")");
    var user = users.findOrCreate(profile, done);
  }
));

app.set('views', __dirname + '/views')
app.set('view engine', 'jade')

app.use(session({
  secret: 'iAmBrawlhalla',
  resave: false,
  saveUninitialized: true
}));

app.use(bodyParser.urlencoded({
    extended: true
}));


app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(__dirname + '/public'))

app.get('/auth', function(req, res, next){
  req.session.state = crypto.randomBytes(32).toString('hex');
  passport.authenticate('reddit', {
    state: req.session.state,
    duration: 'temporary',
  })(req, res, next);
});

app.get('/auth/callback', function(req, res, next){
  // Check for origin via state token
  if (req.query.state == req.session.state){
    passport.authenticate('reddit', {
      successRedirect: '/',
      failureRedirect: '/login'
    })(req, res, next);
  }
  else {
    next( new Error(403) );
  }
});


app.get('/', function (req, res) {
  var name = "Guest",
      loggedIn = false;

  if (req.isAuthenticated()){
    name = req.user.name;
    loggedIn = true;
  }

  res.render('index',
    { title : 'Home',
      name  : name,
      loggedIn: loggedIn
    }
  )
});


app.get('/tournament', function (req, res) {
  if (!req.isAuthenticated()){
     res.redirect('/');
     return;
  }

  res.render('tournamentSubmit',
    { title : 'Tournament Request'
    }
  )
});


app.post('/tournament/request', function(req, res) {
  if (req.isAuthenticated()){
    console.log(util.inspect(req.body, {showHidden: false, depth: null}));
    res.redirect('/tournament/success');
  } else {
    res.redirect('/');
  }
});



app.listen(8080, function () {
  console.log('Started listening on port 8080!');
});
