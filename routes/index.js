var crypto = require('crypto'),
    fs = require('fs'),
    User = require('../models/user.js'),
    Manager = require('../models/manager.js'),
    ValidCode = require('../models/validCode.js'),
    sendMail=require('../models/mail'),
    async = require("async"),
    Post = require('../models/post.js'),
    Video = require('../models/video.js'),
    Home = require('../models/home.js');

var express = require('express');
var router = express.Router();

/*首页数据接口*/
router.get('/',function(req,res){
  Post.get(null, function (err, posts) {
    if (err) {
      posts = [];
    }
    res.json(posts);
  });
});

/*验证码字符串接口*/
router.get('/ValidCode_value', function (req, res) {

  /*这段代码起微秒级耗时作用，使验证
   码图片和字符串接口同时被客户端访
   问时，先返回其图片然后即时返回其
   字符值，确保验证码图片和字符串匹配*/
  Post.get(null, function (err, posts) {
    if (err) {
      posts = [];
    }
    /*即时返回验证码字符串值*/
    res.json(ValidCode.value);
  });
});

/*验证码图片接口*/
router.get("/reg/validCode/*",function(req,res){
  /* 验证码生成效率测试
   var start = new Date().getTime();
   var i = 0;
   while((new Date().getTime() - start) < 1000){
   var images= ValidCode.makeValidImg();
   i++;
   }
   console.log("1秒钟生成：" + i);*/
  var img =ValidCode.makeValidImg();
  res.setHeader('Content-Type', 'image/bmp');
  res.end(img);//产生验证码用时xxx微秒，最后返回验证码图片
});

/*检查用户名是否已被注册*/
router.post('/reg/validName', function (req, res) {
  var name = req.body.name;
  console.log(""+name);
  //检查用户名是否已经存在
  User.get_name(name, function (err, user) {

    if (err) {
      err="user查找失败";
      console.log(err);
    }
    if (user) {
      console.log(user)
      return res.json(user);
    }
    //如果不存在则返回用户
    user={name:""};
    res.json(user);
  });
});

/*检查邮箱是否已被注册*/
router.post('/reg/validEmail', function (req, res) {
  var email = req.body.email;
  console.log(""+email);
  //检查用户名是否已经存在
  User.get_email(email, function (err, user) {

    if (err) {
      err="邮箱查找失败";
      console.log(err);
    }
    if (user) {
      return res.json(user);
    }
    //如果不存在则返回用户
    user={email:""};
    res.json(user);
  });
});

/*注册提交数据处理接口*/
router.post('/reg', function (req, res) {
  var name = req.body.name,
      email=req.body.email,
  //生成密码的 md5 值
      md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  console.log(email+""+name+""+password);
  var date=new Date();
  var current=date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
      date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());

  var type1=name+'-我的日志';
  var type2=name+'-我的文章';
  var photoBooks=JSON.stringify([{name:'我的相册',photos:[],time:current}]);
  var newUser = new User({
    name: name,
    password: password,
    email:email,
    active: false,
    headImg:'images/headDefault.png',
    postTypes:[type1,type2],
    photoBooks:photoBooks,
    permissions:{logs:'all',dynamic:'all',photos:'all'},
    myInfo:{name:'', nickName:'', realName:'', male:'', female:'', birthday:'', born:'', live:'', intro:'', star:'', blood:'', favourite:''},
    countPost:0,
    lock: false,
    videos:[],
    fans:[],
    focus:[],
    friend:[],
    messages:[],
    blogDes:{title:'',des:''},
    lastLogin:current
  });
  var time=date.getTime();
  var html="<h3>感谢您注册易博客，请点击下方链接激活账号。</h3>"+
      "<p><a target='_self'  id='active' href='http://localhost:3000/emailActive?email="+
      email+'&time='+time+"'>http://localhost:3000/emailActive</a></p>";

  /*发送激活邮件到用户邮箱*/
  sendMail(email,"激活易博客", html);


  //新增用户
  newUser.save(function (err, user) {
    if (err) {
      console.log(err);
    }
    if(user){
      console.log(user)
    }
    req.session.user = newUser;//用户信息存入 session
    res.json(user);
  });
});

