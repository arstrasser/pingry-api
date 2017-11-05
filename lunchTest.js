fs = require("fs");

contents = fs.readFileSync("original.json");
contents = JSON.parse(contents);
const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];

const mealsServed = contents.menu.config.grid.mealsServed;
const opStations = contents.menu.config.grid.opStations;
const servingDays = contents.menu.config.grid.servingDays;
const startDate = new Date(contents.menuList[0].menuFirstDate*1000);
console.log("Start Date:", startDate);
let menuItems = contents.menu.menu.items;

let myMenu = [];
for(let i = 0; i < menuItems.length - 1; i++){
  myMenu.push([]);
  for(let j = 0; j < menuItems[i].length; j++){
    myMenu[i].push([]);
    console.log(days[j]+":");
    if(servingDays[j]){
      for(let k = 0; k < menuItems[i][j].length; k++){
        if(mealsServed[j][k]){
          for(let x = 0; x < menuItems[i][j][k].length; x++){
            if(opStations[x]){
              for(let y = 0; y < menuItems[i][j][k][x].length; y++){
                myMenu[i][j].push(menuItems[i][j][k][x][y].t);
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

var today = new Date();
today.setUTCMilliseconds(0);
today.setUTCSeconds(0);
today.setUTCMinutes(0);
today.setUTCHours(12);

var timeDiff = today.getTime() - startDate.getTime();
console.log(today);
var dayDiff = timeDiff / 1000 / 60 / 60 / 24;
console.log("Week Number:", ~~(dayDiff / 7));
console.log("Day Number:", dayDiff % 7);
console.log("Menu:", myMenu[~~(dayDiff / 7)][dayDiff % 7]);

console.log("Weeks:", myMenu.length);
