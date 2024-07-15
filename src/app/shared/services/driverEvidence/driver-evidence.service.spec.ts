import { TestBed } from '@angular/core/testing';

import { DriverEvidenceService } from './driver-evidence.service';

describe('DriverEvidenceService', () => {
  let service: DriverEvidenceService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(DriverEvidenceService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
