(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["main"],{

/***/ "./src/$$_lazy_route_resource lazy recursive":
/*!**********************************************************!*\
  !*** ./src/$$_lazy_route_resource lazy namespace object ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

function webpackEmptyAsyncContext(req) {
	// Here Promise.resolve().then() is used instead of new Promise() to prevent
	// uncaught exception popping up in devtools
	return Promise.resolve().then(function() {
		var e = new Error("Cannot find module '" + req + "'");
		e.code = 'MODULE_NOT_FOUND';
		throw e;
	});
}
webpackEmptyAsyncContext.keys = function() { return []; };
webpackEmptyAsyncContext.resolve = webpackEmptyAsyncContext;
module.exports = webpackEmptyAsyncContext;
webpackEmptyAsyncContext.id = "./src/$$_lazy_route_resource lazy recursive";

/***/ }),

/***/ "./src/app/app.component.css":
/*!***********************************!*\
  !*** ./src/app/app.component.css ***!
  \***********************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2FwcC5jb21wb25lbnQuY3NzIn0= */"

/***/ }),

/***/ "./src/app/app.component.html":
/*!************************************!*\
  !*** ./src/app/app.component.html ***!
  \************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<!--The content below is only a placeholder and can be replaced.-->\r\n<mat-toolbar color=\"primary\">\r\n  <mat-toolbar-row style=\"z-index:4;\" class=\"mat-elevation-z4\">\r\n    <img src=\"assets/pingry.png\" style=\"height:90%; margin-right: 20px\">\r\n    <span>Pingry API Configuration</span>\r\n    <button mat-raised-button style=\"color:#333; margin-left: 35px;\" (click)=\"logout()\">Logout&nbsp;&nbsp;&nbsp;<mat-icon>lock</mat-icon></button>\r\n    <div class=\"buttons-right\" style=\"position:absolute; right:0; margin-right:40px;\">\r\n      <button mat-raised-button style=\"color:#333\" [disabled]=\"!hasChanged()\" (click)=\"cancel()\">Discard&nbsp;&nbsp;&nbsp;<mat-icon>delete</mat-icon></button>\r\n      <div style=\"display:inline-block; width:25px;\"></div>\r\n      <button mat-raised-button color=\"accent\" [disabled]=\"!hasChanged()\" (click)=\"publish()\">Publish&nbsp;&nbsp;&nbsp;<mat-icon>publish</mat-icon></button>\r\n    </div>\r\n  </mat-toolbar-row>\r\n</mat-toolbar>\r\n<mat-sidenav-container style=\"height: calc(100vh - 64px)\">\r\n  <mat-sidenav mode=\"side\" opened=\"true\" disableClose class=\"mat-elevation-z4\">\r\n    <mat-list>\r\n      <mat-list-item routerLink=\"{{page.url}}\" routerLinkActive=\"active\" *ngFor=\"let page of pages\">{{page.title}}</mat-list-item>\r\n    </mat-list>\r\n  </mat-sidenav>\r\n  <div class=\"main-content\">\r\n    <router-outlet></router-outlet>\r\n  </div>\r\n</mat-sidenav-container>\r\n"

/***/ }),

/***/ "./src/app/app.component.ts":
/*!**********************************!*\
  !*** ./src/app/app.component.ts ***!
  \**********************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var json_manager_service_1 = __webpack_require__(/*! ./json-manager.service */ "./src/app/json-manager.service.ts");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var dialogs_component_1 = __webpack_require__(/*! ./dialogs/dialogs.component */ "./src/app/dialogs/dialogs.component.ts");
var router_1 = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var AppComponent = /** @class */ (function () {
    function AppComponent(manager, dialog, route, snackbar) {
        this.manager = manager;
        this.dialog = dialog;
        this.route = route;
        this.snackbar = snackbar;
        this.title = 'app';
        this.pages = [
            { title: "Schedule", url: "/schedule" },
            { title: "Letter Day", url: "/letter" },
            { title: "Events", url: "/events" },
            { title: "Dress Down Days", url: "/ddd" },
            { title: "Athletic Cals", url: "/athletics" }
        ];
        this.changed = false;
    }
    AppComponent.prototype.ngOnInit = function () {
        var _this = this;
        console.log("Initialized");
        this.manager.hasValidKey(function (valid) {
            console.log(valid);
            if (valid) {
                _this.manager.refresh();
            }
            else {
                setTimeout(function () { return _this.getNewKey(); });
            }
        });
    };
    AppComponent.prototype.logout = function () {
        var _this = this;
        var dialogRef = this.dialog.open(dialogs_component_1.LogoutDialogComponent);
        dialogRef.afterClosed().subscribe(function (result) {
            if (result) {
                _this.manager.json = {};
                _this.manager.apiKey = "";
                _this.manager.saveKey();
                _this.manager.refresh();
                _this.getNewKey();
            }
        });
    };
    AppComponent.prototype.getNewKey = function () {
        var _this = this;
        var dialogRef = this.dialog.open(dialogs_component_1.LoginDialogComponent, {
            closeOnNavigation: false,
            disableClose: true,
            data: { validate: function (key, cb) { return _this.manager.isValidKey(key, cb); } }
        });
        dialogRef.afterClosed().subscribe(function (newKey) {
            _this.manager.apiKey = newKey;
            _this.manager.saveKey();
            _this.manager.refresh();
        });
    };
    AppComponent.prototype.hasChanged = function () {
        return this.manager.changed;
    };
    AppComponent.prototype.publish = function () {
        var _this = this;
        var dialogRef = this.dialog.open(dialogs_component_1.PublishDialogComponent);
        dialogRef.afterClosed().subscribe(function (result) {
            if (result) {
                var d2_1 = _this.dialog.open(dialogs_component_1.SpinnerDialogComponent, { closeOnNavigation: false, disableClose: true, width: "150px", height: "150px" });
                _this.manager.saveJson(function (success) {
                    d2_1.close();
                    if (success) {
                        _this.snackbar.open("JSON updated", "Close", { duration: 3000 });
                        _this.manager.refresh();
                    }
                    else {
                        _this.snackbar.open("Error updating JSON!", "Close", { panelClass: "snackbar-error", duration: 3000 });
                    }
                });
            }
        });
    };
    AppComponent.prototype.cancel = function () {
        var _this = this;
        var dialogRef = this.dialog.open(dialogs_component_1.CancelDialogComponent);
        dialogRef.afterClosed().subscribe(function (result) {
            if (result) {
                _this.manager.refresh();
            }
        });
    };
    AppComponent = __decorate([
        core_1.Component({
            selector: 'app-root',
            template: __webpack_require__(/*! ./app.component.html */ "./src/app/app.component.html"),
            styles: [__webpack_require__(/*! ./app.component.css */ "./src/app/app.component.css")]
        }),
        __metadata("design:paramtypes", [json_manager_service_1.JsonManagerService, material_1.MatDialog, router_1.ActivatedRoute, material_1.MatSnackBar])
    ], AppComponent);
    return AppComponent;
}());
exports.AppComponent = AppComponent;


/***/ }),

