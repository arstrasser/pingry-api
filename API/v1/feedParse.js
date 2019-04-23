const dfp = require("./dateFunctions");

function parseRawRSSDescription(desc){
  let parse = desc;
  desc = "";
  while(parse.indexOf("src=") != -1){ //While there are src elements in the parse
    //Adds the first portion until the src attribute
    desc += parse.substring(0,parse.indexOf("src=")+5);
    //Updates parse to avoid infinite loop over the same item
    parse = parse.substring(parse.indexOf("src=")+5);
    if(parse.substring(0,7) != "http://" && parse.substring(0,8) != "https://"){
      //Insert the extra portion needed in the URL
      desc += "http://www.pingry.org";
    }
  }
  desc += parse; //Add the remaining portion to the end of the string
  return desc;
}

exports.parseCalendar = (data) => {
  let list = [];
  //While there is an event left in the string
  while(data.indexOf("BEGIN:VEVENT") != -1){
    //String of the currrent event
    const event = data.substring(data.indexOf("BEGIN:VEVENT"), data.indexOf("END:VEVENT"));
    //Unique identifier of the event
    let uid = event.substring(event.indexOf("UID:")+4);
    uid = uid.substring(0, Math.min(uid.indexOf("\r"), uid.indexOf("\n")));
    //Name of the event
    let title = event.substring(event.indexOf("SUMMARY:")+8);
    title = title.substring(0, Math.min(title.indexOf("\r"), title.indexOf("\n")));
    //Location of the event
    let loc = "";
    if(event.indexOf("LOCATION") != -1){
      loc = event.substring(event.indexOf("LOCATION:")+9);
      loc = loc.substring(0, Math.min(loc.indexOf("\r"), loc.indexOf("\n")));
      loc = loc.replace(/\\/g, "");
    }
    //Start time of the event
    let dtstart = event.substring(event.indexOf("DTSTART")+7);
    dtstart = dtstart.substring(0, Math.min(dtstart.indexOf("\r"), dtstart.indexOf("\n")));
    let dtend; //End time of the event
    let type; //type of event (day long or time-based) (This is a custom field not found in the ical file)

    let startDate;
    let endDate;

    //Normal Day-type event
    if(dtstart.indexOf("VALUE=") != -1){
      type="day";
      //Eliminates extra text on the beginning of the date
      dtstart = dtstart.substring(dtstart.indexOf("VALUE=")+6);
      if(dtstart.substring(0, 5) == "DATE:"){
        dtstart = dtstart.substring(5);
      }
      //Parses the start time and converts it to a javascript date
      startDate = dfp.parseStringForDate(dtstart);
    }

    //Normal Time-type event:
    else if(dtstart.substring(0,1) == ":"){
      type="time";
      //Eliminate extra colon
      dtstart = dtstart.substring(1);
      //Parse the strings for javascript dates

      startDate = dfp.parseStringForDate(dtstart);


      //Parse for the event end time
      if(event.indexOf("DTEND") != -1){
        dtend = event.substring(event.indexOf("DTEND:")+6);
        dtend = dtend.substring(0, Math.min(dtend.indexOf("\r"), dtend.indexOf("\n")));
        endDate= dfp.parseStringForDate(dtend);
      }else{
        dtend = "";
        endDate = null;
      }
    }

    //Time-based event that Includes Timezone
    else if(dtstart.indexOf("TZID") != -1){
      type="time";
      //Eliminate extra content
      dtstart = dtstart.substring(dtstart.indexOf("TZID=")+5);
      //Parse the end time
      if(event.indexOf("DTEND") != -1){
        dtend = event.substring(event.indexOf("DTEND")+6);
        dtend = dtend.substring(0, Math.min(dtend.indexOf("\r"), dtend.indexOf("\n")));
        dtend = dtend.substring(dtend.indexOf("TZID=")+5);
      }else{
        dtend = "";
      }
      //Assuming EST time zone -- otherwise fails
      if(dtstart.substring(0,17) == "America/New_York:"){
        //Remove the America/New_York time zone identifier
        dtstart = dtstart.substring(17);
        //Parse for times
        startDate = dfp.parseStringForDate(dtstart);

        if(dtend != ""){
          dtend = dtend.substring(17);
          //dtstart = new Date(dtstart.substring(0,4), parseInt(dtstart.substring(4,6))-1, dtstart.substring(6,8), dtstart.substring(9,11), dtstart.substring(11,13), dtstart.substring(13,15));
          endDate = dfp.parseStringForDate(dtend);
        }
      }else{
        //If a time zone other than America/New_York
        type="unknown";
      }
    }
    else{
      //If it isn't one of the above timing types
      type="unknown";
    }

    //If an element contains a recurrence-id this means it is part of a sequence, except it was modified
    //THe recurrence id contains the id of the event that should have been part of the series
    //This element's attributes are the correctly modified attributes of the event
    //We just add a "reccurenceId" attribute to the object during parsing and after parsing remove the incorrect object
    if(event.indexOf("RECURRENCE-ID") != -1){
      let recId = event.substring(event.indexOf("RECURRENCE-ID")+14);
      recId = recId.substring(0, Math.min(recId.indexOf("\r"), recId.indexOf("\n")));
      recId = recId.substring(recId.indexOf(":")+1);
      //Parse for JS Date
      const recDate = new Date(parseInt(recId.substring(0,4)), parseInt(recId.substring(4,6))-1, parseInt(recId.substring(6,8)), parseInt(recId.substring(9,11)), parseInt(recId.substring(11,13)), parseInt(recId.substring(13,15)));

      //Add the object to the list to be dealt with later after parsing
      let obj = {uid, title, type, location:loc, recurrenceId:recDate.getTime()};
      if(type == "day"){
        obj.time = startDate;
      }else if(type == "time"){
        obj.startTime = startDate;
        if(dtend != ""){
          obj.endTime = endDate;
        }
      }
      list.push(obj);
    }

    //This is to check if the event recurs
    else if(event.indexOf("RRULE:") != -1){
      //A string to help with parsing of the next objects
      let recurrence = event.substring(event.indexOf("RRULE:"));
      recurrence = recurrence.substring(0, Math.min(recurrence.indexOf("\r"), recurrence.indexOf("\n")));

      //The date the pattern repeats until
      let until = recurrence.substring(recurrence.indexOf("UNTIL")+6);
      until = until.substring(0, until.indexOf(";"));
      //Convert the string into a JS date
      let untilDate = dfp.parseStringForDate(until);
      //The frequency of the repeat (Yearly, Monthly, Weekly, or Daily)
      let freq = recurrence.substring(recurrence.indexOf("FREQ")+5);
      freq = freq.substring(0, freq.indexOf(";"));

      let byday;

      //Yearly repeating has not been implemented since no events so far repeat yearly
      //If necessary, they can be implemented here
      /*if(freq == "YEARLY"){

      }*/
      //Monthly repeating events
      if(freq == "MONTHLY"){
        //If it repeats by a specific day of the month (only currently implemented method of monthly repetition)
        if(recurrence.indexOf("BYDAY") != -1) {
          //Days of the month it repeats by
          byday = recurrence.substring(recurrence.indexOf("BYDAY")+6);

          //Format of BYDAY will look something like: "1MO,2WE,3TH" or "5WE" or "2TU"
          //The first number is the week number (FIRST monday or SECOND Thursday)
          //The second two characters identify the day of the week (MO is Monday and TU is Tuesday)
          let weekNums = []; //contains the week number (First, Second, Third)
          let byDays = []; // contains the weekday (Monday, Tuesday, Wednesday)
          while(byday.length > 1){
            weekNums.push(parseInt(byday.substring(0,1)));
            byDays.push(dfp.weekdayToNum(byday.substring(1,3)));
            byday = byday.substring(4);
          }

          //Date exceptions to the repeating rule
          let exdates = [];
          let parse = event.substring(event.indexOf("EXDATE"));
          //While there are still dates left to parse for
          while(parse.indexOf("EXDATE") != -1){
            //Temporarily hold the current exdate in temp variable
            let temp = parse.substring(parse.indexOf("EXDATE")+7, Math.min(parse.indexOf("\r"), parse.indexOf("\n")));
            temp = temp.substring(temp.indexOf(":")+1);

            //Add the date to an array
            exdates.push(dfp.dateToDayString(dfp.parseStringForDate(temp)));
            //Remove the parsed date from the string
            parse = parse.substring(parse.indexOf("\n")+1);
          }

          //Repetition starts at the current day
          let curDay = startDate;
          let timeDiff;
          if(type=="time" && dtend != ""){
            //Length of the event (in milliseconds) (if applicable)
            timeDiff = endDate.getTime() - startDate.getTime();
          }
          //While we should add dates
          while(curDay.getTime() <= untilDate.getTime()){
            //The month we should be in
            let curMonth = curDay.getMonth();
            for(let i=0; i<byDays.length; i++){
              curDay.setDate(1);
              //Gets the nth occurence of a weekday in a month (Credits: Aditya Gollapudi):
              if(byDays[i] >= curDay.getDay()){
                curDay.setDate(((byDays[i] - curDay.getDay())+(7*(weekNums[i]-1))) + 1);
              }else{
                curDay.setDate(((7-curDay.getDay()) + byDays[i]) + (7*(weekNums[i] - 1)) + 1);
              }
              //End Credits

              //Makes sure we are in the same month (if there isn't a 5th Wednesday for example so it goes into the next month)
              if(curDay.getMonth() == curMonth){
                //If it isn't a date exception
                if(exdates.indexOf(dfp.dateToDayString(curDay)) == -1){
                  //add the object to the list of events
                  let obj = {uid, title, type, location:loc};
                  if(type == "day"){
                    obj.time = curDay;
                  }else if(type == "time"){
                    obj.startTime = new Date(curDay.getTime());
                    if(timeDiff){
                      obj.endTime = new Date(curDay.getTime() + timeDiff); //Add the time difference back on
                    }
                  }
                  list.push(obj);
                }
              }
            }
            //Increments the month
            curDay.setMonth(curMonth+1);
            curDay.setDate(1);
          }
        }
      }
      //Weekly repeating events
      else if(freq == "WEEKLY"){
        //Find how it repeats
        byday = recurrence.substring(recurrence.indexOf("BYDAY")+6);
        let days = [];
        while(byday.length > 1){
          days.push(dfp.weekdayToNum(byday.substring(0,2)));
          byday = byday.substring(3);
        }
        //Days array will now contain an array of weekday numbers
        // (e.g. [1, 2] for Monday and Tuesday or [5] for Friday or [1,2,3,4,5] for Monday through Friday)

        //Date exemptions (dates when the repetition doesn't apply)
        let exdates = [];
        let parse = event.substring(event.indexOf("EXDATE"));
        while(parse.indexOf("EXDATE") != -1){
          //Find the first date
          let temp = parse.substring(parse.indexOf("EXDATE")+7, parse.indexOf("\n"));
          //Eliminate extra padding
          temp = temp.substring(temp.indexOf(":")+1);

          //Add the date in string form to the array
          exdates.push(dfp.dateToDayString(dfp.parseStringForDate(temp)));
          //Move to the next event
          parse = parse.substring(parse.indexOf("\n")+1);
        }
        //gets the start time of the repeating event
        let curDay = startDate;
        let timeDiff;
        if(type=="time" && dtend != ""){
          //If there is a time based repeating event, store the event length
          timeDiff = endDate.getTime() - startDate.getTime();
        }

        //For each event
        while(curDay.getTime() <= untilDate.getTime()){
          //Starts at Sunday
          curDay = dfp.setDay(curDay, 0);
          //For each day of the week the event should repeat for
          for(let i=0; i<days.length; i++){
            //Sets the day of the week to that day
            curDay = dfp.setDay(curDay, days[i]);
            //If this date is not an exempt date
            if(exdates.indexOf(dfp.dateToDayString(curDay)) == -1){
              //Add the date to the list of events
              let obj = {uid, title, type, location:loc};
              //Figure out timing of the event
              if(type == "day"){
                obj.time = curDay;
              }else if(type == "time"){
                obj.startTime = new Date(curDay.getTime());
                if(timeDiff){
                  obj.endTime = new Date(curDay.getTime() + timeDiff);
                }
              }
              list.push(obj);
            }
          }
          //Goes to the next week
          curDay.setDate(curDay.getDate()+7);
        }
      }
    }

    //Normal, non-repeating event
    else{
      //Add the object to the array of events
      let obj = {uid, title, type, location:loc};
      if(type == "day"){
        obj.time = startDate;
      }else if(type == "time"){
        obj.startTime = startDate;
        if(dtend != "")
          obj.endTime = endDate;
      }else{
        //Log unknown event types to the console
        //Still adds them but doesn't
        console.log("Unknown event: ");
        console.log(obj);
      }
      list.push(obj);
    }
    //Adjust parse to get the next event
    data = data.substring(data.indexOf("END:VEVENT")+10);
  }

  //Sorting algorithm to sort events by descending order for easy debugging
  /*
  list.sort(function(a,b){
    if(a.type == "unknown"){
      return -1;
    }
    return (a.type=="time"?a.startTime:a.time).getTime() > (b.type=="time"?b.startTime:b.time).getTime()?-1:1;
  })
  console.log(list);
  */
  //Parsing to fix reccurring events
  //Fixing Recurrence Id to work and override the events
  //For each object in the array
  for(let i =0; i < list.length; i++){
    //If it has a recurrenceId
    if(list[i].recurrenceId !== undefined){
      let found = false;
      //Loop through to find the event that the recurrenceId refers to
      for(let j=0; j < list.length; j++){
        //If it matches times and it is not the object we just got
        if(list[j].type == "time" && i!=j){
          if(list[i].recurrenceId == list[j].startTime.getTime() && list[i].uid == list[j].uid){
            //Delete the object (since it's been overridden)
            list.splice(j,1);
            if(j < i){
              i--;
            }
            found = true;
            //Break out of the loop and move to the next object
            break;
          }
        }
      }
      if(!found){
        //console.log("Not Found: ");
        //console.log(list[i]);
      }
    }
  }
  return list;
};

