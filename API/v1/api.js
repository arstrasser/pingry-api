/**
 * @file Javascript class file for the Pingry API v1
 * @author Alex Strasser
 * @version 2018.06.20
 */


//Configuration Constants:
const collabDatesURL =      "https://www.pingry.org/calendar/calendar_388.ics";
const specialScheduleURL =  "https://calendar.google.com/calendar/ical/pingry.org_kg3ab8ps5pa70oj41igegj9kjo%40group.calendar.google.com/public/basic.ics";
const letterDayURL =        "https://www.pingry.org/calendar/calendar_384.ics";
//const remoteOverrideURL =  "http://mirror.pingry.k12.nj.us/software/RemoteConfig.json?d="; REMOTE OVERRIDE NOW STORED LOCALLY
const veracrossAthleticsURL="http://integrate.pingry.k12.nj.us/PingryToday/athletics.json";
const announcementsURL =    "https://www.pingry.org/rss.cfm?news=16&d=";
const newsURL1 =            "https://www.pingry.org/rss.cfm?news=13&d=";
const newsURL2 =            "https://www.pingry.org/rss.cfm?news=14&d=";
const lunchURL =            "http://www.sagedining.com/intranet/apps/mb/pubasynchhandler.php?unitId=S0091&mbMenuCardinality=0&_=";


//Imports:
const fs = require('fs');
const request = require('request');
const feedParse = require('./feedParse');
const dfp = require('./dateFunctions');
const path = require('path');
const mongojs = require('mongojs');

const letterInfo = [
  {"letter":"A", "schedule":[1,2,3,4]},
  {"letter":"B", "schedule":[5,6,7,1]},
  {"letter":"C", "schedule":[2,3,4,5]},
  {"letter":"D", "schedule":[6,7,1,2]},
  {"letter":"E", "schedule":[3,4,5,6]},
  {"letter":"F", "schedule":[7,1,2,3]},
  {"letter":"G", "schedule":[4,5,6,7]},
  {"letter":"R", "schedule":[1,2,3,4,5,6,7]}
];

let db = mongojs('mongodb://127.0.0.1:27017/PingryAPI');