/***/ "./src/app/app.module.ts":
/*!*******************************!*\
  !*** ./src/app/app.module.ts ***!
  \*******************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
Object.defineProperty(exports, "__esModule", { value: true });
var platform_browser_1 = __webpack_require__(/*! @angular/platform-browser */ "./node_modules/@angular/platform-browser/fesm5/platform-browser.js");
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var router_1 = __webpack_require__(/*! @angular/router */ "./node_modules/@angular/router/fesm5/router.js");
var http_1 = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
var animations_1 = __webpack_require__(/*! @angular/platform-browser/animations */ "./node_modules/@angular/platform-browser/fesm5/animations.js");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var forms_1 = __webpack_require__(/*! @angular/forms */ "./node_modules/@angular/forms/fesm5/forms.js");
var app_component_1 = __webpack_require__(/*! ./app.component */ "./src/app/app.component.ts");
var athletics_page_component_1 = __webpack_require__(/*! ./athletics-page/athletics-page.component */ "./src/app/athletics-page/athletics-page.component.ts");
var ddd_page_component_1 = __webpack_require__(/*! ./ddd-page/ddd-page.component */ "./src/app/ddd-page/ddd-page.component.ts");
var schedule_page_component_1 = __webpack_require__(/*! ./schedule-page/schedule-page.component */ "./src/app/schedule-page/schedule-page.component.ts");
var letter_page_component_1 = __webpack_require__(/*! ./letter-page/letter-page.component */ "./src/app/letter-page/letter-page.component.ts");
var event_page_component_1 = __webpack_require__(/*! ./event-page/event-page.component */ "./src/app/event-page/event-page.component.ts");
var json_manager_service_1 = __webpack_require__(/*! ./json-manager.service */ "./src/app/json-manager.service.ts");
var dialogs_component_1 = __webpack_require__(/*! ./dialogs/dialogs.component */ "./src/app/dialogs/dialogs.component.ts");
var appRoutes = [
    { path: 'schedule', component: schedule_page_component_1.SchedulePageComponent },
    { path: 'letter', component: letter_page_component_1.LetterPageComponent },
    { path: 'events', component: event_page_component_1.EventPageComponent },
    { path: 'ddd', component: ddd_page_component_1.DddPageComponent },
    { path: 'athletics', component: athletics_page_component_1.AthleticsPageComponent }
];
var AppModule = /** @class */ (function () {
    function AppModule() {
    }
    AppModule = __decorate([
        core_1.NgModule({
            declarations: [
                app_component_1.AppComponent,
                athletics_page_component_1.AthleticsPageComponent,
                ddd_page_component_1.DddPageComponent,
                schedule_page_component_1.SchedulePageComponent,
                letter_page_component_1.LetterPageComponent,
                event_page_component_1.EventPageComponent,
                dialogs_component_1.PublishDialogComponent,
                dialogs_component_1.CancelDialogComponent,
                dialogs_component_1.LoginDialogComponent,
                dialogs_component_1.LogoutDialogComponent,
                dialogs_component_1.SpinnerDialogComponent
            ],
            imports: [
                platform_browser_1.BrowserModule,
                animations_1.BrowserAnimationsModule,
                router_1.RouterModule.forRoot(appRoutes),
                http_1.HttpClientModule,
                material_1.MatButtonModule,
                material_1.MatCheckboxModule,
                material_1.MatToolbarModule,
                material_1.MatSidenavModule,
                material_1.MatListModule,
                material_1.MatIconModule,
                material_1.MatTableModule,
                material_1.MatInputModule,
                material_1.MatSelectModule,
                material_1.MatNativeDateModule,
                material_1.MatDatepickerModule,
                material_1.MatSnackBarModule,
                material_1.MatDialogModule,
                material_1.MatProgressSpinnerModule,
                forms_1.FormsModule
            ],
            entryComponents: [
                dialogs_component_1.PublishDialogComponent,
                dialogs_component_1.CancelDialogComponent,
                dialogs_component_1.LoginDialogComponent,
                dialogs_component_1.LogoutDialogComponent,
                dialogs_component_1.SpinnerDialogComponent
            ],
            providers: [json_manager_service_1.JsonManagerService],
            bootstrap: [app_component_1.AppComponent]
        })
    ], AppModule);
    return AppModule;
}());
exports.AppModule = AppModule;


/***/ }),

/***/ "./src/app/athletics-page/athletics-page.component.css":
/*!*************************************************************!*\
  !*** ./src/app/athletics-page/athletics-page.component.css ***!
  \*************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2F0aGxldGljcy1wYWdlL2F0aGxldGljcy1wYWdlLmNvbXBvbmVudC5jc3MifQ== */"

/***/ }),

/***/ "./src/app/athletics-page/athletics-page.component.html":
/*!**************************************************************!*\
  !*** ./src/app/athletics-page/athletics-page.component.html ***!
  \**************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"athletics-page\">\r\n  <form class=\"athletic-form\">\r\n    <mat-table #table [dataSource]=\"dataSource\">\r\n      <ng-container matColumnDef=\"name\">\r\n        <mat-header-cell *matHeaderCellDef style=\"flex: 2\">Sport Name</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\" style=\"flex: 2\">\r\n          <mat-form-field>\r\n            <input matInput [(ngModel)]=\"element.name\" (change)=\"onNameChange(element)\" [ngModelOptions]=\"{standalone: true}\">\r\n          </mat-form-field>\r\n        </mat-cell>\r\n      </ng-container>\r\n      <ng-container matColumnDef=\"url\">\r\n        <mat-header-cell *matHeaderCellDef style=\"flex: 2\">Calendar URL</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\" style=\"flex: 2\">\r\n          <mat-form-field>\r\n            <input matInput type=\"text\" [(ngModel)]=\"element.url\" (change)=\"onUrlChange(element)\" [ngModelOptions]=\"{standalone: true}\">\r\n          </mat-form-field>\r\n          <button type=\"button\" (click)=\"removeItem(element, true)\" mat-icon-button *ngIf=\"!element.temp\">\r\n            <mat-icon>close</mat-icon>\r\n          </button>\r\n          <button type=\"button\" (click)=\"addItem(element, true)\" mat-icon-button *ngIf=\"element.temp\">\r\n            <mat-icon>add</mat-icon>\r\n          </button>\r\n        </mat-cell>\r\n      </ng-container>\r\n\r\n      <mat-header-row *matHeaderRowDef=\"columns\"></mat-header-row>\r\n      <mat-row *matRowDef=\"let row; columns: columns;\"></mat-row>\r\n    </mat-table>\r\n  </form>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/athletics-page/athletics-page.component.ts":
/*!************************************************************!*\
  !*** ./src/app/athletics-page/athletics-page.component.ts ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var json_manager_service_1 = __webpack_require__(/*! ../json-manager.service */ "./src/app/json-manager.service.ts");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var AthleticsPageComponent = /** @class */ (function () {
    function AthleticsPageComponent(manager, snackBar) {
        var _this = this;
        this.manager = manager;
        this.snackBar = snackBar;
        this.columns = ["name", "url"];
        this.data = [];
        this.dataSource = new material_1.MatTableDataSource(this.data);
        this.manager.addRefreshCallback(function () { return _this.update(); });
    }
    AthleticsPageComponent.prototype.update = function () {
        this.data = this.manager.athletics;
        if (!this.manager.athletics[this.manager.athletics.length - 1].hasOwnProperty("temp")) {
            var newId = this.manager.athletics[this.manager.athletics.length - 1].id + 1;
            this.data.push({ id: newId, name: "", url: "", temp: true });
        }
        this.dataSource = new material_1.MatTableDataSource(this.data);
    };
    AthleticsPageComponent.prototype.getDateFromString = function (str) {
        if (!this.manager.checkDate(str))
            return new Date();
        return new Date(str.substring(0, 4), parseInt(str.substring(4, 6)) - 1, str.substring(6, 8));
    };
    AthleticsPageComponent.prototype.onNameChange = function (elem) {
        if (elem.temp)
            return false;
        this.manager.change();
        return true;
    };
    AthleticsPageComponent.prototype.onUrlChange = function (elem) {
        if (elem.temp)
            return false;
        this.manager.change();
        return true;
    };
    AthleticsPageComponent.prototype.removeItem = function (item) {
        for (var i = 0; i < this.manager.athletics.length; i++) {
            if (this.manager.athletics[i].id == item.id) {
                this.manager.athletics.splice(i, 1);
                this.manager.change();
                this.update();
                return true;
            }
        }
        return false;
    };
    AthleticsPageComponent.prototype.addItem = function (item) {
        if (item.name != "" && item.url != "") {
            delete item.temp;
            this.manager.change();
            this.update();
            return true;
        }
        else {
            this.snackBar.open("Invalid options", "Close", { panelClass: "snackbar-error", duration: 3000 });
            return false;
        }
    };
    AthleticsPageComponent = __decorate([
        core_1.Component({
            selector: 'app-athletics-page',
            template: __webpack_require__(/*! ./athletics-page.component.html */ "./src/app/athletics-page/athletics-page.component.html"),
            encapsulation: core_1.ViewEncapsulation.None,
            styles: [__webpack_require__(/*! ./athletics-page.component.css */ "./src/app/athletics-page/athletics-page.component.css")]
        }),
        __metadata("design:paramtypes", [json_manager_service_1.JsonManagerService, material_1.MatSnackBar])
    ], AthleticsPageComponent);
    return AthleticsPageComponent;
}());
exports.AthleticsPageComponent = AthleticsPageComponent;
var Element = /** @class */ (function () {
    function Element() {
    }
    return Element;
}());


