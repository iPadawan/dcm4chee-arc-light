import { TestBed, inject } from '@angular/core/testing';

import { RetrieveExportService } from './retrieve-export.service';

describe('RetrieveExportService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [RetrieveExportService]
    });
  });

  it('should ...', inject([RetrieveExportService], (service: RetrieveExportService) => {
    expect(service).toBeTruthy();
  }));
});
