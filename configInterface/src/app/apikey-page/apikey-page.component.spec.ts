import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ApikeyPageComponent } from './apikey-page.component';

describe('OutputPageComponent', () => {
  let component: ApikeyPageComponent;
  let fixture: ComponentFixture<ApikeyPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ApikeyPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ApikeyPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