router.get('/emailActive',function(req,res){
  var email=req.query.email;
  var time=req.query.time;
  var current_time=new Date().getTime();
  var timeout=current_time-time;
  console.log(timeout);
  if(timeout<1000*3600*24*7){
    User.get_email(email, function (err, user) {

      if (err) {
        console.log(err);
      }
      if (user) {
        User.update_field(user.name,{'active':true},function(err,user){
          if(err){
            console.log(err)
          }
          if(user){
            console.log("set active true")
          }
        });
        res.setHeader('Content-Type', 'text/html;charset=utf-8');
        return res.end("<h3 style='color:green;width:320px;margin:0 auto;margin-top:150px;'>激活账号成功，感谢您注册易博客！</h3>");
      }
      //如果不存在则返回用户
      res.setHeader('Content-Type', 'text/html;charset=utf-8');
      res.end("<h3 style='color:rgba(166, 152, 255, 0.65);width:285px;margin:0 auto;margin-top:150px;'>用户名不存在，请重新注册！</h3>");
    });
  }else{ res.setHeader('Content-Type', 'text/html;charset=utf-8');
    res.end("<h3 style='color:rgba(166, 152, 255, 0.65);width:285px;margin:0 auto;margin-top:150px;'>激活邮件已失效，请重新注册！</h3>");}
});
/*router.get('/login', function (req, res) {
 res.render('login', {
 title: '登录',
 user: req.session.user,
 success: req.flash('success').toString(),
 error: req.flash('error').toString()});
 });*/

router.post('/login', function (req, res) {
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  User.get_name(req.body.name, function (err, user) {
    if (!user) {
      var result={name:false,password:true};
      return res.json(result);
    }
    //检查密码是否正确
    if (user.password != password) {
      result={name:true,password:false};
      return  res.json(result);
    }
    //用户名密码都匹配后，将用户信息存入 session
    if(req.body.remPwd){
      req.session.user = user;
    }
    result={name:true,password:true};
    res.json(result);
  });
});

/*查询某用户文章接口*/
router.get('/post', function (req, res) {
  console.log(req.query.query)
  Post.get(req.query.query, function (err, posts) {
    if (err) {
      posts = [];
    }
    var result={posts: posts};
    res.json(result);
  });
});

/*查询某Id文章接口*/
router.get('/post_Id', function (req, res) {
  console.log(req.query.id);
  var myPost={};
  Post.get_id(req.query.id, function (err, post) {
    if (err) {
      console.log(err)
    }
    myPost=post;
    console.log(post)
  });
  var upCount=setTimeout(function(){
    var click=++myPost.countClick;
    console.log(click);
    //更新该文章countClick
    Post.update_field({postId:req.query.id},{countClick:click},function(err,result){
      if(err){
        console.log(err)
      }
    });
    res.json(myPost);
  },200);

});

/*查询某用户各分类文章*/
router.get('/post_types',function(req,res){
  var types=JSON.parse(req.query.types);
      var type=[];
      for(var j=0;j<types.length;j++){
        type.push({type:types[j]})
      }
      Post.get({$or:type},function(err,posts){
        if(err){
          console.log(err);
        }
        console.log(posts)
        res.json(posts)
      });

});


/*查询某标题文章接口*/
router.post('/post_title', function (req, res) {
  var title=req.body.title;
  Post.get({title:title}, function (err, posts) {
    if (err) {
      posts = [];
    }
    var result={posts: posts};
    res.json(result);
  });
});

/*发布文章接口*/
router.post('/post', function (req, res) {
  var name = req.session.user.name,
      title=req.body.title,
      theme=req.body.theme,
      article=req.body.article,
      type=req.body.type,
      countPost=req.body.countPost;
      var labels=req.body.labels.split(',');
      if(!labels[0]){
        labels.splice(0,1);
      }
       labels.splice(3,10);
      var post = new Post({name:name,
                        title:title ,
                        theme:theme,
                        article:article,
                        label1:labels[0],
                        label2:labels[1],
                        label3:labels[2],
                        type:type,
                        countClick:0,
                        comments:[]
      });
  //保存文章
   post.save(function (err,post) {
     if (err) {
       console.log(err);
     }
     console.log(post.ops[0])
     res.json(post.ops[0]);
   });

});

/*用户登出接口*/
router.get('/logout', function (req, res) {
  req.session.user = null;
  res.json('logout')
});

