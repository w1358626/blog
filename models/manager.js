var mongodb = require('./db');

function Manager (manager){
    this.name=manager.name;
    this.password = manager.password;
    this.email = manager.email;
    this.active= manager.active;
    this.lock=manager.lock;
    this.role=manager.role;
}

//存储用户信息
Manager.prototype.save = function(callback){
    //要存入数据库的用户文档

    var manager = {
        name: this.name,
        password: this.password,
        email: this.email,
        active: this.active,
        lock:this.lock,
        role: this.role
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('managers', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //将用户数据插入 users 集合
            collection.insert(manager, {
                safe: true
            }, function (err, manager) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                console.log(manager.ops[0])
                callback(null, manager.ops[0]);//成功！err 为 null，并返回存储后的用户文档
            });
        });
    });
};

//查找用户读取用户信息
Manager.get = function(query, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('managers', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.findOne(query, function (err, manager) {
                mongodb.close();
                if (err) {
                    console.log("find manager failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, manager);//成功！返回查询的用户信息
            });
        });
    });
};

//查找用户读取用户信息
Manager.getAll = function(query, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('managers', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.find(query).sort({
                role:-1
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

//更新用户数据
Manager.update_field = function(name,field, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('managers', function (err, collection) {
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


//删除某用户数据
Manager.delete = function(query, callback) {
    console.log("进入delete")
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('managers', function (err, collection) {
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


module.exports = Manager;