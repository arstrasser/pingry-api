import { Component } from '@angular/core';
import {JsonManagerService} from './json-manager.service';
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
    {title:"Schedule", url:"/schedule"},
    {title:"Letter Day", url:"/letter"},
    {title:"Events", url:"/events"},
    {title:"Dress Down Days", url:"/ddd"},
    {title:"Athletic Cals", url:"/athletics"}
  ];

  public publishFunction:Function;
  public discardFunction:Function;

  changed:boolean = false;

  constructor(private manager:JsonManagerService, private dialog:MatDialog, private route: ActivatedRoute, private snackbar:MatSnackBar, private http:HttpClient){

  }

  ngOnInit() {
    console.log("Initialized");
    this.manager.hasValidKey((valid)=> {
      if(valid){
        this.manager.refresh();
      }else {
        setTimeout(()=>this.getNewKey());
      }
    });
  }

  logout(){
    let dialogRef = this.dialog.open(LogoutDialogComponent);
    dialogRef.afterClosed().subscribe(result => {
      if(result){
        this.manager.json = {};
        this.manager.apiKey = "";
        this.manager.saveKey();
        this.manager.refresh();
        this.getNewKey();
      }
    });
  }

  getNewKey(){
    let dialogRef = this.dialog.open(LoginDialogComponent, {
      closeOnNavigation:false,
      disableClose:true,
      data:{validate: (key, cb) => this.manager.isValidKey(key, cb)}
    });
    dialogRef.afterClosed().subscribe(newKey => {
      this.manager.apiKey = newKey;
      this.manager.saveKey();
      this.manager.refresh();
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
        this.publishFunction().then(() => {
          this.http.get("/v1/forceRefresh?api_key="+this.manager.apiKey, {responseType:"text"}).subscribe(res => {
            console.log(res);
            this.snackbar.open("Updated successfully", "Close", {duration:3000});
            d2.close();
          }, res => {
            console.error("Error refreshing server:", res);
            this.snackbar.open("Updated, but error refreshing server.", "Close", {panelClass:"snackbar-error", duration:3000});
            d2.close();
          });
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
}