/*检查用户登录session接口*/
router.get('/checkLogin',function(req,res){
      var name=req.session.user.name;
  if(req.session.user){
      User.get_name(name,function(err,user){
        if(err){
          console.log(err)
        }
        if(user){
        req.session.user=user;
        console.log(user);
        res.json(user)
        }
      })
   }else{
    res.json('not login')
   }
});

/*更新文章字段接口*/
router.post("/upArticle_field",function(req,res){
  var field=req.body.field;
  var id=req.body.id;
  Post.update_field(id,field,function(err,post){
    if(err){
      console.log(err);
    }
    var result={post:post};
    res.json(result);
  });
});

/*更新用户字段接口*/
router.post("/upUser_field",function(req,res){
  var field=req.body.field;
  var name=req.body.name;
  User.update_field(name,field,function(err,user){
    if(err){
      console.log(err);
    }
    var result={user:user};
    res.json(result);
  });
});

/*更新文章评论接口*/
router.post("/upComment",function(req,res){

  var comments=req.body.comments;
  comments=JSON.parse(comments);
  var postId=req.body.id;
  console.log(comments)
  Post.update_field({postId:postId},{comments:comments},function(err,post){
    if(err){
      console.log(err);
    }
    console.log(post)
    res.json(post);
  });
});

/*获取用户自定义文章分类的某类文章*/
router.post('/article_type',function(req,res){
  var type=req.body.type;
  Post.get({type:type},function(err,posts){
    if(err){
      console.log(err)
    }
    var result={posts:posts};
    res.json(result)
  })
});

/*用户lastLogin时间更新接口*/
router.post('/lastLogin',function(req,res){
  var name=req.session.user.name;
  var lastLogin=req.body.lastLogin;

  User.update_field(name,{'lastLogin':lastLogin},function(err,user){
    if(err){
      console.log(err)
    }
    if(user){
       console.log("update lastLogin success")
    }
    res.end();
  })
});

/*删除7天未激活用户*/
router.get('/not_active',function(req,res){
  var outTime_users=[];
  var getUsers=function(callback){
  User.get_active(function(err,users){
    var date=new Date();
    var time=date.getTime();
    if(err){
      console.log(err)
    }
    if(users){
      callback(null,'one')
      console.log("found not active users");
        var x=0;
        for(var i=0;i<users.length;i++){
           if((time-users[i].regTime)>1000*60*60*24*7){
             outTime_users[x]={name:users[i].name};
             x++;
          }
       }
     }
    console.log(outTime_users);
   });
  };
  var removeUsers=function(callback){
    var i=0;
    console.log("outTime users"+outTime_users[0]);
      if(outTime_users){
        User.delete({$or:outTime_users},function(err,users){
          console.log("进入")
          if(err){
            console.log(err);
          }
          callback(null,users)
        })
      }
    };
    var runInSeries=function(){
      async.series([
        getUsers,
        removeUsers
      ],function(err,results){
          if(err){
            console.log(err)
          }
        console.log(results)
        return res.json(results);
      })
    }
  runInSeries();

});

/*添加文章分类接口*/
router.post('/upTypes',function(req,res){
  var types=[];
  var data=req.body;
  if(data.type1){types[0]=data.type1}
  if(data.type2){types[1]=data.type2}
  if(data.type3){types[2]=data.type3}
  if(data.type4){types[3]=data.type4}
  if(data.type5){types[4]=data.type5}
  if(data.type6){types[5]=data.type6}
  if(data.type7){types[6]=data.type7}
  if(data.type8){types[7]=data.type8}
  if(data.type9){types[8]=data.type9}
  if(data.type10){types[9]=data.type10}
  console.log(types);
  var name=req.session.user.name;
  User.update_field(name,{postTypes:types},function(err,user){
     if(err){
       console.log(err)
     }
    res.json(user)
  })
});

/*被删除分类文章的类别改为‘我的文章’*/
router.post('/toMyArticle',function(req,res){
  var types=[];
  var data=req.body;
  console.log(data)
  var i=0;
  if(data.type0){types[i]={type:data.type};i++}
  if(data.type1){types[i]={type:data.type1};i++}
  if(data.type2){types[i]={type:data.type2};i++}
  if(data.type3){types[i]={type:data.type3};i++}
  if(data.type4){types[i]={type:data.type4};i++}
  if(data.type5){types[i]={type:data.type5};i++}
  if(data.type6){types[i]={type:data.type6};i++}
  if(data.type7){types[i]={type:data.type7};i++}
  if(data.type8){types[i]={type:data.type8};i++}
  if(data.type9){types[i]={type:data.type9};}
  console.log(types);
  var type=req.session.user.name+"-我的文章";
  Post.update_field({$or:types},{type:type},function(err,posts){
    if(err){
      console.log(err)
    }
    res.json(posts)
  })
});

