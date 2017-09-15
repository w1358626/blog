/**
 * Created by Administrator on 2017/4/10.
 */
var mongodb = require('./db');

function Video(video) {
    this.name=video.name;
    this.des=video.des;
    this.url=video.url;
    this.label1=video.label1;
    this.label2=video.label2;
    this.label3=video.label3;
    this.type=video.type;
    this.image=video.image;
}



//保存视频
Video.prototype.save = function(callback){
    //要存入数据库的用户文档
    var date=new Date();
    var time=date.getTime()
    var current= date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
        date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes());
    var video = {
        name:this.name,
        des:this.des,
        time:current,
        id:time+this.name,
        url:this.url,
        type:this.type,
        label1:this.label1,
        label2:this.label2,
        label3:this.label3,
        image:this.image
    };
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            return callback(err);//错误，返回 err 信息
        }
        //读取 videos 集合
        db.collection('videos', function (err, collection) {
            if (err) {
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //将用户数据插入 users 集合
            collection.insert(video, {
                safe: true
            }, function (err, video) {
                mongodb.close();
                if (err) {
                    return callback(err);//错误，返回 err 信息
                }
                console.log(video.ops[0])
                callback(null, video.ops[0]);//成功！err 为 null，并返回存储后的用户文档
            });
        });
    });
};
//查找视频
Video.get = function(query, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('videos', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个文档
            collection.find(query).sort({
                time:-1
            }).toArray(function (err, videos) {
                mongodb.close();
                if (err) {
                    console.log("find video failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, videos);//成功！返回查询的用户信息
            });
        });
    });
};


//更新视频
Video.update_field = function(id,field, callback) {

    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('videos', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个用户
            collection.update({id:id},{$set:field},function (err, video) {
                mongodb.close();
                if (err) {
                    console.log("update video failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, video);//成功！返回查询的用户信息
            });
        });
    });
};


//删除视频
Video.delete = function(query, callback) {
    console.log("进入delete")
    //打开数据库
    mongodb.open(function (err, db) {
        if (err) {
            console.log("db open failed");
            return callback(err);//错误，返回 err 信息
        }
        //读取 users 集合
        db.collection('videos', function (err, collection) {
            if (err) {
                console.log("db open failed"+err);
                mongodb.close();
                return callback(err);//错误，返回 err 信息
            }
            //查找用户名（name键）值为 name 一个用户
            collection.remove(query, function (err, videos) {
                mongodb.close();
                if (err) {
                    console.log("remove video failed");
                    return callback(err);//失败！返回 err 信息
                }
                callback(null, videos);//成功！返回查询的用户信息
            });
        });
    });
};
module.exports = Video;