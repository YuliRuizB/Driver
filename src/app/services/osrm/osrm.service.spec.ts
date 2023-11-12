import { TestBed } from '@angular/core/testing';

import { OsrmService } from './osrm.service';

describe('OsrmService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OsrmService = TestBed.get(OsrmService);
    expect(service).toBeTruthy();
  });
});
