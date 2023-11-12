import { TestBed } from '@angular/core/testing';

import { OnemapService } from './onemap.service';

describe('OnemapService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OnemapService = TestBed.get(OnemapService);
    expect(service).toBeTruthy();
  });
});
