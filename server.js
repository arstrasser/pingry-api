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
const path = require('path');
const bodyParser = require('body-parser');


//App setup
let app = new express();

app.use(bodyParser.json());

let apiKeys = JSON.parse(fs.readFileSync("./api_keys.json"));

let limiter = new rateLimit({
  windowMs: RATE_LIMIT_WINDOW*60*1000, // 15 minutes
  delayAfter: 50,
  max: 200,
  delayMs: 1000
});
app.use(helmet(limiter));

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

        var userPermissions = apiKeys[i].permissions;
        if(userPermissions.includes("full")){
          return authSuccess();
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
        return authSuccess();

      }
    }
    return res.status(401).send("Unauthorized");
  };
};

app.get("/testPermission", (req, res, next) => {
  return auth([req.query.permission])(req, res, next);
}, (req, res) => {
  res.status(200).send("Authorized");
})

app.use("/configuration/", express.static(path.join(__dirname, 'config_build')))

app.get("/configuration/*", (req, res) => {
  res.sendFile(path.join(__dirname, "config_build", "index.html"));
})

//API routes
app.get("/schedule", auth(["basic"]), (req, res) => {
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

app.get("/schedule/all", auth(["basic"]), (req, res) => {
  res.json(pingry.getAllSchedules());
});

app.get("/schedule/manual/all", auth(["basic"]), (req, res) => {
  res.json(pingry.getAllManualSchedules());
});

app.get("/schedule/types", auth(["basic"]), (req, res) => {
  res.json(pingry.typeList);
});

app.get("/schedule/events", auth(["basic"]), (req, res) => {
  res.json(pingry.getScheduledEvents());
});

app.get("/schedule/events/CT", auth(["basic"]), (req, res) => {
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

app.get("/schedule/events/CP", auth(["basic"]), (req, res) => {
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

app.get("/letter", auth(["basic"]), (req, res) => {
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

app.get("/athletics/calendarList", auth(["basic"]), (req, res) => {
  res.json(pingry.getAthleticCalendars());
});

app.get("/athletics/sports", auth(["basic"]), (req, res) => {
  let sports = req.query.sport;
  if(!sports){return res.json([]);}
  if(typeof sports == "string"){
    sports = new Array(sports);
  }
  let events = [];
  for(let i = 0; i < sports.length; i++){
    let teamEvents = pingry.getAthleticScheduleForTeam(sports[i]);
    if(!!teamEvents){
      events = events.concat(teamEvents);
    }
  }

  events.sort((a,b) => {
      if(a.startTime==b.startTime){
        if(a.title == b.title) return a.desc.localeCompare(b.desc);
        else return a.title.localeCompare(b.title);
      }
      else return a.startTime - b.startTime;
  });
  res.json(events);
});

app.get("/athletics/sports/all", auth(["basic"]), (req, res) => {
  res.json(pingry.getAllAthleticEvents());
})

app.get("/announcements", auth(["basic"]), (req, res) => {
  res.json(pingry.getAnnouncements());
});

app.get("/news", auth(["basic"]), (req, res) => {
  res.json(pingry.getNews());
});

app.get("/ddd", auth(["basic"]), (req, res) => {
  res.json(pingry.getDDDSchedule());
});

app.get("/lunch", auth(["basic"]), (req, res) => {
  if(req.query.date){
    res.json(pingry.getMenuForDate(req.query.date));
  }else{
    res.json(pingry.getLunchMenu());
  }
});

app.get("/override", auth(["basic"]), (req, res) => {
  res.json(pingry.getOverride());
})

app.post("/updateOverride", auth(["admin"]), (req, res) => {
  try {
    var newOverride = JSON.parse(req.body.newJSON);
    fs.writeFile("RemoteConfig.json", req.body.newJSON, (err) => {
      if(err){
        console.error("Error updating remote override file:");
        console.error(err);
        return res.status(500).send("Error saving to file");
      }
      return res.status(200).send("Success");
    })
  }catch(e){ return res.status(400).send("Error parsing JSON")}
})

app.post("/updateAthletics", auth(["admin"]), (req, res) => {
  try {
    var newAthletics = JSON.parse(req.body.newJSON);
    fs.writeFile("AthleticCalendars.json", req.body.newJSON, (err) => {
      if(err){
        console.error("Error updating remote override file:");
        console.error(err);
        return res.status(500).send("Error saving to file");
      }
      return res.status(200).send("Success");
    });
  }catch(e){
    console.error(e);
    return res.status(400).send("Error parsing JSON");
  }
})

app.get("/forceRefresh", auth(["admin"]), (req, res) => {
  pingry.refresh(() => {
    return res.status(200).send("Success");
  });
})

//Refresh from the API, then load the server
pingry.refresh(()=>{
  app.listen(PORT, () => {
    console.log("Server started on port "+PORT+".");
  });
});

//Reloads the api keys file
setInterval(()=>apiKeys = JSON.parse(fs.readFileSync("./api_keys.json")), KEY_REFRESH_INTERVAL*60*1000);

setInterval(()=> pingry.refresh(), API_REFRESH_INTERVAL*60*1000);