/***/ }),

/***/ "./src/app/ddd-page/ddd-page.component.css":
/*!*************************************************!*\
  !*** ./src/app/ddd-page/ddd-page.component.css ***!
  \*************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2RkZC1wYWdlL2RkZC1wYWdlLmNvbXBvbmVudC5jc3MifQ== */"

/***/ }),

/***/ "./src/app/ddd-page/ddd-page.component.html":
/*!**************************************************!*\
  !*** ./src/app/ddd-page/ddd-page.component.html ***!
  \**************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"ddd-page\">\r\n  <form class=\"ddd-form\">\r\n    <mat-table #table [dataSource]=\"dataSource\">\r\n      <ng-container matColumnDef=\"date\">\r\n        <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <input matInput [matDatepicker]=\"picker\" [value]=\"getDateFromString(element.date)\" (dateChange)=\"onDateChange(element, $event)\">\r\n            <mat-datepicker-toggle matSuffix [for]=\"picker\"></mat-datepicker-toggle>\r\n            <mat-datepicker #picker></mat-datepicker>\r\n          </mat-form-field>\r\n        </mat-cell>\r\n      </ng-container>\r\n      <ng-container matColumnDef=\"type\">\r\n        <mat-header-cell *matHeaderCellDef> Type </mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <mat-select [(value)]=\"element.type\" (change)=\"onValueChange(element, $event)\">\r\n              <mat-option *ngFor=\"let option of typeOptions\" [value]=\"option.value\">{{option.title}}</mat-option>\r\n            </mat-select>\r\n          </mat-form-field>\r\n          <button type=\"button\" (click)=\"removeItem(element)\" mat-icon-button *ngIf=\"!element.temp\">\r\n            <mat-icon>close</mat-icon>\r\n          </button>\r\n          <button type=\"button\" (click)=\"addItem(element)\" mat-icon-button *ngIf=\"element.temp\">\r\n            <mat-icon>add</mat-icon>\r\n          </button>\r\n        </mat-cell>\r\n      </ng-container>\r\n\r\n      <mat-header-row *matHeaderRowDef=\"columns\"></mat-header-row>\r\n      <mat-row *matRowDef=\"let row; columns: columns;\"></mat-row>\r\n    </mat-table>\r\n  </form>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/ddd-page/ddd-page.component.ts":
/*!************************************************!*\
  !*** ./src/app/ddd-page/ddd-page.component.ts ***!
  \************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var core_2 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var json_manager_service_1 = __webpack_require__(/*! ../json-manager.service */ "./src/app/json-manager.service.ts");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var DddPageComponent = /** @class */ (function () {
    function DddPageComponent(manager, snackBar) {
        var _this = this;
        this.manager = manager;
        this.snackBar = snackBar;
        this.columns = ["date", "type"];
        this.data = [];
        this.dataSource = new material_1.MatTableDataSource(this.data);
        this.typeOptions = [
            { value: "free", title: "Free" },
            { value: "charity", title: "DDD for Charity" },
            { value: "fancy", title: "Dress up Day" },
            { value: "spirit", title: "Spirit Day" },
        ];
        this.manager.addRefreshCallback(function () { return _this.update(); });
    }
    DddPageComponent.prototype.update = function () {
        this.data = [];
        for (var i in this.manager.json.ddd) {
            if (this.manager.json.ddd.hasOwnProperty(i)) {
                this.data.push({ "date": i, "type": this.manager.json.ddd[i] });
            }
        }
        this.data.push({ "date": this.manager.dateToDayString(new Date()), "type": "", "temp": true });
        this.dataSource = new material_1.MatTableDataSource(this.data);
        console.log(this.data);
    };
    DddPageComponent.prototype.onDateChange = function (elem, event) {
        var str = this.manager.dateToDayString(event.value);
        if (elem.temp) {
            elem.date = str;
        }
        else {
            if (this.manager.json.ddd.hasOwnProperty(str)) {
                this.snackBar.open("That date already exists!", "Close", { panelClass: "snackbar-error", duration: 3000 });
            }
            else {
                delete this.manager.json.ddd[elem.date];
                this.manager.json.ddd[str] = elem.type;
                this.manager.change();
                this.update();
            }
        }
    };
    DddPageComponent.prototype.getDateFromString = function (str) {
        if (!this.manager.checkDate(str))
            return new Date();
        return new Date(str.substring(0, 4), parseInt(str.substring(4, 6)) - 1, str.substring(6, 8));
    };
    DddPageComponent.prototype.onValueChange = function (elem, event) {
        if (elem.temp)
            return;
        this.manager.json.ddd[elem.date] = event.value;
        this.manager.change();
    };
    DddPageComponent.prototype.removeItem = function (item) {
        delete this.manager.json.ddd[item.date];
        this.manager.change();
        this.update();
    };
    DddPageComponent.prototype.addItem = function (item) {
        if (this.manager.json.ddd.hasOwnProperty(item.date)) {
            this.snackBar.open("This date already exists", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
        else if (this.manager.checkDate(item.date) && item.type != "") {
            this.manager.json.ddd[item.date] = item.type;
            this.update();
            this.manager.change();
        }
        else {
            this.snackBar.open("Invalid options", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
    };
    DddPageComponent = __decorate([
        core_1.Component({
            selector: 'app-ddd-page',
            template: __webpack_require__(/*! ./ddd-page.component.html */ "./src/app/ddd-page/ddd-page.component.html"),
            encapsulation: core_2.ViewEncapsulation.None,
            styles: [__webpack_require__(/*! ./ddd-page.component.css */ "./src/app/ddd-page/ddd-page.component.css")]
        }),
        __metadata("design:paramtypes", [json_manager_service_1.JsonManagerService, material_1.MatSnackBar])
    ], DddPageComponent);
    return DddPageComponent;
}());
exports.DddPageComponent = DddPageComponent;


/***/ }),

/***/ "./src/app/dialogs/cancel-dialog.html":
/*!********************************************!*\
  !*** ./src/app/dialogs/cancel-dialog.html ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Are you sure you want to discard your changes?</h1>\r\n<div mat-dialog-actions>\r\n  <button mat-button color=\"primary\" [mat-dialog-close]=\"false\">No</button>\r\n  <button mat-raised-button color=\"warn\" [mat-dialog-close]=\"true\">Yes</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/dialogs/dialogs.component.ts":
/*!**********************************************!*\
  !*** ./src/app/dialogs/dialogs.component.ts ***!
  \**********************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var SpinnerDialogComponent = /** @class */ (function () {
    function SpinnerDialogComponent() {
    }
    SpinnerDialogComponent = __decorate([
        core_1.Component({
            selector: 'spinner-dialog',
            template: __webpack_require__(/*! ./spinner-dialog.html */ "./src/app/dialogs/spinner-dialog.html")
        })
    ], SpinnerDialogComponent);
    return SpinnerDialogComponent;
}());
exports.SpinnerDialogComponent = SpinnerDialogComponent;
var PublishDialogComponent = /** @class */ (function () {
    function PublishDialogComponent() {
    }
    PublishDialogComponent = __decorate([
        core_1.Component({
            selector: 'publish-dialog',
            template: __webpack_require__(/*! ./publish-dialog.html */ "./src/app/dialogs/publish-dialog.html")
        })
    ], PublishDialogComponent);
    return PublishDialogComponent;
}());
exports.PublishDialogComponent = PublishDialogComponent;
var CancelDialogComponent = /** @class */ (function () {
    function CancelDialogComponent() {
    }
    CancelDialogComponent = __decorate([
        core_1.Component({
            selector: 'cancel-dialog',
            template: __webpack_require__(/*! ./cancel-dialog.html */ "./src/app/dialogs/cancel-dialog.html")
        })
    ], CancelDialogComponent);
    return CancelDialogComponent;
}());
exports.CancelDialogComponent = CancelDialogComponent;
var LogoutDialogComponent = /** @class */ (function () {
    function LogoutDialogComponent() {
    }
    LogoutDialogComponent = __decorate([
        core_1.Component({
            selector: 'logout-dialog',
            template: __webpack_require__(/*! ./logout-dialog.html */ "./src/app/dialogs/logout-dialog.html")
        })
    ], LogoutDialogComponent);
    return LogoutDialogComponent;
}());
exports.LogoutDialogComponent = LogoutDialogComponent;
var LoginDialogComponent = /** @class */ (function () {
    function LoginDialogComponent(dialogRef, data, snackbar) {
        this.dialogRef = dialogRef;
        this.data = data;
        this.snackbar = snackbar;
        this.key = "";
    }
    LoginDialogComponent.prototype.close = function () {
        var _this = this;
        this.data.validate(this.key, function (res) {
            if (res) {
                _this.dialogRef.close(_this.key);
            }
            else {
                _this.snackbar.open("Invalid Key!", "Close", { panelClass: "snackbar-error", duration: 3000 });
            }
        });
    };
    LoginDialogComponent = __decorate([
        core_1.Component({
            selector: 'login-dialog',
            template: __webpack_require__(/*! ./login-dialog.html */ "./src/app/dialogs/login-dialog.html")
        }),
        __param(1, core_1.Inject(material_1.MAT_DIALOG_DATA)),
        __metadata("design:paramtypes", [material_1.MatDialogRef, Object, material_1.MatSnackBar])
    ], LoginDialogComponent);
    return LoginDialogComponent;
}());
exports.LoginDialogComponent = LoginDialogComponent;


/***/ }),

