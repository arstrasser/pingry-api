function parseStringForTime(d, str){
  var local = false;
  if(str.indexOf("Z") == -1){
    local = true;
  }
  //Initializes the date to be 1 day ahead because setting the time goes backwards a day for some reason...
  if(str.indexOf("T") != -1){
    str = str.substring(str.indexOf("T")+1);
  }
  if(str.indexOf(".") != -1){
    str = str.substring(0, str.indexOf(".")) + str.substring(str.indexOf(".")+4);
  }
  //Replace all spaces
  str = str.replace(/ /g, "");
  //Replace all colons
  str = str.replace(/:/g, "");
  d.setHours(parseInt(str.substring(0,2)));
  d.setMinutes(parseInt(str.substring(2,4)));
  d.setSeconds(parseInt(str.substring(4,6)));
  if(str.substring(6,7) == "-" || str.substring(6,7) == "+"){
    d.setTime(d.getTime() - (d.getTimezoneOffset()/60.0 + parseInt(str.substring(6))/100.0)*1000*60*60);
  }
  //If this is already in EST, disable over-compensation for timezones

  if(!local){
    d.setTime(d.getTime() - d.getTimezoneOffset()*1000*60);
  }
  return d.getTime();
}

function monthNameToInt(str) {
  switch(str){
  case "Jan":
    return 0;
  case "Feb":
    return 1;
  case "Mar":
    return 2;
  case "Apr":
    return 3;
  case "May":
    return 4;
  case "Jun":
    return 5;
  case "Jul":
    return 6;
  case "Aug":
    return 7;
  case "Sep":
    return 8;
  case "Oct":
    return 9;
  case "Nov":
    return 10;
  case "Dec":
    return 11;
  }
}

exports.parseStringForDate = (str) => {
  if(str instanceof Date){
    return str;
  }
  var d = new Date(0);

  //Replace all dashes
  str = str.substring(0,10).replace(/-/g, "") + str.substring(10);
  if(str.indexOf(" ") == -1){
    d.setFullYear(parseInt(str.substring(0,4)));
    d.setDate(parseInt(str.substring(6,8)));
    d.setMonth(parseInt(str.substring(4,6))-1);
    d.setHours(0);
    d.setMinutes(0);
    d.setSeconds(0);
    if(str.length > 9){
      str = str.substring(8);
      parseStringForTime(d, str);
    }
  }else if(str.substring(3,4) == ","){
    str = str.substring(5);
    d.setDate(parseInt(str.substring(0,2)));
    d.setMonth(monthNameToInt(str.substring(3,6)));
    d.setFullYear(parseInt(str.substring(7,11)));
    if(str.length > 11){
      str = str.substring(11);
      parseStringForTime(d, str);
    }
  }
  else{
    console.warn("INVALID: "+str);
  }
  return d;
};

exports.dateToDayString = (d) => {
  return ""+d.getFullYear()+(d.getMonth()+1<10?"0":"")+(d.getMonth()+1)+(d.getDate()<10?"0":"")+d.getDate();
};

exports.setDay = (d, day) => {
  d.setDate(d.getDate() - d.getDay() + day);
  return d;
};

exports.weekdayToNum = (str) => {
  switch(str){
  case "SU":
    return 0;
  case "MO":
    return 1;
  case "TU":
    return 2;
  case "WE":
    return 3;
  case "TH":
    return 4;
  case "FR":
    return 5;
  case "SA":
    return 6;
  default:
    return -1;
  }
};
