import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RetrieveExportComponent } from './retrieve-export.component';

describe('RetrieveExportComponent', () => {
  let component: RetrieveExportComponent;
  let fixture: ComponentFixture<RetrieveExportComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RetrieveExportComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RetrieveExportComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
