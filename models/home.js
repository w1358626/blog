var mongodb=require('./db');

function Home(home){
    this.top_headline=home.top_headline,this.top_hot=home.top_hot,this.top_visual=home.top_visual,this.top_watch=home.top_watch,this.top_exclusive=home.top_exclusive,this.top_history=home.top_history,this.top_gossip=home.top_gossip,this.top_finance=home.top_finance,this.old_headline=home.old_headline,this.top_hotProject=home.top_hotProject,this.top_thought=home.top_thought,this.top_active=home.top_active,this.top_star=home.top_star,this.top_plan=home.top_plan,//top
        this.photos_photo=home.photos_photo,this.photos_seeWorld=home.photos_seeWorld,this.photos_girl=home.photos_girl,//photos
        this.film_gossip=home.film_gossip,this.film_movie=home.film_movie,this.film_threeD=home.film_threeD,this.film_entertainment=home.film_entertainment,this.film_hot=home.film_hot,this.film_animation=home.film_animation,//film
        this.current_social=home.current_social,thhis.current_view=home.current_view,this.current_socialPhoto=home.current_socialPhoto,this.current_militaryPhoto=home.current_militaryPhoto,this.current_military=home.current_military,this.current_focus=home.current_focus,//current
        this.culture_history=home.culture_history,this.culture_story=home.culture_history,this.culture_culturePhoto=home.culture_culturePhoto,this.culture_historyPhoto=home.culture_historyPhoto,this.culture_customs=home.culture_customs,this.culture_culture=home.culture_culture,//culture
        this.health_health=home.health_health,this.health_sports=home.health_sports,this.health_mental=home.health_mental,//health
        this.live_live=home.live_live,this.live_emotional=home.live_emotional,this.live_photo=home.live_photo,//live
        this.travel_travel=home.travel_travel,this.travel_drive=home.travel_drive,this.travel_natural=home.travel_natural,//travel
        this.sports_NBA=home.sport_NBA,this.sports_competition=home.sports_competition,this.sports_wonderful=home.sports_wonderful,//sports
        this.finance_stock=home.finance_stock,this.finance_fund=home.finance_fund,this.finance_estate=home.finance_estate,//finance
        this.car_car=home.car_car,this.sports_car=home.sports_car,this.car_show=home.car_show,this.visual=home.visual,//car
        this.update_one=home.update_one,this.update_two=home.update_two,this.update_three=home.update_three,this.update_four=home.update_four,this.update_five=home.update_five,this.update_six=home.update_six//update
}

Home.prototype.save=function(callback){
    var date=new Date(),
        time=date.getFullYear() + "-" + (date.getMonth() + 1) + "-" + date.getDate() + " " +
            date.getHours() + ":" + (date.getMinutes() < 10 ? '0' + date.getMinutes() : date.getMinutes())
    var home = {
        top_headline:this.top_headline,top_hot:this.top_hot,top_visual:this.top_visual,top_watch:this.top_watch,top_exclusive:this.top_exclusive,top_history:this.top_history,top_gossip:this.top_gossip,top_finance:this.top_finance,old_headline:this.old_headline,top_hotProject:this.top_hotProject,top_thought:this.top_thought,top_active:this.top_active,top_star:this.top_star,top_plan:this.top_plan,//top
        photos_photo:this.photos_photo,photos_seeWorld:this.photos_seeWorld,photos_girl:this.photos_girl,//photos
        film_gossip:this.film_gossip,film_movie:this.film_movie,film_threeD:this.film_threeeD,film_entertainment:this.film_entertainment,film_hot:this.film_hot,film_animation:this.film_animation,//film
        current_social:this.current_social,current_view:this.current_view,current_socialPhoto:this.current_socialPhoto,current_militaryPhoto:this.current_militaryPhoto,current_military:this.current_military,current_focus:this.current_focus,//current
        culture_history:this.culture_history,culture_story:this.culture_story,culture_culturePhoto:this.culture_culturePhoto,culture_historyPhoto:this.culture_historyPhoto,culture_customs:this.culture_customs,culture_culture:this.culture_culture,//culture
        health_health:this.health_health,health_sports:this.health_sports,health_mental:this.health_mental,//health
        live_live:this.live_live,live_emotional:this.live_emotional,live_photo:this.live_photo,//live
        travel_travel:this.travel_travel,travel_drive:this.travel_drive,travel_natural:this.travel_natural,//travel
        sports_NBA:this.sports_NBA,sports_competition:this.sports_competition,sports_wonderful:this.sports_wonderful,//sports
        finance_stock:'',finance_fund:'',finance_estate:'',//finance
        car_car:this.car_car,sports_car:this.sports_car,car_show:this.car_show,visual:this.visual,//car
        update_one:this.update_one,update_two:this.update_two,update_three:this.update_three,update_four:this.update_four,update_five:this.update_five,update_six:this.update_six//update
    }

    mongodb.open(function(err,db){
        if(err){
            console.log('db open failed');
            return callback(err)
        }
        db.collection('homes',function(err,collection){
            if(err){
                mongodb.close();
                console.log('find homes failed');
                return callback(err)
            }
            collection.insert(home,{safe:true},function(err,home){
                mongodb.close();
                if(err){
                    console.log('insert home failed');
                    return callback(err)
                }
                callback(null,home)
            })
        })
    })
};

Home.get=function(callback){
    mongodb.open(function(err,db){
        if(err){
            return callback(err)
        }
        db.collection('homes',function(err,collection){
            if(err){
                mongodb.close();
                return callback(err)
            }
            collection.find({}).sort({
                time:-1
            }).toArray(function(err,homes){
                mongodb.close();
                if(err){
                    return callback(err)
                }
                callback(null,homes[0])
            })
        })
    })
}


Home.update=function(query,field,callback){
    mongodb.open(function(err,db){
        if(err){
            console.log('db open failed');
            return callback(err)
        }
        db.collection('homes',function(err,collection){
            if(err){
                mongodb.close();
                console.log('find homes failed');
                return callback(err)
            }
            collection.update(query,{$set:field},function(err,home){
                mongodb.close();
                if(err){
                    console.log('update home failed');
                   return callback(err)
                }
                callback(null,home)
            })
        })
    })
};


module.exports=Home;