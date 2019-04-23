import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';

@Injectable()
export class JsonManagerService {
  json:any = {};
  scheduleTypes:any = [];
  changed:boolean = false;
  apiKey:string = "";

  private refreshing:number = 2;
  private refreshCallbacks = [];
  constructor(private http:HttpClient) {
    this.apiKey = localStorage.getItem("apiKey") || "";
  }

  isValidKey(key:string, callback:Function){
    if(key=="") return callback(false);
    this.http.get("/testPermission?permission=admin&api_key="+key, {responseType: 'text'}).subscribe(() => callback(true), () => callback(false));
  }

  hasValidKey(callback:Function){
    this.isValidKey(this.apiKey, callback);
  }

  addRefreshCallback(callback:Function){
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
    this.refreshing = 4;

    this.http.get("/v1/override?api_key="+this.apiKey).subscribe(res => {
      this.json = res;
      this.refreshing--;
      this.checkDoneRefreshing();
    }, err => {if(err.status == 401){this.apiKey = ""; this.saveKey();}});
    this.http.get("/v1/schedule/types?api_key="+this.apiKey).subscribe(res => {
      this.scheduleTypes = res;
      this.refreshing--;
      this.checkDoneRefreshing();
    }, err => {if(err.status == 401){this.apiKey = ""; this.saveKey();}});
    this.changed = false;
  }

  checkDate(date:string){
    if(parseInt(date) != NaN && (""+parseInt(date)).length==8){
      if(date.substring(0,2) == "20" || date.substring(0,2) == "21"){
        var month = parseInt(date.substring(4,6));
        if(month > 0 && month <= 12) {
          try {
            new Date(parseInt(date.substring(0, 4)), month - 1, parseInt(date.substring(6,8)));
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
        this.http.get("/v1/forceRefresh?api_key="+this.apiKey, {responseType:"text"}).subscribe(res => {
          callback(res);
          this.refresh();
        })
      }
    }
    this.http.post("/v1/updateOverride?api_key="+this.apiKey, {newJSON:JSON.stringify(this.json)}, {responseType:"text"}).subscribe(
      res => afterUpdate(true), res => afterUpdate(false));
  }
}
