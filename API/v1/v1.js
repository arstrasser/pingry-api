/**
 * @file Pingry API Version 1 Endpoints
 * @author Alex Strasser
 * @version 2018.05.06
 */

const API_REFRESH_INTERVAL = 60; //Will refresh the api information from files every X minutes;

const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const rateLimit = require('express-rate-limit');
let pingry = new (require("./api").PAPI1)();
let users = new (require("./user").userManager)();
let auth = new (require("../../auth").auth)();

router.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
  next();
});

//API routes
router.get("/schedule", auth.mw(["basic"]), (req, res) => {
  if(req.query.date){
    res.json(pingry.getScheduleForDate(req.query.date));
  }
  else if(req.query.type){
    let types = pingry.getScheduleTypes();
    for(var i = 0; i < types.length; i++){
      if(types[i].name == req.query.type){
        res.json(types[i]);
        return;
      }
    }
    res.json(types[0]);
  }
  else{
    res.json(pingry.getScheduleTypes()[0]);
  }
});

router.get("/schedule/all", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getAllSchedules());
});

router.get("/schedule/manual/all", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getAllManualSchedules());
});

router.get("/schedule/types", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.typeList);
});

router.get("/schedule/events", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getScheduledEvents());
});

router.get("/schedule/events/CT", auth.mw(["basic"]), (req, res) => {
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

router.get("/schedule/events/CP", auth.mw(["basic"]), (req, res) => {
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

router.get("/letter", auth.mw(["basic"]), (req, res) => {
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

router.get("/athletics/calendarList", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getAthleticCalendars());
});

router.get("/athletics/sports", auth.mw(["basic"]), (req, res) => {
  let sports = req.query.sport;
  if(!sports){return res.json([]);}
  if(typeof sports == "string"){
    sports = new Array(sports);
  }
  let events = [];
  for(let i = 0; i < sports.length; i++){
    let teamEvents = pingry.getAthleticScheduleForTeam(sports[i]);
    if(teamEvents){
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

router.get("/athletics/sports/all", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getAllAthleticEvents());
});

router.get("/announcements", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getAnnouncements());
});

router.get("/news", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getNews());
});

router.get("/ddd", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getDDDSchedule());
});

router.get("/lunch", auth.mw(["lunch"]), (req, res) => {
  if(req.query.date){
    res.json(pingry.getMenuForDate(req.query.date));
  }else{
    res.json(pingry.getLunchMenu());
  }
});

router.get("/override", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getOverride());
});

router.get("/user/accessToken", auth.mw(["user"]), rateLimit({windowMs: 5*60*1000,max: 5}), (req, res) => {
  users.login(req.query.username, req.query.password).then(() => {
    users.generateAccessToken(req.query.username).then((accessToken) => {
      return res.status(200).json({accessToken});
    }, (err) => {
      console.log(err);
      return res.status(500).send("Error generating access token");
    });
  }, () => {
    return res.status(400).send("Error logging in");
  });
});

router.get("/user/username", auth.mw(["user"]), (req, res) => {
  users.getUsername(req.query.accessToken).then((username) => {
    res.status(200).send(username);
  }, () => res.status(401).send("Invalid code"));
});

router.get("/user/pride_points", auth.mw(["user"]), (req, res) => {
  users.getPridePoints(req.query.accessToken).then((points) => {
    res.status(200).send(""+points);
  }, () => res.status(401).send("Invalid code"));
});

router.get("/user/pride_events", auth.mw(["user"]), (req, res) => {
  users.getPrideEvents(req.query.accessToken).then((events) => {
    res.status(200).json(events);
  }, () => res.status(401).send("Invalid code"));
});

router.get("/user/addPrideEvent", auth.mw(["user"]), (req, res) => {
  let code = req.query.code;
  let accessToken = req.query.accessToken;
  if(!code || !accessToken){
    return res.status(400).send("Invalid request");
  }
  pingry.getPrideEventFromCode(code).then((e) => {
    users.getPrideEvents(accessToken).then((events) => {
      console.log(e);
      console.log(events);
      for(var i = 0; i < events.length; i++) {
        if(events[i].eventId == e.id){
          return res.status(400).send("User already attended this event.");
        }
      }
      users.addPrideEvent(accessToken, e.id).then(() => {
        users.addPridePoints(accessToken, e.points).then(() => {
          pingry.increaseEventCount(e.id);
          return res.status(200).send("Event added");
        }, () => {
          return res.status(500).send("Couldn't add pride points");
        });
        users.getUserInfo(accessToken).then((userInfo) => {
          if(userInfo.type == "student"){
            pingry.addGradePoints(userInfo.year, e.points);
          }
        });
      }, () => {
        return res.status(500).send("Couldn't add pride event");
      });
    });
  }, (err) => {
    if(err == "Not yet active")
      res.status(400).send("Event not active");
    res.status(400).send("Invalid code");
  });
});

