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
          reject(err);
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
      db.collection("users").findAndModify({
        query:{"username":username},
        update:{"$push":{"accessTokens":key}},
        new: false
      }, (err) =>{
        if(err){
          let type = "";
          let year = -1;
          if(username.indexOf("@") < 6 || isNaN(username.substring(username.indexOf("@")-4, username.indexOf("@")))){ //If the username is doesn't contain a year
            type = "teacher";
          }else {
            year = parseInt(username.substring(username.indexOf("@")-4, username.indexOf("@")));
          }
          db.collection("users").insert({
            "username":username,
            type,
            year,
            accessTokens:[key]
          }, (err) => {
            if(err) reject(err);
            resolve(key);
          });
        }else if(err){
          //TODO:Find type of error for if statement above.
          reject(err);
        }
        resolve(key);
      });
    });
  }

  async getUsername(accessToken){
    return (await this.getUserFromAccess(accessToken)).username;
  }

  async getUserinfo(accessToken){
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
};
