const fs = require('fs');
const path = require('path');

module.exports.auth = class {
  logger(req) {
    console.log(new Date().toISOString()+": "+req.method+
    " "+req.originalUrl+" - "+req.user+"@"+req.ip);
  }

  constructor(logger){
    if(logger){this.logger = logger;}
    this.apiKeys = JSON.parse(fs.readFileSync(path.join(__dirname, "api_keys.json")));
  }

  mw(requiredPermissions){
    return (req, res, next) => {
      let authSuccess = (index) => {
        req.user = this.apiKeys[index].owner;
        if(this.logger){this.logger(req);}
        return next();
      };
      //Iterate over the API keys to identify who is making the request
      for(let i = 0; i < this.apiKeys.length; i++){
        //If we have the person
        if(this.apiKeys[i].key == req.query.api_key) {
          var userPermissions = this.apiKeys[i].permissions;
          //If the person has master permissions, give them instant access
          if(userPermissions.includes("full")){
            return authSuccess(i);
          }

          //Loop through the required permissions to see if they have ALL of the required permissions
          for(let j = 0; j < requiredPermissions.length; j++){
            var found = false;
            for(let k = 0; k < userPermissions.length; k++){
              if(userPermissions[k] === requiredPermissions[j]){
                found = true;
                break;
              }
            }
            //If they are missing any permissions, reject them
            if(!found) return res.status(401).send("Unauthorized");
          }
          return authSuccess(i);
        }
      }
      return res.status(401).send("Unauthorized");
    };
  }
}
