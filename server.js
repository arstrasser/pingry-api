const port = 3000;

let pingry = new (require("./api/api").PAPI)();
const express = require('express');
const helmet = require('helmet')
const rateLimit = require('express-rate-limit');

let app = new express();
app.use(helmet());

let apiKeys = require("./api_keys").keys;
let limiter = new rateLimit({
  windowMs: 15*60*1000, // 15 minutes
  delayAfter: 50,
  max: 200,
  delayMs: 1000
});

let auth = (req, res, next) => {
  if(apiKeys.includes(req.query.api_key)) {
    return next();
  }
  else {
    res.status(401).send("Unauthorized");
  }
}

app.use(auth);

app.get("/schedule", (req, res) => {
  if(req.query.date){
    res.json(pingry.getScheduleForDate(new Date(req.query.date)));
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

app.get("/schedule/types", (req, res) => {
  res.json(pingry.typeList);
});

app.get("/letter", (req, res) => {
  if(req.query.date){
    const index = pingry.getLetterIndexOf(req.query.date);
    if(index > -1){
      res.json(pingry.letterTimes[index]);
    }
    else{
      res.json({"err":"Date not Found"});
    }
  }else if(req.query.letter){
    res.json(pingry.letterTimes[pingry.letterToNumber(req.query.letter)]);
  }else{
    res.json(pingry.letterTimes);
  }
});

app.get("/announcements", (req, res) => {
  res.json(pingry.getAnnouncements());
});

app.get("/news", (req, res) => {
  res.json(pingry.getNews());
});

app.get("/ddd", (req, res) => {
  res.json(pingry.getDDDSchedule());
});

app.get("/lunch", (req, res) => {
  if(req.query.date){
    res.json(pingry.getMenuForDate(req.query.date));
  }else{
    res.json(pingry.getLunchMenu());
  }
});

pingry.refresh(()=>{
  app.listen(port, () => {
    console.log("Server started on port "+port+".");
  });
});
