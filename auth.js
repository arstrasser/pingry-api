const fs = require('fs');

module.exports.auth = class {
  logger(req) {
    console.log(new Date().toISOString()+": "+req.method+
    " "+req.originalUrl+" - "+req.user+"@"+req.ip);
  }

  constructor(logger){
    if(logger){this.logger = logger;}
    this.apiKeys = JSON.parse(fs.readFileSync("./api_keys.json"));
  }

  mw(requiredPermissions){
    return (req, res, next) => {
      let authSuccess = (index) => {
        req.user = this.apiKeys[index].owner;
        if(this.logger){this.logger(req);}
        return next();
      };
      for(let i = 0; i < this.apiKeys.length; i++){
        if(this.apiKeys[i].key == req.query.api_key) {
          var userPermissions = this.apiKeys[i].permissions;
          if(userPermissions.includes("full")){
            return authSuccess(i);
          }

          for(let j = 0; j < requiredPermissions.length; j++){
            var found = false;
            for(let k = 0; k < userPermissions.length; k++){
              if(userPermissions[k] === requiredPermissions[j]){
                found = true;
                break;
              }
            }
            if(!found) return res.status(401).send("Unauthorized");
          }
          return authSuccess(i);
        }
      }
      return res.status(401).send("Unauthorized");
    };
  }
}
