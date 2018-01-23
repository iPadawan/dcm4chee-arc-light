import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HardwareDashboardComponent } from './hardware-dashboard.component';

describe('HardwareDashboardComponent', () => {
  let component: HardwareDashboardComponent;
  let fixture: ComponentFixture<HardwareDashboardComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HardwareDashboardComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HardwareDashboardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