/*查询某标签类文章*/
router.get('/label_posts',function(req,res){
  var label=req.query.label;
  console.log('label:'+label)
  Post.get({$or:[{label1:label},{label2:label},{label3:label}]},function(err,posts){
    if(err){
      console.log(err)
    }
    if(posts){
      console.log(posts)
    }
    res.json(posts)
  })
});

/*更新关注接口*/
router.post('/up_focus',function(req,res){
   var myName=req.body.myName;
   var name=req.body.name;
   var myFocus=JSON.parse(req.body.focus);
   var fans=JSON.parse(req.body.fans);
  //更新我的focus
  var upMyFocus=function(callback){
    User.update_field(myName,{focus:myFocus},function(err,results){
    if(err){
      console.log(err)
      console.log(err);
    }
      console.log('upMyFocus')
      callback(null,'one')
   });
  };
  //更新被关注者的粉丝
  var addFans=function(callback){
    User.update_field(name,{fans:fans},function(err,results){
    if(err){
      console.log(err)
      console.log(err);
    }
      console.log('addFans')
      callback(null,'tow')
   })
  };
  function runInParallel() {
    console.log('run')
    async.series([
      upMyFocus,
      addFans
    ],function(err, results){
      if(err){
        console.log(err)
      }
      res.end();
    });
  }
  runInParallel();

});

/*更新博友接口*/
router.post('/up_friend',function(req,res){
  var myName=req.body.myName;
  var name=req.body.name;

  var friend=JSON.parse(req.body.friend);
  var myFriend=JSON.parse(req.body.myFriend);
  if(req.body.mes!=undefined){
    var myMessages=JSON.parse(req.body.mes);
    console.log(myMessages)
  }else{
    myMessages=[];
  }
  myMessages=[];
  console.log(friend+' '+myFriend);
  //更新我的博友
  User.update_field(myName,{friend:myFriend},function(err,result){
    if(err){
      console.log(err)
    }
  });
//发送同意messages
  if(req.body.mes!=undefined) {
    var date = new Date();
    var time = date.getFullYear() + '-' + (date.getMonth() + 1) + '-' + date.getDate() + ' ' + date.getHours() + ':' + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var message = {
      name: '系统消息',
      time: time,
      read: false,
      message: '<div><span>' + name + '</span>通过了您的加博友请求。</div>'
    };
    myMessages.push(message);
    var allow = setTimeout(function () {
      User.update_field(myName, {messages: myMessages}, function (err, result) {
        if (err) {
          console.log(err)
        }
      });
    }, 300);
  }
  //更新对方博友
  var addFriend=setTimeout(function(){
    User.update_field(name,{friend:friend},function(err,result){
      if(err){
        console.log(err)
      }
      res.end();
    })
  },600);

});

/*加博友接口*/
router.get('/add_friend',function(req,res){
  var myName=req.query.myName;
  var name=req.query.name;
  var friend=JSON.parse(req.query.friend);
  var myFriend=JSON.parse(req.query.myFriend);
  //更新我（请求加博友用户）的friend
  User.update_field(myName,{friend:myFriend},function(err,result){
    if(err){
      console.log(err)
    }
  });
  //更新被加博友用户的friend
  var addFans=setTimeout(function(){
    User.update_field(name,{friend:friend},function(err,result){
      if(err){
        console.log(err)
      }
    })
  },1200);
  res.end();
});

/*删除文章接口*/
router.post('/remove_post',function(req,res){
  var id=req.body.id;
  Post.remove(id,function(err,post){
    if(err){
      console.log(err)
    }
    res.end()
  })
});

/*更新用户myInfo字段接口*/
router.post('/up_myInfo',function(req,res){
  var name=req.body.name;
  var info={nickName:req.body.nickName,
            realName:req.body.realName,
            male:req.body.male,
            female:req.body.female,
            birthday:req.body.birthday,
            born:req.body.born,
            live:req.body.live,
            intro:req.body.intro,
            star:req.body.star,
            blood:req.body.blood,
            favourite:req.body.favourite};
  User.update_field(name,{myInfo:info},function(err,result){
    if(err){
      console.log(err)
    }
    res.end();
  })
})

