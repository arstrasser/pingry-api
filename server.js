/**
 * @file Server file for the Pingry API
 * @author Alex Strasser
 * @version 2018.01.14
 */


//Configuration
const PORT = 3000;
const KEY_REFRESH_INTERVAL = 5; //Will refresh the api keys every X minutes
const API_REFRESH_INTERVAL = 60; //Will refresh the api information from files every X minutes;
const RATE_LIMIT_WINDOW = 15; //Will limit users based in X minute intervals

//Imports
let pingry = new (require("./API/api").PAPI)();
const express = require('express');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const fs = require("fs");

//App setup
let app = new express();
app.use(helmet());

let apiKeys = JSON.parse(fs.readFileSync("./api_keys.json"));

let limiter = new rateLimit({
  windowMs: RATE_LIMIT_WINDOW*60*1000, // 15 minutes
  delayAfter: 50,
  max: 200,
  delayMs: 1000
});

let logger = (req) => {
  console.log(new Date().toISOString()+": "+req.method+
  " "+req.originalUrl+" - "+req.user+"@"+req.ip);
};

//Auth middleware that ensures the user has the required permissions.
let auth = (requiredPermissions) => {
  return (req, res, next) => {
    for(let i = 0; i < apiKeys.length; i++){
      if(apiKeys[i].key == req.query.api_key) {

        let authSuccess = () => {
          req.user = apiKeys[i].owner;
          logger(req);
          return next();
        };

        userPermissions = apiKeys[i].permissions;
        for(let j = 0; j < userPermissions.length; j++){
          if(userPermissions[j] === "full"){
            return authSuccess();
          }
          for(let k = 0; k < requiredPermissions.length; k++){
            if(userPermissions[j] == requiredPermissions[k]){
              return authSuccess();
            }
          }
        }
        return res.status(401).send("Unauthorized");

      }
    }
    return res.status(401).send("Unauthorized");
  };
};

//Express Routes
app.get("/schedule", auth([]), (req, res) => {
  if(req.query.date){
    res.json(pingry.getScheduleForDate(req.query.date));
  }
  else if(req.query.type){
    for(var i = 0; i < pingry.typeList.length; i++){
      if(pingry.typeList[i].name == req.query.type){
        res.json(pingry.typeList[i]);
        return;
      }
    }
    res.json(pingry.typeList[0]);
  }
  else{
    res.json(pingry.typeList[0]);
  }
});

app.get("/schedule/types", auth([]), (req, res) => {
  res.json(pingry.typeList);
});

app.get("/schedule/events", auth([]), (req, res) => {
  res.json(pingry.getScheduledEvents());
});

app.get("/schedule/events/CT", auth([]), (req, res) => {
  if(req.query.date){
    if(pingry.getScheduledEvents().CT.hasOwnProperty(req.query.date)){
      res.json(pingry.getScheduledEvents().CT[req.query.date]);
    }else{
      res.status(400).json({"err":"Date not Found"});
    }
  }else{
    res.json(pingry.getScheduledEvents().CT);
  }
});

app.get("/schedule/events/CP", auth([]), (req, res) => {
  if(req.query.date){
    if(pingry.getScheduledEvents().CP.hasOwnProperty(req.query.date)){
      res.json(pingry.getScheduledEvents().CP[req.query.date]);
    }else{
      res.status(400).json({"err":"Date not Found"});
    }
  }else{
    res.json(pingry.getScheduledEvents().CP);
  }
});

app.get("/letter", auth([]), (req, res) => {
  if(req.query.date){
    const index = pingry.getLetterIndexOf(req.query.date);
    if(index > -1){
      res.json(pingry.letterTimes[index]);
    }
    else{
      res.status(400).json({"err":"Date not Found"});
    }
  }else if(req.query.letter){
    if(!pingry.letterTimes.hasOwnProperty(pingry.letterToNumber(req.query.letter))){
      res.status(400).json({"err":"Letter not Found"});
    }else{
      res.json(pingry.letterTimes[pingry.letterToNumber(req.query.letter)]);
    }
  }else{
    res.json(pingry.letterTimes);
  }
});

app.get("/announcements", auth([]), (req, res) => {
  res.json(pingry.getAnnouncements());
});

app.get("/news", auth([]), (req, res) => {
  res.json(pingry.getNews());
});

app.get("/ddd", auth([]), (req, res) => {
  res.json(pingry.getDDDSchedule());
});

app.get("/lunch", auth([]), (req, res) => {
  if(req.query.date){
    res.json(pingry.getMenuForDate(req.query.date));
  }else{
    res.json(pingry.getLunchMenu());
  }
});

//Refresh from the API, then load the server
pingry.refresh(()=>{
  app.listen(PORT, () => {
    console.log("Server started on port "+PORT+".");
  });
});

//Reloads the api keys file
setInterval(()=>apiKeys = JSON.parse(fs.readFileSync("./api_keys.json")), KEY_REFRESH_INTERVAL*60*1000);

setInterval(()=> pingry.refresh(), API_REFRESH_INTERVAL*60*1000);
