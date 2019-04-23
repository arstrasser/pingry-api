import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { JsonManagerService} from '../json-manager.service';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import { AppComponent } from '../app.component';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-athletics-page',
  templateUrl: './athletics-page.component.html',
  styleUrls: ['./athletics-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AthleticsPageComponent {
  columns = ["name", "url", "veracross_id"]
  data = [];
  dataSource = new MatTableDataSource<Element>(this.data);
  athletics:Array<{id:number, name:string, url:string, veracross_id:string}> = [];

  constructor(private manager:JsonManagerService, public snackBar:MatSnackBar, private app: AppComponent, private http:HttpClient) {
    this.manager.addRefreshCallback(() => this.update());
  }

  ngOnInit(){
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        if(this.athletics[this.athletics.length - 1].hasOwnProperty("temp")){
          this.athletics.pop();
        }
        this.http.post("/v1/updateAthletics?api_key="+this.manager.apiKey, {newJSON:JSON.stringify(this.athletics)}, {responseType:"text"}).subscribe(res => {
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
    this.http.get("/v1/athletics/calendarList?api_key="+this.manager.apiKey).subscribe((res) => {
      this.app.changed = false;
      this.athletics = res as any;
      this.update();
    });
  }

  update(){
    this.data = this.athletics;
    if(!this.athletics[this.athletics.length - 1].hasOwnProperty("temp")){
      let newId = this.athletics[this.athletics.length - 1].id + 1;
      this.data.push({id:newId,name:"",url:"", temp:true});
    }
    this.dataSource = new MatTableDataSource<Element>(this.data);
  }

  getDateFromString(str){
    if(!this.manager.checkDate(str)) return new Date();
    return new Date(str.substring(0,4), parseInt(str.substring(4,6)) - 1, str.substring(6,8));
  }

  onNameChange(elem){
    if(elem.temp) return false;
    this.app.changed = true;
    return true;
  }

  onUrlChange(elem){
    if(elem.temp) return false;
    this.app.changed = true;
    return true;
  }

  onVeraChange(elem){
    if(elem.temp) return false;
    this.app.changed = true;
    return true;
  }

  removeItem(item){
    for(var i = 0; i < this.athletics.length; i++){
      if(this.athletics[i].id == item.id){
        this.athletics.splice(i, 1);
        this.app.changed = true;
        this.update();
        return true;
      }
    }
    return false;
  }

  addItem(item){
    if(item.name != "" && item.url != "" && item.veracross_id != ""){
      delete item.temp;
      this.app.changed = true;
      this.update();
      return true;
    }else{
      this.snackBar.open("Invalid options", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
  }

}

class Element {
  id:number;
  name:string;
  url:string;
  veracross_id:string;
}
