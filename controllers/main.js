mongoose = require('mongoose');
bodyParser=require('body-parser');
var uri="mongodb://localhost:27017/codeskool";
mongoose.connect(uri,{ useNewUrlParser: true },function(err){
  if(err)
    throw err;
  else
    console.log("Connected to db");
});
var async = require('async');
var fs = require('fs');
var user = require('../models/user');
var problem = require('../models/problem');
var problemCategory = require('../models/problemCategory');
var submission = require('../models/submission');
var urlencodedParser = bodyParser.urlencoded({extended: true});
const {c, cpp, node, python, java} = require('compile-run');
var Promise = require('bluebird');
var cmd = require('node-cmd');
var wait = require('wait-for-stuff');
const getAsync = Promise.promisify(cmd.get, { multiArgs: true, context: cmd });
module.exports=function(app){
  app.get('/',function(req,res){
    res.render('login',{"data":{}});
  });
  app.get('/login',function(req,res){
      res.render('login',{"data":{}});
    
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
          res.render('practice',{"docs": docs,"tags": reqtags,"disptags":disptags,"username":req.session.username});
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
            submission.find({userId: req.session.userId},function(err,subm){
              if(err) throw err;
              if(subm.length == 0)
                res.render("dashboard",{"username" : user.userName,"submissions":[],"categories":[]});
              else{
                problemCategory.find({},function(err,categories){
                  if(err) throw err;
                  res.render("dashboard",{"username" : user.userName,"submissions": subm,"categories":categories});
                })
                
              }
            });
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
        res.render('practice',{"docs": docs,"tags": [],"disptags":disptags,"username":req.session.username});
      }
      });
    });
  });
  
  
  app.get('/addProblem',function(req,res) {
    var query=problemCategory.find({});
    query.exec(function(err,tags){
      if(err) throw err;
      else
      res.render('addProblem',{"data":{"tags":tags},"username":req.session.username});
    });
  });
  app.post('/login',urlencodedParser,function(req,res){
    if(req.body.loguserName && req.body.logpassword){
      var q=user.findOne({ userName : req.body.loguserName, password : user.hash(req.body.logpassword) },function(err,user){
          if (err) throw err;
          if(user == null)
            res.render('login',{"data":{"status":'failed',"l_msg":"Credentials are incorrect!!"},"username":req.body.loguserName});
          else{
            req.session.userId = user._id;
            req.session.username = req.body.loguserName;
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
          email : req.body.email_id
        };
        var u=new user(userData).save(function(err,data){
          if(err) throw err;
          res.render('login',{"data":{"status":'success',"msg":"User with username "+userData.userName+" added Successfully!"}});
        });
      }
      else {
        res.render('login',{"data":{"status":'failed',"msg":"Username already exists!"}});
      }
    });
  }
  else if(req.body.userName && req.body.password && req.body.confPassword != req.body.password){
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
    var q = problem.find({});
    q.where({tags : p.tags, pstatement : p.pstatement });
    q.exec(function(err,problems){
      if(err) throw err;
      else{
        if(problems.length!=0){
          var query=problemCategory.find({});
          query.exec(function(err,tags){
            if(err) throw err;
            res.render('addProblem',{"data":{"tags":tags,"status":'success',"msg" :'Problem already exists'},"username":req.session.username});
          });
        }
        else{
          var query=problemCategory.find({});
          query.exec(function(err,tags){
            if(err) throw err;
            else{
              var prob =new problem(p).save(function(err,pr){
                if(err) throw err;
                var username = req.session.username;
                console.log(username);
                res.render('addProblem',{"data":{"tags":tags,"status":'success',"msg" :'Problem added successfully'},"username":username});
              });
            }
          });
        }
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
          var query = submission.find();
          query.where({userId : req.session.userId});
          query.exec(function(err,submissions){
            if(err) throw err;
            res.render("myAccount",{"username" : user.userName,"email":user.email,"submissions":submissions});
          });
        }
      }
  });
    // res.render('myAccount');
  });
  app.get('/addTag',function(req,res){
    res.render('addTag',{"data":{},"username":req.session.username})
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
            res.render('addTag',{"data":{"status":"failed","msg":"Tag already exists!!"},"username":req.session.username});
          }
          else{
            var probCat =new problemCategory(cat).save(function(err,pr){
              if(err) throw err;
              res.render('addTag',{"data":{"status":'success',"msg" :'Tag added successfully'},"username":req.session.username});
            });
          }
        }
      });
    });
    app.get('/solve',function(req,res){
      res.render('solve',{"username":req.session.username});
    });
    app.post('/solve',urlencodedParser,function(req,res){
      problem.findById(req.body.id).exec(function(err,docs){
        if(err) throw err;
        res.render('solve',{"docs":docs,"code":'',"input":'',"output":'',"lang":'',"stderr":'',"theme":'default',"username":req.session.username,"substat":''});
      });
    });
    app.post('/compile',urlencodedParser,function(req,res){
      if(req.body.sub == 'Compile and Run'){
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
                res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr,"theme":req.body.theme,"username":req.session.username,"substat":''})
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
                res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr,"theme":req.body.theme,"username":req.session.username,"substat":''})
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
                res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr,"theme":req.body.theme,"username":req.session.username,"substat":''})
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
                res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":result.stdout,"lang":req.body.language,"stderr":result.stderr,"theme":req.body.theme,"username":req.session.username,"substat":''})
                // res.send("<pre>"+result.stdout+"</pre>")
                console.log(result);
              });
            }
          });
        }
      }
      if(req.body.sub == 'Submit Code'){
        if(req.body.language == 'C'){
          fs.writeFile('main.c',req.body.code,(err) => {
            if (err) throw err;
            console.log('The code file has been saved!');
          });
          problem.findById(req.body.doc_id).exec(function(err,docs){
            if(err) throw err;
            else{
              var userId = req.session.userId;
              var problemId = req.body.doc_id;
              var language =req.body.language;
              var code = req.body.code;
              var tot_test = docs.test_cases;
              var test_passed = 0;
              var inp = docs.inp;
              var out = docs.out;
              if(tot_test != null){
                var i = 0;
                var count = 0;
                async.forEachOf(inp,(value,callback) =>{
                  var result = wait.for.function(c.runFile,'main.c',{stdin : value});
                  if(result[1].stdout == out[i])
                    test_passed++;
                  i++;
                })
                var s = {
                  userId : userId,
                  problemId : problemId,
                  language : language,
                  code : code,
                  tot_test : tot_test,
                  test_passed : test_passed,
                  points : Math.round((test_passed/tot_test)*10)
                };
                getAsync('del main.c input.txt error.txt').then(data => {
                  console.log('File deleted', data)
                }).catch(err => {
                  console.log('cmd err', err)
                });
                if(s.userId == null){
                  res.send('<h1>Please login to submit!</h1>');
                }
                else {
                    if(test_passed!=0){
                      var query = submission.find({});
                      query.where({userId : s.userId, problemId : s.problemId, code: s.code});
                      query.exec(function(err,subm){
                        if(err) throw err;
                        else{
                          if(subm.length !=0){
                            var resp = "Same code already submitted!!";
                            res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp});
                          }
                          else if(subm.length ==0){
                            var subms = new submission(s).save(function(err,data){
                              if(err) throw err;
                              else{
                                var resp = 'Submitted Succesfully.'+s.test_passed+' test cases passed out of '+s.tot_test+" test cases.Points earned:"+s.points;
                                problem.findById(req.body.doc_id).exec(function(err,docs){
                                  res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                                });
                              }
                            });
                          }
                        }
                      });
                      
                  }
                  else{
                    problem.findById(req.body.doc_id).exec(function(err,docs){
                      var resp = "Zero Test Cases Passed - Code not submitted";
                      res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                    });
                  }
                }
              }
            }
          })
        }
        else if(req.body.language == 'C++'){
          fs.writeFile('main.cpp',req.body.code,(err) => {
            if (err) throw err;
            console.log('The code file has been saved!');
          });
          problem.findById(req.body.doc_id).exec(function(err,docs){
            if(err) throw err;
            else{
              var userId = req.session.userId;
              var problemId = req.body.doc_id;
              var language =req.body.language;
              var code = req.body.code;
              var tot_test = docs.test_cases;
              var test_passed = 0;
              var inp = docs.inp;
              var out = docs.out;
              if(tot_test != null){
                var i = 0;
                var count = 0;
                async.forEachOf(inp,(value,callback) =>{
                  var result = wait.for.function(cpp.runFile,'main.cpp',{stdin : value});
                  if(result[1].stdout == out[i])
                    test_passed++;
                  i++;
                })
                var s = {
                  userId : userId,
                  problemId : problemId,
                  language : language,
                  code : code,
                  tot_test : tot_test,
                  test_passed : test_passed,
                  points : Math.round((test_passed/tot_test)*10)
                };
                getAsync('del main.cpp input.txt error.txt').then(data => {
                  console.log('File deleted', data)
                }).catch(err => {
                  console.log('cmd err', err)
                });
                if(s.userId == null){
                  res.send('<h1>Please login to submit!</h1>');
                }
                else {
                    if(test_passed!=0){
                      var query = submission.find({});
                      query.where({userId : s.userId, problemId : s.problemId, code: s.code});
                      query.exec(function(err,subm){
                        if(err) throw err;
                        else{
                          if(subm.length !=0){
                            var resp = "Same code already submitted!!";
                            res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp});
                          }
                          else if(subm.length ==0){
                            var subms = new submission(s).save(function(err,data){
                              if(err) throw err;
                              else{
                                var resp = 'Submitted Succesfully.'+s.test_passed+' test cases passed out of '+s.tot_test+" test cases.Points earned:"+s.points;
                                problem.findById(req.body.doc_id).exec(function(err,docs){
                                  res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                                });
                              }
                            });
                          }
                        }
                      });
                      
                  }
                  else{
                    problem.findById(req.body.doc_id).exec(function(err,docs){
                      var resp = "Zero Test Cases Passed - Code not submitted";
                      res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                    });
                  }
                }
              }
            }
          })
        }
        else if(req.body.language == 'Java'){
          fs.writeFile('main.java',req.body.code,(err) => {
            if (err) throw err;
            console.log('The code file has been saved!');
          });
          problem.findById(req.body.doc_id).exec(function(err,docs){
            if(err) throw err;
            else{
              var userId = req.session.userId;
              var problemId = req.body.doc_id;
              var language =req.body.language;
              var code = req.body.code;
              var tot_test = docs.test_cases;
              var test_passed = 0;
              var inp = docs.inp;
              var out = docs.out;
              if(tot_test != null){
                var i = 0;
                var count = 0;
                async.forEachOf(inp,(value,callback) =>{
                  var result = wait.for.function(java.runFile,'main.java',{stdin : value});
                  if(result[1].stdout == out[i])
                    test_passed++;
                  i++;
                })
                var s = {
                  userId : userId,
                  problemId : problemId,
                  language : language,
                  code : code,
                  tot_test : tot_test,
                  test_passed : test_passed,
                  points : Math.round((test_passed/tot_test)*10)
                };
                getAsync('del main.java input.txt error.txt').then(data => {
                  console.log('File deleted', data)
                }).catch(err => {
                  console.log('cmd err', err)
                });
                if(s.userId == null){
                  res.send('<h1>Please login to submit!</h1>');
                }
                else {
                    if(test_passed!=0){
                      var query = submission.find({});
                      query.where({userId : s.userId, problemId : s.problemId, code: s.code});
                      query.exec(function(err,subm){
                        if(err) throw err;
                        else{
                          if(subm.length !=0){
                            var resp = "Same code already submitted!!";
                            res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp});
                          }
                          else if(subm.length ==0){
                            var subms = new submission(s).save(function(err,data){
                              if(err) throw err;
                              else{
                                var resp = 'Submitted Succesfully.'+s.test_passed+' test cases passed out of '+s.tot_test+" test cases.Points earned:"+s.points;
                                problem.findById(req.body.doc_id).exec(function(err,docs){
                                  res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                                });
                              }
                            });
                          }
                        }
                      });
                      
                  }
                  else{
                    problem.findById(req.body.doc_id).exec(function(err,docs){
                      var resp = "Zero Test Cases Passed - Code not submitted";
                      res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                    });
                  }
                }
              }
            }
          })
        }
        else if(req.body.language == 'Python3'){
          fs.writeFile('main.py',req.body.code,(err) => {
            if (err) throw err;
            console.log('The code file has been saved!');
          });
          problem.findById(req.body.doc_id).exec(function(err,docs){
            if(err) throw err;
            else{
              var userId = req.session.userId;
              var problemId = req.body.doc_id;
              var language =req.body.language;
              var code = req.body.code;
              var tot_test = docs.test_cases;
              var test_passed = 0;
              var inp = docs.inp;
              var out = docs.out;
              if(tot_test != null){
                var i = 0;
                var count = 0;
                async.forEachOf(inp,(value,callback) =>{
                  var result = wait.for.function(python.runFile,'main.py',{stdin : value});
                  if(result[1].stdout == out[i])
                    test_passed++;
                  i++;
                })
                var s = {
                  userId : userId,
                  problemId : problemId,
                  language : language,
                  code : code,
                  tot_test : tot_test,
                  test_passed : test_passed,
                  points : Math.round((test_passed/tot_test)*10)
                };
                getAsync('del main.py input.txt error.txt').then(data => {
                  console.log('File deleted', data)
                }).catch(err => {
                  console.log('cmd err', err)
                });
                if(s.userId == null){
                  res.send('<h1>Please login to submit!</h1>');
                }
                else {
                    if(test_passed!=0){
                      var query = submission.find({});
                      query.where({userId : s.userId, problemId : s.problemId, code: s.code});
                      query.exec(function(err,subm){
                        if(err) throw err;
                        else{
                          if(subm.length !=0){
                            var resp = "Same code already submitted!!";
                            res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp});
                          }
                          else if(subm.length ==0){
                            var subms = new submission(s).save(function(err,data){
                              if(err) throw err;
                              else{
                                var resp = 'Submitted Succesfully.'+s.test_passed+' test cases passed out of '+s.tot_test+" test cases.Points earned:"+s.points;
                                problem.findById(req.body.doc_id).exec(function(err,docs){
                                  res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                                });
                              }
                            });
                          }
                        }
                      });
                      
                  }
                  else{
                    problem.findById(req.body.doc_id).exec(function(err,docs){
                      var resp = "Zero Test Cases Passed - Code not submitted";
                      res.render('solve',{"docs":docs,"code":req.body.code,"input":req.body.input,"output":req.body.output,"lang":req.body.language,"stderr":req.body.output,"theme":req.body.theme,"username":req.session.username,"substat":resp})
                    });
                  }
                }
              }
            }
          })
        }

      }
    });
};