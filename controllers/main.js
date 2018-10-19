mongoose = require('mongoose');
bodyParser=require('body-parser');
var uri="mongodb://localhost:27017/codeskool";
mongoose.connect(uri,{ useNewUrlParser: true },function(err){
  if(err)
    throw err;
  else
    console.log("Connected to db");
});
var user = require('../models/user');
var problem = require('../models/problem');
var urlencodedParser = bodyParser.urlencoded({extended: true});
module.exports=function(app){
  app.get('/',function(req,res){
    res.render('login',{"data":{}});
  });
  app.get('/login',function(req,res){
    res.render('login',{"data":{}});
  });
  app.get('/profile',function(req,res){
    user.findById(req.session.userId).exec(function(err,user){
        if(err) throw err;
        else{
          if(user == null){
            res.send('Not Authorized, go back bro!!!');
          }
          else{
            //to be replaced with a view
            res.send("<a href='/logout'>Logout</a><br><h1>Name:</h1>"+user.userName+"<h2>Email:</h2>"+user.email);
          }
        }
    });
  });
  app.get('/logout',function(req,res){
    req.session.destroy(function(err) {
      if(err) {
        console.log(err);
      } else {
        res.redirect('/');
      }
    });
  });
  app.get('/addProblem',function(req,res) {
    res.render('addProblem',{"data":{}});
  });
  app.post('/login',urlencodedParser,function(req,res){
    if(req.body.loguserName && req.body.logpassword){
      var q=user.findOne({ userName : req.body.loguserName, password : user.hash(req.body.logpassword) },function(err,user){
          if (err) throw err;
          if(user == null)
            res.render('login',{"data":{"status":'failed',"l_msg":"Credentials are incorrect!!"}});
          else{
            var sesh = req.session;
            sesh.userId = user._id;
            res.redirect('/profile');
          }
      });
    }
    if(req.body.userName && req.body.password && req.body.confPassword == req.body.password){
    var query=user.find({});
    query.where('userName',req.body.userName);
    query.exec(function(err,docs){
      if(err) throw err;
      if(docs.length == 0){
        var userData={
          userName : req.body.userName,
          password : user.hash(req.body.password),
          email : req.body.email_id,
          preferences : req.body.preferences
        };
        var u=new user(userData).save(function(err,data){
          if(err) throw err;
          console.log("here 3");
          res.render('login',{"data":{"status":'success',"msg":"User with username "+userData.userName+" added Successfully!"}});
        });
      }
      else {
        console.log("here 4");
        res.render('login',{"data":{"status":'failed',"msg":"Username already exists!"}});
      }
    });
  }
  else if(req.body.userName && req.body.password && req.body.confPassword != req.body.password){
    console.log("here 5");
    res.render('login',{"data":{"status":'failed',"msg":"Passwords do not match!"}});
  }
  });
  app.post('/addProblem',urlencodedParser,function(req,res){
    var p = {
      tags : req.body.tags,
      pstatement : req.body.pstatement,
      constraints : req.body.constraints,
      test_cases : req.body.test_cases,
      inp : req.body.inp,
      out : req.body.out,
    }
    var prob =new problem(p).save(function(err,pr){
      if(err) throw err;
      res.render('addProblem',{"data":{"status":'success',"msg" :'Problem added successfully'}});
      res.json(p);
    });
  });

};
