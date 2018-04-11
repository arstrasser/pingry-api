import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AthleticsPageComponent } from './athletics-page.component';

describe('OutputPageComponent', () => {
  let component: AthleticsPageComponent;
  let fixture: ComponentFixture<AthleticsPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AthleticsPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AthleticsPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
