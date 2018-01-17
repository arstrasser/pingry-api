const fs = require("fs");
const prompt = require('prompt');
let keys = JSON.parse(fs.readFileSync("./api_keys.json"));
const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";
prompt.start();
prompt.get([{
    name:"owner",
    description:"Key owner",
    message:"Owner must be alphanumeric+spaces only",
    pattern:/^[a-z\d\s]+$/i
  }], (err, result) => {
  if(err){
    console.log(err);
    return;
  }
  var key = "";
  for(let i = 0; i < 40; i++){
    key += chars[Math.floor(Math.random()*chars.length)];
  }
  keys.push({key, owner:result.owner, permissions:["full"]});
  console.log(key);
  
  fs.writeFileSync("./api_keys.json", JSON.stringify(keys).replace(/},/g, "},\n"));
});
