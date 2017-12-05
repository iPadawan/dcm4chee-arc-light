import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrieveStateDialogComponent } from './retrieve-state-dialog.component';

describe('RetrieveStateDialogComponent', () => {
  let component: RetrieveStateDialogComponent;
  let fixture: ComponentFixture<RetrieveStateDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetrieveStateDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrieveStateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
