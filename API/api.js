/**
 * @file Javascript class file for the Pingry API
 * @author Alex Strasser
 * @version 2018.01.14
 */

//Configuration Constants:
const collabDatesURL =     "https://www.pingry.org/calendar/calendar_388.ics";
const specialScheduleURL = "https://calendar.google.com/calendar/ical/pingry.org_kg3ab8ps5pa70oj41igegj9kjo%40group.calendar.google.com/public/basic.ics";
const letterDayURL =       "https://www.pingry.org/calendar/calendar_384.ics";
const remoteOverrideURL =  "http://mirror.pingry.k12.nj.us/software/RemoteConfig.json?d=";
const announcementsURL =   "https://www.pingry.org/rss.cfm?news=16&d=";
const newsURL1 =           "https://www.pingry.org/rss.cfm?news=13&d=";
const newsURL2 =           "https://www.pingry.org/rss.cfm?news=14&d=";
const lunchURL =           "http://www.sagedining.com/intranet/apps/mb/pubasynchhandler.php?unitId=S0091&mbMenuCardinality=0&_=";


//Imports:
const fs = require('fs');
const request = require('request');
const feedParse = require('./feedParse');
const dfp = require('./dateFunctions');
const path = require('path');

exports.PAPI = class {
  constructor(){
    //Global Variables:
    this.refreshing = false;
    this.scheduledDays = {};
    this.scheduledEvents = {CP:{}, CT:{}};
    this.typeList = [];
    this.announcements = [];
    this.news = [];
    this.menuStartDate = null;
    this.myMenu = [];
    this.override = {"ddd":{}, "scheduleOverride":{}, "letterOverride":{}, "eventsOverride":{CT:{}, CP:{}}};
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
    //Iterate through each letter
    for(let i = 0; i < this.letterTimes.length; i+=1){
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

  getScheduledEvents(){
    return this.scheduledEvents;
  }

  getLetterForDate(d) {
    let index = this.getLetterIndexOf(d);
    if(index != -1){
      return this.letterTimes[index];
    }
    return null;
  }

  getScheduleForDate(d){
    //If there is a special schedule
    if(this.scheduledDays != null && this.scheduledDays[d] != undefined){
      if(this.scheduledDays[d] == "manual"){
        const override = this.override.scheduleOverride[d];
        if(override && override.type == "manual"){
          return {schedule: override.classes, name: "manual"};
        }
        else{
          console.error("Couldn't find manual schedule!");
        }
      }
      else {
        //Iterate over the schedule types
        for(let i = 0; i < this.typeList.length; i++){
          //If found the respective schedule for the day
          if(this.typeList[i].name == this.scheduledDays[d]){
            return {schedule: this.typeList[i].schedule, name: this.typeList[i].name};
          }
        }
        console.error("Couldn't find schedule: "+this.scheduledDays[d]);
      }
    }

    if(this.getLetterForDate(d)!== null){
      //Fallback: Return the normal schedule
      return {schedule: this.typeList[0].schedule, name: this.typeList[0].name};
    }

    return {schedule: [], name: "No Schedule"};
  }

  getAnnouncements(){
    return this.announcements;
  }

  getNews(){
    return this.news;
  }

  getDDDSchedule(){
    return this.override.ddd;
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

  refresh(callback){
    var counter = 0;
    function makeRequest(url, callback2){
      counter++;
      request(url, (err, res, body) => {
        console.log(url);
        if(err){
          console.error(err);
        }
        console.log('Status Code:', res.statusCode);
        callback2(body);
        counter--;
        checkIfDone();
      });
    }
    let checkIfDone = () => {
      if(counter == 0){
        var i;

        //Combine schedule override
        for(i in this.override.scheduleOverride){
          if(this.override.scheduleOverride.hasOwnProperty(i)){
            this.scheduledDays[i] = this.override.scheduleOverride[i].type;
          }
        }

        //Combine Letter Day override
        for(i in this.override.letterOverride){
          if(this.override.letterOverride.hasOwnProperty(i)){
            var letterIndex = this.getLetterIndexOf(i);
            if(letterIndex !== -1){
              this.letterTimes[letterIndex].dates.splice(this.letterTimes[letterIndex].dates.indexOf(i), 1);
            }
            this.letterTimes[this.letterToNumber(this.override.letterOverride[i])].dates.push(i);
          }
        }

        //Combine CT and CP overrides
        for(i in this.override.eventsOverride.CT){
          if(this.override.eventsOverride.CT.hasOwnProperty(i)){
            this.scheduledEvents.CT[i] = this.override.eventsOverride.CT[i];
          }
        }
        for(i in this.override.eventsOverride.CP){
          if(this.override.eventsOverride.CP.hasOwnProperty(i)){
            this.scheduledEvents.CP[i] = this.override.eventsOverride.CP[i];
          }
        }

        console.log("API Refreshed!");
        if(callback){
          callback();
        }
      }
    };

    this.refreshing = true;
    counter++;
    fs.readFile(path.join(__dirname, "scheduleTypes.json"), (err, data) =>{
      if(err){
        console.warn(err);
      }else{
        this.typeList = JSON.parse(data);
      }
      counter--;
      checkIfDone();
    });

    this.scheduledDays = {};
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

    makeRequest(specialScheduleURL, (res) => {
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
          }*/
        }
        else{
          //Unknown event type
          //console.log("Unknown type: ");
          //console.log(calEvents[i]);
        }
      }
      this.scheduledEvents = {CT, CP};
      this.scheduledDays = specialSchedule;
    });

    makeRequest(letterDayURL, (res) => {
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

    makeRequest(remoteOverrideURL+Date.now(), (res) => {
      this.override = JSON.parse(res);
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
      const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
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
                  if(opStations[k][x]){
                    this.myMenu[i][j].push([]);

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
  }
};
