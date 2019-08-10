import { Component, ViewEncapsulation } from '@angular/core';
import { AppComponent } from '../app.component';
import {MatTableDataSource, MatSnackBar} from '@angular/material';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-letter-page',
  templateUrl: './letter-page.component.html',
  styleUrls: ['./letter-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LetterPageComponent {
  columns = ["date", "letter"]
  data:any = [];
  dataSource = new MatTableDataSource<Element>(this.data);
  letterOptions = [
    {value:"A", title:"A"},
    {value:"B", title:"B"},
    {value:"C", title:"C"},
    {value:"D", title:"D"},
    {value:"E", title:"E"},
    {value:"F", title:"F"},
    {value:"G", title:"G"},
    {value:"R", title:"Review Day"}
  ];

  constructor(public snackBar:MatSnackBar, private http:HttpClient, private app:AppComponent) {
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        this.http.post("/v1/override/letter?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.data.slice(0,-1))}, {responseType:"text"}).subscribe(res => {
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
    this.http.get("/v1/override/letter?api_key="+this.app.apiKey).subscribe(res => {
      this.app.changed = false;
      this.data = res;
      console.log(this.data);
      this.update();
    });
  }

  update(){
    //If it's not there, we should add a temp element.
    if(this.data.length == 0 || !this.data[this.data.length-1].temp)
      this.data.push({"date":this.app.dateToDayString(new Date()), "letter":"", "temp":true});
    this.data.sort((a,b) => a.temp?1:a.date.localeCompare(b.date));
    this.dataSource = new MatTableDataSource<Element>(this.data);
  }

  onDateChange(elem, event){
    var str = this.app.dateToDayString(event.value);
    if(elem.temp){
      elem.date = str;
      return true;
    }else{
      //Check if we have a valid date format
      if(!this.app.checkDate(elem.date)){
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

  change(){
    this.update();
    this.app.changed = true;
  }

  getDateFromString(str){
    if(!this.app.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem){
    if(elem.temp == true) return true;
    this.change();
  }


  removeItem(elem){
    for(let i = 0; i < this.data.length; i++){
      if(this.data[i].date == elem.date && this.data[i].letter == elem.letter){
        this.data.splice(i,1);
        break;
      }
    }
    this.change();
  }

  addItem(elem){
    console.log(elem);
    if(elem.letter == ""){
      this.snackBar.open("Please specify a letter.", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }

    if(!this.app.checkDate(elem.date)){
      this.snackBar.open("Please enter a valid date!", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }

    for(let i = 0; i < this.data.length - 1; i++){
      if(this.data[i].date == elem.date){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
        return false;
      }
    }

    delete elem.temp;
    this.change();
  }
}

export interface Element {
  date:string;
  letter:string;
}