/***/ "./src/app/dialogs/login-dialog.html":
/*!*******************************************!*\
  !*** ./src/app/dialogs/login-dialog.html ***!
  \*******************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Please enter a valid API key:</h1>\r\n<div mat-dialog-content>\r\n  <mat-form-field>\r\n    <input matInput [(ngModel)]=\"key\">\r\n  </mat-form-field>\r\n</div>\r\n<div>\r\n  <button mat-raised-button color=\"primary\" (click)=\"close()\">Submit</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/dialogs/logout-dialog.html":
/*!********************************************!*\
  !*** ./src/app/dialogs/logout-dialog.html ***!
  \********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Are you want to log out?</h1>\r\n<div mat-dialog-actions>\r\n  <button mat-button color=\"primary\" [mat-dialog-close]=\"false\">No</button>\r\n  <button mat-raised-button color=\"primary\" [mat-dialog-close]=\"true\">Yes</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/dialogs/publish-dialog.html":
/*!*********************************************!*\
  !*** ./src/app/dialogs/publish-dialog.html ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<h1 mat-dialog-title>Are you sure you want to publish?</h1>\r\n<div mat-dialog-actions>\r\n  <button mat-button color=\"primary\" [mat-dialog-close]=\"false\">No</button>\r\n  <button mat-raised-button color=\"warn\" [mat-dialog-close]=\"true\">Yes</button>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/dialogs/spinner-dialog.html":
/*!*********************************************!*\
  !*** ./src/app/dialogs/spinner-dialog.html ***!
  \*********************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<mat-progress-spinner color=\"accent\" mode=\"indeterminate\"></mat-progress-spinner>\r\n"

/***/ }),

/***/ "./src/app/event-page/event-page.component.css":
/*!*****************************************************!*\
  !*** ./src/app/event-page/event-page.component.css ***!
  \*****************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2V2ZW50LXBhZ2UvZXZlbnQtcGFnZS5jb21wb25lbnQuY3NzIn0= */"

/***/ }),

