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
let pingry = new (require("./API/api").PAPI1)();

let auth = new (require("./auth").auth1)();

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

router.get("/athletics/sports/all", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getAllAthleticEvents());
})

router.get("/announcements", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getAnnouncements());
});

router.get("/news", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getNews());
});

router.get("/ddd", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getDDDSchedule());
});

router.get("/lunch", auth.mw(["basic"]), (req, res) => {
  if(req.query.date){
    res.json(pingry.getMenuForDate(req.query.date));
  }else{
    res.json(pingry.getLunchMenu());
  }
});

router.get("/override", auth.mw(["basic"]), (req, res) => {
  res.json(pingry.getOverride());
})

router.post("/updateOverride", auth.mw(["admin"]), (req, res) => {
  try {
    var newOverride = JSON.parse(req.body.newJSON);
    fs.writeFile(path.join(__dirname, "JSON_config", "RemoteConfig.json"), req.body.newJSON, (err) => {
      if(err){
        console.error("Error updating remote override file:");
        console.error(err);
        return res.status(500).send("Error saving to file");
      }
      return res.status(200).send("Success");
    })
  }catch(e){ return res.status(400).send("Error parsing JSON")}
});

router.post("/updateScheduleTypes", auth.mw(["admin"]), (req, res) => {
  try {
    var newSchedules = JSON.parse(req.body.newJSON);
    fs.writeFile(path.join(__dirname, "JSON_config", "ScheduleTypes.json"), req.body.newJSON, (err) => {
      if(err){
        console.error("Error updating Schedule Type file:");
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

router.post("/updateAthletics", auth.mw(["admin"]), (req, res) => {
  try {
    var newAthletics = JSON.parse(req.body.newJSON);
    fs.writeFile(path.join(__dirname, "JSON_config", "AthleticCalendars.json"), req.body.newJSON, (err) => {
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
})

setInterval(()=> pingry.refresh(), API_REFRESH_INTERVAL*60*1000);

module.exports.router = router;
module.exports.refresh = (cb) => {
  pingry.refresh(()=>{
    cb(true);
  });
}
