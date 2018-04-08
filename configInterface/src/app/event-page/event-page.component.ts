import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { JsonManagerService} from '../json-manager.service';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EventPageComponent {
  columns = ["date", "event"]
  cpData = [];
  cpDataSource = new MatTableDataSource<Element>(this.cpData);
  ctData = [];
  ctDataSource = new MatTableDataSource<Element>(this.cpData);
  constructor(private manager:JsonManagerService, public snackBar:MatSnackBar) {
    this.manager.addRefreshCallback(() => this.update());
  }

  update(){
    this.ctData = [];
    for(let i in this.manager.json.eventsOverride.CT){
      if(this.manager.json.eventsOverride.CT.hasOwnProperty(i)){
        this.ctData.push({"date":i, "event":this.manager.json.eventsOverride.CT[i]});
      }
    }
    this.ctData.push({"date":this.manager.dateToDayString(new Date()), "event":"", "temp":true})
    this.ctDataSource = new MatTableDataSource<Element>(this.ctData);

    this.cpData = [];
    for(let i in this.manager.json.eventsOverride.CP){
      if(this.manager.json.eventsOverride.CP.hasOwnProperty(i)){
        this.cpData.push({"date":i, "event":this.manager.json.eventsOverride.CP[i]});
      }
    }
    this.cpData.push({"date":this.manager.dateToDayString(new Date()), "event":"", "temp":true})
    this.cpDataSource = new MatTableDataSource<Element>(this.cpData);
  }

  onDateChange(elem, event, isCT){
    var str = this.manager.dateToDayString(event.value);
    if(elem.temp){
      elem.date = str;
    }else{
      if((isCT && this.manager.json.eventsOverride.CT.hasOwnProperty(str)) || (!isCT && this.manager.json.eventsOverride.CP.hasOwnProperty(str))){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
      }else if(elem.event == ""){
        this.snackBar.open("Please add an event name", "Close", {panelClass:"snackbar-error", duration:3000});
      }else{
        if(isCT){
          delete this.manager.json.eventsOverride.CT[elem.date];
          this.manager.json.eventsOverride.CT[str] = elem.event;
        }else{
          delete this.manager.json.eventsOverride.CP[elem.date];
          this.manager.json.eventsOverride.CP[str] = elem.event;
        }
        this.manager.change();
        this.update();
      }
    }
  }

  getDateFromString(str){
    if(!this.manager.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem, event, isCT){
    if(elem.temp) return;
    if(isCT) this.manager.json.eventsOverride.CT[elem.date] = event.value;
    else this.manager.json.eventsOverride.CP[elem.date] = event.value;
    this.manager.change();
  }

  removeItem(item, isCT){
    if(isCT) delete this.manager.json.eventsOverride.CT[item.date];
    else delete this.manager.json.eventsOverride.CP[item.date];
    this.manager.change();
    this.update();
  }

  addItem(item, isCT){
    if((isCT && this.manager.json.eventsOverride.CT.hasOwnProperty(item.date)) || (!isCT && this.manager.json.eventsOverride.CP.hasOwnProperty(item.date))){
      this.snackBar.open("This date already exists", "Close", {panelClass:"snackbar-error", duration:3000})
    }else if(this.manager.checkDate(item.date) && item.event != ""){
      if(isCT) this.manager.json.eventsOverride.CT[item.date] = item.event;
      else this.manager.json.eventsOverride.CP[item.date] = item.event;
      this.update();
      this.manager.change();
    }else{
      this.snackBar.open("Please add an event name", "Close", {panelClass:"snackbar-error", duration:3000});
    }
  }
}
