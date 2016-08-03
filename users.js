var MongoClient = require("mongodb").MongoClient;

module.exports = {
  db: null,
  ready: false,
 
  init: function(uri, opts) {
    MongoClient.connect(uri, opts, function(err, connection){
      ready = true;
      db = connection;
    });
    return this;
  }, 

  findOrCreate: function(profile, done){
    if (!ready){
      done("Database Not Ready");
      return;
    }

    var users = db.collection("users");

    users.findOne({"redditID": profile.id},{},function(err, result){
      if (result != null){
        done(err, result)
      }else{
        
        var newUser = {
          "redditID": profile.id,
          "name": profile.name,
          "permissions": [
             "requestTournament"
           ]
        }
          
        users.insertOne(newUser, function(err, result) {
          console.log("Created new user " + newUser.name)
	  done(err, newUser);
        });
      }
    });
  },

  find: function(redditID, done){
    if (!ready){
      done("Database Not Ready");
      return;
    }

    var users = db.collection("users");

    users.findOne({"redditID": redditID},{},function(err, result){
      done(err, result);
    });

  }
};
