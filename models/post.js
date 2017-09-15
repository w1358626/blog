var mongodb = require('./db');

function Post(newPost){
    this.type=newPost.type;
    this.postId=newPost.postId;
    this.name = newPost.name;
    this.title = newPost.title;
    this.theme = newPost.theme;
    this.article=newPost.article;
    this.label1=newPost.label1;
    this.label2=newPost.label2;
    this.label3=newPost.label3;
    this.countClick=newPost.countClick;
    this.comments=newPost.comments;
}



//存储一篇文章及其相关信息
Post.prototype.save = function(callback) {
    var date = new Date();
    //存储各种时间格式，方便以后扩展
    var time = {
        ms:date.getTime(),
        date: date,
        year : date.getFullYear(),
        month : date.getFullYear() + "-" + (date.getMonth() + 1),
        day : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate(),
        minute : date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    }
    var ms=time.ms+'';
    //要存入数据库的文档
    var post = {
        name: this.name,
        time: time.minute,
        postId:ms,
        title: this.title,
        theme: this.theme,
        article:this.article,
        type:this.type,
        label1:this.label1,
        label2:this.label2,
        label3:this.label3,
        countClick:this.countClick,
        comments:this.comments
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //将文档插入 posts 集合
            collection.insert(post, {
                safe: true
            }, function (err,post) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null,post);//返回 err 为 null
            });
        });
    });
};

//读取某用户文章及其相关信息
Post.get = function(query, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据 query 对象查询文章
            collection.find(query).sort({
                time: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null, docs);//成功！以数组形式返回查询的结果
            });
        });
    });
};

//按countClick排序读取文章及其相关信息
Post.getTop = function( callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据 query 对象查询文章
            collection.find({}).sort({
                countClick: -1
            }).toArray(function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null, docs);//成功！以数组形式返回查询的结果
            });
        });
    });
};

//读取某用户文章及其相关信息
Post.get_id = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据 query 对象查询文章
            collection.findOne({postId:id},function (err, docs) {
                mongodb.close();
                if (err) {
                    return callback(err);//失败！返回 err
                }
                callback(null, docs);//成功！以数组形式返回查询的结果
            });
        });
    });
};


//更新某文章字段
Post.update_field = function(query,field, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据 query 对象查询文章
            collection.update(query,{$set:field}, function (err, post) {
                mongodb.close();
                if (err) {
                    console.log("update post failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, post);//成功！返回查询的用户信息
            });
        });
    });
};

//删除某Id文章
Post.remove = function(id, callback) {
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);
        }
        //读取 posts 集合
        db.collection('posts', function(err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);
            }
            //根据 query 对象查询文章
            collection.remove(id,function (err, post) {
                mongodb.close();
                if (err) {
                    console.log("remove post failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, post);//成功！返回查询的用户信息
            });
        });
    });
};

module.exports = Post;