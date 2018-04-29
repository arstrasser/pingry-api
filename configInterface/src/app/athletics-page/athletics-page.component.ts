import { Component, OnInit, ViewEncapsulation } from '@angular/core';
import { JsonManagerService} from '../json-manager.service';
import {MatTableDataSource, MatSort, MatSnackBar} from '@angular/material';
import {ErrorStateMatcher} from '@angular/material/core';
import {FormControl, FormGroupDirective, NgForm, Validators} from '@angular/forms';

@Component({
  selector: 'app-athletics-page',
  templateUrl: './athletics-page.component.html',
  styleUrls: ['./athletics-page.component.css'],
  encapsulation: ViewEncapsulation.None
})
export class AthleticsPageComponent {
  columns = ["name", "url"]
  data = [];
  dataSource = new MatTableDataSource<Element>(this.data);

  constructor(private manager:JsonManagerService, public snackBar:MatSnackBar) {
    this.manager.addRefreshCallback(() => this.update());
  }

  update(){
    this.data = this.manager.athletics;
    if(!this.manager.athletics[this.manager.athletics.length - 1].hasOwnProperty("temp")){
      let newId = this.manager.athletics[this.manager.athletics.length - 1].id + 1;
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
    this.manager.change();
    return true;
  }

  onUrlChange(elem){
    if(elem.temp) return false;
    this.manager.change();
    return true;
  }

  removeItem(item){
    for(var i = 0; i < this.manager.athletics.length; i++){
      if(this.manager.athletics[i].id == item.id){
        this.manager.athletics.splice(i, 1);
        this.manager.change();
        this.update();
        return true;
      }
    }
    return false;
  }

  addItem(item){
    if(item.name != "" && item.url != ""){
      delete item.temp;
      this.manager.change();
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
}