/***/ "./src/app/event-page/event-page.component.html":
/*!******************************************************!*\
  !*** ./src/app/event-page/event-page.component.html ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"event-page\">\r\n  <form class=\"ct-form\" style=\"margin-top:20px\">\r\n    <h2 class=\"mat-h2\" style=\"padding:5px 30px\">Community Time Events</h2>\r\n    <mat-table #table [dataSource]=\"ctDataSource\">\r\n      <ng-container matColumnDef=\"date\">\r\n        <mat-header-cell *matHeaderCellDef> Date </mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <input matInput [matDatepicker]=\"picker\" [value]=\"getDateFromString(element.date)\" (dateChange)=\"onDateChange(element, $event, true)\">\r\n            <mat-datepicker-toggle matSuffix [for]=\"picker\"></mat-datepicker-toggle>\r\n            <mat-datepicker #picker></mat-datepicker>\r\n          </mat-form-field>\r\n        </mat-cell>\r\n      </ng-container>\r\n      <ng-container matColumnDef=\"event\">\r\n        <mat-header-cell *matHeaderCellDef>Event</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <input matInput type=\"text\" [(ngModel)]=\"element.event\" (change)=\"onValueChange(element, $event, true)\" [ngModelOptions]=\"{standalone: true}\">\r\n          </mat-form-field>\r\n          <button type=\"button\" (click)=\"removeItem(element, true)\" mat-icon-button *ngIf=\"!element.temp\">\r\n            <mat-icon>close</mat-icon>\r\n          </button>\r\n          <button type=\"button\" (click)=\"addItem(element, true)\" mat-icon-button *ngIf=\"element.temp\">\r\n            <mat-icon>add</mat-icon>\r\n          </button>\r\n        </mat-cell>\r\n      </ng-container>\r\n\r\n      <mat-header-row *matHeaderRowDef=\"columns\"></mat-header-row>\r\n      <mat-row *matRowDef=\"let row; columns: columns;\"></mat-row>\r\n    </mat-table>\r\n  </form>\r\n  <form class=\"cp-form\" style=\"margin-top:40px\">\r\n    <h2 class=\"mat-h2\" style=\"padding:5px 30px\">Conference Period Events</h2>\r\n    <mat-table #table [dataSource]=\"cpDataSource\">\r\n      <ng-container matColumnDef=\"date\">\r\n        <mat-header-cell *matHeaderCellDef> Date </mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <input matInput [matDatepicker]=\"picker\" [value]=\"getDateFromString(element.date)\" (dateChange)=\"onDateChange(element, $event, false)\">\r\n            <mat-datepicker-toggle matSuffix [for]=\"picker\"></mat-datepicker-toggle>\r\n            <mat-datepicker #picker></mat-datepicker>\r\n          </mat-form-field>\r\n        </mat-cell>\r\n      </ng-container>\r\n      <ng-container matColumnDef=\"event\">\r\n        <mat-header-cell *matHeaderCellDef>Event</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <input matInput type=\"text\" [(ngModel)]=\"element.event\" (change)=\"onValueChange(element, $event, false)\" [ngModelOptions]=\"{standalone: true}\">\r\n          </mat-form-field>\r\n          <button type=\"button\" (click)=\"removeItem(element, false)\" mat-icon-button *ngIf=\"!element.temp\">\r\n            <mat-icon>close</mat-icon>\r\n          </button>\r\n          <button type=\"button\" (click)=\"addItem(element, false)\" mat-icon-button *ngIf=\"element.temp\">\r\n            <mat-icon>add</mat-icon>\r\n          </button>\r\n        </mat-cell>\r\n      </ng-container>\r\n\r\n      <mat-header-row *matHeaderRowDef=\"columns\"></mat-header-row>\r\n      <mat-row *matRowDef=\"let row; columns: columns;\"></mat-row>\r\n    </mat-table>\r\n  </form>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/event-page/event-page.component.ts":
/*!****************************************************!*\
  !*** ./src/app/event-page/event-page.component.ts ***!
  \****************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var json_manager_service_1 = __webpack_require__(/*! ../json-manager.service */ "./src/app/json-manager.service.ts");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var EventPageComponent = /** @class */ (function () {
    function EventPageComponent(manager, snackBar) {
        var _this = this;
        this.manager = manager;
        this.snackBar = snackBar;
        this.columns = ["date", "event"];
        this.cpData = [];
        this.cpDataSource = new material_1.MatTableDataSource(this.cpData);
        this.ctData = [];
        this.ctDataSource = new material_1.MatTableDataSource(this.cpData);
        this.manager.addRefreshCallback(function () { return _this.update(); });
    }
    EventPageComponent.prototype.update = function () {
        this.ctData = [];
        for (var i in this.manager.json.eventsOverride.CT) {
            if (this.manager.json.eventsOverride.CT.hasOwnProperty(i)) {
                this.ctData.push({ "date": i, "event": this.manager.json.eventsOverride.CT[i] });
            }
        }
        this.ctData.push({ "date": this.manager.dateToDayString(new Date()), "event": "", "temp": true });
        this.ctDataSource = new material_1.MatTableDataSource(this.ctData);
        this.cpData = [];
        for (var i in this.manager.json.eventsOverride.CP) {
            if (this.manager.json.eventsOverride.CP.hasOwnProperty(i)) {
                this.cpData.push({ "date": i, "event": this.manager.json.eventsOverride.CP[i] });
            }
        }
        this.cpData.push({ "date": this.manager.dateToDayString(new Date()), "event": "", "temp": true });
        this.cpDataSource = new material_1.MatTableDataSource(this.cpData);
    };
    EventPageComponent.prototype.onDateChange = function (elem, event, isCT) {
        var str = this.manager.dateToDayString(event.value);
        if (elem.temp) {
            elem.date = str;
            return true;
        }
        else {
            if ((isCT && this.manager.json.eventsOverride.CT.hasOwnProperty(str)) || (!isCT && this.manager.json.eventsOverride.CP.hasOwnProperty(str))) {
                this.snackBar.open("That date already exists!", "Close", { panelClass: "snackbar-error", duration: 3000 });
                return false;
            }
            else if (elem.event == "") {
                this.snackBar.open("Please add an event name", "Close", { panelClass: "snackbar-error", duration: 3000 });
                return false;
            }
            else {
                if (isCT) {
                    delete this.manager.json.eventsOverride.CT[elem.date];
                    this.manager.json.eventsOverride.CT[str] = elem.event;
                }
                else {
                    delete this.manager.json.eventsOverride.CP[elem.date];
                    this.manager.json.eventsOverride.CP[str] = elem.event;
                }
                this.manager.change();
                this.update();
                return true;
            }
        }
    };
    EventPageComponent.prototype.getDateFromString = function (str) {
        if (!this.manager.checkDate(str))
            return new Date();
        return new Date(str.substring(0, 4), parseInt(str.substring(4, 6)) - 1, str.substring(6, 8));
    };
    EventPageComponent.prototype.onValueChange = function (elem, event, isCT) {
        if (elem.temp)
            return;
        if (isCT)
            this.manager.json.eventsOverride.CT[elem.date] = event.value;
        else
            this.manager.json.eventsOverride.CP[elem.date] = event.value;
        this.manager.change();
    };
    EventPageComponent.prototype.removeItem = function (item, isCT) {
        if (isCT)
            delete this.manager.json.eventsOverride.CT[item.date];
        else
            delete this.manager.json.eventsOverride.CP[item.date];
        this.manager.change();
        this.update();
    };
    EventPageComponent.prototype.addItem = function (item, isCT) {
        if ((isCT && this.manager.json.eventsOverride.CT.hasOwnProperty(item.date)) || (!isCT && this.manager.json.eventsOverride.CP.hasOwnProperty(item.date))) {
            this.snackBar.open("This date already exists", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
        else if (this.manager.checkDate(item.date) && item.event != "") {
            if (isCT)
                this.manager.json.eventsOverride.CT[item.date] = item.event;
            else
                this.manager.json.eventsOverride.CP[item.date] = item.event;
            this.update();
            this.manager.change();
        }
        else {
            this.snackBar.open("Please add an event name", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
    };
    EventPageComponent = __decorate([
        core_1.Component({
            selector: 'app-event-page',
            template: __webpack_require__(/*! ./event-page.component.html */ "./src/app/event-page/event-page.component.html"),
            encapsulation: core_1.ViewEncapsulation.None,
            styles: [__webpack_require__(/*! ./event-page.component.css */ "./src/app/event-page/event-page.component.css")]
        }),
        __metadata("design:paramtypes", [json_manager_service_1.JsonManagerService, material_1.MatSnackBar])
    ], EventPageComponent);
    return EventPageComponent;
}());
exports.EventPageComponent = EventPageComponent;


/***/ }),

/***/ "./src/app/json-manager.service.ts":
/*!*****************************************!*\
  !*** ./src/app/json-manager.service.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var http_1 = __webpack_require__(/*! @angular/common/http */ "./node_modules/@angular/common/fesm5/http.js");
var JsonManagerService = /** @class */ (function () {
    function JsonManagerService(http) {
        this.http = http;
        this.json = {};
        this.scheduleTypes = [];
        this.athletics = [];
        this.changed = false;
        this.apiKey = "";
        this.refreshing = 2;
        this.refreshCallbacks = [];
        this.apiKey = localStorage.getItem("apiKey") || "";
    }
    JsonManagerService.prototype.isValidKey = function (key, callback) {
        if (key == "")
            return callback(false);
        this.http.get("/testPermission?permission=admin&api_key=" + key, { responseType: 'text' }).subscribe(function (res) { return callback(true); }, function (res) { return callback(false); });
    };
    JsonManagerService.prototype.hasValidKey = function (callback) {
        this.isValidKey(this.apiKey, callback);
    };
    JsonManagerService.prototype.addRefreshCallback = function (callback) {
        this.refreshCallbacks.push(callback);
        if (!this.isRefreshing()) {
            callback();
        }
    };
    JsonManagerService.prototype.saveKey = function () {
        localStorage.setItem("apiKey", this.apiKey);
    };
    JsonManagerService.prototype.dateToDayString = function (d) {
        return "" + d.getFullYear() + (d.getMonth() + 1 < 10 ? "0" : "") + (d.getMonth() + 1) + (d.getDate() < 10 ? "0" : "") + d.getDate();
    };
    JsonManagerService.prototype.change = function () {
        this.changed = true;
    };
    JsonManagerService.prototype.checkDoneRefreshing = function () {
        if (this.isRefreshing())
            return false;
        for (var i = 0; i < this.refreshCallbacks.length; i++) {
            this.refreshCallbacks[i]();
        }
    };
    JsonManagerService.prototype.isRefreshing = function () {
        return this.refreshing > 0;
    };
    JsonManagerService.prototype.refresh = function () {
        var _this = this;
        this.refreshing = 3;
        this.http.get("/v1/override?api_key=" + this.apiKey).subscribe(function (res) {
            _this.json = res;
            _this.refreshing--;
            _this.checkDoneRefreshing();
        }, function (err) { if (err.status == 401) {
            _this.apiKey = "";
            _this.saveKey();
        } });
        this.http.get("/v1/schedule/types?api_key=" + this.apiKey).subscribe(function (res) {
            _this.scheduleTypes = res;
            _this.refreshing--;
            _this.checkDoneRefreshing();
        }, function (err) { if (err.status == 401) {
            _this.apiKey = "";
            _this.saveKey();
        } });
        this.http.get("/v1/athletics/calendarList?api_key=" + this.apiKey).subscribe(function (res) {
            _this.athletics = res;
            _this.refreshing--;
            _this.checkDoneRefreshing();
        });
        this.changed = false;
    };
    JsonManagerService.prototype.checkDate = function (date) {
        if (parseInt(date) != NaN && ("" + parseInt(date)).length == 8) {
            if (date.substring(0, 2) == "20" || date.substring(0, 2) == "21") {
                var month = parseInt(date.substring(4, 6));
                if (month > 0 && month <= 12) {
                    var d;
                    try {
                        d = new Date(date.substring(0, 4), month - 1, date.substring(6, 8));
                    }
                    catch (e) {
                        return false;
                    }
                    return true;
                }
            }
        }
        return false;
    };
    JsonManagerService.prototype.saveJson = function (callback) {
        var _this = this;
        var saving = 2;
        var afterUpdate = function (res) {
            if (res) {
                saving--;
            }
            if (saving == 0) {
                _this.http.get("/v1/forceRefresh?api_key=" + _this.apiKey, { responseType: "text" }).subscribe(function (res) {
                    callback(res);
                    _this.refresh();
                });
            }
        };
        console.log(JSON.stringify(this.athletics));
        if (this.athletics[this.athletics.length - 1].hasOwnProperty("temp")) {
            this.athletics.pop();
        }
        this.http.post("/v1/updateOverride?api_key=" + this.apiKey, { newJSON: JSON.stringify(this.json) }, { responseType: "text" }).subscribe(function (res) { return afterUpdate(true); }, function (res) { return afterUpdate(false); });
        this.http.post("/v1/updateAthletics?api_key=" + this.apiKey, { newJSON: JSON.stringify(this.athletics) }, { responseType: "text" }).subscribe(function (res) { return afterUpdate(true); }, function (res) { return afterUpdate(false); });
    };
    JsonManagerService = __decorate([
        core_1.Injectable(),
        __metadata("design:paramtypes", [http_1.HttpClient])
    ], JsonManagerService);
    return JsonManagerService;
}());
exports.JsonManagerService = JsonManagerService;


/***/ }),