exports.PAPI1 = class {
  constructor(){
    //Global Variables:
    this.refreshing = false;
    this.scheduledDays = {};
    this.cpEvents = {};
    this.ctEvents = {};
    this.cpOverride = [];
    this.ctOverride = [];
    this.typeList = [];
    this.announcements = [];
    this.news = [];
    this.menuStartDate = null;
    this.myMenu = [];
    this.ddd = {};
    this.athleticInfo = [];
    this.athleticSchedules = {};
    this.allAthleticEvents = [];
    this.gradePointTotals = [0, 0, 0, 0];
    this.scheduleOverride = [];
    this.letterOverride = [];
    this.letterTimes = JSON.parse(JSON.stringify(letterInfo));
    for(let i =0; i < this.letterTimes.length; i++){
      this.letterTimes[i].dates = [];
    }
  }

  letterToNumber(letter){
    switch(letter){
    case "A":
      return 0;
    case "B":
      return 1;
    case "C":
      return 2;
    case "D":
      return 3;
    case "E":
      return 4;
    case "F":
      return 5;
    case "G":
      return 6;
    case "R":
      return 7;
    default:
      return -1;
    }
  }

  getLetterIndexOf(str){
    //Combine Letter Day override
    for(let i = 0; i < this.letterOverride.length; i++){
      if(str == this.letterOverride[i].date){
        return this.letterToNumber(this.letterOverride[i].letter);
      }
    }
    //Iterate through each letter
    for(let i = 0; i < this.letterTimes.length; i++){
      //Iterate through each date
      for(let j = 0; j < this.letterTimes[i].dates.length; j++){
        //If the date equals the date we're looking for
        if(this.letterTimes[i].dates[j] == str){
          //Return the index
          return i;
        }
      }
    }
    //Returns -1 if it can't find it
    return -1;
  }

  getOverriddenLetterDayDates(letter){
    let dates = JSON.parse(JSON.stringify(this.letterTimes))[this.letterToNumber(letter)].dates;
    for(let i = 0; i < this.letterOverride.length; i++){
      //If the date exists somewhere, we need to remove it.
      for(let j = 0; j < dates.length; j++){
        if(dates[j] == this.letterOverride[i].date){
          //Return the index
          dates.splice(j, 1);
          break;
        }
      }
      if(this.letterOverride[i].letter == letter){
        dates.push(this.letterOverride[i].date);
      }
    }
    return dates;
  }

  getOverriddenLetterTimes(){
    let letterTimes = JSON.parse(JSON.stringify(letterInfo));
    for(let i = 0; i < letterTimes.length; i++){
      letterTimes[i].dates = this.getOverriddenLetterDayDates(letterTimes[i].letter);
    }
    return letterTimes;
  }

  getLetterInfo(){
    return letterInfo;
  }

  getLetterOverride(){
    return this.letterOverride;
  }

  async updateLetterOverride(newOverride){
    this.letterOverride = newOverride;

    return new Promise((resolve, reject) => {
      db.collection("letteroverride").remove({}, (err) =>{
        if(err){
          reject(err);
        }
        db.collection("letteroverride").insert(newOverride, (err) =>{
          if(err){
            console.warn("LETTER OVERRIDE LOST. ERROR WHILE UPDATING:");
            console.warn(err);
            reject(err);
          }
          resolve();
        });
      });
    });
  }

  getCTEvents(){
    let ct = JSON.parse(JSON.stringify(this.ctEvents)); //Deep copy the object
    for(var i = 0; i < this.ctOverride.length; i++){
      ct[this.ctOverride[i].date] = this.ctOverride[i].name;
    }
    return ct;
  }

  getCTOverride(){
    return this.ctOverride;
  }

  async updateCTOverride(newOverride){
    this.ctOverride = newOverride;
    return new Promise((resolve, reject) => {
      db.collection("ctevents").remove({}, (err) =>{
        if(err){
          reject(err);
        }
        db.collection("ctevents").insert(newOverride, (err) =>{
          if(err){
            console.warn("CT EVENTS LOST. ERROR WHILE UPDATING:");
            console.warn(err);
            reject(err);
          }
          resolve();
        });
      });
    });
  }

  getCPEvents(){
    let cp = JSON.parse(JSON.stringify(this.cpEvents)); //Deep copy the object
    for(var i = 0; i < this.cpOverride.length; i++){
      cp[this.cpOverride[i].date] = this.cpOverride[i].name;
    }
    return cp;
  }

  getCPOverride(){
    return this.cpOverride;
  }

  async updateCPOverride(newOverride){
    this.cpOverride = newOverride;
    return new Promise((resolve, reject) => {
      db.collection("cpevents").remove({}, (err) =>{
        if(err){
          reject(err);
        }
        db.collection("cpevents").insert(newOverride, (err) =>{
          if(err){
            console.warn("CP EVENTS LOST. ERROR WHILE UPDATING:");
            console.warn(err);
            reject(err);
          }
          resolve();
        });
      });
    });
  }

  getLetterForDate(d) {
    let index = this.getLetterIndexOf(d);
    if(index != -1){
      return this.letterTimes[index];
    }
    return null;
  }

  getAthleticCalendars(){
    return this.athleticInfo;
  }

  getScheduleOverride(){
    return this.scheduleOverride;
  }

  async updateScheduleOverride(newOverride){
    this.scheduleOverride = newOverride;
    return new Promise((resolve, reject) => {
      db.collection("scheduleoverride").remove({}, (err) =>{
        if(err){
          reject(err);
        }
        db.collection("scheduleoverride").insert(newOverride, (err) =>{
          if(err){
            console.warn("SCHEDULE OVERRIDE LOST. ERROR WHILE UPDATING:");
            console.warn(err);
            reject(err);
          }
          resolve();
        });
      });
    });
  }

  getScheduleByName(name) {
    for(let i = 0; i < this.typeList.length; i++){
      //If found the respective schedule for the day
      if(this.typeList[i].name == name){
        return this.typeList[i].schedule;
      }
    }
    console.error("Couldn't find schedule: "+name);
    return [];
  }

  getScheduleForDate(d){
    //If there is an override for this day
    for(let i = 0; i < this.scheduleOverride.length; i++){
      if(this.scheduleOverride[i].date == d){
        if(this.scheduleOverride[i].type == "manual"){
          return {schedule: this.scheduleOverride[i].schedule, name: "manual"};
        }else{
          return {schedule: this.getScheduleByName(this.scheduleOverride[i].name), name: this.scheduleOverride[i].name};
        }
      }
    }

    //If there is a special schedule
    if(this.scheduledDays != null && this.scheduledDays[d] != undefined){
      return {schedule: this.getScheduleByName(this.scheduledDays[d]), name:this.scheduledDays[d]};
    }

    //If there is no special schedule (override or regular assembly)
    if(this.getLetterForDate(d)!== null){
      //Fallback: Return the normal schedule
      return {schedule: this.typeList[0].schedule, name: this.typeList[0].name};
    }

    //If absolutely no schedule
    return {schedule: [], name: "No Schedule"};
  }

  getAllSchedules(){
    let schedules = {};

    //Add all the overrides
    for(let i = 0; i < this.scheduleOverride.length; i++){
      let override = this.scheduleOverride[i];
      if(override.type == "manual"){
        schedules[override.date] = {type:override.type, schedule: override.schdeule};
      }else{
        schedules[override.date] = {type:override.type, name:override.name};
      }
    }

    //Add all the regular schedules
    for(let date in this.scheduledDays){
      if(this.scheduledDays.hasOwnProperty(date) && !schedules[date]){
        schedules[date] = {type:"automatic", name:this.scheduledDays[date]};
      }
    }

    return schedules;
  }

  getScheduleTypes(){
    return this.typeList;
  }

  async updateScheduleTypes(newTypes){
    this.typeList = newTypes;
    return new Promise((resolve, reject) => {
      db.collection("scheduletypes").remove({}, (err) =>{
        if(err){
          reject(err);
        }
        db.collection("scheduletypes").insert(newTypes, (err) =>{
          if(err){
            console.warn("SCHEDULE TYPES LOST. ERROR WHILE UPDATING:");
            console.warn(err);
            reject(err);
          }
          resolve();
        });
      });
    });
  }

  getPrideLeaderboard(){
    return [
      {name:"Form III", total:this.gradePointTotals[0]},
      {name:"Form IV", total:this.gradePointTotals[1]},
      {name:"Form V", total:this.gradePointTotals[2]},
      {name:"Form VI", total:this.gradePointTotals[3]}
    ];
  }

  async getPrideEvent(id){
    return new Promise((resolve, reject) => {
      db.collection("prideevents").findOne({_id:mongojs.ObjectId(id)}, (err, data) => {
        if(err){
          reject(err);
        }else{
          resolve(data);
        }
      });
    });
  }

  async getPrideEventFromCode(code) {
    return new Promise((resolve, reject) => {
      db.collection("prideevents").findOne({code}, (err, doc) => {
        console.log(doc);
        if(err){
          reject(err);
        }else if(!doc){
          reject("Not found");
        }else if(!doc.active){
          reject("Not yet active");
        }else{
          doc.id = doc._id.toHexString();
          delete doc._id;
          resolve(doc);
        }
      });
    });
  }

  async increaseEventCount(id){
    return new Promise((resolve, reject) => {
      db.collection("prideevents").update(
        {_id:mongojs.ObjectId(id)},
        {$inc:{numberAttended:1}},
        {},
        (err) => {
          if(err){ reject(err); }
          else resolve();
        });
    });
  }

  async getAllPrideEvents(){
    return new Promise((resolve, reject) => {
      db.collection("prideevents").find({}, (err, data) => {
        if(err){
          reject(err);
        }else{
          for(let i in data){
            data[i].id = data[i]._id.toHexString();
            delete data[i]._id;
          }
          resolve(data);
        }
      });
    });
  }

  async createPrideEvent(name, points, code){
    return new Promise((resolve, reject) => {
      db.collection("prideevents").insert({name, points, code, active:false, numberAttended:0}, (err, doc) => {
        if(err){
          reject(err);
        }else{
          doc.id = doc._id.toHexString();
          delete doc._id;
          resolve(doc);
        }
      });
    });
  }

  async setPrideEventActive(id, isActive){
    return new Promise((resolve, reject) => {
      db.collection("prideevents").update({_id:mongojs.ObjectId(id)}, {$set:{active:isActive}}, (err) => {
        if(err){
          reject(err);
        }else{
          resolve();
        }
      });
    });
  }

  getAllAthleticSchedules(){
    return this.athleticSchedules;
  }

  getAthleticScheduleForTeam(teamId){
    return this.athleticSchedules[teamId];
  }

  getAllAthleticEvents(){
    return this.allAthleticEvents;
  }

  getAnnouncements(){
    return this.announcements;
  }

  async updateAthleticSchedules(newSchedules){
    return new Promise((resolve, reject) => {
      db.collection("athleticteams").remove({}, (err) =>{
        if(err){
          reject(err);
        }
        db.collection("athleticteams").insert(newSchedules, (err) =>{
          if(err){
            console.warn("SCHEDULE TYPES LOST. ERROR WHILE UPDATING:");
            console.warn(err);
            reject(err);
          }

          //Updating the athletic schedules is a complicated operation.
          //We refresh here instead of using a hotfix
          this.refresh(() => {
            resolve();
          });
        });
      });
    });
  }

  getNews(){
    return this.news;
  }

  getDDDSchedule(){
    return this.ddd;
  }

  getLunchMenu(){
    return this.myMenu;
  }

  getMenuForDate(str){
    var d = dfp.parseStringForDate(str);
    d.setUTCHours(12);

    var timeDiff = d.getTime() - this.menuStartDate.getTime();
    var dayDiff = timeDiff / 1000 / 60 / 60 / 24;
    var dayNumber = (dayDiff+this.menuStartDate.getDay()) % 7;
    var weekNumber = Math.ceil((dayDiff - dayNumber) / 7);
    if(weekNumber > this.myMenu.length || weekNumber < 0 || dayNumber > this.myMenu[weekNumber].length || dayNumber < 0){
      return [];
    }
    return this.myMenu[weekNumber][dayNumber];
  }

  addGradePoints(year, numPoints){
    let d = new Date();
    let freshmanClassYear;
    if(d.getMonth() >= 7 ) freshmanClassYear = d.getFullYear() + 4; //Resets at the beginning of August to the next class year
    else freshmanClassYear = d.getFullYear() + 3;
    let index = freshmanClassYear - year;
    if(index >= 0 && index < 4){
      this.gradePointTotals[index] += numPoints;
      return true;
    }else{
      return false;
    }
  }

  async updateDDD(newDDD){
    this.ddd = newDDD;
    return new Promise((resolve, reject) => {
      db.collection("ddd").remove({}, false, (err)=> {
        if(err){
          reject(err);
        }
        else{
          var update = [];
          for(var i in newDDD){
            if(newDDD.hasOwnProperty(i)){
              update.push({"date":i, "type":newDDD[i]});
            }
          }
          db.collection("ddd").insert(update, (err) => {
            if(err){
              console.warn("DDD LOST. ERROR WHILE UPDATING:");
              console.warn(err);
              reject(err);
            }
            resolve();
          });
        }
      });
    });
  }

  refresh(callback){
    var counter = 1; //Initialize counter to 1 to make sure that all the requests necessary are made before checking if done.
    function makeRequest(url, callback2){
      counter++;
      request({url, headers:{
        "User-Agent":"Mozilla/5.0"
      }}, (err, res, body) => {
        if(!err && res.statusCode && res.statusCode == 200){
          callback2(body);
        }else if(err){
          console.error("ERROR fetching: "+url);
          console.error(err);
        }else {
          console.warn("Couldn't fetch "+url);
          console.log('Status Code:', res.statusCode);
        }
        counter--;
        checkIfDone();
      });
    }
    let checkIfDone = () => {
      if(counter == 0){
        var i;

        this.allAthleticEvents = [];
        for(i in this.athleticSchedules){
          if(this.athleticSchedules.hasOwnProperty(i)){
            this.allAthleticEvents = this.allAthleticEvents.concat(this.athleticSchedules[i]);
          }
        }
        console.log(this.allAthleticEvents.length);
        this.allAthleticEvents.sort((a,b) => {
          if(a.startTime==b.startTime){
            if(a.title == b.title) return a.desc.localeCompare(b.desc);
            else return a.title.localeCompare(b.title);
          }
          else return a.startTime - b.startTime;
        });

        this.refreshing = false;
        if(callback){
          callback();
        }
      }
    };

    this.refreshing = true;

    counter++;
    db.collection("letteroverride").find((err, data) => {
      if(err){
        console.warn(err);
      }else{
        this.letterOverride = data;
      }
      counter--;
      checkIfDone();
    });

    counter++;
    db.collection("scheduleoverride").find((err, data) => {
      if(err){
        console.warn(err);
      }else{
        this.scheduleOverride = data;
      }
      counter--;
      checkIfDone();
    });

    counter++;
    db.collection("scheduletypes").find((err, data) => {
      if(err){
        console.warn(err);
      }else{
        this.typeList = data;
      }
      counter--;
      checkIfDone();
    });

    counter++;
    db.collection("ddd").find((err, data) => {
      if(err){
        console.warn(err);
      }else{
        this.ddd = {};
        for(let i = 0; i < data.length; i++){
          this.ddd[data[i].date] = data[i].type;
        }
      }
      counter--;
      checkIfDone();
    });

    counter++;
    db.collection("ctevents").find((err, data) => {
      if(err){
        console.warn(err);
      }else{
        this.ctOverride = data;
      }
      counter--;
      checkIfDone();
    });

    counter++;
    db.collection("cpevents").find((err, data) => {
      if(err){
        console.warn(err);
      }else{
        this.cpOverride = data;
      }
      counter--;
      checkIfDone();
    });

    counter++;
    this.gradePointTotals = [0, 0, 0, 0];
    db.collection("users").find({}, (err, data) => {
      let d = new Date();
      let freshmanClassYear;
      if(d.getMonth() >= 7 ) freshmanClassYear = d.getFullYear() + 4; //Resets at the beginning of august
      else freshmanClassYear = d.getFullYear() + 3;
      if(err){
        console.warn(err);
      }else{
        for(var i = 0; i < data.length; i++){
          if(data[i].type == "student"){
            let index = freshmanClassYear - data[i].year;
            if(index >= 0 && index < 4){
              this.gradePointTotals[index] += data[i].pridePoints;
            }
          }
        }
      }
      counter--;
      checkIfDone();
    });

    counter++;
    db.collection("athleticteams").find((err, data) => {
      if(err){
        console.warn(err);
      }else{
        this.athleticInfo = data;
        makeRequest(veracrossAthleticsURL, (res) => {
          try{
            var events = JSON.parse(res);
          }catch(e) {
            console.warn("ERROR PARSING VERACROSS JSON");
            return;
          }
          this.athleticSchedules = [];
          for(let i = 0; i < events.length; i++){ //For each event
            if(events[i].primary_group){ //Skip this part of the code
              for(var k = 0; k < this.athleticInfo.length; k++){ //Search for the team in athleticInfo
                let group = this.athleticInfo[k].veracross_id;
                if(group && group == events[i].primary_group.substring(0,group.length)){ //See if the primary key matches
                  if(!this.athleticSchedules[this.athleticInfo[k].id]) //If this calendar doesn't have any events yet, calendar is empty
                    this.athleticSchedules[this.athleticInfo[k].id] = [];

                  let startTime;
                  let campus_departure_time;
                  let title = events[i].primary_group;
                  let event_type = events[i].event_type;
                  if(events[i].start_date){
                    startTime = new Date(
                      parseInt(events[i].start_date.substring(0,4)),
                      parseInt(events[i].start_date.substring(5,7))-1,
                      parseInt(events[i].start_date.substring(8,10))
                    );
                    if(events[i].start_time){
                      startTime.setHours(parseInt(events[i].start_time.substring(11, 13)));
                      startTime.setMinutes(parseInt(events[i].start_time.substring(14, 16)));
                      //TODO: is this right for seconds?
                      startTime.setSeconds(parseInt(events[i].start_time.substring(14, 16)));
                    }
                  }

                  if(events[i].campus_departure_time){
                    campus_departure_time = events[i].campus_departure_time.substring(11,19);
                  }

                  if(title){
                    if(title.indexOf(":") != -1){
                      title = title.substring(0, title.indexOf(":"));
                    }
                    if(event_type){
                      title += " - "+event_type;
                    }
                  }

                  this.athleticSchedules[this.athleticInfo[k].id].push({
                    startTime,
                    athletic_opponent:events[i].athletic_opponent,
                    campus_departure_time,
                    desc:events[i].description,
                    event_type,
                    event_status:events[i].event_status,
                    game_outcome:events[i].game_outcome,
                    game_placement:events[i].game_placement,
                    google_map:events[i].google_map,
                    location:events[i].location,
                    primary_group: events[i].primary_group,
                    groups: events[i].groups,
                    title
                    //TODO:Finish this list
                  }); //If it does, add the event to the schedule for that team.
                }
              }
            }
          }

          //Waiting until after Veracross in case Veracross fails
          //If veracross fails, we want to keep the old events instead of getting new ones.
          for(let i = 0; i < this.athleticInfo.length; i++){
            if(!this.athleticInfo[i].veracross_id && this.athleticInfo[i].url){
              ((sportId) => {
                makeRequest(this.athleticInfo[i].url, (res) => {
                  let calEvents = feedParse.parseCalendar(res);
                  for(var j = 0; j < calEvents.length; j++){
                    delete calEvents[j].uid;

                    //Day type event
                    if(calEvents[j].type == "day"){
                      //Set the start time to be the time (makes for easier sorting and display)
                      calEvents[j].startTime = calEvents[j].time;
                      delete calEvents[j].time;
                    }

                    //Convert javascript dates to numbers
                    if(calEvents[j].hasOwnProperty("startTime")){
                      calEvents[j].startTime = calEvents[j].startTime.getTime();
                    }
                    if(calEvents[j].hasOwnProperty("endTime")){
                      calEvents[j].endTime = calEvents[j].endTime.getTime();
                    }

                    //Fix titles and add descriptions
                    if(calEvents[j].desc == undefined){
                      var title = calEvents[j].title;
                      var desc = title.substring(title.indexOf(" - ")+3);
                      title = title.substring(0, title.indexOf(" - "));
                      calEvents[j].title = title;
                      calEvents[j].desc = desc;
                      calEvents[j].event_status = desc.indexOf("CANCELLED")==-1?"N/A":"Cancelled";
                    }
                  }

                  //Sorts the event by time, then by title, then by description
                  calEvents.sort((a,b) => {
                    if(a.startTime==b.startTime){
                      if(a.title == b.title) return a.desc.localeCompare(b.desc);
                      else return a.title.localeCompare(b.title);
                    }
                    else return a.startTime - b.startTime;
                  });

                  this.athleticSchedules[sportId] = calEvents;
                });
              })(this.athleticInfo[i].id);
            }
          }
        });
      }
      counter--;
      checkIfDone();
    });

    makeRequest(specialScheduleURL, (res) => {
      this.scheduledDays = {};
      let calEvents = feedParse.parseCalendar(res);
      let CT = {};
      let CP = {};
      let specialSchedule = {};

      //Iterate over the calendar events
      for(let i=0; i < calEvents.length; i++){
        //If it's a timed event (not a day-long event)
        if(calEvents[i].type == "time" && !!calEvents[i].endTime){
          //Community Time
          if(
            ((calEvents[i].startTime.getHours() == 9 && calEvents[i].startTime.getMinutes() == 45) ||   //Starts at 9:45
              (calEvents[i].startTime.getHours() == 9 && calEvents[i].startTime.getMinutes() == 50)) && //  or      9:50
            ((calEvents[i].endTime.getHours() == 10 && calEvents[i].endTime.getMinutes() == 10) ||      //Ends   at 10:10
              (calEvents[i].endTime.getHours() == 10 && calEvents[i].endTime.getMinutes() == 15))) {    //  or      10:15

            //If community time already has an event scheduled, appends event name
            if(CT[dfp.dateToDayString(calEvents[i].startTime)]){
              //Fixes Duplicate events - TODO: Figure out why this bug occurs
              if(CT[dfp.dateToDayString(calEvents[i].startTime)].indexOf(calEvents[i].title) == -1){
                CT[dfp.dateToDayString(calEvents[i].startTime)] += " & "+calEvents[i].title;
              }
            }
            //Otherwise, just set the variable to the event title
            else {
              CT[dfp.dateToDayString(calEvents[i].startTime)] = calEvents[i].title;
            }
          }
          //CP
          else if(
            ((calEvents[i].startTime.getHours() == 14 && calEvents[i].startTime.getMinutes() == 45) || //Starts at 2:45
              (calEvents[i].startTime.getHours() == 14 && calEvents[i].startTime.getMinutes() == 40) ||  //  or      2:40
              (calEvents[i].startTime.getHours() == 14 && calEvents[i].startTime.getMinutes() == 35)) &&    //  or      2:35

             ((calEvents[i].endTime.getHours() == 15 && calEvents[i].endTime.getMinutes() == 25) ||    //Ends at   3:25
              (calEvents[i].endTime.getHours() == 15 && calEvents[i].endTime.getMinutes() == 30) ||      //  or      3:30
              (calEvents[i].endTime.getHours() == 15 && calEvents[i].endTime.getMinutes() == 15))){      //  or      3:15

            //If CP already has an event scheduled, append current event name
            if(CP[dfp.dateToDayString(calEvents[i].startTime)]){
              if(CP[dfp.dateToDayString(calEvents[i].startTime)].indexOf(calEvents[i].title) == -1){
                CP[dfp.dateToDayString(calEvents[i].startTime)] += " & "+calEvents[i].title;
              }
            }
            //Otherwise, just set the variable to the event title
            else{
              CP[dfp.dateToDayString(calEvents[i].startTime)] = calEvents[i].title;
            }
          }

          //Assembly
          else if(calEvents[i].title.indexOf("Assembly") != -1){
            if(calEvents[i].startTime.getHours() == 9 && calEvents[i].startTime.getMinutes() == 35 && calEvents[i].endTime.getHours() == 10 && calEvents[i].endTime.getMinutes() == 35)
              specialSchedule[dfp.dateToDayString(calEvents[i].endTime)] = "Assembly 60 Minutes";
            else if(calEvents[i].startTime.getHours() == 9 && calEvents[i].startTime.getMinutes() == 35 && calEvents[i].endTime.getHours() == 10 && calEvents[i].endTime.getMinutes() == 15)
              specialSchedule[dfp.dateToDayString(calEvents[i].endTime)] = "Assembly 40 Minutes";
            else if(calEvents[i].startTime.getHours() == 9 && calEvents[i].startTime.getMinutes() == 40 && calEvents[i].endTime.getHours() == 10 && calEvents[i].endTime.getMinutes() == 15)
              specialSchedule[dfp.dateToDayString(calEvents[i].endTime)] = "Assembly 35 Minutes";
            else if(calEvents[i].startTime.getHours() == 9 && calEvents[i].startTime.getMinutes() == 45 && calEvents[i].endTime.getHours() == 10 && calEvents[i].endTime.getMinutes() == 15)
              specialSchedule[dfp.dateToDayString(calEvents[i].endTime)] = "Assembly 30 Minutes";
            else {
              //Check for Winter Festival Schedule
              if(calEvents[i].title.indexOf("Winter Festival") != -1){
                specialSchedule[dfp.dateToDayString(calEvents[i].endTime)] = "Winter Festival";
              }
              //Unknown assembly
              else{
                //console.warn("Unknown Assembly:");
                //console.log(calEvents[i]);
                specialSchedule[dfp.dateToDayString(calEvents[i].endTime)] = "Unknown Assembly";
              }
            }
          }else{
            //console.log("Unknown: "+calEvents[i].startTime.getHours() +":"+calEvents[i].startTime.getMinutes()+" - "+calEvents[i].endTime.getHours() +":"+calEvents[i].endTime.getMinutes());
          }
        }
        //If it's a day type event (occurs for the whole day)
        else if(calEvents[i].type == "day"){
          if(calEvents[i].title.toLowerCase().indexOf("review day") != -1){
            specialSchedule[dfp.dateToDayString(calEvents[i].time)] = "Review Day";
          }
          /*
          // Faculty Collaboration day implementation commented out since using alternate calendar.
          // For faster performance but lower accuracy, uncomment this and remove the first calendar parse.
          if(calEvents[i].title.indexOf("Collab") != -1 && calEvents[i].title.indexOf("Fac") != -1){
            facultyCollabDays.push(dateToDayString(calEvents[i].time));
          }
          */
        }
        else{
          //Unknown event type
          //console.log("Unknown type: ");
          //console.log(calEvents[i]);
        }
      }
      this.ctEvents = CT;
      this.cpEvents = CP;

      this.scheduledDays = specialSchedule;

      //Make these requests later to make sure nothing overlaps
      makeRequest(collabDatesURL, (res) => {
        let calEvents = feedParse.parseCalendar(res);
        for(let i=0; i<calEvents.length; i++){
          //If the event title contains the text Faculty Collaboration Day
          if(calEvents[i].title.indexOf("Faculty Collaboration Day") != -1){
            //Add the date string to a temporary array
            this.scheduledDays[dfp.dateToDayString(calEvents[i].time)] = "Faculty Collaboration";
          }
        }
      });
    });

    makeRequest(letterDayURL, (res) => {
      this.letterTimes = [
        {"letter":"A", "schedule":[1,2,3,4], "dates":[]},
        {"letter":"B", "schedule":[5,6,7,1], "dates":[]},
        {"letter":"C", "schedule":[2,3,4,5], "dates":[]},
        {"letter":"D", "schedule":[6,7,1,2], "dates":[]},
        {"letter":"E", "schedule":[3,4,5,6], "dates":[]},
        {"letter":"F", "schedule":[7,1,2,3], "dates":[]},
        {"letter":"G", "schedule":[4,5,6,7], "dates":[]},
        {"letter":"R", "schedule":[1,2,3,4,5,6,7], "dates":[]}
      ];
      let calEvents = feedParse.parseCalendar(res);
      //Iterate through calendar events
      for(let i = 0; i < calEvents.length; i++){
        //Ensures that it is a day long event
        if(calEvents[i].type == "day"){
          //Adds the first letter of that event to the calendar
          for(let j = 0; j < this.letterTimes.length; j++){
            if(this.letterTimes[j].letter == calEvents[i].title){
              this.letterTimes[j].dates.push(dfp.dateToDayString(calEvents[i].time));
            }
          }
        }
      }
    });

    counter++;
    fs.readFile(path.join(__dirname, "..", "..", "JSON_config", "RemoteConfig.json"), (err, data) =>{
      this.override = JSON.parse(data);
      counter--;
      checkIfDone();
    });

    makeRequest(announcementsURL+Date.now(), res => {
      this.announcements = feedParse.parseRSS(res);
    });

    this.news = [];
    let otherNewsRequestDone = false;
    makeRequest(newsURL1+Date.now(), res => {
      this.news = this.news.concat(feedParse.parseRSS(res));
      if(otherNewsRequestDone){
        this.news.sort((a,b) => parseInt(b.date) - parseInt(a.date));
      }else{
        otherNewsRequestDone = true;
      }
    });

    makeRequest(newsURL2+Date.now(), res => {
      this.news = this.news.concat(feedParse.parseRSS(res));
      if(otherNewsRequestDone){
        this.news.sort((a,b) => parseInt(b.date) - parseInt(a.date));
      }else{
        otherNewsRequestDone = true;
      }
    });

    makeRequest(lunchURL+Date.now(), res => {
      let contents = JSON.parse(res);
      if(!contents.menu || !contents.menu_config || !contents.menu.config.grid || !contents.menu.menu){
        if(!this.myMenu) this.myMenu = [];
        return;
      }
      //const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
      const servingDays = contents.menu.config.grid.servingDays;
      const mealsServed = contents.menu.config.grid.mealsServed;
      const opStations = contents.menu.config.grid.opStations;
      this.menuStartDate = new Date(contents.menuList[0].menuFirstDate*1000);
      let menuItems = contents.menu.menu.items;

      this.myMenu = [];
      //For each week
      for(let i = 0; i < menuItems.length - 1; i++){
        this.myMenu.push([]);

        //For each day of the week
        for(let j = 0; j < menuItems[i].length; j++){
          this.myMenu[i].push([]);
          if(servingDays[j]){

            //For each meal of the day (Should always be lunch on weekdays);
            for(let k = 0; k < menuItems[i][j].length; k++){
              if(mealsServed[j][k]){

                //For each station of each meal
                for(let x = 0; x < menuItems[i][j][k].length; x++){
                  this.myMenu[i][j].push([]);
                  if(opStations[k][x]){

                    //For each meal of each station
                    for(let y = 0; y < menuItems[i][j][k][x].length; y++){
                      this.myMenu[i][j][x].push(menuItems[i][j][k][x][y].t);
                    }
                  }
                }
              }
            }
          }
        }
      }
    });

    counter--; //Take the extra one off the counter from the beginning to make sure it started all the requests
  }
};
