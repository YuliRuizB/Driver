import { TestBed } from '@angular/core/testing';

import { OpenpayService } from './openpay.service';

describe('OpenpayService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenpayService = TestBed.get(OpenpayService);
    expect(service).toBeTruthy();
  });
});
