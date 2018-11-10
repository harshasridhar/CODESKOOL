mongoose = require('mongoose');
bodyParser=require('body-parser');
var uri="mongodb://localhost:27017/codeskool";
mongoose.connect(uri,{ useNewUrlParser: true },function(err){
  if(err)
    throw err;
  else
    console.log("Connected to db");
});
var fs = require('fs');
var user = require('../models/user');
var problem = require('../models/problem');
var problemCategory = require('../models/problemCategory');
var urlencodedParser = bodyParser.urlencoded({extended: true});
const {c, cpp, node, python, java} = require('compile-run');
var Promise = require('bluebird');
var cmd = require('node-cmd');
const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd })
module.exports=function(app){
  app.get('/',function(req,res){
    var query=problemCategory.find({});
    query.exec(function(err,tags){
      if(err) throw err;
      else{
        res.render('login',{"data":{"tags":tags}});
      }
    });
  });
  app.get('/login',function(req,res){
    var query=problemCategory.find({});
    query.exec(function(err,tags){
      if(err) throw err;
      else{
        res.render('login',{"data":{"tags":tags}});
      }
    });
  });
  app.post('/check',urlencodedParser,function(req,res){
    tags=[];
    reqtags=req.body.tags;
    for(var i=0;i<reqtags.length;i++){
      tags.push({"tags":reqtags[i]});
    }
    problem.find({ $or : tags },function(err,docs){
      var query=problemCategory.find({});
      query.exec(function(err,disptags){
        if(err) throw err;
        else
          res.render('practice',{"docs": docs,"tags": reqtags,"disptags":disptags});
      });
    });
  });
  app.get('/profile',function(req,res){
    user.findById(req.session.userId).exec(function(err,user){
        if(err) throw err;
        else{
          if(user == null){
            res.redirect('/');
          }
          else{
            res.render("dashboard",{"username" : user.userName});
          }
        }
    });
  });
  app.get('/logout', function(req, res) {
    req.session.userId = null;
    res.redirect('/');
  });
  app.get('/practice',function(req,res){
    problem.find({},function(err,docs){
      var query=problemCategory.find({});
      query.exec(function(err,disptags){
      if(err) throw err;
      else{
        res.render('practice',{"docs": docs,"tags": [],"disptags":disptags});
      }
      });
    });
  });
  
  
  app.get('/addProblem',function(req,res) {
    var query=problemCategory.find({});
    query.exec(function(err,tags){
      if(err) throw err;
      else
      res.render('addProblem',{"data":{"tags":tags}});
    });
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
    var query=problemCategory.find({});
    query.exec(function(err,tags){
      if(err) throw err;
      else{
        var prob =new problem(p).save(function(err,pr){
          if(err) throw err;
          res.render('addProblem',{"data":{"tags":tags,"status":'success',"msg" :'Problem added successfully'}});
          // res.json(p);
        });
      }
    });
  });
  app.get('/myAccount',function(req,res){
    user.findById(req.session.userId).exec(function(err,user){
      if(err) throw err;
      else{
        if(user == null){
          res.redirect('/');
        }
        else{
          res.render("myAccount",{"username" : user.userName,"email":user.email,"preferences":user.preferences});
        }
      }
  });
    // res.render('myAccount');
  });
  app.get('/addTag',function(req,res){
    res.render('addTag',{"data":{}})
  });
  app.post('/addTag',urlencodedParser,function(req,res){
      var cat = {
        category : req.body.tag
      };
      var query=problemCategory.find({});
      query.where('category',cat.category);
      query.exec(function(err,tags){
        if(err) throw err;
        else{
          console.log(tags);
          if(tags.length !=0 ){
            res.render('addTag',{"data":{"status":"failed","msg":"Tag already exists!!"}});
          }
          else{
            var probCat =new problemCategory(cat).save(function(err,pr){
              if(err) throw err;
              res.render('addTag',{"data":{"status":'success',"msg" :'Tag added successfully'}});
            });
          }
        }
      });
    });
    app.get('/solve',function(req,res){
      res.render('solve');
    });
    app.post('/solve',urlencodedParser,function(req,res){
      problem.findById(req.body.id).exec(function(err,docs){
        if(err) throw err;
        res.render('solve',{"docs":docs,"code":'',"input":'',"output":'',"lang":'',"stderr":''});
      });
    });
    app.post('/compile',urlencodedParser,function(req,res){
      if(req.body.language == 'C'){
        fs.writeFile('main.c',req.body.code,(err) => {
          if (err) throw err;
          console.log('The code file has been saved!');
        });
        c.runFile('main.c',{stdin : req.body.input},(err, result) => {
          if(err){
              console.log(err);
          }
          else{
            console.log(req.body.doc_id);
            problem.findById(req.body.doc_id).exec(function(err,docs){
              if(err) throw err;
              console.log(docs);
              getAsync('del main.c input.txt error.txt').then(data => {
                console.log('File deleted', data)
              }).catch(err => {
                console.log('cmd err', err)
              });
              res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr})
              // res.send("<pre>"+result.stdout+"</pre>")
              console.log(result);
          });
        }
      });
      }
      else if(req.body.language == 'C++'){
        fs.writeFile('main.cpp',req.body.code,(err) => {
          if (err) throw err;
          console.log('The code file has been saved!');
        });
        cpp.runFile('main.cpp',{stdin : req.body.input},(err, result) => {
          if(err){
              console.log(err);
          }
          else{
            problem.findById(req.body.doc_id).exec(function(err,docs){
              if(err) throw err;
              getAsync('del main.cpp input.txt error.txt').then(data => {
                console.log('File deleted', data)
              }).catch(err => {
                console.log('cmd err', err)
              });
              res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr})
              // res.send("<pre>"+result.stdout+"</pre>")
              console.log(result);
          });
        }
      });
      }
      else if(req.body.language == 'Python3'){
        fs.writeFile('main.py',req.body.code,(err)=>{
          if(err) throw err;
          console.log("The code file has been saved!");
        });
        python.runFile('main.py',{stdin : req.body.input},(err,result)=>{
          if(err){
              console.log(err);
          }
          else{
            problem.findById(req.body.doc_id).exec(function(err,docs){
              if(err) throw err;
              getAsync('del main.py input.txt error.txt').then(data => {
                console.log('File deleted', data)
              }).catch(err => {
                console.log('cmd err', err)
              });
              res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr})
              // res.send("<pre>"+result.stdout+"</pre>")
              console.log(result);
            });
          }
        });
      }  
      else if(req.body.language == 'Java'){
        fs.writeFile('Main.java',req.body.code,(err)=>{
          if(err) throw err;
          console.log("The code file has been saved!");
        });
        java.runFile('Main.java',{stdin : req.body.input},(err,result)=>{
          if(err){
              // fs.writeFile('error.txt',err);
              console.log('Error here');
              console.log(err);
          }
          else{
            problem.findById(req.body.doc_id).exec(function(err,docs){
              if(err) throw err;
              getAsync('del Main.java').then(data => {
                console.log('File deleted', data)
              }).catch(err => {
                console.log('cmd err', err)
              });
              res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr})
              // res.send("<pre>"+result.stdout+"</pre>")
              console.log(result);
            });
          }
        });
      }
    });
};