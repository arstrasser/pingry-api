import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { JsonManagerService } from '../json-manager.service';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-letter-page',
  templateUrl: './letter-page.component.html',
  styleUrls: ['./letter-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class LetterPageComponent {
  columns = ["date", "letter"]
  data = [];
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
  constructor(private manager:JsonManagerService, public snackBar:MatSnackBar) {
    this.manager.addRefreshCallback(() => this.update());
  }

  update(){
    this.data = [];
    for(let i in this.manager.json.letterOverride){
      if(this.manager.json.letterOverride.hasOwnProperty(i)){
        this.data.push({"date":i, "letter":this.manager.json.letterOverride[i]});
      }
    }
    this.data.push({"date":this.manager.dateToDayString(new Date()), "letter":"", "temp":true})
    this.dataSource = new MatTableDataSource<Element>(this.data);
    console.log(this.data);
  }

  onDateChange(elem, event){
    var str = this.manager.dateToDayString(event.value);
    if(elem.temp){
      elem.date = str;
    }else{
      if(this.manager.json.letterOverride.hasOwnProperty(str)){
        this.snackBar.open("That date already exists!", "Close", {panelClass:"snackbar-error", duration:3000});
      }else{
        delete this.manager.json.letterOverride[elem.date];
        this.manager.json.letterOverride[str] = elem.letter;
        this.manager.change();
        this.update();
      }
    }
  }

  getDateFromString(str){
    if(!this.manager.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onValueChange(elem){
    console.log(elem);
    if(elem.temp) return;
    this.manager.json.letterOverride[elem.date] = elem.letter;
    this.manager.change();
  }


  removeItem(item){
    delete this.manager.json.letterOverride[item.date];
    this.manager.change();
    this.update();
  }

  addItem(item){
    if(this.manager.json.letterOverride.hasOwnProperty(item.date)){
      this.snackBar.open("This date already exists", "Close", {panelClass:"snackbar-error", duration:3000})
    }else if(this.manager.checkDate(item.date) && item.letter != ""){
      this.manager.json.letterOverride[item.date] = item.letter;
      this.update();
      this.manager.change();
    }else {
      this.snackBar.open("Invalid options", "Close", {panelClass:"snackbar-error", duration:3000});
    }
  }

  ngOnInit(){}
}

export interface Element {
  date:string;
  letter:string;
}
