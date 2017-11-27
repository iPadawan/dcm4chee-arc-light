import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { PieTimerComponent } from './pie-timer.component';

describe('PieTimerComponent', () => {
  let component: PieTimerComponent;
  let fixture: ComponentFixture<PieTimerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ PieTimerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(PieTimerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
