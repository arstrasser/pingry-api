const fs = require("fs");
const request = require('request');

request("http://www.sagedining.com/intranet/apps/mb/pubasynchhandler.php?unitId=S0091&mbMenuCardinality=0&_="+Date.now(), (err, res, body) => {
  let contents = JSON.parse(body);
  const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const servingDays = contents.menu.config.grid.servingDays;
  const mealsServed = contents.menu.config.grid.mealsServed;
  const opStations = contents.menu.config.grid.opStations;
  const startDate = new Date(contents.menuList[0].menuFirstDate*1000);
  console.log("Start Date:", startDate);
  let menuItems = contents.menu.menu.items;

  let myMenu = [];
  //For each week
  for(let i = 0; i < menuItems.length - 1; i++){
    myMenu.push([]);
    console.log("Week "+i+":");

    //For each day of the week
    for(let j = 0; j < menuItems[i].length; j++){
      myMenu[i].push([]);
      console.log(" "+days[j]+":");
      if(servingDays[j]){

        //For each meal of the day (Should always be lunch on weekdays);
        for(let k = 0; k < menuItems[i][j].length; k++){
          if(mealsServed[j][k]){

            //For each station of each meal
            for(let x = 0; x < menuItems[i][j][k].length; x++){
              if(opStations[k][x]){
                myMenu[i][j].push([]);
                for(let y = 0; y < menuItems[i][j][k][x].length; y++){
                  myMenu[i][j][x].push(menuItems[i][j][k][x][y].t);
                  console.log("   "+menuItems[i][j][k][x][y].t);
                }
              }
            }
          }
        }
      }
    }
  }

  console.log(myMenu);

  var temp = new Date();
  var today = new Date(temp.getFullYear(), temp.getMonth(), temp.getDate()+1);
  today.setUTCHours(12);

  var timeDiff = today.getTime() - startDate.getTime();
  var dayDiff = timeDiff / 1000 / 60 / 60 / 24;
  var dayNumber = (dayDiff+startDate.getDay()) % 7;
  var weekNumber = Math.ceil((dayDiff - dayNumber) / 7);

  console.log("Week Number:", weekNumber);
  console.log("Day Number:", dayNumber);
  console.log("Menu:", myMenu[weekNumber][dayNumber]);
});
