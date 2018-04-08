import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { JsonManagerService } from '../json-manager.service';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SchedulePageComponent {
  data = [];
  scheduleOptions = [];
  dataSource = new MatTableDataSource(this.data);
  columns=["date","type","value"]
  constructor(private manager:JsonManagerService, public snackBar:MatSnackBar) {
    this.manager.addRefreshCallback(() => this.update());
  }

  update(){
    this.data = [];
    for(var i in this.manager.scheduleTypes){
      this.scheduleOptions.push(this.manager.scheduleTypes[i].name);
    }
    for(var i in this.manager.json.scheduleOverride){
      if(this.manager.json.scheduleOverride.hasOwnProperty(i)){
        var obj = JSON.parse(JSON.stringify(this.manager.json.scheduleOverride[i]));
        obj.date = i;
        if(obj.classes){
          obj.classes = JSON.stringify(obj.classes);
        }
        this.data.push(obj);
      }
    }
    this.data.push({date:this.manager.dateToDayString(new Date()), type:'', temp:true});
    console.log(this.data);
    this.dataSource = new MatTableDataSource(this.data);
  }

  onDateChange(elem, event){
    var str = this.manager.dateToDayString(event.value);
    if(elem.temp){
      elem.date = str;
    }else{
      if(this.manager.json.scheduleOverride.hasOwnProperty(str)){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
      }else if(elem.type == "automatic"){
        if(elem.name != ""){
          delete this.manager.json.scheduleOverride[elem.date];
          this.manager.json.scheduleOverride[str] = {type:elem.type, name:elem.name};
          this.update();
          this.manager.change();
        }
      }else if(elem.type == "manual"){
        try{
          let classes = JSON.parse(elem.classes);
          delete this.manager.json.scheduleOverride[elem.date];
          this.manager.json.scheduleOverride[str] = {type:elem.type, classes}
          this.update();
          this.manager.change();
        }catch(e){
          console.log("JSON parsing error: ", e);
          this.snackBar.open("Invalid custom schedule JSON", "Close", {panelClass:"snackbar-error", duration:3000});
        }
      }else{
        this.snackBar.open("Invalid type", "Close", {panelClass:"snackbar-error", duration:3000});
      }
    }
  }

  getDateFromString(str){
    if(!this.manager.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem){
    if(!elem.temp){
      if(elem.type == "automatic"){
        if(elem.name != ""){
          this.manager.json.scheduleOverride[elem.date] = {type:elem.type, name:elem.name};
          this.update();
          this.manager.change();
        }
      }else if(elem.type == "manual"){
        try{
          let classes = JSON.parse(elem.classes);
          this.manager.json.scheduleOverride[elem.date] = {type:elem.type, classes}
          this.update();
          this.manager.change();
        }catch(e){
          console.log("JSON parsing error: ", e);
          this.snackBar.open("Invalid custom schedule JSON", "Close", {panelClass:"snackbar-error", duration:3000});
        }
      }else{
        this.snackBar.open("Invalid type", "Close", {panelClass:"snackbar-error", duration:3000});
      }
    }
  }

  removeItem(item){
    delete this.manager.json.scheduleOverride[item.date];
    this.manager.change();
    this.update();
  }

  addItem(item){
    if(this.manager.json.scheduleOverride.hasOwnProperty(item.date)){
      this.snackBar.open("This date already exists", "Close", {panelClass:"snackbar-error", duration:3000})
    }else if(this.manager.checkDate(item.date) && item.type != ""){
      if(item.type == "automatic"){
        if(item.name != ""){
          this.manager.json.scheduleOverride[item.date] = {type:item.type, name:item.name};
          this.update();
          this.manager.change();
        }else{
          this.snackBar.open("Choose ", "Close", {panelClass:"snackbar-error", duration:3000})
        }
      }else if(item.type == "manual"){
        try{
          let classes = JSON.parse(item.classes);
          this.manager.json.scheduleOverride[item.date] = {type:item.type, classes}
          this.update();
          this.manager.change();
        }catch(e){
          console.log("JSON parsing error: ", e);
          this.snackBar.open("Invalid custom schedule JSON", "Close", {panelClass:"snackbar-error", duration:3000});
        }
      }else{
        this.snackBar.open("Please enter a schedule type", "Close", {panelClass:"snackbar-error", duration:3000})
      }
    }else {
      this.snackBar.open("Invalid type", "Close", {panelClass:"snackbar-error", duration:3000});
    }
  }

}
