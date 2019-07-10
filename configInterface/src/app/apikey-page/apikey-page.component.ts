import { Component, ViewEncapsulation } from '@angular/core';
import {MatTableDataSource, MatSnackBar} from '@angular/material';
import { AppComponent } from '../app.component';
import { HttpClient } from '@angular/common/http';

const chars = "0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ";

@Component({
  selector: 'app-apikey-page',
  templateUrl: './apikey-page.component.html',
  //styleUrls: ['./apikey-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class ApikeyPageComponent {
  columns = ["key", "owner", "permissions"]
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
        this.http.post("/v1/updateKeys?api_key="+this.app.apiKey, {newJSON:JSON.stringify(this.data)}, {responseType:"text"}).subscribe(res => {
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
    this.http.get("/v1/getKeys?api_key="+this.app.apiKey).subscribe((res) => {
      this.app.changed = false;
      this.data = res as any;
      this.update();
    });
  }

  change(){
    this.update();
    this.app.changed = true;
  }

  update(){
    if(!this.data[this.data.length - 1].hasOwnProperty("temp")){
      this.data.push({key:this.genNewKey(),owner:"",permissions:[], temp:true});
    }
    this.dataSource = new MatTableDataSource<Element>(this.data);
  }

  genNewKey() {
    let loop:boolean;
    let newKey:string;
    do {
      loop = false;
      newKey = "";
      for(let i = 0; i < 40; i++){
        newKey += chars[Math.floor(Math.random()*chars.length)];
      }
      for(let i = 0; i < this.data.length - 1; i++){
        if(this.data[i].key == newKey){
          loop = true;
          break;
        }
      }
    }
    while(loop);
    return newKey;
  }


  regenKey(elem){
    elem.key = this.genNewKey();
    this.change();
  }

  onOwnerChange(elem){
    if(elem.temp) return true;
    if(elem.owner == ""){
      this.snackBar.open("Key owner cannot be blank.", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
    this.change();
    return true;
  }

  onPermChange(elem, event){
    elem.permissions = event.target.value.split(",");
    if(elem.temp) return true;
    this.app.changed = true;
    return true;
  }

  removeItem(item){
    for(var i = 0; i < this.data.length; i++){
      if(this.data[i].key == item.key){
        this.data.splice(i, 1);
        this.app.changed = true;
        this.update();
        return true;
      }
    }
    return false;
  }

  addItem(item){
    if(item.key != "" && item.owner != "" && item.permissions != []){
      delete item.temp;
      this.change();
      return true;
    }else{
      this.snackBar.open("Invalid options", "Close", {panelClass:"snackbar-error", duration:3000});
      return false;
    }
  }

}