/***/ "./src/app/letter-page/letter-page.component.css":
/*!*******************************************************!*\
  !*** ./src/app/letter-page/letter-page.component.css ***!
  \*******************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL2xldHRlci1wYWdlL2xldHRlci1wYWdlLmNvbXBvbmVudC5jc3MifQ== */"

/***/ }),

/***/ "./src/app/letter-page/letter-page.component.html":
/*!********************************************************!*\
  !*** ./src/app/letter-page/letter-page.component.html ***!
  \********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"letter-page\">\r\n  <form class=\"letter-form\">\r\n    <mat-table #table [dataSource]=\"dataSource\">\r\n      <ng-container matColumnDef=\"date\">\r\n        <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <input matInput [matDatepicker]=\"picker\" [value]=\"getDateFromString(element.date)\" (dateChange)=\"onDateChange(element, $event)\">\r\n            <mat-datepicker-toggle matSuffix [for]=\"picker\"></mat-datepicker-toggle>\r\n            <mat-datepicker #picker></mat-datepicker>\r\n          </mat-form-field>\r\n        </mat-cell>\r\n      </ng-container>\r\n      <ng-container matColumnDef=\"letter\">\r\n        <mat-header-cell *matHeaderCellDef>Letter</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <mat-select [(value)]=\"element.letter\" (change)=\"onValueChange(element)\">\r\n              <mat-option *ngFor=\"let option of letterOptions\" [value]=\"option.value\">{{option.title}}</mat-option>\r\n            </mat-select>\r\n          </mat-form-field>\r\n          <button type=\"button\" (click)=\"removeItem(element)\" mat-icon-button *ngIf=\"!element.temp\">\r\n            <mat-icon>close</mat-icon>\r\n          </button>\r\n          <button type=\"button\" (click)=\"addItem(element)\" mat-icon-button *ngIf=\"element.temp\">\r\n            <mat-icon>add</mat-icon>\r\n          </button>\r\n        </mat-cell>\r\n      </ng-container>\r\n\r\n      <mat-header-row *matHeaderRowDef=\"columns\"></mat-header-row>\r\n      <mat-row *matRowDef=\"let row; columns: columns;\"></mat-row>\r\n    </mat-table>\r\n  </form>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/letter-page/letter-page.component.ts":
/*!******************************************************!*\
  !*** ./src/app/letter-page/letter-page.component.ts ***!
  \******************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var json_manager_service_1 = __webpack_require__(/*! ../json-manager.service */ "./src/app/json-manager.service.ts");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var LetterPageComponent = /** @class */ (function () {
    function LetterPageComponent(manager, snackBar) {
        var _this = this;
        this.manager = manager;
        this.snackBar = snackBar;
        this.columns = ["date", "letter"];
        this.data = [];
        this.dataSource = new material_1.MatTableDataSource(this.data);
        this.letterOptions = [
            { value: "A", title: "A" },
            { value: "B", title: "B" },
            { value: "C", title: "C" },
            { value: "D", title: "D" },
            { value: "E", title: "E" },
            { value: "F", title: "F" },
            { value: "G", title: "G" },
            { value: "R", title: "Review Day" }
        ];
        this.manager.addRefreshCallback(function () { return _this.update(); });
    }
    LetterPageComponent.prototype.update = function () {
        this.data = [];
        for (var i in this.manager.json.letterOverride) {
            if (this.manager.json.letterOverride.hasOwnProperty(i)) {
                this.data.push({ "date": i, "letter": this.manager.json.letterOverride[i] });
            }
        }
        this.data.push({ "date": this.manager.dateToDayString(new Date()), "letter": "", "temp": true });
        this.dataSource = new material_1.MatTableDataSource(this.data);
        console.log(this.data);
    };
    LetterPageComponent.prototype.onDateChange = function (elem, event) {
        var str = this.manager.dateToDayString(event.value);
        if (elem.temp) {
            elem.date = str;
            return true;
        }
        else {
            if (this.manager.json.letterOverride.hasOwnProperty(str)) {
                this.snackBar.open("That date already exists!", "Close", { panelClass: "snackbar-error", duration: 3000 });
                return false;
            }
            else {
                delete this.manager.json.letterOverride[elem.date];
                this.manager.json.letterOverride[str] = elem.letter;
                this.manager.change();
                this.update();
                return true;
            }
        }
    };
    LetterPageComponent.prototype.getDateFromString = function (str) {
        if (!this.manager.checkDate(str))
            return new Date();
        return new Date(str.substring(0, 4), parseInt(str.substring(4, 6)) - 1, str.substring(6, 8));
    };
    LetterPageComponent.prototype.onValueChange = function (elem) {
        console.log(elem);
        if (elem.temp)
            return;
        this.manager.json.letterOverride[elem.date] = elem.letter;
        this.manager.change();
    };
    LetterPageComponent.prototype.removeItem = function (item) {
        delete this.manager.json.letterOverride[item.date];
        this.manager.change();
        this.update();
    };
    LetterPageComponent.prototype.addItem = function (item) {
        if (this.manager.json.letterOverride.hasOwnProperty(item.date)) {
            this.snackBar.open("This date already exists", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
        else if (this.manager.checkDate(item.date) && item.letter != "") {
            this.manager.json.letterOverride[item.date] = item.letter;
            this.update();
            this.manager.change();
        }
        else {
            this.snackBar.open("Invalid options", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
    };
    LetterPageComponent.prototype.ngOnInit = function () { };
    LetterPageComponent = __decorate([
        core_1.Component({
            selector: 'app-letter-page',
            template: __webpack_require__(/*! ./letter-page.component.html */ "./src/app/letter-page/letter-page.component.html"),
            encapsulation: core_1.ViewEncapsulation.None,
            styles: [__webpack_require__(/*! ./letter-page.component.css */ "./src/app/letter-page/letter-page.component.css")]
        }),
        __metadata("design:paramtypes", [json_manager_service_1.JsonManagerService, material_1.MatSnackBar])
    ], LetterPageComponent);
    return LetterPageComponent;
}());
exports.LetterPageComponent = LetterPageComponent;


/***/ }),

/***/ "./src/app/schedule-page/schedule-page.component.css":
/*!***********************************************************!*\
  !*** ./src/app/schedule-page/schedule-page.component.css ***!
  \***********************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "\n/*# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IiIsImZpbGUiOiJzcmMvYXBwL3NjaGVkdWxlLXBhZ2Uvc2NoZWR1bGUtcGFnZS5jb21wb25lbnQuY3NzIn0= */"

/***/ }),

