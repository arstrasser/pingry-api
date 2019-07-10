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
import { AthleticsPageComponent } from './athletics-page/athletics-page.component';
import { DddPageComponent } from './ddd-page/ddd-page.component';
import { SchedulePageComponent } from './schedule-page/schedule-page.component';
import { ScheduleTypesPageComponent } from './schedule-types-page/schedule-types-page.component';
import { LetterPageComponent } from './letter-page/letter-page.component';
import { EventPageComponent } from './event-page/event-page.component';
import { ApikeyPageComponent } from './apikey-page/apikey-page.component';
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
  {path: 'athletics', component: AthleticsPageComponent},
  {path: 'schedule-types', component: ScheduleTypesPageComponent},
  {path: 'apikeys', component:ApikeyPageComponent}
]

@NgModule({
  declarations: [
    AppComponent,
    AthleticsPageComponent,
    DddPageComponent,
    SchedulePageComponent,
    LetterPageComponent,
    EventPageComponent,
    ScheduleTypesPageComponent,
    ApikeyPageComponent,
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
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
