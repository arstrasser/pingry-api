import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
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

  constructor(public snackBar:MatSnackBar, private http:HttpClient, private app:AppComponent) {}

  ngOnInit() {
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        this.http.post("/v1/updateDDD?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.ddd)}, {responseType:"text"}).subscribe(res => {
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
    this.http.get("/v1/ddd?api_key="+this.app.apiKey).subscribe(res => {
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
    this.data.sort((a,b) => {
      if(a.temp) return 1;
      a.date.localeCompare(b.date);
    });
    this.data.push({"date":this.app.dateToDayString(new Date()), "type":"", "temp":true})
    this.dataSource = new MatTableDataSource<Element>(this.data);
  }

  onDateChange(elem:Element, event){
    var str = this.app.dateToDayString(event.value);
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

  getDateFromString(str:string){
    if(!this.app.checkDate(str)) return new Date();
    return new Date(parseInt(str.substring(0,4)), parseInt(str.substring(4,6)) - 1, parseInt(str.substring(6,8)));
  }

  onValueChange(elem:Element, event){
    if(elem.temp) return;
    this.ddd[elem.date] = event.value;
    this.app.changed = true;
  }

  removeItem(item:Element){
    delete this.ddd[item.date];
    this.update();
    this.app.changed = true;
  }

  addItem(item:Element){
    if(this.ddd.hasOwnProperty(item.date)){
      this.snackBar.open("This date already exists", "Close", {panelClass:"snackbar-error", duration:3000})
    }else if(this.app.checkDate(item.date) && item.type != ""){
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
  temp?:boolean;
}
