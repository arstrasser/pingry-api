const mongojs = require('mongojs');
const ldap = require('ldapjs');
const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

const tokenLength = 40;

let db = mongojs('mongodb://127.0.0.1:27017/PingryAPI');

exports.userManager = class {
  constructor(){

  }

  validAccessToken(token){
    if(token && typeof token == "string" && token.length == tokenLength){
      for(var i = 0; i < token.length; i++){
        if(chars.indexOf(token.charAt(i)) == -1)
          return false;
      }
      return true;
    }
    return false;
  }

  login(username, password){
    return new Promise((resolve, reject) => {
      let ldapClient = ldap.createClient({
        url: "ldap://psmcdc1.pingry.k12.nj.us",
        connectTimeout:5000,
        timeout: 10000
      });
      ldapClient.bind(username, password, (err) => {
        if(err) reject(err);
        resolve();
        ldapClient.unbind();
      });
    });
  }

  getUserFromAccess(accessToken){
    return new Promise((resolve, reject) => {
      if(!this.validAccessToken(accessToken)){
        reject("INVALID ACCESS TOKEN FORMAT");
      }
      db.collection("users").findOne({"accessTokens":accessToken}, (err, doc) => {
        if(err){
          return reject(err);
        }else if(!doc){
          return reject("User not found!");
        }
        resolve(doc);
      });
    });
  }

  generateAccessToken(username){
    let key = "";
    for(let i = 0; i < tokenLength; i++){
      key += chars[Math.floor(Math.random()*chars.length)];
    }
    return new Promise((resolve, reject) => {
      db.collection("users").find({"username":username}, (err, docs) => {
        if(err) return reject(err);
        //This user has never logged in before
        if(docs.length < 1){
          let type = "";
          let year = -1;
          if(username.indexOf("@") < 6 || isNaN(username.substring(username.indexOf("@")-4, username.indexOf("@")))){ //If the username is doesn't contain a year
            type = "teacher";
          }else {
            type = "student";
            year = parseInt(username.substring(username.indexOf("@")-4, username.indexOf("@")));
          }
          db.collection("users").insert({
            "username":username,
            type,
            year,
            pridePoints:0,
            prideEvents:[],
            accessTokens:[key]
          }, (err) => {
            if(err) reject(err);
            else resolve(key);
          });
          return;
        }

        //This user has logged in before
        else {
          db.collection("users").update(
            {"username":username},
            {"$push":{"accessTokens":key}},
            {},
            (err) => {
              if(err) reject(err);
              else resolve(key);
            }
          );
        }
      });
    });
  }

  async getUsername(accessToken){
    return (await this.getUserFromAccess(accessToken)).username;
  }

  async getUserInfo(accessToken){
    let user = await this.getUserFromAccess(accessToken);
    return {username:user.username, type:user.type, year:user.year};
  }

  async getPridePoints(accessToken){
    return (await this.getUserFromAccess(accessToken)).pridePoints;
  }

  async getPrideEvents(accessToken){
    return (await this.getUserFromAccess(accessToken)).prideEvents;
  }

  async addPrideEvent(accessToken, eventId){
    return new Promise((resolve, reject) => {
      if(!this.validAccessToken(accessToken)){
        reject("INVALID ACCESS TOKEN FORMAT");
      }
      db.collection("users").findAndModify({
        query:{"accessTokens":accessToken},
        update:{"$push":{"prideEvents":{"eventId":eventId, "time_claimed":Date.now()}}},
      }, (err, doc) => {
        if(err){
          reject(err);
        }
        resolve(doc);
      });
    });
  }

  async addPridePoints(accessToken, points){
    return new Promise((resolve, reject) => {
      if(!this.validAccessToken(accessToken)){
        reject("INVALID ACCESS TOKEN FORMAT");
      }
      if(typeof points == "string") points = parseInt(points);
      db.collection("users").update({"accessTokens":accessToken}, {"$inc":{"pridePoints":points}}, (err) => {
        if(err){
          reject(err);
        }
        resolve();
      });
    });
  }
};
