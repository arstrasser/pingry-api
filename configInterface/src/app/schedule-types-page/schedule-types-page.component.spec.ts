import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ScheduleTypesPageComponent } from './schedule-types-page.component';

describe('SchedulePageComponent', () => {
  let component: ScheduleTypesPageComponent;
  let fixture: ComponentFixture<ScheduleTypesPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ScheduleTypesPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ScheduleTypesPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