/*更新用户blogDes字段接口*/
router.post('/up_blogDes',function(req,res){
  var name=req.body.name;
  var title=req.body.title;
  var des=req.body.des;
  User.update_field(name,{blogDes:{title:title,des:des}},function(err,result){
    if(err){
      console.log(err)
    }
    res.end()
  })
});

/*用户修改密码接口*/
router.post('/rePassword',function(req,res){
  var name=req.body.name;
 var  pwd = md5Pwd((req.body.pwd));
 var rePwd = md5Pwd(req.body.newPwd);
  console.log(pwd)
  //用户名和密码验证
  User.get_name(name,function(err,user){
    if(err){
      console.log(err)
    }
    if(!user){
      res.json('userName not exist')
    }
    if(user.password!=pwd){
    res.json('pwd error')
    }
  });
  //修改密码
  var upPassword=setTimeout(function(){
    var pwd=md5Pwd(rePwd);
    User.update_field(name,{password:pwd},function(err){
      if(err){
        console.log(err)
      }
      res.json('success')
    })
  },100);
});

/*更新permissions接口*/
router.post('/up_permissions',function(req,res){
  var name=req.body.name;
  var logsPerm=req.body.logsPerm;
  var dynamicPerm=req.body.dynamicPerm;
  var photosPerm=req.body.photosPerm;
  User.update_field(name,{permissions:{logs:logsPerm,dynamic:dynamicPerm,photos:photosPerm}},function(err,result){
    if(err){
      console.log(err)
    }
    res.end()
  })
});


/*用户发送站内信息message接口*/
router.post('/send_message',function(req,res){
  var name=req.body.name;//消息接收者用户名
  var messages=JSON.parse(req.body.messages);
  User.update_field(name,{messages:messages},function(err,result){
    if(err){
      console.log(err)
    }
    res.end()
  })
});

/*用户拒绝加博友请求接口*/
router.get('/refused_friend',function(req,res){
  var name=req.query.name;
  var myName=req.query.myName;
  var date=new Date();
  var time=date.getFullYear()+'-'+(date.getMonth()+1)+'-'+date.getDate()+' '+date.getHours()+':'+(date.getMinutes()<10?'0'+date.getMinutes():date.getMinutes());
  if(req.query.myMessages){
     var myMessages=JSON.parse(req.query.myMessages);
  }else{
    myMessages=[];
  }
  var message={
    name:'系统消息',
    time:time,
    read:false,
    message:'<div><span>'+name+'</span>没有通过您的加博友请求。</div>'
  };
  myMessages.push(message);
  User.update_field(myName,{messages:myMessages},function(err,result){
    if(err){
      console.log(err)
    }
    res.end()
  })
});

/*更新某用户messages接口*/
router.post('/up_mes',function(req,res){
  var name=req.body.name;
  var messages=JSON.parse(req.body.messages);
  User.update_field(name,{messages:messages},function(err,result){
    if(err){
      console.log(err)
    }
    res.end()
  })

});

/*上传相片接口*/
router.post('/upPhoto',function(req,res){
  var name=req.body.name;
  var photoBooks=req.body.myBooks;
  console.log(name+photoBooks)
  User.update_field(name,{photoBooks:photoBooks},function(err,result){
    if(err){
      console.log(err)
    }
    res.end()
  })
});

/*获取博友文章*/
router.post('/fPosts',function(req,res){
  var friends=req.body.friends;
  friends=JSON.parse(friends);
  var name=[];
  for(var i=0;i<friends.length;i++){
    name.push({name:friends[i]})
  }
  Post.get({$or:name},function(err,posts){
    if(err){
      console.log(err)
    }
    //console.log(posts);
    res.json(posts)

  })
});

/*获取热门博文接口*/
router.get('/topList',function(req,res){
  Post.getTop(function(err,posts){
    if(err){
      console.log(err)
    }
    var result=[];
    for(var i=0;i<10;i++){
      result[i]=posts[i];
    }
    res.json(result)
  })
});

