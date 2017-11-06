const port = 3000;

let pingry = new (require("./api/api").PAPI)();
const express = require('express');

let app = new express();

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
  //console.log(pingry.getLetterForDate(new Date(Date.now()-1000*60*60*24*2)));
  app.listen(port, () => {
    console.log("Server started on port "+port+".");
  });
});
