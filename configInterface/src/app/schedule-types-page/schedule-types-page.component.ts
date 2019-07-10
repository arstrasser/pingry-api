import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { AppComponent } from '../app.component';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-schedule-types-page',
  templateUrl: './schedule-types-page.component.html',
  styleUrls: ['./schedule-types-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ScheduleTypesPageComponent {
  data:any = [];
  scheduleOptions = [];
  dataSource = new MatTableDataSource(this.data);
  columns=["name","schedule"]
  constructor(public snackBar:MatSnackBar, private http:HttpClient, private app:AppComponent) {
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        let temp = this.data.slice(0,-1);
        for(var i = 0; i < temp.length; i++){
          temp[i].schedule = JSON.parse(temp[i].schedule);
        }
        this.http.post("/v1/updateScheduleTypes?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.data.slice(0,-1))}, {responseType:"text"}).subscribe(res => {
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
    this.http.get("/v1/schedule/types?api_key="+this.app.apiKey).subscribe((res) => {
      this.app.changed = false;
      this.data = res;
      for(let i = 0; i < this.data.length; i++){
        this.data[i].schedule = JSON.stringify(this.data[i].schedule);
      }
      this.update();
    });
  }

  update(){
    if(!this.data[this.data.length - 1].hasOwnProperty("temp")){
      this.data.push({name:"",schedule:"[\n\n]", temp:true});
    }
    this.dataSource = new MatTableDataSource<Element>(this.data);
  }

  change(){
    this.update();
    this.app.changed = true;
  }

  onNameChange(elem){
    if(elem.name == ""){
      this.snackBar.open("Please add a name", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
  }

  onValueChange(elem, event){
    if(elem.temp) return true;
    console.log(elem.schedule);
    try{
      let classes = JSON.parse(elem.schedule);
      this.change();
    }catch(e){
      console.log("JSON parsing error: ", e);
      this.snackBar.open("Invalid custom schedule JSON", "Close", {panelClass:"snackbar-error", duration:3000});
    }
  }

  getDateFromString(str){
    if(!this.app.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  removeItem(elem){
    for(let i = 0; i < this.data.length; i++){
      if(this.data[i].name == elem.name && this.data[i].schedule == elem.schedule){
        this.data.splice(i,1);
        break;
      }
    }
    this.change();
  }

  addItem(elem){
    //Check if name exists, check if name not empty, check if json valid
    if(elem.name == ""){
      this.snackBar.open("Please enter a name!", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }

    for(let i = 0; i < this.data.length - 1; i++){
      if(this.data[i].name == elem.name){
        this.snackBar.open("That name already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }


    try{
      let classes = JSON.parse(elem.schedule);
      delete elem.temp;
      this.change();
    }catch(e){
      console.log("JSON parsing error: ", e);
      this.snackBar.open("Invalid schedule JSON", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }

  }

}
