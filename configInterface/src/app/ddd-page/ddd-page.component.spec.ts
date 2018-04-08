import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { DddPageComponent } from './ddd-page.component';

describe('DddPageComponent', () => {
  let component: DddPageComponent;
  let fixture: ComponentFixture<DddPageComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ DddPageComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(DddPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