/*修改用户头像接口*/
router.post('/upHead',function(req,res){
  var name=req.session.user.name;
  var head=req.body.head;
  console.log(head)
  User.update_field(name,{headImg:head},function(err,result){
    if(err){
      console.log(err)
    }
    res.end()
  })
});

/*获取用户博客需要的主要数据*/
router.post('/userData',function(req,res){
  var name = req.body.name;
  var postTypes=[];
  var userObj,myPosts,topPosts;
  console.log(""+name);
  //获取当前用户
  var getUser=function(callback){
  User.get_name(name, function (err, user) {
    if (err) {
      err="user查找失败";
      console.log(err);
    }
    if (user) {
      console.log(user)
      postTypes=user.postTypes;
      userObj=user;
      return callback(null,'one')
    }
    //如果不存在则返回用户
    user={name:""};
    userObj=user;
   callback(null,'one')
   })
  };
  //获取当前用户分类文章
  var getPosts=function(callback){
  var type=[];
  for(var j=0;j<postTypes.length;j++){
    type.push({type:postTypes[j]})
  }
  Post.get({$or:type},function(err,posts){
    if(err){
      console.log(err)
      return callback(err)
    }
    console.log('type posts')
    myPosts=posts;
    callback(null,'two')
   })
  };
  //获取博文点击排行前十
  var getTop=function(callback){
   Post.getTop(function(err,posts){
    if(err){
      console.log(err)
      return callback(err)
    }
    var result=[];
    for(var i=0;i<10;i++){
      result[i]=posts[i];
    }
     console.log('top posts')
     topPosts=result;
    callback(null,'three')
   })
  };
    async.series([
        getUser,
        getPosts,
        getTop
    ],function(err,results){
      if(err){
        console.log(err)
      }
      var result={user:userObj,typePosts:myPosts,topPosts:topPosts};
      res.json(result)
    })
});

/*获取博友头像*/
router.post('/friend_head',function(req,res){
    var friends=JSON.parse(req.body.friends);
    for(var i=0;i<friends.length;i++){
      friends[i]={name:friends[i]};
    }
    User.get({$or:friends},function(err,users){
      if(err){
        console.log(err)
      }
      for(var i=0;i<users.length;i++){
        users[i]={name:users[i].name,head:users[i].headImg};
      }
      res.json(users)
    })
});

/*管理员登录*/
router.post('/admLogin', function (req, res) {
  //生成密码的 md5 值
  var md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  //检查用户是否存在
  Manager.get({name:req.body.name}, function (err, manager) {
    if (!manager) {
      var result={name:false,password:true};
      return res.json(result);
    }
    //检查密码是否正确
    if (manager.password != password) {
      result={name:true,password:false};
      return  res.json(result);
    }
    //用户名密码都匹配后，将用户信息存入 session
    if(req.body.remPwd){
      req.session.manager = manager;
    }
    result={name:true,password:true};
    res.json(result);
  });
});

/*工作人员注册提交数据处理接口*/
router.post('/newManager', function (req, res) {
  var name = req.body.name,
      email=req.body.email,
      role=req.body.role,
  //生成密码的 md5 值
      md5 = crypto.createHash('md5'),
      password = md5.update(req.body.password).digest('hex');
  console.log(email+""+name+""+password);
  var newManager = new Manager({
    name: name,
    password: password,
    email:email,
    role:role,
    lock: false,
    active: false
  });
  var date=new Date();
  var time=date.getTime();
  var html="<h3>感谢您注册易博客，请点击下方链接激活账号。</h3>"+
      "<p><a target='_self'  id='active' href='http://localhost:3000/emailActive?email="+
      email+'&time='+time+"'>http://localhost:3000/emailActive</a></p>";

  /*发送激活邮件到用户邮箱*/
  sendMail(email,"激活易博客", html);

  //新增用户
  newManager.save(function (err, manager) {
    if (err) {
      console.log(err);
    }
    if(manager){
      console.log(manager)
    }
    res.json('success');
  });
});

/*检查用户名是否已被注册*/
router.post('/reg/valid_admName', function (req, res) {
  var name = req.body.name;
  console.log(""+name);
  //检查用户名是否已经存在
  Manager.get({name:name}, function (err, manager) {

    if (err) {
      err="user查找失败";
      console.log(err);
    }
    if (manager) {
      console.log(manager)
      return res.json(manager);
    }
    //如果不存在则返回用户
    manager={name:""};
    res.json(manager);
  });
});

