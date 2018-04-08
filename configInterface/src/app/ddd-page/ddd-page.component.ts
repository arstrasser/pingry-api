import { Component, OnInit } from '@angular/core';
import { ViewEncapsulation } from '@angular/core';
import { JsonManagerService} from '../json-manager.service';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-ddd-page',
  templateUrl: './ddd-page.component.html',
  styleUrls: ['./ddd-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class DddPageComponent {
  columns = ["date", "type"]
  data = [];
  dataSource = new MatTableDataSource<Element>(this.data);
  typeOptions = [
    {value:"free", title:"Free"},
    {value:"charity", title:"DDD for Charity"},
    {value:"fancy", title:"Dress up Day"},
    {value:"spirit", title:"Spirit Day"},
  ];
  constructor(private manager:JsonManagerService, public snackBar:MatSnackBar) {
    this.manager.addRefreshCallback(() => this.update());
  }

  update(){
    this.data = [];
    for(let i in this.manager.json.ddd){
      if(this.manager.json.ddd.hasOwnProperty(i)){
        this.data.push({"date":i, "type":this.manager.json.ddd[i]});
      }
    }
    this.data.push({"date":this.manager.dateToDayString(new Date()), "type":"", "temp":true})
    this.dataSource = new MatTableDataSource<Element>(this.data);
    console.log(this.data);
  }

  onDateChange(elem, event){
    var str = this.manager.dateToDayString(event.value);
    if(elem.temp){
      elem.date = str;
    }else{
      if(this.manager.json.ddd.hasOwnProperty(str)){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
      }else{
        delete this.manager.json.ddd[elem.date];
        this.manager.json.ddd[str] = elem.type;
        this.manager.change();
        this.update();
      }
    }
  }

  getDateFromString(str){
    if(!this.manager.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem, event){
    if(elem.temp) return;
    this.manager.json.ddd[elem.date] = event.value;
    this.manager.change();
  }

  removeItem(item){
    delete this.manager.json.ddd[item.date];
    this.manager.change();
    this.update();
  }

  addItem(item){
    if(this.manager.json.ddd.hasOwnProperty(item.date)){
      this.snackBar.open("This date already exists", "Close", {panelClass:"snackbar-error", duration:3000})
    }else if(this.manager.checkDate(item.date) && item.type != ""){
      this.manager.json.ddd[item.date] = item.type;
      this.update();
      this.manager.change();
    }else{
      this.snackBar.open("Invalid options", "Close", {panelClass:"snackbar-error", duration:3000});
    }
  }
}

export interface Element {
  date:string;
  type:string;
}
