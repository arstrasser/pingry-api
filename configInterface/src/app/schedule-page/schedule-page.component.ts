import { Component, ViewEncapsulation } from '@angular/core';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import { AppComponent } from '../app.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-schedule-page',
  templateUrl: './schedule-page.component.html',
  styleUrls: ['./schedule-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class SchedulePageComponent {
  data:any = [];
  scheduleTypes:any = [];
  dataSource = new MatTableDataSource(this.data);
  columns=["date","type","value"]
  constructor(public snackBar:MatSnackBar, private http:HttpClient, private app:AppComponent) {
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        this.http.post("/v1/override/schedule?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.data.slice(0,-1))}, {responseType:"text"}).subscribe(res => {
          resolve(res);
        }, res => {
          reject(res);
        });
      }).finally(() => {
        setTimeout(() => this.refresh(), 1000);
      });
    };
    this.app.discardFunction = () => {
      this.refresh();
    }
  }

  refresh(){
    let count = 2;
    this.http.get("/v1/schedule/types?api_key="+this.app.apiKey).subscribe(res => {
      let list = res as any;
      this.app.changed = false;
      this.scheduleTypes = [];
      for(let i =0; i < list.length; i++){
        this.scheduleTypes.push(list[i].name);
      }
      if(--count == 0) this.update();
    });

    this.http.get("/v1/override/schedule?api_key="+this.app.apiKey).subscribe(res => {
      this.app.changed = false;
      this.data = res;
      if(--count == 0) this.update();
    });
  }

  update(){
    //If it's not there, we should add a temp element.
    if(this.data.length == 0 || !this.data[this.data.length-1].temp)
      this.data.push({
        "date":this.app.dateToDayString(new Date()),
        "type":"automatic",
        "name":this.scheduleTypes[0],
        "temp":true
      });
    this.data.sort((a,b) => a.temp?1:a.date.localeCompare(b.date));
    this.dataSource = new MatTableDataSource<Element>(this.data);
    this.dataSource = new MatTableDataSource(this.data);
  }

  change(){
    this.update();
    this.app.changed = true;
  }

  onDateChange(elem, event){
    var str = this.app.dateToDayString(event.value);
    if(elem.temp){
      elem.date = str;
      return true;
    }else{
      //Check if we have a valid date format
      if(!this.app.checkDate(str)){
        this.snackBar.open("Please enter a valid date!", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }

      //Check if this date already exists
      for(let i = 0; i < this.data.length - 1; i++){
        if(this.data[i].date == str){
          this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
          return false;
        }
      }

      elem.date = str;

      this.change();
      return true;
    }
  }

  getDateFromString(str){
    if(!this.app.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem){
    if(elem.temp) return true;

    if(elem.type == "automatic"){
      if(elem.name != ""){
        if(this.scheduleTypes.indexOf(elem.name) == -1){
          this.snackBar.open("Invalid schedule type", "Close", {panelClass:"snackbar-error", duration:3000});
          return false;
        }

        this.change();
        return true;
      }else{
        this.snackBar.open("Please add a name", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }else if(elem.type == "manual"){
      try{
        JSON.parse(elem.schedule);
        this.change();
        return true;
      }catch(e){
        console.log("JSON parsing error: ", e);
        this.snackBar.open("Invalid custom schedule JSON", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }else{
      this.snackBar.open("Invalid type", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
  }

  removeItem(elem){
    for(let i = 0; i < this.data.length; i++){
      if(this.data[i].date == elem.date && this.data[i].type == elem.type){
        this.data.splice(i,1);
        break;
      }
    }
    this.change();
  }

  addItem(elem){
    let finish = () => {
      delete elem.temp;
      this.change();
      return true;
    }

    //Check if we have a valid date format
    if(!this.app.checkDate(elem.date)){
      this.snackBar.open("Please enter a valid date!", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }

    //Check if this date already exists
    for(let i = 0; i < this.data.length - 1; i++){
      if(this.data[i].date == elem.date){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }

    if(elem.type == "automatic"){
      if(elem.name != ""){
        if(this.scheduleTypes.indexOf(elem.name) == -1){
          this.snackBar.open("Invalid schedule type", "Close", {panelClass:"snackbar-error", duration:3000});
          return false;
        }
        return finish();
      }else{
        this.snackBar.open("Please add a name", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }else if(elem.type == "manual"){
      try{
        JSON.parse(elem.schedule);
        return finish();
      }catch(e){
        console.log("JSON parsing error: ", e);
        this.snackBar.open("Invalid custom schedule JSON", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }else{
      this.snackBar.open("Invalid type", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
  }

}