/*检查邮箱是否已被注册*/
router.post('/reg/valid_admEmail', function (req, res) {
  var email = req.body.email;
  console.log(""+email);
  //检查用户名是否已经存在
  Manager.get({email:email}, function (err, manager) {

    if (err) {
      err="邮箱查找失败";
      console.log(err);
    }
    if (manager) {
      return res.json(manager);
    }
    //如果不存在则返回用户
    manager={email:""};
    res.json(manager);
  });
});

/*获取所有用户*/
router.get('/user_all',function(req,res){
  User.get({},function(err,users){
    if(err){
      console.log(err)
    }
    res.json(users)
  })
});

/*获取所有管理员*/
router.get('/allManager',function(req,res){
  Manager.get({},function(err,users){
    if(err){
      console.log(err)
    }
    res.json(users)
  })
});

/*管理员删除用户*/
router.post('/del_user',function(req,res){
  var name=req.body.name;
  User.delete({name:name},function(err,user){
    if(err){
      console.log(err)
    }
    res.end()
  })

});

/*Boss删除管理员*/
router.post('/del_manager',function(req,res){
  var name=req.body.name;
  Manager.delete({name:name},function(err,user){
    if(err){
      console.log(err)
    }
    res.end()
  })

});

/*更新用户字段接口*/
router.post("/upManager_field",function(req,res){
  var field=req.body.field;
  var name=req.body.name;
  Manager.update_field(name,field,function(err,user){
    if(err){
      console.log(err);
    }
    res.json(user);
  });
});

/*新建首页数据模型*/
router.get('/new_home',function(req,res){
  var newHome=new Home({
    top_headline:'',top_hot:'',top_visual:'',top_watch:'',top_exclusive:'',top_history:'',top_gossip:'',top_finance:'',old_headline:'',top_hotProject:'',top_thought:'',top_active:'',top_star:'',top_plan:'',//top
    photos_photo:'',photos_seeWorld:'',photos_girl:'',//photos
    film_gossip:'',film_movie:'',film_threeD:'',film_entertainment:'',film_hot:'',film_animation:'',//film
    current_social:'',current_view:'',current_socialPhoto:'',current_militaryPhoto:'',current_military:'',current_focus:'',//current
    culture_history:'',culture_story:'',culture_culturePhoto:'',culture_historyPhoto:'',culture_customs:'',culture_culture:'',//culture
    health_health:'',health_sports:'',health_mental:'',//health
    live_live:'',live_emotional:'',live_photo:'',//live
    travel_travel:'',travel_drive:'',travel_natural:'',//travel
    sports_NBA:'',sports_competition:'',sports_wonderful:'',//sports
    finance_stock:'',finance_fund:'',finance_estate:'',//finance
    car_car:'',sports_car:'',car_show:'',visual:'',//car
    update_one:'',update_two:'',update_three:'',update_four:'',update_five:'',update_six:''//update
  });
  newHome.save(function(err,home){
    if(err){
      console.log(err)
    }
    console.log(home);
    res.json(home)
  })
});

/*获取首页数据模型*/
router.get('/current_home',function(req,res){
  Home.get(function(err,home){
    if(err){
      console.log(err)
    }
    console.log(home)
    res.json(home)
  })
});

/*更新首页数据模型*/
router.post('/up_home',function(req,res){
  var time =req.body.time;
  var field=req.body.field;
   Home.update({time:time},field,function(err,home){
    if(err){
      console.log(err)
    }
    res.end()
   })
});

/*用户上传视频*/
router.post('/upVideo',function(req,res){
  var video=req.body.video;
  video=JSON.parse(video);
console.log(req.body)
  var newVideo=new Video(video);
  newVideo.save(function(err,video){
    if(err){
      console.log(err)
    }
    res.json(video)
  })
});

/*用户获取视频*/
router.get('/videos',function(req,res){
   var name=req.query.name;

   Video.get({name:name},function(err,videos){
     if(err){
       console.log(err)
     }
     res.json(videos)
   })
});

//获取所有视频
router.get('/all_videos',function(req,res){

  Video.get({},function(err,videos){
    if(err){
      console.log(err)
    }
    res.json(videos)
  })
});






function md5Pwd(password) {
  var md5 = crypto.createHash('md5');
  return md5.update(password).digest('hex');
}

module.exports = router;