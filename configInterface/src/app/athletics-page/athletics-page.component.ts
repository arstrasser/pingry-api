import { Component, ViewEncapsulation } from '@angular/core';
import {MatTableDataSource, MatSnackBar} from '@angular/material';
import { AppComponent } from '../app.component';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-athletics-page',
  templateUrl: './athletics-page.component.html',
  styleUrls: ['./athletics-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AthleticsPageComponent {
  columns = ["name", "url", "veracross_id"]
  data:any = [];
  dataSource = new MatTableDataSource<Element>(this.data);

  constructor(public snackBar:MatSnackBar, private app: AppComponent, private http:HttpClient) {

  }

  ngOnInit(){
    this.refresh();
    this.app.publishFunction = () => {
      return new Promise((resolve, reject) => {
        if(this.data[this.data.length - 1].hasOwnProperty("temp")){
          this.data.pop();
        }
        this.http.post("/v1/updateAthletics?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.data)}, {responseType:"text"}).subscribe(res => {
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
    this.http.get("/v1/athletics/calendarList?api_key="+this.app.apiKey).subscribe((res) => {
      this.app.changed = false;
      this.data = res as any;
      this.update();
    });
  }

  update(){
    if(!this.data[this.data.length - 1].hasOwnProperty("temp")){
      let newId = this.data[this.data.length - 1].id + 1;
      this.data.push({id:newId,name:"",url:"", temp:true});
    }
    this.data.sort((a,b) => {
      if(a.temp) return 1;
      a.name.localeCompare(b.name)
    });
    this.dataSource = new MatTableDataSource<Element>(this.data);
  }

  getDateFromString(str){
    if(!this.app.checkDate(str)) return new Date();
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
    for(var i = 0; i < this.data.length; i++){
      if(this.data[i].id == item.id){
        this.data.splice(i, 1);
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
