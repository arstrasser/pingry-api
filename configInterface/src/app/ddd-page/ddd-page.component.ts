import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { JsonManagerService} from '../json-manager.service';
import { AppComponent } from '../app.component';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-ddd-page',
  templateUrl: './ddd-page.component.html',
  styleUrls: ['./ddd-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DddPageComponent implements OnInit {
  columns = ["date", "type"]
  data = [];
  dataSource = new MatTableDataSource<Element>(this.data);
  typeOptions = [
    {value:"free", title:"Free"},
    {value:"charity", title:"DDD for Charity"},
    {value:"fancy", title:"Dress up Day"},
    {value:"spirit", title:"Spirit Day"},
  ];
  ddd:any = {};

  constructor(private manager:JsonManagerService, public snackBar:MatSnackBar, private http:HttpClient, private app:AppComponent) {}

  ngOnInit() {
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        this.http.post("/v1/updateDDD?api_key="+this.manager.apiKey, {newJSON:JSON.stringify(this.ddd)}, {responseType:"text"}).subscribe(res => {
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
    this.http.get("/v1/ddd?api_key="+this.manager.apiKey).subscribe(res => {
      this.app.changed = false;
      this.ddd = res;
      this.update();
    });
  }


  update(){
    this.data = [];
    for(let i in this.ddd){
      if(this.ddd.hasOwnProperty(i)){
        this.data.push({"date":i, "type":this.ddd[i]});
      }
    }
    this.data.push({"date":this.manager.dateToDayString(new Date()), "type":"", "temp":true})
    this.dataSource = new MatTableDataSource<Element>(this.data);
  }

  onDateChange(elem, event){
    var str = this.manager.dateToDayString(event.value);
    if(elem.temp){
      elem.date = str;
    }else{
      if(this.ddd.hasOwnProperty(str)){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
      }else{
        delete this.ddd[elem.date];
        this.ddd[str] = elem.type;
        this.update();
        this.app.changed = true;
      }
    }
  }

  getDateFromString(str){
    if(!this.manager.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem, event){
    if(elem.temp) return;
    this.ddd[elem.date] = event.value;
    this.app.changed = true;
  }

  removeItem(item){
    delete this.ddd[item.date];
    this.update();
    this.app.changed = true;
  }

  addItem(item){
    if(this.ddd.hasOwnProperty(item.date)){
      this.snackBar.open("This date already exists", "Close", {panelClass:"snackbar-error", duration:3000})
    }else if(this.manager.checkDate(item.date) && item.type != ""){
      this.ddd[item.date] = item.type;
      this.update();
      this.app.changed = true;
    }else{
      this.snackBar.open("Invalid options", "Close", {panelClass:"snackbar-error", duration:3000});
    }
  }
}

export interface Element {
  date:string;
  type:string;
}
