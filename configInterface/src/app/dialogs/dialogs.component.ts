import { Component, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA, MatSnackBar } from '@angular/material';

@Component({
  selector:'spinner-dialog',
  templateUrl:'./spinner-dialog.html'
})
export class SpinnerDialogComponent {}

@Component({
  selector:'publish-dialog',
  templateUrl:'./publish-dialog.html'
})
export class PublishDialogComponent {}

@Component({
  selector:'cancel-dialog',
  templateUrl:'./cancel-dialog.html'
})
export class CancelDialogComponent {}

@Component({
  selector:'logout-dialog',
  templateUrl:'./logout-dialog.html'
})
export class LogoutDialogComponent {}

@Component({
  selector:'login-dialog',
  templateUrl:'./login-dialog.html'
})
export class LoginDialogComponent {
  key:string = "";
  constructor(public dialogRef: MatDialogRef<LoginDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: any, private snackbar:MatSnackBar){}
  close(){
    this.data.validate(this.key, (res) => {
      if(res){
        this.dialogRef.close(this.key);
      }else{
        this.snackbar.open("Invalid Key!", "Close", {panelClass:"snackbar-error", duration:3000});
      }
    });
  }
}