exports.parseRSS = (data) => {
  let list = [];
  while(data.indexOf("<item>") != -1){ //While there are still items in the feed
    data = data.substring(data.indexOf("<item>"));
    //Gets the title between the title tags
    let title = data.substring(data.indexOf("<title>")+8, data.indexOf("</title>"));
    title = title.substring(title.indexOf("CDATA[")+6);
    title = title.substring(0, title.indexOf("]"));
    //Gets the article link (NOT YET IMPLEMENTED)
    let link = data.substring(data.indexOf("<link>")+6, data.indexOf("</link>")); //TODO: Implement article linking to the pingry site
    //Parsing of the article for the description
    let temp = data.substring(data.indexOf("<description>")+13, data.indexOf("</description>"));
    let desc = "";
    while(temp.indexOf("CDATA[") != -1){
      temp = temp.substring(temp.indexOf("CDATA[")+6);
      //Removes any stray brackets from the parse
      while(temp.indexOf("[")!= -1 && temp.indexOf("[") < temp.indexOf("]")){
        temp = temp.substring(0, temp.indexOf("["))+temp.substring(temp.indexOf("]")+1);
      }
      desc += temp.substring(0, temp.indexOf("]"));
      temp = temp.substring(temp.indexOf("]")+3);
    }
    const rawDesc = parseRawRSSDescription(desc);
    let img = "";

    //Parses the description to remove all HTML tags to help with pretty printing
    //rawDesc is a variable that contains the raw, unparsed description
    while(desc.indexOf("<")!= -1){
      if(desc.substring(desc.indexOf("<")+1, desc.indexOf("<")+4) == "img"){
        img = desc.substring(desc.indexOf("<")+1, desc.indexOf(">"));
        img = img.substring(img.indexOf('src="')+5);
        img = img.substring(0,img.indexOf('"'));
        if(img.substring(0,7) != "http://" && img.substring(0,8) != "https://"){
          img = 'http://www.pingry.org'+img;
        }
      }else if(desc.substring(desc.indexOf("<")+1, desc.indexOf(">")+3) == "br"){
        desc = desc.substring(0, desc.indexOf("<"))+"\n"+desc.substring(desc.indexOf("<"));
      }
      desc = desc.substring(0, desc.indexOf("<")) + desc.substring(desc.indexOf(">")+1);
      //desc = desc.substring(0, desc.indexOf("<")) + desc.substring(desc.indexOf(">"+1));
    }

    //Published date of the article (NOT YET IMPLEMENTED)
    const date = dfp.parseStringForDate(data.substring(data.indexOf("<pubDate>")+9, data.indexOf("</pubDate")));
    data = data.substring(data.indexOf("</item>")+7); //updates the parse to avoid readding the same item
    //Image uses an inline if statement so that it returns the word "none" as a url if there is no image, or it returns the correct URL with pingry.org added
    list.push({"title":title, "image":img==""?'none':img, "link":link, "description":desc, "rawDescription":rawDesc, "date":date.getTime()});
  }
  return list;
};
