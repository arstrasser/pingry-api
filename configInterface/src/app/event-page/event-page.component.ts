import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppComponent } from '../app.component';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-event-page',
  templateUrl: './event-page.component.html',
  styleUrls: ['./event-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class EventPageComponent {
  columns = ["date", "name"];
  ctData:any = [];
  ctDataSource = new MatTableDataSource<Element>(this.ctData);
  cpData:any = [];
  cpDataSource = new MatTableDataSource<Element>(this.cpData);
  constructor(public snackBar:MatSnackBar, private http:HttpClient, private app:AppComponent) {
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        let c = 2;
        this.http.post("/v1/override/events/CT?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.ctData.slice(0,-1))}, {responseType:"text"}).subscribe(res => {
          if(--c == 0) resolve(res);
        }, res => {
          if(c > 0) reject(res);
          c = -1;
        });
        this.http.post("/v1/override/events/CP?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.cpData.slice(0,-1))}, {responseType:"text"}).subscribe(res => {
          if(--c == 0) resolve(res);
        }, res => {
          if(c > 0) reject(res);
          c = -1;
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
    this.http.get("/v1/override/events/CT?api_key="+this.app.apiKey).subscribe(res => {
      this.app.changed = false;
      this.ctData = res;
      console.log(this.ctData);
      if(--count == 0) this.update();
    });

    this.http.get("/v1/override/events/CP?api_key="+this.app.apiKey).subscribe(res => {
      this.app.changed = false;
      this.cpData = res;
      console.log(this.cpData);
      if(--count == 0) this.update();
    });
  }

  update(){
    //If it's not there, we should add a temp element.
    if(this.ctData.length == 0 || !this.ctData[this.ctData.length-1].temp)
      this.ctData.push({"date":this.app.dateToDayString(new Date()), "name":"", "temp":true});
    this.ctData.sort((a,b) => a.temp?1:a.date.localeCompare(b.date));
    this.ctDataSource = new MatTableDataSource<Element>(this.ctData);

    //If it's not there, we should add a temp element.
    if(this.cpData.length == 0 || !this.cpData[this.cpData.length-1].temp)
      this.cpData.push({"date":this.app.dateToDayString(new Date()), "name":"", "temp":true})
    this.cpData.sort((a,b) => a.temp?1:a.date.localeCompare(b.date));
    this.cpDataSource = new MatTableDataSource<Element>(this.cpData);
  }

  onDateChange(elem, event, isCT){
    var str = this.app.dateToDayString(event.value);

    //If this is a temporary event, we'll check if everything is valid later before they add it.
    if(elem.temp){
      elem.date = str;
      return true;
    }else{
      //Check if we have a valid date format
      if(!this.app.checkDate(elem.date)){
        this.snackBar.open("Please enter a valid date!", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }

      //Check if we have a non-empty event name
      if(elem.event == ""){
        this.snackBar.open("Please add an event name", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }

      //Check if the date already exists
      let arr = isCT?this.ctData:this.cpData;
      for(let i = 0; i < arr.length - 1; i++){
        if(arr[i].date == str){
          this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
          return false;
        }
      }
      console.log(elem);

      elem.date = str;
      console.log(elem);

      this.change();
      return true;
    }
  }

  change(){
    this.update();
    this.app.changed = true;
  }

  getDateFromString(str){
    if(!this.app.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem, event, isCT){
    if(elem.temp == true){
      return true;
    }
    if(elem.name == ""){
      this.snackBar.open("Please add an event name", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
    this.change();
  }

  removeItem(elem, isCT){
    let arr = isCT?this.ctData:this.cpData;
    for(let i = 0; i < arr.length; i++){
      if(arr[i].date == elem.date && arr[i].name == elem.name){
        arr.splice(i,1);
        break;
      }
    }
    this.change();
  }

  addItem(elem, isCT){
    if(elem.event == ""){
      this.snackBar.open("Please add an event name", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
    if(!this.app.checkDate(elem.date)){
      this.snackBar.open("Please enter a valid date! Must be YYYYMMDD", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }

    let arr = isCT?this.ctData:this.cpData;
    //Subtract 1 since we don't want to chek the new temp element.
    for(let i = 0; i < arr.length - 1; i++){
      if(arr[i].date == elem.date){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }
    delete elem.temp;
    this.update();
    this.change();
  }
}
