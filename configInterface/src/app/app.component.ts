import { Component } from '@angular/core';
import {MatDialog, MatDialogRef, MatSnackBar} from '@angular/material';
import { HttpClient } from '@angular/common/http';
import {
  PublishDialogComponent,
  CancelDialogComponent,
  LoginDialogComponent,
  LogoutDialogComponent,
  SpinnerDialogComponent
} from './dialogs/dialogs.component';
import { ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent {
  title = 'app';
  pages = [
    {divider:true, title:"Override", permission:"admin"},
    {title:"Schedule", url:"/schedule", permission:"admin"},
    {title:"Letter Day", url:"/letter", permission:"admin"},
    {title:"Events", url:"/events", permission:"admin"},
    {title:"Dress Down Days", url:"/ddd", permission:"admin"},
    {divider:true, title:"Configuration", permission:"admin"},
    {title:"Schedule Types", url:"/schedule-types", permission:"admin"},
    {title:"Athletic Cals", url:"/athletics", permission:"admin"},
    {divider:true, title:"Management", permission:"full"},
    {title:"API Keys", url:"/apikeys", permission:"full"}
  ];

  public publishFunction:Function = () => {};
  public discardFunction:Function = () => {};
  public apiKey:string = "";
  public permissions:Array<string> = [];

  changed:boolean = false;

  constructor(private dialog:MatDialog, private route: ActivatedRoute, private snackbar:MatSnackBar, private http:HttpClient){}

  ngOnInit() {
    this.apiKey = localStorage.getItem("apiKey");
    console.log("Initialized");
    this.hasValidKey((valid:boolean)=> {
      if(!valid) {
        setTimeout(()=>this.getNewKey());
      }
    });
  }

  isValidKey(key:string, callback:Function){
    if(key=="") return callback(false);
    this.http.get("/v1/getPermissions?api_key="+key).subscribe((res) => {
      this.permissions = res as Array<string>;
      callback(true);
    }, () => callback(false));
  }

  hasValidKey(callback:Function){ return this.isValidKey(this.apiKey, callback)}

  saveKey(){
    localStorage.setItem("apiKey", this.apiKey);
  }

  shouldShowRoute(item){
    return this.permissions.indexOf(item.permission) != -1 || this.permissions.indexOf("full") != -1;
  }

  getNewKey(){
    let dialogRef = this.dialog.open(LoginDialogComponent, {
      closeOnNavigation:false,
      disableClose:true,
      data:{validate: (key, cb) => this.isValidKey(key, cb)}
    });
    dialogRef.afterClosed().subscribe(newKey => {
      this.apiKey = newKey;
      this.saveKey();
    });
  }

  logout(){
    let dialogRef = this.dialog.open(LogoutDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.apiKey = "";
        this.saveKey();
        this.getNewKey();
      }
    });
  }

  hasChanged():boolean{
    return this.changed;
  }

  publish() {
    let dialogRef = this.dialog.open(PublishDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.changed = false;
        let d2 = this.dialog.open(SpinnerDialogComponent, {closeOnNavigation:false,disableClose:true, width:"150px", height:"150px"});
        this.publishFunction().then((res) => {
          console.log(res);
          this.snackbar.open("Updated successfully", "Close", {duration:3000});
          d2.close();
        }, res => {
          console.error("Error updating JSON:", res);
          this.snackbar.open("Error updating JSON!", "Close", {panelClass:"snackbar-error", duration:3000});
          d2.close();
        });
      }
    });
  }

  cancel(){
    let dialogRef = this.dialog.open(CancelDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.discardFunction();
      }
    });
  }



  //Miscelaneous Helper Functions
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

  dateToDayString(d:Date):string{
    return ""+d.getFullYear()+(d.getMonth()+1<10?"0":"")+(d.getMonth()+1)+(d.getDate()<10?"0":"")+d.getDate();
  }
}
