import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import {BrowserAnimationsModule} from '@angular/platform-browser/animations';
import {
  MatButtonModule,
  MatCheckboxModule,
  MatToolbarModule,
  MatSidenavModule,
  MatListModule,
  MatIconModule,
  MatTableModule,
  MatInputModule,
  MatSelectModule,
  MatNativeDateModule,
  MatDatepickerModule,
  MatSnackBarModule,
  MatDialogModule,
  MatProgressSpinnerModule
} from '@angular/material';
import {FormsModule} from '@angular/forms';

import { AppComponent } from './app.component';
import { OutputPageComponent } from './output-page/output-page.component';
import { DddPageComponent } from './ddd-page/ddd-page.component';
import { SchedulePageComponent } from './schedule-page/schedule-page.component';
import { LetterPageComponent } from './letter-page/letter-page.component';
import { EventPageComponent } from './event-page/event-page.component';
import { JsonManagerService } from './json-manager.service';
import {
  PublishDialogComponent,
  CancelDialogComponent,
  LoginDialogComponent,
  LogoutDialogComponent,
  SpinnerDialogComponent
} from './dialogs/dialogs.component';

const appRoutes:Routes = [
  {path: 'schedule', component: SchedulePageComponent},
  {path: 'letter', component: LetterPageComponent},
  {path: 'events', component: EventPageComponent},
  {path: 'ddd', component: DddPageComponent},
  {path: 'output', component: OutputPageComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    OutputPageComponent,
    DddPageComponent,
    SchedulePageComponent,
    LetterPageComponent,
    EventPageComponent,
    PublishDialogComponent,
    CancelDialogComponent,
    LoginDialogComponent,
    LogoutDialogComponent,
    SpinnerDialogComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    RouterModule.forRoot(appRoutes),
    HttpClientModule,
    MatButtonModule,
    MatCheckboxModule,
    MatToolbarModule,
    MatSidenavModule,
    MatListModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatSelectModule,
    MatNativeDateModule,
    MatDatepickerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatProgressSpinnerModule,
    FormsModule
  ],
  entryComponents:[
    PublishDialogComponent,
    CancelDialogComponent,
    LoginDialogComponent,
    LogoutDialogComponent,
    SpinnerDialogComponent
  ],
  providers: [JsonManagerService],
  bootstrap: [AppComponent]
})
export class AppModule { }