router.get("/pride/leaderboard", auth.mw(["basic"]), (req, res) => {
  var leaders = pingry.getPrideLeaderboard();
  res.json(leaders.sort((a,b) => b.total - a.total));
});

router.get("/pride/events", auth.mw(["basic"]), (req, res) => {
  pingry.getAllPrideEvents().then(events => {
    //Strip off the location codes
    for(var i = 0; i < events.length; i++){
      delete events[i].code;
    }
    res.status(200).json(events);
  }, (err) => {
    console.warn(err);
    res.status(500).send("Error getting events...");
  });
});

router.get("/pride/event/", auth.mw(["basic"]), (req, res) => {
  pingry.getPrideEvent(req.query.id).then((e) => {
    delete e.code;
    return res.status(200).json(e);
  }, () => {
    return res.status(400).send("Couldn't find that event!");
  });
});

router.post("/pride/event/add", auth.mw(["admin"]), (req, res) => {
  let newEvent;
  console.log(req.body);
  console.log(req.body.name);
  if(!req.body.name){
    try {
      JSON.parse(req.body);
    }catch(e){ return res.status(400).send("Error parsing JSON");}
    newEvent = JSON.parse(req.body);
  }else newEvent = req.body;
  if(!newEvent.name || !newEvent.points || !newEvent.code){
    return res.status(400).send("Invalid Properties");
  }
  pingry.createPrideEvent(newEvent.name, newEvent.points, newEvent.code).then((newEventId) => {
    res.status(200).send(newEventId);
  }, () => {
    res.status(500).send("Error creating pride event.");
  });
});

router.get("/pride/event/activate/", auth.mw(["admin"]), (req, res) => {
  pingry.setPrideEventActive(req.query.id, true).then(() => {
    return res.status(200).send("Activated");
  }, () => {
    return res.status(400).send("Couldn't find that event!");
  });
});
router.get("/pride/event/deactivate/", auth.mw(["admin"]), (req, res) => {
  pingry.setPrideEventActive(req.query.id, false).then(() => {
    return res.status(200).send("Deactivated");
  }, () => {
    return res.status(400).send("Couldn't find that event!");
  });
});

router.post("/updateOverride", auth.mw(["admin"]), (req, res) => {
  try {
    JSON.parse(req.body.newJSON);
    fs.writeFile(path.join(__dirname, "..","..", "JSON_config", "RemoteConfig.json"), req.body.newJSON, (err) => {
      if(err){
        console.error("Error updating remote override file:");
        console.error(err);
        return res.status(500).send("Error saving to file");
      }
      return res.status(200).send("Success");
    });
  }catch(e){ return res.status(400).send("Error parsing JSON");}
});

router.post("/updateScheduleTypes", auth.mw(["admin"]), (req, res) => {
  try {
    var newSchedules = JSON.parse(req.body.newJSON);
    if(!Array.isArray(newSchedules)){
      return res.status(400).send("Error parsing JSON: Not an array!");
    }
    pingry.updateSchedules(newSchedules).then(() => {
      return res.status(200).send("Success");
    }, (err) => {
      console.error("Error updating schedule types:", err);
      return res.status(500).send("Error saving to database");
    });
  }catch(e){
    console.error(e);
    return res.status(400).send("Error parsing JSON");
  }
});

router.post("/updateAthletics", auth.mw(["admin"]), (req, res) => {
  try {
    JSON.parse(req.body.newJSON);
    fs.writeFile(path.join(__dirname, "..","..", "JSON_config", "AthleticCalendars.json"), req.body.newJSON, (err) => {
      if(err){
        console.error("Error updating Athletic Calendar file:");
        console.error(err);
        return res.status(500).send("Error saving to file");
      }
      return res.status(200).send("Success");
    });
  }catch(e){
    console.error(e);
    return res.status(400).send("Error parsing JSON");
  }
});

router.get("/forceRefresh", auth.mw(["admin"]), (req, res) => {
  pingry.refresh(() => {
    return res.status(200).send("Success");
  });
});


setInterval(()=> pingry.refresh(), API_REFRESH_INTERVAL*60*1000);

module.exports.router = router;
module.exports.refresh = (cb) => {
  pingry.refresh(()=>{
    cb(true);
  });
};
