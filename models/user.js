/**
 * Created by Administrator on 2017/4/10.
 */
var mongodb = require('./db');

function User(user) {
    this.name = user.name;
    this.password = user.password;
    this.email = user.email;
    this.active=user.active;
    this.headImg=user.headImg;
    this.friend=user.friend;
    this.lock=user.lock;
    this.fans=user.fans;
    this.focus=user.focus,
    this.postTypes=user.postTypes;
    this.messages=user.messages;
    this.myInfo=user.myInfo;
    this.blogDes=user.blogDes;
    this.photoBooks=user.photoBooks;
    this.permissions=user.permissions;
    this.lastLogin=user.lastLogin;
}



//存储用户信息
User.prototype.save = function(callback){
    //要存入数据库的用户文档
    var date=new Date();
    var time=date.getTime();
    var user = {
        name: this.name,
        password: this.password,
        email: this.email,
        active: this.active,
        headImg:this.headImg,
        myInfo:this.myInfo,
        messages:this.messages,
        postTypes:this.postTypes,
        friend:this.friend,
        fans:this.fans,
        focus:this.focus,
        regTime:time,
        lock:this.lock,
        blogDes:this.blogDes,
        lastLogin:this.lastLogin,
        permissions:this.permissions,
        photoBooks:this.photoBooks
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //将用户数据插入 users 集合
            collection.insert(user, {
                safe: true
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                console.log(user.ops[0])
                callback(null, user.ops[0]);//成功！err 为 null，并返回存储后的用户文档
            });
        });
    });
};
//查找用户读取用户信息
User.get = function(query, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.find(query).sort({
                time:-1
            }).toArray(function (err, users) {
                mongodb.close();
                if (err) {
                    console.log("find user failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, users);//成功！返回查询的用户信息
            });
        });
    });
};

//通过name查找用户读取用户信息
User.get_name = function(name, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                name: name
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    console.log("find user failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });
        });
    });
};
/**查找用户邮箱*/
User.get_email = function(email, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne({
                email: email
            }, function (err, user) {
                mongodb.close();
                if (err) {
                    console.log("find user failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });
        });
    });
};

//更新用户数据
User.update_field = function(name,field, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个用户
            collection.update({'name': name},{$set:field},function (err, user) {
                mongodb.close();
                if (err) {
                    console.log("update user failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, user);//成功！返回查询的用户信息
            });
        });
    });
};

//查找未激活用户
User.get_active=function(callback){
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.find({active:false}).sort({
                regTime: -1
            }).toArray(function (err, users) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null, users);//成功！以数组形式返回查询的结果
            });
        });
    });

};

//删除某用户数据
User.delete = function(query, callback) {
console.log("进入delete")
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('users', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个用户
            collection.remove(query, function (err, users) {
                mongodb.close();
                if (err) {
                    console.log("remove user failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, users);//成功！返回查询的用户信息
            });
        });
    });
};
module.exports = User;