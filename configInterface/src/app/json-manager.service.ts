import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class JsonManagerService {
  json:any = {};
  scheduleTypes:any = [];
  athletics:any = [];
  changed:boolean = false;
  apiKey:string = "";

  private refreshing:number = 2;
  private refreshCallbacks = [];
  constructor(private http:HttpClient) {
    this.apiKey = localStorage.getItem("apiKey") || "";
  }

  isValidKey(key, callback){
    if(key=="") return callback(false);
    this.http.get("/testPermission?permission=admin&api_key="+key, {responseType: 'text'}).subscribe((res) => callback(true), (res) => callback(false));
  }

  hasValidKey(callback){
    this.isValidKey(this.apiKey, callback);
  }

  addRefreshCallback(callback){
    this.refreshCallbacks.push(callback);
    if(!this.isRefreshing()){
      callback();
    }
  }

  saveKey(){
    localStorage.setItem("apiKey", this.apiKey);
  }

  dateToDayString(d:Date):string{
    return ""+d.getFullYear()+(d.getMonth()+1<10?"0":"")+(d.getMonth()+1)+(d.getDate()<10?"0":"")+d.getDate();
  }

  change(){
    this.changed = true;
  }

  private checkDoneRefreshing(){
    if(this.isRefreshing()) return false;
    for(var i = 0; i < this.refreshCallbacks.length; i++){
      this.refreshCallbacks[i]();
    }
  }

  isRefreshing(){
    return this.refreshing > 0;
  }

  refresh(){
    this.refreshing = 3;
    this.http.get("/override?api_key="+this.apiKey).subscribe(res => {
      this.json = res;
      this.refreshing--;
      this.checkDoneRefreshing();
    }, err => {if(err.status == 401){this.apiKey = ""; this.saveKey();}});
    this.http.get("/schedule/types?api_key="+this.apiKey).subscribe(res => {
      this.scheduleTypes = res;
      this.refreshing--;
      this.checkDoneRefreshing();
    }, err => {if(err.status == 401){this.apiKey = ""; this.saveKey();}});
    this.http.get("/athletics/calendarList?api_key="+this.apiKey).subscribe(res => {
      this.athletics = res;
      this.refreshing--;
      this.checkDoneRefreshing();
    });
    this.changed = false;
  }

  checkDate(date){
    if(parseInt(date) != NaN && (""+parseInt(date)).length==8){
      if(date.substring(0,2) == "20" || date.substring(0,2) == "21"){
        var month = parseInt(date.substring(4,6));
        if(month > 0 && month <= 12) {
          var d;
          try {
            d = new Date(date.substring(0, 4), month - 1, date.substring(6,8));
          }catch(e){
            return false;
          }
          return true;
        }
      }
    }
    return false;
  }

  saveJson(callback){
    let saving = 2;
    let afterUpdate = (res) => {
      if(res){
        saving--;
      }
      if(saving == 0){
        this.http.get("/forceRefresh?api_key="+this.apiKey, {responseType:"text"}).subscribe(res => {
          callback(res);
          this.refresh();
        })
      }
    }

    console.log(JSON.stringify(this.athletics));
    if(this.athletics[this.athletics.length - 1].hasOwnProperty("temp")){
      this.athletics.pop();
    }
    this.http.post("/updateOverride?api_key="+this.apiKey, {newJSON:JSON.stringify(this.json)}, {responseType:"text"}).subscribe(
      res => afterUpdate(true), res => afterUpdate(false));
    this.http.post("/updateAthletics?api_key="+this.apiKey, {newJSON:JSON.stringify(this.athletics)}, {responseType:"text"}).subscribe(
      res => afterUpdate(true), res => afterUpdate(false));
  }
}
