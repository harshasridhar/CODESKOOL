var express = require('express')
var session = require('express-session');
var mainController=require('./controllers/main.js');
var app = express();
app.set('view engine','ejs');
app.use('/assets',express.static('assets'));
app.use('/scripts',express.static('scripts'));
app.set('trust proxy', 1) // trust first proxy
// app.use(session({
//   secret: 'keyboard cat',
//   resave: false,
//   saveUninitialized: true,
//   cookie: { secure: true }
// }));
var noacache = require('nocache');
app.use(noacache());
app.use(session({secret: 'your secret'}));
// var cookieParser = require('cookie-parser')
// app.use(cookieParser);
mainController(app);

app.listen(3000,function(){
  console.log('Listening to port: '+ 3000);
});