/***/ "./src/app/schedule-page/schedule-page.component.html":
/*!************************************************************!*\
  !*** ./src/app/schedule-page/schedule-page.component.html ***!
  \************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

module.exports = "<div class=\"schedule-page\">\r\n  <form class=\"schedule-form\">\r\n    <mat-table #table [dataSource]=\"dataSource\">\r\n      <ng-container matColumnDef=\"date\">\r\n        <mat-header-cell *matHeaderCellDef>Date</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <input matInput [matDatepicker]=\"picker\" [value]=\"getDateFromString(element.date)\" (dateChange)=\"onDateChange(element, $event)\">\r\n            <mat-datepicker-toggle matSuffix [for]=\"picker\"></mat-datepicker-toggle>\r\n            <mat-datepicker #picker></mat-datepicker>\r\n          </mat-form-field>\r\n        </mat-cell>\r\n      </ng-container>\r\n      <ng-container matColumnDef=\"type\">\r\n        <mat-header-cell *matHeaderCellDef>Type</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\">\r\n          <mat-form-field>\r\n            <mat-select [(ngModel)]=\"element.type\" [ngModelOptions]=\"{standalone: true}\">\r\n              <mat-option value=\"automatic\">Automatic</mat-option>\r\n              <mat-option value=\"manual\">Manual</mat-option>\r\n            </mat-select>\r\n          </mat-form-field>\r\n        </mat-cell>\r\n      </ng-container>\r\n      <ng-container matColumnDef=\"value\">\r\n        <mat-header-cell *matHeaderCellDef style=\"flex: 2;\">Value</mat-header-cell>\r\n        <mat-cell *matCellDef=\"let element\" style=\"flex: 2;\">\r\n          <mat-form-field *ngIf=\"element.type == 'automatic'\">\r\n            <mat-select  [(ngModel)]=\"element.name\" [ngModelOptions]=\"{standalone: true}\" (change)=\"onValueChange(element, $event)\">\r\n              <mat-option *ngFor=\"let option of scheduleOptions\" [value]=\"option\">{{option}}</mat-option>\r\n            </mat-select>\r\n          </mat-form-field>\r\n          <mat-form-field *ngIf=\"element.type == 'manual'\" style=\"width: calc(100% - 50px)\">\r\n            <textarea matInput [(ngModel)]=\"element.classes\" [ngModelOptions]=\"{standalone: true}\" (change)=\"onValueChange(element, $event)\"></textarea>\r\n          </mat-form-field>\r\n          <button type=\"button\" (click)=\"removeItem(element)\" style=\"float:right\" mat-icon-button *ngIf=\"!element.temp\">\r\n            <mat-icon>close</mat-icon>\r\n          </button>\r\n          <button type=\"button\" (click)=\"addItem(element)\" style=\"float:right\" mat-icon-button *ngIf=\"element.temp\">\r\n            <mat-icon>add</mat-icon>\r\n          </button>\r\n        </mat-cell>\r\n      </ng-container>\r\n\r\n      <mat-header-row *matHeaderRowDef=\"columns\"></mat-header-row>\r\n      <mat-row *matRowDef=\"let row; columns: columns;\"></mat-row>\r\n    </mat-table>\r\n  </form>\r\n</div>\r\n"

/***/ }),

/***/ "./src/app/schedule-page/schedule-page.component.ts":
/*!**********************************************************!*\
  !*** ./src/app/schedule-page/schedule-page.component.ts ***!
  \**********************************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var json_manager_service_1 = __webpack_require__(/*! ../json-manager.service */ "./src/app/json-manager.service.ts");
var material_1 = __webpack_require__(/*! @angular/material */ "./node_modules/@angular/material/esm5/material.es5.js");
var SchedulePageComponent = /** @class */ (function () {
    function SchedulePageComponent(manager, snackBar) {
        var _this = this;
        this.manager = manager;
        this.snackBar = snackBar;
        this.data = [];
        this.scheduleOptions = [];
        this.dataSource = new material_1.MatTableDataSource(this.data);
        this.columns = ["date", "type", "value"];
        this.manager.addRefreshCallback(function () { return _this.update(); });
    }
    SchedulePageComponent.prototype.update = function () {
        this.data = [];
        for (var i in this.manager.scheduleTypes) {
            this.scheduleOptions.push(this.manager.scheduleTypes[i].name);
        }
        for (var i in this.manager.json.scheduleOverride) {
            if (this.manager.json.scheduleOverride.hasOwnProperty(i)) {
                var obj = JSON.parse(JSON.stringify(this.manager.json.scheduleOverride[i]));
                obj.date = i;
                if (obj.classes) {
                    obj.classes = JSON.stringify(obj.classes);
                }
                this.data.push(obj);
            }
        }
        this.data.push({ date: this.manager.dateToDayString(new Date()), type: '', temp: true });
        console.log(this.data);
        this.dataSource = new material_1.MatTableDataSource(this.data);
    };
    SchedulePageComponent.prototype.onDateChange = function (elem, event) {
        var str = this.manager.dateToDayString(event.value);
        if (elem.temp) {
            elem.date = str;
        }
        else {
            if (this.manager.json.scheduleOverride.hasOwnProperty(str)) {
                this.snackBar.open("That date already exists!", "Close", { panelClass: "snackbar-error", duration: 3000 });
            }
            else if (elem.type == "automatic") {
                if (elem.name != "") {
                    delete this.manager.json.scheduleOverride[elem.date];
                    this.manager.json.scheduleOverride[str] = { type: elem.type, name: elem.name };
                    this.update();
                    this.manager.change();
                }
            }
            else if (elem.type == "manual") {
                try {
                    var classes = JSON.parse(elem.classes);
                    delete this.manager.json.scheduleOverride[elem.date];
                    this.manager.json.scheduleOverride[str] = { type: elem.type, classes: classes };
                    this.update();
                    this.manager.change();
                }
                catch (e) {
                    console.log("JSON parsing error: ", e);
                    this.snackBar.open("Invalid custom schedule JSON", "Close", { panelClass: "snackbar-error", duration: 3000 });
                }
            }
            else {
                this.snackBar.open("Invalid type", "Close", { panelClass: "snackbar-error", duration: 3000 });
            }
        }
    };
    SchedulePageComponent.prototype.getDateFromString = function (str) {
        if (!this.manager.checkDate(str))
            return new Date();
        return new Date(str.substring(0, 4), parseInt(str.substring(4, 6)) - 1, str.substring(6, 8));
    };
    SchedulePageComponent.prototype.onValueChange = function (elem) {
        if (!elem.temp) {
            if (elem.type == "automatic") {
                if (elem.name != "") {
                    this.manager.json.scheduleOverride[elem.date] = { type: elem.type, name: elem.name };
                    this.update();
                    this.manager.change();
                    return true;
                }
                else {
                    this.snackBar.open("Please add a name", "Close", { panelClass: "snackbar-error", duration: 3000 });
                    return false;
                }
            }
            else if (elem.type == "manual") {
                try {
                    var classes = JSON.parse(elem.classes);
                    this.manager.json.scheduleOverride[elem.date] = { type: elem.type, classes: classes };
                    this.update();
                    this.manager.change();
                    return true;
                }
                catch (e) {
                    console.log("JSON parsing error: ", e);
                    this.snackBar.open("Invalid custom schedule JSON", "Close", { panelClass: "snackbar-error", duration: 3000 });
                    return false;
                }
            }
            else {
                this.snackBar.open("Invalid type", "Close", { panelClass: "snackbar-error", duration: 3000 });
                return false;
            }
        }
        this.snackBar.open("Error adding", "Close", { panelClass: "snackbar-error", duration: 3000 });
        return false;
    };
    SchedulePageComponent.prototype.removeItem = function (item) {
        delete this.manager.json.scheduleOverride[item.date];
        this.manager.change();
        this.update();
    };
    SchedulePageComponent.prototype.addItem = function (item) {
        if (this.manager.json.scheduleOverride.hasOwnProperty(item.date)) {
            this.snackBar.open("This date already exists", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
        else if (this.manager.checkDate(item.date) && item.type != "") {
            if (item.type == "automatic") {
                if (item.name != "") {
                    this.manager.json.scheduleOverride[item.date] = { type: item.type, name: item.name };
                    this.update();
                    this.manager.change();
                }
                else {
                    this.snackBar.open("Choose ", "Close", { panelClass: "snackbar-error", duration: 3000 });
                }
            }
            else if (item.type == "manual") {
                try {
                    var classes = JSON.parse(item.classes);
                    this.manager.json.scheduleOverride[item.date] = { type: item.type, classes: classes };
                    this.update();
                    this.manager.change();
                }
                catch (e) {
                    console.log("JSON parsing error: ", e);
                    this.snackBar.open("Invalid custom schedule JSON", "Close", { panelClass: "snackbar-error", duration: 3000 });
                }
            }
            else {
                this.snackBar.open("Please enter a schedule type", "Close", { panelClass: "snackbar-error", duration: 3000 });
            }
        }
        else {
            this.snackBar.open("Invalid type", "Close", { panelClass: "snackbar-error", duration: 3000 });
        }
    };
    SchedulePageComponent = __decorate([
        core_1.Component({
            selector: 'app-schedule-page',
            template: __webpack_require__(/*! ./schedule-page.component.html */ "./src/app/schedule-page/schedule-page.component.html"),
            encapsulation: core_1.ViewEncapsulation.None,
            styles: [__webpack_require__(/*! ./schedule-page.component.css */ "./src/app/schedule-page/schedule-page.component.css")]
        }),
        __metadata("design:paramtypes", [json_manager_service_1.JsonManagerService, material_1.MatSnackBar])
    ], SchedulePageComponent);
    return SchedulePageComponent;
}());
exports.SchedulePageComponent = SchedulePageComponent;


/***/ }),

/***/ "./src/environments/environment.ts":
/*!*****************************************!*\
  !*** ./src/environments/environment.ts ***!
  \*****************************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.
Object.defineProperty(exports, "__esModule", { value: true });
exports.environment = {
    production: false
};


/***/ }),

/***/ "./src/main.ts":
/*!*********************!*\
  !*** ./src/main.ts ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

"use strict";

Object.defineProperty(exports, "__esModule", { value: true });
var core_1 = __webpack_require__(/*! @angular/core */ "./node_modules/@angular/core/fesm5/core.js");
var platform_browser_dynamic_1 = __webpack_require__(/*! @angular/platform-browser-dynamic */ "./node_modules/@angular/platform-browser-dynamic/fesm5/platform-browser-dynamic.js");
var app_module_1 = __webpack_require__(/*! ./app/app.module */ "./src/app/app.module.ts");
var environment_1 = __webpack_require__(/*! ./environments/environment */ "./src/environments/environment.ts");
__webpack_require__(/*! hammerjs */ "./node_modules/hammerjs/hammer.js");
if (environment_1.environment.production) {
    core_1.enableProdMode();
}
platform_browser_dynamic_1.platformBrowserDynamic().bootstrapModule(app_module_1.AppModule)
    .catch(function (err) { return console.log(err); });


/***/ }),

/***/ 0:
/*!***************************!*\
  !*** multi ./src/main.ts ***!
  \***************************/
/*! no static exports found */
/***/ (function(module, exports, __webpack_require__) {

module.exports = __webpack_require__(/*! C:\Users\arstr\CSP\PAPI\configInterface\src\main.ts */"./src/main.ts");


/***/ })

},[[0,"runtime","vendor"]]]);
//# sourceMappingURL=main.js.map